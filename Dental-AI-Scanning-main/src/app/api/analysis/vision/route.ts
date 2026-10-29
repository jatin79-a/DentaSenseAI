// DentaSense AI — /api/analysis/vision
// Executes server-side Vision provider with structured Zod output validation.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { visionProvider } from '@/lib/providers/vision-provider';

const VisionRequestSchema = z.object({
  imageBase64: z.string().min(1, 'Image data is required'),
  qualityStatus: z.enum(['good', 'borderline', 'unusable']).default('good'),
  allowSimulation: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = VisionRequestSchema.parse(body);

    const result = await visionProvider.analyzeImage(
      validated.imageBase64,
      validated.qualityStatus,
      validated.allowSimulation
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Vision analysis failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
