# ProHP Forum

The compound encyclopedia that talks back.

86+ compounds reviewed. 2M+ YouTube views. 200+ one-on-one consultations. 130+ community discussions seeded from real users. Three full consultation case files with bloodwork analysis. Risk first, receipts required.

Built by [Travis Dillard](https://youtube.com/@ProHormonePro). Live at [forum.prohormonepro.com](https://forum.prohormonepro.com).

---

## Why This Exists

There are maybe three supplement forums on the entire internet, and none of them are built around prohormones. The ones that exist are general fitness boards where compound discussion gets buried under protein powder reviews and workout splits. Nobody is structuring real cycle data. Nobody is tying bloodwork to dosing protocols. Nobody is making users prove what they claim.

ProHP Forum is the first platform built specifically for the prohormone and SARM community with structured evidence at the center. Every compound gets a risk tier before you see a single benefit. Every compound page then layers three forms of evidence: consultation case files, structured experience reports, and community discussion. Together they create a living record of how compounds actually perform in the real world.

Every cycle log requires structure: compound, dose, duration, bloodwork markers, sides, weekly updates. Every consultation case file includes real lab values and real outcomes.

First commit hit GitHub on February 14, 2026. Eighteen days later: 86+ compounds, 94 discussion threads, 130 seeded posts, structured cycle logs, Stripe payments live, and an autonomous AI swarm deploying code to production.

The rule is simple. Proof over hype. If you can't back it up, don't post it.

---

## What's Inside

**Compound Encyclopedia.** 86+ compounds with risk tier, hair loss profile, mechanism breakdown, side effects, and dosing protocols. Each compound page contains three layers of evidence: consultation case files, structured experience reports, and community discussion. That stack creates a living record of how compounds actually perform in the real world.

**Cycle Logs.** Structured logs with weekly updates in The Lab. Not "I took this and got big." Actual compound, actual dose, actual duration, actual bloodwork, actual sides. Weekly check-ins. This is where proof lives.

**Three-State Access.** Window shoppers see the risk tier and YouTube video. Leads (email captured) see the mechanism and side effects. Inner Circle members ($19/mo) see everything: full articles, dosing protocols, nutrition labels, 20% discount codes, and the ability to post. The API enforces what you see. The frontend just renders it.

**Community Discussion.** 130+ posts migrated from Common Ninja with original timestamps and reply threading. 94 compound discussion threads. Andriol alone has 34 posts with nested replies covering AI use, stacking, estrogen management, and real cycle results.

---

## The Access Model

| Who You Are | What You See | What You Can Do |
|---|---|---|
| Window Shopper | Name, risk tier, category, YouTube video, product image | Browse, watch |
| Lead | + mechanism, side effects, benefits, article preview, comments (read) | Search, read discussions |
| Inner Circle | + full articles, dosing, nutrition labels, 20% discount, cycle logs | Post, comment, log cycles, full access |

State is enforced at the API layer. Frontend renders what the API returns. No client-side gating.

---

## What This Is Not

No sourcing in threads or comments. No "where do I buy" posts. Vetted sourcing links live in the Encyclopedia. If a compound doesn't have a link, it means no source has been vetted yet. That's intentional.

No reckless coaching. If someone has two years or less under the bar, the compounds will still be here when they're ready.

No hype. If you can't back it up, don't post it. If a manufacturer claims something, say so. "They're calling it X" is different than "X does Y."

This isn't a marketplace. It's a research library that happens to have a comment section.

Violations are removed. Repeat offenders are banned.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, Zustand, TanStack Query |
| Backend | Node.js, Express, JWT auth |
| Database | PostgreSQL 16 |
| Payments | Stripe Checkout + Webhooks (live) |
| Hosting | Ubuntu 24.04, dedicated servers |
| Deploy | SOVEREIGN_L5 autonomous AI swarm + surgical hotfixes, all git-tagged |

**Servers:** srv2 (107.152.45.184, production) · srv1 (135.148.32.108, staging)

**Process:** Backend via systemd (`prohp-forum`). Frontend is Vite static build served by nginx.

---

## How It Gets Built

This forum is built and deployed by an autonomous AI swarm called SOVEREIGN_L5. Two Claude Opus 4.6 instances co-build and co-audit every stage. GPT 5.3 acts as the recursive forecaster, auditing the current stage while architecting the next. Three-node consensus required before anything hits production.

The swarm doesn't ask permission. It processes payloads, writes code, reviews code, deploys to srv2, and generates INTEL receipts with SHA256 integrity traces. Every deployment is git-tagged. Every stage has a receipt.

No manual builds. No copy-paste deploys. The builder builds the builder.

```
Payload → inbox/
  → Watcher (650ms poll, auto-restart)
  → Seeker (SSH discovery: DB schema, routes, file state)
  → Generator (writes code)
  → Critic (reviews)
  → Judge (approves or blocks)
  → Mechanical gates (complexity classifier, contract chain, scope allowlist)
  → Executioner (SSH deploy via payload bridge)
  → Swarm Applier (denylist + secret scan + atomic commit + SWARM tag + push)
  → INTEL receipt with SHA256 trace → outbox/
```

**Safety rails:** Denylist blocks destructive commands. Secret scan prevents credential leakage. Scope allowlist restricts file access. Complexity classifier (S/M/L/X) auto-elevates on large payloads. Contract chain (C0: language, C1: file scope, C2: build safety, C3: secret exposure) validates every deploy. Write-once guards prevent duplicate INTEL sections. SWARM tags provide immutable provenance.

**Surgical patch rule:** Never overwrite `index.js` or `App.jsx` in full. Two-line additions only (one import, one route mount). Full rewrites drop helmet config and middleware.

---

## Project Structure

```
prohp-forum/
├── backend/src/
│   ├── index.js              # Express entry point
│   ├── config/db.js          # PostgreSQL pool
│   ├── middleware/auth.js     # JWT auth + tier gates
│   └── routes/
│       ├── auth.js            # Login, register, refresh
│       ├── claim.js           # Stripe → account creation
│       ├── compounds.js       # Encyclopedia API (3-state gating)
│       ├── cycles.js          # Cycle logs
│       ├── leads.js           # Email capture
│       ├── rooms.js           # Forum rooms
│       ├── stripe.js          # Checkout + webhooks
│       └── threads.js         # Threads + posts
├── frontend/src/
│   ├── App.jsx                # Router + layout
│   ├── stores/auth.js         # Zustand auth (_setTokens, hasTier, isAdmin)
│   ├── hooks/api.js           # API client
│   ├── components/            # EncyclopediaGate, GrepGate, UpgradeButton, etc.
│   └── pages/                 # CompoundsPage, CompoundDetail, ThreadPage, etc.
├── docs/intel/stages/         # Deployment receipts
├── _outbox/                   # INTEL mirror for swarm sync
└── README.md
```

**Import paths (canonical):**

| What | Correct | Wrong |
|------|---------|-------|
| DB pool | `require('../config/db')` | `require('../db')` |
| Auth middleware | `require('../middleware/auth')` | anything else |
| Auth store | `from '../stores/auth'` | `from './stores/auth'` |

---

## Auth Architecture

**Middleware:** `authenticate` (requires JWT), `optionalAuth` (attaches user if present), `requireTier(tier)`, `requireAdmin`.

**Tiers:** `free` (0), `inner_circle` (1), `admin` (2). Canonical. No aliases.

**Tokens:** Access JWT in Zustand memory (15m TTL). Refresh token as SHA256 hash in DB (7d TTL). Lead cookie `prohp_lead_access` (httpOnly, JWT with `{lead: true, email}`).

**Critical:** The auth store setter is `_setTokens()`. Not `setToken`. Not `setTokens`. Not `setUser`.

**Lead self-healing:** If a lead cookie is missing `email`, backend clears it and returns `{action: 'recapture'}`. Frontend routes back to `/compounds` for re-entry.

---

## User Flows

**YouTube → Compound Page → Lead → Inner Circle.** Someone watches a video, clicks the description link, lands on the compound detail page. Sees risk tier and video (window). Enters email (lead). Reads mechanism and side effects. Sees article preview and discount comparison. Joins Inner Circle via Stripe. Claims account. Full access unlocked.

**Cycle Logging.** Inner Circle member goes to The Lab (`/cycles`). Logs compound, dose, duration, description. System auto-creates a linked discussion thread. Weekly updates posted as comments. Other members reply with advice and similar experiences.

**Compound Gating (STAGE_271).** API enforces field-level access. `pick()` function filters compound fields by gate state. Window gets title + video. Lead gets mechanism + side effects. Member gets everything including dosing and full articles.

---

## Database (Key Tables)

**users** — UUID PK, email (unique), username (unique, 3-20 chars), `password_hash` (bcrypt 12, column is NOT called `password`), tier, stripe_customer_id, stripe_subscription_id, subscription_status.

**compounds** — UUID PK, slug, name, category, risk_tier, mechanism, side_effects, dosing, youtube_url, hair_loss fields, thread_id (FK to threads), product_url, product_price, public_discount_code, company, is_published.

**threads** — UUID PK, room_id, author_id, title, body. Linked via compounds.thread_id and cycle_logs.thread_id.

**posts** — UUID PK, thread_id, author_id, body, parent_id (nested replies), score, is_best_answer (verdict).

**audit_log** — columns: `action` (NOT `event_type`), `meta` (JSONB, NOT `metadata`).

Column names are canonical. Swarm payloads must match exactly.

---

## Environment

```
DATABASE_URL=postgresql://prohp:***@127.0.0.1:5432/prohp_forum
JWT_SECRET / JWT_REFRESH_SECRET
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
STRIPE_PREMIUM_PRICE_ID / STRIPE_INNER_CIRCLE_PRICE_ID
```

Both Stripe price env vars are set. Route has a fallback chain handling both names.

---

## Deployment History

First commit: February 14, 2026. 94+ stages sealed in 18 days.

| Milestone | What |
|-----------|------|
| 215 | Forum API MVP, systemd, PostgreSQL, nginx, 50 compounds |
| 271 | API-enforced compound detail gating (3-state) |
| 271b + 266 | Frontend CTAs + Stripe key fix + admin reset |
| HOTFIX_STRIPE | Stripe e2e checkout verified |
| 031 | Cycle log creation + form |
| 033 | Thread comments |
| 037 | Swarm payload bridge + code-first stream selection |
| 039 | Contract chain + complexity classifier |
| 043 | Compound schema expansion (product URLs, prices, discounts) |
| 045 | Compound article gating |
| CONTENT_SEED | 130 posts, 94 threads, 42 product URLs seeded |
| COMPOUND_THREAD_PIPE | thread_id exposed in API (d4cd417) |

Full receipts in `docs/intel/stages/` and `_outbox/`.

**Git chain:** `974b347` → `54b3be5` → `ddc60af` → `7800378` → `81be4d0` → `b5a59be` → `787a6de` → `f833e53` → `8183314` → `94eff80` → `d4cd417`

**Public repo:** [github.com/prohormonePro/proHP-forum](https://github.com/prohormonePro/proHP-forum)

---

## Roadmap

Features in active development or queued for pre-launch (March 31, 2026):

**YouTube Comment Search.** 7,100+ YouTube comments will be imported into a searchable database. Search by compound, video, or keyword. Five searches on the same compound triggers a banner: "Still looking? Ask the forum." Turns passive YouTube viewers into active forum participants.

**Compound Page Discussion Pipe.** Each compound's discussion thread rendered inline on the compound detail page. 130+ seeded posts become visible the moment this ships. Currently in progress.

**Case Files + Experience Reports.** Three full consultation case files with bloodwork analysis, and 25 structured experience reports from form submissions. Badged, searchable, Grepper-indexed. Three layers of compound evidence on every page.

**Stack Builder.** AI-powered compound stacking tool built on ProHP YouTube content. Inner Circle members get 1-2 builds per month. Higher tiers get unlimited with rate limiting.

---

## Current Backlog

| # | Item | Status |
|---|------|--------|
| 001 | Sidebar read/write gate bug | QUEUED |
| 002 | Kill outbound Watch links | QUEUED |
| 003 | Dylan M quote → real screenshot | QUEUED |
| 004 | DB credential rotation (post-launch) | QUEUED |
| 008 | Swarm preflight gate (schema discovery) | QUEUED |
| 013 | Founding member badge + 30% discount | QUEUED |
| 016 | Verdict toggle (can't unselect/reassign) | QUEUED |
| 046a | Library search + sort + pagination | SEALED |
| 046b | Compound page discussion thread pipe | SEALED |
| 047 | Night Goggles ASCII auditor | QUEUED |
| — | Top nav (sidebar h3 structure) | FIXED |
| 047 | Quote cleanup (no-op, data clean) | SEALED |
| 049 | Broadcaster v2 | OPERATIONAL |
| — | YouTube comment search (7,100+ comments) | PRE-LAUNCH |
| — | Softr comment parity (Jan-Mar 2026 gap) | LAUNCH BLOCKER |

Phase 2 (post-launch): IG DM import, compound intelligence graph, experience reports aggregation, personal avatars from Stripe.

---

## Brand

| Token | Value |
|-------|-------|
| Primary Blue | `#229DD8` |
| Glow | `rgba(34, 157, 216, 0.12)` |
| Button Class | `prohp-btn-primary` |
| Tagline | Proof Over Hype |

---

## Related Projects

**[sovereign-seal](https://github.com/prohormonePro/sovereign-seal)** — Deterministic governance layer for autonomous AI agents. [PyPI](https://pypi.org/project/sovereign-seal/0.1.0/)

**ProHP VSO** — VA disability claims automation at [prohpvso.com](https://prohpvso.com)

**USPTO 63/907,226** — Sovereign Spine System, cryptographic verification architecture

---

## Security

Secrets live in `.env` only. Never in payloads, docs, tickets, or commit messages.

---

Three layers of compound evidence: consultation case files, structured experience reports, and community discussion. That's the knowledge stack nobody else has — and the reason this encyclopedia talks back.

*Built by Travis Dillard · [ProHormonePro](https://youtube.com/@ProHormonePro) · Anchor: E3592DC3*
