-- DentaSense AI — Supabase SQL Migration 001
-- Initial Production Schema with 12 Tables, Indexes, and Strict Row Level Security (RLS)

-- 1. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('patient', 'dental_professional', 'administrator')) DEFAULT 'patient',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    clinic_affiliation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_code TEXT NOT NULL UNIQUE, -- E.g. DSA-7K4M9P2Q
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    date_of_birth DATE,
    preferred_language TEXT NOT NULL CHECK (preferred_language IN ('en', 'hi')) DEFAULT 'en',
    contact_email TEXT,
    contact_phone TEXT,
    is_guest BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_code ON public.patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_auth_user ON public.patients(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON public.patients(created_at DESC);

-- 3. PATIENT ASSIGNMENTS (Dental Professional Access Control)
CREATE TABLE IF NOT EXISTS public.patient_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'completed')) DEFAULT 'active',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (patient_id, professional_id)
);

CREATE INDEX IF NOT EXISTS idx_assignments_professional ON public.patient_assignments(professional_id, status);

-- 4. ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_code TEXT NOT NULL UNIQUE, -- E.g. ASM-9R2K4M
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assessment_status TEXT NOT NULL CHECK (assessment_status IN ('draft', 'completed', 'abandoned')) DEFAULT 'draft',
    image_quality_status TEXT NOT NULL CHECK (image_quality_status IN ('good', 'borderline', 'unusable')) DEFAULT 'good',
    preliminary_urgency_category TEXT NOT NULL CHECK (
        preliminary_urgency_category IN ('emergency', 'urgent_dental', 'routine_dental', 'self_care_monitor', 'insufficient_evidence')
    ),
    urgency_explanation TEXT NOT NULL,
    safety_rule_version TEXT NOT NULL,
    model_provider_version TEXT NOT NULL,
    image_url TEXT,
    image_storage_path TEXT,
    emergency_detected BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_guidance TEXT,
    is_simulated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_patient ON public.assessments(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_code ON public.assessments(assessment_code);
CREATE INDEX IF NOT EXISTS idx_assessments_urgency ON public.assessments(preliminary_urgency_category);

-- 5. ASSESSMENT IMAGES (Private Storage References & Quality Metrics)
CREATE TABLE IF NOT EXISTS public.assessment_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    brightness_score NUMERIC(5,4),
    sharpness_score NUMERIC(5,4),
    quality_status TEXT NOT NULL,
    rejection_reason TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SYMPTOM INTERVIEWS
CREATE TABLE IF NOT EXISTS public.symptom_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    language TEXT NOT NULL CHECK (language IN ('en', 'hi')) DEFAULT 'en',
    interview_mode TEXT NOT NULL CHECK (interview_mode IN ('voice', 'text', 'hybrid')) DEFAULT 'text',
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 7. SYMPTOM RESPONSES
CREATE TABLE IF NOT EXISTS public.symptom_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_id UUID NOT NULL REFERENCES public.symptom_interviews(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL,
    question_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    structured_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ASSESSMENT FINDINGS (Model Observed Visual Findings)
CREATE TABLE IF NOT EXISTS public.assessment_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    finding_label TEXT NOT NULL,
    anatomical_location TEXT,
    visible_evidence TEXT NOT NULL,
    confidence_band TEXT NOT NULL CHECK (confidence_band IN ('low', 'moderate', 'high')),
    limitations TEXT NOT NULL,
    suggested_followup TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CONSENT RECORDS (Auditable Compliance & Privacy Records)
CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    photo_processing_consent BOOLEAN NOT NULL DEFAULT FALSE,
    voice_transcript_consent BOOLEAN NOT NULL DEFAULT FALSE,
    external_ai_consent BOOLEAN NOT NULL DEFAULT FALSE,
    data_storage_consent BOOLEAN NOT NULL DEFAULT FALSE,
    ip_hash TEXT,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. AUDIT EVENTS
CREATE TABLE IF NOT EXISTS public.audit_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_events(resource_type, resource_id);

-- 11. EVALUATION CASES (Standardized Benchmark Data)
CREATE TABLE IF NOT EXISTS public.evaluation_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    image_description TEXT NOT NULL,
    symptoms_payload JSONB NOT NULL,
    reference_gold_urgency TEXT NOT NULL CHECK (
        reference_gold_urgency IN ('emergency', 'urgent_dental', 'routine_dental', 'self_care_monitor', 'insufficient_evidence')
    ),
    reference_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_synthetic BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. EVALUATION RUNS
CREATE TABLE IF NOT EXISTS public.evaluation_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_name TEXT NOT NULL,
    total_cases INT NOT NULL,
    photo_only_accuracy NUMERIC(5,4) NOT NULL,
    photo_plus_voice_accuracy NUMERIC(5,4) NOT NULL,
    photo_only_metrics JSONB NOT NULL,
    photo_plus_voice_metrics JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_runs ENABLE ROW LEVEL SECURITY;

-- Helper security functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'administrator'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_dental_pro()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('dental_professional', 'administrator')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Profiles: Users see their own profile; admins see all
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Patients: Patients view own records; assigned dentists view assigned patients; admins view all
CREATE POLICY "Patients view own record"
    ON public.patients FOR SELECT
    USING (
        auth.uid() = auth_user_id
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.patient_assignments
            WHERE patient_id = public.patients.id
              AND professional_id = auth.uid()
              AND status = 'active'
        )
    );

CREATE POLICY "Patients register or admin manage"
    ON public.patients FOR INSERT
    WITH CHECK (auth.uid() = auth_user_id OR public.is_dental_pro() OR is_guest = TRUE);

CREATE POLICY "Patients update own record or authorized pro"
    ON public.patients FOR UPDATE
    USING (auth.uid() = auth_user_id OR public.is_dental_pro());

CREATE POLICY "Patients delete own record or admin"
    ON public.patients FOR DELETE
    USING (auth.uid() = auth_user_id OR public.is_admin());

-- Assessments: Patient or assigned professional
CREATE POLICY "Assessments view policy"
    ON public.assessments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = assessments.patient_id
              AND (
                p.auth_user_id = auth.uid()
                OR public.is_admin()
                OR EXISTS (
                    SELECT 1 FROM public.patient_assignments pa
                    WHERE pa.patient_id = p.id
                      AND pa.professional_id = auth.uid()
                      AND pa.status = 'active'
                )
              )
        )
    );

CREATE POLICY "Assessments insert policy"
    ON public.assessments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = assessments.patient_id
              AND (p.auth_user_id = auth.uid() OR p.is_guest = TRUE OR public.is_dental_pro())
        )
    );

CREATE POLICY "Assessments delete policy"
    ON public.assessments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = assessments.patient_id
              AND (p.auth_user_id = auth.uid() OR public.is_admin())
        )
    );

-- Evaluation cases: readable by authenticated users and evaluated transparently
CREATE POLICY "Evaluation cases read"
    ON public.evaluation_cases FOR SELECT
    USING (TRUE);

CREATE POLICY "Evaluation runs read"
    ON public.evaluation_runs FOR SELECT
    USING (TRUE);
