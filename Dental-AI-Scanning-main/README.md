# DentaSense AI

**AI-Assisted Dental Screening & Patient Assessment Platform**

DentaSense AI is a full-stack clinical intake and preliminary oral screening assistant. It combines photograph quality inspection, two-way conversational symptom interviewing in English and Hindi, a deterministic clinical safety triage engine, collision-safe permanent patient identity tracking, dentist-ready printable reports, and an empirical evaluation framework comparing photo-only vs. photo-plus-voice assessments.

> **Important Clinical Notice**: DentaSense AI is an investigational screening and triage tool. It does **not** provide definitive diagnoses and is **not** a replacement for an in-person dental examination or radiographs by a licensed dentist.

---

## Key Features

1. **Deterministic Clinical Safety Engine (`v1.2.0`)**
   - **Emergency Override Immunity**: Critical red flags (airway compromise, difficulty swallowing, or rapidly spreading facial swelling) trigger immediate emergency department instructions that benign image findings can *never* override.
   - Five versioned urgency tiers: `emergency`, `urgent_dental`, `routine_dental`, `self_care_monitor`, and `insufficient_evidence`.

2. **Automated Image Quality Checker**
   - Pre-analysis verification of JPEG, PNG, and WebP uploads.
   - Evaluates minimum resolution (300×300px), luminance (darkness/overexposure), and blur gradients.
   - Politely rejects unusable photos rather than generating misleading assessments.

3. **Two-Way Voice & Text Adaptive Interview**
   - Native support for **English** and **Hindi (हिंदी)**.
   - Browser Web Speech API bridge for client-side Speech-to-Text (STT) and Text-to-Speech (TTS) with zero audio file retention.
   - 10-node adaptive state machine extracting chief concern, location, duration, pain score (0–10), localized swelling, bleeding, and systemic fever.

4. **Permanent Patient Identity Management**
   - Collision-safe Crockford Base32 Patient ID generator (e.g. `DSA-7K4M9P2Q`).
   - Non-sequential, zero-PII public format.
   - Each screening receives a distinct `ASM-XXXXXX` code. Multiple assessments persist chronologically without overwriting.

5. **Empirical Evaluation Dashboard (Photo-Only vs. Photo+Voice)**
   - Side-by-side benchmark comparison on standardized dentist-labelled clinical cases.
   - Computes multi-class Confusion Matrix, Sensitivity/Recall, Specificity, Precision, and F1-Score.
   - Demonstrates that voice symptoms eliminate missed airway emergencies.

6. **Dentist-Ready Reports & Care Pathway**
   - Print-formatted clinical summaries with urgency levels, visible evidence, confirmed symptoms, limitations, and local provider directory.
   - Machine-readable JSON data export and permanent deletion actions.

---

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Storage**: Private Supabase Storage bucket with short-lived signed URLs
- **Validation**: Zod
- **Testing**: Vitest unit test suite

---

## Directory Structure

```
c:/projects/
├── src/
│   ├── app/                                # Next.js App Router
│   │   ├── api/
│   │   │   ├── analysis/combined/          # Deterministic safety triage API
│   │   │   ├── analysis/vision/            # Vision analysis API
│   │   │   ├── assessments/                # Assessment CRUD & listing
│   │   │   ├── assessments/[id]/           # Single assessment retrieval & deletion
│   │   │   ├── assessments/quality-check/  # Image quality verification API
│   │   │   ├── evaluation/cases/           # Benchmark cases endpoint
│   │   │   ├── evaluation/run/             # Benchmark evaluation runner
│   │   │   ├── interview/                  # Adaptive interview endpoint
│   │   │   ├── patients/                   # Patient registration & search
│   │   │   └── patients/[id]/              # Patient profile & delete
│   │   ├── dashboard/page.tsx              # Patient dashboard
│   │   ├── evaluation/page.tsx             # Model evaluation dashboard
│   │   ├── history/page.tsx                # Screening history & audit trail
│   │   ├── login/page.tsx                  # Sign in & guest mode
│   │   ├── patients/page.tsx               # Authorized patient directory
│   │   ├── patients/[id]/page.tsx          # Patient profile & timeline
│   │   ├── patients/new/page.tsx           # New patient registration
│   │   ├── privacy/page.tsx                # Privacy policy & data rights
│   │   ├── screening/[id]/page.tsx         # Assessment detail & report
│   │   ├── screening/new/page.tsx          # 5-step screening wizard
│   │   ├── settings/page.tsx               # System settings & role switcher
│   │   ├── signup/page.tsx                 # Account registration
│   │   ├── terms/page.tsx                  # Terms & clinical limitations
│   │   ├── globals.css                     # Healthcare design system
│   │   ├── layout.tsx                      # Root layout & role provider
│   │   └── page.tsx                        # Landing page
│   ├── components/
│   │   ├── common/RoleContext.tsx          # Role & session context
│   │   └── layout/
│   │       ├── Footer.tsx                  # Global footer
│   │       └── Navbar.tsx                  # Responsive navigation bar
│   ├── lib/
│   │   ├── evaluation/
│   │   │   ├── benchmark-cases.ts          # Reference clinical cases
│   │   │   └── metrics.ts                  # Sensitivity, F1, & confusion matrix
│   │   ├── providers/
│   │   │   ├── speech-provider.ts          # Web Speech API STT/TTS bridge
│   │   │   ├── text-provider.ts            # Adaptive interview LLM adapter
│   │   │   ├── types.ts                    # Zod validation schemas
│   │   │   └── vision-provider.ts          # Vision model adapter
│   │   ├── supabase/
│   │   │   ├── admin.ts                    # Server-side service-role client
│   │   │   ├── client.ts                   # Browser Supabase client
│   │   │   └── db-store.ts                 # Unified database store & fallback
│   │   ├── image-quality.ts                # Image quality & blur heuristic
│   │   ├── interview-machine.ts            # Adaptive interview state machine
│   │   ├── patient-id.ts                   # Crockford Base32 ID generator
│   │   └── safety-engine.ts                # Versioned clinical safety rules
│   └── types/                              # Shared TypeScript types
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql          # 12 tables + indexes + RLS policies
│       └── 002_seed_data.sql               # Synthetic benchmark cases
├── tests/                                  # Vitest unit test suite
│   ├── evaluation-metrics.test.ts
│   ├── image-quality.test.ts
│   ├── interview-machine.test.ts
│   ├── patient-id.test.ts
│   └── safety-engine.test.ts
├── .env.example
├── next.config.mjs
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

---

## Quick Start & Commands

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Tests
```bash
npm test
```
*Executes all 27 unit tests verifying ID generation, safety rules, emergency overrides, image quality heuristics, interview state machine transitions, and evaluation metric mathematics.*

### 3. Production Build
```bash
npm run build
```
*Compiles all 23 application routes and API endpoints in TypeScript Strict Mode.*

### 4. Run Development Server
```bash
npm run dev
```
*Starts local server at [http://localhost:3000](http://localhost:3000).*

---

## Database Migrations & Supabase Setup

When connecting an external Supabase project:
1. Copy `.env.example` to `.env.local` and configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.
2. Apply migrations from `supabase/migrations/`:
   - `001_initial_schema.sql`: Creates `profiles`, `patients`, `patient_assignments`, `assessments`, `assessment_images`, `symptom_interviews`, `symptom_responses`, `assessment_findings`, `consent_records`, `audit_events`, `evaluation_cases`, `evaluation_runs`, and sets Row Level Security (RLS) policies.
   - `002_seed_data.sql`: Seeds synthetic clinical benchmark cases.

---

## AI Providers & Simulated Development Mode

- **Vision Analysis**: Configured via `VISION_PROVIDER_API_KEY` (e.g. Google Gemini 1.5 Flash).
- **Text Interview**: Configured via `TEXT_PROVIDER_API_KEY`.
- **Speech**: Runs via client-side Web Speech API in English and Hindi.
- **Simulated Development Mode**: If API credentials are not supplied, the platform executes in an explicitly labelled Simulated Dev Mode (`is_simulated: true`), ensuring complete functionality without breaking. Real provider errors are never silently masked.
