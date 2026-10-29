'use client';

// DentaSense AI — Authorized Patient Directory
// Route: /patients
// Accessible to authorized dental professionals and administrators.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Search,
  UserPlus,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Activity,
  Globe2,
} from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';
import { Patient } from '@/types';

export default function PatientsDirectoryPage() {
  const { role, setRole, setActivePatient } = useRole();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async (query = '') => {
    setLoading(true);
    try {
      const url = query ? `/api/patients?q=${encodeURIComponent(query)}` : '/api/patients';
      const res = await fetch(url);
      const data = await res.json();
      setPatients(data.patients || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch patients';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(search);
  };

  // Authorization check banner if regular patient
  if (role === 'patient') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Restricted</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          The patient directory contains clinical identities and is strictly restricted to authorized dental professionals and administrators.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => setRole('dental_professional')}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition"
          >
            Switch to Dentist Role (Demo)
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-6">
      {/* Directory Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
            <Stethoscope className="w-4 h-4" />
            <span>Authorized Clinical Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Patient Directory
          </h1>
          <p className="text-xs text-slate-500">
            Search authorized patient records by permanent Patient ID or patient name.
          </p>
        </div>

        <Link
          href="/patients/new"
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center gap-2 shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Patient</span>
        </Link>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Patient ID (e.g., DSA-DEMO0001) or name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition"
        >
          Search
        </button>
      </form>

      {/* Patients Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading patient records...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">No patients found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No matching records found. Register a new patient to generate their unique ID.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3.5">Patient ID</th>
                  <th className="px-6 py-3.5">Full Name</th>
                  <th className="px-6 py-3.5">Language</th>
                  <th className="px-6 py-3.5">Registered</th>
                  <th className="px-6 py-3.5">Total Screenings</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {patients.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">
                      {p.patient_code}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {p.full_name}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Globe2 className="w-3.5 h-3.5" />
                        {p.preferred_language === 'hi' ? 'Hindi' : 'English'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 font-semibold text-slate-800">
                        {p.total_assessments || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/patients/${p.id}`}
                        onClick={() => setActivePatient(p)}
                        className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700"
                      >
                        <span>View Profile</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
