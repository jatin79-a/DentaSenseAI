'use client';

// DentaSense AI — Patient Registration
// Route: /patients/new
// Generates collision-safe, permanent Patient ID (DSA-XXXXXXXX)

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';

export default function NewPatientPage() {
  const router = useRouter();
  const { setActivePatient } = useRole();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide a valid full name.');
      return;
    }

    if (!consentAcknowledged) {
      setError('Please acknowledge the consent terms to proceed.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          date_of_birth: dob || null,
          preferred_language: language,
          contact_email: email.trim() || null,
          contact_phone: phone.trim() || null,
          is_guest: false,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }

      const patient = await res.json();
      setActivePatient(patient);
      router.push(`/patients/${patient.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      setError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 sm:py-12 w-full space-y-6">
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
            <UserPlus className="w-4 h-4" />
            <span>Identity Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Register New Patient
          </h1>
          <p className="text-xs text-slate-500">
            A collision-safe permanent Patient ID (e.g., DSA-XXXXXXXX) will be generated.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Maya Patel"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Preferred Language
              </label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as 'en' | 'hi')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="patient@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 bg-white"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={consentAcknowledged}
                onChange={e => setConsentAcknowledged(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                I confirm that this registration is for authorized clinical screening. I understand that Patient IDs are non-sequential and non-PII encoded, and that data can be exported or purged upon request.
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Permanent ID...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Register & Create ID</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
