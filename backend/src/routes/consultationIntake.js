const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const https = require('https');

function alertTravis(data) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!botToken || !chatId) return;
    const name = data.name || data.selected_slot || 'Unknown';
    const type = data.type === 'schedule' ? 'SCHEDULE' : 'INTAKE';
    const slot = data.selected_slot || 'N/A';
    const goal = data.primary_goal || data.alt_time || '';
    const msg = 'NEW CONSULTATION ' + type + '\nName: ' + name + '\nSlot: ' + slot + '\nGoal: ' + goal;
    const postData = JSON.stringify({ chat_id: chatId, text: msg });
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
