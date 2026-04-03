const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET /api/notifications - Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT n.*, u.username as source_username
       FROM notifications n
       LEFT JOIN users u ON u.id = n.source_user_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json({ notifications: result.rows });
  } catch (err) {
    console.error('[notifications/list]', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications/read - Mark all as read
router.post('/read', authenticate, async (req, res) => {
  try {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

module.exports = router;
