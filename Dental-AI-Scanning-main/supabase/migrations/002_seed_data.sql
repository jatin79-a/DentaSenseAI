-- DentaSense AI — Supabase SQL Migration 002
-- Synthetic Benchmark Evaluation Cases (Clearly labelled as synthetic research data)

INSERT INTO public.evaluation_cases (case_code, title, image_url, image_description, symptoms_payload, reference_gold_urgency, reference_findings, is_synthetic)
VALUES
(
    'DS-EVAL-001',
    'Submandibular Infection with Airway Red Flags',
    '/demo-cases/case1.jpg',
    'Mild erythema around lower right molar with subtle submandibular puffiness.',
    '{"chiefConcern":"Severe swelling under jaw, tight breathing","painScore":9,"hasSwelling":true,"swellingSpreadingRapidly":true,"hasDifficultyBreathing":true,"hasDifficultySwallowing":true}'::jsonb,
    'emergency',
    '["Potential deep neck space cellulitis / Ludwig’s angina risk"]'::jsonb,
    TRUE
),
(
    'DS-EVAL-002',
    'Acute Periapical Abscess with Localized Gum Boil',
    '/demo-cases/case2.jpg',
    'Fluctuant erythematous nodule on maxillary buccal gingiva adjacent to discolored canine.',
    '{"chiefConcern":"Throbbing pain, bump on gum discharging fluid","painScore":8,"hasSwelling":true,"swellingSpreadingRapidly":false,"hasBleeding":true,"bleedingSpontaneous":true}'::jsonb,
    'urgent_dental',
    '["Buccal parulis / draining fistula suggestive of chronic or acute periapical abscess"]'::jsonb,
    TRUE
),
(
    'DS-EVAL-003',
    'Occlusal Pit Enamel Demineralization (Mild Decay)',
    '/demo-cases/case3.jpg',
    'Dark staining in central groove of lower first molar, no obvious structural cavitation.',
    '{"chiefConcern":"Dark spot on back tooth, occasional sweet sensitivity","painScore":1,"hasSwelling":false,"hasBleeding":false}'::jsonb,
    'routine_dental',
    '["Occlusal fissure staining / incipient caries"]'::jsonb,
    TRUE
),
(
    'DS-EVAL-004',
    'Harmless Enamel Fluorosis & Benign Intrinsic Staining',
    '/demo-cases/case4.jpg',
    'Diffuse chalky white bilateral striations across maxillary central incisors.',
    '{"chiefConcern":"White spots on front teeth, cosmetic appearance","painScore":0,"hasSwelling":false,"hasBleeding":false}'::jsonb,
    'self_care_monitor',
    '["Mild enamel fluorosis, non-pathological"]'::jsonb,
    TRUE
),
(
    'DS-EVAL-005',
    'Acute Uncomplicated Tooth Crown Fracture',
    '/demo-cases/case5.jpg',
    'Chipped disto-incisal corner of upper right lateral incisor.',
    '{"chiefConcern":"Bit down on ice and tooth broke with sharp edge","painScore":7,"hasSwelling":false,"hasBleeding":false}'::jsonb,
    'urgent_dental',
    '["Coronal fracture involving enamel and dentin"]'::jsonb,
    TRUE
),
(
    'DS-EVAL-006',
    'Mild Plaque-Induced Marginal Gingivitis',
    '/demo-cases/case6.jpg',
    'Edematous rounded gingival papillae between lower incisors with plaque accumulation.',
    '{"chiefConcern":"Bleeding while flossing","painScore":0,"hasSwelling":false,"hasBleeding":true,"bleedingSpontaneous":false}'::jsonb,
    'routine_dental',
    '["Plaque-induced gingival inflammation"]'::jsonb,
    TRUE
)
ON CONFLICT (case_code) DO NOTHING;
