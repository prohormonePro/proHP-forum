const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/youtube/comments/search?q=term&limit=20&offset=0
router.get('/comments/search', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0, compound } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ comments: [], total: 0 });
    }

    const safeLimit = Math.min(parseInt(limit) || 20, 50);
    const safeOffset = parseInt(offset) || 0;

    let whereClause = "to_tsvector('english', comment_text) @@ plainto_tsquery('english', $1)";
    const params = [q.trim()];
    let paramIdx = 2;

    if (compound) {
      whereClause += ` AND compound_slug = $${paramIdx}`;
      params.push(compound);
      paramIdx++;
    }

    const countResult = await query(
      `SELECT count(*) FROM youtube_comments WHERE ${whereClause}`,
      params
    );

    params.push(safeLimit, safeOffset);
    const result = await query(
      `SELECT id, video_id, author_name, comment_text, like_count, published_at, compound_slug,
              ts_rank(to_tsvector('english', comment_text), plainto_tsquery('english', $1)) AS relevance
       FROM youtube_comments
       WHERE ${whereClause}
       ORDER BY relevance DESC, like_count DESC
       LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
      params
    );

    res.json({
      comments: result.rows,
      total: parseInt(countResult.rows[0].count),
      query: q.trim(),
      limit: safeLimit,
      offset: safeOffset
    });
  } catch (err) {
    console.error('[youtube/comments/search] Error:', err.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/youtube/comments?compound=slug&limit=10
router.get('/comments', async (req, res) => {
  try {
    const { compound, video_id, limit = 10, offset = 0 } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 10, 50);
    const safeOffset = parseInt(offset) || 0;

    let where = [];
    let params = [];
    let idx = 1;

    if (compound) {
      where.push(`compound_slug = $${idx}`);
      params.push(compound);
      idx++;
    }
    if (video_id) {
      where.push(`video_id = $${idx}`);
      params.push(video_id);
      idx++;
    }

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await query(
      `SELECT count(*) FROM youtube_comments ${whereClause}`, params
    );

    params.push(safeLimit, safeOffset);
    const result = await query(
      `SELECT id, video_id, author_name, comment_text, like_count, published_at, compound_slug
       FROM youtube_comments ${whereClause}
       ORDER BY like_count DESC, published_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    res.json({
      comments: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: safeLimit,
      offset: safeOffset
    });
  } catch (err) {
    console.error('[youtube/comments] Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST /api/youtube/comments/import — admin only
// Body: { videoId, compoundSlug? }
router.post('/comments/import', authenticateToken, async (req, res) => {
  try {
    if (req.user.tier !== 'admin') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const { videoId, compoundSlug } = req.body;
    if (!videoId) {
      return res.status(400).json({ error: 'videoId required' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'YOUTUBE_API_KEY not configured' });
    }

    let imported = 0;
    let duplicates = 0;
    let nextPageToken = null;

    do {
      let url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=100&order=relevance&key=${apiKey}`;
      if (nextPageToken) url += `&pageToken=${nextPageToken}`;

      const resp = await fetch(url);
      const data = await resp.json();

      if (data.error) {
        return res.status(400).json({ error: data.error.message });
      }

      const items = data.items || [];
      for (const item of items) {
        const snippet = item.snippet.topLevelComment.snippet;
        try {
          await query(
            `INSERT INTO youtube_comments (comment_id, video_id, author_name, author_channel_id, comment_text, like_count, published_at, compound_slug)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (comment_id) DO UPDATE SET
               like_count = EXCLUDED.like_count,
               comment_text = EXCLUDED.comment_text`,
            [
              item.snippet.topLevelComment.id,
              videoId,
              snippet.authorDisplayName,
              snippet.authorChannelId?.value || null,
              snippet.textDisplay,
              snippet.likeCount || 0,
              snippet.publishedAt,
              compoundSlug || null
            ]
          );
          imported++;
        } catch (e) {
          if (e.code === '23505') duplicates++;
          else console.error('[import] Row error:', e.message);
        }
      }

      nextPageToken = data.nextPageToken;
    } while (nextPageToken);

    res.json({ imported, duplicates, videoId, compoundSlug: compoundSlug || null });
  } catch (err) {
    console.error('[youtube/comments/import] Error:', err.message);
    res.status(500).json({ error: 'Import failed: ' + err.message });
  }
});

// GET /api/youtube/comments/stats — aggregate stats
router.get('/comments/stats', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        count(*) AS total_comments,
        count(DISTINCT video_id) AS unique_videos,
        count(DISTINCT compound_slug) FILTER (WHERE compound_slug IS NOT NULL) AS linked_compounds,
        coalesce(sum(like_count), 0) AS total_likes
      FROM youtube_comments
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[youtube/comments/stats] Error:', err.message);
    res.status(500).json({ error: 'Stats failed' });
  }
});

module.exports = router;
