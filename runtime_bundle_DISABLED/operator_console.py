"""610: One-screen operator view of the entire organism."""
import json, sys
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

def operator_view():
    lines = ["", "  +======================================+", "  |   SOVEREIGN_L5 OPERATOR CONSOLE     |", "  +======================================+", ""]
    try:
        hs = json.loads((STATE / "health_score.json").read_text(encoding="utf-8"))
        lines.append(f"  Health: {hs.get('health_pct','?')}% {hs.get('grade','?')}")
    except Exception: lines.append("  Health: checking...")
    try:
        from stage_queue import load_queue, get_pending
        q = load_queue()
        done = sum(1 for s in q["stages"] if s["status"] == "DONE")
        pending = len(get_pending())
        blocked = sum(1 for s in q["stages"] if s["status"] == "BLOCKED")
        lines.append(f"  Queue: {done} done | {pending} pending | {blocked} blocked")
    except Exception: pass
    try:
        bc = json.loads((STATE / "builder_cycle.json").read_text(encoding="utf-8"))
        lines.append(f"  Builder: stage={bc.get('stage_id','?')} ok={bc.get('stage_ok','?')}")
    except Exception: pass
    try:
        sr = json.loads((STATE / "bidirectional_sync_receipt.json").read_text(encoding="utf-8"))
        sync_status = " ".join(f"{r['file'].split('.')[0]}={r['action']}" for r in sr.get("results", []))
        lines.append(f"  Sync: {sync_status}")
    except Exception: lines.append("  Sync: no receipt")
    try:
        fg = json.loads((STATE / "frontier_gate.json").read_text(encoding="utf-8"))
        lines.append(f"  Frontier: {fg.get('confidence','?')} {fg.get('verdict','?')}")
    except Exception: pass
    try:
        from continuity_memory import load_spine
        spine = load_spine()
        lines.append(f"  Memory: {len(json.loads((Path(r'C:\ProHP\SOVEREIGN_L5') / 'stage_manifest.json').read_text(encoding='utf-8-sig')).get('stages',[]))} stages remembered")
    except Exception: pass
    try:
        from identity_memory import load_identity
        i = load_identity()
        lines.append(f"  Voice: {i.get('name','?')}")
    except Exception: pass
    try:
        m = json.loads((ROOT / "stage_manifest.json").read_text(encoding="utf-8-sig"))
        lines.append(f"  Manifest: {len(m.get('stages',[]))} stages")
    except Exception: pass
    lines.extend(["", f"  UTC: {datetime.now(timezone.utc).strftime('%H:%M:%S')}", "  Anchor: E3592DC3", ""])
    view = "\n".join(lines)
    (STATE / "operator_console.txt").write_text(view, encoding="utf-8")
    return view

if __name__ == "__main__":
    print(operator_view())
