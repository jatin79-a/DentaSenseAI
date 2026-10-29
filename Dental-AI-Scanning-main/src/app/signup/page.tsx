'use client';

// DentaSense AI — Registration Page
// Route: /signup
// Patient & Professional account signup with consent capture.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Lock, Mail, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';
import { UserRole } from '@/types';

export default function SignupPage() {
  const router = useRouter();
  const { setRole, setIsGuest, setActivePatient } = useRole();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<UserRole>('patient');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      alert('Please agree to the privacy policy and clinical terms to register.');
      return;
    }

    setLoading(true);

    try {
      // Register in backend store
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          contact_email: email.trim(),
          preferred_language: 'en',
          is_guest: false,
        }),
      });

      const newPat = await res.json();
      setActivePatient(newPat);
      setRole(accountType);
      setIsGuest(false);
      router.push('/dashboard');
    } catch {
      setRole(accountType);
      setIsGuest(false);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-xs text-slate-500">
            Get your permanent Patient ID and track screening history over time.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Dr. Maya Patel or Maya Patel"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-xs sm:text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-xs sm:text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-xs sm:text-sm bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account Role</label>
            <select
              value={accountType}
              onChange={e => setAccountType(e.target.value as UserRole)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-xs sm:text-sm bg-white"
            >
              <option value="patient">Patient (Individual)</option>
              <option value="dental_professional">Authorized Dental Professional (Dentist/Hygienist)</option>
            </select>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                I agree to the{' '}
                <Link href="/terms" className="text-teal-600 underline">
                  Terms & Clinical Limitations
                </Link>{' '}
                and understand that screenings are preliminary and non-diagnostic.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-teal-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
