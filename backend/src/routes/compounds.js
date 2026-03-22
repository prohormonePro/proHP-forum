const express = require('express');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/compounds – List all (with optional category filter) ──
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    let where = "WHERE is_published = true";
    const params = [];

    if (category) {
      params.push(category);
      where += ` AND category = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      where += ` AND (name ILIKE $${params.length} OR slug ILIKE $${params.length} OR summary ILIKE $${params.length})`;
    }

    const orderCol = sort === "risk" ? "risk_tier" : sort === "category" ? "category" : "name";
    const orderDir = req.query.dir === "desc" ? "DESC" : "ASC";

    const countSql = `SELECT COUNT(*) as total FROM compounds ${where}`;
    const countResult = await query(countSql, params);
    const total = parseInt(countResult.rows[0].total);

    const sql = `SELECT id, slug, name, category, risk_tier, trust_level, summary,
                        youtube_url, causes_hair_loss, hair_loss_severity, is_published
                 FROM compounds ${where}
                 ORDER BY ${orderCol} ${orderDir}
                 LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);
    res.json({
      compounds: result.rows,
      count: result.rows.length,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('[compounds/list]', err.message);
    res.status(500).json({ error: 'Failed to list compounds' });
  }
});

// ── GET /api/compounds/categories – List categories with counts ──
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

// ── GET /api/compounds/:slug – API-enforced 3-state gating ──
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const compoundResult = await query('SELECT * FROM compounds WHERE slug = $1 AND is_published = true', [slug]);
    if (!compoundResult.rows[0]) {
      return res.status(404).json({ error: 'Compound not found' });
    }
    const compound = compoundResult.rows[0];

    // Gate detection
    let gate_state = 'window';
    if (req.user && (req.user.tier === 'inner_circle' || req.user.tier === 'admin')) {
      gate_state = 'member';
    } else if (req.cookies && req.cookies.prohp_lead_access) {
      try {
        const decoded = jwt.verify(req.cookies.prohp_lead_access, process.env.JWT_SECRET);
        if (decoded && decoded.lead === true) gate_state = 'lead';
      } catch (e) { /* invalid/expired -> window */ }
    }

    const pick = (obj, keys) => {
      const out = {};
      for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
      return out;
    };

    const WINDOW_FIELDS = [
      'id','slug','name','category','risk_tier','trust_level','summary',
      'youtube_video_id','youtube_url','causes_hair_loss','hair_loss_severity',
      'company','is_published','created_at','updated_at','product_url',
      'product_image_url','public_discount_code','product_price','thread_id','half_life','dosing'
    ];
    const LEAD_FIELDS = [...WINDOW_FIELDS,'mechanism','side_effects','benefits','compounds_list','article_preview'];

    if (gate_state === 'window') {
      const result = pick(compound, WINDOW_FIELDS);
      // Safety net - prevent gated content leaks
      delete result.article_content;
      delete result.member_discount_code;
      delete result.nutrition_label_url;
      
      return res.json({
        gate_state: 'window',
        upgrade_cta: 'Unlock the full encyclopedia for free. Enter your email.',
        compound: result,
        related_threads: [],
        related_cycles: [],
      });
    }

    if (gate_state === 'lead') {
      const threadsResult = await query(
        `SELECT t.id, t.title, t.reply_count, t.created_at
         FROM threads t WHERE t.compound_id = $1 AND NOT t.is_deleted
         ORDER BY t.score DESC, t.created_at DESC LIMIT 5`,
        [compound.id]
      );
      const cycleCountResult = await query(
        `SELECT COUNT(*)::int AS count FROM cycle_logs
         WHERE compound_id = $1 AND is_public = true`,
        [compound.id]
      );
      
      const result = pick(compound, LEAD_FIELDS);
      // Safety net - prevent gated content leaks
      delete result.article_content;
      delete result.member_discount_code;
      delete result.nutrition_label_url;
      
      return res.json({
        gate_state: 'lead',
        upgrade_cta: 'You are in the Library. The Lab is next. Unlock Inner Circle for full threads, cycle logs, and community intel.',
        compound: result,
        related_threads: threadsResult.rows,
        related_cycles: cycleCountResult.rows[0] || { count: 0 },
      });
    }

    // MEMBER: full access
    const threadsResult = await query(
      `SELECT t.id, t.title, t.reply_count, t.score, t.created_at,
              u.username AS author_username, r.slug AS room_slug
       FROM threads t
       JOIN users u ON u.id = t.author_id
       JOIN rooms r ON r.id = t.room_id
       WHERE t.compound_id = $1 AND NOT t.is_deleted
       ORDER BY t.score DESC, t.created_at DESC LIMIT 10`,
      [compound.id]
    );
    const cyclesResult = await query(
      `SELECT cl.id, cl.title, cl.compound_name, cl.status, cl.duration_weeks,
              cl.update_count, cl.created_at, u.username
       FROM cycle_logs cl
       JOIN users u ON u.id = cl.user_id
       WHERE cl.compound_id = $1 AND cl.is_public = true
       ORDER BY cl.created_at DESC LIMIT 5`,
      [compound.id]
    );
    return res.json({
      gate_state: 'member',
      upgrade_cta: null,
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
