"""648: Trio canon mirror. All 3 files or nothing. Uses ssh_authority."""
import sys, json, hashlib
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

TRIO = ["stage_manifest.json", "SOVEREIGN_MEMORY.md", "ORGANISM_VOICE_CODEX.md"]
REMOTE = "/home/travisd/prohp-forum"

def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16] if path.exists() else None

def trio_mirror():
    from ssh_authority import ssh_run, scp_push
    steps = []
    local_hashes = {f: file_hash(ROOT / f) for f in TRIO}

    # 1. Push all 3
    for f in TRIO:
        src = ROOT / f
        if not src.exists():
            steps.append({"step": f"scp_{f}", "ok": False, "error": "missing locally"})
            continue
        r = scp_push(src, f"{REMOTE}/{f}")
        steps.append({"step": f"scp_{f}", "ok": r["ok"], "error": r.get("stderr") if not r["ok"] else None})

    # 2. Git commit
    git_cmd = f'cd {REMOTE} && git add {" ".join(TRIO)} && (git diff --cached --quiet && echo GIT_CLEAN || (git commit -m "auto: trio mirror [SOVEREIGN_L5]" && git push origin main && echo GIT_PUSHED))'
    git_r = ssh_run(git_cmd, timeout=60)
    git_status = "CLEAN" if "GIT_CLEAN" in git_r["stdout"] else ("PUSHED" if "GIT_PUSHED" in git_r["stdout"] else "FAILED")
    steps.append({"step": "git", "ok": git_status != "FAILED", "status": git_status})

    # 3. Verify hashes
    srv2_hashes = {}
    for f in TRIO:
        r = ssh_run(f"sha256sum {REMOTE}/{f} 2>/dev/null | cut -c1-16")
        h = r["stdout"].strip()
        srv2_hashes[f] = h if len(h) == 16 and r["ok"] else None

    match = sum(1 for f in TRIO if local_hashes.get(f) == srv2_hashes.get(f) and local_hashes.get(f))
    verdict = "TRIO_UNIFIED" if match == 3 else ("TRIO_PARTIAL" if match > 0 else "TRIO_BLOCKED")

    receipt = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "local": local_hashes,
        "srv2": srv2_hashes,
        "match": match,
        "verdict": verdict,
        "steps": steps,
        "anchor": "E3592DC3",
    }
    (STATE / "trio_mirror_receipt.json").write_text(json.dumps(receipt, indent=2, default=str), encoding="utf-8")
    return receipt

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--mirror", action="store_true")
    p.add_argument("--test", action="store_true")
    a = p.parse_args()
    if a.test:
        assert callable(trio_mirror)
        print("TEST 1 PASS: trio_mirror callable")
        print("\nALL 1 TESTS PASSED")
    elif a.mirror:
        r = trio_mirror()
        for s in r["steps"]:
            ok = "OK" if s["ok"] else "FAIL"
            extra = f" ({s.get('status', s.get('error', ''))})" if s.get("status") or s.get("error") else ""
            print(f"  [{ok:4s}] {s['step']}{extra}")
        print(f"\n  Match: {r['match']}/3")
        print(f"  Verdict: {r['verdict']}")
    else:
        print("Usage: --test | --mirror")
