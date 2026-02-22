const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

// Get user profile by username
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

    // Get recent threads by user (limit 5)
    const threadsResult = await query(`
      SELECT id, title, created_at, 'thread' as type
      FROM threads 
      WHERE author_id = $1 
      ORDER BY created_at DESC 
      LIMIT 5
    `, [user.id]);

    // Get recent posts by user (limit 5)
    const postsResult = await query(`
      SELECT p.id, p.content, p.created_at, t.title as thread_title, t.id as thread_id, 'post' as type
      FROM posts p
      JOIN threads t ON p.thread_id = t.id
      WHERE p.author_id = $1 
      ORDER BY p.created_at DESC 
      LIMIT 5
    `, [user.id]);

    // Combine and sort recent activity
    const recentActivity = [
      ...threadsResult.rows,
      ...postsResult.rows
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        tier: user.tier,
        created_at: user.created_at
      },
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;