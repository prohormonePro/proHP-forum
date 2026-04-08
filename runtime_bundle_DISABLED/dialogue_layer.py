"""579: Handle human-language dialogue, not just commands."""
import sys
from pathlib import Path
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
sys.path.insert(0, str(ROOT))

DIALOGUE_MAP = {
    "how are you": ("companion", "health"),
    "what needs me": ("reflective", "needs"),
    "what happened": ("reflective", "status"),
    "should i worry": ("companion", "needs"),
    "what are you thinking": ("reflective", "reflect"),
    "good morning": ("companion", None),
    "good night": ("companion", None),
    "thanks": ("companion", None),
    "help": ("operational", None),
}

def handle_dialogue(text):
    """Route human language to voice mode + optional command."""
    t = text.lower().strip()
    
    # Check dialogue patterns first
    for pattern, (mode, cmd) in DIALOGUE_MAP.items():
        if pattern in t:
            return {"mode": mode, "command": cmd, "matched": pattern}
    
    # Fall back to NL router for commands
    try:
        from nl_router import route_nl
        cmd = route_nl(t)
        if cmd:
            return {"mode": "operational", "command": cmd, "matched": "nl_router"}
    except Exception: pass
    
    # Unknown — companion mode, no command
    return {"mode": "companion", "command": None, "matched": None}

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--ask", type=str)
    a = p.parse_args()
    if a.test:
        r = handle_dialogue("how are you doing")
        assert r["mode"] == "companion" and r["command"] == "health"
        print(f"TEST 1 PASS: how are you -> {r}")
        r = handle_dialogue("what needs me")
        assert r["command"] == "needs"
        print(f"TEST 2 PASS: what needs me -> {r}")
        r = handle_dialogue("fix daemon")
        assert r["command"] == "daemon"
        print(f"TEST 3 PASS: fix daemon -> {r}")
        r = handle_dialogue("xyzzy gibberish")
        assert r["mode"] == "companion"
        print(f"TEST 4 PASS: unknown -> companion")
        print("\nALL 4 TESTS PASSED")
    elif a.ask:
        r = handle_dialogue(a.ask)
        print(f"  Mode: {r['mode']} | Command: {r['command']} | Matched: {r['matched']}")
    else:
        print("Usage: --test | --ask TEXT")
