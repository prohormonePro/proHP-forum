const express = require('express');
const { query } = require('../config/db');
const { optionalAuth, authenticate, requireTier, TIER_LEVELS } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/rooms — List all rooms (filtered by user tier) ──
router.get('/', optionalAuth, async (req, res) => {
  try {
    const userTier = req.user?.tier || 'free';
    const userLevel = TIER_LEVELS[userTier] ?? 0;

    const result = await query(
      `SELECT r.id, r.slug, r.name, r.description, r.icon, r.read_tier, r.write_tier,
              r.thread_count, r.post_count, r.last_post_at, r.sort_order,
              lt.title AS last_thread_title,
              lt.author_username AS last_thread_author,
              lt.created_at AS last_thread_at
       FROM rooms r
       LEFT JOIN LATERAL (
         SELECT t.title, u.username AS author_username, t.created_at
         FROM threads t
         JOIN users u ON u.id = t.author_id
         WHERE t.room_id = r.id AND NOT t.is_deleted
         ORDER BY t.created_at DESC
         LIMIT 1
       ) lt ON true
       WHERE NOT r.is_archived
       ORDER BY r.sort_order ASC`
    );

    // Mark accessibility for each room
    const rooms = result.rows.map((room) => ({
      ...room,
      can_read: userLevel >= (TIER_LEVELS[room.read_tier] ?? 0),
      can_write: userLevel >= (TIER_LEVELS[room.write_tier] ?? 0),
      is_locked: userLevel < (TIER_LEVELS[room.read_tier] ?? 0),
    }));

    res.json({ rooms });
  } catch (err) {
    console.error('[rooms/list]', err.message);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

// ── GET /api/rooms/:slug — Room detail with paginated threads ──
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;

    // Fetch room
    const roomResult = await query('SELECT * FROM rooms WHERE slug = $1 AND NOT is_archived', [slug]);
    if (!roomResult.rows[0]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];
    const userTier = req.user?.tier || 'free';
    const userLevel = TIER_LEVELS[userTier] ?? 0;

    // Check read access
    if (userLevel < (TIER_LEVELS[room.read_tier] ?? 0)) {
      return res.status(403).json({
        error: `This room requires ${room.read_tier} tier or above`,
        code: 'TIER_REQUIRED',
        required_tier: room.read_tier,
      });
    }

    // Fetch threads (pinned first, then by last activity)
    const threadsResult = await query(
      `SELECT t.id, t.title, t.is_pinned, t.is_locked, t.upvotes, t.downvotes, t.score,
              t.reply_count, t.view_count, t.created_at, t.last_reply_at,
              u.username AS author_username, u.display_name AS author_display_name,
              u.tier AS author_tier, u.is_founding AS author_founding,
              c.name AS compound_name, c.slug AS compound_slug
       FROM threads t
       JOIN users u ON u.id = t.author_id
       LEFT JOIN compounds c ON c.id = t.compound_id
       WHERE t.room_id = $1 AND NOT t.is_deleted
       ORDER BY t.is_pinned DESC, COALESCE(t.last_reply_at, t.created_at) DESC
       LIMIT $2 OFFSET $3`,
      [room.id, limit, offset]
    );

    // Total count for pagination
    const countResult = await query(
      'SELECT count(*)::int AS total FROM threads WHERE room_id = $1 AND NOT is_deleted',
      [room.id]
    );

    res.json({
      room: {
        ...room,
        can_write: userLevel >= (TIER_LEVELS[room.write_tier] ?? 0),
      },
      threads: threadsResult.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0]?.total || 0,
        pages: Math.ceil((countResult.rows[0]?.total || 0) / limit),
      },
    });
  } catch (err) {
    console.error('[rooms/detail]', err.message);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

module.exports = router;
