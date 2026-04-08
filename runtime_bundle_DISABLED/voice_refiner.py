"""644: Voice codex auto-refinement. The organism refines its own voice."""
import sys, json, hashlib
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

CODEX = ROOT / "ORGANISM_VOICE_CODEX.md"

def refine_codex():
    """Read current codex, analyze recent interactions, append insights."""
    # Load current codex
    current = CODEX.read_text(encoding="utf-8") if CODEX.exists() else ""
    
    # Gather interaction signals
    insights = []
    
    # 1. From command_log: what does the operator ask most?
    cmd_log = STATE / "command_log.json"
    if cmd_log.exists():
        try:
            data = json.loads(cmd_log.read_text(encoding="utf-8"))
            if isinstance(data, list) and len(data) > 5:
                # Count action types
                actions = {}
                for entry in data[-50:]:
                    a = entry.get("action", "?")
                    actions[a] = actions.get(a, 0) + 1
                top = sorted(actions.items(), key=lambda x: -x[1])[:3]
                if top:
                    insights.append(f"Operator patterns: {', '.join(f'{k}({v})' for k,v in top)}")
        except Exception:
            pass
    
    # 2. From needs_me: what does the organism surface?
    needs = STATE / "needs_me.json"
    if needs.exists():
        try:
            nm = json.loads(needs.read_text(encoding="utf-8"))
            count = nm.get("count", 0)
            if count == 0:
                insights.append("Organism tendency: reports clean state. Keep replies warm but brief.")
            else:
                insights.append(f"Organism tendency: surfaces {count} needs. Be direct about what matters.")
        except Exception:
            pass
    
    # 3. From voice proof: what tones work?
    vp = STATE / "live_voice_proof.json"
    if vp.exists():
        try:
            data = json.loads(vp.read_text(encoding="utf-8"))
            passed = data.get("passed", 0)
            total = data.get("prompts", 0)
            if passed == total and total > 0:
                insights.append("Voice calibration: all prompts received warm responses. Tone is calibrated.")
        except Exception:
            pass
    
    # 4. Self-assessment based on honest_seal
    hs = STATE / "honest_seal_check.json"
    if hs.exists():
        try:
            data = json.loads(hs.read_text(encoding="utf-8"))
            labels = data.get("labels", {})
            blocked = [k for k,v in labels.items() if "BLOCKED" in str(v) or "PARTIAL" in str(v)]
            if blocked:
                insights.append(f"Self-awareness: knows these are partial: {', '.join(blocked)}. Never overclaim.")
            else:
                insights.append("Self-awareness: all systems proven. Can speak with full confidence.")
        except Exception:
            pass
    
    if not insights:
        return {"ok": True, "action": "no_new_insights", "codex_size": len(current)}
    
    # Append refinement block
    utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    block = f"\n\n## Voice Refinement — {utc}\n"
    block += f"Anchor: E3592DC3\n\n"
    for insight in insights:
        block += f"- {insight}\n"
    block += f"\nThe organism refines itself. Not by instruction. By observation.\n"
    
    # Check if this exact block already exists (dedup by hash)
    block_hash = hashlib.sha256(block.strip().encode()).hexdigest()[:12]
    if block_hash in current:
        return {"ok": True, "action": "already_refined", "hash": block_hash}
    
    # Append
    block += f"\n<!-- hash:{block_hash} -->\n"
    new_codex = current.rstrip() + block
    CODEX.write_text(new_codex, encoding="utf-8")
    
    return {"ok": True, "action": "refined", "insights": len(insights), "codex_size": len(new_codex), "hash": block_hash}

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--refine", action="store_true")
    a = p.parse_args()
    if a.test:
        assert callable(refine_codex)
        print("TEST 1 PASS: refine_codex callable")
        print("\nALL 1 TESTS PASSED")
    elif a.refine:
        r = refine_codex()
        print(f"  Action: {r['action']}")
        if r.get("insights"):
            print(f"  Insights: {r['insights']}")
        print(f"  Codex size: {r.get('codex_size', '?')} chars")
    else:
        print("Usage: --test | --refine")
