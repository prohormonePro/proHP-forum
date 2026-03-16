"""670: Bot reentry gate. No bot work unless trio + delivery are clean."""
import sys, json
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

def reentry_check():
    checks = {}

    # 1. Trio unified (travisHP <-> srv2)
    sv = STATE / "surface_verification.json"
    if sv.exists():
        data = json.loads(sv.read_text(encoding="utf-8"))
        checks["trio_unified"] = data.get("verdict") == "TRIO_UNIFIED"
    else:
        checks["trio_unified"] = False

    # 2. Chat ID valid
    from delivery_gate import get_real_chat_id
    cid = get_real_chat_id()
    checks["chat_id_valid"] = cid is not None

    # 3. Voice wired
    bridge = (ROOT / "telegram_bridge.py").read_text(encoding="utf-8")
    checks["voice_wired"] = "bot_voice_handler" in bridge

    # 4. Chat ID capture wired
    checks["capture_wired"] = "667: Auto-capture" in bridge

    # 5. Bot token valid
    try:
        from telegram_bridge import tg_request
        me = tg_request("getMe")
        checks["bot_token"] = me and me.get("ok", False)
    except Exception:
        checks["bot_token"] = False

    all_pass = all(checks.values())
    blockers = [k for k, v in checks.items() if not v]

    result = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "checks": checks,
        "all_pass": all_pass,
        "blockers": blockers,
        "verdict": "BOT_READY" if all_pass else f"BLOCKED: {', '.join(blockers)}",
        "anchor": "E3592DC3",
    }
    (STATE / "bot_reentry_gate.json").write_text(json.dumps(result, indent=2, default=str), encoding="utf-8")
    return result

if __name__ == "__main__":
    r = reentry_check()
    print(f"\n  BOT REENTRY GATE")
    print(f"  =================\n")
    for k, v in r["checks"].items():
        print(f"  {k:20s}: {'OK' if v else 'BLOCKED'}")
    print(f"\n  Verdict: {r['verdict']}")
    print(f"  Anchor: E3592DC3")
