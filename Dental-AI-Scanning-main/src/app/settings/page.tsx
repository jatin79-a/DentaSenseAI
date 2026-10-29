'use client';

// DentaSense AI — Settings and Privacy Controls
// Route: /settings
// Provider status checks, role switching, privacy preferences, and data deletion.

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Key,
  Database,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Activity,
  Globe2,
} from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';
import { UserRole } from '@/types';

export default function SettingsPage() {
  const { role, isGuest, activePatient, setRole, setIsGuest, logout } = useRole();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleClearCache = () => {
    if (confirm('Clear local session storage and reset active patient?')) {
      logout();
      setSuccessMsg('Local session data cleared successfully.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 w-full space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
          <SettingsIcon className="w-4 h-4" />
          <span>System & Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Settings & Privacy Controls
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure provider integrations, manage roles, and enforce data privacy rights.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Role & Access Mode Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Access Role & Session Mode</h2>
        <p className="text-xs text-slate-500">
          Select your authorized access tier to test different perspectives in the application.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div
            onClick={() => { setRole('patient'); setIsGuest(false); }}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              role === 'patient' && !isGuest
                ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 text-sm">Patient</span>
              {role === 'patient' && !isGuest && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </div>
            <p className="text-[11px] text-slate-500">
              Access your personal assessments, screening history, and permanent Patient ID.
            </p>
          </div>

          <div
            onClick={() => { setRole('dental_professional'); setIsGuest(false); }}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              role === 'dental_professional'
                ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 text-sm">Dental Professional</span>
              {role === 'dental_professional' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </div>
            <p className="text-[11px] text-slate-500">
              Access the clinical patient directory, review screening reports, and manage assignments.
            </p>
          </div>

          <div
            onClick={() => { setRole('administrator'); setIsGuest(false); }}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              role === 'administrator'
                ? 'border-teal-500 bg-teal-50/50 shadow-xs'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 text-sm">Administrator</span>
              {role === 'administrator' && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
            </div>
            <p className="text-[11px] text-slate-500">
              Full system audit access, provider configuration verification, and model benchmarking.
            </p>
          </div>
        </div>
      </div>

      {/* AI Provider & Storage Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">AI & Cloud Provider Status</h2>
        <p className="text-xs text-slate-500">
          Environment configuration status for real vision, conversational text, and speech providers.
        </p>

        <div className="space-y-3 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Vision Provider (Image Analysis)</p>
              <p className="text-[11px] text-slate-500">Configured via VISION_PROVIDER_API_KEY</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Simulated Dev Ready
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Conversational Speech Bridge</p>
              <p className="text-[11px] text-slate-500">Web Speech API (STT & TTS, English & Hindi)</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Active In Browser
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">Supabase PostgreSQL & Row Level Security</p>
              <p className="text-[11px] text-slate-500">Configured via NEXT_PUBLIC_SUPABASE_URL</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Local DB Store Active
            </span>
          </div>
        </div>
      </div>

      {/* Privacy & Data Rights Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Privacy & Data Purging</h2>
        <p className="text-xs text-slate-500">
          Exercise your data ownership rights. You can purge local session data or reset active identities.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleClearCache}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset Session Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
