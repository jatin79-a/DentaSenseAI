import { describe, it, expect } from 'vitest';
import {
  generatePatientCode,
  isValidPatientCode,
  generateAssessmentCode,
  isValidAssessmentCode,
  generateUniquePatientCodeWithRetry,
} from '../src/lib/patient-id';

describe('Patient ID and Assessment ID Generators', () => {
  it('generates a valid Patient Code matching DSA-XXXXXXXX format', () => {
    const code = generatePatientCode();
    expect(code).toMatch(/^DSA-[0-9A-HJKMNP-TV-Z]{8}$/);
    expect(isValidPatientCode(code)).toBe(true);
  });

  it('rejects invalid or malformed patient codes', () => {
    expect(isValidPatientCode('')).toBe(false);
    expect(isValidPatientCode('12345')).toBe(false);
    expect(isValidPatientCode('DSA-123')).toBe(false); // too short
    expect(isValidPatientCode('DSA-1234567I')).toBe(false); // contains invalid char 'I'
    expect(isValidPatientCode('DSA-1234567O')).toBe(false); // contains invalid char 'O'
    expect(isValidPatientCode('PAT-7K4M9P2Q')).toBe(false); // wrong prefix
  });

  it('generates a valid Assessment Code matching ASM-XXXXXX format', () => {
    const code = generateAssessmentCode();
    expect(code).toMatch(/^ASM-[0-9A-HJKMNP-TV-Z]{6}$/);
    expect(isValidAssessmentCode(code)).toBe(true);
  });

  it('generates unique codes across multiple iterations', () => {
    const generated = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const code = generatePatientCode();
      expect(generated.has(code)).toBe(false);
      generated.add(code);
    }
    expect(generated.size).toBe(100);
  });

  it('safely handles collision retry and succeeds when slot available', async () => {
    let callCount = 0;
    const mockExistsCheck = async (candidate: string) => {
      callCount++;
      return callCount < 3; // First 2 collide, 3rd succeeds
    };

    const code = await generateUniquePatientCodeWithRetry(mockExistsCheck, 5);
    expect(isValidPatientCode(code)).toBe(true);
    expect(callCount).toBe(3);
  });
});
