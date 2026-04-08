# === STAGE_2079: git revert command ===
# Insert into the command dispatch section of handle_operator_message()
# after the existing "deploy next stage" / "dispatch" block

def _handle_revert_command(text, chat_id):
    """
    Operator sends: revert <stage_id>
    Camden reverts HEAD on srv2, restarts backend, reports result.
    """
    import subprocess, re as _rv_re
    from datetime import datetime, timezone as _rv_tz

    parts = text.strip().split(None, 1)
    if len(parts) < 2 or not parts[1].strip():
        return "Usage: `revert <stage_id>`\nExample: `revert 2074`"

    stage_id = parts[1].strip()
    # Sanitize: alphanumeric + underscore only
    if not _rv_re.match(r'^[\w]+$', stage_id):
        return f"Invalid stage_id: `{stage_id}`. Alphanumeric and underscores only."

    log_lines = []
    utc_now = datetime.now(_rv_tz.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    log_lines.append(f"REVERT started: {stage_id} at {utc_now}")

    # Step 1: verify HEAD commit mentions the stage
    try:
        check_cmd = (
            'cd /home/travisd/prohp-forum && '
            'git log -1 --oneline HEAD'
        )
        check_r = subprocess.run(
            ["ssh", "travisd@107.152.45.184", check_cmd],
            capture_output=True, text=True, timeout=30
        )
        head_msg = (check_r.stdout or "").strip()
        log_lines.append(f"HEAD: {head_msg}")

        if check_r.returncode != 0:
            return f"Failed to read HEAD on srv2:\n