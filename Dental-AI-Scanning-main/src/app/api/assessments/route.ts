// DentaSense AI — /api/assessments
// GET: List recent assessments (optionally filtered by patientId)
// POST: Create new assessment record linked to verified patient identity

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbStore } from '@/lib/supabase/db-store';
import { SAFETY_RULE_VERSION } from '@/lib/safety-engine';

const CreateAssessmentSchema = z.object({
  patient_id: z.string().min(1, 'Patient ID is required'),
  image_quality_status: z.enum(['good', 'borderline', 'unusable']).default('good'),
  preliminary_urgency_category: z.enum([
    'emergency',
    'urgent_dental',
    'routine_dental',
    'self_care_monitor',
    'insufficient_evidence',
  ]),
  urgency_explanation: z.string().min(1),
  image_url: z.string().optional(),
  image_quality_metrics: z.any().optional(),
  structured_symptoms: z.object({
    chiefConcern: z.string(),
    location: z.string().optional(),
    duration: z.string().optional(),
    painScore: z.number().optional(),
    hasSwelling: z.boolean(),
    swellingLocation: z.string().optional(),
    swellingSpreadingRapidly: z.boolean().optional(),
    hasBleeding: z.boolean(),
    bleedingSpontaneous: z.boolean().optional(),
    hasFeverOrMalaise: z.boolean().optional(),
    hasDifficultySwallowing: z.boolean().optional(),
    hasDifficultyBreathing: z.boolean().optional(),
    patientConfirmed: z.boolean(),
  }),
  visible_findings: z.array(z.any()).default([]),
  limitations: z.array(z.string()).default([]),
  important_unknowns: z.array(z.string()).default([]),
  recommended_next_steps: z.array(z.string()).default([]),
  emergency_detected: z.boolean().default(false),
  emergency_guidance: z.string().optional(),
  is_simulated: z.boolean().default(false),
  model_provider_version: z.string().default('dentasense-v1'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId') || undefined;

    const assessments = await dbStore.getAssessments({ patientId });
    return NextResponse.json({ assessments });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve assessments';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateAssessmentSchema.parse(body);

    // Verify patient exists
    const patient = await dbStore.getPatientById(validated.patient_id);
    if (!patient) {
      return NextResponse.json({ error: 'Referenced patient does not exist' }, { status: 400 });
    }

    const assessment = await dbStore.createAssessment({
      patient_id: validated.patient_id,
      assessment_status: 'completed',
      image_quality_status: validated.image_quality_status,
      preliminary_urgency_category: validated.preliminary_urgency_category,
      urgency_explanation: validated.urgency_explanation,
      safety_rule_version: SAFETY_RULE_VERSION,
      model_provider_version: validated.model_provider_version,
      image_url: validated.image_url,
      image_quality_metrics: validated.image_quality_metrics,
      structured_symptoms: validated.structured_symptoms,
      visible_findings: validated.visible_findings,
      limitations: validated.limitations,
      important_unknowns: validated.important_unknowns,
      recommended_next_steps: validated.recommended_next_steps,
      emergency_detected: validated.emergency_detected,
      emergency_guidance: validated.emergency_guidance,
      is_simulated: validated.is_simulated,
    });

    return NextResponse.json(assessment, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Failed to create assessment';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
