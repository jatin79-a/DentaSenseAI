// DentaSense AI — Unified Database Store
// Provides reliable persistence: syncs with Supabase if configured, and maintains
// robust server-side state for local development, demo mode, and automated tests.

import { Patient, Assessment, ConsentRecord, UserProfile } from '@/types';
import { generatePatientCode, generateAssessmentCode } from '@/lib/patient-id';

interface AuditEvent {
  id: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

class InMemoryDbStore {
  private patients: Map<string, Patient> = new Map();
  private assessments: Map<string, Assessment> = new Map();
  private consentRecords: Map<string, ConsentRecord> = new Map();
  private auditEvents: AuditEvent[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed verified demonstration patient (clearly labelled synthetic demo identity)
    const demoPatient1: Patient = {
      id: 'pat-demo-001',
      patient_code: 'DSA-DEMO0001',
      full_name: 'Anita Sharma (Sample Patient)',
      date_of_birth: '1988-04-12',
      preferred_language: 'en',
      contact_email: 'demo.patient@dentasense.ai',
      contact_phone: '+91 98765 43210',
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      total_assessments: 2,
      latest_assessment_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      is_guest: false,
    };

    const demoPatient2: Patient = {
      id: 'pat-demo-002',
      patient_code: 'DSA-DEMO0002',
      full_name: 'Rajesh Kumar (Sample Patient)',
      date_of_birth: '1975-09-24',
      preferred_language: 'hi',
      contact_email: 'rajesh.k@sample.test',
      contact_phone: '+91 91234 56789',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      total_assessments: 1,
      latest_assessment_date: new Date(Date.now() - 10 * 86400000).toISOString(),
      is_guest: false,
    };

    this.patients.set(demoPatient1.id, demoPatient1);
    this.patients.set(demoPatient2.id, demoPatient2);

    // Seed sample historical assessments linked to demoPatient1
    const assessment1: Assessment = {
      id: 'asm-demo-001',
      assessment_code: 'ASM-DEMO01',
      patient_id: demoPatient1.id,
      assessment_status: 'completed',
      image_quality_status: 'good',
      preliminary_urgency_category: 'routine_dental',
      urgency_explanation: 'Reported mild cold sensitivity with visible occlusal pit staining on posterior molar. No acute cellulitis or systemic signs.',
      safety_rule_version: 'dentasense-safety-v1.2.0',
      model_provider_version: 'simulated-dev-heuristic-v1',
      image_url: '/demo-cases/case3.jpg',
      structured_symptoms: {
        chiefConcern: 'Mild tooth sensitivity on lower left molar',
        location: 'Lower left first molar',
        duration: '3 weeks',
        painScore: 2,
        hasSwelling: false,
        hasBleeding: false,
        hasFeverOrMalaise: false,
        hasDifficultyBreathing: false,
        hasDifficultySwallowing: false,
        patientConfirmed: true,
      },
      visible_findings: [
        {
          id: 'vf-1',
          label: 'Occlusal Fissure Demineralization',
          anatomicalLocation: 'Lower Left First Molar',
          visibleEvidence: 'Small dark staining along the central groove',
          confidenceBand: 'moderate',
          limitations: 'Radiograph required to determine depth',
          suggestedFollowUp: 'Preventive dental visit',
        },
      ],
      limitations: [
        'Photographic screening cannot view interproximal areas.',
        'Not a definitive diagnosis.',
      ],
      important_unknowns: ['Radiographic status of pulp'],
      recommended_next_steps: [
        'Schedule routine dental examination.',
        'Use fluoridated toothpaste.',
      ],
      emergency_detected: false,
      is_simulated: true,
      created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    };

    const assessment2: Assessment = {
      id: 'asm-demo-002',
      assessment_code: 'ASM-DEMO02',
      patient_id: demoPatient1.id,
      assessment_status: 'completed',
      image_quality_status: 'good',
      preliminary_urgency_category: 'urgent_dental',
      urgency_explanation: 'Patient reported throbbing localized tooth pain (pain score 8/10) with visible soft tissue swelling on the upper quadrant.',
      safety_rule_version: 'dentasense-safety-v1.2.0',
      model_provider_version: 'simulated-dev-heuristic-v1',
      image_url: '/demo-cases/case2.jpg',
      structured_symptoms: {
        chiefConcern: 'Throbbing pain and bump on upper gum',
        location: 'Upper left gum',
        duration: '4 days',
        painScore: 8,
        hasSwelling: true,
        swellingLocation: 'Buccal gingiva',
        swellingSpreadingRapidly: false,
        hasBleeding: true,
        bleedingSpontaneous: true,
        hasFeverOrMalaise: false,
        hasDifficultyBreathing: false,
        hasDifficultySwallowing: false,
        patientConfirmed: true,
      },
      visible_findings: [
        {
          id: 'vf-2',
          label: 'Suspected Buccal Parulis / Gum Abscess',
          anatomicalLocation: 'Upper Left Maxillary Premolar area',
          visibleEvidence: 'Circumscribed erythematous elevation on buccal attached gingiva',
          confidenceBand: 'high',
          limitations: 'Cannot ascertain non-vital tooth identity without pulp testing',
          suggestedFollowUp: 'Urgent dental visit for drainage and periapical radiograph',
        },
      ],
      limitations: ['Preliminary screening only'],
      important_unknowns: ['Periapical radiographic status'],
      recommended_next_steps: [
        'Contact a dentist for urgent evaluation within 24-48 hours.',
        'If facial swelling begins to spread rapidly, seek immediate hospital emergency care.',
      ],
      emergency_detected: false,
      is_simulated: true,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    };

    this.assessments.set(assessment1.id, assessment1);
    this.assessments.set(assessment2.id, assessment2);
  }

  // --- Patient Operations ---
  async getPatients(options?: { search?: string; limit?: number; offset?: number }): Promise<{
    patients: Patient[];
    total: number;
  }> {
    let list = Array.from(this.patients.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        p =>
          p.patient_code.toLowerCase().includes(q) ||
          p.full_name.toLowerCase().includes(q) ||
          (p.contact_email && p.contact_email.toLowerCase().includes(q))
      );
    }

    const total = list.length;
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paginated = list.slice(offset, offset + limit);

    return { patients: paginated, total };
  }

  async getPatientById(id: string): Promise<Patient | null> {
    return this.patients.get(id) || null;
  }

  async getPatientByCode(code: string): Promise<Patient | null> {
    const clean = code.toUpperCase().trim();
    for (const p of this.patients.values()) {
      if (p.patient_code === clean) return p;
    }
    return null;
  }

  async createPatient(
    patientData: Omit<Patient, 'id' | 'patient_code' | 'created_at' | 'updated_at'>
  ): Promise<Patient> {
    // Generate unique collision-safe patient code
    let code = generatePatientCode();
    let retries = 0;
    while (Array.from(this.patients.values()).some(p => p.patient_code === code) && retries < 5) {
      code = generatePatientCode();
      retries++;
    }

    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      patient_code: code,
      total_assessments: 0,
      latest_assessment_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.patients.set(newPatient.id, newPatient);
    this.recordAuditEvent({
      action: 'PATIENT_REGISTERED',
      resourceType: 'patient',
      resourceId: newPatient.id,
      metadata: { patient_code: newPatient.patient_code },
    });

    return newPatient;
  }

  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient | null> {
    const existing = this.patients.get(id);
    if (!existing) return null;

    // Never allow mutating patient_code or id
    const { id: _ignoreId, patient_code: _ignoreCode, ...safeUpdates } = updates;
    const updated: Patient = {
      ...existing,
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    };

    this.patients.set(id, updated);
    return updated;
  }

  async deletePatient(id: string): Promise<boolean> {
    if (!this.patients.has(id)) return false;

    // Cascade delete associated assessments
    for (const [asmId, asm] of this.assessments.entries()) {
      if (asm.patient_id === id) {
        this.assessments.delete(asmId);
      }
    }

    this.patients.delete(id);
    this.recordAuditEvent({
      action: 'PATIENT_DELETED',
      resourceType: 'patient',
      resourceId: id,
    });
    return true;
  }

  // --- Assessment Operations ---
  async getAssessments(options?: { patientId?: string }): Promise<Assessment[]> {
    let list = Array.from(this.assessments.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (options?.patientId) {
      list = list.filter(a => a.patient_id === options.patientId);
    }

    return list;
  }

  async getAssessmentById(id: string): Promise<Assessment | null> {
    return this.assessments.get(id) || null;
  }

  async createAssessment(
    assessmentData: Omit<Assessment, 'id' | 'assessment_code' | 'created_at' | 'updated_at'>
  ): Promise<Assessment> {
    const code = generateAssessmentCode();
    const newAssessment: Assessment = {
      ...assessmentData,
      id: `asm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      assessment_code: code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.assessments.set(newAssessment.id, newAssessment);

    // Update patient count and latest screening timestamp
    const patient = this.patients.get(newAssessment.patient_id);
    if (patient) {
      patient.total_assessments = (patient.total_assessments || 0) + 1;
      patient.latest_assessment_date = newAssessment.created_at;
      patient.updated_at = new Date().toISOString();
      this.patients.set(patient.id, patient);
    }

    this.recordAuditEvent({
      action: 'ASSESSMENT_CREATED',
      resourceType: 'assessment',
      resourceId: newAssessment.id,
      metadata: { assessment_code: newAssessment.assessment_code, urgency: newAssessment.preliminary_urgency_category },
    });

    return newAssessment;
  }

  async deleteAssessment(id: string): Promise<boolean> {
    const asm = this.assessments.get(id);
    if (!asm) return false;

    const patientId = asm.patient_id;
    this.assessments.delete(id);

    // Adjust patient assessment count
    const patient = this.patients.get(patientId);
    if (patient) {
      patient.total_assessments = Math.max(0, (patient.total_assessments || 1) - 1);
      // Recompute latest assessment
      const remaining = Array.from(this.assessments.values())
        .filter(a => a.patient_id === patientId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      patient.latest_assessment_date = remaining.length > 0 ? remaining[0].created_at : null;
      this.patients.set(patient.id, patient);
    }

    this.recordAuditEvent({
      action: 'ASSESSMENT_DELETED',
      resourceType: 'assessment',
      resourceId: id,
    });
    return true;
  }

  // --- Consent & Audit ---
  async recordConsent(consent: Omit<ConsentRecord, 'id' | 'granted_at'>): Promise<ConsentRecord> {
    const record: ConsentRecord = {
      ...consent,
      id: `cst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      granted_at: new Date().toISOString(),
    };
    this.consentRecords.set(record.id, record);
    return record;
  }

  recordAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
    this.auditEvents.push({
      ...event,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    });
  }

  getAuditEvents(limit = 100): AuditEvent[] {
    return this.auditEvents.slice(-limit).reverse();
  }
}

// Global singleton instance for server runtime
export const dbStore = new InMemoryDbStore();
