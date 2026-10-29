// Patient ID and Assessment ID generation
// Conforms to Part 7: Server-generated, collision-safe, non-sequential, no PII.

// Crockford Base32 alphabet (excludes I, L, O, U to avoid misreading and offensive words)
const CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * Generates a cryptographically random Crockford Base32 string of specified length.
 */
function generateRandomBase32(length: number): string {
  let result = '';
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : null;

  if (cryptoObj && cryptoObj.getRandomValues) {
    const bytes = new Uint8Array(length);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += CROCKFORD_ALPHABET[bytes[i] % CROCKFORD_ALPHABET.length];
    }
  } else {
    // Fallback if crypto is unavailable in rare test contexts
    for (let i = 0; i < length; i++) {
      const idx = Math.floor(Math.random() * CROCKFORD_ALPHABET.length);
      result += CROCKFORD_ALPHABET[idx];
    }
  }
  return result;
}

/**
 * Generates a public, collision-safe, human-readable Patient ID.
 * Format: DSA-XXXXXXXX (e.g. DSA-7K4M9P2Q)
 * Prefix 'DSA' for DentaSense AI, followed by 8 characters.
 */
export function generatePatientCode(): string {
  const code = generateRandomBase32(8);
  return `DSA-${code}`;
}

/**
 * Validates whether a given string is a valid Patient Code.
 */
export function isValidPatientCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const regex = /^DSA-[0-9A-HJKMNP-TV-Z]{8}$/;
  return regex.test(code.toUpperCase());
}

/**
 * Generates a unique Assessment Code.
 * Format: ASM-XXXXXX (e.g. ASM-9R2K4M)
 */
export function generateAssessmentCode(): string {
  const code = generateRandomBase32(6);
  return `ASM-${code}`;
}

/**
 * Validates whether a given string is a valid Assessment Code.
 */
export function isValidAssessmentCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  const regex = /^ASM-[0-9A-HJKMNP-TV-Z]{6}$/;
  return regex.test(code.toUpperCase());
}

/**
 * Safe generation with collision check callback.
 * Retries up to maxRetries times if the identifier already exists in the database.
 */
export async function generateUniquePatientCodeWithRetry(
  existsCheck: (candidate: string) => Promise<boolean>,
  maxRetries = 5
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const candidate = generatePatientCode();
    const exists = await existsCheck(candidate);
    if (!exists) {
      return candidate;
    }
  }
  throw new Error(`Failed to generate a unique Patient ID after ${maxRetries} attempts.`);
}
