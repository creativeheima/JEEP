/** Helper nomor telepon/WhatsApp Indonesia (aman dipakai di client & server). */

/** "0812-3456 7890" / "+62 812..." → "6281234567890" (format wa.me). */
export function normalizeWaNumber(input: string): string {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;
  return digits;
}

/** Validasi kasar nomor HP Indonesia (62 8xx, total 10–15 digit). */
export function isValidWaNumber(wa: string): boolean {
  return /^628\d{7,12}$/.test(wa);
}

/** "6281234567890" → "+62 812-3456-7890" */
export function formatPhoneIntl(wa: string): string {
  const m = wa.match(/^62(\d{3})(\d{4})(\d+)$/);
  return m ? `+62 ${m[1]}-${m[2]}-${m[3]}` : `+${wa}`;
}

/** "6281234567890" → "0812-3456-7890" */
export function formatPhoneLocal(wa: string): string {
  const m = wa.match(/^62(\d{3})(\d{4})(\d+)$/);
  return m ? `0${m[1]}-${m[2]}-${m[3]}` : wa;
}
