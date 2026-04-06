const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ── Helpers ──
const generateAccessToken = (user) =>
  jwt.sign(
    { sub: user.id, tier: user.tier },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );

const generateRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(48).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, hash, expiresAt]
  );

  return raw;
};

const FOUNDING_MEMBER_CAP = 1000;

// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
  try {
    const { email, username, password, display_name } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores' });
    }

    // Check uniqueness
    const existing = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2 LIMIT 1',
      [email.toLowerCase(), username.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email or username already taken' });
    }

    // Check founding member status
    const userCount = await query('SELECT count(*)::int AS count FROM users');
    const isFounding = (userCount.rows[0]?.count || 0) < FOUNDING_MEMBER_CAP;

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO users (email, username, password_hash, display_name, is_founding)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, username, display_name, tier, is_founding, age, years_lifting, trt_hrt, trt_compound, trt_dose, profile_complete, avatar_url, created_at`,
      [email.toLowerCase(), username.toLowerCase(), passwordHash, display_name || username, isFounding]
    );

    const user = result.rows[0];
    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        tier: user.tier,
        is_founding: user.is_founding,
        profile_complete: user.profile_complete || false,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (err) {
    console.error('[auth/register]', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      'SELECT id, email, username, display_name, password_hash, tier, is_founding, is_banned, age, years_lifting, trt_hrt, trt_compound, trt_dose, profile_complete, avatar_url FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    if (user.is_banned) {
      return res.status(403).json({ error: 'Account suspended' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last login
    await query('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);

    const accessToken = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.display_name,
        tier: user.tier,
        is_founding: user.is_founding,
        profile_complete: user.profile_complete || false,
        age: user.age,
        years_lifting: user.years_lifting,
        trt_hrt: user.trt_hrt,
        trt_compound: user.trt_compound,
        trt_dose: user.trt_dose,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (err) {
    console.error('[auth/login]', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ── POST /api/auth/refresh ──
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const hash = crypto.createHash('sha256').update(refresh_token).digest('hex');
    const result = await query(
      `SELECT rt.*, u.id AS user_id, u.email, u.username, u.display_name, u.tier, u.is_founding, u.is_banned
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
      [hash]
    );

    if (!result.rows[0]) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    const row = result.rows[0];
    if (row.is_banned) {
      return res.status(403).json({ error: 'Account suspended' });
    }

    // Revoke old refresh token (rotation)
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [hash]);

    // Issue new tokens
    const user = { id: row.user_id, email: row.email, username: row.username, display_name: row.display_name, tier: row.tier, is_founding: row.is_founding };
    const accessToken = generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user.id);

    res.json({
      user,
      access_token: accessToken,
      refresh_token: newRefreshToken,
    });
  } catch (err) {
    console.error('[auth/refresh]', err.message);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// ── POST /api/auth/logout ──
router.post('/logout', authenticate, async (req, res) => {
  try {
    // Revoke all refresh tokens for this user
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL', [req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('[auth/logout]', err.message);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// ── GET /api/auth/me ──
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, email, username, display_name, bio, avatar_url, tier,
              stripe_sub_status, reputation, is_founding, is_verified,
              age, years_lifting, trt_hrt, trt_compound, trt_dose, profile_complete,
              created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('[auth/me]', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;
