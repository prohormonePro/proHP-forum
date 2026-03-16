"""720: YouTube comment exporter. Requires YT_API_KEY env var or --key arg."""
import sys, json, os
from pathlib import Path
from datetime import datetime, timezone
try:
    from urllib.request import urlopen, Request
    from urllib.parse import urlencode
except ImportError:
    from urllib2 import urlopen, Request
    from urllib import urlencode

ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
STATE.mkdir(parents=True, exist_ok=True)

YT_API_BASE = "https://www.googleapis.com/youtube/v3"

def get_api_key():
    """Read from env, file, or arg."""
    k = os.environ.get("YT_API_KEY", "")
    if not k:
        kf = ROOT / "state" / "yt_api_key.txt"
        if kf.exists():
            k = kf.read_text(encoding="utf-8").strip()
    if not k and "--key" in sys.argv:
        idx = sys.argv.index("--key")
        if idx + 1 < len(sys.argv):
            k = sys.argv[idx + 1]
    return k

def yt_get(endpoint, params):
    """Make YouTube API GET request."""
    url = YT_API_BASE + "/" + endpoint + "?" + urlencode(params)
    try:
        r = urlopen(Request(url), timeout=15)
        return json.loads(r.read().decode("utf-8"))
    except Exception as e:
        return {"error": str(e)[:200]}

def get_channel_videos(api_key, channel_id="UCkN5pE0HjahBJFawXx1tyXQ"):
    """Get all video IDs from channel."""
    videos = []
    params = {"key": api_key, "channelId": channel_id, "part": "snippet", "type": "video", "maxResults": 50, "order": "date"}
    page_token = None
    while True:
        if page_token:
            params["pageToken"] = page_token
        data = yt_get("search", params)
        if "error" in data:
            print("  API error: " + str(data["error"])[:100])
            break
        for item in data.get("items", []):
            vid = item.get("id", {}).get("videoId")
            title = item.get("snippet", {}).get("title", "")
            if vid:
                videos.append({"video_id": vid, "title": title})
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return videos

def get_video_comments(api_key, video_id, max_pages=10):
    """Get all comment threads for a video."""
    comments = []
    params = {"key": api_key, "videoId": video_id, "part": "snippet,replies", "maxResults": 100, "order": "relevance"}
    page_token = None
    pages = 0
    while pages < max_pages:
        if page_token:
            params["pageToken"] = page_token
        data = yt_get("commentThreads", params)
        if "error" in data:
            break
        for item in data.get("items", []):
            top = item.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
            comments.append({
                "comment_id": item.get("id"),
                "video_id": video_id,
                "author": top.get("authorDisplayName", ""),
                "text": top.get("textDisplay", ""),
                "likes": top.get("likeCount", 0),
                "published": top.get("publishedAt", ""),
                "parent_id": None,
            })
            # Replies
            for reply in item.get("replies", {}).get("comments", []):
                rs = reply.get("snippet", {})
                comments.append({
                    "comment_id": reply.get("id"),
                    "video_id": video_id,
                    "author": rs.get("authorDisplayName", ""),
                    "text": rs.get("textDisplay", ""),
                    "likes": rs.get("likeCount", 0),
                    "published": rs.get("publishedAt", ""),
                    "parent_id": item.get("id"),
                })
        page_token = data.get("nextPageToken")
        if not page_token:
            break
        pages += 1
    return comments

if __name__ == "__main__":
    key = get_api_key()
    if not key:
        print("  NO API KEY FOUND")
        print("  Set YT_API_KEY env var, or save key to state/yt_api_key.txt, or pass --key YOUR_KEY")
        print("  Get one at: https://console.cloud.google.com -> APIs & Services -> YouTube Data API v3")
    elif "--export" in sys.argv:
        print("  Exporting all channel comments...")
        videos = get_channel_videos(key)
        print("  Found " + str(len(videos)) + " videos")
        all_comments = []
        for v in videos:
            comments = get_video_comments(key, v["video_id"])
            all_comments.extend(comments)
            print("  " + v["title"][:40] + ": " + str(len(comments)) + " comments")
        out = STATE / "yt_comments_raw.json"
        out.write_text(json.dumps(all_comments, indent=2, default=str), encoding="utf-8")
        print("\n  EXPORTED: " + str(len(all_comments)) + " comments to " + str(out))
    elif "--test" in sys.argv:
        print("  Testing API key...")
        data = yt_get("channels", {"key": key, "id": "UCkN5pE0HjahBJFawXx1tyXQ", "part": "snippet"})
        if "error" in data:
            print("  FAIL: " + str(data["error"])[:100])
        else:
            name = data.get("items", [{}])[0].get("snippet", {}).get("title", "?")
            print("  Channel: " + name)
            print("  API KEY VALID")
    else:
        print("  Usage: --test | --export | --key YOUR_KEY")
    print("  Anchor: E3592DC3")
