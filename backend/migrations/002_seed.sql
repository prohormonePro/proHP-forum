-- ============================================================
-- PROHP FORUM — SEED: ROOMS + COMPOUNDS
-- 3 Districts (MVP) + 52 Compounds from YouTube
-- Anchor: E3592DC3
-- ============================================================

BEGIN;

-- ============================================================
-- ROOMS (3 MVP Districts)
-- ============================================================
-- Airlock: Free for all. Read + write. Welcome area.
-- Library: Free to read, premium to post. Encyclopedia + discussions.
-- Lab: Premium only. Cycle logs, bloodwork, deep dives.
-- (Post-launch: Dojo = Elite training, Inner Circle = Elite war room)

INSERT INTO rooms (slug, name, description, icon, read_tier, write_tier, sort_order) VALUES
('airlock', 'The Airlock', 'Welcome aboard. Introduce yourself, ask questions, find your footing. Every member starts here.', '🚀', 'lab_rat', 'lab_rat', 1),
('library', 'The Library', 'Compound breakdowns, research discussions, mechanism deep-dives. Free to read. Premium to contribute.', '📚', 'lab_rat', 'premium', 2),
('lab', 'The Lab', 'Cycle logs, bloodwork results, protocol discussions. Where the real work happens. Premium members only.', '🔬', 'premium', 'premium', 3);

-- ============================================================
-- COMPOUNDS (52 from YouTube channel)
-- ============================================================
-- Categories: sarm, prohormone, peptide, serm, ai, natural, ancillary, other
-- Risk tiers: low, moderate, high, extreme
-- Trust: unreviewed, reviewed, verified, gold_standard

INSERT INTO compounds (slug, name, category, risk_tier, trust_level, summary) VALUES
-- SARMs
('lgd-4033', 'LGD-4033 (Ligandrol)', 'sarm', 'moderate', 'gold_standard', 'Most popular SARM. Oral acts wet, injectable acts dry. SHBG feedback loop drives progressive suppression.'),
('rad-140', 'RAD-140 (Testolone)', 'sarm', 'moderate', 'gold_standard', 'Selective androgen receptor modulator with 90:1 anabolic to androgenic ratio. Accumulation effect 2.5-3x by week 2-3.'),
('ostarine', 'Ostarine (MK-2866)', 'sarm', 'low', 'verified', 'Entry-level SARM. Mild gains, mild suppression. Good starting point for first cycle.'),
('s23', 'S-23', 'sarm', 'high', 'reviewed', 'One of the strongest SARMs. Significant suppression. Not for beginners.'),
('s4', 'S-4 (Andarine)', 'sarm', 'moderate', 'reviewed', 'Known for vision side effects at higher doses. Yellow tint, night vision issues.'),
('yk-11', 'YK-11', 'sarm', 'high', 'reviewed', 'Myostatin inhibitor properties. Technically a steroidal SARM. Liver toxic.'),
('gw-501516', 'GW-501516 (Cardarine)', 'other', 'moderate', 'reviewed', 'Not technically a SARM. PPAR delta agonist. Endurance enhancer. Cancer concerns in rodent studies.'),
('sr-9009', 'SR-9009 (Stenabolic)', 'other', 'low', 'reviewed', 'Rev-ErbA agonist. Poor oral bioavailability. Better injected or sublingual.'),
('mk-677', 'MK-677 (Ibutamoren)', 'peptide', 'low', 'verified', 'Growth hormone secretagogue. Not a SARM. Increases appetite, water retention, sleep quality.'),

-- Prohormones
('superdrol', 'Superdrol (Methyldrostanolone)', 'prohormone', 'extreme', 'verified', 'One of the strongest oral steroids. Severe liver toxicity. Requires full PCT and liver support.'),
('epistane', 'Epistane', 'prohormone', 'high', 'reviewed', 'DHT-derived. Dry compound. Liver toxic. Good for cutting cycles.'),
('halodrol', 'Halodrol', 'prohormone', 'high', 'reviewed', 'Turinabol precursor. Moderate gains with moderate sides.'),
('dmz', 'DMZ (Dymethazine)', 'prohormone', 'extreme', 'reviewed', 'Very liver toxic. Strong mass builder. Requires extensive support.'),
('m-sten', 'M-Sten (Methylstenbolone)', 'prohormone', 'extreme', 'reviewed', 'Potent mass builder. Extremely liver toxic. Short cycles only.'),
('1-andro', '1-Andro (1-DHEA)', 'prohormone', 'moderate', 'verified', 'Legal prohormone. Converts to 1-testosterone. Dry compound. Does NOT convert to estrogen.'),
('4-andro', '4-Andro (4-DHEA)', 'prohormone', 'moderate', 'verified', 'Converts to testosterone. Wet compound. Good as a test base for SARM cycles.'),
('epiandro', 'Epiandro (Epiandrosterone)', 'prohormone', 'low', 'verified', 'Converts to DHT. Mild. Good entry-level prohormone.'),
('3-ad', '3-AD (Androstenetrione)', 'prohormone', 'moderate', 'reviewed', 'Controversial. ProHP forensic analysis exposed testing concerns.'),
('arimistane', 'Arimistane', 'ai', 'low', 'verified', 'OTC aromatase inhibitor. Used in PCT and on-cycle estrogen management.'),

-- Peptides
('bpc-157', 'BPC-157', 'peptide', 'low', 'verified', 'Body Protection Compound. Healing peptide. Gut healing, tendon repair, anti-inflammatory.'),
('tb-500', 'TB-500 (Thymosin Beta-4)', 'peptide', 'low', 'reviewed', 'Healing and recovery peptide. Often stacked with BPC-157.'),
('cjc-1295', 'CJC-1295', 'peptide', 'low', 'reviewed', 'Growth hormone releasing hormone analog. Used with Ipamorelin.'),
('ipamorelin', 'Ipamorelin', 'peptide', 'low', 'reviewed', 'Growth hormone releasing peptide. Clean GH pulse without cortisol/prolactin spike.'),
('pt-141', 'PT-141 (Bremelanotide)', 'peptide', 'low', 'reviewed', 'Melanocortin receptor agonist. Used for sexual dysfunction.'),
('ghk-cu', 'GHK-Cu', 'peptide', 'low', 'reviewed', 'Copper peptide. Skin healing, anti-aging, wound repair.'),
('igf-1-lr3', 'IGF-1 LR3', 'peptide', 'moderate', 'reviewed', 'Long-acting insulin-like growth factor. Potent for muscle growth. Hypoglycemia risk.'),

-- SERMs / PCT
('enclomiphene', 'Enclomiphene', 'serm', 'low', 'gold_standard', 'Trans-isomer of clomiphene. Cleanest SERM for PCT. Stimulates LH/FSH without estrogenic sides of Clomid.'),
('nolvadex', 'Nolvadex (Tamoxifen)', 'serm', 'low', 'verified', 'Gold standard PCT SERM. Blocks estrogen at breast tissue. Required for injectable SARM PCT.'),
('clomid', 'Clomid (Clomiphene)', 'serm', 'moderate', 'verified', 'Mixed isomer SERM. Works but more side effects than enclomiphene. Vision issues possible.'),
('raloxifene', 'Raloxifene', 'serm', 'low', 'reviewed', 'SERM used specifically for gyno reversal. More targeted than Nolvadex.'),

-- AIs
('anastrozole', 'Anastrozole (Arimidex)', 'ai', 'moderate', 'verified', 'Prescription aromatase inhibitor. Potent estrogen control. Easy to crash E2.'),
('letrozole', 'Letrozole (Femara)', 'ai', 'high', 'reviewed', 'Nuclear option AI. Obliterates estrogen. Use only when necessary.'),
('exemestane', 'Exemestane (Aromasin)', 'ai', 'moderate', 'reviewed', 'Suicidal AI. Irreversibly binds to aromatase. Harder to crash E2 vs anastrozole.'),

-- Naturals / Supplements
('turkesterone', 'Turkesterone', 'natural', 'low', 'reviewed', 'Ecdysteroid. Marketed as natural anabolic. Evidence mixed. Popular but overhyped.'),
('tongkat-ali', 'Tongkat Ali', 'natural', 'low', 'verified', 'Eurycoma longifolia. Mild testosterone optimization. Good for natural stack.'),
('ashwagandha', 'Ashwagandha (KSM-66)', 'natural', 'low', 'verified', 'Adaptogen. Cortisol reduction, mild testosterone support, anxiety reduction.'),
('fadogia-agrestis', 'Fadogia Agrestis', 'natural', 'moderate', 'reviewed', 'Nigerian shrub. Testosterone support claims. Testicular toxicity concerns at high doses.'),
('shilajit', 'Shilajit', 'natural', 'low', 'verified', 'Fulvic acid mineral complex. Neurogenesis pathway. CoQ10 synergy.'),
('l-citrulline', 'L-Citrulline', 'natural', 'low', 'verified', 'Nitric oxide precursor. Vasodilation pathway. Better than L-arginine for pumps.'),
('creatine', 'Creatine Monohydrate', 'natural', 'low', 'gold_standard', 'Most studied supplement in existence. ATP regeneration. 5g daily. No loading needed.'),

-- Ancillaries
('nac', 'NAC (N-Acetyl Cysteine)', 'ancillary', 'low', 'verified', 'Liver support. Glutathione precursor. Essential on any hepatotoxic cycle.'),
('tudca', 'TUDCA', 'ancillary', 'low', 'verified', 'Tauroursodeoxycholic acid. Premium liver support. Use with oral prohormones.'),
('fish-oil', 'Fish Oil (Omega-3)', 'ancillary', 'low', 'verified', 'Cardiovascular support. HDL protection. Essential on any cycle that tanks lipids.'),
('coq10', 'CoQ10 (Ubiquinol)', 'ancillary', 'low', 'verified', 'Mitochondrial support. Neurogenesis pathway. Heart health.'),
('vitamin-d', 'Vitamin D3', 'ancillary', 'low', 'verified', 'Vasodilation pathway. Immune support. Most people are deficient.'),
('magnesium', 'Magnesium (Glycinate)', 'ancillary', 'low', 'verified', 'Sleep, recovery, electrolyte balance. Glycinate form for bioavailability.'),
('zinc', 'Zinc', 'ancillary', 'low', 'verified', 'Testosterone cofactor. Immune support. Don''t exceed 50mg daily.'),

-- Other
('trt', 'TRT (Testosterone Replacement)', 'other', 'moderate', 'gold_standard', 'Testosterone replacement therapy. The baseline. 100-200mg/week. Required test base for most cycles.'),
('hcg', 'HCG (Human Chorionic Gonadotropin)', 'other', 'low', 'verified', 'Prevents testicular atrophy on cycle. Mimics LH. 250-500 IU 2x/week.'),
('modafinil', 'Modafinil', 'other', 'low', 'reviewed', 'Wakefulness agent. Cognitive enhancement. Not an anabolic but commonly stacked.');

COMMIT;

-- ============================================================
-- VERIFICATION
-- ============================================================
-- SELECT category, count(*) FROM compounds GROUP BY category ORDER BY count(*) DESC;
-- Expected: ~52 compounds across 8 categories
-- SELECT * FROM rooms ORDER BY sort_order;
-- Expected: 3 rooms (airlock, library, lab)
