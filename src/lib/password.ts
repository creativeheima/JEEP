import crypto from 'crypto';

/**
 * Hash password memakai scrypt (bawaan Node, tanpa library tambahan).
 * Format tersimpan: scrypt$<salt hex>$<hash hex>
 */
const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function isHashed(value?: string): boolean {
  return !!value && value.startsWith('scrypt$');
}

export function verifyPassword(plain: string, stored?: string): boolean {
  if (!stored) return false;
  if (!isHashed(stored)) {
    // Data lama (plaintext) — tetap didukung lalu otomatis di-upgrade ke hash
    const a = Buffer.from(plain);
    const b = Buffer.from(stored);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  }
  const [, salt, hash] = stored.split('$');
  const test = crypto.scryptSync(plain, salt, KEYLEN);
  const expected = Buffer.from(hash, 'hex');
  return expected.length === test.length && crypto.timingSafeEqual(expected, test);
}

/** Password bawaan lama yang wajib diganti. */
export const KNOWN_WEAK_PASSWORDS = ['admin123', 'staff123', 'password123', 'password', '12345678'];

export function validateNewPassword(pw: string): string | null {
  if (!pw || pw.length < 8) return 'Password minimal 8 karakter.';
  if (KNOWN_WEAK_PASSWORDS.includes(pw.toLowerCase())) return 'Password terlalu umum, gunakan yang lain.';
  return null;
}
