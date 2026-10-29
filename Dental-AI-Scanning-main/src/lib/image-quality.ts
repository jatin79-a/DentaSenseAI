// DentaSense AI — Image Quality Verification
// Checks dimensions, decodability, brightness/darkness thresholds, and blur heuristics.

import { ImageQualityMetrics, ImageQualityStatus } from '@/types';

export const MIN_IMAGE_WIDTH = 300;
export const MIN_IMAGE_HEIGHT = 300;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

/**
 * Validates basic file characteristics (MIME type, size, presence).
 */
export function validateImageFile(file: { name: string; size: number; type: string }): {
  valid: boolean;
  error?: string;
} {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Supported formats are JPEG, PNG, and WebP.',
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: 'The uploaded file appears to be empty or corrupted.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 10MB limit (uploaded: ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  return { valid: true };
}

/**
 * Evaluates image pixel data for brightness, darkness, and contrast/sharpness.
 * Works with ImageData array (RGBA buffer).
 */
export function analyzeImageData(
  width: number,
  height: number,
  rgbaData: Uint8ClampedArray | Uint8Array,
  fileSizeBytes: number,
  mimeType: string
): ImageQualityMetrics {
  // Check minimum dimensions
  if (width < MIN_IMAGE_WIDTH || height < MIN_IMAGE_HEIGHT) {
    return {
      width,
      height,
      fileSizeBytes,
      mimeType,
      isDecodable: true,
      brightnessScore: 0.5,
      brightnessStatus: 'optimal',
      sharpnessScore: 0,
      sharpnessStatus: 'blurry',
      overallStatus: 'unusable',
      rejectionReason: `Image dimensions (${width}x${height}) are too small for dental screening. Minimum required is ${MIN_IMAGE_WIDTH}x${MIN_IMAGE_HEIGHT}.`,
    };
  }

  // Sample luminance across pixels
  const totalPixels = width * height;
  const sampleStep = Math.max(1, Math.floor(totalPixels / 20000)); // Sample ~20k pixels for speed
  let totalLuminance = 0;
  let sampledCount = 0;

  // Grayscale buffer for simple gradient variance (sharpness heuristic)
  let sumGradient = 0;

  for (let i = 0; i < totalPixels; i += sampleStep) {
    const idx = i * 4;
    const r = rgbaData[idx];
    const g = rgbaData[idx + 1];
    const b = rgbaData[idx + 2];

    // Standard ITU-R BT.601 luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += lum;
    sampledCount++;

    // Horizontal neighbor difference for sharpness estimation
    if ((i % width) < width - 1) {
      const nextR = rgbaData[idx + 4];
      const nextG = rgbaData[idx + 5];
      const nextB = rgbaData[idx + 6];
      const nextLum = 0.299 * nextR + 0.587 * nextG + 0.114 * nextB;
      sumGradient += Math.abs(lum - nextLum);
    }
  }

  const avgLuminance = sampledCount > 0 ? totalLuminance / sampledCount : 128;
  const brightnessScore = Math.min(1, Math.max(0, avgLuminance / 255));

  let brightnessStatus: 'too_dark' | 'optimal' | 'too_bright' = 'optimal';
  if (brightnessScore < 0.18) {
    brightnessStatus = 'too_dark';
  } else if (brightnessScore > 0.88) {
    brightnessStatus = 'too_bright';
  }

  const avgGradient = sampledCount > 0 ? sumGradient / sampledCount : 0;
  // Normalized sharpness estimate (typical gradient between 5 and 35)
  const sharpnessScore = Math.min(1, Math.max(0, avgGradient / 25));

  let sharpnessStatus: 'sharp' | 'acceptable' | 'blurry' = 'acceptable';
  if (sharpnessScore > 0.6) {
    sharpnessStatus = 'sharp';
  } else if (sharpnessScore < 0.25) {
    sharpnessStatus = 'blurry';
  }

  let overallStatus: ImageQualityStatus = 'good';
  let rejectionReason: string | undefined;

  if (brightnessStatus === 'too_dark') {
    overallStatus = 'unusable';
    rejectionReason = 'The image is too dark. Oral screening requires adequate illumination (use flashlight or well-lit indirect light).';
  } else if (brightnessStatus === 'too_bright') {
    overallStatus = 'borderline';
    rejectionReason = 'Severe glare or overexposure detected. Visual details in the enamel may be washed out.';
  } else if (sharpnessStatus === 'blurry') {
    overallStatus = 'borderline';
    rejectionReason = 'The image appears blurry or out of focus. Fine gingival margins or tooth cracks may not be visible.';
  }

  return {
    width,
    height,
    fileSizeBytes,
    mimeType,
    isDecodable: true,
    brightnessScore,
    brightnessStatus,
    sharpnessScore,
    sharpnessStatus,
    overallStatus,
    rejectionReason,
  };
}
