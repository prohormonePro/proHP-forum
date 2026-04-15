const express = require('express');
const router = express.Router();
const { query } = require('../config/db');
const { authenticate } = require('../middleware/auth');

router.get('/search', async (req, res) => {
  try {
    const { q, limit = 20, offset = 0, compound, filter } = req.query;
    if (!q || q.trim().length < 2) return res.json({ comments: [], total: 0 });
    const safeLimit = Math.min(parseInt(limit) || 20, 50);
    const safeOffset = parseInt(offset) || 0;
    const params = [q.trim()];
    let idx = 2;
    let where = "to_tsvector('english', comment_text) @@ plainto_tsquery('english', $1)";
    where += " AND signal_type NOT IN ('noise', 'admin_update')";
    if (compound) { where += ' AND compound_slug = $' + idx; params.push(compound); idx++; }
    if (filter && filter !== 'all') { where += ' AND signal_type = $' + idx; params.push(filter); idx++; }
    else { where += ' AND (is_reply = false OR is_reply IS NULL)'; }  // only exclude replies when no specific filter
    const countR = await query('SELECT count(*) FROM youtube_comments WHERE ' + where, params);
    params.push(safeLimit, safeOffset);
    const result = await query(
      'SELECT id, video_id, video_title, author_name, comment_text, like_count, published_at, compound_slug, signal_type, signal_score, is_reply, parent_comment_id, reply_count, ' +
      "ts_rank(to_tsvector('english', comment_text), plainto_tsquery('english', $1)) AS relevance " +
      'FROM youtube_comments WHERE ' + where + ' ORDER BY relevance DESC, like_count DESC LIMIT $' + idx + ' OFFSET $' + (idx+1), params);
    res.json({ comments: result.rows, total: parseInt(countR.rows[0].count), query: q.trim() });
  } catch (err) { console.error('[yt/search]', err.message); res.status(500).json({ error: 'Search failed' }); }
});

router.get('/', async (req, res) => {
  try {
    const { compound, filter, limit = 20, offset = 0 } = req.query;
    const safeLimit = Math.min(parseInt(limit) || 20, 50);
    const safeOffset = parseInt(offset) || 0;
    const params = [];
    let idx = 1;
    let where = "signal_type NOT IN ('noise', 'admin_update')";
    if (compound) { where += ' AND compound_slug = $' + idx; params.push(compound); idx++; }
    if (filter && filter !== 'all') { where += ' AND signal_type = $' + idx; params.push(filter); idx++; }
    else { where += ' AND (is_reply = false OR is_reply IS NULL)'; }  // only exclude replies when no specific filter
    const countR = await query('SELECT count(*) FROM youtube_comments WHERE ' + where, params);
    params.push(safeLimit, safeOffset);
    const result = await query(
      'SELECT id, video_id, video_title, author_name, comment_text, like_count, published_at, compound_slug, signal_type, signal_score, is_reply, parent_comment_id, reply_count ' +
      'FROM youtube_comments WHERE ' + where + ' ORDER BY like_count DESC, published_at DESC LIMIT $' + idx + ' OFFSET $' + (idx+1), params);
    res.json({ comments: result.rows, total: parseInt(countR.rows[0].count), limit: safeLimit, offset: safeOffset });
  } catch (err) { console.error('[yt/comments]', err.message); res.status(500).json({ error: 'Failed' }); }
});

router.get('/stats', async (req, res) => {
  try {
    const result = await query(
      "SELECT count(*) AS total_comments, count(DISTINCT video_id) AS unique_videos, " +
      "count(DISTINCT compound_slug) FILTER (WHERE compound_slug IS NOT NULL) AS linked_compounds, " +
      "coalesce(sum(like_count), 0) AS total_likes, " +
      "count(*) FILTER (WHERE signal_type = 'cycle_log') AS cycle_logs, " +
      "count(*) FILTER (WHERE signal_type = 'side_effect') AS side_effects, " +
      "count(*) FILTER (WHERE signal_type = 'benefit') AS benefits, " +
      "count(*) FILTER (WHERE signal_type = 'question') AS questions, " +
      "count(*) FILTER (WHERE signal_type = 'travis_reply') AS travis_replies, " +
      "count(*) FILTER (WHERE signal_type = 'noise') AS noise, " +
      "count(*) FILTER (WHERE signal_type = 'admin_update') AS admin_updates " +
      "FROM youtube_comments");
    res.json(result.rows[0]);
  } catch (err) { console.error('[yt/stats]', err.message); res.status(500).json({ error: 'Stats failed' }); }
});

router.post('/import', authenticate, async (req, res) => {
  try {
    if (req.user.tier !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const { videoId, compoundSlug } = req.body;
    if (!videoId) return res.status(400).json({ error: 'videoId required' });
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'YOUTUBE_API_KEY not configured' });
    let imported = 0; let nextPageToken = null;
    do {
      let url = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=' + videoId + '&maxResults=100&order=relevance&key=' + apiKey;
      if (nextPageToken) url += '&pageToken=' + nextPageToken;
      const resp = await fetch(url); const data = await resp.json();
      if (data.error) return res.status(400).json({ error: data.error.message });
      for (const item of (data.items || [])) {
        const s = item.snippet.topLevelComment.snippet;
        const rc = item.snippet.totalReplyCount || 0;
        try { await query('INSERT INTO youtube_comments (comment_id,video_id,author_name,author_channel_id,comment_text,like_count,published_at,compound_slug,reply_count) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (comment_id) DO UPDATE SET like_count=EXCLUDED.like_count,comment_text=EXCLUDED.comment_text,reply_count=EXCLUDED.reply_count',
          [item.snippet.topLevelComment.id,videoId,s.authorDisplayName,s.authorChannelId&&s.authorChannelId.value||null,s.textDisplay,s.likeCount||0,s.publishedAt,compoundSlug||null,rc]); imported++; } catch(e) {}
        if (item.replies && item.replies.comments) {
          for (const reply of item.replies.comments) {
            const rs = reply.snippet;
            try { await query('INSERT INTO youtube_comments (comment_id,video_id,author_name,author_channel_id,comment_text,like_count,published_at,compound_slug,parent_comment_id,is_reply) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,true) ON CONFLICT (comment_id) DO UPDATE SET like_count=EXCLUDED.like_count,comment_text=EXCLUDED.comment_text',
              [reply.id,videoId,rs.authorDisplayName,rs.authorChannelId&&rs.authorChannelId.value||null,rs.textDisplay,rs.likeCount||0,rs.publishedAt,compoundSlug||null,item.snippet.topLevelComment.id]); imported++; } catch(e) {}
          }
        }
      }
      nextPageToken = data.nextPageToken;
    } while (nextPageToken);
    res.json({ imported, videoId, compoundSlug: compoundSlug || null });
  } catch (err) { console.error('[yt/import]', err.message); res.status(500).json({ error: 'Import failed' }); }
});

module.exports = router;
