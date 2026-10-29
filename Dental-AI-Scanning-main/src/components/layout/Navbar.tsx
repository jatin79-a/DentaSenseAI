'use client';

// DentaSense AI — Global Navigation Bar
// Accessible, responsive, role-aware navigation with quick demo switcher.

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  User,
  ShieldAlert,
  Menu,
  X,
  Stethoscope,
  BarChart3,
  History as HistoryIcon,
  PlusCircle,
  Settings,
  Lock,
} from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';
import { UserRole } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const { role, isGuest, activePatient, setRole, setIsGuest } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity, roles: ['patient', 'dental_professional', 'administrator'] },
    { href: '/screening/new', label: 'New Screening', icon: PlusCircle, roles: ['patient', 'dental_professional', 'administrator'] },
    { href: '/patients', label: 'Patients', icon: Stethoscope, roles: ['dental_professional', 'administrator'] },
    { href: '/history', label: 'History', icon: HistoryIcon, roles: ['patient', 'dental_professional', 'administrator'] },
    { href: '/evaluation', label: 'Evaluation', icon: BarChart3, roles: ['patient', 'dental_professional', 'administrator'] },
    { href: '/settings', label: 'Settings', icon: Settings, roles: ['patient', 'dental_professional', 'administrator'] },
  ];

  const visibleLinks = navLinks.filter(link => link.roles.includes(role));

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Warning Banner for Guest Mode */}
      {isGuest && (
        <div className="bg-amber-500 text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
          <span>⚠️ Temporary Guest Mode: Screenings are session-scoped and not linked to a verified identity.</span>
          <Link href="/signup" className="underline font-bold hover:text-amber-100">
            Register to save records
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition">
              <Activity className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-1.5">
                DentaSense <span className="text-teal-600">AI</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Oral Health Screening
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {visibleLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Role Selector & Active Patient Badge */}
          <div className="hidden lg:flex items-center gap-3">
            {activePatient && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="font-mono font-semibold">{activePatient.patient_code}</span>
              </div>
            )}

            {/* Quick Role Switcher for Evaluators / Demonstration */}
            <div className="flex items-center gap-1 text-xs bg-slate-50 p-1 rounded-lg border border-slate-200">
              <span className="text-slate-400 pl-1">Role:</span>
              {(['patient', 'dental_professional', 'administrator'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setIsGuest(false);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    role === r && !isGuest
                      ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {r === 'patient' ? 'Patient' : r === 'dental_professional' ? 'Dentist' : 'Admin'}
                </button>
              ))}
              <button
                onClick={() => setIsGuest(true)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                  isGuest
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Guest
              </button>
            </div>

            <Link
              href="/screening/new"
              className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Screen Now</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {visibleLinks.map(link => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-base font-medium ${
                  isActive ? 'bg-teal-50 text-teal-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-500">Switch Role:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { setRole('patient'); setIsGuest(false); setMobileMenuOpen(false); }}
                className={`p-2 rounded border text-center ${role === 'patient' && !isGuest ? 'bg-teal-50 border-teal-300 font-bold text-teal-800' : 'border-slate-200'}`}
              >
                Patient
              </button>
              <button
                onClick={() => { setRole('dental_professional'); setIsGuest(false); setMobileMenuOpen(false); }}
                className={`p-2 rounded border text-center ${role === 'dental_professional' ? 'bg-teal-50 border-teal-300 font-bold text-teal-800' : 'border-slate-200'}`}
              >
                Dentist
              </button>
              <button
                onClick={() => { setRole('administrator'); setIsGuest(false); setMobileMenuOpen(false); }}
                className={`p-2 rounded border text-center ${role === 'administrator' ? 'bg-teal-50 border-teal-300 font-bold text-teal-800' : 'border-slate-200'}`}
              >
                Admin
              </button>
              <button
                onClick={() => { setIsGuest(true); setMobileMenuOpen(false); }}
                className={`p-2 rounded border text-center ${isGuest ? 'bg-amber-50 border-amber-300 font-bold text-amber-800' : 'border-slate-200'}`}
              >
                Guest Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
