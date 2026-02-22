const express = require('express');
const { query } = require('../config/db');

const router = express.Router();

// GET /:username - Public user profile
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;

    // Get user basic info
    const userResult = await query(
      'SELECT id, username, tier, created_at FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    // Get recent threads
    const threadsResult = await query(
      'SELECT id, title, created_at FROM threads WHERE author_id = $1 ORDER BY created_at DESC LIMIT 5',
      [user.id]
    );

    // Get recent posts
    const postsResult = await query(
      'SELECT id, body, thread_id, created_at FROM posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT 5',
      [user.id]
    );

    res.json({
      user: {
        username: user.username,
        tier: user.tier,
        created_at: user.created_at
      },
      recentActivity: {
        threads: threadsResult.rows,
        posts: postsResult.rows
      }
    });

  } catch (error) {
    console.error('[USER_PROFILE_ERROR]', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;