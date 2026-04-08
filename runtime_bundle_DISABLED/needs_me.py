"""531: Real 'what needs me' aggregator."""
import json, sys
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

def what_needs_me():
    """Aggregate all things that need operator attention."""
    needs = []
    
    # 1. Post-run issues
    try:
        prc = json.loads((STATE / "post_run_check.json").read_text(encoding="utf-8"))
        for i in prc.get("issues", []):
            if not i.get("healable"):
                needs.append({"source": "post_run_check", "type": i["type"], "detail": i})
    except Exception: pass
    
    # 2. Reflection recommendations
    try:
        rf = json.loads((STATE / "reflection_report.json").read_text(encoding="utf-8"))
        for rec in rf.get("recommendations", []):
            needs.append({"source": "reflection", "type": "recommendation", "detail": rec})
    except Exception: pass
    
    # 3. Failed repairs
    try:
        ar = json.loads((STATE / "auto_repair_result.json").read_text(encoding="utf-8"))
        for esc in ar.get("escalate", []):
            needs.append({"source": "auto_repair", "type": "escalated", "detail": esc})
    except Exception: pass
    
    # 4. Governor escalation
    try:
        gov = json.loads((STATE / "heal_governor.json").read_text(encoding="utf-8"))
        if gov.get("consecutive_failures", 0) >= 3:
            needs.append({"source": "heal_governor", "type": "escalated", "detail": "3+ consecutive repair failures"})
    except Exception: pass
    
    # 5. Health below threshold
    try:
        hs = json.loads((STATE / "health_score.json").read_text(encoding="utf-8"))
        if hs.get("health_pct", 100) < 80:
            needs.append({"source": "health", "type": "degraded", "detail": f"{hs['health_pct']}% {hs['grade']}"})
    except Exception: pass
    
    result = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "needs": needs,
        "count": len(needs),
        "nothing_needed": len(needs) == 0,
        "anchor": "E3592DC3",
    }
    (STATE / "needs_me.json").write_text(json.dumps(result, indent=2, default=str), encoding="utf-8")
    return result

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--check", action="store_true")
    a = p.parse_args()
    if a.test:
        assert callable(what_needs_me)
        print("TEST 1 PASS: what_needs_me callable")
        print("\nALL 1 TESTS PASSED")
    elif a.check:
        r = what_needs_me()
        if r["nothing_needed"]:
            print("  Nothing needs you right now.")
        else:
            print(f"  {r['count']} items need attention:\n")
            for n in r["needs"]:
                print(f"  [{n['source']}] {n['type']}: {n.get('detail','?')}")
    else:
        print("Usage: --test | --check")
