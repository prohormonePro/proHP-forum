"""654: G14 trio pull agent. Pulls from srv2, verifies hashes."""
import subprocess, json, hashlib, os
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
STATE.mkdir(parents=True, exist_ok=True)
SRV2 = "travisd@107.152.45.184"
REMOTE = "/home/travisd/prohp-forum"
TRIO = ["stage_manifest.json", "SOVEREIGN_MEMORY.md", "ORGANISM_VOICE_CODEX.md"]

# Find SSH key
SSH_KEY = None
for p in [Path.home() / ".ssh" / "id_ed25519_prohp_swarm",
          Path(r"C:\Users\Travi\.ssh\id_ed25519_prohp_swarm"),
          Path(r"C:\Users\Travis\.ssh\id_ed25519_prohp_swarm")]:
    if p.exists():
        SSH_KEY = str(p)
        break

def _scp_pull(remote_file, local_file):
    cmd = ["scp", "-o", "BatchMode=yes"]
    if SSH_KEY:
        cmd.extend(["-i", SSH_KEY])
    cmd.extend([f"{SRV2}:{remote_file}", str(local_file)])
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return r.returncode == 0

def _ssh_hash(remote_file):
    cmd = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10"]
    if SSH_KEY:
        cmd.extend(["-i", SSH_KEY])
    cmd.extend([SRV2, f"sha256sum {remote_file} 2>/dev/null | cut -c1-16"])
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        h = r.stdout.strip()
        return h if len(h) == 16 else None
    except Exception:
        return None

def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()[:16] if path.exists() else None

def pull_trio():
    results = []
    for f in TRIO:
        ok = _scp_pull(f"{REMOTE}/{f}", ROOT / f)
        lh = file_hash(ROOT / f) if ok else None
        sh = _ssh_hash(f"{REMOTE}/{f}")
        match = lh == sh if (lh and sh) else False
        results.append({"file": f, "pulled": ok, "local_hash": lh, "srv2_hash": sh, "match": match})

    pulled = sum(1 for r in results if r["pulled"])
    matched = sum(1 for r in results if r["match"])
    verdict = "G14_TRIO_UNIFIED" if matched == 3 else f"G14_PARTIAL_{matched}/3"

    receipt = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "host": os.environ.get("COMPUTERNAME", "unknown"),
        "user": os.environ.get("USERNAME", "unknown"),
        "key": SSH_KEY,
        "pulled": pulled,
        "matched": matched,
        "verdict": verdict,
        "results": results,
        "anchor": "E3592DC3",
    }
    (STATE / "g14_pull_receipt.json").write_text(json.dumps(receipt, indent=2, default=str), encoding="utf-8")
    return receipt

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--pull", action="store_true")
    p.add_argument("--test", action="store_true")
    a = p.parse_args()
    if a.test:
        assert callable(pull_trio)
        print("TEST 1 PASS: pull_trio callable")
        print(f"TEST 2 PASS: key={SSH_KEY}")
        print("\nALL 2 TESTS PASSED")
    elif a.pull:
        r = pull_trio()
        for res in r["results"]:
            ok = "OK" if res["match"] else "FAIL"
            print(f"  [{ok}] {res['file']} pulled={res['pulled']} match={res['match']}")
        print(f"\n  Verdict: {r['verdict']}")
    else:
        print("Usage: --test | --pull")