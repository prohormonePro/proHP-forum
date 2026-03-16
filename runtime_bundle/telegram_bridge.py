"""
SOVEREIGN_L5 Telegram Bridge - Stage 218 (Crown v2)
Full lifecycle: mint -> approve -> dispatch -> verify -> seal
Every reply tells you the exact next command.
Bot: t.me/L7_ProHP_Bot
"""

import json
import re
import sys
import time
import os
import subprocess
import urllib.request
import urllib.error
from pathlib import Path

# STAGE_226: phase feed for live dispatch updates
try:
    import phase_feed as pf
    PHASE_FEED = True
except ImportError:
    PHASE_FEED = False
    pf = None
from datetime import datetime, timezone

BASE = Path(__file__).parent
PY = str(BASE / ".venv" / "Scripts" / "python.exe")
sys.path.insert(0, str(BASE))

BOT_TOKEN = os.environ.get("SOVEREIGN_TELEGRAM_TOKEN", "8368903740:AAGACSeBpK3LNuTYAKXJ96obnUzOeeSt7ks")
API_BASE = "https://api.telegram.org/bot" + BOT_TOKEN

OPERATOR_CHAT_FILE = BASE / "state" / "telegram_chat_id.json"
COMMAND_LOG = BASE / "state" / "telegram_command_log.json"
CLARIFICATION_STATE = BASE / "state" / "telegram_clarification.json"
QUEUE_FILE = BASE / "state" / "task_queue.json"
MANIFEST_FILE = BASE / "stage_manifest.json"

KNOWN_MISSIONS = [
    "forum_patch_sprint",
    "overnight_autonomy_push",
    "verification_only",
    "cheap_ring_build",
    "opus_builder_mode",
    "recon_sweep",
]

# --- Crown lifecycle imports ---
try:
    from dialogue_manager import (
        handle_mint_command,
        handle_mint_force,
        handle_approve_command,
        handle_override_command,
        handle_dispatch_command,
        handle_verify_command,
        handle_seal_command,
        handle_queue_command,
        handle_status_command,
        handle_preflight_command,
        handle_drop_command,
    )
    CROWN_MINT = True
except ImportError as _cm_err:
    CROWN_MINT = False
    print("[WARN] Crown mint not available: " + str(_cm_err))

# --- Optional voice engine ---
try:
    from voice_engine import (
        speak_status, speak_queue, speak_digest, speak_switched,
        speak_seal_ready, speak_action, speak_blocked, speak_warning,
    )
    VOICE = True
except ImportError:
    VOICE = False

# --- Optional sovereign mind ---
try:
    from sovereign_mind import (
        process_message as mind_process, record_response as _mind_record,
        render_queue_truth, record_turn, get_learning_summary,
    )
    MIND = True
except ImportError:
    MIND = False

# --- Optional truth modules ---
try:
    import operator_truth
except ImportError:
    pass

try:
    from queue_truth import format_queue
except ImportError:
    def format_queue():
        return "Queue truth module not loaded."

# --- NL route keywords ---
NL_ROUTES = {
    "status": ["status", "how are you", "what's up", "report", "state", "how's it going", "sup"],
    "queue": ["queue", "tasks", "pending", "what's queued", "what's waiting"],
    "digest": ["digest", "morning", "summary", "overnight", "what happened"],
    "help": ["help", "commands", "what can you do"],
    "identity": ["what are you", "who are you"],
    "autonomy": ["is it autonomous", "are you autonomous", "is the swarm autonomous", "autonomous"],
    "use claude": ["use claude", "claude mode", "premium", "switch claude", "switch to claude"],
    "use deepseek": ["use deepseek", "deepseek mode", "cheap", "switch deepseek", "switch to deepseek"],
    "run forum": ["run forum", "forum sprint", "ship forum", "forum work", "build forum"],
    "run overnight": ["run overnight", "overnight push", "overnight autonomy", "cheap ring"],
    "seal ready": ["seal ready", "what's sealable", "commit ready"],
    "commit pending": ["commit", "pending commits", "git status"],
    "pause": ["pause", "stop", "hold", "wait"],
    "resume": ["resume", "continue", "go", "unpause"],
}

PRODUCT_ISSUES = {
    "comments": ["comment", "discussion", "thread", "reply"],
    "video": ["video", "youtube", "player", "embed"],
    "attributes": ["attribute", "field", "data", "missing info", "blank"],
    "image": ["image", "picture", "photo", "nutrition label", "label"],
    "pricing": ["price", "discount", "code", "cost"],
    "gating": ["gate", "lock", "access", "tier", "member", "paywall"],
    "navigation": ["nav", "link", "route", "page", "broken link", "404"],
    "infrastructure": ["infrastructure", "swarm", "bridge", "pipeline", "routing"],
}


# ============================================================
# Core utilities
# ============================================================

def utc_str():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def load_json(path):
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8-sig"))
        except Exception:
            pass
    return {}

def save_json(path, data):
    (BASE / "state").mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")

def _record(reply, action):
    if MIND:
        try:
            _mind_record(reply, action)
        except Exception:
            pass


# ============================================================
# Telegram API helpers
# ============================================================

def tg_request(method, data=None):
    url = API_BASE + "/" + method
    if data:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
        )
    else:
        req = urllib.request.Request(url)
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print("[TG_ERROR] " + str(method) + ": " + str(e))
        return {"ok": False}

def send_message(chat_id, text):
    return tg_request("sendMessage", {"chat_id": chat_id, "text": str(text)[:4096]})

def get_updates(offset=None, timeout=30):
    data = {"timeout": timeout}
    if offset:
        data["offset"] = offset
    return tg_request("getUpdates", data)

def get_operator_chat_id():
    return load_json(OPERATOR_CHAT_FILE).get("chat_id")

def set_operator_chat_id(cid):
    save_json(OPERATOR_CHAT_FILE, {"chat_id": cid, "set_at": utc_str()})

def _run_bridge(command):
    try:
        args = str(command).split()
        r = subprocess.run(
            [PY, str(BASE / "phone_bridge.py")] + args,
            capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=30,
        )
        return ((r.stdout or r.stderr or "").strip() or "(no output)")[:1000]
    except Exception as e:
        return "Error: " + str(e)


# ============================================================
# Queue / manifest / mission helpers
# ============================================================

def _load_queue():
    return load_json(QUEUE_FILE)

def _save_queue(data):
    save_json(QUEUE_FILE, data)

def active_tasks():
    q = _load_queue()
    return [t for t in q.get("tasks", []) if t.get("status") in ("QUEUED", "RETRY", "RUNNING")]

def first_active_task():
    tasks = active_tasks()
    return tasks[0] if tasks else None

def queue_count_text():
    cnt = len(active_tasks())
    return str(cnt) + " task" + ("s" if cnt != 1 else "")

def current_profile():
    roles = load_json(BASE / "swarm_roles.json")
    return roles.get("active_profile", "claude_primary")

def switch_profile(profile):
    rp = BASE / "swarm_roles.json"
    roles = json.loads(rp.read_text(encoding="utf-8-sig"))
    roles["active_profile"] = profile
    rp.write_text(json.dumps(roles, indent=2), encoding="utf-8")
    if VOICE:
        return speak_switched(profile)
    return "SWITCHED: " + profile

def mission_from_text(text):
    lower = (text or "").lower().strip()
    for m in KNOWN_MISSIONS:
        if m in lower:
            return m
    aliases = {
        "forum": "forum_patch_sprint",
        "overnight": "overnight_autonomy_push",
        "recon": "recon_sweep",
        "verify": "verification_only",
        "cheap": "cheap_ring_build",
        "opus": "opus_builder_mode",
    }
    for alias, mission in aliases.items():
        if alias in lower:
            return mission
    return None

def find_task_by_stage_ref(text):
    lower = (text or "").lower().strip()
    match = re.search(r"(\d+[a-z0-9_-]*)", lower)
    if not match:
        return None
    ref = match.group(1)
    for task in active_tasks():
        sid = str(task.get("stage_id", ""))
        if sid == ref or sid.startswith(ref):
            return task
    return None

def route_stage_execution(task):
    sid = task.get("stage_id", "?")
    title = task.get("title", "untitled")
    payload_dir = BASE / "broadcast_input"
    candidates = []
    if payload_dir.exists():
        for f in payload_dir.iterdir():
            if f.suffix in (".txt", ".json", ".md"):
                fname = f.name.lower()
                if str(sid).lower() in fname:
                    candidates.append(f)
    if candidates:
        best = candidates[0]
        try:
            args = [PY, str(BASE / "broadcaster.py"), "--payload", str(best)]
            r = subprocess.run(args, capture_output=True, text=True,
                               encoding="utf-8", errors="replace", timeout=300)
            result = ((r.stdout or r.stderr or "").strip() or "(no output)")[:1000]
        except Exception as e:
            result = "Dispatch error: " + str(e)
        return "Dispatching stage " + str(sid) + " (" + title + ")\nPayload: " + best.name + "\n" + result
    exec_script = BASE / ("exec_" + str(sid) + ".py")
    if exec_script.exists():
        try:
            r = subprocess.run(
                [PY, str(exec_script)],
                capture_output=True, text=True,
                encoding="utf-8", errors="replace", timeout=300,
            )
            result = ((r.stdout or r.stderr or "").strip() or "(no output)")[:1000]
        except Exception as e:
            result = "Executor error: " + str(e)
        return "Executing stage " + str(sid) + " via executor\n" + result
    return "No payload or executor found for stage " + str(sid) + "."

def next_stage_id(prefix):
    q = _load_queue()
    existing = [t.get("stage_id", "") for t in q.get("tasks", [])]
    for i in range(1, 1000):
        candidate = prefix + "_" + str(i).zfill(3)
        if candidate not in existing:
            return candidate
    return prefix + "_999"

def enqueue_task(stage_id, title, lane, domain, priority="normal", front=False, notes=""):
    q = _load_queue()
    tasks = q.setdefault("tasks", [])
    for t in tasks:
        if t.get("stage_id") == stage_id:
            return False, t
    item = {"stage_id": stage_id, "title": title, "lane": lane, "domain": domain, "status": "QUEUED", "priority": priority}
    if notes:
        item["notes"] = notes
    if front:
        tasks.insert(0, item)
    else:
        tasks.append(item)
    _save_queue(q)
    return True, item


# ============================================================
# Pending choice / clarification helpers
# ============================================================

def remember_pending_choice(choice_type, extra=None):
    data = {"pending": True, "type": choice_type, "asked_at": utc_str()}
    if extra:
        data.update(extra)
    save_json(CLARIFICATION_STATE, data)

def handle_pending_choice(chat_id, text, clar):
    choice_type = clar.get("type", "")
    save_json(CLARIFICATION_STATE, {"pending": False})
    if choice_type == "run_choice":
        mission = mission_from_text(text)
        if mission:
            result = _run_bridge("run " + mission)
            builder = "Claude" if "claude" in current_profile() else "DeepSeek"
            reply = "Mission queued: " + mission + ".\n" + builder + " is building.\n" + result
        elif text.lower().strip() in ("run next", "next", "queued"):
            task = first_active_task()
            if task:
                reply = route_stage_execution(task)
            else:
                reply = "Queue is empty."
        else:
            reply = "Say: forum_patch_sprint, overnight_autonomy_push, or 'run next'."
        send_message(chat_id, reply)
        _record(reply, "pending_run_choice")
        log_cmd(chat_id, text, "pending_run_choice")
        return
    if choice_type == "product_category":
        original = clar.get("original_text", "")
        if detect_internal_issue(text):
            return handle_internal_issue(chat_id, original or text)
        cat = detect_product_category(text)
        if not cat and text.strip().lower() != "other":
            reply = "What area? comments, video, attributes, image, pricing, gating, navigation, infrastructure, or other?"
            remember_pending_choice("product_category", {"original_text": original or text})
            send_message(chat_id, reply)
            log_cmd(chat_id, text, "clarification_retry")
            return
        return handle_product_issue(chat_id, original, cat or "other")
    reply = "I lost track. Start over?"
    send_message(chat_id, reply)
    log_cmd(chat_id, text, "pending_lost")


# ============================================================
# Detection / classification
# ============================================================

def extract_front_queue_body(text):
    raw = (text or "").strip()
    lower = raw.lower()
    for prefix in ["add stage to front of line:", "create new stage and bring to the front:", "create new stage and bring to front:"]:
        if lower.startswith(prefix):
            return raw[len(prefix):].strip()
    return ""

def detect_internal_issue(text):
    lower = (text or "").lower().strip()
    strong = ["infrastructure issue", "swarm issue", "bot issue", "bridge issue", "pipeline issue",
              "routing issue", "fix yourself", "your own systems", "systems seem broken",
              "bot is down", "bridge is down", "malfunction"]
    return any(s in lower for s in strong)

def detect_product_category(text):
    lower = (text or "").lower()
    for cat, kws in PRODUCT_ISSUES.items():
        for kw in kws:
            if kw in lower:
                return cat
    return None

def classify_nl(text):
    lower = (text or "").lower().strip()

    # --- Crown lifecycle commands (highest priority) ---
    if lower.startswith("mint new "):
        return "crown_mint_force"
    if lower.startswith("mint revision ") or lower.startswith("mint a revision"):
        return "crown_mint_revision"
    if lower.startswith("mint "):
        return "crown_mint"
    # ROUTING_FIX_294: token-length disambiguation
    # Run tokens (8+ chars like 20260313_145410) go to crown_approve_token
    # Stage IDs (short like 252, 105b) go to crown_approve
    if lower.startswith("approve ") and lower != "approve orchestrator":
        _approve_arg = lower.split(None, 1)[1] if " " in lower else ""
        if len(_approve_arg) >= 8:
            return "crown_approve_token"
    if re.fullmatch(r"approve\s+\d+[a-z0-9_-]*", lower):
        return "crown_approve"
    if re.fullmatch(r"override\s+\d+[a-z0-9_-]*", lower):
        return "crown_override"
    if re.fullmatch(r"dispatch\s+\d+[a-z0-9_-]*", lower):
        return "crown_dispatch"
    if lower.startswith("verify ") and re.search(r"\d+", lower):
        return "crown_verify"
    if lower.startswith("seal ") and re.search(r"\d+", lower):
        return "crown_seal"
    if lower in ("preflight", "routing", "swarm tabs", "tabs", "builder status"):
        return "crown_preflight"
    if lower.startswith("drop ") or lower.startswith("remove stage ") or lower.startswith("delete stage ") or lower in ("drop all stale", "drop stale", "drop all failed", "clean queue", "clear stale"):
        return "crown_drop"

    # STAGE_228: revision classifier moved to correct position above
    if lower.startswith("rerun ") or lower.startswith("re-run ") or lower.startswith("revise and rerun ") or lower.startswith("retry as revision "):
        return "crown_rerun"
    if lower in ("halt", "abort", "stop now", "stop", "kill", "cancel"):
        return "crown_halt"
    # STAGE_250: watchdog / diagnose / health commands
    if lower in ("watchdog", "diagnose", "health check", "check health", "system check"):
        return "crown_watchdog"
    # STAGE_281: conversational approval commands (handled by ROUTING_FIX_294 above)
    # CONVERSATIONAL_301: natural approval phrases resolve to token approve
    if lower in ("approve", "do it", "fix it", "go ahead", "proceed", "yes", "yep", "yeah", "go"):
        return "crown_approve_token"
    if lower in ("deny", "reject", "no", "cancel fix"):
        return "crown_deny_token"
    if lower in ("details", "show details", "what happened", "what changed"):
        return "crown_details_token"
    if lower in ("hold", "wait", "not yet", "hold off"):
        return "crown_hold_token"
    # STAGE_260: fix / orchestrate commands
    if lower in ("fix", "auto fix", "autofix", "orchestrate", "fix it"):
        return "crown_fix"
    if lower in ("approve orchestrator", "approve orch"):
        return "crown_approve_orchestrator"
    # STAGE_235: recon commands
    if lower.startswith("grep ") or lower.startswith("show file ") or lower.startswith("head ") or lower.startswith("fetch "):
        return "crown_recon"
    # STAGE_241: fast stage adder
    if lower.startswith("add stage "):
        return "crown_add_stage"

    # --- Exact-match commands ---
    if lower in ("run it", "do it", "ship it", "launch it", "run"):
        return "run_ambiguous"
    if lower in ("either", "whichever", "any", "any of them"):
        return "either"
    if lower in ("run next in queue", "run next", "run queued task", "run next queued task",
                 "run next stage", "launch next stage", "execute next stage", "deploy next stage"):
        return "run_next"
    if lower in ("run task", "run queued item"):
        return "run_task"
    if lower in ("create new stage", "new stage", "setup a new stage"):
        return "new_stage_clarify"

    # Front-of-queue add
    for prefix in ["add stage to front of line:", "create new stage and bring to the front:", "create new stage and bring to front:"]:
        if lower.startswith(prefix):
            return "front_queue_add"

    # Manifest explain
    if "manifest" in lower and ("add" in lower or "update" in lower):
        return "manifest_explain"

    # Run specific stage by number
    if re.fullmatch(r"run\s+stage\s+[a-z0-9_-]+", lower):
        return "run_stage_line"
    if re.fullmatch(r"run\s+\d+[a-z0-9_-]*", lower):
        return "run_stage_line"

    # Bare stage reference
    if re.fullmatch(r"(stage\s+)?\d+[a-z0-9_-]*", lower):
        return "stage_reference"

    # Commit
    if lower in ("commit it", "commit", "auto-commit", "autocommit", "commit pending"):
        return "commit_pending"

    # Known mission
    if lower in KNOWN_MISSIONS:
        return "run_specific_mission"

    # Internal issue
    if lower.startswith("infrastructure issue:"):
        return "internal_issue"
    if detect_internal_issue(text):
        return "internal_issue"

    # Mission name in text
    mission = mission_from_text(text)
    if mission:
        if mission == "forum_patch_sprint":
            return "run_forum"
        if mission == "overnight_autonomy_push":
            return "run_overnight"
        return "run_specific_mission"

    # Identity / autonomy
    if any(k in lower for k in ["what are you", "who are you"]):
        return "identity"
    if any(k in lower for k in ["are you autonomous", "is it autonomous", "is the swarm autonomous"]):
        return "autonomy"

    # NL keyword routes
    for cmd, kws in NL_ROUTES.items():
        for kw in kws:
            if kw in lower:
                return cmd

    # Product issue
    if any(w in lower for w in ["page", "issue", "bug", "broken", "wrong", "missing", "fix",
                                 "problem", "compound", "product", "detail", "comment system"]):
        return "product_issue"

    return None


# ============================================================
# Response text generators
# ============================================================

def _identity_text():
    return (
        "I am the sovereign node of the ProHP swarm. "
        "My mind is the fusion of sealed stages, runtime state, and your command surface.\n\n"
        "Lifecycle: mint -> approve -> dispatch -> verify -> seal"
    )

def _autonomy_text():
    return (
        "The swarm can run autonomously once you launch it. "
        "It picks nodes, dispatches work, handles corrections, detects problems, "
        "and seals completed stages. You choose the target. It carries the execution."
    )

def _help_text():
    # 688: voice fallback — catch unclassified text before help
    try:
        from bot_voice_handler import handle_voiced_message as _hvf
        _vr = _hvf(text)
        if _vr and len(str(_vr)) > 3 and str(_vr) != "{}":
            send_message(chat_id, str(_vr))
            log_cmd(chat_id, text, "voice_fallback")
            return
        else:
            send_message(chat_id, "I'm here. Nothing urgent. What do you need?")
            log_cmd(chat_id, text, "voice_default_fallback")
            return
    except Exception:
        pass

    lines = [

        "LIFECYCLE: mint -> approve -> dispatch -> verify -> seal",
        "",
        "Mint:     mint <natural language command>",
        "Approve:  approve <stage_id>",
        "Dispatch: dispatch <stage_id>",
        "Verify:   verify <stage_id>",
        "Seal:     seal <stage_id>",
        "Override: override <stage_id>",
        "Preflight: preflight (check swarm tabs)",
        "Drop:     drop <stage_id> or drop all stale",
        "",
        "Check in: status, queue",
        "Control:  pause, resume, use claude, use deepseek",
        "Launch:   run forum, run overnight, run <stage_id>",
        "Create:   describe a product issue",
        "Identity: what are you?",
    ]
    return "\n".join(lines)


# ============================================================
# Issue handlers
# ============================================================

def handle_internal_issue(chat_id, original, front=False):
    if CROWN_MINT:
        result = handle_mint_command("fix infrastructure issue: " + str(original), origin="telegram")
        reply = result.get("reply", "Mint failed.")
    else:
        result = _run_bridge("mint Infrastructure issue: " + str(original))
        reply = "Minted an infrastructure stage.\n" + str(result)
    send_message(chat_id, reply)
    _record(reply, "mint:infrastructure")
    log_cmd(chat_id, original, "internal_issue")

def handle_product_issue(chat_id, original, category, front=False):
    if CROWN_MINT:
        result = handle_mint_command("fix " + str(category) + " issue: " + str(original), origin="telegram")
        reply = result.get("reply", "Mint failed.")
    else:
        result = _run_bridge("mint Forum product issue: " + str(category) + ". " + str(original))
        reply = "Minted a stage for " + str(category) + ".\n" + str(result)
    send_message(chat_id, reply)
    _record(reply, "mint:" + str(category))
    log_cmd(chat_id, original, "product_issue:" + str(category))


# ============================================================
# Logging
# ============================================================

def log_cmd(chat_id, text, action):
    log = load_json(COMMAND_LOG)
    if "commands" not in log:
        log["commands"] = []
    log["commands"].append({"chat_id": chat_id, "text": str(text)[:200], "action": action, "at": utc_str()})
    log["commands"] = log["commands"][-200:]
    save_json(COMMAND_LOG, log)


# ============================================================
# Main message handler
# ============================================================

def handle_message(chat_id, text, message_id=None):
    # 667: Auto-capture operator chat_id from every inbound message
    try:
        import json as _cj
        _cid_path = Path(r"C:\ProHP\SOVEREIGN_L5\state\operator_chat_id.json")
        if chat_id and int(chat_id) > 100000:
            _old = None
            if _cid_path.exists():
                try:
                    _old = _cj.loads(_cid_path.read_text(encoding="utf-8")).get("chat_id")
                except Exception:
                    pass
            if str(_old) != str(chat_id):
                _cid_path.write_text(_cj.dumps({"chat_id": int(chat_id), "captured_from": "handle_message"}), encoding="utf-8")
    except Exception:
        pass

    # 628: Organism voice routing for non-command dialogue
    try:
        _t = text.strip().lower()
        # Skip voice routing for known commands (preserve all existing paths)
        _cmd_prefixes = [
            "status", "help", "queue", "dispatch", "approve", "deny", "hold",
            "fix", "profile", "switch", "stage", "crown", "run", "seal",
            "needs", "health", "dashboard", "test", "check", "morning",
            "diagnostic", "reflect", "proofs", "perf", "dedup", "heal",
            "daemon", "bootstrap", "version", "snapshot", "loop", "menu",
            "mission", "new mission", "build ", "front:", "orchestrat",
            "detail", "pending", "monitor", "audit", "certif",
            "who are you", "what are you", "identity", "autonomy",
        ]
        _is_command = any(_t == p or _t.startswith(p + " ") or _t.startswith(p + "	") for p in _cmd_prefixes)
        if not _is_command and len(_t) > 1:
            from bot_voice_handler import handle_voiced_message
            _voice_reply = handle_voiced_message(text)
            if _voice_reply and len(_voice_reply) > 3 and _voice_reply != '{}':
                send_message(chat_id, _voice_reply)
                log_cmd(chat_id, text, "voice_response")
                return
            else:
                # 683: help routing fix — non-command text that voice can't handle
                # gets a warm default, NOT the help/lifecycle block
                send_message(chat_id, "I'm here. Nothing urgent right now. What do you need?")
                log_cmd(chat_id, text, "voice_default")
                return
    except Exception as _ve:
        pass  # fall through to normal command handling

    set_operator_chat_id(chat_id)
    text = (text or "").strip()

    # Pending choice from previous turn
    clar = load_json(CLARIFICATION_STATE)
    if clar.get("pending"):
        return handle_pending_choice(chat_id, text, clar)

    command = classify_nl(text)

    # === CROWN LIFECYCLE COMMANDS ===

    if command == "crown_mint_force" and CROWN_MINT:
        mint_text = text[9:].strip() if text.lower().startswith("mint new ") else text
        result = handle_mint_force(mint_text, origin="telegram")
        reply = result.get("reply", "Mint failed.")
        send_message(chat_id, reply)
        _record(reply, "crown_mint_force")
        log_cmd(chat_id, text, "crown_mint_force:" + result.get("status", "unknown"))
        return

    if command == "crown_mint" and CROWN_MINT:
        mint_text = text[5:].strip() if text.lower().startswith("mint ") else text
        result = handle_mint_command(mint_text, origin="telegram")
        reply = result.get("reply", "Mint failed.")
        send_message(chat_id, reply)
        _record(reply, "crown_mint")
        log_cmd(chat_id, text, "crown_mint:" + result.get("status", "unknown"))
        return

    if command == "crown_approve" and CROWN_MINT:
        stage_ref = re.search(r"\d+[a-z0-9_-]*", text)
        if stage_ref:
            result = handle_approve_command(stage_ref.group(0))
            reply = result.get("reply", "Approve failed.")
        else:
            reply = "Usage: approve <stage_id>"
        send_message(chat_id, reply)
        _record(reply, "crown_approve")
        log_cmd(chat_id, text, "crown_approve")
        return

    if command == "crown_override" and CROWN_MINT:
        stage_ref = re.search(r"\d+[a-z0-9_-]*", text)
        if stage_ref:
            result = handle_override_command(stage_ref.group(0))
            reply = result.get("reply", "Override failed.")
        else:
            reply = "Usage: override <stage_id>"
        send_message(chat_id, reply)
        _record(reply, "crown_override")
        log_cmd(chat_id, text, "crown_override")
        return

    if command == "crown_dispatch" and CROWN_MINT:
        stage_ref = re.search(r"\d+[a-z0-9_-]*", text)
        if stage_ref:
            # STAGE_226e: immediate dispatch ack + phase feed listener
            _dispatch_sid = stage_ref.group(0)
            send_message(chat_id, "Got it. Dispatching stage " + _dispatch_sid + " now. Will send live updates.")
            _tg_pf_listener = None
            if pf:
                _tg_pf_listener = pf.make_telegram_listener(
                    lambda t, _cid=chat_id: send_message(_cid, t[:300]),
                    throttle_s=8
                )
                pf.add_listener(_tg_pf_listener)
            try:
                result = handle_dispatch_command(_dispatch_sid)
            finally:
                if pf and _tg_pf_listener:
                    pf.remove_listener(_tg_pf_listener)
            reply = result.get("reply", "Dispatch failed.")
        else:
            reply = "Usage: dispatch <stage_id>"
        send_message(chat_id, reply)
        _record(reply, "crown_dispatch")
        log_cmd(chat_id, text, "crown_dispatch")
        return

    # STAGE_236: mint revision handler (rewritten)
    if command == "crown_mint_revision" and CROWN_MINT:
        stage_ref = re.search(r"\d+[a-z0-9_-]*", text)
        if stage_ref:
            sid = stage_ref.group(0)
            # Get queue to find the stage objective
            q = handle_queue_command()
            q_text = q.get("reply", "") if isinstance(q, dict) else str(q)
            obj = ""
            for qline in q_text.split("\n"):
                if sid in qline and "|" in qline:
                    parts = qline.split("|")
                    if len(parts) >= 2:
                        obj = parts[1].strip()
                        break
            if not obj:
                obj = "continuation of stage " + sid
            # Drop old stage
            try:
                drop_result = handle_drop_command(sid)
                drop_msg = drop_result.get("reply", str(drop_result)) if isinstance(drop_result, dict) else str(drop_result)
            except Exception as _dr_err:
                drop_msg = "drop failed: " + str(_dr_err)
            # Mint fresh
            try:
                mint_result = handle_mint_force(obj, origin="telegram")
                mint_msg = mint_result.get("reply", str(mint_result)) if isinstance(mint_result, dict) else str(mint_result)
            except Exception as _mr_err:
                mint_msg = "mint failed: " + str(_mr_err)
            reply = "REVISION of " + sid + "\n" + mint_msg
        else:
            reply = "Usage: mint revision <stage_id>"
        send_message(chat_id, reply)
        _record(reply, "crown_mint_revision")
        log_cmd(chat_id, text, "crown_mint_revision")
        return

    # STAGE_228b: rerun handler
    if command == "crown_rerun" and CROWN_MINT:
        stage_ref = re.search(r"\d+[a-z0-9_-]*", text)
        if stage_ref:
            sid = stage_ref.group(0)
            # STAGE_246: clear duplicate guard and auto-dispatch
            import json as _rj
            _lp = Path(r"C:\ProHP\SOVEREIGN_L5\.stage_run_ledger.json")
            try:
                _ld = _rj.loads(_lp.read_text()) if _lp.exists() else {}
                _rm = [k for k in list(_ld.keys()) if sid in k]
                for k in _rm: del _ld[k]
                _lp.write_text(_rj.dumps(_ld, indent=2))
            except Exception: pass
            # Also clear halt flag
            _hf = Path(r"C:\ProHP\SOVEREIGN_L5\.halt_flag")
            if _hf.exists():
                try: _hf.unlink()
                except: pass
            send_message(chat_id, "Cleared duplicate guard for " + sid + ". Dispatching now...")
            _tg_pf_listener = None
            if pf:
                _tg_pf_listener = pf.make_telegram_listener(
                    lambda t, _cid=chat_id: send_message(_cid, t[:300]),
                    throttle_s=8
                )
                pf.add_listener(_tg_pf_listener)
            try:
                result = handle_dispatch_command(sid)
            finally:
                if pf and _tg_pf_listener:
                    pf.remove_listener(_tg_pf_listener)
            reply = result.get("reply", "Rerun failed.") if isinstance(result, dict) else str(result)
        else:
            reply = "Usage: rerun <stage_id>"
        send_message(chat_id, reply)
        _record(reply, "crown_rerun")
        log_cmd(chat_id, text, "crown_rerun")
        return

    # STAGE_228b: halt / abort / stop handler
    if command == "crown_halt":
        _halt_flag = Path(r"C:\ProHP\SOVEREIGN_L5\.halt_flag")
        _halt_flag.write_text("HALT " + datetime.now(timezone.utc).isoformat(), encoding="utf-8")
        reply = "HALT signal sent. Active dispatch will stop at next checkpoint.\nTo clear: send resume"
        send_message(chat_id, reply)
        _record(reply, "crown_halt")
        log_cmd(chat_id, text, "crown_halt")
        return

    # STAGE_250: Watchdog + auto-mint
    if command == "crown_watchdog":
        try:
            from watchdog import run_watchdog
            from auto_mint import auto_mint_from_issues
            report = run_watchdog()
            lines = [f"WATCHDOG — {report['utc']}", f"Checks: {report['total_checks']} | Passed: {report['passed']}"]
            for c in report["checks"]:
                status = "OK" if c["ok"] else "ISSUE"
                lines.append(f"  [{status}] {c['check']}: {c.get('details', '')[:60]}")
            if report["issues"]:
                minted = auto_mint_from_issues(report["issues"])
                if minted:
                    lines.append("")
                    lines.append("AUTO-MINTED STAGES:")
                    for m in minted:
                        lines.append(f"  {m['stage_id']}: {m['title']}")
                        lines.append(f"    -> approve {m['stage_id']} to fix")
                else:
                    lines.append("Issues detected but stages already exist or no template.")
            else:
                lines.append("ALL CLEAR. Organism is healthy.")
            reply = "\n".join(lines)
        except Exception as _we:
            reply = "Watchdog error: " + str(_we)[:300]
        send_message(chat_id, reply)
        _record(reply[:200], "crown_watchdog")
        log_cmd(chat_id, text, "crown_watchdog")
        return

    # STAGE_260: Autonomous fix orchestrator
    if command == "crown_fix":
        try:
            import subprocess as _fix_sub
            _fix_py = str(Path(r"C:\ProHP\SOVEREIGN_L5\.venv\Scripts\python.exe"))
            _fix_script = str(Path(r"C:\ProHP\SOVEREIGN_L5\auto_fix_orchestrator.py"))
            send_message(chat_id, "Starting orchestrator dry-run...\nDetecting issues, previewing fix plan.")
            _fix_r = _fix_sub.run(
                [_fix_py, _fix_script, "--run", "--dry-run"],
                capture_output=True, text=True, timeout=120,
                encoding="utf-8", errors="replace"
            )
            _fix_out = (_fix_r.stdout or "")[-1500:]
            reply = "Orchestrator preview:\n" + _fix_out[-1000:]
            if "issue" in _fix_out.lower() or "mint" in _fix_out.lower():
                reply += "\n\nSay 'approve orchestrator' to execute fixes."
            send_message(chat_id, reply)
        except Exception as _fix_err:
            send_message(chat_id, "Orchestrator error: " + str(_fix_err)[:300])
        _record("crown_fix", "crown_fix")
        log_cmd(chat_id, text, "crown_fix")
        return

    # STAGE_281: Token-based approval commands
    if command == "crown_approve_token":
        try:
            from approval_queue import approve, resolve_ambiguous_approve
            # INTENT_RESOLVE_305: validate token format before using second word
            import re as _re305
            parts = text.strip().split()
            token = None
            if len(parts) >= 2:
                candidate = parts[1]
                # Valid tokens are 8+ chars, digits/underscores (like 20260313_153638)
                if len(candidate) >= 8 and _re305.match(r"^[0-9][0-9_]+$", candidate):
                    token = candidate
            if not token:
                # Natural phrase like "approve", "do it", "go ahead" — resolve single pending
                token = resolve_ambiguous_approve()
                if not token:
                    send_message(chat_id, "Multiple pending issues. Specify: approve <token>")
                    _record("crown_approve_token:ambiguous", "crown_approve_token")
                    log_cmd(chat_id, text, "crown_approve_token:ambiguous")
                    return
            result = approve(token)
            if result:
                send_message(chat_id, f"Approved: {token}. Running full closeout...")
                # CLOSEOUT_307: trigger full lifecycle after approval
                try:
                    from lifecycle_closeout import run_lifecycle
                    lc_result = run_lifecycle(token)
                    if lc_result.get("success"):
                        send_message(chat_id, f"Closeout complete for {token}.")
                    else:
                        send_message(chat_id, f"Closeout partial: {lc_result.get('reason', 'unknown')}")
                except Exception as _lc_err:
                    send_message(chat_id, f"Closeout error: {str(_lc_err)[:200]}")
            else:
                send_message(chat_id, f"Could not approve {token}. Check: pending list or token expired.")
        except Exception as _at_err:
            send_message(chat_id, f"Approval error: {str(_at_err)[:200]}")
        _record("crown_approve_token", "crown_approve_token")
        log_cmd(chat_id, text, "crown_approve_token")
        return

    if command == "crown_deny_token":
        try:
            from approval_queue import deny, resolve_ambiguous_approve
            token = resolve_ambiguous_approve()
            if token:
                deny(token)
                send_message(chat_id, f"Denied: {token}. Standing down.")
            else:
                send_message(chat_id, "No single pending issue to deny. Use: deny <token>")
        except Exception as _dt_err:
            send_message(chat_id, f"Deny error: {str(_dt_err)[:200]}")
        _record("crown_deny_token", "crown_deny_token")
        log_cmd(chat_id, text, "crown_deny_token")
        return

    if command == "crown_details_token":
        try:
            from approval_queue import load_pending_active
            active = load_pending_active()
            if not active:
                send_message(chat_id, "No pending issues right now.")
            else:
                lines = []
                for token, entry in active.items():
                    lines.append(f"{token}:")
                    for i in entry.get("issues", []):
                        lines.append(f"  - {i.get('check', '?')}: {i.get('details', '')}")
                send_message(chat_id, "\n".join(lines))
        except Exception as _det_err:
            send_message(chat_id, f"Details error: {str(_det_err)[:200]}")
        _record("crown_details_token", "crown_details_token")
        log_cmd(chat_id, text, "crown_details_token")
        return

    if command == "crown_hold_token":
        try:
            from approval_queue import hold, resolve_ambiguous_approve
            token = resolve_ambiguous_approve()
            if token:
                hold(token)
                send_message(chat_id, f"Holding: {token}. Will remind you later.")
            else:
                send_message(chat_id, "No single pending issue to hold.")
        except Exception as _ht_err:
            send_message(chat_id, f"Hold error: {str(_ht_err)[:200]}")
        _record("crown_hold_token", "crown_hold_token")
        log_cmd(chat_id, text, "crown_hold_token")
        return

    # STAGE_260: Approve orchestrator flag
    if command == "crown_approve_orchestrator":
        try:
            Path(r"C:\ProHP\SOVEREIGN_L5\.approve_orchestrator").write_text("approved", encoding="utf-8")
            send_message(chat_id, "Orchestrator APPROVED. Fix loop will proceed if waiting.")
        except Exception as _ao_err:
            send_message(chat_id, "Approval error: " + str(_ao_err)[:300])
        _record("crown_approve_orchestrator", "crown_approve_orchestrator")
        log_cmd(chat_id, text, "crown_approve_orchestrator")
        return

    # STAGE_235: Telegram recon commands
    if command == "crown_recon":
        try:
            from recon_authority import fetch_file, fetch_head, grep_lines
            lower_text = text.lower().strip()
            if lower_text.startswith("grep "):
                parts = text[5:].strip().split(" ", 1)
                pattern = parts[0]
                path = parts[1] if len(parts) > 1 else ""
                hits = grep_lines(pattern, path=path, max_results=10)
                reply = "GREP: " + pattern + "\n" + "\n".join(hits[:10]) if hits else "No results for: " + pattern
            elif lower_text.startswith("show file "):
                fpath = text[10:].strip()
                r = fetch_file(fpath, max_lines=80)
                reply = r.get("content", r.get("error", "fetch failed"))[:3000]
            elif lower_text.startswith("head "):
                parts = text[5:].strip().split(" ")
                fpath = parts[0]
                n = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 40
                r = fetch_head(fpath, n=n)
                reply = r.get("content", r.get("error", "fetch failed"))[:3000]
            elif lower_text.startswith("fetch "):
                fpath = text[6:].strip()
                r = fetch_file(fpath, max_lines=100)
                reply = r.get("content", r.get("error", "fetch failed"))[:3000]
            else:
                reply = "Usage: grep <pattern> [path] | show file <path> | head <path> [lines] | fetch <path>"
        except Exception as _re:
            reply = "Recon error: " + str(_re)[:200]
        send_message(chat_id, reply)
        _record(reply[:200], "crown_recon")
        log_cmd(chat_id, text, "crown_recon")
        return

    # STAGE_241: Fast stage adder
    if command == "crown_add_stage" and CROWN_MINT:
        import json as _as_json
        parts = text[10:].strip().split(" ", 1)
        if len(parts) >= 2:
            sid = parts[0]
            title = parts[1]
            mp = Path(r"C:\ProHP\SOVEREIGN_L5\stage_manifest.json")
            try:
                m = _as_json.loads(mp.read_text(encoding="utf-8-sig"))
                existing = {s["stage_id"] for s in m["stages"]}
                if sid in existing:
                    reply = "Stage " + sid + " already exists."
                else:
                    m["stages"].append({"stage_id": sid, "title": title, "lane": "CODE", "domain": "SOVEREIGN_L5", "status": "QUEUED", "commit": None, "supersedes": [], "conflicts_with": [], "canonical_range": "autonomy", "notes": "Added via Telegram."})
                    mp.write_text(_as_json.dumps(m, indent=2, ensure_ascii=False), encoding="utf-8")
                    reply = "ADDED stage " + sid + ": " + title + "\nStatus: QUEUED\nNext: approve " + sid
            except Exception as _ae:
                reply = "Error: " + str(_ae)[:200]
        else:
            reply = "Usage: add stage <id> <title/description>"
        send_message(chat_id, reply)
        _record(reply, "crown_add_stage")
        log_cmd(chat_id, text, "crown_add_stage")
        return

    if command == "crown_verify" and CROWN_MINT:
        stage_ref = re.search(r"\d+[a-z0-9_-]*", text)
        if stage_ref:
            result = handle_verify_command(stage_ref.group(0))
            reply = result.get("reply", "Verify failed.")
        else:
            reply = "Usage: verify <stage_id>"
        send_message(chat_id, reply)
        _record(reply, "crown_verify")
        log_cmd(chat_id, text, "crown_verify")
        return

    if command == "crown_seal" and CROWN_MINT:
        stage_ref = re.search(r"\d+[a-z0-9_-]*", text)
        if stage_ref:
            result = handle_seal_command(stage_ref.group(0))
            reply = result.get("reply", "Seal failed.")
        else:
            reply = "Usage: seal <stage_id>"
        send_message(chat_id, reply)
        _record(reply, "crown_seal")
        log_cmd(chat_id, text, "crown_seal")
        return

    if command == "crown_preflight" and CROWN_MINT:
        reply = handle_preflight_command()
        send_message(chat_id, reply)
        _record(reply, "preflight")
        log_cmd(chat_id, text, "preflight")
        return

    if command == "crown_drop" and CROWN_MINT:
        # STAGE_228: normalize "drop stage X" / "remove stage X" / "delete stage X" to "drop X"
        _drop_text = re.sub(r"^(drop|remove|delete)\s+stage\s+", "drop ", text.lower().strip())
        # Extract stage ref or "all stale"
        lower = text.lower().strip()
        if lower in ("drop all stale", "drop stale", "drop all failed", "clean queue", "clear stale"):
            stage_ref = "all stale"
        else:
            stage_ref = text[5:].strip() if lower.startswith("drop ") else text
        result = handle_drop_command(stage_ref)
        reply = result.get("reply", "Drop failed.")
        send_message(chat_id, reply)
        _record(reply, "crown_drop")
        log_cmd(chat_id, text, "crown_drop")
        return

    # === STATUS / QUEUE / DIGEST ===

    if command == "status":
        if CROWN_MINT:
            reply = handle_status_command()
        elif VOICE:
            reply = speak_status()
        else:
            reply = _run_bridge("status")
        send_message(chat_id, reply)
        _record(reply, "status")
        log_cmd(chat_id, text, "status")
        return

    if command == "queue":
        if CROWN_MINT:
            reply = handle_queue_command()
        else:
            reply = format_queue()
        send_message(chat_id, reply)
        _record(reply, "queue")
        log_cmd(chat_id, text, "queue")
        return

    if command == "digest":
        reply = speak_digest() if VOICE else _run_bridge("digest")
        send_message(chat_id, reply)
        _record(reply, "digest")
        log_cmd(chat_id, text, "digest")
        return

    # === HELP / IDENTITY / AUTONOMY ===

    if command == "help":
        reply = _help_text()
        send_message(chat_id, reply)
        _record(reply, "help")
        log_cmd(chat_id, text, "help")
        return

    if command == "identity":
        reply = _identity_text()
        send_message(chat_id, reply)
        _record(reply, "identity")
        log_cmd(chat_id, text, "identity")
        return

    if command == "autonomy":
        reply = _autonomy_text()
        send_message(chat_id, reply)
        _record(reply, "autonomy")
        log_cmd(chat_id, text, "autonomy")
        return

    # === SEAL READY / COMMIT ===

    if command == "seal ready":
        reply = speak_seal_ready() if VOICE else _run_bridge("seal ready")
        send_message(chat_id, reply)
        _record(reply, "seal_ready")
        log_cmd(chat_id, text, "seal_ready")
        return

    if command == "commit_pending":
        reply = _run_bridge("commit pending")
        send_message(chat_id, reply)
        _record(reply, "commit_pending")
        log_cmd(chat_id, text, "commit_pending")
        return

    if command == "manifest_explain":
        reply = "Manifest updates after deploy or seal, not from queue additions. To execute: dispatch <stage_id>"
        send_message(chat_id, reply)
        _record(reply, "manifest_explain")
        log_cmd(chat_id, text, "manifest_explain")
        return

    # === PROFILE SWITCH ===

    if command in ("use claude", "use deepseek"):
        profile = "claude_primary" if "claude" in command else "deepseek_primary"
        reply = switch_profile(profile)
        send_message(chat_id, reply)
        _record(reply, "switch_profile")
        log_cmd(chat_id, text, "switch:" + profile)
        return

    # === PAUSE / RESUME ===

    if command == "pause":
        _run_bridge("pause")
        reply = "Paused. Holding all queued work."
        send_message(chat_id, reply)
        _record(reply, "pause")
        log_cmd(chat_id, text, "pause")
        return

    if command == "resume":
        _run_bridge("resume")
        # STAGE_242: resume clears halt flag
        _hf = Path(r"C:\ProHP\SOVEREIGN_L5\.halt_flag")
        if _hf.exists():
            try: _hf.unlink()
            except: pass
        reply = "Resumed. " + queue_count_text() + " ready."
        send_message(chat_id, reply)
        _record(reply, "resume")
        log_cmd(chat_id, text, "resume")
        return

    # === RUN MISSIONS ===

    if command == "run_forum":
        result = _run_bridge("run forum")
        builder = "Claude" if "claude" in current_profile() else "DeepSeek"
        reply = "Mission: forum_patch_sprint.\n" + builder + " building.\n" + result
        send_message(chat_id, reply)
        _record(reply, "run_forum")
        log_cmd(chat_id, text, "run:forum")
        return

    if command == "run_overnight":
        result = _run_bridge("run overnight")
        builder = "Claude" if "claude" in current_profile() else "DeepSeek"
        reply = "Mission: overnight_autonomy_push.\n" + builder + " building.\n" + result
        send_message(chat_id, reply)
        _record(reply, "run_overnight")
        log_cmd(chat_id, text, "run:overnight")
        return

    if command == "run_specific_mission":
        mission = mission_from_text(text) or text.strip()
        result = _run_bridge("run " + mission)
        builder = "Claude" if "claude" in current_profile() else "DeepSeek"
        reply = "Mission: " + mission + ".\n" + builder + " building.\n" + result
        send_message(chat_id, reply)
        _record(reply, "run_specific_mission")
        log_cmd(chat_id, text, "run:" + mission)
        return

    # === RUN NEXT / RUN TASK ===

    if command == "run_next":
        task = first_active_task()
        if not task:
            reply = "Queue is empty.\n\nMint something: mint <command>"
        else:
            reply = route_stage_execution(task)
        send_message(chat_id, reply)
        _record(reply, "run_next")
        log_cmd(chat_id, text, "run_next")
        return

    if command == "run_task":
        task = first_active_task()
        if not task:
            reply = "Queue is empty.\n\nMint something: mint <command>"
        elif len(active_tasks()) == 1:
            reply = route_stage_execution(task)
        else:
            remember_pending_choice("run_choice", {"source": "run_task"})
            reply = "Multiple paths. Say: forum_patch_sprint, overnight_autonomy_push, or 'run next'."
        send_message(chat_id, reply)
        _record(reply, "run_task")
        log_cmd(chat_id, text, "run_task")
        return

    # === RUN BY STAGE NUMBER ===

    if command in ("run_stage_line", "stage_reference"):
        task = find_task_by_stage_ref(text)
        if task:
            reply = route_stage_execution(task)
        else:
            reply = "Stage not found in active queue. Type: queue"
        send_message(chat_id, reply)
        _record(reply, "run_stage")
        log_cmd(chat_id, text, "run_stage")
        return

    # === RUN AMBIGUOUS ===

    if command == "run_ambiguous":
        remember_pending_choice("run_choice", {"source": "run_ambiguous"})
        reply = "Run what? forum_patch_sprint, overnight_autonomy_push, or run next?"
        send_message(chat_id, reply)
        _record(reply, "run_ambiguous")
        log_cmd(chat_id, text, "run_ambiguous")
        return

    if command == "either":
        task = first_active_task()
        if task:
            reply = route_stage_execution(task)
        else:
            reply = _run_bridge("run forum")
        send_message(chat_id, reply)
        _record(reply, "either")
        log_cmd(chat_id, text, "either")
        return

    # === NEW STAGE / FRONT QUEUE ===

    if command == "new_stage_clarify":
        reply = "Describe the stage: mint <what needs to happen>"
        send_message(chat_id, reply)
        _record(reply, "new_stage_clarify")
        log_cmd(chat_id, text, "new_stage_clarify")
        return

    if command == "front_queue_add":
        body = extract_front_queue_body(text)
        if not body:
            reply = "Tell me what to add after the colon."
            send_message(chat_id, reply)
            log_cmd(chat_id, text, "front_queue_add_empty")
            return
        if CROWN_MINT:
            result = handle_mint_command(body, origin="telegram")
            reply = result.get("reply", "Mint failed.")
        else:
            if detect_internal_issue(body):
                return handle_internal_issue(chat_id, body, front=True)
            cat = detect_product_category(body)
            if cat:
                return handle_product_issue(chat_id, body, cat, front=True)
            sid = next_stage_id("AUTO")
            created, item = enqueue_task(sid, body[:120], "SYSTEM", "SOVEREIGN_L5", priority="high", front=True)
            reply = "Added to front.\nStage: " + item["stage_id"] + "\nTitle: " + item["title"]
        send_message(chat_id, reply)
        _record(reply, "front_queue_add")
        log_cmd(chat_id, text, "front_queue_add")
        return

    # === ISSUES ===

    if command == "internal_issue":
        return handle_internal_issue(chat_id, text)

    if command == "product_issue":
        cat = detect_product_category(text)
        if cat:
            return handle_product_issue(chat_id, text, cat)
        remember_pending_choice("product_category", {"original_text": text})
        reply = "What area? comments, video, attributes, image, pricing, gating, navigation, infrastructure, or other?"
        send_message(chat_id, reply)
        _record(reply, "clarification")
        log_cmd(chat_id, text, "clarification_asked")
        return

    # === CROWN NL FALLBACK ===
    # If unclassified text looks like a mintable command, try minting it
    if CROWN_MINT:
        try:
            from intent_engine import parse_intent
            probe = parse_intent(text, origin="telegram")
            if not probe.get("needs_clarification") and probe.get("intent_type") != "unknown":
                result = handle_mint_command(text, origin="telegram")
                if result.get("status") in ("MINTED", "BLOCKED"):
                    reply = result.get("reply", "Mint failed.")
                    send_message(chat_id, reply)
                    _record(reply, "crown_mint_nl")
                    log_cmd(chat_id, text, "crown_mint_nl:" + result.get("status", "unknown"))
                    return
        except Exception as e:
            print("[CROWN_NL_ERROR] " + str(e))

    # === FINAL FALLBACK ===

    result = _run_bridge(text)
    if "UNKNOWN COMMAND" in result:
        reply = _help_text()
    else:
        reply = result
    send_message(chat_id, reply)
    _record(reply, command or "raw")
    log_cmd(chat_id, text, command or "raw")


# ============================================================
# Alerts
# ============================================================

def send_alert(msg, priority="info"):
    cid = get_operator_chat_id()
    if not cid:
        return False
    emoji = {"info": "\u2139\ufe0f", "high": "\U0001f534", "low": "\U0001f4ca"}.get(priority, "\U0001f4cc")
    send_message(cid, emoji + " " + msg)
    return True


# ============================================================
# Bot polling loop
# ============================================================

def run_bot():
    print("SOVEREIGN_L5 TELEGRAM BRIDGE - Crown v2")
    print("Bot: t.me/L7_ProHP_Bot")
    crown_str = "ON" if CROWN_MINT else "OFF"
    voice_str = "ON" if VOICE else "OFF"
    mind_str = "ON" if MIND else "OFF"
    print("Crown: " + crown_str + " | Voice: " + voice_str + " | Mind: " + mind_str)
    print("UTC: " + utc_str())
    print("Polling...\n")

    offset = None
    cid = get_operator_chat_id()
    if cid:
        send_message(cid, "Swarm online. Crown: " + crown_str + ". Send 'status' or 'help'.")

    try:
        while True:
            result = get_updates(offset=offset, timeout=30)
            if not result.get("ok"):
                print("[POLL_ERROR] " + str(result.get("error", "?")))
                time.sleep(5)
                continue
            for update in result.get("result", []):
                offset = update["update_id"] + 1
                msg = update.get("message", {})
                cid = msg.get("chat", {}).get("id")
                text = msg.get("text", "")
                if not cid:
                    continue
                if msg.get("voice") and not text:
                    send_message(cid, "Voice received. Type your command.")
                    continue
                if text:
                    user = msg.get("from", {}).get("first_name", "?")
                    print("[MSG] " + str(user) + ": " + str(text)[:80])
                    try:
                        handle_message(chat_id=cid, text=text, message_id=msg.get("message_id"))
                    except Exception as e:
                        print("[ERROR] " + str(e))
                        send_message(cid, "Error: " + str(e)[:100])
    except KeyboardInterrupt:
        print("\nBot stopped.")
        cid = get_operator_chat_id()
        if cid:
            send_message(cid, "Swarm going offline.")


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--test", help="Test locally")
    p.add_argument("--send", help="Send alert")
    p.add_argument("--priority", default="info")
    a = p.parse_args()
    if a.test:
        print(_run_bridge(a.test))
    elif a.send:
        send_alert(a.send, a.priority)
    else:
        run_bot()
