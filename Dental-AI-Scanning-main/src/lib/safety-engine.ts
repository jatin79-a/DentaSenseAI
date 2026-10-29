// DentaSense AI — Deterministic Versioned Safety Engine
// Version: dentasense-safety-v1.2.0
// Non-negotiable medical principle: Low-risk visual evidence CANNOT override red-flag emergency symptoms.

import {
  StructuredSymptoms,
  AssessmentFinding,
  ImageQualityStatus,
  UrgencyCategory,
} from '@/types';

export const SAFETY_RULE_VERSION = 'dentasense-safety-v1.2.0';

export interface TriageResult {
  urgency: UrgencyCategory;
  isEmergency: boolean;
  emergencyGuidance?: string;
  supportingReasons: string[];
  importantUnknowns: string[];
  limitations: string[];
  recommendedNextSteps: string[];
  safetyRuleVersion: string;
}

/**
 * Checks for clinical red flags that require immediate emergency intervention.
 * Emergency symptoms:
 * 1. Difficulty breathing (stridor, airway compromise from Ludwig's angina)
 * 2. Difficulty swallowing (inability to manage secretions, parapharyngeal space spread)
 * 3. Rapidly spreading swelling involving the floor of the mouth, face, or neck
 */
export function checkEmergencyRedFlags(symptoms: Partial<StructuredSymptoms>): {
  hasEmergency: boolean;
  reasons: string[];
  guidance: string;
} {
  const reasons: string[] = [];

  if (symptoms.hasDifficultyBreathing) {
    reasons.push('Reported difficulty breathing, which indicates potential airway compromise.');
  }

  if (symptoms.hasDifficultySwallowing) {
    reasons.push('Reported difficulty swallowing, which may indicate deep fascial space extension.');
  }

  if (symptoms.swellingSpreadingRapidly) {
    reasons.push('Rapidly spreading facial or submandibular swelling, which is an acute infection warning.');
  }

  const hasEmergency = reasons.length > 0;
  const guidance = hasEmergency
    ? 'SEEK EMERGENCY MEDICAL ATTENTION IMMEDIATELY. Call emergency services (e.g., 911, 112, or local emergency number) or proceed immediately to the nearest hospital Emergency Department. Do not drive yourself if you are feeling faint or breathless.'
    : '';

  return { hasEmergency, reasons, guidance };
}

/**
 * Evaluates combined symptoms, image findings, and image quality deterministically.
 */
export function evaluateSafetyAndUrgency(
  symptoms: StructuredSymptoms,
  findings: AssessmentFinding[],
  imageQuality: ImageQualityStatus
): TriageResult {
  const supportingReasons: string[] = [];
  const importantUnknowns: string[] = [];
  const limitations: string[] = [];
  const recommendedNextSteps: string[] = [];

  // General photographic screening limitations
  limitations.push('Photographic screening cannot view interproximal (between teeth) areas or subgingival calculus.');
  limitations.push('A photograph cannot assess tooth vitality, internal root pathology, or bone loss without dental radiographs (X-rays).');
  limitations.push('Preliminary AI analysis does not constitute a definitive dental diagnosis.');

  // STEP 1: Emergency red-flag evaluation (HIGHEST PRECEDENCE - IMMUTABLE)
  const redFlags = checkEmergencyRedFlags(symptoms);
  if (redFlags.hasEmergency) {
    return {
      urgency: 'emergency',
      isEmergency: true,
      emergencyGuidance: redFlags.guidance,
      supportingReasons: redFlags.reasons,
      importantUnknowns: [
        'Airway patency status under physical examination',
        'Systemic temperature and vital signs',
        'Extension into submandibular or retropharyngeal spaces',
      ],
      limitations,
      recommendedNextSteps: [
        'Call emergency medical services immediately or report to the nearest hospital Emergency Department.',
        'Do not wait for a scheduled dental appointment.',
        'Keep upright and avoid lying flat if breathing is difficult.',
      ],
      safetyRuleVersion: SAFETY_RULE_VERSION,
    };
  }

  // STEP 2: Handle Unusable Image Quality
  if (imageQuality === 'unusable') {
    supportingReasons.push('The provided photograph lacks sufficient focus, resolution, or illumination for reliable analysis.');
    importantUnknowns.push('Visual appearance of the affected dental area');
    importantUnknowns.push('Depth and extent of any visible cavitation or soft tissue lesions');

    // If severe pain or systemic symptoms exist despite bad image, still recommend urgent dental
    if ((symptoms.painScore && symptoms.painScore >= 7) || symptoms.hasSwelling || symptoms.hasFeverOrMalaise) {
      if (symptoms.painScore && symptoms.painScore >= 7) {
        supportingReasons.push(`Reported severe pain level (${symptoms.painScore}/10).`);
      }
      supportingReasons.push('Significant patient-reported pain or swelling requires prompt clinical examination.');
      recommendedNextSteps.push('Schedule an urgent dental appointment within 24 to 48 hours based on reported symptoms.');
      recommendedNextSteps.push('Retake a well-lit, in-focus photograph for a revised preliminary screening.');
      return {
        urgency: 'urgent_dental',
        isEmergency: false,
        supportingReasons,
        importantUnknowns,
        limitations,
        recommendedNextSteps,
        safetyRuleVersion: SAFETY_RULE_VERSION,
      };
    }

    recommendedNextSteps.push('Retake the photograph in bright, indirect light focusing closely on the area of concern.');
    recommendedNextSteps.push('Consult a licensed dentist for an in-person clinical exam.');

    return {
      urgency: 'insufficient_evidence',
      isEmergency: false,
      supportingReasons,
      importantUnknowns,
      limitations,
      recommendedNextSteps,
      safetyRuleVersion: SAFETY_RULE_VERSION,
    };
  }

  // STEP 3: Urgent Dental Criteria
  const isUrgent =
    (symptoms.painScore && symptoms.painScore >= 7) ||
    symptoms.hasSwelling ||
    symptoms.hasFeverOrMalaise ||
    (symptoms.hasBleeding && symptoms.bleedingSpontaneous) ||
    findings.some(f => f.label.toLowerCase().includes('abscess') || f.label.toLowerCase().includes('fracture'));

  if (isUrgent) {
    if (symptoms.painScore && symptoms.painScore >= 7) {
      supportingReasons.push(`Reported severe pain level (${symptoms.painScore}/10).`);
    }
    if (symptoms.hasSwelling) {
      supportingReasons.push(`Reported localized swelling (${symptoms.swellingLocation || 'oral cavity'}).`);
    }
    if (symptoms.hasFeverOrMalaise) {
      supportingReasons.push('Reported fever or systemic malaise associated with oral symptoms.');
    }
    if (symptoms.hasBleeding && symptoms.bleedingSpontaneous) {
      supportingReasons.push('Reported spontaneous oral bleeding without mechanical irritation.');
    }

    const urgentFindings = findings.filter(f =>
      f.label.toLowerCase().includes('abscess') || f.label.toLowerCase().includes('fracture')
    );
    for (const f of urgentFindings) {
      supportingReasons.push(`Visual finding: ${f.label} (${f.visibleEvidence}).`);
    }

    importantUnknowns.push('Periapical radiographic status (X-ray needed)');
    importantUnknowns.push('Periodontal pocket depth measurements');

    recommendedNextSteps.push('Contact a dentist for an urgent evaluation within 24 to 48 hours.');
    recommendedNextSteps.push('Avoid chewing on the affected side and avoid extreme temperatures.');
    recommendedNextSteps.push('If facial swelling begins to spread rapidly or breathing becomes difficult, seek emergency care immediately.');

    return {
      urgency: 'urgent_dental',
      isEmergency: false,
      supportingReasons,
      importantUnknowns,
      limitations,
      recommendedNextSteps,
      safetyRuleVersion: SAFETY_RULE_VERSION,
    };
  }

  // STEP 4: Routine Dental Criteria
  const hasDentalFindings = findings.length > 0;
  const isGenericRoutineCheck =
    !symptoms.chiefConcern ||
    ['', 'routine check', 'routine checkup', 'checkup', 'preventive', 'none', 'healthy'].includes(
      symptoms.chiefConcern.trim().toLowerCase()
    );

  const hasModerateSymptoms =
    (symptoms.painScore !== undefined && symptoms.painScore > 0) ||
    symptoms.hasBleeding ||
    !isGenericRoutineCheck;

  if (hasDentalFindings || hasModerateSymptoms) {
    if (symptoms.painScore && symptoms.painScore > 0) {
      supportingReasons.push(`Reported mild-to-moderate pain (${symptoms.painScore}/10).`);
    }
    if (symptoms.hasBleeding) {
      supportingReasons.push('Reported bleeding during brushing or flossing, suggestive of gingival inflammation.');
    }
    for (const f of findings) {
      supportingReasons.push(`Visual observation: ${f.label} (${f.visibleEvidence}).`);
    }

    importantUnknowns.push('Presence of hidden interproximal decay');
    importantUnknowns.push('Pulp vitality test results');

    recommendedNextSteps.push('Schedule a routine dental examination and professional hygiene cleaning.');
    recommendedNextSteps.push('Maintain gentle twice-daily brushing with fluoride toothpaste and daily interdental flossing.');
    recommendedNextSteps.push('Monitor the area and request an earlier appointment if symptoms intensify.');

    return {
      urgency: 'routine_dental',
      isEmergency: false,
      supportingReasons,
      importantUnknowns,
      limitations,
      recommendedNextSteps,
      safetyRuleVersion: SAFETY_RULE_VERSION,
    };
  }

  // STEP 5: Self-Care & Monitoring
  supportingReasons.push('No acute signs of infection, severe pain, or visible gross pathology detected.');
  recommendedNextSteps.push('Continue regular preventive oral hygiene (brushing twice daily, daily flossing).');
  recommendedNextSteps.push('Keep regular bi-annual dental check-up schedule.');
  recommendedNextSteps.push('Re-screen or consult a dentist if new symptoms arise.');

  return {
    urgency: 'self_care_monitor',
    isEmergency: false,
    supportingReasons,
    importantUnknowns: ['Full subgingival and radiographic status'],
    limitations,
    recommendedNextSteps,
    safetyRuleVersion: SAFETY_RULE_VERSION,
  };
}
