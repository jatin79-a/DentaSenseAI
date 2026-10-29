'use client';

// DentaSense AI — Assessment History
// Route: /history
// Chronological screening records with urgency filtering and search.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  History as HistoryIcon,
  Search,
  Calendar,
  Clock,
  ArrowRight,
  Filter,
  PlusCircle,
} from 'lucide-react';
import { Assessment, UrgencyCategory } from '@/types';

export default function HistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessments() {
      try {
        const res = await fetch('/api/assessments');
        const data = await res.json();
        setAssessments(data.assessments || []);
      } catch {
        setAssessments([]);
      } finally {
        setLoading(false);
      }
    }
    loadAssessments();
  }, []);

  const filtered = assessments.filter(a => {
    const matchesSearch =
      a.assessment_code.toLowerCase().includes(search.toLowerCase()) ||
      a.urgency_explanation.toLowerCase().includes(search.toLowerCase()) ||
      a.structured_symptoms.chiefConcern?.toLowerCase().includes(search.toLowerCase());

    const matchesUrgency =
      urgencyFilter === 'all' || a.preliminary_urgency_category === urgencyFilter;

    return matchesSearch && matchesUrgency;
  });

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Audit Trail & Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Assessment History
          </h1>
          <p className="text-xs text-slate-500">
            Review past screenings, clinical triage outputs, and printable dental reports.
          </p>
        </div>

        <Link
          href="/screening/new"
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Screening</span>
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Assessment ID or symptoms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:inline" />
          <select
            value={urgencyFilter}
            onChange={e => setUrgencyFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 text-slate-700"
          >
            <option value="all">All Urgency Categories</option>
            <option value="emergency">Emergency Only</option>
            <option value="urgent_dental">Urgent Dental</option>
            <option value="routine_dental">Routine Dental</option>
            <option value="self_care_monitor">Self-Care Monitor</option>
            <option value="insufficient_evidence">Quality Limited</option>
          </select>
        </div>
      </div>

      {/* Assessment Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading history...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-sm font-semibold text-slate-700">No matching assessment records found</p>
          <p className="text-xs text-slate-400">
            {search || urgencyFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Complete your first screening to see it recorded here.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(asm => (
            <div
              key={asm.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-slate-900">{asm.assessment_code}</span>
                  {getUrgencyBadge(asm.preliminary_urgency_category)}
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {asm.urgency_explanation}
                </p>

                <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100">
                  <p><strong>Chief Concern:</strong> {asm.structured_symptoms.chiefConcern || 'Not reported'}</p>
                  <p><strong>Pain Score:</strong> {asm.structured_symptoms.painScore !== undefined ? `${asm.structured_symptoms.painScore}/10` : 'None'}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(asm.created_at).toLocaleDateString()}</span>
                </span>

                <Link
                  href={`/screening/${asm.id}`}
                  className="font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
