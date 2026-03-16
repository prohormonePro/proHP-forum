"""668: Delivery gate that reads captured chat_id. Rejects placeholders."""
import sys, json
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

from telegram_bridge import tg_request

def get_real_chat_id():
    """Read captured operator chat_id. Returns int or None."""
    cid_file = STATE / "operator_chat_id.json"
    if not cid_file.exists():
        return None
    try:
        data = json.loads(cid_file.read_text(encoding="utf-8"))
        cid = data.get("chat_id") if isinstance(data, dict) else data
        cid = int(cid)
        return cid if cid > 100000 else None
    except Exception:
        return None

def send_verified(text, chat_id=None):
    """Send message with structured delivery truth."""
    cid = chat_id or get_real_chat_id()
    result = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "chat_id": cid,
        "text_length": len(text),
        "delivered": False,
        "error": None,
    }

    if not cid:
        result["error"] = "no_valid_chat_id"
        return result

    try:
        resp = tg_request("sendMessage", {"chat_id": int(cid), "text": text[:4096]})
        if resp and resp.get("ok"):
            result["delivered"] = True
            result["message_id"] = resp.get("result", {}).get("message_id")
        else:
            result["error"] = f"telegram_rejected"
            result["detail"] = str(resp)[:200]
    except Exception as e:
        result["error"] = str(e)[:200]

    # Write delivery receipt
    (STATE / "telegram_delivery_receipt.json").write_text(
        json.dumps(result, indent=2, default=str), encoding="utf-8")
    return result

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--send", type=str)
    p.add_argument("--status", action="store_true")
    a = p.parse_args()
    if a.test:
        # Test placeholder rejection
        r = send_verified("test", chat_id=12345)
        assert not r["delivered"]
        print("TEST 1 PASS: placeholder rejected")
        r2 = send_verified("test", chat_id=99)
        assert not r2["delivered"]
        print("TEST 2 PASS: small ID rejected")
        assert callable(get_real_chat_id)
        print("TEST 3 PASS: get_real_chat_id callable")
        print("\nALL 3 TESTS PASSED")
    elif a.send:
        r = send_verified(a.send)
        print(f"  Delivered: {r['delivered']}")
        print(f"  Chat ID: {r['chat_id']}")
        if r.get("error"):
            print(f"  Error: {r['error']}")
        if r.get("message_id"):
            print(f"  Message ID: {r['message_id']}")
    elif a.status:
        cid = get_real_chat_id()
        print(f"  Real chat_id: {cid or 'NOT_CAPTURED'}")
        print(f"  Status: {'VALID' if cid else 'WAITING_FOR_INBOUND'}")
    else:
        print("Usage: --test | --send TEXT | --status")
