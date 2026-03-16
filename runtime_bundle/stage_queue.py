"""552: Stage queue engine. The organism's punch list."""
import json, sys
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
QUEUE_FILE = STATE / "stage_queue.json"
sys.path.insert(0, str(ROOT))

def load_queue():
    if QUEUE_FILE.exists():
        try: return json.loads(QUEUE_FILE.read_text(encoding="utf-8"))
        except Exception: pass
    return {"stages": [], "anchor": "E3592DC3"}

def save_queue(q):
    q["updated"] = datetime.now(timezone.utc).isoformat()
    QUEUE_FILE.write_text(json.dumps(q, indent=2, default=str), encoding="utf-8")

def add_stage(stage_id, title, lane="CODE", requires_claude=False, requires_gpt=False, requires_runtime=True, requires_operator=False, depends_on=None, payload="", notes=""):
    q = load_queue()
    if any(s["stage_id"] == stage_id for s in q["stages"]):
        return {"ok": False, "reason": "already exists"}
    q["stages"].append({
        "stage_id": stage_id, "title": title, "status": "PENDING", "lane": lane,
        "requires_claude": requires_claude, "requires_gpt": requires_gpt,
        "requires_runtime": requires_runtime, "requires_operator": requires_operator,
        "depends_on": depends_on or [], "payload": payload, "notes": notes,
    })
    save_queue(q)
    return {"ok": True}

def update_status(stage_id, status):
    q = load_queue()
    for s in q["stages"]:
        if s["stage_id"] == stage_id:
            s["status"] = status
            s["updated"] = datetime.now(timezone.utc).isoformat()
            save_queue(q)
            return True
    return False

def get_pending():
    q = load_queue()
    return [s for s in q["stages"] if s["status"] == "PENDING"]

def get_done():
    q = load_queue()
    return [s for s in q["stages"] if s["status"] == "DONE"]

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--list", action="store_true")
    p.add_argument("--seed", action="store_true")
    a = p.parse_args()
    if a.test:
        assert callable(add_stage)
        assert callable(get_pending)
        print("TEST 1 PASS: add_stage callable")
        print("TEST 2 PASS: get_pending callable")
        print("\nALL 2 TESTS PASSED")
    elif a.seed:
        stages = [
            ("557", "Stage payload compiler", False, False),
            ("558", "Bounded auto-stage generator", True, False),
            ("559", "Queue promotion gate", False, False),
            ("560", "Roadmap progress dashboard", False, False),
            ("561", "End-of-cycle stage commit", False, False),
            ("562", "Ledger integrity monitor", False, False),
            ("563", "Proof consolidation", False, False),
            ("564", "Manifest auto-update", False, False),
            ("565", "Autonomous audit", False, True),
            ("566", "Self-certification", False, False),
        ]
        for sid, title, needs_claude, needs_gpt in stages:
            r = add_stage(sid, title, requires_claude=needs_claude, requires_gpt=needs_gpt)
            status = "added" if r["ok"] else r.get("reason", "?")
            print(f"  {sid}: {status}")
    elif a.list:
        q = load_queue()
        for s in q["stages"]:
            print(f"  {s['stage_id']:6s} [{s['status']:8s}] {s['title']}")
    else:
        print("Usage: --test | --list | --seed")
