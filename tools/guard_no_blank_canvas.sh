#!/usr/bin/env bash
set -euo pipefail

# Block “blank canvas” rewrites by enforcing minimum file sizes on known heavyweight pages.
# If a Swarm tries to nuke them, commit is rejected.

declare -A MIN_BYTES
MIN_BYTES["frontend/src/pages/Home.jsx"]=12000
MIN_BYTES["frontend/src/pages/CompoundDetail.jsx"]=12000

fail=0

for f in "${!MIN_BYTES[@]}"; do
  if git diff --cached --name-only | grep -qx "$f"; then
    # file staged; check size in index
    sz=$(git cat-file -s ":$f" 2>/dev/null || echo 0)
    min="${MIN_BYTES[$f]}"
    if [ "$sz" -lt "$min" ]; then
      echo "[BLOCKED] $f staged size $sz bytes < minimum $min bytes"
      echo "Reason: prevents blank-canvas structural drift."
      fail=1
    fi
  fi
done

exit $fail
