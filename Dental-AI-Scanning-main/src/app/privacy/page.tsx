// DentaSense AI — Privacy Policy & Health Information Protections
// Route: /privacy

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Trash2, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 w-full space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Health Information</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Data Rights
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: October 2026 • Policy Version 1.2
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Core Privacy Philosophy</h2>
          <p>
            DentaSense AI treats all oral photographs, patient symptom descriptions, interview transcripts, and identifiers as sensitive health-related information. We practice data minimization: we collect only what is strictly required to deliver screening triage.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. No Raw Audio Retention</h2>
          <p>
            During voice symptom interviews, your spoken responses are converted to text in real-time using browser-native speech recognition or ephemeral memory processing. We do NOT record, stream, or retain raw microphone audio files. Transcripts are converted directly into structured symptom codes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Private Storage & Short-Lived Signed URLs</h2>
          <p>
            Photographs uploaded for dental screening are stored in private cloud storage buckets protected by database-level Row Level Security (RLS). When viewing an image on your results page, a cryptographically signed, short-lived URL (15 to 60 minutes) is generated on demand. Images are never accessible via public URLs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Processing by External AI Providers</h2>
          <p>
            When real cloud AI models are configured, de-identified photographs and symptom prompts are transmitted over encrypted TLS connections to our designated AI providers solely for inference. External providers are bound by strict non-training agreements where applicable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Right to Erasure & Data Export</h2>
          <p>
            You have total ownership over your screening records. At any time, you may:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Download a complete machine-readable JSON archive of your profile and assessment history.</li>
            <li>Permanently purge individual screening assessments.</li>
            <li>Delete your entire patient identity and associated images via the Settings or Profile page.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">6. Compliance Notice</h2>
          <p className="text-slate-500 italic">
            In compliance with healthcare communication standards, DentaSense AI does not make unsupported legal claims of HIPAA or GDPR certification without formal institutional certification. Our security engineering follows strict access controls, tenant isolation, and audit logging.
          </p>
        </section>
      </div>
    </div>
  );
}
