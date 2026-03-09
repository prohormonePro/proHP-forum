-- STAGE 100: Compound table migrations
-- Idempotent: safe to rerun
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS article_content TEXT;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS article_preview TEXT;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS product_price DECIMAL(10,2);
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS product_image_url TEXT;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS nutrition_label_url TEXT;
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS thread_id UUID REFERENCES threads(id);
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS member_discount_code TEXT DEFAULT 'PROHPFORUM';
ALTER TABLE compounds ADD COLUMN IF NOT EXISTS public_discount_code TEXT DEFAULT 'TRAVISD';

-- Verify
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'compounds' AND column_name IN (
  'article_content','article_preview','product_price','product_image_url',
  'nutrition_label_url','thread_id','member_discount_code','public_discount_code'
) ORDER BY column_name;
