"""717: After every trio push, drop a pull-request flag on srv2.
G14 scheduled task picks it up and pulls. travisHP checks receipt."""
import sys, json
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
STATE.mkdir(parents=True, exist_ok=True)
sys.path.insert(0, str(ROOT))
from ssh_authority import ssh_run, scp_push

def run(cmd):
    r = ssh_run(cmd)
    return r if isinstance(r, dict) else {"ok": False, "stdout": str(r), "stderr": ""}

# Write pull-request flag to srv2
flag = {
    "utc": datetime.now(timezone.utc).isoformat(),
    "source": "travisHP",
    "action": "PULL_REQUESTED",
    "anchor": "E3592DC3",
}
flag_path = STATE / "g14_pull_request.json"
flag_path.write_text(json.dumps(flag, indent=2), encoding="utf-8")

# Push flag to srv2
r = run("mkdir -p /home/travisd/prohp-forum/node_receipts")
scp_push(str(flag_path), "/home/travisd/prohp-forum/node_receipts/g14_pull_request.json")
print("  Pull-request flag pushed to srv2")

# Also: check if G14 has a recent receipt (from last pull)
r2 = run("cat /home/travisd/prohp-forum/node_receipts/g14_node_status_receipt.json 2>/dev/null")
g14_receipt = None
if r2.get("ok") and r2.get("stdout"):
    try: g14_receipt = json.loads(r2["stdout"])
    except Exception: pass

if g14_receipt:
    g14_utc = g14_receipt.get("utc", "UNKNOWN")
    g14_total = g14_receipt.get("manifest_total", "?")
    print("  G14 last receipt: " + g14_utc + " | stages: " + str(g14_total))
else:
    print("  G14 receipt: NOT FOUND on srv2")

# Write close gate
local_m = json.loads((ROOT / "stage_manifest.json").read_text(encoding="utf-8-sig"))
local_total = len(local_m.get("stages", []))

g14_match = g14_receipt and g14_receipt.get("manifest_total") == local_total
gate = {
    "utc": datetime.now(timezone.utc).isoformat(),
    "travisHP_stages": local_total,
    "g14_stages": g14_receipt.get("manifest_total") if g14_receipt else None,
    "g14_match": g14_match,
    "verdict": "THREE_NODE_CLOSED" if g14_match else "G14_PENDING",
    "anchor": "E3592DC3",
}
(STATE / "three_node_close_gate.json").write_text(json.dumps(gate, indent=2, default=str), encoding="utf-8")
print("  Close gate: " + gate["verdict"])
print("  Anchor: E3592DC3")
