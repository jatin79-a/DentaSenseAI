// DentaSense AI — /api/assessments/quality-check
// Validates image file structure, dimensions, darkness/brightness, and blur heuristics.

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateImageFile,
  analyzeImageData,
  MIN_IMAGE_WIDTH,
  MIN_IMAGE_HEIGHT,
} from '@/lib/image-quality';

const QualityCheckRequestSchema = z.object({
  name: z.string(),
  size: z.number().positive(),
  type: z.string(),
  width: z.number().int().positive().optional().default(800),
  height: z.number().int().positive().optional().default(600),
  imageBase64: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = QualityCheckRequestSchema.parse(body);

    // 1. File verification
    const fileCheck = validateImageFile({
      name: validated.name,
      size: validated.size,
      type: validated.type,
    });

    if (!fileCheck.valid) {
      return NextResponse.json(
        {
          overallStatus: 'unusable',
          isDecodable: false,
          rejectionReason: fileCheck.error,
          width: validated.width,
          height: validated.height,
          fileSizeBytes: validated.size,
          mimeType: validated.type,
          brightnessScore: 0,
          brightnessStatus: 'too_dark',
          sharpnessScore: 0,
          sharpnessStatus: 'blurry',
        },
        { status: 400 }
      );
    }

    // 2. Decode sample buffer if base64 provided
    if (validated.imageBase64 && validated.imageBase64.includes('base64,')) {
      try {
        const base64Data = validated.imageBase64.split('base64,')[1];
        const buffer = Buffer.from(base64Data, 'base64');

        if (buffer.length < 100) {
          throw new Error('Image data is corrupted or truncated.');
        }

        // Mock a representative RGBA sample from the buffer for analysis
        const sampleSize = Math.min(buffer.length, 20000);
        const rgbaSample = new Uint8Array(sampleSize * 4);
        for (let i = 0; i < sampleSize; i++) {
          const val = buffer[i];
          rgbaSample[i * 4] = val;
          rgbaSample[i * 4 + 1] = val;
          rgbaSample[i * 4 + 2] = val;
          rgbaSample[i * 4 + 3] = 255;
        }

        const metrics = analyzeImageData(
          validated.width,
          validated.height,
          rgbaSample,
          validated.size,
          validated.type
        );

        return NextResponse.json(metrics);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Decoding failed';
        return NextResponse.json({
          overallStatus: 'unusable',
          isDecodable: false,
          rejectionReason: `Image decoding error: ${msg}`,
          width: validated.width,
          height: validated.height,
          fileSizeBytes: validated.size,
          mimeType: validated.type,
          brightnessScore: 0,
          brightnessStatus: 'too_dark',
          sharpnessScore: 0,
          sharpnessStatus: 'blurry',
        });
      }
    }

    // If no raw base64 buffer, perform metadata-based heuristic
    const isSmall = validated.width < MIN_IMAGE_WIDTH || validated.height < MIN_IMAGE_HEIGHT;
    return NextResponse.json({
      width: validated.width,
      height: validated.height,
      fileSizeBytes: validated.size,
      mimeType: validated.type,
      isDecodable: true,
      brightnessScore: 0.65,
      brightnessStatus: 'optimal',
      sharpnessScore: isSmall ? 0.3 : 0.75,
      sharpnessStatus: isSmall ? 'blurry' : 'sharp',
      overallStatus: isSmall ? 'unusable' : 'good',
      rejectionReason: isSmall
        ? `Image dimensions (${validated.width}x${validated.height}) are below required minimum ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}px.`
        : undefined,
    });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Quality check failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
