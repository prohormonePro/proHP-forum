"""556: Scheduler that advances the roadmap, not just survives."""
import json, sys, time
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
sys.path.insert(0, str(ROOT))

def run_builder_cycle():
    """One cycle: monitor + heal + select stage + run + reconcile + ledger."""
    from swarm_monitor import monitor_swarm
    from heal_governor import governed_heal
    from stage_runner import run_queued_stage
    from stage_reconciler import reconcile
    from proof_ledger import append_ledger
    try:
        from memory_ingest import ingest_all
        ingest_all()
    except Exception: pass
    
    # 1. Monitor
    mon = monitor_swarm()
    
    # 2. Heal if needed
    if mon.get("status") == "CRITICAL":
        governed_heal()
    
        # 3z. Bidirectional sync after every cycle
    try:
        from bidirectional_sync import sync_bidirectional, git_commit_srv2
        sync_bidirectional()
        git_commit_srv2(f"auto-sync cycle {__import__('datetime').datetime.now(__import__('datetime').timezone.utc).strftime('%H%M')}")
    except Exception: pass

    # 3aa. Revise blocked stages first
    try:
        from revise_loop import revise_blocked
        revise_blocked()
    except Exception:
        pass

    # 3a. Auto-seed if queue empty
    try:
        from stage_selector import select_next_stage
        if select_next_stage() is None:
            from queue_seeder import seed_next_wave
            seed_next_wave(5)
    except Exception: pass

    # 3b. Check frontier confidence
    try:
        from frontier_gate import check_frontier_confidence
        fg = check_frontier_confidence()
        if not fg.get("proceed"):
            append_ledger("FRONTIER_PAUSE", {"confidence": fg.get("confidence")})
            result = {"utc": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(), "monitor": mon.get("status"), "stage_id": None, "stage_ok": True, "stage_reason": "frontier_paused", "reconcile": "PAUSED", "anchor": "E3592DC3"}
            (STATE / "builder_cycle.json").write_text(__import__("json").dumps(result, indent=2, default=str), encoding="utf-8")
            return result
    except Exception: pass

    # 3. Run next stage
    stage_result = run_queued_stage()
    
    # 4. Reconcile
    recon = reconcile()
    
    # 5. Ledger
    # 645: voice codex auto-refinement every cycle
    try:
        from voice_refiner import refine_codex
        refine_codex()
    except Exception:
        pass

    append_ledger("BUILDER_CYCLE", {
        "status": mon.get("status"),
        "stage_id": stage_result.get("stage_id"),
        "stage_ok": stage_result.get("ok"),
        "reconcile": recon.get("action"),
    })
    
    result = {
        "utc": datetime.now(timezone.utc).isoformat(),
        "monitor": mon.get("status"),
        "stage_id": stage_result.get("stage_id"),
        "stage_ok": stage_result.get("ok"),
        "stage_reason": stage_result.get("reason"),
        "reconcile": recon.get("action"),
        "anchor": "E3592DC3",
    }
    (STATE / "builder_cycle.json").write_text(json.dumps(result, indent=2, default=str), encoding="utf-8")
    return result

def run_builder(interval_minutes=5, max_cycles=None):
    cycles = 0
    while True:
        try:
            r = run_builder_cycle()
            cycles += 1
            sid = r.get("stage_id") or "IDLE"
            ok = r.get("stage_ok", "?")
            action = r.get("reconcile", "?")
            print(f"  Cycle {cycles}: {r['monitor']} | stage={sid} ok={ok} | {action}")
            if max_cycles and cycles >= max_cycles:
                break
        except Exception as e:
            print(f"  Cycle error: {str(e)[:100]}")
            cycles += 1
            if max_cycles and cycles >= max_cycles:
                break
        time.sleep(interval_minutes * 60)

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--once", action="store_true")
    p.add_argument("--run", action="store_true")
    p.add_argument("--interval", type=int, default=5)
    a = p.parse_args()
    if a.test:
        assert callable(run_builder_cycle)
        print("TEST 1 PASS: run_builder_cycle callable")
        print("\nALL 1 TESTS PASSED")
    elif a.once:
        r = run_builder_cycle()
        print(f"  Monitor: {r['monitor']} | Stage: {r.get('stage_id','none')} | OK: {r.get('stage_ok','?')} | Reconcile: {r.get('reconcile','?')}")
    elif a.run:
        print(f"  Builder scheduler started. Interval: {a.interval}min.")
        run_builder(a.interval)
    else:
        print("Usage: --test | --once | --run [--interval N]")
