// DentaSense AI — Landing Page
// Clean, minimal, trustworthy healthcare SaaS experience.

import React from 'react';
import Link from 'next/link';
import {
  Camera,
  Mic,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  FileText,
  Lock,
  Globe2,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50/60 via-white to-slate-50 pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Trust Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 text-teal-800 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Investigational Oral Health Screening Platform</span>
            </div>

            {/* Hero Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Understand Your Oral Health. <br className="hidden sm:inline" />
              <span className="text-teal-600">Take the Next Step.</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Upload a clear photo of your mouth and converse with our clinical assistant in English or Hindi. Receive preliminary screening triage and dentist-ready summaries in minutes.
            </p>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/screening/new"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-base shadow-sm transition flex items-center justify-center gap-2 group"
              >
                <span>Start a Screening</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-xs transition text-center"
              >
                How It Works
              </a>
            </div>

            {/* Disclaimer Callout */}
            <div className="pt-2">
              <p className="text-xs text-slate-400">
                🔒 Private & secure • No audio stored by default • Not a replacement for a licensed dentist
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS / HOW IT WORKS */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">How It Works</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              A Structured, Multi-Layer Screening Workflow
            </h2>
            <p className="text-slate-600 text-sm">
              We never rely on an image alone. Clinical triage requires visible findings, interactive symptom questioning, and rigorous safety rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1: Photo Screening */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">1. Quality-Checked Photo</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Upload an oral photograph in JPEG, PNG, or WebP. Automated heuristics inspect lighting, contrast, and focus before analysis. Unusable images are politely rejected to prevent false reassurance.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-teal-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Blur, darkness, & dimension check</span>
              </div>
            </div>

            {/* Step 2: Voice & Text Interview */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">2. Adaptive Symptom Interview</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Converse naturally by voice or text in English or Hindi. Our 10-step adaptive questioning state machine extracts pain severity, swelling characteristics, and bleeding patterns without repetitive questions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-indigo-700 font-semibold flex items-center gap-1">
                <Globe2 className="w-4 h-4" />
                <span>Bilingual English & Hindi speech</span>
              </div>
            </div>

            {/* Step 3: Combined Triage */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">3. Deterministic Safety Triage</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Image findings and confirmed symptoms are evaluated by our versioned safety engine. Critical red flags (airway or swallowing difficulty) trigger immediate emergency alerts that a benign photo can never override.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-amber-700 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Rule-based clinical overrides</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PERMANENT PATIENT RECORDS SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">Record Management</span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Permanent Patient Identity & Screening History
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Every registered patient is assigned a permanent, collision-safe identifier (e.g. <code className="bg-white px-2 py-0.5 rounded border border-slate-200 font-mono text-teal-700 font-bold">DSA-7K4M9P2Q</code>) generated via Crockford Base32.
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Zero PII Exposure:</strong> No date of birth, name, or phone is encoded in public IDs. Non-sequential to avoid enumeration.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Chronological Audit Trail:</strong> Each screening receives a distinct Assessment ID. Historical records are never overwritten.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                  <span><strong>Dentist-Ready Export:</strong> Generate clean print-ready summaries formatted specifically for dental professionals.</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
                >
                  <span>Explore the Patient Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Record Card Mock */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Patient ID</span>
                  <p className="font-mono text-base font-bold text-slate-900">DSA-7K4M9P2Q</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                  Verified Identity
                </span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">Assessment ASM-3F8K9A</p>
                    <p className="text-slate-500 text-[11px]">Oct 25, 2026 • Quality: Good</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-medium">
                    Routine Dental
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">Assessment ASM-1A4C2E</p>
                    <p className="text-slate-500 text-[11px]">Oct 11, 2026 • Quality: Good</p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                    Self-Care Monitor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PHOTO-ONLY VS PHOTO-PLUS-VOICE EVALUATION HIGHLIGHT */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">Scientific Benchmark</span>
                <h2 className="text-3xl font-bold tracking-tight">
                  Why Photographs Alone Are Not Enough
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  A photo cannot convey deep fascial infection, difficulty swallowing, or pulpal necrosis. Our empirical evaluation framework compares photo-only against combined photo-plus-voice assessments across standardized clinical benchmarks.
                </p>
                <div className="pt-2">
                  <Link
                    href="/evaluation"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-sm transition"
                  >
                    <span>View Evaluation Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
                  <span className="text-xs text-slate-400">Photo-Only Approach</span>
                  <p className="text-2xl font-bold text-amber-400">Misses Symptoms</p>
                  <p className="text-xs text-slate-400">
                    Blind to throbbing pain, difficulty breathing, and internal tooth vitality.
                  </p>
                </div>
                <div className="bg-slate-800/80 p-5 rounded-2xl border border-teal-500/50 space-y-2">
                  <span className="text-xs text-teal-400 font-semibold">Photo + Voice Triage</span>
                  <p className="text-2xl font-bold text-emerald-400">High Sensitivity</p>
                  <p className="text-xs text-slate-300">
                    Captures emergency red flags immediately regardless of image angle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY & SECURITY SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">Trust & Security</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Designed for Clinical Privacy
            </h2>
            <p className="text-slate-600 text-sm">
              Health information requires uncompromising isolation, minimal retention, and user ownership.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Row Level Security</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Enforced in database migrations. Patients can only access their authorized records; dental professionals access only assigned patients.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Private Storage & Signed URLs</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Oral images are stored in private cloud buckets. Browser access uses short-lived signed URLs (15-60 min) that expire automatically.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No Raw Audio Stored</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                We do not record or retain raw microphone audio. Transcripts are converted locally or processed in memory with patient consent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LIMITATIONS & CLINICAL HONESTY SECTION */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Essential Screening Limitations
            </h2>
          </div>
          <div className="prose prose-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              DentaSense AI is an investigational screening tool designed to facilitate patient self-awareness and structured intake. It does NOT provide a final diagnosis and CANNOT replace an examination by a qualified dental professional.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
              <li>
                <strong>Interproximal Areas:</strong> Standard 2D photography cannot reveal cavities forming between adjacent teeth where dental floss passes.
              </li>
              <li>
                <strong>Bone Loss & Roots:</strong> Periodontal pocket depths and periapical infections require calibrated dental radiographs (X-rays) and periodontal probing.
              </li>
              <li>
                <strong>Pulp Vitality:</strong> A photograph cannot determine whether a tooth nerve is alive, inflamed, or necrotic.
              </li>
              <li>
                <strong>Soft Tissue Pathology:</strong> Oral mucosal lesions, ulcers, or persistent plaques require direct in-person palpation and biopsy if unresolved.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-teal-600 tracking-wider uppercase">Frequently Asked Questions</span>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Everything You Need to Know</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Can I use this service as a temporary guest?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. Guest mode allows you to complete a complete screening session. However, guest records are session-scoped and not linked to a verified identity. To save your screening history and receive a permanent Patient ID, simple registration is available.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">What happens if I report difficulty breathing or swallowing?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our safety engine immediately interrupts the screening and displays prominent emergency instructions. These symptoms can indicate serious deep fascial space infections (such as Ludwig&apos;s angina) requiring immediate emergency medical care.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">How does the Hindi voice assistant work?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The interview state machine natively supports both English and Hindi. When Hindi is selected, prompts, options, speech recognition, and speech synthesis run in Hindi (Devanagari script), allowing patients to describe symptoms in their preferred language.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="font-bold text-slate-900 text-sm">Can I delete my screening records?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. You have full ownership of your data. Patients can delete individual assessments or their entire patient profile at any time directly from the Settings or Patient Profile page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 bg-teal-700 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Check Your Oral Health?
          </h2>
          <p className="text-teal-100 text-base max-w-xl mx-auto">
            Takes less than 3 minutes. Free preliminary screening with immediate dentist-ready summary.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              href="/screening/new"
              className="px-8 py-3.5 rounded-xl bg-white text-teal-800 font-bold text-base hover:bg-teal-50 shadow-md transition"
            >
              Start Free Screening Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
