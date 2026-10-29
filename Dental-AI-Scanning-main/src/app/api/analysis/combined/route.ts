// DentaSense AI — /api/analysis/combined
// Executes deterministic safety engine combining symptoms, image findings, and quality status.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { evaluateSafetyAndUrgency } from '@/lib/safety-engine';

const CombinedAnalysisSchema = z.object({
  symptoms: z.object({
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
  findings: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      anatomicalLocation: z.string().optional(),
      visibleEvidence: z.string(),
      confidenceBand: z.enum(['low', 'moderate', 'high']),
      limitations: z.string(),
      suggestedFollowUp: z.string(),
    })
  ).default([]),
  imageQuality: z.enum(['good', 'borderline', 'unusable']).default('good'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CombinedAnalysisSchema.parse(body);

    const triageResult = evaluateSafetyAndUrgency(
      validated.symptoms,
      validated.findings,
      validated.imageQuality
    );

    return NextResponse.json(triageResult);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Combined assessment failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
