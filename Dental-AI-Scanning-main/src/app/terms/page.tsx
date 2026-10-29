// DentaSense AI — Terms of Use & Clinical Limitations
// Route: /terms

import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ShieldCheck, ArrowLeft, Info } from 'lucide-react';

export default function TermsPage() {
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
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Clinical & Legal Limitations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service & Clinical Limitations
        </h1>
        <p className="text-xs text-slate-500">
          Last revised: October 2026 • Terms Version 1.2
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
        {/* Prominent Medical Disclaimer Alert */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>NON-DIAGNOSTIC SCREENING DISCLAIMER</span>
          </div>
          <p className="text-xs leading-relaxed">
            DentaSense AI is an investigational screening and triage assistant. It is NOT a medical device, does NOT provide a final diagnosis, and CANNOT substitute for an in-person clinical examination by a licensed dentist.
          </p>
        </div>

        <section id="limitations" className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Physical Screening Limitations</h2>
          <p>
            You acknowledge and agree that 2D smartphone photographs have fundamental clinical limitations:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
            <li>
              <strong>Subsurface Pathology:</strong> A photograph cannot reveal pulp vitality, root resorption, periapical abscesses, or alveolar bone loss. Calibrated radiographs (bitewing or periapical X-rays) are clinically indispensable.
            </li>
            <li>
              <strong>Interproximal Caries:</strong> Tooth decay frequently begins in the contacts between teeth, which are invisible to surface photography.
            </li>
            <li>
              <strong>Soft Tissue Palpation:</strong> Physical inspection of oral mucosa, lymph nodes, and salivary glands requires direct clinical palpation.
            </li>
            <li>
              <strong>Tactile Examination:</strong> Differentiating harmless enamel staining from active cavitated decay requires tactile explorer examination and drying by a dental professional.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Emergency Guidance & Responsibility</h2>
          <p>
            If you report severe symptoms such as difficulty breathing, difficulty swallowing, or rapidly spreading facial swelling, the platform will prompt you to seek emergency care immediately. You are solely responsible for contacting local emergency medical services (such as 911 or 112) or proceeding to a hospital. DentaSense AI does not dispatch ambulances or emergency responders.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Non-Commercial Investigational Status</h2>
          <p>
            DentaSense AI makes no claims of formal regulatory clearance (such as FDA 510(k), CE mark, or CDSCO medical device license) without documented evidence. The software is provided for self-assessment, triage education, and workflow demonstration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. User Conduct</h2>
          <p>
            You agree to provide authentic photographs of your own oral condition and truthful descriptions of your symptoms. Do not upload photographs of third parties without their explicit legal consent.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, DentaSense AI and its contributors shall not be liable for any direct, indirect, incidental, or consequential damages arising from reliance on preliminary screening triage. Always seek qualified dental care.
          </p>
        </section>
      </div>
    </div>
  );
}
