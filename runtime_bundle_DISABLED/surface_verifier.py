"""649: Cross-surface verification using ssh_authority."""
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

def verify():
    from ssh_authority import ssh_run
    results = {}
    all_match = True
    for f in TRIO:
        lh = file_hash(ROOT / f)
        r = ssh_run(f"sha256sum {REMOTE}/{f} 2>/dev/null | cut -c1-16")
        sh = r["stdout"].strip() if r["ok"] and len(r["stdout"].strip()) == 16 else None
        match = lh == sh if (lh and sh) else False
        if not match:
            all_match = False
        results[f] = {"local": lh, "srv2": sh, "match": match}

    verdict = "TRIO_UNIFIED" if all_match else "DRIFT"
    report = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "files": results,
        "verdict": verdict,
        "anchor": "E3592DC3",
    }
    (STATE / "surface_verification.json").write_text(json.dumps(report, indent=2, default=str), encoding="utf-8")
    return report

if __name__ == "__main__":
    r = verify()
    print(f"\n  TRIO SURFACE VERIFICATION")
    print(f"  =========================\n")
    for f, d in r["files"].items():
        print(f"  {f}")
        print(f"    Local: {d['local'] or 'MISSING'}")
        print(f"    srv2:  {d['srv2'] or 'MISSING'}")
        print(f"    Match: {'YES' if d['match'] else 'NO'}")
        print()
    print(f"  Verdict: {r['verdict']}")
    print(f"  Anchor: E3592DC3")
