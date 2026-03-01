# ProHP Forum

Evidence-based performance enhancement community. Built by [ProHormonePro](https://youtube.com/@ProHormonePro).

**Live:** [forum.prohormonepro.com](https://forum.prohormonepro.com)

---

## What This Is

A structured forum where every compound has a risk tier, hair loss profile, and benefits breakdown. Cycle logs are structured: compound, dose, duration, bloodwork, sides. No sourcing discussion. No vendor names for grey-market compounds.

Risk comes before recommendation. Always.

---

## Stack

| Layer    | Technology                                            |
|----------|-------------------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query |
| Backend  | Node.js, Express, JWT auth                            |
| Database | PostgreSQL 16                                         |
| Payments | Stripe Checkout + Webhooks                            |
| Hosting  | Ubuntu 24.04 (dedicated servers)                      |
| Deploy   | SOVEREIGN_L5 Swarm + manual hotfixes, both git-tagged |

### Servers

| Server | IP               | Role                          |
|--------|------------------|-------------------------------|
| srv2   | 107.152.45.184   | Production (app + DB + nginx) |
| srv1   | 135.148.32.108   | Secondary / staging           |

### Process Management

Backend runs via systemd (`prohp-forum` service). Frontend is a Vite static build served by nginx.

```bash
# Backend
sudo systemctl status prohp-forum
sudo systemctl restart prohp-forum

# Frontend rebuild
cd ~/prohp-forum/frontend && npm run build && sudo systemctl reload nginx
```

---

## User Tiers

Three tiers, canonical. No aliases. No legacy names.

| Tier             | Value          | Access                                               |
|------------------|----------------|------------------------------------------------------|
| Free             | `free`         | Encyclopedia browsing, GrepGate search, General (read) |
| Inner Circle     | `inner_circle` | Full compound data, cycle logs, all rooms            |
| Admin            | `admin`        | Everything + user management + content moderation    |

Tier hierarchy in code: `{ free: 0, inner_circle: 1, admin: 2 }`

---

## Auth Model

### Middleware Exports

```
authenticate       — requires valid JWT (rejects anonymous)
optionalAuth       — attaches user if JWT present, continues if not
requireTier(tier)  — requires user.tier >= specified level
requireAdmin       — requires user.tier === 'admin'
```

All exported from `backend/src/middleware/auth.js`.

### Token Architecture

| Token/Cookie         | Storage                    | Purpose                             |
|----------------------|----------------------------|-------------------------------------|
| Access token         | Zustand store (memory)     | JWT with `{userId, tier}`, 15m TTL  |
| Refresh token        | SHA256 hash in `refresh_tokens` table | 7-day TTL, stored as hash not raw |
| `prohp_lead_access`  | httpOnly cookie            | Lead JWT with `{lead: true, email}` |

### Zustand Auth Store

```javascript
// Token setter (the ONLY way to persist tokens):
useAuthStore.getState()._setTokens(access, refresh)

// Tier check:
useAuthStore.getState().hasTier('inner_circle')  // returns boolean

// Admin check:
useAuthStore.getState().isAdmin()
```

**Do not invent new setter names.** The store uses `_setTokens`, not `setToken`/`setTokens`/`setUser`.

### Lead Self-Healing

If a lead cookie is missing the `email` field (legacy/corrupted), the backend clears it server-side and returns `{action: 'recapture'}`. The frontend routes the user back to `/compounds` to re-enter their email.

---

## User Flows

### Email Capture (Lead)

1. User visits `/compounds` → sees `EncyclopediaGate`
2. Submits email → `POST /api/leads`
3. Backend mints `prohp_lead_access` httpOnly cookie
4. User gains lead-level access to compound index

### Payment (Inner Circle)

1. Lead clicks Upgrade → `UpgradeButton` triggers Stripe Checkout
2. Stripe redirects to `/claim-account?session_id=cs_...`
3. User sets username + password → `POST /api/claim-account`
4. Backend validates Stripe session, creates user with `tier=inner_circle`
5. Issues JWT, frontend calls `_setTokens()`, redirects to `/compounds`

### Compound Detail Gating (DEPLOYED — STAGE_271)

Three-state access control on every compound detail page. Deployed Feb 28, 2026. API enforces field-level access based on auth state.

1. **Window Shopper** (no cookie) — API returns title, risk tier, category, video only
2. **Lead** (lead cookie) — API adds mechanism, side effects, summary
3. **Inner Circle** (authenticated) — API returns everything including dosing, cycle logs

The gate is enforced at the API layer. Frontend renders what the API returns.

---

## Database Schema (Key Tables)

### users

| Column                  | Type     | Notes                                    |
|-------------------------|----------|------------------------------------------|
| id                      | UUID     | PK, auto-generated                       |
| email                   | text     | UNIQUE                                   |
| username                | text     | UNIQUE, 3-20 chars, `[A-Za-z0-9_]`      |
| password_hash           | text     | bcrypt, 12 rounds                        |
| tier                    | text     | `free` / `inner_circle` / `admin`        |
| stripe_customer_id      | text     | Stripe customer reference                |
| stripe_subscription_id  | text     | Active subscription ID                   |
| subscription_status     | text     | `active` / `canceled` / etc.             |

**Critical:** The column is `password_hash`, not `password`. Swarm payloads that use `password` will break inserts.

### compounds

| Column              | Type     | Notes                            |
|---------------------|----------|----------------------------------|
| id                  | UUID     | PK                               |
| slug                | text     | URL-safe identifier              |
| name                | text     | Display name                     |
| category            | text     | Default: `sarm`                  |
| summary             | text     | Short description                |
| mechanism           | text     | Mechanism of action (markdown)   |
| side_effects        | text     | Side effects (markdown)          |
| dosing              | text     | Dosing protocols (markdown)      |
| risk_tier           | text     | `low` / `moderate` / `high` / `extreme` |
| trust_level         | text     | `reviewed` / etc.                |
| youtube_video_id    | text     | 11-char YouTube ID               |
| youtube_url         | text     | Full YouTube URL                 |
| causes_hair_loss    | boolean  |                                  |
| hair_loss_severity  | text     | `none` / `mild` / `moderate` / `severe` |
| company             | text     | Manufacturer                     |
| is_published        | boolean  | Default: true                    |

### leads

| Column       | Type      | Notes                           |
|--------------|-----------|---------------------------------|
| email        | text      | Captured email                  |
| first_name   | text      | Optional                        |
| last_name    | text      | Optional                        |
| converted_at | timestamp | Set when lead claims an account |

### refresh_tokens

| Column     | Type  | Notes                                         |
|------------|-------|-----------------------------------------------|
| user_id    | UUID  | FK to users                                   |
| token_hash | text  | SHA256 hash of refresh token (never raw token) |
| expires_at | timestamp | 7-day TTL                                 |

### audit_log

| Column          | Type   | Notes                     |
|-----------------|--------|---------------------------|
| id              | serial | PK                        |
| actor_user_id   | UUID   |                           |
| target_user_id  | UUID   |                           |
| action          | text   | Event description         |
| stripe_event_id | text   | Stripe webhook event ID   |
| meta            | JSONB  | Additional context        |

**Column names are canonical.** Not `event_type`, not `metadata`. Swarm payloads must match exactly.

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
├── backend/
│   └── src/
│       ├── index.js                  # Express entry, route mounts, helmet, CORS
│       ├── config/
│       │   └── db.js                 # PostgreSQL pool (THIS is the import path)
│       ├── middleware/
│       │   └── auth.js               # JWT auth + tier gates
│       └── routes/
│           ├── auth.js               # Login, register, refresh, fetchMe
│           ├── claim.js              # Stripe session → account creation
│           ├── compounds.js          # Encyclopedia API
│           ├── cycles.js             # Cycle logs
│           ├── leads.js              # Email capture + cookie minting
│           ├── rooms.js              # Forum districts
│           ├── stripe.js             # Checkout + webhooks
│           └── threads.js            # Discussion threads
├── frontend/
│   └── src/
│       ├── App.jsx                   # Router + layout shell
│       ├── stores/
│       │   └── auth.js               # Zustand: _setTokens, hasTier, isAdmin
│       ├── hooks/
│       │   └── api.js                # API client wrapper
│       ├── components/
│       │   ├── EncyclopediaGate.jsx  # Email capture overlay
│       │   ├── GrepGate.jsx          # Search with result gating
│       │   ├── GrepGateCTA.jsx       # Search paywall CTA
│       │   ├── UpgradeButton.jsx     # Stripe checkout trigger
│       │   ├── WelcomeVideo.jsx      # Onboarding video
│       │   ├── MarkdownRenderer.jsx  # Markdown → React
│       │   └── layout/
│       │       ├── Navbar.jsx        # Top nav: search, auth, profile
│       │       ├── Sidebar.jsx       # Districts, Explore, rooms
│       │       └── BackButton.jsx    # Navigation breadcrumb
│       └── pages/
│           ├── Home.jsx              # Landing / welcome
│           ├── CompoundsPage.jsx     # Encyclopedia index (gated)
│           ├── CompoundDetail.jsx    # Individual compound view
│           ├── ClaimAccountPage.jsx  # Post-Stripe account setup
│           ├── CyclesPage.jsx        # Cycle logs
│           ├── RoomPage.jsx          # Discussion room
│           ├── ThreadPage.jsx        # Individual thread
│           ├── LoginPage.jsx         # Login form
│           ├── RegisterPage.jsx      # Registration form
│           ├── CreateThread.jsx      # New thread form
│           └── UserProfile.jsx       # Profile page
├── docs/
│   └── intel/
│       └── stages/                   # Auto-generated deployment intel
├── _outbox/                          # Intel mirror for L5 swarm sync
└── README.md
```

### Import Path Warnings

| What                | Correct                    | Wrong                |
|---------------------|----------------------------|----------------------|
| Database pool       | `require('../config/db')`  | `require('../db')`   |
| Auth middleware      | `require('../middleware/auth')` | anything else   |
| Auth store (frontend) | `from '../stores/auth'`  | `from '../stores/auth.js'` sometimes works but be consistent |

---

## Deployment

### SOVEREIGN_L5 Swarm

Primary deployment path. An autonomous AI pipeline on Windows that writes, reviews, and deploys code to srv2.

```
inbox/ (drop .md payload)
  → Watcher (polls 650ms)
  → Seeker (SSH discovery on srv2)
  → Generator (Claude Sonnet)
  → Critic (Gemini Flash)
  → Judge (GPT o1)
  → Executioner (SSH deploy)
  → outbox/ (INTEL report with SHA256 trace)
```

### Swarm Applier (`swarm_apply.sh`)

Deployment gatekeeper on srv2:

1. Parses STAGE, TITLE, ANCHOR from payload header
2. Denylist scan: blocks `sudo`, `rm -rf`, `curl`, `wget`, `ssh`
3. Executes bash block scoped to `~/prohp-forum`
4. Emits intel doc to `docs/intel/stages/`
5. Secret scan: rejects API keys, DB URLs, private keys
6. Atomic commit + SWARM tag + push to GitHub

### Manual Hotfixes

When the swarm can't handle a deploy (schema mismatches, emergency fixes), manual deployment is allowed. Same tagging convention, same commit messages.

### Safety Rails

| Control           | Purpose                                                    |
|-------------------|------------------------------------------------------------|
| Denylist          | Blocks destructive shell commands before execution         |
| Secret scan       | Blocks credential leakage to public repo                   |
| Repo-root lock    | All execution scoped to `~/prohp-forum`                    |
| SWARM tags        | Immutable provenance: `SWARM_YYYYMMDD_HHMMSS`             |
| Intel docs        | Human-readable audit trail with SHA256 integrity           |

### Surgical Patch Rules

The swarm must **never** overwrite `index.js` or `App.jsx` in full. These files accumulate route mounts and imports from many stages. Full rewrites drop helmet config, middleware, and route mounts.

**Allowed:** 2-line additions (one import, one route/mount).
**Forbidden:** Full heredoc replacement of either file.

---

## Git History

Every deployment is tagged. Intel docs live in `docs/intel/stages/`.

Current baseline: `STAGE_270_BASELINE` at commit `54b3be5`.

Git chain: `974b347` → `54b3be5` → `ddc60af` → `7800378` → `81be4d0` (+ SWARM tags from applier deploys).

Public repo: [github.com/prohormonePro/proHP-forum](https://github.com/prohormonePro/proHP-forum)

---

## Brand

| Token        | Value                      |
|--------------|----------------------------|
| Primary Blue | `#229DD8`                  |
| Glow         | `rgba(34, 157, 216, 0.12)` |
| Button Class | `prohp-btn-primary`        |
| Tagline      | Proof Over Hype            |
| Anchor       | `E3592DC3`                 |

---

## Known Issues / Backlog

Active backlog is tracked in operator memory and conversation history. Key items:

- **Cycle logs post form:** Inner Circle members can view but no post UI exists yet.
- **Welcome video CTA:** Start Here overlay renders but is not clickable.
- **Profile page:** Renders blank for all users.
- **AC-262 mojibake:** Encoding bug in thread title (not compound record).
- **DB credential rotation (#004):** Post-launch security hardening.
- **Swarm preflight gate (#008):** Schema validation before code generation to prevent hallucinated column names.

Full backlog: 22+ items tracked. See conversation history for current status.

---

*Built by Travis Dillard · [ProHormonePro](https://youtube.com/@ProHormonePro) · Anchor: E3592DC3*
