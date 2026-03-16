"""702: Make the bot self-restarting. Windows scheduled task checks every 5 min."""
import sys, subprocess, os
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
STATE = ROOT / "state"
STATE.mkdir(parents=True, exist_ok=True)

VENV_PY = str(ROOT / ".venv" / "Scripts" / "python.exe")
BRIDGE = str(ROOT / "telegram_bridge.py")
LOG = STATE / "bot_watchdog.log"

def is_bot_running():
    """Check if telegram_bridge is running under venv python."""
    try:
        r = subprocess.run(
            ["wmic", "process", "where", "name='python.exe'", "get", "commandline"],
            capture_output=True, text=True, timeout=10
        )
        lines = r.stdout.strip().split("\n")
        for line in lines:
            if "telegram_bridge.py" in line and ".venv" in line:
                return True
    except Exception:
        pass
    return False

def restart_bot():
    """Start bot process."""
    subprocess.Popen(
        [VENV_PY, BRIDGE],
        cwd=str(ROOT),
        creationflags=0x00000008,  # DETACHED_PROCESS
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

def log(msg):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(ts + " " + msg + "\n")
    print("  " + msg)

if __name__ == "__main__":
    if is_bot_running():
        log("BOT_ALIVE: no action needed")
    else:
        log("BOT_DEAD: restarting...")
        restart_bot()
        import time; time.sleep(3)
        if is_bot_running():
            log("BOT_RESTARTED: success")
        else:
            log("BOT_RESTART_FAILED: manual intervention needed")
