# ProHP Forum

Evidence-based performance enhancement community - risk first, receipts required.

Built by [ProHormonePro](https://youtube.com/@ProHormonePro). 52+ compounds reviewed · 2M+ YouTube views · 200+ consultations.

**Live:** [forum.prohormonepro.com](https://forum.prohormonepro.com)

---

## What This Is

A structured forum and compound encyclopedia where every compound has a risk tier, hair loss profile, and benefits breakdown. Cycle logs are structured: compound, dose, duration, bloodwork markers, sides, weekly updates.

Risk comes before recommendation. Always.

---

## Access Model

Three-state access control enforced at the API layer. Frontend renders what the API returns.

| State | Auth | Access |
|-------|------|--------|
| **WINDOW** | No cookie, no session | Title, risk tier, category, YouTube video only |
| **LEAD** | `prohp_lead_access` httpOnly cookie | Full encyclopedia grid + expanded fields (mechanism, side effects, summary) |
| **INNER CIRCLE** | Authenticated JWT | Everything: dosing, cycle logs, all rooms, posting, full compound data |

State **INNER CIRCLE** maps to tier value `inner_circle`.

---

## Rules

- Sourcing is centralized. No sourcing in threads or comments. No "where do I buy" posts.
- Vetted sourcing links live in the Encyclopedia. If a compound has no link, it means no source has been vetted yet.
- Discussion areas are for education, risk framing, and documentation only.
- Proof over hype.

Violations are removed. Repeat offenders are banned.

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query |
| Backend | Node.js, Express, JWT auth |
| Database | PostgreSQL 16 |
| Payments | Stripe Checkout + Webhooks (live) |
| Hosting | Ubuntu 24.04 (dedicated servers) |
| Deploy | SOVEREIGN_L5 Swarm + manual hotfixes, both git-tagged |

### Servers

| Server | IP | Role |
|--------|-----|------|
| srv2 | 107.152.45.184 | Production (app + DB + nginx) |
| srv1 | 135.148.32.108 | Secondary / staging |

### Process Management

Backend runs via systemd (`prohp-forum` service). Frontend is a Vite static build served by nginx.

```bash
sudo systemctl status prohp-forum
sudo systemctl restart prohp-forum
cd ~/prohp-forum/frontend && npm run build && sudo systemctl reload nginx
```

---

## User Tiers

Three tiers, canonical. No aliases. No legacy names.

| Tier | Value | Access |
|------|-------|--------|
| Free | `free` | Encyclopedia browsing, GrepGate search, General (read) |
| Inner Circle | `inner_circle` | Full compound data, cycle logs, all rooms, posting |
| Admin | `admin` | Everything + user management + content moderation |

Tier hierarchy in code: `{ free: 0, inner_circle: 1, admin: 2 }`

---

## Auth Model

### Middleware Exports (`backend/src/middleware/auth.js`)

- `authenticate` - requires valid JWT (rejects anonymous)
- `optionalAuth` - attaches user if JWT present, continues if not
- `requireTier(tier)` - requires `user.tier >= specified level`
- `requireAdmin` - requires `user.tier === 'admin'`

### Token Architecture

| Token/Cookie | Storage | Purpose |
|-------------|---------|---------|
| Access token | Zustand store (memory) | JWT with `{userId, tier}`, 15m TTL |
| Refresh token | SHA256 hash in `refresh_tokens` table | 7-day TTL, stored as hash not raw |
| `prohp_lead_access` | httpOnly cookie | Lead JWT with `{lead: true, email}` |

### Zustand Auth Store

```javascript
useAuthStore.getState()._setTokens(access, refresh)  // THE ONLY token setter
useAuthStore.getState().hasTier('inner_circle')        // tier check → boolean
useAuthStore.getState().isAdmin()                       // admin check
```

Do not invent new setter names. The store uses `_setTokens`, not `setToken`/`setTokens`/`setUser`.

### Lead Self-Healing

If a lead cookie is missing the `email` field, the backend clears it server-side and returns `{action: 'recapture'}`. Frontend routes the user back to `/compounds` to re-enter their email.

---

## User Flows

### Email Capture → Lead

User visits `/compounds` → sees `EncyclopediaGate` → submits email → `POST /api/leads` → backend mints `prohp_lead_access` httpOnly cookie → lead-level access granted.

### Payment → Inner Circle

Lead clicks Upgrade → `UpgradeButton` triggers Stripe Checkout → Stripe redirects to `/claim-account?session_id=cs_...` → user sets username + password → `POST /api/claim-account` → backend validates Stripe session, creates user with `tier=inner_circle` → JWT issued, `_setTokens()` called, redirect to `/compounds`.

### Compound Detail Gating (STAGE_271)

API enforces field-level access based on auth state. Window shoppers see title and video. Leads see mechanism and side effects. Inner Circle sees everything including dosing and cycle logs.

### Cycle Logs (STAGE_031)

Inner Circle members create and view structured cycle logs with compound, dose, duration, bloodwork markers, and weekly progress updates. The Lab (`/cycles`) uses living threads where weekly updates are comments on the original cycle post.

### Thread Comments (STAGE_033)

Threaded discussion with replies. Comments live in the thread system.

---

## Database Schema

**users:** id (UUID PK), email (UNIQUE), username (UNIQUE, 3-20 chars), `password_hash` (bcrypt 12 rounds - NOT `password`), tier (`free`/`inner_circle`/`admin`), stripe_customer_id, stripe_subscription_id, subscription_status.

**compounds:** id (UUID PK), slug, name, category, summary, mechanism, side_effects, dosing, risk_tier (`low`/`moderate`/`high`/`extreme`), trust_level, youtube_video_id, youtube_url, causes_hair_loss (boolean), hair_loss_severity (`none`/`mild`/`moderate`/`severe`), company, is_published.

**leads:** email, first_name, last_name, converted_at.

**refresh_tokens:** user_id (UUID FK), `token_hash` (SHA256 - never raw token), expires_at.

**audit_log:** id (serial PK), actor_user_id (UUID), target_user_id (UUID), `action` (text - NOT `event_type`), stripe_event_id, `meta` (JSONB - NOT `metadata`).

**cycle_logs:** id, user_id, title, compound_name, thread_id (UUID FK to threads).

**threads:** id, room_id, user_id, title, content. **rooms:** id, name, slug, read_tier, write_tier.

Column names are canonical. Swarm payloads must match exactly. Schema evolves; refer to migrations for canonical columns.

---

## Environment Variables

Required in backend `.env`:

```
DATABASE_URL=postgresql://prohp:***@127.0.0.1:5432/prohp_forum
JWT_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
STRIPE_SECRET_KEY=<sk_live_...>
STRIPE_WEBHOOK_SECRET=<whsec_...>
STRIPE_PREMIUM_PRICE_ID=<price_...>
STRIPE_INNER_CIRCLE_PRICE_ID=<price_...>
```

Both `STRIPE_PREMIUM_PRICE_ID` and `STRIPE_INNER_CIRCLE_PRICE_ID` are set. The Stripe route has a fallback chain that handles both env var names.

---

## Project Structure

```
prohp-forum/
├── backend/src/
│   ├── index.js              # Express entry, route mounts, helmet, CORS
│   ├── config/db.js          # PostgreSQL pool (require('../config/db'))
│   ├── middleware/auth.js     # JWT auth + tier gates
│   └── routes/
│       ├── auth.js            # Login, register, refresh, fetchMe
│       ├── claim.js           # Stripe session → account creation
│       ├── compounds.js       # Encyclopedia API (3-state gating)
│       ├── cycles.js          # Cycle logs (tier-gated)
│       ├── leads.js           # Email capture + cookie minting
│       ├── rooms.js           # Forum districts
│       ├── stripe.js          # Checkout + webhooks
│       └── threads.js         # Discussion threads + comments
├── frontend/src/
│   ├── App.jsx                # Router + layout shell
│   ├── stores/auth.js         # Zustand: _setTokens, hasTier, isAdmin
│   ├── hooks/api.js           # API client wrapper
│   ├── components/
│   │   ├── EncyclopediaGate.jsx
│   │   ├── GrepGate.jsx       # Search with result gating
│   │   ├── GrepGateCTA.jsx    # Search paywall CTA
│   │   ├── UpgradeButton.jsx  # Stripe checkout trigger
│   │   ├── WelcomeVideo.jsx
│   │   ├── MarkdownRenderer.jsx
│   │   └── layout/ (Navbar, Sidebar, BackButton)
│   └── pages/
│       ├── CompoundsPage.jsx  # Encyclopedia index (gated)
│       ├── CompoundDetail.jsx # Individual compound (3-state)
│       ├── ClaimAccountPage.jsx
│       ├── CyclesPage.jsx / CycleDetail.jsx
│       ├── RoomPage.jsx / ThreadPage.jsx
│       ├── LoginPage.jsx / RegisterPage.jsx
│       ├── CreateThread.jsx
│       └── UserProfile.jsx
├── docs/intel/stages/         # Auto-generated deployment intel
├── _outbox/                   # Intel mirror for L5 swarm sync
└── README.md
```

### Import Path Warnings

| What | Correct | Wrong |
|------|---------|-------|
| Database pool | `require('../config/db')` | `require('../db')` |
| Auth middleware | `require('../middleware/auth')` | anything else |
| Auth store | `from '../stores/auth'` | `from './stores/auth'` |

---

## Deployment

### SOVEREIGN_L5 Swarm

Primary deployment path. An autonomous AI pipeline on Windows that writes, reviews, and deploys code to srv2.

```
inbox/ (drop payload)
  → Watcher (polls 650ms, Windows scheduled task, auto-restart)
  → Seeker (SSH discovery on srv2)
  → Generator
  → Critic
  → Judge
  → Mechanical gates (complexity classifier, contract chain, scope allowlist)
  → Executioner (SSH deploy via payload bridge)
  → outbox/ (INTEL report with SHA256 trace)
```

The pipeline includes a complexity classifier (Profile S/M/L/X) that gates payloads by scope, a four-contract chain (C0: language, C1: file scope, C2: build safety, C3: secret exposure), write-once guards that prevent duplicate INTEL sections, and a code-first stream selector that ships valid `<PROHP_FILE>` blocks regardless of which model produced them.

### Swarm Applier (`swarm_apply.sh`)

Deployment gatekeeper on srv2: parses STAGE/TITLE/ANCHOR from header, runs denylist scan (blocks `sudo`, `rm -rf`, `curl`, `wget`, `ssh`), executes bash block scoped to `~/prohp-forum`, emits intel doc, runs secret scan, atomic commit + SWARM tag + push to GitHub.

### Safety Rails

| Control | Purpose |
|---------|---------|
| Denylist | Blocks destructive shell commands (PCRE word boundaries) |
| Secret scan | Blocks credential leakage to public repo |
| Repo-root lock | All execution scoped to `~/prohp-forum` |
| Scope allowlist | Executioner only touches files declared in payload header |
| Complexity classifier | Auto-elevates profile, hard-stops undeclared X payloads |
| Contract chain | C0-C3 mechanical validation on every deploy |
| Write-once guards | RUN-keyed deduplication prevents duplicate INTEL sections |
| SWARM tags | Immutable provenance: `SWARM_YYYYMMDD_HHMMSS` |
| Intel docs | Human-readable audit trail with SHA256 integrity |

### Surgical Patch Rules

The swarm must never overwrite `index.js` or `App.jsx` in full. These files accumulate route mounts and imports from many stages. Full rewrites drop helmet config, middleware, and route mounts. Allowed: 2-line additions (one import, one route/mount). Forbidden: full heredoc replacement.

---

## Deployment History

Key stages deployed since February 2026:

| Stage | What | Status |
|-------|------|--------|
| 215 | Forum API MVP - systemd, PostgreSQL, nginx, 50 compounds | SEALED |
| 221 | Voice Codex - UI language aligned to Codex V2 | SEALED |
| 226 | sovereign-seal v0.1.0 published to PyPI + GitHub | SEALED |
| 271 | API-enforced compound detail gating (3-state) | SEALED |
| 271b | Frontend CTA wrappers + UpgradeButton | SEALED |
| 266 | Stripe key fix + lead JWT email + admin reset | SEALED |
| HOTFIX_STRIPE | Stripe e2e checkout verification | SEALED |
| 275 | GrepGate CTA → Stripe parity | SEALED |
| 029 | Stripe email self-healing | SEALED |
| 030/030b | Cycle logs tier gating | SEALED |
| 031/031b | Cycle log creation UI + form | SEALED |
| 032 | Cycle detail page + weekly updates + logout | SEALED |
| 033 | Thread comments | SEALED |
| 037/037b | Payload bridge + code-first stream selection + denylist fix | SEALED |
| 038a/b/c | Audit contract injection + scope allowlist enforcement | SEALED |
| 039 | Meta enrichment + contract chain + complexity classifier + 70x multiplier fix | SEALED |

Canonical stage receipts live in `docs/intel/stages/` and `_outbox/`.

---

## Git History

Every deployment is tagged. Intel docs live in `docs/intel/stages/`.

Current baseline: `STAGE_270_BASELINE` at commit `54b3be5`.

Git chain: `974b347` → `54b3be5` → `ddc60af` → `7800378` → `81be4d0` (+ SWARM tags from applier deploys).

Public repo: [github.com/prohormonePro/proHP-forum](https://github.com/prohormonePro/proHP-forum)

---

## Brand

| Token | Value |
|-------|-------|
| Primary Blue | `#229DD8` |
| Glow | `rgba(34, 157, 216, 0.12)` |
| Button Class | `prohp-btn-primary` |
| Tagline | Proof Over Hype |
| Anchor | `E3592DC3` |

---

## Backlog

Active items tracked as of March 2, 2026:

| # | Item | Status |
|---|------|--------|
| 001 | Sidebar read/write gate bug | QUEUED |
| 002 | Kill outbound Watch links | QUEUED |
| 003 | Dylan M quote → real screenshot | QUEUED |
| 004 | DB credential rotation post-launch | QUEUED |
| 007 | OCULAR auto-capture hook | QUEUED |
| 008 | Swarm preflight gate (schema discovery) | QUEUED |
| 011 | Softr encyclopedia redirect | QUEUED |
| 012 | Product detail URL redirects | QUEUED |
| 013 | Founding member badge + coupon | QUEUED |
| 014 | Voice message feature | QUEUED |
| 015 | Airtable cord-cut | QUEUED |

Additional: profile page blank, AC-262 mojibake in thread title, welcome video CTA not clickable, GrepGate search discoloration on compound pages.

---

## Security

Never paste secrets (API keys, DB URLs, private keys) into payloads, docs, or tickets. Secrets live in `.env` only.

---

## Related Projects

| Project | Description |
|---------|-------------|
| [sovereign-seal](https://github.com/prohormonePro/sovereign-seal) | Deterministic governance layer for autonomous AI agents. [PyPI](https://pypi.org/project/sovereign-seal/0.1.0/) |
| ProHP VSO | VA disability claims automation tool (prohpvso.com) |
| USPTO 63/907,226 | Sovereign Spine System - cryptographic verification architecture |

---

*Built by Travis Dillard · [ProHormonePro](https://youtube.com/@ProHormonePro) · Anchor: E3592DC3*
