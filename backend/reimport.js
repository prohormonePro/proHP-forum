require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ host: process.env.DB_HOST||'localhost', port: process.env.DB_PORT||5432, database: process.env.DB_NAME||'prohp_forum', user: process.env.DB_USER||'prohp', password: process.env.DB_PASSWORD });
const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCay0A4e31Av26rn0zDMqK-w';
async function fetchJSON(url) { const r = await fetch(url); return r.json(); }

async function getAllVideos() {
  const videos = []; let np = null;
  do {
    let url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=' + CHANNEL_ID + '&type=video&maxResults=50&order=date&key=' + API_KEY;
    if (np) url += '&pageToken=' + np;
    const d = await fetchJSON(url);
    if (d.error) { console.error('API Error:', d.error.message); break; }
    for (const i of (d.items||[])) videos.push({ videoId: i.id.videoId, title: i.snippet.title });
    np = d.nextPageToken;
    process.stdout.write('  Videos: ' + videos.length + '\r');
  } while (np);
  console.log('  Total videos: ' + videos.length);
  return videos;
}

async function matchCompound(title) {
  const r = await pool.query("SELECT slug FROM compounds WHERE LOWER($1) LIKE '%' || LOWER(name) || '%' ORDER BY LENGTH(name) DESC LIMIT 1", [title]);
  return r.rows.length > 0 ? r.rows[0].slug : null;
}

async function importVideo(videoId, title, slug) {
  let imported = 0; let replies = 0; let np = null;
  do {
    let url = 'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=' + videoId + '&maxResults=100&order=relevance&key=' + API_KEY;
    if (np) url += '&pageToken=' + np;
    const d = await fetchJSON(url);
    if (d.error) return { imported, replies };
    for (const item of (d.items || [])) {
      const s = item.snippet.topLevelComment.snippet;
      const rc = item.snippet.totalReplyCount || 0;
      const parentId = item.snippet.topLevelComment.id;
      try {
        await pool.query('INSERT INTO youtube_comments (comment_id,video_id,video_title,author_name,author_channel_id,comment_text,like_count,published_at,compound_slug,reply_count,is_reply) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false) ON CONFLICT (comment_id) DO UPDATE SET like_count=EXCLUDED.like_count,comment_text=EXCLUDED.comment_text,reply_count=EXCLUDED.reply_count,video_title=EXCLUDED.video_title',
          [parentId,videoId,title,s.authorDisplayName,s.authorChannelId&&s.authorChannelId.value||null,s.textDisplay,s.likeCount||0,s.publishedAt,slug||null,rc]);
        imported++;
      } catch(e) {}
      if (item.replies && item.replies.comments) {
        for (const reply of item.replies.comments) {
          const rs = reply.snippet;
          try {
            await pool.query('INSERT INTO youtube_comments (comment_id,video_id,video_title,author_name,author_channel_id,comment_text,like_count,published_at,compound_slug,parent_comment_id,is_reply) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,true) ON CONFLICT (comment_id) DO UPDATE SET like_count=EXCLUDED.like_count,comment_text=EXCLUDED.comment_text,parent_comment_id=EXCLUDED.parent_comment_id,is_reply=true,video_title=EXCLUDED.video_title',
              [reply.id,videoId,title,rs.authorDisplayName,rs.authorChannelId&&rs.authorChannelId.value||null,rs.textDisplay,rs.likeCount||0,rs.publishedAt,slug||null,parentId]);
            replies++;
          } catch(e) {}
        }
      }
    }
    np = d.nextPageToken;
  } while (np);
  return { imported, replies };
}

async function main() {
  console.log('FULL RE-IMPORT WITH REPLIES');
  const videos = await getAllVideos();
  let totalComments = 0, totalReplies = 0, processed = 0;
  for (const v of videos) {
    const slug = await matchCompound(v.title);
    const r = await importVideo(v.videoId, v.title, slug);
    totalComments += r.imported; totalReplies += r.replies; processed++;
    if (r.imported > 0 || r.replies > 0) console.log('  [' + processed + '/' + videos.length + '] ' + v.title.substring(0,45) + ' -> ' + r.imported + ' comments, ' + r.replies + ' replies' + (slug ? ' (' + slug + ')' : ''));
    else process.stdout.write('  [' + processed + '/' + videos.length + '] ...\r');
    await new Promise(r => setTimeout(r, 250));
  }
  const stats = await pool.query('SELECT count(*) AS total, count(*) FILTER (WHERE is_reply=true) AS replies, count(DISTINCT video_id) AS videos, count(DISTINCT compound_slug) FILTER (WHERE compound_slug IS NOT NULL) AS compounds FROM youtube_comments');
  const s = stats.rows[0];
  console.log('\n========================================');
  console.log('  RE-IMPORT COMPLETE');
  console.log('  Total: ' + s.total + ' | Replies: ' + s.replies + ' | Videos: ' + s.videos + ' | Compounds: ' + s.compounds);
  console.log('========================================');
  console.log('E3592DC3');
  await pool.end();
}
main().catch(function(e) { console.error(e); process.exit(1); });
