"""719: Reusable forum DB query helper. Uses proven PGPASSWORD method."""
import sys, json
from pathlib import Path
ROOT = Path(r"C:\ProHP\SOVEREIGN_L5")
sys.path.insert(0, str(ROOT))
from ssh_authority import ssh_run

def forum_sql(query):
    """Run SQL on forum DB via SSH. Returns string result or None."""
    r = ssh_run(
        'PGPASSWORD=$(grep DB_PASSWORD /home/travisd/prohp-forum/backend/.env 2>/dev/null | cut -d= -f2) '
        'psql -U prohp -d prohp_forum -h 127.0.0.1 -t -A -c "' + query.replace('"', '\\"') + '" 2>&1'
    )
    if isinstance(r, dict):
        out = (r.get("stdout", "") or "").strip()
        if r.get("ok") and out:
            return out
        return None
    return None

def forum_sql_rows(query):
    """Run SQL, return list of pipe-delimited rows."""
    r = ssh_run(
        'PGPASSWORD=$(grep DB_PASSWORD /home/travisd/prohp-forum/backend/.env 2>/dev/null | cut -d= -f2) '
        'psql -U prohp -d prohp_forum -h 127.0.0.1 -t -A -F "|" -c "' + query.replace('"', '\\"') + '" 2>&1'
    )
    if isinstance(r, dict) and r.get("ok"):
        out = (r.get("stdout", "") or "").strip()
        if out:
            return [line for line in out.split("\n") if line.strip()]
    return []

def forum_api(path, port=4000):
    """Hit forum API endpoint. Returns response body or None."""
    r = ssh_run("curl -s http://localhost:{}{} 2>/dev/null".format(port, path))
    if isinstance(r, dict) and r.get("ok"):
        return (r.get("stdout", "") or "").strip()
    return None

if __name__ == "__main__":
    # Self-test
    count = forum_sql("SELECT COUNT(*) FROM compounds")
    print("  Compounds: " + str(count))
    rows = forum_sql_rows("SELECT id, name FROM compounds LIMIT 3")
    print("  Sample: " + str(rows[:3]))
    health = forum_api("/api/health")
    print("  API health: " + str(health)[:100])
    print("  Anchor: E3592DC3")
