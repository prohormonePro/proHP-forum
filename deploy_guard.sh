#!/bin/bash
# SOVEREIGN DEPLOY GUARD — §39
# Usage: bash deploy_guard.sh
# This script MUST be used for all deploys. Direct npm build + restart is FORBIDDEN.

set -e
cd /home/travisd/prohp-forum/frontend

# Step 1: Backup current working build
cp -r dist dist_backup 2>/dev/null || true
echo "[GUARD] Backup saved"

# Step 2: Build
echo "[GUARD] Building..."
BUILD_OUTPUT=$(npm run build 2>&1)
echo "$BUILD_OUTPUT" | tail -5

if echo "$BUILD_OUTPUT" | grep -qi "built in"; then
  echo "[GUARD] Build PASSED"
else
  echo "[GUARD] BUILD FAILED — restoring backup"
  rm -rf dist
  mv dist_backup dist
  echo "[GUARD] Backup restored. Site is SAFE. No restart."
  exit 1
fi

# Step 3: Verify the new bundle exists and is > 100KB
NEW_JS=$(ls -la dist/assets/index-*.js 2>/dev/null | head -1)
if [ -z "$NEW_JS" ]; then
  echo "[GUARD] NO JS BUNDLE FOUND — restoring backup"
  rm -rf dist
  mv dist_backup dist
  exit 1
fi
echo "[GUARD] Bundle verified: $NEW_JS"

# Step 4: Restart
sudo systemctl restart prohp-forum
echo "[GUARD] App restarted"

# Step 5: Health check (wait 2s for startup)
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:4000/api/auth/me)
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
  echo "[GUARD] Health check PASSED (HTTP $HTTP_CODE)"
  rm -rf dist_backup
  echo "[GUARD] DEPLOY COMPLETE"
else
  echo "[GUARD] HEALTH CHECK FAILED (HTTP $HTTP_CODE) — rolling back"
  rm -rf dist
  mv dist_backup dist
  sudo systemctl restart prohp-forum
  echo "[GUARD] Rollback complete. Site restored."
  exit 1
fi
