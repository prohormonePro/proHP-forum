const express = require('express');
const router = express.Router();

let cache = { data: null, ts: 0 };
const CACHE_TTL = 3600000; // 1 hour

router.get('/stats', async (req, res) => {
  try {
    if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
      return res.json(cache.data);
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID || 'UCay0A4e31Av26rn0zDMqK-w';

    if (!apiKey) {
      return res.json({ viewCount: null, subscriberCount: null, videoCount: null, live: false });
    }

    const url = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`;
    const resp = await fetch(url);
    const json = await resp.json();

    const stats = json?.items?.[0]?.statistics;
    if (!stats) {
      return res.json({ viewCount: null, subscriberCount: null, videoCount: null, live: false });
    }

    const payload = {
      viewCount: stats.viewCount,
      subscriberCount: stats.subscriberCount,
      videoCount: stats.videoCount,
      live: true,
    };

    cache = { data: payload, ts: Date.now() };
    res.json(payload);
  } catch (err) {
    console.error('[youtube/stats] Error:', err.message);
    res.json({ viewCount: null, subscriberCount: null, videoCount: null, live: false });
  }
});

module.exports = router;
