-- STAGE_045 Content Seed: product_url + public_discount_code
-- All purchasable compounds get TRAVISD as public discount code
-- Banned/N-A compounds get NULL product_url
-- Run on srv2: psql -U prohp -d prohp_forum -h localhost -f seed_product_urls.sql

BEGIN;

-- Set public discount code for all compounds
UPDATE compounds SET public_discount_code = 'TRAVISD' WHERE public_discount_code IS NULL OR public_discount_code = '';

UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/andriol' WHERE LOWER(name) = LOWER('Andriol');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/sustanon-250' WHERE LOWER(name) = LOWER('Sustanon 250');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/decabolin' WHERE LOWER(name) = LOWER('Decabolin');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/chosen-1-blackstone-labs' WHERE LOWER(name) = LOWER('Chosen-1');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/deca-durabolin' WHERE LOWER(name) = LOWER('Deca-Durabolin');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/hi-tech-phamraceuticals-trenabol' WHERE LOWER(name) = LOWER('Trenabol');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/winstrol-hi-tech-pharmaceuticals' WHERE LOWER(name) = LOWER('Winstrol');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/halodrol' WHERE LOWER(name) = LOWER('Halodrol');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/monsterplexx-innovative-labs' WHERE LOWER(name) = LOWER('Monsterplexx');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/abnormal-blackstone-labs' WHERE LOWER(name) = LOWER('Abnormal');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/dymethazine' WHERE LOWER(name) = LOWER('Dymethazine');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/pink-magic?_pos=1&_sid=a911b1599&_ss=r' WHERE LOWER(name) = LOWER('Pink Magic');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/primobolan' WHERE LOWER(name) = LOWER('Primobolan');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/superstrol-7-blackstone-labs' WHERE LOWER(name) = LOWER('Superstrol-7');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/pro-igf-1-hgh' WHERE LOWER(name) = LOWER('Pro IGF-1');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/811836020922' WHERE LOWER(name) = LOWER('Equipoise');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/ostaplex-hi-tech-pharmaceuticals' WHERE LOWER(name) = LOWER('Ostaplex');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/dianabol%C2%AE' WHERE LOWER(name) = LOWER('Dianabol');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/brutal-4ce-blackstone-labs' WHERE LOWER(name) = LOWER('Brutal 4ce');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/anavar' WHERE LOWER(name) = LOWER('Anavar');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/halotestin' WHERE LOWER(name) = LOWER('Halotestin');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/methaquad-extreme-blackstone-labs' WHERE LOWER(name) = LOWER('Methaquad');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/helladrol-innovative-labs' WHERE LOWER(name) = LOWER('Helladrol');
UPDATE compounds SET product_url = 'https://somachems.com/product/rad-140/' WHERE LOWER(name) = LOWER('Rad 150');
UPDATE compounds SET product_url = 'https://somachems.com/product/enclomiphene/' WHERE LOWER(name) = LOWER('Enclomiphene');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/collections/hi-tech-pharmaceuticals' WHERE LOWER(name) = LOWER('AC-262');
UPDATE compounds SET product_url = 'https://somachems.com/product/mk-677/' WHERE LOWER(name) = LOWER('Mk-677');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/halo-elite-blackstone' WHERE LOWER(name) = LOWER('Halo Elite');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/nuvital-genesis-1-regenerative-peptide-growth-factor-matrix-28-servings' WHERE LOWER(name) = LOWER('Genesis-1');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/laxogenin-100' WHERE LOWER(name) = LOWER('Laxogenin');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/slimaglutide' WHERE LOWER(name) = LOWER('Slimaglutide');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/arimistane' WHERE LOWER(name) = LOWER('Arimistane');
UPDATE compounds SET product_url = 'https://blackstonelabs.com/products/eradicate' WHERE LOWER(name) = LOWER('Eraticate');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/' WHERE LOWER(name) = LOWER('N-Acetyl Cysteine');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/coq-10' WHERE LOWER(name) = LOWER('CoQ10 (Ubiquinol)');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/ashwagandha' WHERE LOWER(name) = LOWER('Ashwagandha');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/citrus-bergamot-nutra-bio' WHERE LOWER(name) = LOWER('Citrus Bergamot');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/tudca-60-servings-supports-liver-detoxification' WHERE LOWER(name) = LOWER('TUDCA');
UPDATE compounds SET product_url = 'https://totalnutritionhouston.com/products/nutrabio-vitamin-b6-p5p' WHERE LOWER(name) = LOWER('P5P (B6)');
UPDATE compounds SET product_url = 'https://somachems.com/product/glp3/' WHERE LOWER(name) = LOWER('Retatrutide');
UPDATE compounds SET product_url = 'https://somachems.com/product/slu-pp-332/' WHERE LOWER(name) = LOWER('SLU-PP-332');
UPDATE compounds SET product_url = 'https://somachems.com/product/methylene-blue-1-pharma-grade/' WHERE LOWER(name) = LOWER('Methylene Blue');

-- Banned/unavailable compounds: clear product_url
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('TRT');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('3-AD');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('Androdiol');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('Superdrol');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('1-Testosterone');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('1-AD');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('Trenavar');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('M1T');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('M-Sten');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('Letro XT');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('Estrogenix 2nd Gen');
UPDATE compounds SET product_url = NULL WHERE LOWER(name) = LOWER('Turk Builder');

COMMIT;

-- Verify
SELECT name, product_url, public_discount_code FROM compounds WHERE is_published = true ORDER BY name;
