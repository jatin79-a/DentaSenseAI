'use client';

// DentaSense AI — Patient Profile & Complete Assessment History
// Route: /patients/[id]
// Displays permanent Patient ID, chronological screening timeline, data export, and deletion.

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Calendar,
  Globe2,
  PlusCircle,
  Clock,
  ArrowRight,
  Download,
  Trash2,
  Activity,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';
import { Patient, Assessment, UrgencyCategory } from '@/types';

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { setActivePatient } = useRole();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchPatientData() {
      try {
        const res = await fetch(`/api/patients/${id}`);
        if (!res.ok) throw new Error('Patient not found');
        const data = await res.json();
        setPatient(data.patient);
        setAssessments(data.assessments || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load profile';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchPatientData();
  }, [id]);

  const handleExportJson = () => {
    if (!patient) return;
    const exportData = {
      patient,
      assessments,
      exportedAt: new Date().toISOString(),
      disclaimer: 'DentaSense AI preliminary screening export.',
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-records-${patient.patient_code}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeletePatient = async () => {
    if (!confirm('Are you sure you want to permanently delete this patient record and all associated assessments? This cannot be undone.')) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/patients');
      } else {
        alert('Failed to delete patient');
        setIsDeleting(false);
      }
    } catch {
      alert('Network error while deleting');
      setIsDeleting(false);
    }
  };

  const getUrgencyBadge = (cat: UrgencyCategory) => {
    const config = {
      emergency: { label: 'Emergency', bg: 'bg-red-100 text-red-800' },
      urgent_dental: { label: 'Urgent Dental', bg: 'bg-amber-100 text-amber-800' },
      routine_dental: { label: 'Routine Dental', bg: 'bg-blue-100 text-blue-800' },
      self_care_monitor: { label: 'Self-Care Monitor', bg: 'bg-emerald-100 text-emerald-800' },
      insufficient_evidence: { label: 'Quality Limited', bg: 'bg-slate-100 text-slate-800' },
    }[cat];

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading patient profile...
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-red-600 font-semibold">{error || 'Patient not found'}</p>
        <Link href="/patients" className="inline-flex items-center gap-1.5 text-xs text-teal-600 font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 sm:py-12 w-full space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export Data (JSON)</span>
          </button>

          <button
            onClick={handleDeletePatient}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-xl bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Patient</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xl border border-teal-200">
              {patient.full_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{patient.full_name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Verified Identity
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Patient ID: {patient.patient_code}</p>
            </div>
          </div>

          <Link
            href="/screening/new"
            onClick={() => setActivePatient(patient)}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Start Screening For This Patient</span>
          </Link>
        </div>

        {/* Quick Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Registered Date</span>
            <span className="font-semibold text-slate-800">
              {new Date(patient.created_at).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Preferred Language</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <Globe2 className="w-3.5 h-3.5 text-slate-500" />
              {patient.preferred_language === 'hi' ? 'Hindi (हिंदी)' : 'English'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Total Assessments</span>
            <span className="font-semibold text-slate-800">
              {assessments.length} screening{assessments.length === 1 ? '' : 's'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Latest Screening</span>
            <span className="font-semibold text-slate-800">
              {assessments.length > 0
                ? new Date(assessments[0].created_at).toLocaleDateString()
                : 'None'}
            </span>
          </div>
        </div>
      </div>

      {/* Complete Historical Assessments Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          Screening History & Timeline ({assessments.length})
        </h2>

        {assessments.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No screening assessments recorded for this patient yet.
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map(asm => (
              <div
                key={asm.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900">{asm.assessment_code}</span>
                    {getUrgencyBadge(asm.preliminary_urgency_category)}
                    {asm.is_simulated && (
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                        Simulated Model
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(asm.created_at).toLocaleString()}</span>
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {asm.urgency_explanation}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                  <div>
                    <span className="font-semibold text-slate-800">Reported Concern: </span>
                    <span>{asm.structured_symptoms.chiefConcern || 'General oral check'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Pain Level: </span>
                    <span>{asm.structured_symptoms.painScore !== undefined ? `${asm.structured_symptoms.painScore}/10` : 'None'}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/screening/${asm.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    <span>View Complete Report</span>
                    <ArrowRight className="w-4 h-4" />
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
