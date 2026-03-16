"""618: Turn human requests into real queued project stages."""
import json, sys
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

PROJECT_TRIGGERS = ["need a new stage", "new project", "build this", "start a project", "create a stage", "run this idea"]

def is_project_request(text):
    t = text.lower().strip()
    return any(trigger in t for trigger in PROJECT_TRIGGERS)

def mint_project_from_dialogue(text):
    from project_intake import classify_intent, compile_project
    from stage_queue import add_stage
    from stage_id_authority import next_stage_id

    project = compile_project(text)
    sid = next_stage_id()
    project["stage_id"] = sid

    # Write payload
    (STATE / f"payload_{sid}.json").write_text(json.dumps(project, indent=2, default=str), encoding="utf-8")

    # Add to queue
    r = add_stage(sid, project["title"], notes=project.get("objective", ""))

    return {
        "ok": r.get("ok", False),
        "stage_id": sid,
        "title": project["title"],
        "type": project.get("stage_type", "runtime"),
        "objective": project.get("objective", ""),
    }

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--mint", type=str)
    a = p.parse_args()
    if a.test:
        assert is_project_request("need a new stage for dispatch health")
        print("TEST 1 PASS: project request detected")
        assert not is_project_request("hello how are you")
        print("TEST 2 PASS: non-project correctly rejected")
        print("\nALL 2 TESTS PASSED")
    elif a.mint:
        r = mint_project_from_dialogue(a.mint)
        print(f"  Stage: {r['stage_id']}")
        print(f"  Title: {r['title']}")
        print(f"  Type: {r['type']}")
        print(f"  OK: {r['ok']}")
    else:
        print("Usage: --test | --mint TEXT")
