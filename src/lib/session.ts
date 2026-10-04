/**
 * Sesi login admin yang DITANDATANGANI server (HMAC-SHA256).
 * - Bisa dipakai di middleware (Edge runtime) maupun route handler (Node), karena memakai Web Crypto.
 * - Token disimpan di cookie httpOnly `mja_session`, jadi tidak bisa dibaca/dipalsukan dari browser.
 *
 * Wajib isi ADMIN_SESSION_SECRET (string acak panjang) di .env.local & environment hosting.
 */

export type SessionRole = 'SUPERUSER' | 'ADMIN';

export interface SessionPayload {
  uid: string;
  username: string;
  name?: string;
  role: SessionRole;
  exp: number; // epoch detik
}

export const SESSION_COOKIE = 'mja_session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 jam

let warned = false;
function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (secret) return secret;
  if (!warned) {
    console.warn('[session] ADMIN_SESSION_SECRET belum diisi — memakai secret development. JANGAN dipakai di produksi.');
    warned = true;
  }
  return 'mja-dev-only-secret-ganti-di-env';
}

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = '';
  arr.forEach((b) => (str += String.fromCharCode(b)));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(s: string): string {
  const pad = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return atob(pad);
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(getSecret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
}

/** Bandingkan string dengan waktu konstan (hindari timing attack). */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(data: Omit<SessionPayload, 'exp'>, maxAge = SESSION_MAX_AGE): Promise<string> {
  const payload: SessionPayload = { ...data, exp: Math.floor(Date.now() / 1000) + maxAge };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  return `${body}.${await hmac(body)}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token || !token.includes('.')) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = await hmac(body);
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(b64urlDecode(body)) as SessionPayload;
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (payload.role !== 'ADMIN' && payload.role !== 'SUPERUSER') return null;
    return payload;
  } catch {
    return null;
  }
}

/** Ambil sesi dari header Cookie sebuah Request (untuk route handler). */
export async function getSessionFromRequest(request: Request): Promise<SessionPayload | null> {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return verifySessionToken(m ? decodeURIComponent(m[1]) : null);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_MAX_AGE,
};
