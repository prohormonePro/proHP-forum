const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
  if (req.body['bot-field']) {
    return res.status(200).json({ success: true });
  }

  const { first_name, last_name, email, source, utm_source, utm_medium, utm_campaign } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'Missing required fields: first_name, last_name, email.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  try {
    await query(
      `INSERT INTO leads (first_name, last_name, email, source, utm_source, utm_medium, utm_campaign)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING;`,
      [
        first_name.trim(),
        last_name.trim(),
        email.trim(),
        source || null,
        utm_source || null,
        utm_medium || null,
        utm_campaign || null
      ]
    );
  } catch (err) {
    console.error('[LEADS_INSERT_ERROR]', err);
    return res.status(500).json({ error: 'Database insertion error.' });
  }

  const token = jwt.sign({ lead: true }, process.env.JWT_SECRET, { expiresIn: '30d' });

  res.cookie('prohp_lead_access', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  return res.json({ success: true });
});

router.get('/check', (req, res) => {
  const token = req.cookies?.prohp_lead_access;
  if (!token) {
    return res.json({ hasLeadAccess: false });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ hasLeadAccess: true });
  } catch (err) {
    return res.json({ hasLeadAccess: false });
  }
});

module.exports = router;
