const express = require('express');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── PATCH /profile - Update own profile (Genesis Gate) ──
// MUST be before /:username to avoid route shadowing
router.patch('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { age, years_lifting, trt_hrt, trt_compound, trt_dose } = req.body;

    const result = await query(
      `UPDATE users SET
        age = COALESCE($1, age),
        years_lifting = COALESCE($2, years_lifting),
        trt_hrt = COALESCE($3, trt_hrt),
        trt_compound = $4,
        trt_dose = $5,
        profile_complete = true
      WHERE id = $6
      RETURNING id, username, age, years_lifting, trt_hrt, trt_compound, trt_dose, profile_complete`,
      [age || null, years_lifting || null, trt_hrt || false, trt_compound || null, trt_dose || null, userId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[PROFILE_UPDATE]', err.message);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// GET /:username - Public user profile
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const userResult = await query(
      'SELECT id, username, tier, age, years_lifting, trt_hrt, trt_compound, trt_dose, is_founding, avatar_url, bio, created_at FROM users WHERE username = $1',
      [username]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userResult.rows[0];
    const threadsResult = await query(
      'SELECT id, title, created_at FROM threads WHERE author_id = $1 ORDER BY created_at DESC LIMIT 5',
      [user.id]
    );
    const postsResult = await query(
      'SELECT id, body, thread_id, created_at FROM posts WHERE author_id = $1 ORDER BY created_at DESC LIMIT 5',
      [user.id]
    );
    res.json({
      user: {
        username: user.username,
        tier: user.tier,
        age: user.age,
        years_lifting: user.years_lifting,
        trt_hrt: user.trt_hrt,
        trt_compound: user.trt_compound,
        trt_dose: user.trt_dose,
        is_founding: user.is_founding,
        avatar_url: user.avatar_url,
        bio: user.bio,
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
