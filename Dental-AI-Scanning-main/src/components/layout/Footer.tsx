// DentaSense AI — Global Footer
// Features product links, clinical disclaimer, limitations, and accessibility statements.

import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, HeartHandshake, Info } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Vision */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                DentaSense <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-assisted dental screening combining image quality analysis, two-way conversational interviews, and deterministic clinical safety triage.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-layer Clinical Safety Engine</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link href="/screening/new" className="hover:text-white transition">Start a Screening</Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">Patient Dashboard</Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-white transition">Assessment History</Link>
              </li>
              <li>
                <Link href="/patients" className="hover:text-white transition">Patient Directory</Link>
              </li>
            </ul>
          </div>

          {/* Clinical & Evaluation */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Scientific Evaluation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/evaluation" className="hover:text-white transition">
                  Photo vs Photo+Voice Dashboard
                </Link>
              </li>
              <li>
                <Link href="/terms#limitations" className="hover:text-white transition">
                  Photographic Screening Limitations
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition">
                  Privacy Policy & Data Rights
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition">
                  Terms & Regulatory Notice
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Notice Box */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <Info className="w-4 h-4 shrink-0" />
              <span>Important Medical Disclaimer</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              DentaSense AI provides preliminary triage and educational screening. A normal photograph cannot rule out serious dental disease, interproximal caries, or pulpal necrosis. Always consult a licensed dentist for diagnosis and treatment.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} DentaSense AI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-400">Terms of Use</Link>
            <Link href="/settings" className="hover:text-slate-400">Data Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
