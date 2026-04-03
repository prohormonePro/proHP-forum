const express = require('express');
const { query, getClient } = require('../config/db');
const { authenticate, optionalAuth, requireTier, TIER_LEVELS } = require('../middleware/auth');

const router = express.Router();

// ── GET /api/threads/:id — Thread detail with paginated posts ──
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 25));
    const offset = (page - 1) * limit;

    const threadResult = await query(
      `SELECT t.*,
              u.username AS author_username, u.display_name AS author_display_name,
              u.tier AS author_tier, u.avatar_url AS author_avatar,
              u.is_founding AS author_founding,
              r.slug AS room_slug, r.name AS room_name, r.read_tier, r.write_tier,
              c.name AS compound_name, c.slug AS compound_slug
       FROM threads t
       JOIN users u ON u.id = t.author_id
       JOIN rooms r ON r.id = t.room_id
       LEFT JOIN compounds c ON c.id = t.compound_id
       WHERE t.id = $1 AND NOT t.is_deleted`,
      [id]
    );

    if (!threadResult.rows[0]) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const thread = threadResult.rows[0];

    // Check read access
    const userLevel = TIER_LEVELS[req.user?.tier || 'free'] ?? 0;
    if (userLevel < (TIER_LEVELS[thread.read_tier] ?? 0)) {
      return res.status(403).json({ error: 'Tier required', code: 'TIER_REQUIRED', required_tier: thread.read_tier });
    }

    // Increment view count (fire and forget)
    query('UPDATE threads SET view_count = view_count + 1 WHERE id = $1', [id]).catch(() => {});

    // Fetch posts
    const postsResult = await query(
      `SELECT p.id, p.body, p.parent_id, p.is_best_answer, p.is_helpful, p.edit_count, p.is_deleted, p.image_url, p.author_id, p.edit_count, p.is_deleted, p.image_url, p.author_id,
              p.upvotes, p.downvotes, p.score, p.created_at, p.updated_at,
              u.id AS author_id, u.username AS author_username,
              u.display_name AS author_display_name, u.tier AS author_tier,
              u.avatar_url AS author_avatar, u.is_founding AS author_founding
       FROM posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.thread_id = $1 AND NOT p.is_deleted
       ORDER BY CASE WHEN p.parent_id IS NULL THEN 0 ELSE 1 END, CASE WHEN p.parent_id IS NULL THEN p.score ELSE 0 END DESC, p.created_at ASC
       LIMIT $2 OFFSET $3`,
      [id, limit, offset]
    );

    const countResult = await query(
      'SELECT count(*)::int AS total FROM posts WHERE thread_id = $1 AND NOT is_deleted',
      [id]
    );

    // Check if user has voted on this thread
    let userVote = null;
    if (req.user) {
      const voteResult = await query(
        'SELECT value FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
        [req.user.id, 'thread', id]
      );
      userVote = voteResult.rows[0]?.value || null;
    }

    res.json({
      thread: { ...thread, user_vote: userVote },
      posts: postsResult.rows,
      pagination: {
        page, limit,
        total: countResult.rows[0]?.total || 0,
        pages: Math.ceil((countResult.rows[0]?.total || 0) / limit),
      },
    });
  } catch (err) {
    console.error('[threads/detail]', err.message);
    res.status(500).json({ error: 'Failed to fetch thread' });
  }
});

// ── POST /api/threads — Create thread ──
router.post('/', authenticate, async (req, res) => {
  try {
    const { room_slug, title, body, compound_slug } = req.body;

    if (!room_slug || !title || !body) {
      return res.status(400).json({ error: 'room_slug, title, and body are required' });
    }

    // Fetch room + check write access
    const roomResult = await query('SELECT * FROM rooms WHERE slug = $1', [room_slug]);
    if (!roomResult.rows[0]) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = roomResult.rows[0];
    const userLevel = TIER_LEVELS[req.user.tier] ?? 0;
    if (userLevel < (TIER_LEVELS[room.write_tier] ?? 0)) {
      return res.status(403).json({
        error: `Posting in ${room.name} requires ${room.write_tier} tier`,
        code: 'TIER_REQUIRED',
        required_tier: room.write_tier,
      });
    }

    // Optional compound link
    let compoundId = null;
    if (compound_slug) {
      const compoundResult = await query('SELECT id FROM compounds WHERE slug = $1', [compound_slug]);
      compoundId = compoundResult.rows[0]?.id || null;
    }

    const result = await query(
      `INSERT INTO threads (room_id, author_id, compound_id, title, body)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [room.id, req.user.id, compoundId, title.trim(), body.trim()]
    );

    res.status(201).json({ thread: result.rows[0] });
  } catch (err) {
    console.error('[threads/create]', err.message);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// ── POST /api/threads/:id/vote — Vote on thread ──
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body; // 1 or -1

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Check existing vote
      const existing = await client.query(
        'SELECT id, value FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
        [req.user.id, 'thread', id]
      );

      if (existing.rows[0]) {
        const old = existing.rows[0];
        if (old.value === value) {
          // Remove vote (toggle off)
          await client.query('DELETE FROM votes WHERE id = $1', [old.id]);
          const col = value === 1 ? 'upvotes' : 'downvotes';
          await client.query(`UPDATE threads SET ${col} = GREATEST(0, ${col} - 1) WHERE id = $1`, [id]);
        } else {
          // Flip vote
          await client.query('UPDATE votes SET value = $1 WHERE id = $2', [value, old.id]);
          if (value === 1) {
            await client.query('UPDATE threads SET upvotes = upvotes + 1, downvotes = GREATEST(0, downvotes - 1) WHERE id = $1', [id]);
          } else {
            await client.query('UPDATE threads SET downvotes = downvotes + 1, upvotes = GREATEST(0, upvotes - 1) WHERE id = $1', [id]);
          }
        }
      } else {
        // New vote
        await client.query(
          'INSERT INTO votes (user_id, target_type, target_id, value) VALUES ($1, $2, $3, $4)',
          [req.user.id, 'thread', id, value]
        );
        const col = value === 1 ? 'upvotes' : 'downvotes';
        await client.query(`UPDATE threads SET ${col} = ${col} + 1 WHERE id = $1`, [id]);
      }

      await client.query('COMMIT');

      // Return updated counts
      const updated = await query('SELECT upvotes, downvotes, score FROM threads WHERE id = $1', [id]);
      res.json(updated.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[threads/vote]', err.message);
    res.status(500).json({ error: 'Vote failed' });
  }
});

// ── GET /api/threads/search?q=... — Full-text search ──
router.get('/search/query', optionalAuth, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    // Build tsquery from user input
    const tsquery = q.split(/\s+/).filter(w => w.length > 1).map(w => w + ':*').join(' & ');

    const result = await query(
      `SELECT t.id, t.title, t.reply_count, t.score, t.created_at,
              ts_rank(t.search_vector, to_tsquery('english', $1)) AS rank,
              u.username AS author_username,
              r.slug AS room_slug, r.name AS room_name
       FROM threads t
       JOIN users u ON u.id = t.author_id
       JOIN rooms r ON r.id = t.room_id
       WHERE t.search_vector @@ to_tsquery('english', $1)
         AND NOT t.is_deleted
       ORDER BY rank DESC, t.score DESC
       LIMIT $2 OFFSET $3`,
      [tsquery, limit, offset]
    );

    res.json({
      query: q,
      results: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('[threads/search]', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
