````md
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

**Manifest Ouroboros Note:**
`stage_manifest.json` is machine authority.  
`SOVEREIGN_MEMORY.md` is human-readable authority.  
The swarm must maintain both.  
A sealed stage that changes stage state, canon state, or build priority must update:
1. `stage_manifest.json`
2. `SOVEREIGN_MEMORY.md`
3. receipts / outbox evidence

This is intentional recursion, not duplication:
the system that advances stages must also update the record of stage advancement.
That loop is canonical.

Sources are marked:
- `[CONFIRMED]` — sourced from sealed stage receipt, git output, or direct recon
- `[INFERRED]` — sourced from Amendment 04, blueprint, or prior session logs
- `[NEEDS REFRESH]` — must be verified by live recon before use in payload

---

## 2. REPO SNAPSHOT

| Field | Value | Source |
|-------|-------|--------|
| Git head | `4be567d` | [CONFIRMED] 067 auto-deploy commit |
| Branch | `main` | [CONFIRMED] |
| Latest bundle | `index-BjiGa_ml.js` | [CONFIRMED] 067 deploy |
| Remote | `github.com/prohormonePro/proHP-forum` | [CONFIRMED] |
| srv2 path | `~/prohp-forum` | [CONFIRMED] |
| srv2 IP | `107.152.45.184` | [CONFIRMED] |
| srv1 IP | `135.148.32.108` | [CONFIRMED] |

**Pinned confirmed forum deploy chain:**
```text
727add9 STAGE_056 verdict toggle UI - mark/unmark on all posts
43faea1 STAGE_064 cycle reply UX fix
cb36f0a STAGE_064c threaded reply render under correct parent
4be567d STAGE_067 search results page + route wiring
````

**Autonomy / local-only sealed chain (Windows SOVEREIGN_L5 root):**

```text
061    Broadcaster completion guards                    [SEALED]
062b   Canon updater safe format                        [SEALED]
063b   Canon updater mirror hook                        [SEALED]
074    Stage manifest authority                         [SEALED]
075    Compact observer + fast path                     [SEALED + VERIFIED]
080    Manual update kill switch                        [SEALED + VERIFIED]
082    Final closure audit                              [SEALED]
086    Auto fallback seeding                            [SEALED]
```

**Operational note:**

* Auto-deploy is proven live on real forum product work.
* Compact observer mode is proven live.
* Canon updater now updates both `SOVEREIGN_MEMORY.md` and `stage_manifest.json`.
* Warm standby seeding is live.
* First real forum feature shipped end-to-end through the autonomous loop: `067_SEARCH_AND_TOP_NAV_HARDENING`.

---

## 3. FRONTEND PAGE MAP

| File                   | Route              | Tier Gate                   | Notes                                                                                | Source      |
| ---------------------- | ------------------ | --------------------------- | ------------------------------------------------------------------------------------ | ----------- |
| `Home.jsx`             | `/`                | None (public)               | Welcome page, marquee, dual CTA                                                      | [CONFIRMED] |
| `CompoundsPage.jsx`    | `/compounds`       | Lead gate (email modal)     | Sort dropdown live (053). Background video hardening needed.                         | [CONFIRMED] |
| `CompoundDetail.jsx`   | `/compounds/:slug` | 3-state: window/lead/member | Gate on overview, articles, discussion, dosing, nutrition label                      | [CONFIRMED] |
| `ThreadPage.jsx`       | `/t/:id`           | Inner Circle (paid)         | Verdict toggle live (056). OP/admin can Mark/Unmark.                                 | [CONFIRMED] |
| `CycleLogDetail.jsx`   | `/cycles/:id`      | Inner Circle (paid)         | Verdict toggle UI NOT YET DEPLOYED (STAGE_058 queued)                                | [CONFIRMED] |
| `CyclesPage.jsx`       | `/cycles`          | Inner Circle (paid)         | The Lab room                                                                         | [CONFIRMED] |
| `CreateThread.jsx`     | `/create-thread`   | Inner Circle (paid)         | [CONFIRMED]                                                                          |             |
| `RoomPage.jsx`         | `/rooms/:slug`     | optionalAuth                | Room listing                                                                         | [CONFIRMED] |
| `UserProfile.jsx`      | `/u/:username`     | None (public GET)           | Public profile page                                                                  | [CONFIRMED] |
| `LoginPage.jsx`        | `/login`           | None                        | [CONFIRMED]                                                                          |             |
| `RegisterPage.jsx`     | `/register`        | None                        | Standard register                                                                    | [CONFIRMED] |
| `ClaimAccountPage.jsx` | `/claim-account`   | None                        | Post-Stripe credential creation — short-lived token                                  | [CONFIRMED] |
| `SearchPage.jsx`       | `/search`          | None                        | Search results page wired from navbar search; uses `/api/threads/search/query?q=...` | [CONFIRMED] |

---

## 4. BACKEND ROUTE MAP

**Base path:** All routes served from `backend/src/routes/`
**API prefix:** `/api`

| File           | Method | Path                                  | Auth Required                              | Notes                                   | Source      |
| -------------- | ------ | ------------------------------------- | ------------------------------------------ | --------------------------------------- | ----------- |
| `auth.js`      | POST   | `/api/auth/register`                  | None                                       | [CONFIRMED]                             |             |
| `auth.js`      | POST   | `/api/auth/login`                     | None                                       | Returns JWT                             | [CONFIRMED] |
| `auth.js`      | POST   | `/api/auth/refresh`                   | None                                       | JWT refresh                             | [CONFIRMED] |
| `auth.js`      | POST   | `/api/auth/logout`                    | authenticate                               | [CONFIRMED]                             |             |
| `auth.js`      | GET    | `/api/auth/me`                        | authenticate                               | Returns current user                    | [CONFIRMED] |
| `claim.js`     | POST   | `/api/claim`                          | None                                       | Post-Stripe account creation            | [CONFIRMED] |
| `compounds.js` | GET    | `/api/compounds`                      | None (optionalAuth inferred)               | Returns field set based on tier         | [CONFIRMED] |
| `compounds.js` | GET    | `/api/compounds/categories`           | None                                       | Returns category list                   | [CONFIRMED] |
| `compounds.js` | GET    | `/api/compounds/:slug`                | optionalAuth                               | 3-state gate enforced here              | [CONFIRMED] |
| `cycles.js`    | GET    | `/api/cycles`                         | optionalAuth                               | [CONFIRMED]                             |             |
| `cycles.js`    | POST   | `/api/cycles`                         | authenticate + requireTier('inner_circle') | Create cycle log                        | [CONFIRMED] |
| `cycles.js`    | GET    | `/api/cycles/:id`                     | optionalAuth                               | [CONFIRMED]                             |             |
| `cycles.js`    | POST   | `/api/cycles/:id/updates`             | authenticate + requireTier('inner_circle') | Weekly update                           | [CONFIRMED] |
| `leads.js`     | POST   | `/api/leads`                          | None                                       | Email capture, sets lead cookie         | [CONFIRMED] |
| `leads.js`     | GET    | `/api/leads/check`                    | None                                       | Check lead cookie status                | [CONFIRMED] |
| `posts.js`     | POST   | `/api/posts`                          | authenticate                               | Create post/reply                       | [CONFIRMED] |
| `posts.js`     | POST   | `/api/posts/:id/vote`                 | authenticate                               | Upvote/downvote post                    | [CONFIRMED] |
| `posts.js`     | POST   | `/api/posts/:id/best-answer`          | authenticate                               | Toggle verdict                          | [CONFIRMED] |
| `rooms.js`     | GET    | `/api/rooms`                          | optionalAuth                               | List rooms                              | [CONFIRMED] |
| `rooms.js`     | GET    | `/api/rooms/:slug`                    | optionalAuth                               | Single room                             | [CONFIRMED] |
| `stripe.js`    | POST   | `/api/stripe/create-checkout-session` | authenticate                               | Opens Stripe checkout (logged-in)       | [CONFIRMED] |
| `stripe.js`    | POST   | `/api/stripe/create-lead-checkout`    | None                                       | Opens Stripe checkout (lead/no account) | [CONFIRMED] |
| `threads.js`   | GET    | `/api/threads/:id`                    | optionalAuth                               | Returns thread + posts                  | [CONFIRMED] |
| `threads.js`   | POST   | `/api/threads`                        | authenticate                               | Create thread                           | [CONFIRMED] |
| `threads.js`   | POST   | `/api/threads/:id/vote`               | authenticate                               | Upvote/downvote thread                  | [CONFIRMED] |
| `threads.js`   | GET    | `/api/threads/search/query`           | optionalAuth                               | Full-text search                        | [CONFIRMED] |
| `users.js`     | GET    | `/api/users/:username`                | None                                       | Public profile                          | [CONFIRMED] |
| `health`       | GET    | `/api/health`                         | None                                       | Verify command target                   | [CONFIRMED] |

**⚠ NOTE:** No separate `/api/stripe/webhook` route visible in grep — may be registered directly in `index.js` (raw body required). Verify before touching Stripe webhook logic.

---

## 5. AUTH / TIER RULES

**Canonical middleware exports** `[CONFIRMED — STAGE_026+027]`:

```js
{ authenticate, requireTier, requireAdmin, optionalAuth, TIER_LEVELS }
```

**Canonical tiers** — ONLY these three exist:

```text
free          (lead/email-captured, no account)
inner_circle  (paid $19/mo via Stripe)
admin         (prohormonepro account)
```

**DEAD — never use:**

* `lab_rat`, `premium`, `elite`, `brother_in_arms`, `Brothers in Arms`, `Airlock`

**Gate states on compound pages** (3-state, not same as tiers):

```text
window  → no lead cookie, no auth
lead    → has prohp_lead_access cookie (JWT, lead=true)
member  → authenticated, tier=inner_circle OR tier=admin
```

**Field access by gate state** `[CONFIRMED — Amendment 04 + STAGE_271]`:

* WINDOW: id, slug, name, category, risk_tier, trust_level, summary, youtube_video_id, youtube_url, causes_hair_loss, hair_loss_severity, company, is_published, created_at, updated_at, product_url, product_image_url, public_discount_code, product_price
* LEAD: above + mechanism, side_effects, benefits, compounds_list, article_preview
* MEMBER: full row including article_content, member_discount_code, nutrition_label_url

**LEAK PREVENTION — NON-NEGOTIABLE:**
These fields MUST NEVER appear in window or lead responses:

* `article_content`
* `member_discount_code`
* `nutrition_label_url`

Backend uses `pick()` + safety-net `delete`. Belt and suspenders.

---

## 6. DB SCHEMA SNAPSHOT

**Connection:** `postgresql://prohp:***@127.0.0.1:5432/prohp_forum` `[CONFIRMED]`

### `compounds` table `[CONFIRMED — Amendment 04 §10 + STAGE_271]`

| Column               | Type            | Gate        | Notes                    |
| -------------------- | --------------- | ----------- | ------------------------ |
| id                   | UUID            | All         |                          |
| slug                 | TEXT            | All         | URL key                  |
| name                 | TEXT            | All         |                          |
| category             | TEXT            | All         |                          |
| risk_tier            | TEXT            | All         | Color-coded badge        |
| trust_level          | TEXT            | All         |                          |
| summary              | TEXT            | All         |                          |
| youtube_video_id     | TEXT            | All         | NULL = show request card |
| youtube_url          | TEXT            | All         |                          |
| causes_hair_loss     | BOOL            | All         |                          |
| hair_loss_severity   | TEXT            | All         |                          |
| company              | TEXT            | All         |                          |
| is_published         | BOOL            | All         |                          |
| product_url          | TEXT            | All         |                          |
| product_image_url    | TEXT            | All         |                          |
| public_discount_code | TEXT            | All         | Default: 'TRAVISD'       |
| product_price        | DECIMAL(10,2)   | All         | For discount comparison  |
| mechanism            | TEXT            | Lead+       |                          |
| side_effects         | TEXT            | Lead+       |                          |
| benefits             | TEXT            | Lead+       |                          |
| compounds_list       | TEXT            | Lead+       |                          |
| article_preview      | TEXT            | Lead+       | First paragraph teaser   |
| article_content      | TEXT            | Member only | **NEVER leak**           |
| member_discount_code | TEXT            | Member only | **NEVER leak**           |
| nutrition_label_url  | TEXT            | Member only | **NEVER leak**           |
| thread_id            | UUID FK→threads | All         | Linked discussion thread |
| created_at           | TIMESTAMPTZ     | All         |                          |
| updated_at           | TIMESTAMPTZ     | All         |                          |

**⚠ STATUS:** All 86 compounds have empty `article_content` and `article_preview`. Content seeding is the launch blocker.

### `users` table `[CONFIRMED — live \d users 2026-03-07]`

| Column                 | Type                 | Notes                                                           |
| ---------------------- | -------------------- | --------------------------------------------------------------- |
| id                     | UUID                 | PK, uuid_generate_v4()                                          |
| email                  | TEXT NOT NULL        | UNIQUE — binding key from Stripe                                |
| password_hash          | TEXT NOT NULL        |                                                                 |
| username               | TEXT NOT NULL        | UNIQUE                                                          |
| display_name           | TEXT                 |                                                                 |
| bio                    | TEXT                 | Default: ''                                                     |
| avatar_url             | TEXT                 |                                                                 |
| tier                   | TEXT NOT NULL        | Default: 'free'. CHECK: free/inner_circle/admin                 |
| stripe_customer_id     | TEXT                 | UNIQUE (when not null)                                          |
| stripe_sub_id          | TEXT                 |                                                                 |
| stripe_sub_status      | TEXT                 | CHECK: none/active/past_due/canceled/trialing. Default: 'none'  |
| reputation             | INTEGER NOT NULL     | Default: 0                                                      |
| is_founding            | BOOLEAN NOT NULL     | Default: false — **NOT `founding_badge`**                       |
| is_verified            | BOOLEAN NOT NULL     | Default: false                                                  |
| is_banned              | BOOLEAN NOT NULL     | Default: false                                                  |
| created_at             | TIMESTAMPTZ NOT NULL |                                                                 |
| updated_at             | TIMESTAMPTZ NOT NULL | Auto-updated via trigger                                        |
| last_login_at          | TIMESTAMPTZ          |                                                                 |
| email_verified_at      | TIMESTAMPTZ          |                                                                 |
| stripe_subscription_id | TEXT                 | UNIQUE (when not null) — duplicate of stripe_sub_id, both exist |
| subscription_status    | TEXT                 | Duplicate of stripe_sub_status, both exist                      |
| subscription_ends_at   | TIMESTAMPTZ          |                                                                 |

**⚠ LANDMINE:** Founding member column is `is_founding` (boolean), NOT `founding_badge`. Any payload referencing `founding_badge` will fail.
**⚠ NOTE:** Duplicate Stripe columns exist (`stripe_sub_id` + `stripe_subscription_id`, `stripe_sub_status` + `subscription_status`). Use `stripe_subscription_id` and `subscription_status` for new code — they have unique indexes.

### `leads` table `[CONFIRMED — Amendment 01 §3.1]`

| Column       | Type        | Notes              |
| ------------ | ----------- | ------------------ |
| id           | UUID        |                    |
| email        | TEXT        |                    |
| first_name   | TEXT        |                    |
| last_name    | TEXT        |                    |
| created_at   | TIMESTAMPTZ |                    |
| converted_at | TIMESTAMPTZ | NULL until payment |
| source       | TEXT        |                    |

### `threads` table `[CONFIRMED — live \d threads 2026-03-07]`

| Column        | Type                 | Notes                                         |
| ------------- | -------------------- | --------------------------------------------- |
| id            | UUID                 | PK                                            |
| room_id       | UUID FK→rooms        | NOT NULL, CASCADE delete                      |
| author_id     | UUID FK→users        | NOT NULL, CASCADE delete — OP for verdict     |
| compound_id   | UUID FK→compounds    | NULLABLE — links thread to compound           |
| title         | TEXT NOT NULL        | 3-200 chars                                   |
| body          | TEXT NOT NULL        | min 10 chars                                  |
| is_pinned     | BOOLEAN NOT NULL     | Default: false                                |
| is_locked     | BOOLEAN NOT NULL     | Default: false                                |
| is_deleted    | BOOLEAN NOT NULL     | Default: false                                |
| upvotes       | INTEGER NOT NULL     | Default: 0                                    |
| downvotes     | INTEGER NOT NULL     | Default: 0                                    |
| score         | INTEGER              | GENERATED: upvotes - downvotes                |
| reply_count   | INTEGER NOT NULL     | Default: 0, auto-updated via trigger          |
| view_count    | INTEGER NOT NULL     | Default: 0                                    |
| last_reply_at | TIMESTAMPTZ          |                                               |
| last_reply_by | UUID FK→users        | NULLABLE, SET NULL on delete                  |
| created_at    | TIMESTAMPTZ NOT NULL |                                               |
| updated_at    | TIMESTAMPTZ NOT NULL | Auto-updated via trigger                      |
| search_vector | TSVECTOR             | Auto-updated via trigger for full-text search |

**⚠ NOTE:** `compound_id` is the FK that links threads to compounds (not `thread_id` on compounds — both directions exist). Full-text search index on `search_vector` via GIN.

### `posts` table `[CONFIRMED — live \d posts 2026-03-07]`

| Column         | Type                     | Notes                                                               |
| -------------- | ------------------------ | ------------------------------------------------------------------- |
| id             | UUID PK                  | uuid_generate_v4()                                                  |
| thread_id      | UUID FK→threads NOT NULL | CASCADE delete                                                      |
| author_id      | UUID FK→users NOT NULL   | CASCADE delete                                                      |
| parent_id      | UUID FK→posts NULLABLE   | SET NULL on delete — **column is `parent_id` NOT `parent_post_id`** |
| body           | TEXT NOT NULL            | min 1 char                                                          |
| is_best_answer | BOOLEAN NOT NULL         | Default: false — verdict toggle target                              |
| is_helpful     | BOOLEAN NOT NULL         | Default: false                                                      |
| is_deleted     | BOOLEAN NOT NULL         | Default: false                                                      |
| upvotes        | INTEGER NOT NULL         | Default: 0                                                          |
| downvotes      | INTEGER NOT NULL         | Default: 0                                                          |
| score          | INTEGER                  | GENERATED: upvotes - downvotes                                      |
| created_at     | TIMESTAMPTZ NOT NULL     |                                                                     |
| updated_at     | TIMESTAMPTZ NOT NULL     | Auto-updated via trigger                                            |

**⚠ LANDMINE:** Reply parent column is `parent_id`, NOT `parent_post_id`. Any payload using `parent_post_id` will silently fail or error.

### `rooms` table `[NEEDS REFRESH — run \d rooms before any room-touching stage]`

| Column        | Type        | Notes                                                        |
| ------------- | ----------- | ------------------------------------------------------------ |
| id            | UUID        |                                                              |
| name          | TEXT        | The Library / The Lab / General (inferred from app behavior) |
| slug          | TEXT        | Used in `/api/rooms/:slug` route                             |
| tier_required | TEXT        | free/inner_circle (inferred)                                 |
| created_at    | TIMESTAMPTZ |                                                              |

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

| Column      | Type            | Notes                                              |
| ----------- | --------------- | -------------------------------------------------- |
| id          | UUID            |                                                    |
| user_id     | UUID FK→users   | CASCADE delete                                     |
| thread_id   | UUID FK→threads | Auto-created in The Lab room on cycle log creation |
| compound    | TEXT            |                                                    |
| dose        | TEXT            |                                                    |
| duration    | TEXT            |                                                    |
| description | TEXT            |                                                    |
| created_at  | TIMESTAMPTZ     |                                                    |

**⚠ NEEDS REFRESH:** Run `\d cycle_logs` on srv2 to confirm full column set before any cycle-touching stage.

### `audit_log` table `[CONFIRMED — auth.js]`

| Column          | Type        | Notes          |
| --------------- | ----------- | -------------- |
| id              | UUID        |                |
| created_at      | TIMESTAMPTZ |                |
| actor_user_id   | UUID        | NOT actor_id   |
| target_user_id  | UUID        | NOT target_id  |
| action          | TEXT        | NOT event_type |
| stripe_event_id | TEXT        |                |
| meta            | JSONB       | NOT metadata   |

**⚠ LANDMINE:** Column names are NOT `event_type`, `metadata`, `actor_id`. Use exact names above or insert will fail silently.

**DB Schema Confidence Summary:**

Tables fully confirmed by live `\d` (2026-03-07):

* `users`, `threads`, `posts`

Tables confirmed to exist, columns partial/inferred:

* `rooms`, `cycle_logs`, `cycle_updates`, `notifications`, `refresh_tokens`, `votes`

Tables confirmed via sealed stage receipts + Amendment 04:

* `compounds`, `leads`, `audit_log`

---

## 7. PATCH CLASS LIBRARY

### CLASS: `verdict_toggle`

* **Target files:** `frontend/src/pages/ThreadPage.jsx`, `frontend/src/pages/CycleLogDetail.jsx`
* **Backend route:** `POST /api/posts/:id/best-answer`
* **Trigger:** Thread author or admin wants to mark/unmark best answer
* **Pattern:** Button renders on all posts for OP/admin. Label toggles: "Mark Verdict" → "Unmark Verdict" based on `post.is_best_answer`. On click: optimistic UI update + API call + refetch.
* **Verify:** `curl -X POST /api/posts/:id/best-answer -H "Authorization: Bearer <token>"` returns `{is_best_answer: bool, thread_id: uuid}`
* **Failure modes:** Button shows for wrong users (check author_id === thread.author_id), toggle doesn't persist (check optimistic update + refetch), can't unmark (toggle logic bug — STAGE_056 fix)
* **Status:** ThreadPage.jsx DEPLOYED (056). CycleLogDetail.jsx PENDING (STAGE_058).

### CLASS: `tier_gate`

* **Target files:** `frontend/src/pages/CompoundDetail.jsx`, `backend/src/routes/compounds.js`
* **Trigger:** Any content section that shows different content per gate_state
* **Pattern:** API returns `gate_state` field. Frontend ternary: `gate_state === 'member' ? <FullContent> : gate_state === 'lead' ? <Preview> : <EmailCTA>`. Backend: `pick()` fields by gate_state + safety-net `delete result.article_content`.
* **Verify:** Hit `/api/compounds/:slug` with no cookie (window), lead cookie (lead), member JWT (member). Confirm field set matches gate.
* **Failure modes:** Leak of gated fields (check safety-net deletes), wrong gate_state returned (check lead cookie parser), CTA not rendering (check ternary coverage of all three states)
* **Status:** DEPLOYED (STAGE_271 + 055).

### CLASS: `request_card`

* **Target files:** `frontend/src/pages/CompoundDetail.jsx`
* **Trigger:** `compound.youtube_video_id === null`
* **Pattern:** `!compound.youtube_video_id ? <RequestCoverageCard /> : <YouTubeEmbed />`. Card includes "Drop a comment below" CTA linking to discussion section.
* **Verify:** Find a compound with null youtube_video_id in DB. Confirm card renders, embed does not.
* **Failure modes:** Card shows on compounds WITH video (null check wrong), card CTA broken link
* **Status:** DEPLOYED (STAGE_054).

### CLASS: `sort_dropdown`

* **Target files:** `frontend/src/pages/CompoundsPage.jsx`
* **Trigger:** User selects sort option (name, category, risk_tier, etc.)
* **Pattern:** Zustand state for `sortBy`. React Query `queryKey` includes `sortBy`. `queryFn` passes sort param to API. `select` transforms sorted response.
* **Verify:** Change sort. Confirm compound order changes. Confirm URL or state updates.
* **Failure modes:** Sort not triggering refetch (queryKey missing sort), sort param not reaching API, API ignoring sort param
* **Status:** DEPLOYED (STAGE_053).

### CLASS: `comment_pipe`

* **Target files:** `frontend/src/pages/CompoundDetail.jsx`
* **Trigger:** Compound has `thread_id` set in DB
* **Pattern:** On page load, `GET /api/threads/:thread_id` fetches linked thread. Posts rendered below buy section. Post form for members. Read-only for leads. Locked card for window.
* **Verify:** `SELECT thread_id FROM compounds WHERE slug='lgd-4033'` — confirm non-null. Load page as member. Confirm posts render.
* **Failure modes:** thread_id null (compound not linked), posts not rendering (fetch error), post form showing for leads (gate check wrong)
* **Status:** DEPLOYED (STAGE_046b + 055).

### CLASS: `discussion_gate`

* **Target files:** `frontend/src/pages/CompoundDetail.jsx`
* **Trigger:** Discussion/comment section render based on gate_state
* **Pattern:** window → locked card with email CTA. lead → posts visible, reply form hidden, "Join Inner Circle" CTA. member → full read/write.
* **Verify:** Load compound page as each gate state. Confirm correct UI for each.
* **Failure modes:** Lead seeing post form (gate check wrong), member seeing locked card (gate_state not returned correctly), window seeing posts (leak)
* **Status:** DEPLOYED (STAGE_055).

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

| Stage          | Commit                             | Description                                                              | Status            |
| -------------- | ---------------------------------- | ------------------------------------------------------------------------ | ----------------- |
| 086            | `local_only`                       | Auto fallback seeding                                                    | SEALED            |
| 082            | `auto_deploy`                      | Final closure audit                                                      | SEALED            |
| 080            | `local_only`                       | Manual update kill switch                                                | SEALED            |
| 075            | `local_only`                       | Compact observer + fast path                                             | SEALED + VERIFIED |
| 074            | `local_only`                       | Stage manifest authority                                                 | SEALED            |
| 067            | `4be567d`                          | Search results page + route wiring                                       | SEALED            |
| 066            | `cb36f0a`                          | Verdict behavior — already shipped in 056 / verified and sealed in canon | SEALED            |
| 064c           | `cb36f0a`                          | Threaded reply render under correct parent                               | SEALED            |
| 064            | `43faea1`                          | Cycle reply UX fix                                                       | SEALED            |
| 063b           | `local_only`                       | Canon updater mirror hook                                                | SEALED            |
| 062b           | `local_only`                       | Canon updater safe format                                                | SEALED            |
| 061            | `local_only`                       | Broadcaster completion guards                                            | SEALED            |
| STAGE_056      | `727add9`                          | Verdict toggle UI                                                        | SEALED            |
| STAGE_055      | `af81370`                          | Compound discussion tier gate (window/lead/member)                       | SEALED            |
| STAGE_054      | `6f30475`                          | Request coverage card for no-video compounds                             | SEALED            |
| STAGE_053      | `300788a`                          | CompoundsPage sort dropdown                                              | SEALED            |
| STAGE_052      | `(broadcaster v6, no repo commit)` | Broadcaster operational — completion guards, correction loop             | SEALED            |
| STAGE_051      | `8f3f9a4`                          | Watch links cleanup                                                      | SEALED            |
| STAGE_050      | `48f9698`                          | Verdict toggle backend route                                             | SEALED            |
| STAGE_049      | `8c63833`                          | README/backlog update                                                    | SEALED            |
| STAGE_046b     | `21cce1e`                          | Compound discussion pipe (compound_thread_pipe)                          | SEALED            |
| STAGE_046a     | `ca94c52`                          | Backend pagination + room pagination, 86 compounds                       | SEALED            |
| STAGE_045      | `[NEEDS REFRESH]`                  | Compound article gating V1                                               | SEALED            |
| STAGE_044      | `[NEEDS REFRESH]`                  | Cycle log UX                                                             | SEALED            |
| STAGE_043      | `[NEEDS REFRESH]`                  | Schema migration                                                         | SEALED            |
| HOTFIX_STRIPE  | `ddc60af`                          | Stripe live fix                                                          | SEALED            |
| STAGE_271b+266 | `54b3be5`                          | Welcome page copy rewrite + tier rename                                  | SEALED            |
| STAGE_271      | `[NEEDS REFRESH]`                  | Three-state compound gating (canonical)                                  | SEALED            |
| STAGE_037      | `[NEEDS REFRESH]`                  | Payload bridge                                                           | SEALED            |
| STAGE_033      | `[NEEDS REFRESH]`                  | Cycle log comments                                                       | SEALED            |
| STAGE_031      | `[NEEDS REFRESH]`                  | Cycle log creation                                                       | SEALED            |
| STAGE_026+027  | `[NEEDS REFRESH]`                  | Auth purge — removed all stale tier refs                                 | SEALED            |

**Autonomy status note:**

* 074 / 075 / 080 / 082 / 086 are functionally complete and proven live.
* 067 is the first real forum product feature shipped end-to-end through the autonomous swarm.

---

## 10. OPEN ISSUES / NEXT STAGES

### Launch Blockers

| # | Issue                                                         | Type    |
| - | ------------------------------------------------------------- | ------- |
| — | 86 compounds with empty `article_content` + `article_preview` | CONTENT |
| — | Email reply notifications (lead email + Stripe email)         | FEATURE |
| — | Background video on `/compounds` keeps breaking               | BUG     |

### Active Priority / Phase 1

| # | Issue                                                                                                                                        | Type       |
| - | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| — | YouTube comment import + search (7,100+ comments) promoted from Phase 2 to active priority via stage promotion                               | PLATFORM   |
| — | Preserve source separation: YouTube-piped comments and Common Ninja comments are distinct sources                                            | DATA RULE  |
| — | Common Ninja delta / missing manual comments only if live gap is still confirmed                                                             | CONTENT    |
| — | Fix blank profile page when clicking circular avatar in navbar                                                                               | BUG        |
| — | Sort upvoted discussion/comment content highest-to-lowest by default where appropriate, while preserving intentional chronology where needed | UX / LOGIC |

### Queued Next Stages

| Stage       | Description                                                                                                                                  | Target File / Area                                            |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 083         | Promote YouTube comment import + search to active priority; align spine / manifest / launch-safe banner state                                | planning authority / spine / manifest                         |
| 068         | Fix blank profile page when clicking circular avatar in navbar; verify end-to-end profile route and data loading                             | `Navbar.jsx`, `UserProfile.jsx`, route/data flow              |
| 069         | Sort upvoted discussion/comment content highest-to-lowest by default where appropriate, while preserving intentional chronology where needed | `ThreadPage.jsx`, compound discussion views, comment surfaces |
| 070         | Verdict reassign / tooltip hardening if live bug still present                                                                               | verdict UX / labeling / reassignment logic                    |
| 071         | Dynamic monthly member discount codes (24-month rotating schedule)                                                                           | discount code system / cron / compound/member surfaces        |
| 072         | Reply email notifications                                                                                                                    | notifications / email flow                                    |
| STAGE_057   | Compound taxonomy split — ingredient class vs branded product                                                                                | `CompoundsPage.jsx`, `CompoundDetail.jsx`, DB                 |
| STAGE_058   | Cycle log verdict toggle UI                                                                                                                  | `CycleLogDetail.jsx`                                          |
| STAGE_059   | Article seed pass 1 (Travis writes content, swarm seeds to DB)                                                                               | SQL / seed script                                             |
| BACKLOG_001 | Sidebar read/write gate                                                                                                                      | `Sidebar.jsx`                                                 |
| BACKLOG_003 | Dylan M quote → real screenshot                                                                                                              | `Home.jsx` or `Testimonials`                                  |
| BACKLOG_013 | Founding member badge + 30% discount                                                                                                         | `users` table + badge component                               |
| BACKLOG_048 | Rotating 24-month discount codes (PROHP[MM][YY])                                                                                             | `compounds` table + cron                                      |

### Resolved / Remove As Active Blockers

* `#033` cycle reply bug — resolved by 064 + 064c
* Generic “top nav broken” blocker — replaced by concrete 067 search/page work, now resolved
* Autonomy foundation as blocker — no longer valid; loop is operational now
* Search route / navbar search gap — resolved by 067

### Post-Launch / Later

* Full YouTube comment import engine + search UI (beyond promotion state)
* Stack Builder (swarm-powered, IC tier)
* Instagram DM import → swarm module
* Softr migration (prohormonepro.com encyclopedia → forum)
* Avatar system

---

## 11. CONFIDENCE NOTES

| Section                                                         | Confidence | Notes                                                                   |
| --------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------- |
| Repo snapshot                                                   | HIGH       | Updated through 067 deploy (`4be567d`, `index-BjiGa_ml.js`)             |
| Frontend page list / routes                                     | HIGH       | `/search` now confirmed live via 067                                    |
| Backend routes                                                  | HIGH       | `/api/threads/search/query` confirmed live                              |
| DB table list (12 tables)                                       | HIGH       | Confirmed live `\dt` output                                             |
| DB schema — compounds                                           | HIGH       | Amendment 04 §10 + STAGE_271                                            |
| DB schema — users                                               | HIGH       | Confirmed live `\d users`                                               |
| DB schema — threads                                             | HIGH       | Confirmed live `\d threads`                                             |
| DB schema — posts                                               | HIGH       | Confirmed live `\d posts`                                               |
| DB schema — leads, audit_log                                    | HIGH       | Confirmed from sealed stages                                            |
| DB schema — cycle_updates, notifications, refresh_tokens, votes | MEDIUM     | Tables confirmed to exist; some column details still need refresh       |
| DB schema — rooms, cycle_logs                                   | MEDIUM     | Structure partially inferred; refresh before room/cycle-touching stages |
| Auth middleware exports                                         | HIGH       | Confirmed in live code                                                  |
| Patch classes                                                   | HIGH       | Sourced from sealed stage outputs                                       |
| Known landmines                                                 | HIGH       | Sourced from real failures + live recon                                 |
| Autonomy track status                                           | HIGH       | 074 / 075 / 080 / 082 / 086 sealed and proven live                      |
| Forum product swarm proof                                       | HIGH       | 067 shipped end-to-end through autonomous loop                          |

---

## 12. LAST UPDATED

| Field | Value |
|-------|-------|
| Generated | 2026-03-06 (initial) |
| Refreshed | 2026-03-09 04:25:46 UTC |
| Refreshed by | canon_updater.py (STAGE_062b/063b) |
| Last stage sealed | 096_READY_TO_SEAL_GAUNTLET |
| Last INTEL | BROADCAST_20260309_042546__INTEL.md |
| Overall confidence | 0.94 |
| Update rule | After every sealed stage: auto-updated by canon_updater.py |

---

*Proof over hype. E3592DC3.*

```
```


forum.prohormonepro.com appears to be online; the homepage loaded successfully as “ProHP Forum — Proof Over Hype.” ([forum.prohormonepro.com][1])

Run `083_YOUTUBE_COMMENT_IMPORT_AND_SEARCH_PHASE_PROMOTION`.

[1]: https://forum.prohormonepro.com/ "ProHP Forum — Proof Over Hype"

---
More Backlog Items:

- 075_PROFILE_PAGE_ENCODING_CLEANUP
  - Fix mojibake on profile page (`View Thread â†’` should render as `View Thread →`)
  - Scan profile-related UI for other UTF-8 / encoding corruption artifacts
  - Verify clean rendering after deploy

- 076_PROFILE_PAGE_SIGNAL_CLEANUP
  - Clean up public profile activity feed so test/dev posts do not dominate Recent Posts
  - Decide whether to hide, filter, or remove verification artifacts from user-facing profile pages
  - Verify profile reads like live forum activity, not test output

- 077_PROFILE_PAGE_UX_POLISH
  - Improve hierarchy and scanability of Recent Threads / Recent Posts
  - Refine badge/date/link treatment
  - Polish profile page presentation now that nav bug is fixed
  
  - 087a_SRV2_PASSWORDLESS_RECON_ACCESS
  - Enable non-interactive, read-only recon access from Windows SOVEREIGN_L5 to srv2
  - Eliminate password prompt on `ssh srv2 "..."`
  - This is a prerequisite for true autonomous recon harvesting

- 087_AUTO_RECON_INGESTION
  - Inject live repo recon into Builder/Observer packets automatically for normal medium/large stages
  - Depends on 087a
  - Current recon_harvester proof-of-concept exists but is not yet truly autonomous because SSH still prompts for password

VERDICT: APPROVE
CONFIDENCE: 0.99
STAGE_COMPLETE: 088_ROLE_ROUTING_AND_FALLBACK_POLICY
---

## STAGE_089_SEALED — VOTE PRESENCE + CONFIDENCE PARSER TRUTH
UTC: 2026-03-08T22:47:42Z
Anchor: E3592DC3
Status: SEALED

### Final truth
- 088 routing/profile extraction is operational in current 2-node mode
- active_profile used for seal run: claude_primary
- live routing truth during seal run:
  - builder -> claude_builder -> CLAUDE_BUILDER_C
  - observer_auditor -> gpt_observer -> GPT_OBSERVER_B
- seal run result:
  - CLAUDE_BUILDER_A -> APPROVE / 0.95
  - GPT_OBSERVER -> APPROVE / 0.95
  - CONSENSUS -> AUTO_DEPLOY
  - ACTION -> Payload dropped to inbox
  - Canon updated automatically

### What 089 fixed
089 was completed through a 3-part patch chain:

#### 089a
- added 
ormalize_result_truth()
- hardened consensus truth handling
- added truthful receipt fields
- preserved original partial response on retry failure

#### 089b
- confidence parsing now prefers footer zone before full-text search

#### 089c
- confidence parsing now requires line-anchored footer matches via ^CONFIDENCE: with multiline mode
- this is the permanent fix that prevents prose mentions like Confidence: 0.0 from poisoning parser truth

### Truth rules now locked
- a real vote must not collapse into fake  .0
- parser must distinguish:
  - no_response
  - unknown_confidence
  - numeric_confidence
- footer contract is source of truth for verdict/confidence/stage_complete lines
- prose-body mentions must not override footer fields

### Known operating truth after 089
- current working session profile: claude_primary
- builder is now Claude by choice and routing works
- GPT remains observer
- challenger can remain mapped but 2-node fast path is current live mode

### Next likely stage
- STAGE_090 should focus on parser/receipt contract exposure and/or formalizing truthful receipt fields in a way downstream tooling can rely on without ambiguity
- keep routing/profile behavior from 088 stable; do not re-open that lane unless a real regression appears



---

## STAGE_090_SEALED — RECEIPT SCHEMA HARDENING
UTC: 2026-03-08T23:08:31Z
Anchor: E3592DC3
Status: SEALED

### Final truth
- generate_receipt() now writes three new per-node fields:
  - Vote present: True/False
  - Confidence status: parsed/unknown/none
  - Confidence value: numeric or N/A
- existing receipt fields (Verdict, Confidence, Response hash, Response length) unchanged
- seal run receipt confirmed all fields present for both nodes
- AUTO_DEPLOY with builder 0.95, observer 0.94

### What 090 fixed
- downstream tooling no longer needs to infer vote/confidence state from display text
- receipt schema is now grep-friendly and machine-parseable for truth fields

### Truth rules locked
- receipt must always include vote_present, confidence_status, confidence_value per node
- existing fields must never be removed or reordered
- generate_receipt() is the single source of receipt format truth

### Known issue from 090 run
- GPT observer tab required manual Enter press — broadcaster injected text but send did not fire
- this is an input reliability issue, not a receipt/parser issue
- candidate for future hardening (send confirmation / retry on stuck input)

### Next stage forecast
- 091: parser contract enforcement — constrain footer extraction to terminal standalone footer lines only
- keep routing/profile/consensus behavior from 088-089 stable


---

## STAGE_091_SEALED — PARSER CONTRACT ENFORCEMENT
UTC: 2026-03-08T23:28:32Z
Anchor: E3592DC3
Status: SEALED

### Final truth
- all three footer fields now use terminal-line-anchored parsing:
  - VERDICT: ^VERDICT: with re.MULTILINE (091)
  - CONFIDENCE: ^CONFIDENCE: with re.MULTILINE (089c)
  - STAGE_COMPLETE: ^STAGE_COMPLETE: with re.MULTILINE (091)
- footer_zone (last 500 chars uppercase) defined once before all footer parsing (091b)
- footer-zone searched first, full-text fallback only if footer zone has no match
- semantic fallback for VERDICT preserved (last 200 chars) as last resort
- seal run: AUTO_DEPLOY, builder 0.95, observer 0.97

### What 091 fixed
- VERDICT parsing was full-text unanchored — prose "VERDICT: BLOCK" could poison parse
- STAGE_COMPLETE check was substring search — prose mentions could false-match
- 091b fixed UnboundLocalError where footer_zone was referenced before definition

### Truth rules locked
- parser contract is now formal: footer fields must start their own line to be recognized
- prose mentions of VERDICT/CONFIDENCE/STAGE_COMPLETE cannot pollute parsed values
- this closes the parser truth hardening arc started in 089

### Parser hardening arc complete
- 089a: normalize_result_truth + consensus truth + receipt fields + retry preserve
- 089b: footer-zone-first confidence parsing
- 089c: line-anchored confidence regex
- 090: receipt schema surfaces vote_present, confidence_status, confidence_value
- 091: line-anchored VERDICT + STAGE_COMPLETE, footer_zone unified

### Next stage forecast
- 092: input/send reliability hardening (stuck-input / manual-Enter fix)
- 093: receipt/runner resilience around interrupted navigation or partial retries


---

## STAGE_091_SEALED — PARSER CONTRACT ENFORCEMENT
UTC: 2026-03-09T00:18:26Z
Anchor: E3592DC3
Status: SEALED

### Notes
Re-sealed via promote_patch.py proof run

### Sealed via
promote_patch.py --seal


---

## STAGE_091_SEALED — PARSER CONTRACT ENFORCEMENT
UTC: 2026-03-09T02:51:54Z
Anchor: E3592DC3
Status: SEALED

### Notes
Re-sealed via promote_patch.py proof

### Sealed via
promote_patch.py --seal


---

## STAGE_092_SEALED — APPROVED PATCH PROMOTION PIPELINE
UTC: 2026-03-09T00:00:00Z
Anchor: E3592DC3
Status: SEALED

### Final truth
- promote_patch.py is permanent promotion infrastructure at C:\ProHP\SOVEREIGN_L5\promote_patch.py
- separates approval validation (--builder artifact) from patch execution (--artifact patcher)
- CLI: --artifact, --builder, --observer, --receipt, --stage, --target, --verify-payload, --skip-approval, --seal, --title, --notes

### Capabilities proven
- builder footer validation using 091 line-anchored contract
- BLOCK artifact/observer refusal
- missing approval refusal (requires --builder or --skip-approval)
- backup before mutation, rollback on failure
- py_compile + routing-check verification ladder
- READY_TO_SEAL output with stage, target, backup, run dir, receipt path
- explicit seal updating stage_manifest.json + SOVEREIGN_MEMORY.md

### Runtime proof
- TEST 1: Full promotion with builder approval -> READY_TO_SEAL (exit 0)
- TEST 2: BLOCK observer refusal (exit 1)
- TEST 3: No approval without --builder or --skip-approval (exit 1)
- TEST 4: --skip-approval direct apply -> READY_TO_SEAL (exit 0)
- TEST 5: Seal -> manifest + memory updated (exit 0)

### Design decisions
- Python patchers only (covers 100% of 089-091 patches)
- builder markdown is approval artifact, not execution artifact
- future stages can extend to other formats when needed

### Next stage forecast
- 093: send/input reliability (stuck Enter on GPT tab)
- 094: promotion pipeline receipting


---

## STAGE_093_SEALED — GOVERNANCE CHECKER RUNTIME BRIDGE
UTC: 2026-03-09T00:00:00Z
Anchor: E3592DC3
Status: SEALED

### Final truth
- governance_checker.py is now the first runtime bridge from philosophy canon into machinery
- canon files loaded successfully: 6/6
- proof outcomes:
  - py_compile: PASS
  - proposal mode: enforced canon and blocked missing rollback path when appropriate
  - receipt mode: WARNed correctly on older receipt schema gaps
  - promotion mode: BLOCKed non-091-compliant artifacts correctly
  - missing canon: hard fail worked correctly
  - happy-path promotion test: PASS / exit 0 / ready_for_promotion=true

### What 093 fixed
- philosophy canon is no longer prose only
- proposal, receipt, and promotion flows can now be checked against governance rules
- terminal footer enforcement from 091 is now reused in promotion validation
- observer BLOCK remains authoritative in promotion flow

### Truth rules now locked
- promotion artifacts must satisfy 091-style footer parsing
- builder must APPROVE
- builder confidence must be >= 0.8
- observer BLOCK prevents promotion
- canon loading must fail hard if critical canon is missing

### Next likely stages
- STAGE_094: load_state_bridge.py
- STAGE_095: relational_guard.py and/or node/session recap reseed hygiene


---

## STAGE_094_SEALED — LOAD STATE BRIDGE
UTC: 2026-03-09T03:55:52Z
Anchor: E3592DC3
Status: SEALED

### Final truth
- load_state_bridge.py is now permanent infrastructure at C:\ProHP\SOVEREIGN_L5\
- L0 Invariant 5 (Load-Aware Governance) is bridged into runtime
- CLI: --set, --get, --json, --check-escalation, --history, --reason
- state persists to .load_state.json, transitions to .load_state_history.json
- exit codes: 0=GREEN/PASS, 1=YELLOW/WARN, 2=RED/BLOCK

### Runtime proof
- compile: PASS
- default get (no file): GREEN
- set YELLOW: GREEN -> YELLOW with reason
- get --json: correct JSON output
- set RED: YELLOW -> RED with warning
- check-escalation RED: BLOCK exit 2
- set GREEN: RED -> GREEN recovery
- history: 3 append-only transitions logged
- check-escalation GREEN: PASS exit 0

### Integration hooks
- governance_checker.py can read .load_state.json directly
- promote_patch.py can call --check-escalation before apply
- RED state blocks all new stages per canon

### Next stage forecast
- 095: node/session recap reseed automation


---

## STAGE_094_SEALED — LOAD STATE BRIDGE
UTC: 2026-03-09T04:10:11Z
Anchor: E3592DC3
Status: SEALED

### Final truth
- load_state_bridge.py bridges L0 Invariant 5 into runtime
- GREEN/YELLOW/RED with persist + append-only history + escalation check
- exit codes: 0=GREEN, 1=YELLOW, 2=RED
- governance_checker and promote_patch can read load state

---

## STAGE_095_SEALED — NODE SESSION HYGIENE
UTC: 2026-03-09T04:10:11Z
Anchor: E3592DC3
Status: SEALED

### Final truth
- node_session_hygiene.py operationalizes reseed doctrine
- HEALTHY/WATCH/RESEED_RECOMMENDED/RESEED_REQUIRED per node
- recap handoff builder for perplexity_philosophy, claude_builder, gpt_observer
- load-state coupling: RED forces minimum WATCH, no auto-HEALTHY
- append-only session history
- no browser automation — judgment + recap artifacts only

### Reseed doctrine is now operational
- Perplexity recap: PERPLEXITY_FULL_RECAP_PAYLOAD.md
- Claude/GPT recap: SOVEREIGN_MEMORY.md + stage_manifest.json
- system now knows when to continue, watch, or reseed any node

### Next stage forecast
- 096: auto-seal integration into broadcaster post-AUTO_DEPLOY
