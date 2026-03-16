"""647: SSH authority module. Every ssh/scp call goes through here."""
import subprocess, json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
SRV2 = "travisd@107.152.45.184"
REMOTE = "/home/travisd/prohp-forum"

# Resolve SSH key dynamically
SSH_KEY = None
for p in [
    Path.home() / ".ssh" / "id_ed25519_prohp_swarm",
    Path(r"C:\Users\Travis\.ssh\id_ed25519_prohp_swarm"),
    Path(r"C:\Users\Travi\.ssh\id_ed25519_prohp_swarm"),
]:
    if p.exists():
        SSH_KEY = str(p)
        break

def _ssh_base():
    """Return base SSH args with key."""
    args = ["ssh", "-o", "BatchMode=yes", "-o", "ConnectTimeout=10"]
    if SSH_KEY:
        args.extend(["-i", SSH_KEY])
    args.append(SRV2)
    return args

def _scp_base():
    """Return base SCP args with key."""
    args = ["scp", "-o", "BatchMode=yes"]
    if SSH_KEY:
        args.extend(["-i", SSH_KEY])
    return args

def ssh_run(cmd, timeout=30):
    """Run SSH command on srv2. Returns structured result."""
    try:
        full = _ssh_base() + [cmd]
        r = subprocess.run(full, capture_output=True, text=True, timeout=timeout)
        return {"ok": r.returncode == 0, "stdout": (r.stdout or "").strip(), "stderr": (r.stderr or "").strip()[:300]}
    except Exception as e:
        return {"ok": False, "stdout": "", "stderr": str(e)[:200]}

def scp_push(local_path, remote_path, timeout=30):
    """Push file to srv2 via SCP. Returns structured result."""
    try:
        full = _scp_base() + [str(local_path), f"{SRV2}:{remote_path}"]
        r = subprocess.run(full, capture_output=True, text=True, timeout=timeout)
        return {"ok": r.returncode == 0, "stderr": (r.stderr or "").strip()[:200]}
    except Exception as e:
        return {"ok": False, "stderr": str(e)[:200]}

def scp_pull(remote_path, local_path, timeout=30):
    """Pull file from srv2 via SCP. Returns structured result."""
    try:
        full = _scp_base() + [f"{SRV2}:{remote_path}", str(local_path)]
        r = subprocess.run(full, capture_output=True, text=True, timeout=timeout)
        return {"ok": r.returncode == 0, "stderr": (r.stderr or "").strip()[:200]}
    except Exception as e:
        return {"ok": False, "stderr": str(e)[:200]}

def probe():
    """Test SSH connectivity. Returns structured result."""
    r = ssh_run("echo SSH_OK")
    return {
        "ok": r["ok"] and "SSH_OK" in r["stdout"],
        "key": SSH_KEY,
        "stdout": r["stdout"],
        "stderr": r["stderr"],
    }

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--probe", action="store_true")
    p.add_argument("--test", action="store_true")
    a = p.parse_args()
    if a.test:
        assert SSH_KEY and Path(SSH_KEY).exists(), f"No SSH key found"
        print(f"TEST 1 PASS: key={SSH_KEY}")
        assert callable(ssh_run)
        print("TEST 2 PASS: ssh_run callable")
        assert callable(scp_push)
        print("TEST 3 PASS: scp_push callable")
        print("\nALL 3 TESTS PASSED")
    elif a.probe:
        r = probe()
        print(f"  Key: {r['key']}")
        print(f"  OK: {r['ok']}")
        if r["stderr"]:
            print(f"  Error: {r['stderr']}")
    else:
        print("Usage: --test | --probe")
