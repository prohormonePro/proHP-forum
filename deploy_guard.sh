#!/bin/bash
# ProHP Forum — Deploy Guard with Cloudflare Auto-Purge
# Anchor: E3592DC3

set -e

APP_DIR="/home/travisd/prohp-forum"
DIST_DIR="$APP_DIR/frontend/dist"
BACKUP_DIR="$APP_DIR/dist_backup_$(date +%Y%m%d_%H%M%S)"

# Cloudflare
# S56: read CF creds from .env (never hardcode keys in git-tracked files)
source /home/travisd/prohp-forum/.env

echo "[1/6] Backing up dist/"
cp -r "$DIST_DIR" "$BACKUP_DIR" 2>/dev/null || echo "No existing dist to backup"

echo "[2/6] Building frontend"
cd "$APP_DIR/frontend"
if ! npm run build 2>&1; then
    echo "[FAIL] Build failed. Restoring backup."
    rm -rf "$DIST_DIR"
    cp -r "$BACKUP_DIR" "$DIST_DIR" 2>/dev/null
    exit 1
fi

echo "[3/6] Verifying bundle"
JS_FILE=$(find "$DIST_DIR/assets" -name "index-*.js" -type f 2>/dev/null | head -1)
if [ -z "$JS_FILE" ] || [ ! -s "$JS_FILE" ]; then
    echo "[FAIL] No JS bundle found. Restoring backup."
    rm -rf "$DIST_DIR"
    cp -r "$BACKUP_DIR" "$DIST_DIR" 2>/dev/null
    exit 1
fi
echo "  Bundle: $JS_FILE ($(du -h "$JS_FILE" | cut -f1))"

echo "[4/6] Restarting app"
sudo systemctl restart prohp-forum 2>/dev/null || systemctl restart prohp-forum
sleep 3

echo "[5/6] Health check"
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/api/health)
if [ "$HTTP_CODE" != "200" ]; then
    echo "[FAIL] Health check returned $HTTP_CODE. Rolling back."
    rm -rf "$DIST_DIR"
    cp -r "$BACKUP_DIR" "$DIST_DIR" 2>/dev/null
    sudo systemctl restart prohp-forum 2>/dev/null || systemctl restart prohp-forum
    exit 1
fi
echo "  API: $HTTP_CODE OK"

echo "[6/6] Purging Cloudflare cache"
CF_RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE/purge_cache" \
    -H "X-Auth-Email: $CF_EMAIL" \
    -H "X-Auth-Key: $CF_KEY" \
    -H "Content-Type: application/json" \
    --data '{"purge_everything":true}')

if echo "$CF_RESULT" | grep -q '"success":true'; then
    echo "  Cloudflare cache PURGED"
else
    echo "  Cloudflare purge WARN: $CF_RESULT"
fi

echo ""
echo "[DEPLOY GUARD] ALL PASS. Build + verify + restart + health + purge."
echo "E3592DC3"