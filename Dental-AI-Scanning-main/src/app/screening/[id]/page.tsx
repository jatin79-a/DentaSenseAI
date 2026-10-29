'use client';

// DentaSense AI — Assessment Results and Detail Page
// Route: /screening/[id]
// Displays complete triage, visible findings, patient symptoms, care pathway, and printable report.

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Clock,
  Printer,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Info,
  Calendar,
  Phone,
  MapPin,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Assessment, Patient, CareProvider } from '@/types';

const SAMPLE_CARE_PROVIDERS: CareProvider[] = [
  {
    id: 'prov-1',
    name: 'Metropolitan Dental Emergency Care',
    specialty: 'Oral Surgery & Acute Dental Trauma',
    address: '450 Healthcare Blvd, Suite 200',
    city: 'Central District',
    phone: '(555) 234-5678',
    acceptsEmergency: true,
    distanceKm: 2.4,
    verified: true,
  },
  {
    id: 'prov-2',
    name: 'Community Dental Health Center',
    specialty: 'Comprehensive General Dentistry',
    address: '128 Pine St, Floor 1',
    city: 'Westside',
    phone: '(555) 876-5432',
    acceptsEmergency: false,
    distanceKm: 4.1,
    verified: true,
  },
];

export default function AssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchAssessment() {
      try {
        const res = await fetch(`/api/assessments/${id}`);
        if (!res.ok) {
          throw new Error('Assessment not found');
        }
        const data = await res.json();
        setAssessment(data.assessment);
        setPatient(data.patient);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load assessment';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchAssessment();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to permanently delete this assessment record?')) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/assessments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push(patient ? `/patients/${patient.id}` : '/dashboard');
      } else {
        alert('Failed to delete assessment');
        setIsDeleting(false);
      }
    } catch {
      alert('Network error while deleting');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500 text-sm">
        Loading assessment results...
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-red-600 font-semibold">{error || 'Assessment not found'}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-teal-600 font-bold hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  // Visual urgency badge formatting
  const urgencyConfig = {
    emergency: {
      label: 'Emergency Medical Attention Required',
      bg: 'bg-red-500',
      text: 'text-white',
      border: 'border-red-600',
      icon: ShieldAlert,
    },
    urgent_dental: {
      label: 'Urgent Dental Care (Within 24-48 Hours)',
      bg: 'bg-amber-500',
      text: 'text-white',
      border: 'border-amber-600',
      icon: AlertTriangle,
    },
    routine_dental: {
      label: 'Routine Dental Examination Recommended',
      bg: 'bg-blue-600',
      text: 'text-white',
      border: 'border-blue-700',
      icon: Stethoscope,
    },
    self_care_monitor: {
      label: 'Self-Care & Observational Monitoring',
      bg: 'bg-emerald-600',
      text: 'text-white',
      border: 'border-emerald-700',
      icon: CheckCircle2,
    },
    insufficient_evidence: {
      label: 'Insufficient Evidence / Quality Limited',
      bg: 'bg-slate-600',
      text: 'text-white',
      border: 'border-slate-700',
      icon: Info,
    },
  }[assessment.preliminary_urgency_category];

  const UrgencyIcon = urgencyConfig.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 w-full space-y-8">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Link
          href={patient ? `/patients/${patient.id}` : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{patient ? `Back to ${patient.full_name}'s Profile` : 'Back to Dashboard'}</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-xl bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Simulated Development Mode Banner */}
      {assessment.is_simulated && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2 no-print">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Simulated Development Mode:</strong> This screening was processed using the fallback heuristic model because real AI credentials were not provided.
          </span>
        </div>
      )}

      {/* EMERGENCY BANNER (If Emergency Detected) */}
      {assessment.emergency_detected && (
        <div className="p-6 bg-red-600 text-white rounded-2xl shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 shrink-0 text-red-100" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">IMMEDIATE EMERGENCY CARE REQUIRED</h2>
              <p className="text-xs text-red-100">Airway or rapid cellulitis warning signs detected</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-red-50 leading-relaxed font-medium">
            {assessment.emergency_guidance ||
              'Please proceed immediately to the nearest Emergency Department or call local emergency services (911 or 112). Do not wait for a scheduled dental appointment.'}
          </p>
        </div>
      )}

      {/* Main Report Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Report Top Meta Bar */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold mb-1">
              <span>PRELIMINARY CLINICAL SCREENING REPORT</span>
              <span>•</span>
              <span className="font-mono">v{assessment.safety_rule_version}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Assessment Summary</h1>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-slate-300 font-mono space-y-1">
            <div>Assessment ID: <strong className="text-white">{assessment.assessment_code}</strong></div>
            <div>Patient ID: <strong className="text-white">{patient?.patient_code || 'DSA-GUEST'}</strong></div>
            <div className="text-[11px] text-slate-400">
              {new Date(assessment.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Urgency Level Banner */}
        <div className={`${urgencyConfig.bg} ${urgencyConfig.text} p-4 sm:px-8 flex items-center gap-3 font-semibold text-sm`}>
          <UrgencyIcon className="w-5 h-5 shrink-0" />
          <span>{urgencyConfig.label}</span>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Urgency Explanation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Rationale</h3>
            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {assessment.urgency_explanation}
            </p>
          </div>

          {/* Side by Side: Image & Symptoms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Oral Image & Quality */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Screening Photograph</h3>
              {assessment.image_url ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 max-h-64 flex items-center justify-center">
                  <img
                    src={assessment.image_url}
                    alt="Oral Screening"
                    className="max-h-64 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400">
                  No image attached
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Quality Status: <strong className="capitalize">{assessment.image_quality_status}</strong></span>
                {assessment.image_quality_metrics && (
                  <span>{assessment.image_quality_metrics.width} × {assessment.image_quality_metrics.height} px</span>
                )}
              </div>
            </div>

            {/* Right: Confirmed Symptoms */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed Symptoms</h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500">Chief Concern: </span>
                  <span className="font-semibold text-slate-900">{assessment.structured_symptoms.chiefConcern || 'Not reported'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Location: </span>
                  <span className="font-semibold text-slate-900">{assessment.structured_symptoms.location || 'General oral area'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Duration: </span>
                  <span className="font-semibold text-slate-900">{assessment.structured_symptoms.duration || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500">Pain Severity: </span>
                  <span className="font-semibold text-slate-900">
                    {assessment.structured_symptoms.painScore !== undefined
                      ? `${assessment.structured_symptoms.painScore} / 10`
                      : 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Soft Tissue Swelling: </span>
                  <span className="font-semibold text-slate-900">
                    {assessment.structured_symptoms.hasSwelling
                      ? `Yes (${assessment.structured_symptoms.swellingLocation || 'Reported'})`
                      : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Bleeding: </span>
                  <span className="font-semibold text-slate-900">
                    {assessment.structured_symptoms.hasBleeding ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preliminary Visible Findings */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Preliminary Visible Findings ({assessment.visible_findings.length})
            </h3>
            {assessment.visible_findings.length === 0 ? (
              <p className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                No gross structural pathology observed on visible tooth surfaces.
              </p>
            ) : (
              <div className="space-y-2.5">
                {assessment.visible_findings.map((f, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{f.label}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700 capitalize">
                        Confidence: {f.confidenceBand}
                      </span>
                    </div>
                    {f.anatomicalLocation && (
                      <p className="text-slate-600"><strong>Location:</strong> {f.anatomicalLocation}</p>
                    )}
                    <p className="text-slate-700"><strong>Visual Evidence:</strong> {f.visibleEvidence}</p>
                    <p className="text-slate-500 text-[11px]"><strong>Limitations:</strong> {f.limitations}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Next Steps */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recommended Next Steps</h3>
            <ul className="space-y-2">
              {assessment.recommended_next_steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Important Unknowns & Limitations */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2 text-xs text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <Info className="w-4 h-4 shrink-0" />
              <span>Important Limitations & Unknowns</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              {assessment.important_unknowns.map((u, i) => (
                <li key={i}>{u}</li>
              ))}
              {assessment.limitations.map((l, i) => (
                <li key={`lim-${i}`}>{l}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CARE PATHWAY & DENTAL SERVICES DIRECTORY */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 no-print">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Care Pathway & Local Providers</h2>
          <p className="text-xs text-slate-500">
            Authorized dental service directory for follow-up clinical examination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_CARE_PROVIDERS.map(prov => (
            <div key={prov.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">{prov.name}</span>
                {prov.acceptsEmergency && (
                  <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[10px]">
                    Emergency Walk-In
                  </span>
                )}
              </div>
              <p className="text-slate-600 font-medium">{prov.specialty}</p>
              <div className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{prov.address}, {prov.city} ({prov.distanceKm} km away)</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold pt-1">
                <Phone className="w-3.5 h-3.5" />
                <span>{prov.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
