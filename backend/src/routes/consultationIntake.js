const express = require('express');
const router = express.Router();
const { query } = require('../config/db');

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
    res.json({ ok: true });
  } catch (err) {
    console.error('[consultation-intake] Error:', err.message);
    res.status(500).json({ error: 'Submission failed.' });
  }
});

module.exports = router;
