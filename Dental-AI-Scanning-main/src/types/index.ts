// DentaSense AI — Core TypeScript Types & Schemas

export type UserRole = 'patient' | 'dental_professional' | 'administrator';

export type UrgencyCategory =
  | 'emergency'            // Immediate hospital / urgent care (airway / facial cellulitis risk)
  | 'urgent_dental'       // See dentist within 24-48 hours (severe pain, active infection, broken tooth)
  | 'routine_dental'      // Schedule routine dental visit (cavities, mild gingivitis, calculus)
  | 'self_care_monitor'   // Safe home care with observation (minor aphthous ulcer, mild sensitivity)
  | 'insufficient_evidence'; // Unclear photo or incomplete symptoms; cannot rule out pathology

export type ImageQualityStatus = 'good' | 'borderline' | 'unusable';

export type SupportedLanguage = 'en' | 'hi';

export interface UserProfile {
  id: string; // matches auth_user_id
  role: UserRole;
  full_name: string;
  email: string;
  clinic_affiliation?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string; // internal UUID
  patient_code: string; // e.g. DSA-7K4M9P2Q
  auth_user_id?: string | null;
  full_name: string;
  date_of_birth?: string | null;
  preferred_language: SupportedLanguage;
  contact_email?: string | null;
  contact_phone?: string | null;
  created_at: string;
  updated_at: string;
  total_assessments?: number;
  latest_assessment_date?: string | null;
  is_guest?: boolean;
}

export interface ImageQualityMetrics {
  width: number;
  height: number;
  fileSizeBytes: number;
  mimeType: string;
  isDecodable: boolean;
  brightnessScore: number; // 0 to 1
  brightnessStatus: 'too_dark' | 'optimal' | 'too_bright';
  sharpnessScore: number; // 0 to 1
  sharpnessStatus: 'sharp' | 'acceptable' | 'blurry';
  overallStatus: ImageQualityStatus;
  rejectionReason?: string;
}

export interface InterviewQuestion {
  id: string;
  category: 'concern' | 'location' | 'duration' | 'pain' | 'swelling' | 'bleeding' | 'systemic' | 'emergency';
  textEn: string;
  textHi: string;
  questionType: 'text' | 'choice' | 'scale' | 'boolean';
  options?: { value: string; labelEn: string; labelHi: string }[];
  isEmergencyCheck?: boolean;
}

export interface StructuredSymptoms {
  chiefConcern: string;
  location?: string;
  duration?: string;
  painScore?: number; // 0-10
  hasSwelling: boolean;
  swellingLocation?: string;
  swellingSpreadingRapidly?: boolean;
  hasBleeding: boolean;
  bleedingSpontaneous?: boolean;
  hasFeverOrMalaise?: boolean;
  hasDifficultySwallowing?: boolean;
  hasDifficultyBreathing?: boolean;
  additionalNotes?: string;
  patientConfirmed: boolean;
}

export interface AssessmentFinding {
  id: string;
  label: string;
  anatomicalLocation?: string;
  visibleEvidence: string;
  confidenceBand: 'low' | 'moderate' | 'high';
  limitations: string;
  suggestedFollowUp: string;
}

export interface Assessment {
  id: string; // internal UUID
  assessment_code: string; // e.g. ASM-3F8K9A
  patient_id: string;
  created_by?: string | null;
  assessment_status: 'draft' | 'completed' | 'abandoned';
  image_quality_status: ImageQualityStatus;
  preliminary_urgency_category: UrgencyCategory;
  urgency_explanation: string;
  safety_rule_version: string;
  model_provider_version: string;
  image_url?: string;
  image_storage_path?: string;
  image_quality_metrics?: ImageQualityMetrics;
  structured_symptoms: StructuredSymptoms;
  visible_findings: AssessmentFinding[];
  limitations: string[];
  important_unknowns: string[];
  recommended_next_steps: string[];
  emergency_detected: boolean;
  emergency_guidance?: string;
  is_simulated: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsentRecord {
  id: string;
  patient_id?: string;
  assessment_id?: string;
  photo_processing_consent: boolean;
  voice_transcript_consent: boolean;
  external_ai_consent: boolean;
  data_storage_consent: boolean;
  granted_at: string;
  ip_address_hash?: string;
}

export interface EvaluationCase {
  id: string;
  case_id: string;
  title: string;
  image_url: string;
  image_description: string;
  symptoms: StructuredSymptoms;
  reference_gold_urgency: UrgencyCategory;
  reference_findings: string[];
  notes: string;
  is_synthetic: boolean;
}

export interface EvaluationMetricResult {
  accuracy: number;
  sensitivity: number;
  specificity: number;
  precision: number;
  f1Score: number;
  totalCases: number;
  truePositives: number;
  trueNegatives: number;
  falsePositives: number;
  falseNegatives: number;
  confusionMatrix: {
    labels: UrgencyCategory[];
    matrix: number[][]; // [trueLabelIndex][predLabelIndex]
  };
}

export interface CareProvider {
  id: string;
  name: string;
  specialty: string;
  address: string;
  city: string;
  phone: string;
  acceptsEmergency: boolean;
  distanceKm?: number;
  verified: boolean;
}
