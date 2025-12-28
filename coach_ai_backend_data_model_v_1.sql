-- Coach AI Backend Data Model
-- Version: v1.1
-- Changes from v1.0:
-- 1. Added ai_status to master_logs
-- 2. Allowed global chats (master_log_id nullable)
-- 3. Clarified AI feedback storage via chat_messages.metadata
-- 4. Added optional validation metadata support

-- =============================
-- 1. USERS TABLE
-- =============================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    google_sub      TEXT UNIQUE NOT NULL,
    email           TEXT UNIQUE NOT NULL,
    email_verified  BOOLEAN NOT NULL DEFAULT false,

    name            TEXT,
    picture_url     TEXT,

    gender          TEXT,
    dob             DATE,
    height_cm       NUMERIC(5,2),

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================
-- 2. GOALS TABLE
-- =============================

CREATE TABLE goals (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    goal_type        TEXT NOT NULL,
    description      TEXT NOT NULL,

    start_date       DATE NOT NULL,
    target_date      DATE,

    start_weight_kg  NUMERIC(5,2),
    target_weight_kg NUMERIC(5,2),

    constraints      JSONB,
    preferences      JSONB,

    status           TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================
-- 3. RESOURCES TABLE
-- =============================

CREATE TABLE resources (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    storage_path    TEXT NOT NULL,
    resource_type   TEXT NOT NULL, -- IMAGE, PDF
    category        TEXT,          -- FOOD, BODY_PHOTO, MEDICAL, etc.

    mime_type       TEXT,
    file_size_bytes INTEGER,

    metadata        JSONB,          -- OCR output, page count, validation notes

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================
-- 4. MASTER LOGS TABLE (CORE)
-- =============================

CREATE TABLE master_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id         UUID REFERENCES goals(id),

    log_timestamp   TIMESTAMPTZ NOT NULL,   -- user-defined
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    log_type        TEXT NOT NULL,           -- WEIGHT, FOOD, BODY_PHOTO, MEDICAL, NOTE
    source          TEXT,

    raw_text        TEXT,
    structured_data JSONB NOT NULL,          -- mandatory per log_type

    resource_ids    UUID[] DEFAULT '{}',

    ai_status       TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | COMPLETED | FAILED
    ai_coach_remark JSONB,                   -- populated when ai_status = COMPLETED

    validation_meta JSONB,                   -- warnings, corrections shown to user
    tags            TEXT[] DEFAULT '{}'
);


-- =============================
-- 5. CHATS TABLE
-- =============================

CREATE TABLE chats (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_id         UUID REFERENCES goals(id),

    master_log_id   UUID REFERENCES master_logs(id) ON DELETE CASCADE,
    -- NULL master_log_id indicates GLOBAL CHAT

    title           TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================
-- 6. CHAT MESSAGES TABLE
-- =============================

CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id         UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    sender_type     TEXT NOT NULL, -- USER | AI | SYSTEM
    content         TEXT NOT NULL,

    metadata        JSONB,          -- ai_feedback: UP | DOWN, retry flags, etc.

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================
-- 7. SUMMARIES TABLE
-- =============================

CREATE TABLE summaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    scope_type      TEXT NOT NULL,   -- WEEKLY | MONTHLY | YEARLY | LIFETIME
    period_start    DATE,
    period_end      DATE,

    summary_text    TEXT NOT NULL,
    metrics         JSONB,

    status          TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE | STALE

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- =============================
-- 8. INDEXING (RECOMMENDED)
-- =============================

CREATE INDEX idx_master_logs_user_time ON master_logs(user_id, log_timestamp);
CREATE INDEX idx_master_logs_ai_status ON master_logs(ai_status);
CREATE INDEX idx_chats_master_log ON chats(master_log_id);
CREATE INDEX idx_chat_messages_chat ON chat_messages(chat_id);
CREATE INDEX idx_summaries_user_scope ON summaries(user_id, scope_type);

-- End of Coach AI Data Model v1.1
