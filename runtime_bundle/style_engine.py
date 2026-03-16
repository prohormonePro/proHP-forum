import json, sys
from pathlib import Path
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")

def style_message(raw_data, mode="auto"):
    if mode != "auto":
        return _render(raw_data, mode)
    if isinstance(raw_data, dict):
        if raw_data.get("status") == "CRITICAL" or raw_data.get("escalations", 0) > 0:
            return _render(raw_data, "urgent")
        if not raw_data.get("ok", True):
            return _render(raw_data, "escalation")
        if raw_data.get("stage_id") and raw_data.get("next_action"):
            return _render(raw_data, "builder")
        if raw_data.get("needs_count", 0) > 0:
            return _render(raw_data, "reflective")
    return _render(raw_data, "operational")

def _render(d, mode):
    renderers = {"operational": _operational, "reflective": _reflective, "urgent": _urgent,
                 "companion": _companion, "builder": _builder, "escalation": _escalation}
    return renderers.get(mode, _operational)(d)

def _operational(d):
    if not isinstance(d, dict): return str(d)
    parts = []
    if "health_pct" in d: parts.append(f"Health: {d['health_pct']}%")
    if "monitor" in d: parts.append(f"Status: {d['monitor']}")
    if "stage_id" in d: parts.append(f"Stage: {d['stage_id']}")
    if "all_ok" in d: parts.append("All OK" if d["all_ok"] else "Issues found")
    return ". ".join(parts) + "." if parts else str(d)

def _reflective(d):
    if not isinstance(d, dict): return str(d)
    if d.get("needs_count", 0) > 0:
        count = d["needs_count"]
        return f"There's {count} thing(s) worth looking at. Nothing urgent, but honest."
    return "Everything checks out. No recommendations right now."

def _urgent(d):
    if not isinstance(d, dict): return f"Alert: {d}"
    if d.get("escalations", 0) > 0:
        return f"Escalation active. {d['escalations']} issue(s) need you now."
    return f"Alert: {d.get('reason', 'check organism state')}."

def _companion(d):
    if not isinstance(d, dict): return str(d)
    if d.get("clean") or d.get("all_ok"):
        return "Everything's running. Nothing needs you right now. I've got this."
    return "Mostly good. One or two things to check when you have a moment."

def _builder(d):
    if not isinstance(d, dict): return str(d)
    sid = d.get("stage_id", "?")
    ok = d.get("ok", d.get("stage_ok", False))
    action = d.get("next_action", d.get("reconcile", "?"))
    status = "DONE" if ok else "BLOCKED"
    return f"Stage {sid}: {status}. Next: {action}."

def _escalation(d):
    if not isinstance(d, dict): return f"I need help: {d}"
    reason = d.get("reason", d.get("error", "unknown issue"))
    return f"I can't fix this alone. {reason}. Need you."

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    a = p.parse_args()
    if a.test:
        r = style_message({"health_pct": 100, "all_ok": True}, "operational")
        assert "100%" in r, f"operational failed: {r}"
        print(f"TEST 1 PASS: operational: {r}")
        r = style_message({"clean": True}, "companion")
        assert "got this" in r.lower(), f"companion failed: {r}"
        print(f"TEST 2 PASS: companion: {r}")
        r = style_message({"escalations": 2}, "urgent")
        assert "need" in r.lower(), f"urgent failed: {r}"
        print(f"TEST 3 PASS: urgent: {r}")
        r = style_message({"stage_id": "570", "ok": True, "next_action": "PROMOTE"}, "builder")
        assert "570" in r, f"builder failed: {r}"
        print(f"TEST 4 PASS: builder: {r}")
        r = style_message({"ok": False, "reason": "daemon crashed"}, "escalation")
        assert "daemon" in r.lower(), f"escalation failed: {r}"
        print(f"TEST 5 PASS: escalation: {r}")
        r = style_message({"needs_count": 2}, "reflective")
        assert "2" in r, f"reflective failed: {r}"
        print(f"TEST 6 PASS: reflective: {r}")
        print("\nALL 6 TESTS PASSED")
    else:
        print("Usage: --test")
