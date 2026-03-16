"""651: No move closes unless trio is unified. Hard law."""
import sys, json
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

def canon_close_check():
    """Check if trio is unified. Returns honest verdict."""
    sv = STATE / "surface_verification.json"
    trio = STATE / "trio_mirror_receipt.json"

    result = {"utc": datetime.now(timezone.utc).isoformat(), "anchor": "E3592DC3"}

    # Check surface verification
    if sv.exists():
        data = json.loads(sv.read_text(encoding="utf-8"))
        result["surface_verdict"] = data.get("verdict", "UNKNOWN")
        result["files"] = data.get("files", {})
    else:
        result["surface_verdict"] = "NO_VERIFICATION"

    # Check trio mirror
    if trio.exists():
        data = json.loads(trio.read_text(encoding="utf-8"))
        result["trio_verdict"] = data.get("verdict", "UNKNOWN")
        result["trio_match"] = data.get("match", 0)
    else:
        result["trio_verdict"] = "NO_MIRROR_RUN"

    # Honest seal
    hs = STATE / "honest_seal_check.json"
    if hs.exists():
        data = json.loads(hs.read_text(encoding="utf-8"))
        result["honest_labels"] = data.get("labels", {})

    # Final verdict
    unified = result.get("surface_verdict") == "TRIO_UNIFIED" and result.get("trio_verdict") == "TRIO_UNIFIED"
    result["canon_close_allowed"] = unified
    result["close_language"] = "TRIO_UNIFIED — all 3 canon files match on travisHP + srv2" if unified else "CANON_DRIFT — trio not unified, close blocked"

    (STATE / "canon_close_check.json").write_text(json.dumps(result, indent=2, default=str), encoding="utf-8")
    return result

if __name__ == "__main__":
    r = canon_close_check()
    print(f"\n  CANON CLOSE GOVERNOR")
    print(f"  ====================\n")
    print(f"  Surface: {r.get('surface_verdict', '?')}")
    print(f"  Trio:    {r.get('trio_verdict', '?')}")
    print(f"  Close:   {'ALLOWED' if r['canon_close_allowed'] else 'BLOCKED'}")
    print(f"  Status:  {r['close_language']}")
    for k, v in r.get("honest_labels", {}).items():
        print(f"  {k:20s}: {v}")
    print(f"\n  Anchor: E3592DC3")
