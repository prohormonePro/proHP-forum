"""675: Updated honest seal — checks trio mirror + G14 receipt + delivery."""
import sys, json
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

def honest_seal_check():
    checks = {}

    # 1. Telegram delivery
    from delivery_gate import get_real_chat_id
    checks["telegram_chat_id"] = get_real_chat_id() is not None

    # 2. Surface sync (trio mirror)
    sv = STATE / "surface_verification.json"
    if sv.exists():
        data = json.loads(sv.read_text(encoding="utf-8"))
        checks["surfaces_unified"] = data.get("verdict") == "TRIO_UNIFIED"
    else:
        checks["surfaces_unified"] = False

    # 3. Voice proof
    checks["voice_proven"] = (STATE / "live_voice_proof.json").exists()

    # 4. G14 current
    g14 = STATE / "g14_pull_receipt.json"
    if g14.exists():
        data = json.loads(g14.read_text(encoding="utf-8"))
        checks["g14_current"] = data.get("verdict") == "G14_TRIO_UNIFIED"
    else:
        checks["g14_current"] = False

    # 5. Bot reentry
    gate = STATE / "bot_reentry_gate.json"
    if gate.exists():
        data = json.loads(gate.read_text(encoding="utf-8"))
        checks["bot_ready"] = data.get("all_pass", False)
    else:
        checks["bot_ready"] = False

    labels = {}
    labels["live_delivery"] = "PROVEN" if checks.get("telegram_chat_id") else "BLOCKED (chat_id not captured)"
    labels["surface_sync"] = "TRIO_UNIFIED" if checks.get("surfaces_unified") else "PARTIAL"
    labels["voice"] = "WIRED + DRY_PROVEN" if checks.get("voice_proven") else "NOT_PROVEN"
    labels["g14_sync"] = "G14_TRIO_UNIFIED" if checks.get("g14_current") else "STALE"
    labels["bot_status"] = "BOT_READY" if checks.get("bot_ready") else "BLOCKED"

    result = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "checks": checks,
        "labels": labels,
        "fully_honest": all(checks.values()),
        "anchor": "E3592DC3",
    }
    (STATE / "honest_seal_check.json").write_text(json.dumps(result, indent=2, default=str), encoding="utf-8")
    return result

if __name__ == "__main__":
    r = honest_seal_check()
    print(f"\n  HONEST SEAL STATUS")
    print(f"  ==================\n")
    for k, v in r["labels"].items():
        print(f"  {k:20s}: {v}")
    print(f"\n  Fully honest: {r['fully_honest']}")
    print(f"  Anchor: E3592DC3")
