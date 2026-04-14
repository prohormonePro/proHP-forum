const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const https = require('https');

function alertTravis(data) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return;

    let msg = '';
    if (data.type === 'schedule') {
      const slotMap = {'wed-12':'Wednesday 12-1pm CST','thu-12':'Thursday 12-1pm CST','fri-12':'Friday 12-1pm CST','sat-14':'Saturday 2-4pm CST'};
      const slot = slotMap[data.selected_slot] || data.selected_slot || 'CUSTOM';
      const alt = data.alt_time || '';
      const user = data.username || 'anonymous';
      msg = 'CONSULTATION BOOKED\n'
        + 'Slot: ' + slot + '\n'
        + (alt ? 'Preferred time: ' + alt + '\n' : '')
        + 'User: ' + user;
    } else {
      msg = 'NEW CONSULTATION INTAKE\n'
        + '━━━━━━━━━━━━━━━━━━━━\n'
        + 'Name: ' + (data.name || '?') + '\n'
        + 'Email: ' + (data.email || 'not provided') + '\n'
        + 'Phone: ' + (data.phone || 'not provided') + '\n'
        + 'Age: ' + (data.age || '?') + '\n'
        + 'Height/Weight/BF: ' + (data.height || '?') + ' / ' + (data.weight || '?') + ' / ' + (data.bodyfat || '?') + '\n'
        + '━━━━━━━━━━━━━━━━━━━━\n'
        + 'Training: ' + (data.training_history || 'not provided') + '\n'
        + 'Diet: ' + (data.diet || 'not provided') + '\n'
        + 'Current Supps: ' + (data.current_supplements || 'none listed') + '\n'
        + 'Prior Compounds: ' + (data.prior_compounds || 'none listed') + '\n'
        + 'TRT: ' + (data.trt_status || '?') + '\n'
        + 'Bloodwork: ' + (data.bloodwork || 'not provided') + '\n'
        + '━━━━━━━━━━━━━━━━━━━━\n'
        + 'Goal: ' + (data.primary_goal || '?') + '\n'
        + 'Compounds to discuss: ' + (data.compounds_to_discuss || 'not specified') + '\n'
        + 'Health conditions: ' + (data.health_conditions || 'none reported') + '\n'
        + '━━━━━━━━━━━━━━━━━━━━\n'
        + 'THE ONE QUESTION:\n' + (data.the_one_question || 'not provided') + '\n'
        + '━━━━━━━━━━━━━━━━━━━━\n'
        + 'E3592DC3';
    }

    const postData = JSON.stringify({ chat_id: chatId, text: msg, parse_mode: 'HTML' });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: '/bot' + botToken + '/sendMessage',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
    });
    req.on('error', () => {});
    req.write(postData);
    req.end();
  } catch (e) {
    console.error('[consultation-intake] telegram alert failed:', e.message);
  }
}

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ error: 'Invalid payload.' });
    }
    await query(
      'CREATE TABLE IF NOT EXISTS consultation_intakes (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), data JSONB NOT NULL, submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW())'
    );
    await query(
      'INSERT INTO consultation_intakes (data) VALUES ($1)',
      [JSON.stringify(data)]
    );
    alertTravis(data);
    res.json({ ok: true });
  } catch (err) {
    console.error('[consultation-intake] Error:', err.message);
    res.status(500).json({ error: 'Submission failed.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Auth required' });
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult = await query('SELECT tier FROM users WHERE id = $1', [decoded.id]);
    if (!userResult.rows[0] || userResult.rows[0].tier !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }
    const result = await query(
      'SELECT id, data, submitted_at FROM consultation_intakes ORDER BY submitted_at DESC LIMIT 50'
    );
    res.json({ intakes: result.rows });
  } catch (err) {
    console.error('[consultation-intake] GET error:', err.message);
    res.status(500).json({ error: 'Failed to fetch intakes.' });
  }
});

module.exports = router;
