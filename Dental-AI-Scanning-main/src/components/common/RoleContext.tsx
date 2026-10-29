'use client';

// DentaSense AI — Role and Session Context
// Manages simulated/real user roles (Patient, Dental Professional, Administrator, Guest)

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, Patient } from '@/types';

interface RoleContextType {
  role: UserRole;
  isGuest: boolean;
  activePatient: Patient | null;
  setRole: (role: UserRole) => void;
  setIsGuest: (guest: boolean) => void;
  setActivePatient: (patient: Patient | null) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>('patient');
  const [isGuest, setIsGuestState] = useState<boolean>(false);
  const [activePatient, setActivePatientState] = useState<Patient | null>(null);

  useEffect(() => {
    // Load from localStorage if present
    try {
      const savedRole = localStorage.getItem('dentasense_role') as UserRole;
      if (savedRole) setRoleState(savedRole);

      const savedGuest = localStorage.getItem('dentasense_guest');
      if (savedGuest) setIsGuestState(savedGuest === 'true');

      const savedPat = localStorage.getItem('dentasense_active_patient');
      if (savedPat) setActivePatientState(JSON.parse(savedPat));
      else {
        // Default to demo patient 1 for immediate smooth interaction
        setActivePatientState({
          id: 'pat-demo-001',
          patient_code: 'DSA-DEMO0001',
          full_name: 'Anita Sharma (Sample Patient)',
          date_of_birth: '1988-04-12',
          preferred_language: 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_assessments: 2,
        });
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    try {
      localStorage.setItem('dentasense_role', newRole);
    } catch {}
  };

  const setIsGuest = (guest: boolean) => {
    setIsGuestState(guest);
    try {
      localStorage.setItem('dentasense_guest', String(guest));
    } catch {}
  };

  const setActivePatient = (patient: Patient | null) => {
    setActivePatientState(patient);
    try {
      if (patient) {
        localStorage.setItem('dentasense_active_patient', JSON.stringify(patient));
      } else {
        localStorage.removeItem('dentasense_active_patient');
      }
    } catch {}
  };

  const logout = () => {
    setRoleState('patient');
    setIsGuestState(false);
    setActivePatientState(null);
    try {
      localStorage.removeItem('dentasense_role');
      localStorage.removeItem('dentasense_guest');
      localStorage.removeItem('dentasense_active_patient');
    } catch {}
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        isGuest,
        activePatient,
        setRole,
        setIsGuest,
        setActivePatient,
        logout,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
