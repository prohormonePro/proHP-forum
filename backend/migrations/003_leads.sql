-- 003_leads.sql
-- For internal analytics only. No external CRM or marketing SaaS integration.

-- Up
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(50),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  converted_at TIMESTAMP NULL
);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS source VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP NULL;

CREATE INDEX IF NOT EXISTS idx_leads_converted ON leads(converted_at) WHERE converted_at IS NOT NULL;
