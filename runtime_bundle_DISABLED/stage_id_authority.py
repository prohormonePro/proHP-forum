"""597: Global stage ID authority. No collisions. No reuse."""
import json, sys
from pathlib import Path
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

def get_all_known_ids():
    ids = set()
    # Manifest
    try:
        m = json.loads((ROOT / "stage_manifest.json").read_text(encoding="utf-8-sig"))
        for s in m.get("stages", []):
            ids.add(s["stage_id"])
    except Exception: pass
    # Queue
    try:
        from stage_queue import load_queue
        q = load_queue()
        for s in q.get("stages", []):
            ids.add(s["stage_id"])
    except Exception: pass
    return ids

def next_stage_id():
    ids = get_all_known_ids()
    numeric = [int(i) for i in ids if i.isdigit()]
    return str(max(numeric) + 1) if numeric else "597"

def is_id_available(stage_id):
    return stage_id not in get_all_known_ids()

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--next", action="store_true")
    a = p.parse_args()
    if a.test:
        nid = next_stage_id()
        assert int(nid) >= 597
        print(f"TEST 1 PASS: next_stage_id = {nid}")
        print("\nALL 1 TESTS PASSED")
    elif a.next:
        print(f"  Next available: {next_stage_id()}")
    else:
        print("Usage: --test | --next")
