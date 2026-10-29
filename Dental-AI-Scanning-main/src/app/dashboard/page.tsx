'use client';

// DentaSense AI — Patient Dashboard
// Route: /dashboard
// Shows active patient identity, recent assessments, quick start, and screening history.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  Info,
  User,
  ExternalLink,
} from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';
import { Assessment, UrgencyCategory } from '@/types';

export default function DashboardPage() {
  const { activePatient, role, isGuest } = useRole();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const url = activePatient ? `/api/assessments?patientId=${activePatient.id}` : '/api/assessments';
        const res = await fetch(url);
        const data = await res.json();
        setAssessments(data.assessments || []);
      } catch {
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activePatient]);

  const getUrgencyBadge = (cat: UrgencyCategory) => {
    const config = {
      emergency: { label: 'Emergency', bg: 'bg-red-100 text-red-800 border-red-200' },
      urgent_dental: { label: 'Urgent Dental', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
      routine_dental: { label: 'Routine Dental', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
      self_care_monitor: { label: 'Self-Care Monitor', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      insufficient_evidence: { label: 'Quality Limited', bg: 'bg-slate-100 text-slate-800 border-slate-200' },
    }[cat];

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Welcome & Patient ID Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Patient Overview</span>
            {isGuest && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-bold">
                Guest Mode
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {activePatient?.full_name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Track oral health screenings, review preliminary clinical reports, or start a new assessment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {activePatient && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <span className="text-[11px] text-slate-500 font-medium block">Permanent Patient ID</span>
              <span className="font-mono text-sm font-bold text-slate-900">{activePatient.patient_code}</span>
            </div>
          )}

          <Link
            href="/screening/new"
            className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-xs transition flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start New Screening</span>
          </Link>
        </div>
      </div>

      {/* Role specific notification banner for dentists / admins */}
      {(role === 'dental_professional' || role === 'administrator') && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              <strong>Professional Workspace:</strong> You are logged in as {role === 'dental_professional' ? 'Authorized Dental Professional' : 'System Administrator'}.
            </span>
          </div>
          <Link href="/patients" className="font-bold underline hover:text-teal-950">
            Open Patient Directory →
          </Link>
        </div>
      )}

      {/* Recent Screenings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent Screenings</h2>
          <Link href="/history" className="text-xs font-semibold text-teal-600 hover:text-teal-700">
            View Complete History →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
            Loading recent screenings...
          </div>
        ) : assessments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Screenings Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven&apos;t conducted any oral health assessments yet. Complete a 3-minute screening to generate your first preliminary report.
            </p>
            <Link
              href="/screening/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Begin Your First Screening</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.slice(0, 4).map(asm => (
              <div
                key={asm.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">{asm.assessment_code}</span>
                    {getUrgencyBadge(asm.preliminary_urgency_category)}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {asm.urgency_explanation}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(asm.created_at).toLocaleDateString()}</span>
                  </span>

                  <Link
                    href={`/screening/${asm.id}`}
                    className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
