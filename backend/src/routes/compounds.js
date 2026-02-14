const express = require('express');
const { query } = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/compounds — List all (with optional category filter) ──
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT id, slug, name, category, risk_tier, trust_level, summary,
                      youtube_url, causes_hair_loss, hair_loss_severity, is_published
               FROM compounds WHERE is_published = true`;
    const params = [];

    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (name ILIKE $${params.length} OR slug ILIKE $${params.length} OR summary ILIKE $${params.length})`;
    }

    sql += ' ORDER BY name ASC';

    const result = await query(sql, params);
    res.json({ compounds: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('[compounds/list]', err.message);
    res.status(500).json({ error: 'Failed to list compounds' });
  }
});

// ── GET /api/compounds/categories — List categories with counts ──
router.get('/categories', async (req, res) => {
  try {
    const result = await query(
      `SELECT category, count(*)::int AS count
       FROM compounds WHERE is_published = true
       GROUP BY category ORDER BY count DESC`
    );
    res.json({ categories: result.rows });
  } catch (err) {
    console.error('[compounds/categories]', err.message);
    res.status(500).json({ error: 'Failed to list categories' });
  }
});

// ── GET /api/compounds/:slug — Compound detail with related threads ──
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const compoundResult = await query('SELECT * FROM compounds WHERE slug = $1 AND is_published = true', [slug]);
    if (!compoundResult.rows[0]) {
      return res.status(404).json({ error: 'Compound not found' });
    }

    const compound = compoundResult.rows[0];

    // Related threads
    const threadsResult = await query(
      `SELECT t.id, t.title, t.reply_count, t.score, t.created_at,
              u.username AS author_username, r.slug AS room_slug
       FROM threads t
       JOIN users u ON u.id = t.author_id
       JOIN rooms r ON r.id = t.room_id
       WHERE t.compound_id = $1 AND NOT t.is_deleted
       ORDER BY t.score DESC, t.created_at DESC
       LIMIT 10`,
      [compound.id]
    );

    // Related cycle logs
    const cyclesResult = await query(
      `SELECT cl.id, cl.title, cl.compound_name, cl.status, cl.duration_weeks,
              cl.update_count, cl.created_at, u.username
       FROM cycle_logs cl
       JOIN users u ON u.id = cl.user_id
       WHERE cl.compound_id = $1 AND cl.is_public = true
       ORDER BY cl.created_at DESC
       LIMIT 5`,
      [compound.id]
    );

    res.json({
      compound,
      related_threads: threadsResult.rows,
      related_cycles: cyclesResult.rows,
    });
  } catch (err) {
    console.error('[compounds/detail]', err.message);
    res.status(500).json({ error: 'Failed to fetch compound' });
  }
});

module.exports = router;
