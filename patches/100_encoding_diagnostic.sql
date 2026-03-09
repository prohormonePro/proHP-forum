-- STAGE 100 P0-022: AC-262 encoding diagnostic
-- Run FIRST to see scope:
SELECT id, name FROM compounds WHERE name ~ '[^\x20-\x7E]' ORDER BY name;

-- If mojibake found (Ã, â€), targeted fixes:
-- UPDATE compounds SET name = REPLACE(name, 'â€"', '—') WHERE name LIKE '%â€"%';
-- UPDATE compounds SET name = REPLACE(name, 'â€™', '''') WHERE name LIKE '%â€™%';

-- Verify specific compound:
SELECT id, name FROM compounds WHERE name ILIKE '%ac-262%';
