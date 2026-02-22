-- STAGE_245: Stripe subscription columns + audit_log (idempotent, additive only)

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT,
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_user_id UUID NULL,
  target_user_id UUID NULL,
  action TEXT NOT NULL,
  stripe_event_id TEXT UNIQUE,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_audit_log_target_user_id ON audit_log(target_user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_customer_id_unique
  ON users (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_stripe_subscription_id_unique
  ON users (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

COMMIT;
