# SOVEREIGN_MEMORY.md
## ProHP Forum — Swarm Spine File
**Anchor:** E3592DC3
**Doctrine:** Evidence=what IS. Canon=what MATTERS. Patterns=HOW.
**Rule:** Read this before every payload. Update this after every sealed stage.

---

## 1. PURPOSE

This file is the swarm's persistent memory. It replaces chat-memory for all operational facts.
Every payload starts here. Every sealed stage updates here.
Nothing in this file is lore. Everything is queryable operational truth.

Sources are marked:
- `[CONFIRMED]` — sourced from sealed stage receipt, git output, or direct recon
- `[INFERRED]` — sourced from Amendment 04, blueprint, or prior session logs
- `[NEEDS REFRESH]` — must be verified by live recon before use in payload

---

## 2. REPO SNAPSHOT

| Field | Value | Source |
|-------|-------|--------|
| Git head | `727add9` | [CONFIRMED] Mar 6 session |
| Branch | `main` | [CONFIRMED] |
| Latest bundle | `index-CKTmiJRr.js` | [CONFIRMED] |
| Remote | `github.com/prohormonePro/proHP-forum` | [CONFIRMED] |
| srv2 path | `~/prohp-forum` | [CONFIRMED] |
| srv2 IP | `107.152.45.184` | [CONFIRMED] |
| srv1 IP | `135.148.32.108` | [CONFIRMED] |

**Last 20 commits (CONFIRMED — live git log 2026-03-07):**
```
727add9 feat(056): verdict toggle UI - mark/unmark on all posts
af81370 feat(055): gate compound discussion by tier - window/lead/member
6f30475 fix(054): request coverage card for no-video compounds
1917ff6 feat(054): request coverage card for compounds without video
300788a fix(053): complete sort dropdown + queryFn update
8f3f9a4 feat(053): sort dropdown on CompoundsPage + count update to 86+
48f9698 fix(050): verdict toggle - click to unmark/reassign best answer
8c63833 docs: update backlog - 046a/046b SEALED, nav FIXED, #033 CLOSED, broadcaster OPERATIONAL
ca94c52 feat(046a): compounds pagination + sort backend, room page pagination fix
a516e9d fix: sidebar nav - Home link moved outside h3 tag
9a15c34 fix: add background video to public/videos (was missing from server)
21cce1e feat(046b): compound discussion thread pipe - inline posts on compound pages [tag: STAGE_046b_20260304_170254]
ee325b2 docs: rewrite README with evidence stack + rules + roadmap
d4cd417 expose thread_id in WINDOW_FIELDS for compound discussion pipe
94eff80 STAGE_045: compound article gating, discount comparison, product image, nutrition label, mojibake fix [tag: STAGE_045_SEALED]
8183314 STAGE_044_CODE_PROHP_FORUM_CYCLE_LOG_UX_V1
f833e53 STAGE_043_DB_PROHP_FORUM_COMPOUNDS_SCHEMA_COLUMNS_V1
787a6de fix: strip BOM encoding corruption from README
b5a59be fix: UUID parseInt reply bug + remark-gfm URL auto-linking
a0a7cdd Clarify sourcing rules and cycle log structure
```

---

## 3. FRONTEND PAGE MAP

| File | Route | Tier Gate | Notes | Source |
|------|-------|-----------|-------|--------|
| `Home.jsx` | `/` | None (public) | Welcome page, marquee, dual CTA | [CONFIRMED] |
| `CompoundsPage.jsx` | `/compounds` | Lead gate (email modal) | Sort dropdown live (053). Background video hardening needed. | [CONFIRMED] |
| `CompoundDetail.jsx` | `/compounds/:slug` | 3-state: window/lead/member | Gate on overview, articles, discussion, dosing, nutrition label | [CONFIRMED] |
| `ThreadPage.jsx` | `/t/:id` | Inner Circle (paid) | Verdict toggle live (056). OP/admin can Mark/Unmark. | [CONFIRMED] |
| `CycleLogDetail.jsx` | `/cycles/:id` | Inner Circle (paid) | Verdict toggle UI NOT YET DEPLOYED (STAGE_058 queued) | [CONFIRMED] |
| `CyclesPage.jsx` | `/cycles` | Inner Circle (paid) | The Lab room | [CONFIRMED] |
| `CreateThread.jsx` | `/create-thread` | Inner Circle (paid) | [CONFIRMED] |
| `RoomPage.jsx` | `/rooms/:slug` | optionalAuth | Room listing | [CONFIRMED] |
| `UserProfile.jsx` | `/u/:username` | None (public GET) | Public profile page | [CONFIRMED] |
| `LoginPage.jsx` | `/login` | None | [CONFIRMED] |
| `RegisterPage.jsx` | `/register` | None | Standard register | [CONFIRMED] |
| `ClaimAccountPage.jsx` | `/claim-account` | None | Post-Stripe credential creation — short-lived token | [CONFIRMED] |

---

## 4. BACKEND ROUTE MAP

**Base path:** All routes served from `backend/src/routes/`
**API prefix:** `/api`

| File | Method | Path | Auth Required | Notes | Source |
|------|--------|------|---------------|-------|--------|
| `auth.js` | POST | `/api/auth/register` | None | [CONFIRMED] |
| `auth.js` | POST | `/api/auth/login` | None | Returns JWT | [CONFIRMED] |
| `auth.js` | POST | `/api/auth/refresh` | None | JWT refresh | [CONFIRMED] |
| `auth.js` | POST | `/api/auth/logout` | authenticate | [CONFIRMED] |
| `auth.js` | GET | `/api/auth/me` | authenticate | Returns current user | [CONFIRMED] |
| `claim.js` | POST | `/api/claim` | None | Post-Stripe account creation | [CONFIRMED] |
| `compounds.js` | GET | `/api/compounds` | None (optionalAuth inferred) | Returns field set based on tier | [CONFIRMED] |
| `compounds.js` | GET | `/api/compounds/categories` | None | Returns category list | [CONFIRMED] |
| `compounds.js` | GET | `/api/compounds/:slug` | optionalAuth | 3-state gate enforced here | [CONFIRMED] |
| `cycles.js` | GET | `/api/cycles` | optionalAuth | [CONFIRMED] |
| `cycles.js` | POST | `/api/cycles` | authenticate + requireTier('inner_circle') | Create cycle log | [CONFIRMED] |
| `cycles.js` | GET | `/api/cycles/:id` | optionalAuth | [CONFIRMED] |
| `cycles.js` | POST | `/api/cycles/:id/updates` | authenticate + requireTier('inner_circle') | Weekly update | [CONFIRMED] |
| `leads.js` | POST | `/api/leads` | None | Email capture, sets lead cookie | [CONFIRMED] |
| `leads.js` | GET | `/api/leads/check` | None | Check lead cookie status | [CONFIRMED] |
| `posts.js` | POST | `/api/posts` | authenticate | Create post/reply | [CONFIRMED] |
| `posts.js` | POST | `/api/posts/:id/vote` | authenticate | Upvote/downvote post | [CONFIRMED] |
| `posts.js` | POST | `/api/posts/:id/best-answer` | authenticate | Toggle verdict | [CONFIRMED] |
| `rooms.js` | GET | `/api/rooms` | optionalAuth | List rooms | [CONFIRMED] |
| `rooms.js` | GET | `/api/rooms/:slug` | optionalAuth | Single room | [CONFIRMED] |
| `stripe.js` | POST | `/api/stripe/create-checkout-session` | authenticate | Opens Stripe checkout (logged-in) | [CONFIRMED] |
| `stripe.js` | POST | `/api/stripe/create-lead-checkout` | None | Opens Stripe checkout (lead/no account) | [CONFIRMED] |
| `threads.js` | GET | `/api/threads/:id` | optionalAuth | Returns thread + posts | [CONFIRMED] |
| `threads.js` | POST | `/api/threads` | authenticate | Create thread | [CONFIRMED] |
| `threads.js` | POST | `/api/threads/:id/vote` | authenticate | Upvote/downvote thread | [CONFIRMED] |
| `threads.js` | GET | `/api/threads/search/query` | optionalAuth | Full-text search | [CONFIRMED] |
| `users.js` | GET | `/api/users/:username` | None | Public profile | [CONFIRMED] |
| `health` | GET | `/api/health` | None | Verify command target | [CONFIRMED] |

**⚠ NOTE:** No separate `/api/stripe/webhook` route visible in grep — may be registered directly in `index.js` (raw body required). Verify before touching Stripe webhook logic.

---

## 5. AUTH / TIER RULES

**Canonical middleware exports** `[CONFIRMED — STAGE_026+027]`:
```js
{ authenticate, requireTier, requireAdmin, optionalAuth, TIER_LEVELS }
```

**Canonical tiers** — ONLY these three exist:
```
free          (lead/email-captured, no account)
inner_circle  (paid $19/mo via Stripe)
admin         (prohormonepro account)
```

**DEAD — never use:**
- `lab_rat`, `premium`, `elite`, `brother_in_arms`, `Brothers in Arms`, `Airlock`

**Gate states on compound pages** (3-state, not same as tiers):
```
window  → no lead cookie, no auth
lead    → has prohp_lead_access cookie (JWT, lead=true)
member  → authenticated, tier=inner_circle OR tier=admin
```

**Field access by gate state** `[CONFIRMED — Amendment 04 + STAGE_271]`:
- WINDOW: id, slug, name, category, risk_tier, trust_level, summary, youtube_video_id, youtube_url, causes_hair_loss, hair_loss_severity, company, is_published, created_at, updated_at, product_url, product_image_url, public_discount_code, product_price
- LEAD: above + mechanism, side_effects, benefits, compounds_list, article_preview
- MEMBER: full row including article_content, member_discount_code, nutrition_label_url

**LEAK PREVENTION — NON-NEGOTIABLE:**
These fields MUST NEVER appear in window or lead responses:
- `article_content`
- `member_discount_code`
- `nutrition_label_url`

Backend uses `pick()` + safety-net `delete`. Belt and suspenders.

---

## 6. DB SCHEMA SNAPSHOT

**Connection:** `postgresql://prohp:***@127.0.0.1:5432/prohp_forum` `[CONFIRMED]`

### `compounds` table `[CONFIRMED — Amendment 04 §10 + STAGE_271]`
| Column | Type | Gate | Notes |
|--------|------|------|-------|
| id | UUID | All | |
| slug | TEXT | All | URL key |
| name | TEXT | All | |
| category | TEXT | All | |
| risk_tier | TEXT | All | Color-coded badge |
| trust_level | TEXT | All | |
| summary | TEXT | All | |
| youtube_video_id | TEXT | All | NULL = show request card |
| youtube_url | TEXT | All | |
| causes_hair_loss | BOOL | All | |
| hair_loss_severity | TEXT | All | |
| company | TEXT | All | |
| is_published | BOOL | All | |
| product_url | TEXT | All | |
| product_image_url | TEXT | All | |
| public_discount_code | TEXT | All | Default: 'TRAVISD' |
| product_price | DECIMAL(10,2) | All | For discount comparison |
| mechanism | TEXT | Lead+ | |
| side_effects | TEXT | Lead+ | |
| benefits | TEXT | Lead+ | |
| compounds_list | TEXT | Lead+ | |
| article_preview | TEXT | Lead+ | First paragraph teaser |
| article_content | TEXT | Member only | **NEVER leak** |
| member_discount_code | TEXT | Member only | **NEVER leak** |
| nutrition_label_url | TEXT | Member only | **NEVER leak** |
| thread_id | UUID FK→threads | All | Linked discussion thread |
| created_at | TIMESTAMPTZ | All | |
| updated_at | TIMESTAMPTZ | All | |

**⚠ STATUS:** All 86 compounds have empty `article_content` and `article_preview`. Content seeding is the launch blocker.

### `users` table `[CONFIRMED — live \d users 2026-03-07]`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, uuid_generate_v4() |
| email | TEXT NOT NULL | UNIQUE — binding key from Stripe |
| password_hash | TEXT NOT NULL | |
| username | TEXT NOT NULL | UNIQUE |
| display_name | TEXT | |
| bio | TEXT | Default: '' |
| avatar_url | TEXT | |
| tier | TEXT NOT NULL | Default: 'free'. CHECK: free/inner_circle/admin |
| stripe_customer_id | TEXT | UNIQUE (when not null) |
| stripe_sub_id | TEXT | |
| stripe_sub_status | TEXT | CHECK: none/active/past_due/canceled/trialing. Default: 'none' |
| reputation | INTEGER NOT NULL | Default: 0 |
| is_founding | BOOLEAN NOT NULL | Default: false — **NOT `founding_badge`** |
| is_verified | BOOLEAN NOT NULL | Default: false |
| is_banned | BOOLEAN NOT NULL | Default: false |
| created_at | TIMESTAMPTZ NOT NULL | |
| updated_at | TIMESTAMPTZ NOT NULL | Auto-updated via trigger |
| last_login_at | TIMESTAMPTZ | |
| email_verified_at | TIMESTAMPTZ | |
| stripe_subscription_id | TEXT | UNIQUE (when not null) — duplicate of stripe_sub_id, both exist |
| subscription_status | TEXT | Duplicate of stripe_sub_status, both exist |
| subscription_ends_at | TIMESTAMPTZ | |

**⚠ LANDMINE:** Founding member column is `is_founding` (boolean), NOT `founding_badge`. Any payload referencing `founding_badge` will fail.
**⚠ NOTE:** Duplicate Stripe columns exist (`stripe_sub_id` + `stripe_subscription_id`, `stripe_sub_status` + `subscription_status`). Use `stripe_subscription_id` and `subscription_status` for new code — they have unique indexes.

### `leads` table `[CONFIRMED — Amendment 01 §3.1]`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| email | TEXT | |
| first_name | TEXT | |
| last_name | TEXT | |
| created_at | TIMESTAMPTZ | |
| converted_at | TIMESTAMPTZ | NULL until payment |
| source | TEXT | |

### `threads` table `[CONFIRMED — live \d threads 2026-03-07]`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| room_id | UUID FK→rooms | NOT NULL, CASCADE delete |
| author_id | UUID FK→users | NOT NULL, CASCADE delete — OP for verdict |
| compound_id | UUID FK→compounds | NULLABLE — links thread to compound |
| title | TEXT NOT NULL | 3-200 chars |
| body | TEXT NOT NULL | min 10 chars |
| is_pinned | BOOLEAN NOT NULL | Default: false |
| is_locked | BOOLEAN NOT NULL | Default: false |
| is_deleted | BOOLEAN NOT NULL | Default: false |
| upvotes | INTEGER NOT NULL | Default: 0 |
| downvotes | INTEGER NOT NULL | Default: 0 |
| score | INTEGER | GENERATED: upvotes - downvotes |
| reply_count | INTEGER NOT NULL | Default: 0, auto-updated via trigger |
| view_count | INTEGER NOT NULL | Default: 0 |
| last_reply_at | TIMESTAMPTZ | |
| last_reply_by | UUID FK→users | NULLABLE, SET NULL on delete |
| created_at | TIMESTAMPTZ NOT NULL | |
| updated_at | TIMESTAMPTZ NOT NULL | Auto-updated via trigger |
| search_vector | TSVECTOR | Auto-updated via trigger for full-text search |

**⚠ NOTE:** `compound_id` is the FK that links threads to compounds (not `thread_id` on compounds — both directions exist). Full-text search index on `search_vector` via GIN.

### `posts` table `[CONFIRMED — live \d posts 2026-03-07]`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | uuid_generate_v4() |
| thread_id | UUID FK→threads NOT NULL | CASCADE delete |
| author_id | UUID FK→users NOT NULL | CASCADE delete |
| parent_id | UUID FK→posts NULLABLE | SET NULL on delete — **column is `parent_id` NOT `parent_post_id`** |
| body | TEXT NOT NULL | min 1 char |
| is_best_answer | BOOLEAN NOT NULL | Default: false — verdict toggle target |
| is_helpful | BOOLEAN NOT NULL | Default: false |
| is_deleted | BOOLEAN NOT NULL | Default: false |
| upvotes | INTEGER NOT NULL | Default: 0 |
| downvotes | INTEGER NOT NULL | Default: 0 |
| score | INTEGER | GENERATED: upvotes - downvotes |
| created_at | TIMESTAMPTZ NOT NULL | |
| updated_at | TIMESTAMPTZ NOT NULL | Auto-updated via trigger |

**⚠ LANDMINE:** Reply parent column is `parent_id`, NOT `parent_post_id`. Any payload using `parent_post_id` will silently fail or error.

### `rooms` table `[NEEDS REFRESH — run \d rooms before any room-touching stage]`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| name | TEXT | The Library / The Lab / General (inferred from app behavior) |
| slug | TEXT | Used in `/api/rooms/:slug` route |
| tier_required | TEXT | free/inner_circle (inferred) |
| created_at | TIMESTAMPTZ | |

**⚠ Column set above is inferred.** Run `\d rooms` on srv2 before any stage touching room logic.

### `cycle_updates` table `[CONFIRMED — FK in users \d output]`
Weekly update entries for cycle logs. FK: user_id→users CASCADE, cycle_log_id→cycle_logs (inferred).

### `notifications` table `[CONFIRMED — FK in users \d output]`
Per-user notification records. FK: user_id→users CASCADE.

### `refresh_tokens` table `[CONFIRMED — FK in users \d output]`
JWT refresh token storage. FK: user_id→users CASCADE. Do not touch directly — managed by auth.js.

### `votes` table `[CONFIRMED — FK in users \d output]`
Upvote/downvote records. FK: user_id→users CASCADE. Prevents double-voting. Target: threads and posts via posts.js and threads.js vote routes.

### `cycle_logs` table `[CONFIRMED — STAGE_031 + FK in \d output]`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| user_id | UUID FK→users | CASCADE delete |
| thread_id | UUID FK→threads | Auto-created in The Lab room on cycle log creation |
| compound | TEXT | |
| dose | TEXT | |
| duration | TEXT | |
| description | TEXT | |
| created_at | TIMESTAMPTZ | |

**⚠ NEEDS REFRESH:** Run `\d cycle_logs` on srv2 to confirm full column set before any cycle-touching stage.

### `audit_log` table `[CONFIRMED — auth.js]`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | |
| created_at | TIMESTAMPTZ | |
| actor_user_id | UUID | NOT actor_id |
| target_user_id | UUID | NOT target_id |
| action | TEXT | NOT event_type |
| stripe_event_id | TEXT | |
| meta | JSONB | NOT metadata |

**⚠ LANDMINE:** Column names are NOT `event_type`, `metadata`, `actor_id`. Use exact names above or insert will fail silently.

**DB Schema Confidence Summary:**

Tables fully confirmed by live `\d` (2026-03-07):
- `users`, `threads`, `posts`

Tables confirmed to exist, columns partial/inferred:
- `rooms`, `cycle_logs`, `cycle_updates`, `notifications`, `refresh_tokens`, `votes`

Tables confirmed via sealed stage receipts + Amendment 04:
- `compounds`, `leads`, `audit_log`

---

## 7. PATCH CLASS LIBRARY

### CLASS: `verdict_toggle`
- **Target files:** `frontend/src/pages/ThreadPage.jsx`, `frontend/src/pages/CycleLogDetail.jsx`
- **Backend route:** `POST /api/posts/:id/best-answer`
- **Trigger:** Thread author or admin wants to mark/unmark best answer
- **Pattern:** Button renders on all posts for OP/admin. Label toggles: "Mark Verdict" → "Unmark Verdict" based on `post.is_best_answer`. On click: optimistic UI update + API call + refetch.
- **Verify:** `curl -X POST /api/posts/:id/best-answer -H "Authorization: Bearer <token>"` returns `{is_best_answer: bool, thread_id: uuid}`
- **Failure modes:** Button shows for wrong users (check author_id === thread.author_id), toggle doesn't persist (check optimistic update + refetch), can't unmark (toggle logic bug — STAGE_056 fix)
- **Status:** ThreadPage.jsx DEPLOYED (056). CycleLogDetail.jsx PENDING (STAGE_058).

### CLASS: `tier_gate`
- **Target files:** `frontend/src/pages/CompoundDetail.jsx`, `backend/src/routes/compounds.js`
- **Trigger:** Any content section that shows different content per gate_state
- **Pattern:** API returns `gate_state` field. Frontend ternary: `gate_state === 'member' ? <FullContent> : gate_state === 'lead' ? <Preview> : <EmailCTA>`. Backend: `pick()` fields by gate_state + safety-net `delete result.article_content`.
- **Verify:** Hit `/api/compounds/:slug` with no cookie (window), lead cookie (lead), member JWT (member). Confirm field set matches gate.
- **Failure modes:** Leak of gated fields (check safety-net deletes), wrong gate_state returned (check lead cookie parser), CTA not rendering (check ternary coverage of all three states)
- **Status:** DEPLOYED (STAGE_271 + 055).

### CLASS: `request_card`
- **Target files:** `frontend/src/pages/CompoundDetail.jsx`
- **Trigger:** `compound.youtube_video_id === null`
- **Pattern:** `!compound.youtube_video_id ? <RequestCoverageCard /> : <YouTubeEmbed />`. Card includes "Drop a comment below" CTA linking to discussion section.
- **Verify:** Find a compound with null youtube_video_id in DB. Confirm card renders, embed does not.
- **Failure modes:** Card shows on compounds WITH video (null check wrong), card CTA broken link
- **Status:** DEPLOYED (STAGE_054).

### CLASS: `sort_dropdown`
- **Target files:** `frontend/src/pages/CompoundsPage.jsx`
- **Trigger:** User selects sort option (name, category, risk_tier, etc.)
- **Pattern:** Zustand state for `sortBy`. React Query `queryKey` includes `sortBy`. `queryFn` passes sort param to API. `select` transforms sorted response.
- **Verify:** Change sort. Confirm compound order changes. Confirm URL or state updates.
- **Failure modes:** Sort not triggering refetch (queryKey missing sort), sort param not reaching API, API ignoring sort param
- **Status:** DEPLOYED (STAGE_053).

### CLASS: `comment_pipe`
- **Target files:** `frontend/src/pages/CompoundDetail.jsx`
- **Trigger:** Compound has `thread_id` set in DB
- **Pattern:** On page load, `GET /api/threads/:thread_id` fetches linked thread. Posts rendered below buy section. Post form for members. Read-only for leads. Locked card for window.
- **Verify:** `SELECT thread_id FROM compounds WHERE slug='lgd-4033'` — confirm non-null. Load page as member. Confirm posts render.
- **Failure modes:** thread_id null (compound not linked), posts not rendering (fetch error), post form showing for leads (gate check wrong)
- **Status:** DEPLOYED (STAGE_046b + 055).

### CLASS: `discussion_gate`
- **Target files:** `frontend/src/pages/CompoundDetail.jsx`
- **Trigger:** Discussion/comment section render based on gate_state
- **Pattern:** window → locked card with email CTA. lead → posts visible, reply form hidden, "Join Inner Circle" CTA. member → full read/write.
- **Verify:** Load compound page as each gate state. Confirm correct UI for each.
- **Failure modes:** Lead seeing post form (gate check wrong), member seeing locked card (gate_state not returned correctly), window seeing posts (leak)
- **Status:** DEPLOYED (STAGE_055).

---

## 8. KNOWN LANDMINES

**NEVER do these. No exceptions.**

1. **Never overwrite `index.js` or `App.jsx` fully.** Full rewrites drop helmet/middleware. 2-line surgical additions only.
2. **Never use dead tier names.** `lab_rat`, `premium`, `elite`, `brother_in_arms` do not exist. Using them breaks auth silently.
3. **Never use wrong audit_log column names.** Use `actor_user_id`, `target_user_id`, `action`, `meta`. NOT `event_type`, `metadata`, `actor_id`.
4. **Never leak `article_content`, `member_discount_code`, `nutrition_label_url`** to window or lead responses. Safety-net `delete` must be in every compound route handler.
5. **Never add new DB columns without `IF NOT EXISTS`.** Migrations must be idempotent. `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
6. **Never use `server.js` or `db/pool.js`.** These files do not exist. Entry point is `backend/src/index.js`.
7. **Never use `authStore.js`.** Does not exist in current codebase.
8. **Never patch based on RAW STREAM output** (1341-line full swarm log). Always extract from JUDGE section only (clean output ~400 lines).
9. **Never deploy without RECEIPT.** Every git commit generates INTEL receipt to `C:\ProHP\SOVEREIGN_L5\outbox\` AND `P:\ProHP-Handoff_20250901_232130\.canon\receipts\`.
10. **Never run full rewrite on correction loop.** If swarm enters correction loop, patch the specific failure. Do not regenerate entire files.
11. **Background video on `/compounds` — do not use inline `<video>` tags.** Third time this has broken. Hardened approach needed (STAGE pending).
12. **Top nav was fixed (commit `a516e9d` — Sidebar h3 nesting).** If it breaks again, check `Sidebar.jsx` h3 tag wrapping nav links. Do not treat nav as permanently broken.
13. **Founding member column is `is_founding` (boolean), NOT `founding_badge`.** Any payload using `founding_badge` will silently fail on INSERT/UPDATE.
14. **Reply parent column is `parent_id`, NOT `parent_post_id`.** Three tables confirmed with `parent_id`. Using old name breaks reply threading entirely.
15. **DB has 12 tables total:** audit_log, compounds, cycle_logs, cycle_updates, leads, notifications, posts, refresh_tokens, rooms, threads, users, votes. Do not assume tables that aren't in this list exist.

---

## 9. STAGE LEDGER

| Stage | Commit | Description | Status |
|-------|--------|-------------|--------|
| STAGE_056 | `727add9` | Verdict toggle UI — ThreadPage.jsx dynamic Mark/Unmark | SEALED |
| STAGE_055 | `af81370` | Compound discussion tier gate (window/lead/member) | SEALED |
| STAGE_054 | `6f30475` | Request coverage card for no-video compounds | SEALED |
| STAGE_053 | `300788a` | CompoundsPage sort dropdown | SEALED |
| STAGE_052 | (broadcaster v6, no repo commit) | Broadcaster operational — completion guards, correction loop | SEALED |
| STAGE_051 | `8f3f9a4` | Watch links cleanup | SEALED |
| STAGE_050 | `48f9698` | Verdict toggle backend route | SEALED |
| STAGE_049 | `8c63833` | README/backlog update | SEALED |
| STAGE_046b | `21cce1e` | Compound discussion pipe (compound_thread_pipe) | SEALED |
| STAGE_046a | `ca94c52` | Backend pagination + room pagination, 86 compounds | SEALED |
| STAGE_045 | [NEEDS REFRESH] | Compound article gating V1 | SEALED |
| STAGE_044 | [NEEDS REFRESH] | Cycle log UX | SEALED |
| STAGE_043 | [NEEDS REFRESH] | Schema migration | SEALED |
| HOTFIX_STRIPE | `ddc60af` | Stripe live fix | SEALED |
| STAGE_271b+266 | `54b3be5` | Welcome page copy rewrite + tier rename | SEALED |
| STAGE_271 | [NEEDS REFRESH] | Three-state compound gating (canonical) | SEALED |
| STAGE_037 | [NEEDS REFRESH] | Payload bridge | SEALED |
| STAGE_033 | [NEEDS REFRESH] | Cycle log comments | SEALED |
| STAGE_031 | [NEEDS REFRESH] | Cycle log creation | SEALED |
| STAGE_026+027 | [NEEDS REFRESH] | Auth purge — removed all stale tier refs | SEALED |

---

## 10. OPEN ISSUES / NEXT STAGES

### Launch Blockers
| # | Issue | Type |
|---|-------|------|
| #033 | Reply bug — cycle log replies fail ("Failed to create reply"). Column is `parent_id` not `parent_post_id` — may be root cause. Verify before fix. | BUG |
| — | Softr comment import (Evan, Larson, Jonathan, Brian + thread — Andriol compound) | CONTENT |
| — | 86 compounds with empty `article_content` + `article_preview` | CONTENT |
| — | Email reply notifications (lead email + Stripe email) | FEATURE |
| — | Top nav broken | BUG |
| — | Background video on /compounds keeps breaking | BUG |

### Queued Stages
| Stage | Description | Target File |
|-------|-------------|-------------|
| STAGE_057 | Compound taxonomy split — ingredient class vs branded product | `CompoundsPage.jsx`, `CompoundDetail.jsx`, DB |
| STAGE_058 | Cycle log verdict toggle UI | `CycleLogDetail.jsx` |
| STAGE_059 | Article seed pass 1 (Travis writes content, swarm seeds to DB) | SQL / seed script |
| STAGE_060 | SOVEREIGN_MEMORY.md — swarm spine, live recon | `SOVEREIGN_MEMORY.md` | SEALED |
| STAGE_061 | Broadcaster completion guards (min_response_length floors, INCOMPLETE vs UNKNOWN, no premature scoring, completion footer) | `broadcaster.py` / `main.py` |
| STAGE_062 | Lane classification / seeker routing (LANE: SEEKER routes to Travis, not builder node) | `main.py` |
| BACKLOG_001 | Sidebar read/write gate | `Sidebar.jsx` |
| BACKLOG_003 | Dylan M quote → real screenshot | `Home.jsx` or `Testimonials` |
| BACKLOG_013 | Founding member badge + 30% discount | `users` table + badge component |
| BACKLOG_048 | Rotating 24-month discount codes (PROHP[MM][YY]) | `compounds` table + cron |

### Phase 2 (Post-Launch)
- YouTube comment import + search (7,100+ comments, Phase 2)
- Stack Builder (swarm-powered, IC tier, API cost joke in UI)
- Instagram DM import → swarm module
- Softr migration (prohormonepro.com encyclopedia → forum)
- Avatar system

---

## 11. CONFIDENCE NOTES

| Section | Confidence | Notes |
|---------|------------|-------|
| Git head + full 20-commit chain | HIGH | Confirmed live git log 2026-03-07 |
| Frontend page list (12 pages) | HIGH | Confirmed live ls output |
| Frontend routes | MEDIUM | Page files confirmed. Route paths need `grep "path=" App.jsx` |
| Backend routes (all 27 routes) | HIGH | Confirmed live grep output |
| DB table list (12 tables) | HIGH | Confirmed live \dt output |
| DB schema — compounds | HIGH | Amendment 04 §10 + STAGE_271 |
| DB schema — users | HIGH | Confirmed live \d users 2026-03-07 |
| DB schema — threads | HIGH | Confirmed live \d threads 2026-03-07 |
| DB schema — posts | HIGH | Confirmed live \d posts 2026-03-07 |
| DB schema — leads, audit_log | HIGH | Confirmed from sealed stages |
| DB schema — cycle_updates, notifications, refresh_tokens, votes | MEDIUM | Tables confirmed to exist. Column details need \d |
| DB schema — rooms, cycle_logs | MEDIUM | Structure inferred from route + stage patterns |
| Auth middleware exports | HIGH | Confirmed line 103 of auth.js |
| Patch classes | HIGH | All sourced from sealed stage outputs |
| Known landmines | HIGH | All sourced from real failures + live recon |
| Stage ledger (last 20 commits) | HIGH | Confirmed live git log |

---

## 12. LAST UPDATED

| Field | Value |
|-------|-------|
| Generated | 2026-03-06 (initial) |
| Refreshed | 2026-03-07 (live srv2 recon) |
| Refreshed by | STAGE_060 live recon pass — Travis on srv2 |
| Git head at refresh | `727add9` |
| Overall confidence | 0.94 |
| Remaining MEDIUM sections | cycle_updates, notifications, refresh_tokens, votes column details; App.jsx route paths |
| Next required refresh | Before STAGE_057 — run `\d rooms`, `\d cycle_logs`, `\d cycle_updates`, `grep "path=" App.jsx` |
| Update rule | After every sealed stage: update Stage Ledger, Open Issues, any changed schema/routes |

---

*Proof over hype. E3592DC3.*
