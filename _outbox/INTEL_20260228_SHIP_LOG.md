# INTEL — 2026-02-28 Ship Log (srv2)
ANCHOR: E3592DC3

## Sources of truth
- Repo: proHP-forum (srv2)
- Commit window: since 2026-02-28T00:00:00Z
- Tags: SWARM_20260228_*

## Commit timeline (chronological)
- 20d48a55 — HOTFIX: add missing ClaimAccountPage import (restore prod uptime)
- 6c804788 — STAGE_271: API-enforced 3-state compound gating + Home nav link
- 5c55909d — STAGE_271b + STAGE_266: Frontend CTA gate wrappers + Welcome video placeholder
- 4f6489de — HOTFIX: Stripe auth + lead JWT email + admin password + 2M+ copy sweep
- 829c7d39 — CHORE: remove backups/videos from tracking; harden .gitignore
- 3de6131c — STAGE_024_README_GLASS_ENGINE
- 535f084c — BACKLOG_022_HOME_HERO_ALIGNMENT
- 54739177 — STAGE_026_TIER_CANONICALIZATION_PURGE
- d67d7fe0 — STAGE_027_TIER_STRAGGLER_CLEANUP
- 2c1fbb65 — STAGE_029_STRIPE_CHECKOUT_SELF_HEALING
- ab643476 — STAGE_029b_RECAPTURE_ROUTE_TO_GATE
- 2fba398b — STAGE_275_GREPGATE_CTA_FUNNEL_PARITY

## Tags published today
- SWARM_20260228_164101 (STAGE_024)
- SWARM_20260228_165935 (BACKLOG_022)
- SWARM_20260228_172359 (STAGE_026)
- SWARM_20260228_172959 (STAGE_027)
- SWARM_20260228_211946 (STAGE_029)
- SWARM_20260228_214609 (STAGE_029b)
- SWARM_20260228_231556 (STAGE_275)

## What actually changed

### HOTFIX: ClaimAccountPage import (20d48a55)
Restored production uptime by fixing a missing import on a route.

### STAGE_271 (6c804788)
Backend/API enforces 3-state compound gating. Home navigation aligned.

### STAGE_271b + STAGE_266 (5c55909d)
Frontend wrappers expressing API gate states in UI/CTA. Welcome video placeholder landed (CTA overlay not clickable per verification).

### HOTFIX Stripe/JWT/admin/copy (4f6489de)
Stripe auth fixes + lead JWT email handling hardened. Admin password correction + copy sweep.

### CHORE gitignore (829c7d39)
Removed heavy assets from tracking, hardened ignore rules.

### STAGE_024 README (3de6131c)
Glass Engine documentation alignment.

### BACKLOG_022 home hero (535f084c)
Hero CTA routes to /compounds (not /register). Copy aligned.

### STAGE_026 + STAGE_027 (54739177, d67d7fe0)
Tier taxonomy canonicalized: free / inner_circle / admin. All legacy refs purged. Cycles.js auth hole caught by verification grep and patched.

### STAGE_029 + 029b (2c1fbb65, ab643476)
Self-healing Stripe lead checkout: stale httpOnly cookie cleared server-side with flag-matched clearCookie. Frontend routes recapture to /compounds email gate.

### STAGE_275 (2fba398b)
GrepGate CTA parity: cold traffic routed to /compounds instead of /register. Button copy: Join Inner Circle.

## Known open issues
- Welcome video Start Here button renders but is not clickable
- Cycle Logs page: no post form exists; copy implies posting for free users
- Profile page blank for admin
- AC-262 mojibake in thread title or component (not compound record)
- GrepGate search input styling discoloration
- Ocular baselines stale

## Next build targets (Amendment 02 critical path)
- STAGE_030: Cycle Logs gating + correct CTA
- STAGE_276: Register/Login rewrite + BackButton
- STAGE_278: AC-262 mojibake fix
- WelcomeVideo CTA click-through
