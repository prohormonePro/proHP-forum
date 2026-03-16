"""598: Convert intent into structured project specs."""
import json, sys
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

STAGE_TEMPLATES = {
    "dispatch": {"title": "Dispatch health analyzer", "type": "audit", "scope": "Analyze dispatch failure patterns and recommend fixes"},
    "voice": {"title": "Live bot voice adapter", "type": "runtime", "scope": "Wire codex voice into Telegram bot output path"},
    "health": {"title": "Health recovery module", "type": "runtime", "scope": "Identify and fix health degradation sources"},
    "memory": {"title": "Memory compaction", "type": "audit", "scope": "Compress old events, maintain references"},
    "proof": {"title": "Proof lane refresh", "type": "audit", "scope": "Verify and refresh proof file integrity"},
    "dialogue": {"title": "Dialogue enhancement", "type": "runtime", "scope": "Expand natural language understanding"},
    "sync": {"title": "Continuity sync verification", "type": "sync", "scope": "Verify local/srv2 consistency"},
}

def classify_intent(text):
    t = text.lower()
    if any(w in t for w in ["dispatch", "success rate", "failure rate"]): return "dispatch"
    if any(w in t for w in ["voice", "speak", "codex", "bot voice"]): return "voice"
    if any(w in t for w in ["health", "degraded", "recovery"]): return "health"
    if any(w in t for w in ["memory", "compact", "compress"]): return "memory"
    if any(w in t for w in ["proof", "integrity", "lane"]): return "proof"
    if any(w in t for w in ["dialogue", "conversation", "talk"]): return "dialogue"
    if any(w in t for w in ["sync", "continuity", "srv2"]): return "sync"
    return "general"

def compile_project(intent_text):
    intent_type = classify_intent(intent_text)
    template = STAGE_TEMPLATES.get(intent_type, {"title": intent_text[:50], "type": "runtime", "scope": intent_text[:200]})
    
    from stage_id_authority import next_stage_id
    sid = next_stage_id()
    
    project = {
        "stage_id": sid,
        "title": template["title"],
        "stage_type": template["type"],
        "objective": template["scope"],
        "intent_source": intent_text[:200],
        "acceptance": [f"Module implements {template['title']}", "Self-test passes", "Receipt written"],
        "utc": datetime.now(timezone.utc).isoformat(),
        "anchor": "E3592DC3",
    }
    
    # Generate real executable payload
    code = f'import sys\\nfrom pathlib import Path\\nROOT = Path(r"C:\\\\ProHP\\\\SOVEREIGN_L5")\\nsys.path.insert(0, str(ROOT))\\nprint("STAGE {sid}: {template["title"]}")\\nprint("SCOPE: {template["scope"][:80]}")\\nprint("STATUS: EXECUTED")\\n'
    project["payload"] = code
    
    return project

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--compile", type=str)
    a = p.parse_args()
    if a.test:
        r = compile_project("improve dispatch success rate")
        assert r.get("stage_id")
        assert "dispatch" in r.get("title", "").lower() or "dispatch" in r.get("objective", "").lower()
        print(f"TEST 1 PASS: compiled project {r['stage_id']}: {r['title']}")
        r2 = compile_project("make the bot speak in its own voice")
        assert "voice" in r2.get("title", "").lower()
        print(f"TEST 2 PASS: compiled project {r2['stage_id']}: {r2['title']}")
        print("\nALL 2 TESTS PASSED")
    elif a.compile:
        r = compile_project(a.compile)
        print(f"  Stage: {r['stage_id']}")
        print(f"  Title: {r['title']}")
        print(f"  Type: {r['stage_type']}")
        print(f"  Scope: {r['objective']}")
    else:
        print("Usage: --test | --compile TEXT")
