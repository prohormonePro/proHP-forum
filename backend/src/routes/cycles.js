const express = require('express');
const { query, getClient } = require('../config/db');
const { authenticate, requireTier, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/cycles – List public cycle logs ──
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, compound, featured } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    let sql = `SELECT cl.id, cl.title, cl.compound_name, cl.dose, cl.duration_weeks,
                      cl.status, cl.rating, cl.would_run_again, cl.start_date, cl.follower_count, cl.update_count,
                      cl.is_featured, cl.created_at,
                      u.username, u.display_name, u.tier AS user_tier, u.is_founding,
             (SELECT count(*)::int FROM posts p2 WHERE p2.thread_id = cl.thread_id) as comment_count
       
      comp.product_image_url AS compound_image, comp.company AS compound_company,
      FROM cycle_logs cl
      LEFT JOIN compounds comp ON (comp.id = cl.compound_id OR (cl.compound_id IS NULL AND comp.slug = LOWER(REPLACE(REPLACE(cl.compound_name, ' ', '-'), 'Hi-Tech ', ''))))
               JOIN users u ON u.id = cl.user_id
               WHERE cl.is_public = true`;
    const params = [];

    if (status) { params.push(status); sql += ` AND cl.status, cl.rating, cl.would_run_again = $${params.length}`; }
    if (featured === 'true') { sql += ' AND cl.is_featured = true'; }
    if (compound) { params.push(`%${compound}%`); sql += ` AND cl.compound_name ILIKE $${params.length}`; }

    sql += ` ORDER BY cl.is_featured DESC, cl.updated_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json({ cycles: result.rows });
  } catch (err) {
    console.error('[cycles/list]', err.message);
    res.status(500).json({ error: 'Failed to list cycles' });
  }
});

// ── POST /api/cycles – Create cycle log (inner_circle+) ──
router.post('/', authenticate, requireTier('inner_circle'), async (req, res) => {
  const client = await getClient();
  
  try {
    const { title, description, compound_slug, compound_name, dose, duration_weeks, start_date } = req.body;

    if (!title || !compound_name) {
      return res.status(400).json({ error: 'title and compound_name are required' });
    }

    // Optionally link to compound
    let compoundId = null;
    if (compound_slug) {
      const cr = await client.query('SELECT id FROM compounds WHERE slug = $1', [compound_slug]);
      compoundId = cr.rows[0]?.id || null;
    }

    await client.query('BEGIN');

    // Create thread first
    const threadResult = await client.query(
      `INSERT INTO threads (room_id, author_id, compound_id, title, body)
       VALUES ('ab2ff4da-2b34-4a3c-a9fc-5de2b25c9823', $1, $2, $3, $4)
       RETURNING id`,
      [req.user.id, compoundId, title.trim(), description || 'Cycle Log Discussion']
    );
    const threadId = threadResult.rows[0].id;

    // Create cycle log with thread_id
    const cycleResult = await client.query(
      `INSERT INTO cycle_logs (user_id, compound_id, title, description, compound_name, dose, duration_weeks, start_date, thread_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, compoundId, title.trim(), description || '', compound_name, dose || null, duration_weeks || null, start_date || null, threadId]
    );

    await client.query('COMMIT');
    
    res.status(201).json({ cycle: cycleResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[cycles/create]', err.message);
    res.status(500).json({ error: 'Failed to create cycle log' });
  } finally {
    client.release();
  }
});

// ── GET /api/cycles/:id – Cycle detail with updates ──
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const cycleResult = await query(
      `SELECT cl.*, u.username, u.display_name, u.tier AS user_tier, u.avatar_url, u.is_founding, u.age, u.years_lifting, u.trt_hrt, u.trt_compound, u.trt_dose
       FROM cycle_logs cl JOIN users u ON u.id = cl.user_id
       WHERE cl.id = $1 AND (cl.is_public = true OR cl.user_id = $2)`,
      [id, req.user?.id || '00000000-0000-0000-0000-000000000000']
    );

    if (!cycleResult.rows[0]) {
      return res.status(404).json({ error: 'Cycle log not found' });
    }

    const updates = await query(
      'SELECT * FROM cycle_updates WHERE cycle_log_id = $1 ORDER BY week_number ASC',
      [id]
    );

    res.json({ cycle: cycleResult.rows[0], updates: updates.rows });
  } catch (err) {
    console.error('[cycles/detail]', err.message);
    res.status(500).json({ error: 'Failed to fetch cycle' });
  }
});

// ── POST /api/cycles/:id/updates – Add weekly update ──
router.post('/:id/updates', authenticate, requireTier('inner_circle'), async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const cycle = await query('SELECT id, user_id FROM cycle_logs WHERE id = $1', [id]);
    if (!cycle.rows[0] || cycle.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own cycle logs' });
    }

    const { week_number, weight_lbs, body_fat_pct, strength_notes, side_effects, side_effect_severity, mood_notes, general_notes } = req.body;

    if (!week_number || week_number < 1) {
      return res.status(400).json({ error: 'week_number is required (1+)' });
    }

    const result = await query(
      `INSERT INTO cycle_updates (cycle_log_id, user_id, week_number, weight_lbs, body_fat_pct,
       strength_notes, side_effects, side_effect_severity, mood_notes, general_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [id, req.user.id, week_number, weight_lbs || null, body_fat_pct || null,
       strength_notes || '', side_effects || '', side_effect_severity || null,
       mood_notes || '', general_notes || '']
    );

    res.status(201).json({ update: result.rows[0] });
  } catch (err) {
    console.error('[cycles/update]', err.message);
    res.status(500).json({ error: 'Failed to add update' });
  }
});

// PATCH /api/cycles/:id - Update cycle log (owner only, inner_circle+)
router.patch('/:id', authenticate, requireTier('inner_circle'), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT id, user_id FROM cycle_logs WHERE id = $1', [id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Cycle log not found' });
    if (existing.rows[0].user_id !== req.user.id) return res.status(403).json({ error: 'You can only edit your own cycle logs' });

    const sets = [];
    const params = [];
    let idx = 1;

    if (req.body.rating !== undefined) {
      const r = parseInt(req.body.rating, 10);
      if (isNaN(r) || r < 1 || r > 10) return res.status(400).json({ error: 'rating must be 1-10' });
      sets.push('rating = $' + idx++);
      params.push(r);
    }
    if (req.body.would_run_again !== undefined) {
      sets.push('would_run_again = $' + idx++);
      params.push(Boolean(req.body.would_run_again));
    }
    if (req.body.status !== undefined) {
      if (!['active', 'completed', 'abandoned'].includes(req.body.status)) return res.status(400).json({ error: 'status must be active, completed, or abandoned' });
      sets.push('status = $' + idx++);
      params.push(req.body.status);
    }
    if (sets.length === 0) return res.status(400).json({ error: 'No valid fields to update' });

    sets.push('updated_at = NOW()');
    params.push(id);
    const sql = 'UPDATE cycle_logs SET ' + sets.join(', ') + ' WHERE id = $' + idx + ' RETURNING *';
    const result = await query(sql, params);
    res.json({ cycle: result.rows[0] });
  } catch (err) {
    console.error('[cycles/patch]', err.message);
    res.status(500).json({ error: 'Failed to update cycle log' });
  }
});

module.exports = router;
