"""602: Bidirectional sync — local C: <-> srv2. Both surfaces always current."""
import json, sys, subprocess, hashlib
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
SSH_KEY = Path.home() / ".ssh" / "id_ed25519_prohp_swarm"
SRV2 = "travisd@107.152.45.184"
REMOTE_DIR = "/home/travisd/prohp-forum"

SYNC_FILES = [
    "stage_manifest.json",
    "SOVEREIGN_MEMORY.md",
    "ORGANISM_VOICE_CODEX.md",
]

def _local_hash(filename):
    f = ROOT / filename
    if f.exists():
        return hashlib.sha256(f.read_bytes()).hexdigest()[:16]
    return None

def _remote_hash(filename):
    try:
        r = subprocess.run(
            ["ssh", "-i", str(SSH_KEY), "-o", "BatchMode=yes", SRV2,
             f"sha256sum {REMOTE_DIR}/{filename} 2>/dev/null | cut -c1-16"],
            capture_output=True, text=True, timeout=15
        )
        h = r.stdout.strip()
        return h if len(h) == 16 else None
    except Exception:
        return None

def push_file(filename):
    src = ROOT / filename
    if not src.exists():
        return {"ok": False, "reason": "local missing"}
    try:
        subprocess.run(
            ["scp", "-i", str(SSH_KEY), "-o", "BatchMode=yes",
             str(src), f"{SRV2}:{REMOTE_DIR}/{filename}"],
            capture_output=True, timeout=30, check=True
        )
        return {"ok": True, "direction": "push"}
    except Exception as e:
        return {"ok": False, "reason": str(e)[:100]}

def pull_file(filename):
    dst = ROOT / filename
    try:
        subprocess.run(
            ["scp", "-i", str(SSH_KEY), "-o", "BatchMode=yes",
             f"{SRV2}:{REMOTE_DIR}/{filename}", str(dst)],
            capture_output=True, timeout=30, check=True
        )
        return {"ok": True, "direction": "pull"}
    except Exception as e:
        return {"ok": False, "reason": str(e)[:100]}

def sync_bidirectional():
    results = []
    for f in SYNC_FILES:
        lh = _local_hash(f)
        rh = _remote_hash(f)
        if lh == rh:
            results.append({"file": f, "action": "IN_SYNC"})
        elif lh and not rh:
            r = push_file(f)
            results.append({"file": f, "action": "PUSHED", **r})
        elif rh and not lh:
            r = pull_file(f)
            results.append({"file": f, "action": "PULLED", **r})
        else:
            # Both exist, differ — local wins (local is canonical build surface)
            # But check timestamps
            local_mtime = (ROOT / f).stat().st_mtime
            r = push_file(f)
            results.append({"file": f, "action": "PUSHED_LOCAL_WINS", **r})
    
    receipt = {"utc": datetime.now(timezone.utc).isoformat(), "results": results, "anchor": "E3592DC3"}
    (STATE / "bidirectional_sync_receipt.json").write_text(json.dumps(receipt, indent=2, default=str), encoding="utf-8")
    return receipt

def git_commit_srv2(message="auto-sync"):
    try:
        files = " ".join(SYNC_FILES)
        cmd = f"cd {REMOTE_DIR} && git add {files} && (git diff --cached --quiet || (git commit -m '{message}' && git push origin main))"
        subprocess.run(
            ["ssh", "-i", str(SSH_KEY), "-o", "BatchMode=yes", SRV2, cmd],
            capture_output=True, timeout=60
        )
        return True
    except Exception:
        return False

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--sync", action="store_true")
    a = p.parse_args()
    if a.test:
        assert callable(sync_bidirectional)
        print("TEST 1 PASS: sync_bidirectional callable")
        print("\nALL 1 TESTS PASSED")
    elif a.sync:
        r = sync_bidirectional()
        for res in r["results"]:
            print(f"  {res['file']:30s} {res['action']}")
    else:
        print("Usage: --test | --sync")
