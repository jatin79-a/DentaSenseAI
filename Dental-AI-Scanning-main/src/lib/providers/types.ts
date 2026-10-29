// DentaSense AI — AI Provider Interfaces & Zod Validation Schemas

import { z } from 'zod';
import { AssessmentFinding, ImageQualityStatus } from '@/types';

// Zod schema for validated vision findings
export const AssessmentFindingSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  anatomicalLocation: z.string().optional(),
  visibleEvidence: z.string().min(1),
  confidenceBand: z.enum(['low', 'moderate', 'high']),
  limitations: z.string().min(1),
  suggestedFollowUp: z.string().min(1),
});

export const VisionAnalysisResultSchema = z.object({
  findings: z.array(AssessmentFindingSchema),
  overallVisibleStatus: z.enum(['healthy_appearance', 'minor_abnormality', 'notable_abnormality', 'unclear']),
  generalObservations: z.string(),
  screeningLimitations: z.array(z.string()),
  isSimulated: z.boolean(),
  providerModel: z.string(),
});

export type VisionAnalysisResult = z.infer<typeof VisionAnalysisResultSchema>;

export interface VisionProviderConfig {
  apiKey?: string;
  model?: string;
  endpoint?: string;
  timeoutMs?: number;
}

export interface TextProviderConfig {
  apiKey?: string;
  model?: string;
  endpoint?: string;
  timeoutMs?: number;
}

export interface SpeechProviderConfig {
  apiKey?: string;
  sttModel?: string;
  ttsModel?: string;
  endpoint?: string;
}
