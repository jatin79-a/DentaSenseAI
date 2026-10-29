import { describe, it, expect } from 'vitest';
import {
  validateImageFile,
  analyzeImageData,
  MIN_IMAGE_WIDTH,
  MIN_IMAGE_HEIGHT,
  MAX_FILE_SIZE_BYTES,
} from '../src/lib/image-quality';

describe('Image Quality Validation', () => {
  it('accepts valid JPEG, PNG, and WebP files', () => {
    expect(validateImageFile({ name: 'oral.jpg', size: 1024 * 500, type: 'image/jpeg' }).valid).toBe(true);
    expect(validateImageFile({ name: 'teeth.png', size: 1024 * 800, type: 'image/png' }).valid).toBe(true);
    expect(validateImageFile({ name: 'gum.webp', size: 1024 * 400, type: 'image/webp' }).valid).toBe(true);
  });

  it('rejects unsupported file formats like PDF or GIF', () => {
    const pdf = validateImageFile({ name: 'record.pdf', size: 1024 * 50, type: 'application/pdf' });
    expect(pdf.valid).toBe(false);
    expect(pdf.error).toContain('Supported formats are JPEG, PNG, and WebP');

    const gif = validateImageFile({ name: 'animate.gif', size: 1024 * 50, type: 'image/gif' });
    expect(gif.valid).toBe(false);
  });

  it('rejects empty or oversized files', () => {
    const empty = validateImageFile({ name: 'empty.jpg', size: 0, type: 'image/jpeg' });
    expect(empty.valid).toBe(false);
    expect(empty.error).toContain('empty or corrupted');

    const huge = validateImageFile({ name: 'huge.jpg', size: MAX_FILE_SIZE_BYTES + 1000, type: 'image/jpeg' });
    expect(huge.valid).toBe(false);
    expect(huge.error).toContain('exceeds the 10MB limit');
  });

  it('flags images smaller than minimum required dimensions (300x300)', () => {
    const smallBuffer = new Uint8ClampedArray(200 * 200 * 4);
    const metrics = analyzeImageData(200, 200, smallBuffer, 50000, 'image/jpeg');

    expect(metrics.overallStatus).toBe('unusable');
    expect(metrics.rejectionReason).toContain('too small for dental screening');
  });

  it('flags excessively dark images as unusable', () => {
    // Fill with very dark pixel values (luminance ~ 10/255 = 0.04)
    const darkBuffer = new Uint8ClampedArray(400 * 400 * 4);
    for (let i = 0; i < darkBuffer.length; i += 4) {
      darkBuffer[i] = 10;     // R
      darkBuffer[i + 1] = 10; // G
      darkBuffer[i + 2] = 10; // B
      darkBuffer[i + 3] = 255;
    }

    const metrics = analyzeImageData(400, 400, darkBuffer, 150000, 'image/jpeg');
    expect(metrics.brightnessStatus).toBe('too_dark');
    expect(metrics.overallStatus).toBe('unusable');
    expect(metrics.rejectionReason).toContain('too dark');
  });
});
