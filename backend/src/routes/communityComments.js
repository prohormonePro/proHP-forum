
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/community-comments
// Query params: compound, side_effect, search, sort, limit, offset
router.get('/', async (req, res) => {
  try {
    const { compound, side_effect, search, sort, limit, offset } = req.query;
    const params = [];
    const conditions = [];
    let paramIdx = 1;

    if (compound) {
      conditions.push(`compound_name ILIKE $${paramIdx}`);
      params.push(`%${compound}%`);
      paramIdx++;
    }

    if (side_effect) {
      conditions.push(`$${paramIdx} = ANY(side_effects)`);
      params.push(side_effect.toLowerCase());
      paramIdx++;
    }

    if (search) {
      conditions.push(`to_tsvector('english', content) @@ plainto_tsquery('english', $${paramIdx})`);
      params.push(search);
      paramIdx++;
    }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const orderBy = sort === 'likes' ? 'ORDER BY likes DESC' :
                    sort === 'newest' ? 'ORDER BY published_at DESC' :
                    sort === 'oldest' ? 'ORDER BY published_at ASC' :
                    'ORDER BY likes DESC';
    const lim = Math.min(parseInt(limit) || 50, 200);
    const off = parseInt(offset) || 0;

    const countQuery = `SELECT COUNT(*) FROM yt_comments ${where}`;
    const dataQuery = `SELECT yt_comment_id, video_id, video_title, author_name, content,
      likes, published_at, compound_name, side_effects,
      mentions_dosage, mentions_cycle, mentions_bloodwork, mentions_stack
      FROM yt_comments ${where} ${orderBy} LIMIT ${lim} OFFSET ${off}`;

    const [countResult, dataResult] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(dataQuery, params)
    ]);

    res.json({
      total: parseInt(countResult.rows[0].count),
      limit: lim,
      offset: off,
      comments: dataResult.rows
    });
  } catch (err) {
    console.error('Community comments error:', err.message);
    res.status(500).json({ error: 'Failed to fetch community comments' });
  }
});

// GET /api/community-comments/stats
router.get('/stats', async (req, res) => {
  try {
    const { compound } = req.query;
    let where = '';
    const params = [];
    if (compound) {
      where = 'WHERE compound_name ILIKE $1';
      params.push(`%${compound}%`);
    }

    const total = await pool.query(`SELECT COUNT(*) FROM yt_comments ${where}`, params);
    const withSE = await pool.query(`SELECT COUNT(*) FROM yt_comments ${where ? where + ' AND' : 'WHERE'} array_length(side_effects, 1) > 0`, params);
    const withDosage = await pool.query(`SELECT COUNT(*) FROM yt_comments ${where ? where + ' AND' : 'WHERE'} mentions_dosage = true`, params);
    const withCycle = await pool.query(`SELECT COUNT(*) FROM yt_comments ${where ? where + ' AND' : 'WHERE'} mentions_cycle = true`, params);
    const withBlood = await pool.query(`SELECT COUNT(*) FROM yt_comments ${where ? where + ' AND' : 'WHERE'} mentions_bloodwork = true`, params);

    // Top side effects
    const topSE = await pool.query(`
      SELECT unnest(side_effects) as effect, COUNT(*) as count
      FROM yt_comments ${where}
      GROUP BY effect ORDER BY count DESC LIMIT 10
    `, params);

    res.json({
      total: parseInt(total.rows[0].count),
      with_side_effects: parseInt(withSE.rows[0].count),
      with_dosage: parseInt(withDosage.rows[0].count),
      with_cycle: parseInt(withCycle.rows[0].count),
      with_bloodwork: parseInt(withBlood.rows[0].count),
      top_side_effects: topSE.rows
    });
  } catch (err) {
    console.error('Community stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/community-comments/compounds
router.get('/compounds', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT compound_name, COUNT(*) as comment_count
      FROM yt_comments
      WHERE compound_name IS NOT NULL
      GROUP BY compound_name
      ORDER BY comment_count DESC
    `);
    res.json({ compounds: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compound list' });
  }
});

module.exports = router;
