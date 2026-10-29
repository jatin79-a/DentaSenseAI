// DentaSense AI — /api/interview
// Server-side adaptive interview endpoint for symptom questioning and emergency detection.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { INTERVIEW_QUESTIONS } from '@/lib/interview-machine';
import { checkEmergencyRedFlags } from '@/lib/safety-engine';
import { StructuredSymptoms, SupportedLanguage } from '@/types';

const InterviewRequestSchema = z.object({
  currentQuestionId: z.string().nullable(),
  userAnswer: z.string(),
  currentSymptoms: z.object({
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
  language: z.enum(['en', 'hi']).default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = InterviewRequestSchema.parse(body);

    let symptoms: StructuredSymptoms = { ...validated.currentSymptoms };
    const lang = validated.language as SupportedLanguage;

    // 1. Extract symptoms from current question
    if (validated.currentQuestionId && INTERVIEW_QUESTIONS[validated.currentQuestionId]) {
      const q = INTERVIEW_QUESTIONS[validated.currentQuestionId];
      const extracted = q.extractSymptom(validated.userAnswer, symptoms);
      symptoms = { ...symptoms, ...extracted };
    }

    // 2. Immediate emergency check
    const emergencyCheck = checkEmergencyRedFlags(symptoms);
    if (emergencyCheck.hasEmergency) {
      return NextResponse.json({
        nextQuestion: null,
        updatedSymptoms: symptoms,
        emergencyDetected: true,
        emergencyGuidance: emergencyCheck.guidance,
        isComplete: true,
      });
    }

    // 3. Select next adaptive question
    let nextQId: string | null = null;
    if (validated.currentQuestionId && INTERVIEW_QUESTIONS[validated.currentQuestionId]) {
      nextQId = INTERVIEW_QUESTIONS[validated.currentQuestionId].nextQuestionId(
        symptoms,
        validated.userAnswer
      );
    } else {
      nextQId = 'q_concern';
    }

    if (nextQId && INTERVIEW_QUESTIONS[nextQId]) {
      const nextQ = INTERVIEW_QUESTIONS[nextQId];
      return NextResponse.json({
        nextQuestion: {
          id: nextQ.id,
          category: nextQ.category,
          text: nextQ.prompt[lang],
          inputType: nextQ.inputType,
          options: nextQ.options?.map(o => ({
            value: o.value,
            label: o.label[lang],
          })),
          isEssential: nextQ.isEssential,
        },
        updatedSymptoms: symptoms,
        emergencyDetected: false,
        isComplete: false,
      });
    }

    // Complete interview
    return NextResponse.json({
      nextQuestion: null,
      updatedSymptoms: symptoms,
      emergencyDetected: false,
      isComplete: true,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid interview request', details: err.issues }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Interview processing error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
