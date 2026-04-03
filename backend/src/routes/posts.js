const express = require('express');
const { query, getClient } = require('../config/db');
const { authenticate, requireTier, TIER_LEVELS } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/posts — Create a reply ──
router.post('/', authenticate, async (req, res) => {
  try {
    const { thread_id, body, parent_id } = req.body;

    if (!thread_id || !body) {
      return res.status(400).json({ error: 'thread_id and body are required' });
    }

    // Check thread exists, not locked, and user has write access to room
    const threadResult = await query(
      `SELECT t.id, t.is_locked, r.write_tier
       FROM threads t JOIN rooms r ON r.id = t.room_id
       WHERE t.id = $1 AND NOT t.is_deleted`,
      [thread_id]
    );

    if (!threadResult.rows[0]) {
      return res.status(404).json({ error: 'Thread not found' });
    }

    const thread = threadResult.rows[0];
    if (thread.is_locked) {
      return res.status(403).json({ error: 'Thread is locked' });
    }

    const userLevel = TIER_LEVELS[req.user.tier] ?? 0;
    if (userLevel < (TIER_LEVELS[thread.write_tier] ?? 0)) {
      return res.status(403).json({ error: 'Tier required to post', code: 'TIER_REQUIRED', required_tier: thread.write_tier });
    }

    // Validate parent_id if provided
    if (parent_id) {
      const parentResult = await query('SELECT id FROM posts WHERE id = $1 AND thread_id = $2', [parent_id, thread_id]);
      if (!parentResult.rows[0]) {
        return res.status(400).json({ error: 'Parent post not found in this thread' });
      }
    }

    const result = await query(
      `INSERT INTO posts (thread_id, author_id, parent_id, body)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [thread_id, req.user.id, parent_id || null, body.trim()]
    );


    // Parse @mentions and create notifications
    try {
      const mentions = (body.trim().match(/@(\w+)/g) || []).map(m => m.slice(1));
      if (mentions.length > 0) {
        const mentionedUsers = await query(
          'SELECT id, username FROM users WHERE username = ANY($1)',
          [mentions]
        );
        for (const mu of mentionedUsers.rows) {
          if (mu.id !== req.user.id) {
            await query(
              'INSERT INTO notifications (user_id, type, source_user_id, post_id, thread_id, message) VALUES ($1, $2, $3, $4, $5, $6)',
              [mu.id, 'mention', req.user.id, result.rows[0].id, thread_id, req.user.username + ' mentioned you']
            );
          }
        }
      }
    } catch (mentionErr) { console.error('[mention]', mentionErr.message); }
    res.status(201).json({ post: result.rows[0] });
  } catch (err) {
    console.error('[posts/create]', err.message);
    res.status(500).json({ error: 'Failed to create reply' });
  }
});

// ── POST /api/posts/:id/vote — Vote on post ──
router.post('/:id/vote', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (value !== 1 && value !== -1) {
      return res.status(400).json({ error: 'Vote value must be 1 or -1' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const existing = await client.query(
        'SELECT id, value FROM votes WHERE user_id = $1 AND target_type = $2 AND target_id = $3',
        [req.user.id, 'post', id]
      );

      if (existing.rows[0]) {
        await client.query('COMMIT');
        const current = await query('SELECT upvotes, downvotes, score FROM posts WHERE id = $1', [id]);
        return res.json(current.rows[0]);
      } else {
        await client.query(
          'INSERT INTO votes (user_id, target_type, target_id, value) VALUES ($1, $2, $3, $4)',
          [req.user.id, 'post', id, value]
        );
        const col = value === 1 ? 'upvotes' : 'downvotes';
        await client.query(`UPDATE posts SET ${col} = ${col} + 1 WHERE id = $1`, [id]);
      }

      await client.query('COMMIT');
      const updated = await query('SELECT upvotes, downvotes, score FROM posts WHERE id = $1', [id]);
      res.json(updated.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[posts/vote]', err.message);
    res.status(500).json({ error: 'Vote failed' });
  }
});

// ── POST /api/posts/:id/best-answer — Mark as best answer (thread author only) ──
router.post('/:id/best-answer', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the post and its thread
    const postResult = await query(
      `SELECT p.id, p.thread_id, t.author_id AS thread_author_id
       FROM posts p JOIN threads t ON t.id = p.thread_id
       WHERE p.id = $1`,
      [id]
    );

    if (!postResult.rows[0]) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    // Only thread author or admin can mark best answer
    if (post.thread_author_id !== req.user.id && req.user.tier !== 'admin') {
      return res.status(403).json({ error: 'Only the thread author can mark best answers' });
    }

    // Toggle: if already best answer, unmark. Otherwise mark and clear others.
    const current = await query('SELECT is_best_answer FROM posts WHERE id = $1', [id]);
    const wasMarked = current.rows[0] && current.rows[0].is_best_answer;

    if (wasMarked) {
      await query('UPDATE posts SET is_best_answer = false WHERE id = $1', [id]);
    } else {
      await query('UPDATE posts SET is_best_answer = false WHERE thread_id = $1 AND is_best_answer = true', [post.thread_id]);
      await query('UPDATE posts SET is_best_answer = true WHERE id = $1', [id]);
    }

    res.json({ ok: true, post_id: id, is_best_answer: !wasMarked });
  } catch (err) {
    console.error('[posts/best-answer]', err.message);
    res.status(500).json({ error: 'Failed to mark best answer' });
  }
});

// PATCH /api/posts/:id - Edit post (author only)
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req.body;
    if (!body || !body.trim()) return res.status(400).json({ error: 'Body is required' });
    const existing = await query('SELECT id, author_id, edit_count FROM posts WHERE id = $1', [id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Post not found' });
    if (existing.rows[0].author_id !== req.user.id) return res.status(403).json({ error: 'You can only edit your own posts' });
    const result = await query(
      'UPDATE posts SET body = $1, edit_count = edit_count + 1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [body.trim(), id]
    );
    res.json({ post: result.rows[0] });
  } catch (err) {
    console.error('[posts/edit]', err.message);
    res.status(500).json({ error: 'Failed to edit post' });
  }
});

// DELETE /api/posts/:id - Soft delete (author or admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await query('SELECT id, author_id FROM posts WHERE id = $1', [id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'Post not found' });
    const isAdmin = req.user.tier === 'admin';
    if (existing.rows[0].author_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await query('UPDATE posts SET body = $1, is_deleted = true, updated_at = NOW() WHERE id = $2', ['[deleted]', id]);
    res.json({ success: true });
  } catch (err) {
    console.error('[posts/delete]', err.message);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /api/posts/:id/report - Report a post
router.post('/:id/report', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason || !reason.trim()) return res.status(400).json({ error: 'Reason is required' });
    const existing = await query('SELECT id FROM reports WHERE reporter_id = $1 AND post_id = $2', [req.user.id, id]);
    if (existing.rows[0]) return res.status(400).json({ error: 'Already reported' });
    await query('INSERT INTO reports (reporter_id, post_id, reason) VALUES ($1, $2, $3)', [req.user.id, id, reason.trim()]);
    res.json({ success: true });
  } catch (err) {
    console.error('[posts/report]', err.message);
    res.status(500).json({ error: 'Failed to report' });
  }
});

module.exports = router;






