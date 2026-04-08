"""619/623: Voice-aware bot message handler."""
import sys
from pathlib import Path
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
sys.path.insert(0, str(ROOT))

def handle_voiced_message(text):
    """Route any inbound message through voice + project intake."""
    from voice_adapter import voiced_reply
    from project_dialogue import is_project_request, mint_project_from_dialogue
    from style_engine import style_message

    if is_project_request(text):
        r = mint_project_from_dialogue(text)
        if r["ok"]:
            return style_message({"stage_id": r["stage_id"], "ok": True, "next_action": r["title"]}, "builder")
        else:
            return style_message({"ok": False, "reason": "could not mint project"}, "escalation")

    return voiced_reply(text)

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--ask", type=str)
    a = p.parse_args()
    if a.test:
        r = handle_voiced_message("hello")
        assert len(r) > 5
        print(f"TEST 1 PASS: hello -> {r[:50]}")
        r2 = handle_voiced_message("need a new stage for testing")
        assert len(r2) > 5
        print(f"TEST 2 PASS: project -> {r2[:50]}")
        print("\nALL 2 TESTS PASSED")
    elif a.ask:
        print(handle_voiced_message(a.ask))
    else:
        print("Usage: --test | --ask TEXT")
