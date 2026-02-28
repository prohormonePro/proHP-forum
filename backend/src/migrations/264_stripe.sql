DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='stripe_customer_id') THEN
        ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(255) DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='stripe_subscription_id') THEN
        ALTER TABLE users ADD COLUMN stripe_subscription_id VARCHAR(255) DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='subscription_status') THEN
        ALTER TABLE users ADD COLUMN subscription_status VARCHAR(50) DEFAULT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='users' AND column_name='subscription_ends_at') THEN
        ALTER TABLE users ADD COLUMN subscription_ends_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    stripe_event_id TEXT DEFAULT NULL,
    event_type VARCHAR(100) NOT NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    old_tier VARCHAR(50),
    new_tier VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audit_log_stripe_event_id_unique') THEN
        ALTER TABLE audit_log ADD CONSTRAINT audit_log_stripe_event_id_unique UNIQUE (stripe_event_id);
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_stripe_customer_id') THEN
        CREATE UNIQUE INDEX idx_users_stripe_customer_id ON users (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_users_stripe_subscription_id') THEN
        CREATE UNIQUE INDEX idx_users_stripe_subscription_id ON users (stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_log_stripe_event_id') THEN
        CREATE INDEX idx_audit_log_stripe_event_id ON audit_log (stripe_event_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_audit_log_target_user_id') THEN
        CREATE INDEX idx_audit_log_target_user_id ON audit_log (target_user_id);
    END IF;
END$$;

SELECT 'MIGRATION_264_OK' AS status,
       COUNT(*) AS stripe_cols
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('stripe_customer_id','stripe_subscription_id','subscription_status','subscription_ends_at');
