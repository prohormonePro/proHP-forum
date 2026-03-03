-- STAGE_043: Compound detail schema columns (Amendment 04)
-- Anchor: E3592DC3
BEGIN;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS article_content TEXT;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS article_preview TEXT;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS product_price DECIMAL(10,2);
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS product_image_url TEXT;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS nutrition_label_url TEXT;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id);
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS member_discount_code TEXT DEFAULT 'PROHPFORUM';
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS public_discount_code TEXT DEFAULT 'TRAVISD';
CREATE INDEX IF NOT EXISTS idx_compounds_thread_id ON compounds(thread_id) WHERE thread_id IS NOT NULL;
COMMIT;
