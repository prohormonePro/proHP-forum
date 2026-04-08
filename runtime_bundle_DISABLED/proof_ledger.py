"""549: Append-only proof ledger. Every significant event gets a line."""
import json, sys, hashlib
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
LEDGER = STATE / "proof_ledger.jsonl"

def append_ledger(event_type, data):
    """Append one proof entry to the ledger."""
    entry = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "type": event_type,
        "data": data,
        "anchor": "E3592DC3",
    }
    line = json.dumps(entry, default=str)
    entry["hash"] = hashlib.sha256(line.encode()).hexdigest()[:16]
    final_line = json.dumps(entry, default=str)
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(final_line + "\n")
    return entry

def read_ledger(last_n=10):
    """Read last N entries."""
    if not LEDGER.exists():
        return []
    lines = LEDGER.read_text(encoding="utf-8").strip().split("\n")
    return [json.loads(l) for l in lines[-last_n:]]

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--tail", type=int, default=5)
    p.add_argument("--show", action="store_true")
    a = p.parse_args()
    if a.test:
        e = append_ledger("TEST", {"msg": "ledger works"})
        assert e.get("hash")
        print(f"TEST 1 PASS: append works, hash={e['hash']}")
        entries = read_ledger(1)
        assert len(entries) >= 1
        print("TEST 2 PASS: read works")
        print("\nALL 2 TESTS PASSED")
    elif a.show:
        for e in read_ledger(a.tail):
            print(f"  {e['utc'][:19]} [{e['type']}] {e.get('hash','?')[:8]}")
    else:
        print("Usage: --test | --show")
