import { describe, it, expect } from 'vitest';
import {
  evaluateSafetyAndUrgency,
  checkEmergencyRedFlags,
  SAFETY_RULE_VERSION,
} from '../src/lib/safety-engine';
import { StructuredSymptoms, AssessmentFinding } from '../src/types';

describe('Deterministic Safety Engine', () => {
  const baseHealthySymptoms: StructuredSymptoms = {
    chiefConcern: 'Routine check',
    hasSwelling: false,
    hasBleeding: false,
    painScore: 0,
    patientConfirmed: true,
  };

  const benignVisualFindings: AssessmentFinding[] = [
    {
      id: 'f-1',
      label: 'Healthy Enamel Appearance',
      visibleEvidence: 'Uniform shade, intact marginal ridges',
      confidenceBand: 'high',
      limitations: 'Surface only',
      suggestedFollowUp: 'Routine cleaning',
    },
  ];

  it('records correct safety rule version on all triage evaluations', () => {
    const result = evaluateSafetyAndUrgency(baseHealthySymptoms, [], 'good');
    expect(result.safetyRuleVersion).toBe(SAFETY_RULE_VERSION);
  });

  it('NON-NEGOTIABLE MEDICAL RULE: Low-risk visual findings CANNOT override red-flag emergency symptoms', () => {
    const emergencySymptoms: StructuredSymptoms = {
      ...baseHealthySymptoms,
      hasDifficultyBreathing: true, // Emergency red flag!
    };

    // Even with perfect benign visual findings, emergency must trigger!
    const triage = evaluateSafetyAndUrgency(emergencySymptoms, benignVisualFindings, 'good');

    expect(triage.urgency).toBe('emergency');
    expect(triage.isEmergency).toBe(true);
    expect(triage.emergencyGuidance).toBeDefined();
    expect(triage.emergencyGuidance).toContain('SEEK EMERGENCY MEDICAL ATTENTION IMMEDIATELY');
    expect(triage.supportingReasons.some(r => r.includes('difficulty breathing'))).toBe(true);
  });

  it('triggers emergency when difficulty swallowing is reported', () => {
    const dysphagiaSymptoms: StructuredSymptoms = {
      ...baseHealthySymptoms,
      hasDifficultySwallowing: true,
    };
    const triage = evaluateSafetyAndUrgency(dysphagiaSymptoms, [], 'good');
    expect(triage.urgency).toBe('emergency');
    expect(triage.isEmergency).toBe(true);
  });

  it('triggers emergency when rapidly spreading facial/neck swelling is reported', () => {
    const spreadingSwellingSymptoms: StructuredSymptoms = {
      ...baseHealthySymptoms,
      hasSwelling: true,
      swellingSpreadingRapidly: true,
    };
    const triage = evaluateSafetyAndUrgency(spreadingSwellingSymptoms, [], 'good');
    expect(triage.urgency).toBe('emergency');
    expect(triage.isEmergency).toBe(true);
  });

  it('triggers urgent_dental for severe pain (>= 7/10) even if image quality is unusable', () => {
    const severePainSymptoms: StructuredSymptoms = {
      ...baseHealthySymptoms,
      painScore: 9,
    };
    const triage = evaluateSafetyAndUrgency(severePainSymptoms, [], 'unusable');
    expect(triage.urgency).toBe('urgent_dental');
    expect(triage.supportingReasons.some(r => r.includes('severe pain'))).toBe(true);
  });

  it('returns insufficient_evidence if image is unusable and symptoms are non-severe', () => {
    const triage = evaluateSafetyAndUrgency(baseHealthySymptoms, [], 'unusable');
    expect(triage.urgency).toBe('insufficient_evidence');
    expect(triage.recommendedNextSteps.some(s => s.includes('Retake the photograph'))).toBe(true);
  });

  it('recommends routine_dental for mild pain and surface demineralization', () => {
    const mildSymptoms: StructuredSymptoms = {
      ...baseHealthySymptoms,
      chiefConcern: 'Dark pit in molar',
      painScore: 2,
    };
    const findings: AssessmentFinding[] = [
      {
        id: 'f-2',
        label: 'Enamel Demineralization',
        visibleEvidence: 'Small dark pit',
        confidenceBand: 'moderate',
        limitations: 'No tactile check',
        suggestedFollowUp: 'Routine exam',
      },
    ];
    const triage = evaluateSafetyAndUrgency(mildSymptoms, findings, 'good');
    expect(triage.urgency).toBe('routine_dental');
    expect(triage.isEmergency).toBe(false);
  });

  it('recommends self_care_monitor for healthy teeth with zero symptoms', () => {
    const triage = evaluateSafetyAndUrgency(baseHealthySymptoms, [], 'good');
    expect(triage.urgency).toBe('self_care_monitor');
    expect(triage.isEmergency).toBe(false);
  });
});
