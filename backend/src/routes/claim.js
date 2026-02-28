const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/', async (req, res) => {
  const { session_id, username, password } = req.body;

  if (!session_id || !username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (username.length < 3 || username.length > 20 || !/^[A-Za-z0-9_]+$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username format' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.status !== 'complete') {
      return res.status(400).json({ error: 'Payment session not completed' });
    }

    let email = session.customer_details?.email;
    if (!email && session.customer) {
      const customer = await stripe.customers.retrieve(session.customer);
      email = customer.email;
    }

    if (!email) {
      return res.status(400).json({ error: 'No email attached to this payment' });
    }

    // Check for existing users
    const existingEmail = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) return res.status(409).json({ error: 'Account already exists. Please log in.' });

    const existingUsername = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUsername.rows.length > 0) return res.status(409).json({ error: 'Username is already taken.' });

    // Check leads table for prefill data
    let firstName = null, lastName = null;
    const leadRes = await pool.query('SELECT first_name, last_name FROM leads WHERE email = $1', [email]);
    if (leadRes.rows.length > 0) {
      firstName = leadRes.rows[0].first_name;
      lastName = leadRes.rows[0].last_name;
      await pool.query('UPDATE leads SET converted_at = NOW() WHERE email = $1', [email]);
    }

    // Hash password & Create User
    const passwordHash = await bcrypt.hash(password, 12);
    
    const userResult = await pool.query(
      `INSERT INTO users (email, username, password_hash, tier, stripe_customer_id, stripe_subscription_id, subscription_status, first_name, last_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       RETURNING id, username, email, tier, first_name, last_name`,
      [email, username, passwordHash, 'inner_circle', session.customer, session.subscription || null, 'active', firstName, lastName]
    );

    const user = userResult.rows[0];

    // Issue Tokens (Matching auth.js exactly)
    const accessToken = jwt.sign(
      { userId: user.id, tier: user.tier },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
      [user.id, tokenHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
    );

    res.json({
      user: { id: user.id, username: user.username, email: user.email, tier: user.tier },
      access_token: accessToken,
      refresh_token: refreshToken
    });

  } catch (error) {
    console.error('Claim account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
