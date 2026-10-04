import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/accountStore';
import { createSessionToken, getSessionFromRequest, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session';

// Batas percobaan login sederhana per IP (in-memory, best-effort)
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

function clientIp(request: Request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
}

/** POST: login */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.until > now && rec.count >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { success: false, error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan kata sandi wajib diisi!' }, { status: 400 });
    }

    let result;
    try {
      result = await authenticateUser(String(username), String(password));
    } catch (err) {
      console.error('Login storage error:', err);
      return NextResponse.json(
        { success: false, error: 'Penyimpanan akun belum siap: ' + (err as Error).message },
        { status: 500 }
      );
    }

    if (!result) {
      const r = attempts.get(ip);
      attempts.set(ip, { count: (r && r.until > now ? r.count : 0) + 1, until: now + WINDOW_MS });
      return NextResponse.json({ success: false, error: 'Username atau kata sandi tidak cocok!' }, { status: 401 });
    }

    const { account, weakPassword } = result;
    if (!account.isActive) {
      return NextResponse.json({ success: false, error: 'Akun Anda dinonaktifkan oleh Superuser!' }, { status: 403 });
    }
    attempts.delete(ip);

    const token = await createSessionToken({
      uid: account.id,
      username: account.username,
      name: account.name,
      role: account.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: account.id, username: account.username, name: account.name, email: account.email, role: account.role },
      weakPassword,
    });
    // Cookie "secure" hanya bila diakses lewat HTTPS (agar tes via http://IP-lokal di HP tetap bisa login)
    const isHttps =
      new URL(request.url).protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
    response.cookies.set(SESSION_COOKIE, token, { ...sessionCookieOptions, secure: isHttps });
    // Hapus cookie lama yang tidak aman (versi sebelumnya)
    response.cookies.set('mja_admin_token', '', { path: '/', maxAge: 0 });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal sistem' }, { status: 500 });
  }
}

/** GET: cek sesi aktif (dipakai halaman admin untuk memastikan masih login) */
export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json({
    success: true,
    user: { id: session.uid, username: session.username, name: session.name, role: session.role },
  });
}

/** DELETE: logout */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  response.cookies.set('mja_admin_token', '', { path: '/', maxAge: 0 });
  return response;
}
