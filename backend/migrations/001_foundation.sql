-- ============================================================
-- PROHP FORUM — MIGRATION 001: FOUNDATION
-- Stage 215 · MVP Tables for March 15, 2026 Launch
-- Anchor: E3592DC3
-- ============================================================

-- Run: psql -U prohp -d prohp_forum -f 001_foundation.sql

BEGIN;

-- ── Extensions ──
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. USERS (Auth + Profile + Tier)
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    username        TEXT UNIQUE NOT NULL,
    display_name    TEXT,
    bio             TEXT DEFAULT '',
    avatar_url      TEXT,

    -- Tier: lab_rat (free), premium ($19), elite ($39), admin
    tier            TEXT NOT NULL DEFAULT 'lab_rat'
                    CHECK (tier IN ('lab_rat', 'premium', 'elite', 'admin')),

    -- Stripe
    stripe_customer_id  TEXT,
    stripe_sub_id       TEXT,
    stripe_sub_status   TEXT DEFAULT 'none'
                        CHECK (stripe_sub_status IN ('none','active','past_due','canceled','trialing')),

    -- Profile
    reputation      INTEGER NOT NULL DEFAULT 0,
    is_founding     BOOLEAN NOT NULL DEFAULT false,
    is_verified     BOOLEAN NOT NULL DEFAULT false,
    is_banned       BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMPTZ,
    email_verified_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_tier ON users(tier);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================================
-- 2. COMPOUNDS (52 from YouTube + expandable)
-- ============================================================
CREATE TABLE compounds (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT 'sarm'
                    CHECK (category IN (
                        'sarm', 'prohormone', 'peptide', 'serm',
                        'ai', 'natural', 'ancillary', 'other'
                    )),

    -- Content
    summary         TEXT DEFAULT '',
    mechanism       TEXT DEFAULT '',
    side_effects    TEXT DEFAULT '',
    dosing          TEXT DEFAULT '',

    -- Classification
    risk_tier       TEXT DEFAULT 'moderate'
                    CHECK (risk_tier IN ('low', 'moderate', 'high', 'extreme')),
    trust_level     TEXT DEFAULT 'reviewed'
                    CHECK (trust_level IN ('unreviewed', 'reviewed', 'verified', 'gold_standard')),

    -- YouTube link
    youtube_video_id TEXT,
    youtube_url     TEXT,

    -- Hair loss grid data (MVP: simple boolean flags)
    causes_hair_loss    BOOLEAN,
    hair_loss_severity  TEXT CHECK (hair_loss_severity IN ('none', 'mild', 'moderate', 'severe')),

    -- Metadata
    is_published    BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compounds_slug ON compounds(slug);
CREATE INDEX idx_compounds_category ON compounds(category);
CREATE INDEX idx_compounds_published ON compounds(is_published) WHERE is_published = true;

-- ============================================================
-- 3. ROOMS (Districts — 3 for MVP)
-- ============================================================
CREATE TABLE rooms (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug            TEXT UNIQUE NOT NULL,
    name            TEXT NOT NULL,
    description     TEXT DEFAULT '',
    icon            TEXT DEFAULT '💬',

    -- Access control
    -- read_tier: minimum tier to READ threads
    -- write_tier: minimum tier to CREATE threads/posts
    read_tier       TEXT NOT NULL DEFAULT 'lab_rat'
                    CHECK (read_tier IN ('lab_rat', 'premium', 'elite', 'admin')),
    write_tier      TEXT NOT NULL DEFAULT 'lab_rat'
                    CHECK (write_tier IN ('lab_rat', 'premium', 'elite', 'admin')),

    -- Display
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_archived     BOOLEAN NOT NULL DEFAULT false,

    -- Stats (denormalized for performance)
    thread_count    INTEGER NOT NULL DEFAULT 0,
    post_count      INTEGER NOT NULL DEFAULT 0,
    last_post_at    TIMESTAMPTZ,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. THREADS
-- ============================================================
CREATE TABLE threads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id         UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    compound_id     UUID REFERENCES compounds(id) ON DELETE SET NULL,

    title           TEXT NOT NULL CHECK (char_length(title) >= 3 AND char_length(title) <= 200),
    body            TEXT NOT NULL CHECK (char_length(body) >= 10),

    -- State
    is_pinned       BOOLEAN NOT NULL DEFAULT false,
    is_locked       BOOLEAN NOT NULL DEFAULT false,
    is_deleted      BOOLEAN NOT NULL DEFAULT false,

    -- Voting
    upvotes         INTEGER NOT NULL DEFAULT 0,
    downvotes       INTEGER NOT NULL DEFAULT 0,
    score           INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,

    -- Stats
    reply_count     INTEGER NOT NULL DEFAULT 0,
    view_count      INTEGER NOT NULL DEFAULT 0,
    last_reply_at   TIMESTAMPTZ,
    last_reply_by   UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_threads_room ON threads(room_id, created_at DESC) WHERE NOT is_deleted;
CREATE INDEX idx_threads_author ON threads(author_id);
CREATE INDEX idx_threads_compound ON threads(compound_id) WHERE compound_id IS NOT NULL;
CREATE INDEX idx_threads_pinned ON threads(room_id, is_pinned DESC, last_reply_at DESC NULLS LAST);
CREATE INDEX idx_threads_score ON threads(score DESC);

-- Full-text search
ALTER TABLE threads ADD COLUMN search_vector tsvector;
CREATE INDEX idx_threads_search ON threads USING gin(search_vector);

CREATE OR REPLACE FUNCTION threads_search_update() RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
                          setweight(to_tsvector('english', COALESCE(NEW.body, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_threads_search
    BEFORE INSERT OR UPDATE OF title, body ON threads
    FOR EACH ROW EXECUTE FUNCTION threads_search_update();

-- ============================================================
-- 5. POSTS (Replies)
-- ============================================================
CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id       UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id       UUID REFERENCES posts(id) ON DELETE SET NULL,

    body            TEXT NOT NULL CHECK (char_length(body) >= 1),

    -- State
    is_best_answer  BOOLEAN NOT NULL DEFAULT false,
    is_helpful      BOOLEAN NOT NULL DEFAULT false,
    is_deleted      BOOLEAN NOT NULL DEFAULT false,

    -- Voting
    upvotes         INTEGER NOT NULL DEFAULT 0,
    downvotes       INTEGER NOT NULL DEFAULT 0,
    score           INTEGER GENERATED ALWAYS AS (upvotes - downvotes) STORED,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_thread ON posts(thread_id, created_at ASC) WHERE NOT is_deleted;
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_parent ON posts(parent_id) WHERE parent_id IS NOT NULL;

-- ============================================================
-- 6. VOTES (Prevents double-voting)
-- ============================================================
CREATE TABLE votes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type     TEXT NOT NULL CHECK (target_type IN ('thread', 'post')),
    target_id       UUID NOT NULL,
    value           SMALLINT NOT NULL CHECK (value IN (-1, 1)),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id, target_type, target_id)
);

CREATE INDEX idx_votes_target ON votes(target_type, target_id);

-- ============================================================
-- 7. CYCLE LOGS (MVP — basic tracking)
-- ============================================================
CREATE TABLE cycle_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    compound_id     UUID REFERENCES compounds(id) ON DELETE SET NULL,

    title           TEXT NOT NULL,
    description     TEXT DEFAULT '',
    status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'completed', 'abandoned')),

    -- Cycle params
    compound_name   TEXT NOT NULL,
    dose            TEXT,
    duration_weeks  INTEGER,
    start_date      DATE,
    end_date        DATE,

    -- Stats
    follower_count  INTEGER NOT NULL DEFAULT 0,
    update_count    INTEGER NOT NULL DEFAULT 0,
    is_featured     BOOLEAN NOT NULL DEFAULT false,
    is_public       BOOLEAN NOT NULL DEFAULT true,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cycle_logs_user ON cycle_logs(user_id);
CREATE INDEX idx_cycle_logs_compound ON cycle_logs(compound_id);
CREATE INDEX idx_cycle_logs_status ON cycle_logs(status) WHERE status = 'active';
CREATE INDEX idx_cycle_logs_featured ON cycle_logs(is_featured) WHERE is_featured = true;

-- ============================================================
-- 8. CYCLE UPDATES (Weekly check-ins)
-- ============================================================
CREATE TABLE cycle_updates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_log_id    UUID NOT NULL REFERENCES cycle_logs(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    week_number     INTEGER NOT NULL,
    weight_lbs      DECIMAL(5,1),
    body_fat_pct    DECIMAL(4,1),
    strength_notes  TEXT DEFAULT '',
    side_effects    TEXT DEFAULT '',
    side_effect_severity INTEGER CHECK (side_effect_severity BETWEEN 1 AND 10),
    mood_notes      TEXT DEFAULT '',
    general_notes   TEXT DEFAULT '',

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cycle_updates_log ON cycle_updates(cycle_log_id, week_number);

-- ============================================================
-- 9. REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- ============================================================
-- 10. NOTIFICATIONS (MVP)
-- ============================================================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN (
        'reply', 'vote', 'mention', 'badge', 'system', 'cycle_update'
    )),
    title           TEXT NOT NULL,
    body            TEXT DEFAULT '',
    link            TEXT,
    is_read         BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ============================================================
-- TRIGGERS: Auto-update timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_compounds_updated BEFORE UPDATE ON compounds FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_rooms_updated BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_threads_updated BEFORE UPDATE ON threads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_posts_updated BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_cycle_logs_updated BEFORE UPDATE ON cycle_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- TRIGGERS: Denormalized counters
-- ============================================================

-- Thread reply count + room stats
CREATE OR REPLACE FUNCTION update_thread_reply_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NOT NEW.is_deleted THEN
        UPDATE threads SET reply_count = reply_count + 1,
            last_reply_at = NEW.created_at, last_reply_by = NEW.author_id
            WHERE id = NEW.thread_id;
        UPDATE rooms SET post_count = post_count + 1, last_post_at = NEW.created_at
            WHERE id = (SELECT room_id FROM threads WHERE id = NEW.thread_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_post_count AFTER INSERT ON posts FOR EACH ROW EXECUTE FUNCTION update_thread_reply_count();

-- Room thread count
CREATE OR REPLACE FUNCTION update_room_thread_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NOT NEW.is_deleted THEN
        UPDATE rooms SET thread_count = thread_count + 1 WHERE id = NEW.room_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_thread_count AFTER INSERT ON threads FOR EACH ROW EXECUTE FUNCTION update_room_thread_count();

-- Cycle log update count
CREATE OR REPLACE FUNCTION update_cycle_update_count() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE cycle_logs SET update_count = update_count + 1 WHERE id = NEW.cycle_log_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cycle_update_count AFTER INSERT ON cycle_updates FOR EACH ROW EXECUTE FUNCTION update_cycle_update_count();

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- Run after migration to confirm:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- Expected: 10 tables (compounds, cycle_logs, cycle_updates, notifications,
--           posts, refresh_tokens, rooms, threads, users, votes)
