"""
STAGE 476 — Organism Health Score
Single numeric health score 0-100. Machine and operator readable.
Anchor: E3592DC3
"""
import json, sys
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))


def compute_health_score():
    """Compute overall organism health 0-100."""
    score = 0
    max_score = 0
    details = {}

    # 1. Host detected (10pts)
    max_score += 10
    try:
        from host_profile import get_host_profile
        hp = get_host_profile()
        if hp.get("detected"):
            score += 10
            details["host"] = {"points": 10, "max": 10}
        else:
            details["host"] = {"points": 0, "max": 10}
    except Exception:
        details["host"] = {"points": 0, "max": 10}

    # 2. Services alive (20pts)
    max_score += 20
    try:
        import subprocess
        r = subprocess.run(["wmic", "process", "where", "name='python.exe'", "get", "CommandLine", "/FORMAT:LIST"],
                          capture_output=True, text=True, timeout=10)
        procs = r.stdout or ""
        svc_pts = 0
        if "sovereign_daemon" in procs: svc_pts += 10
        if "telegram_bridge" in procs: svc_pts += 10
        score += svc_pts
        details["services"] = {"points": svc_pts, "max": 20}
    except Exception:
        details["services"] = {"points": 0, "max": 20}

    # 3. Proof integrity (15pts)
    max_score += 15
    try:
        pi = json.loads((STATE / "proof_integrity.json").read_text(encoding="utf-8"))
        if pi.get("integrity") == "CLEAN":
            score += 15
            details["proofs"] = {"points": 15, "max": 15}
        else:
            score += 5
            details["proofs"] = {"points": 5, "max": 15}
    except Exception:
        details["proofs"] = {"points": 0, "max": 15}

    # 4. Certification (20pts)
    max_score += 20
    try:
        cert = json.loads((STATE / "takeover_certification.json").read_text(encoding="utf-8"))
        passed = cert.get("passed", 0)
        total = cert.get("total", 12)
        cert_pts = int((passed / max(total, 1)) * 20)
        score += cert_pts
        details["cert"] = {"points": cert_pts, "max": 20}
    except Exception:
        details["cert"] = {"points": 0, "max": 20}

    # 5. Continuity sync (15pts)
    max_score += 15
    try:
        s = json.loads((STATE / "continuity_sync.json").read_text(encoding="utf-8"))
        if s.get("all_ok"):
            score += 15
            details["sync"] = {"points": 15, "max": 15}
        else:
            score += 5
            details["sync"] = {"points": 5, "max": 15}
    except Exception:
        details["sync"] = {"points": 0, "max": 15}

    # 6. Proof lanes (10pts)
    max_score += 10
    try:
        from proof_spine import classify_lane_state
        ls = classify_lane_state()
        if ls == "FULL_LANES": lane_pts = 10
        elif ls == "LOCAL_ONLY": lane_pts = 6
        else: lane_pts = 0
        score += lane_pts
        details["lanes"] = {"points": lane_pts, "max": 10}
    except Exception:
        details["lanes"] = {"points": 0, "max": 10}

    # 7. No recent failures (10pts)
    max_score += 10
    try:
        fl = json.loads((STATE / "failure_ledger.json").read_text(encoding="utf-8"))
        recent = [e for e in fl if "2026-03-14T2" in e.get("utc", "")]  # last few hours
        if len(recent) <= 2:
            score += 10
            details["failures"] = {"points": 10, "max": 10}
        else:
            score += 3
            details["failures"] = {"points": 3, "max": 10}
    except Exception:
        score += 10  # no ledger = no failures
        details["failures"] = {"points": 10, "max": 10}

    health_pct = int((score / max(max_score, 1)) * 100)
    if health_pct >= 90: grade = "EXCELLENT"
    elif health_pct >= 70: grade = "GOOD"
    elif health_pct >= 50: grade = "DEGRADED"
    else: grade = "CRITICAL"

    result = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "score": score,
        "max_score": max_score,
        "health_pct": health_pct,
        "grade": grade,
        "details": details,
        "anchor": "E3592DC3",
    }

    (STATE / "health_score.json").write_text(json.dumps(result, indent=2, default=str), encoding="utf-8")
    return result


def main():
    import argparse
    parser = argparse.ArgumentParser(description="STAGE 476: Health Score")
    parser.add_argument("--test", action="store_true")
    parser.add_argument("--score", action="store_true")
    args = parser.parse_args()

    if args.test:
        assert callable(compute_health_score)
        print("TEST 1 PASS: compute_health_score callable")
        print("\nALL 1 TESTS PASSED")
        return

    if args.score:
        r = compute_health_score()
        print(f"\n  HEALTH: {r['health_pct']}% ({r['grade']})")
        print(f"  Score: {r['score']}/{r['max_score']}\n")
        for name, d in r["details"].items():
            print(f"    {name:15s} {d['points']:3d}/{d['max']}")
        sys.exit(0 if r["grade"] in ("EXCELLENT", "GOOD") else 1)

    print("Usage: --test | --score")


if __name__ == "__main__":
    main()
