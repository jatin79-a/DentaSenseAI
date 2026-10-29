'use client';

// DentaSense AI — Login Page
// Route: /login
// Supabase Authentication with demo / guest bypass option.

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setIsGuest, setActivePatient } = useRole();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Demonstration authentication handler
    setTimeout(() => {
      setLoading(false);
      // Auto-assign sample patient or admin based on email
      if (email.includes('dentist') || email.includes('dr')) {
        setRole('dental_professional');
      } else if (email.includes('admin')) {
        setRole('administrator');
      } else {
        setRole('patient');
      }
      setIsGuest(false);
      router.push('/dashboard');
    }, 400);
  };

  const handleDemoGuest = () => {
    setIsGuest(true);
    setRole('patient');
    router.push('/screening/new');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mx-auto shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to DentaSense</h1>
          <p className="text-xs text-slate-500">Access your verified patient records and screening reports.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs sm:text-sm">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center space-y-4">
          <p className="text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-teal-600 font-semibold hover:underline">
              Create account
            </Link>
          </p>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Or Try Demo
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            onClick={handleDemoGuest}
            className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Continue as Temporary Guest
          </button>
        </div>
      </div>
    </div>
  );
}
