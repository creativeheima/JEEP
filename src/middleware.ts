import { NextResponse, type NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE, SessionRole } from '@/lib/session';

/**
 * Penjaga akses di sisi server untuk halaman admin/superuser dan semua API.
 * Sesi diverifikasi dari cookie httpOnly bertanda tangan — tidak bisa dipalsukan dari browser.
 */

type Rule = 'public' | 'admin' | 'superuser';

function apiRule(pathname: string, method: string): Rule {
  if (pathname === '/api/admin/auth') return 'public';
  if (pathname.startsWith('/api/admin/')) return 'superuser';
  if (pathname.startsWith('/api/upload')) return 'admin';

  if (pathname === '/api/bookings') {
    return method === 'POST' ? 'public' : 'admin'; // pelanggan boleh kirim, daftar booking hanya admin
  }
  if (pathname.startsWith('/api/bookings/')) {
    return method === 'GET' ? 'public' : 'admin'; // cek tiket/invoice publik (data sensitif disensor di route)
  }
  // Konten website: baca publik, ubah hanya admin
  return method === 'GET' || method === 'HEAD' ? 'public' : 'admin';
}

function deny(req: NextRequest, status: 401 | 403) {
  return NextResponse.json(
    { success: false, error: status === 401 ? 'Sesi berakhir. Silakan login ulang.' : 'Akses ditolak.' },
    { status }
  );
}

function allowed(role: SessionRole | undefined, rule: Rule) {
  if (rule === 'public') return true;
  if (!role) return false;
  if (rule === 'superuser') return role === 'SUPERUSER';
  return role === 'ADMIN' || role === 'SUPERUSER';
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  // ---------- API ----------
  if (pathname.startsWith('/api/')) {
    const rule = apiRule(pathname, req.method);
    if (allowed(session?.role, rule)) return NextResponse.next();
    return deny(req, session ? 403 : 401);
  }

  // ---------- Halaman ----------
  if (pathname.startsWith('/superuser') && pathname !== '/superuser/login') {
    if (!session) return NextResponse.redirect(new URL('/superuser/login', req.url));
    if (session.role !== 'SUPERUSER') return NextResponse.redirect(new URL('/admin', req.url));
  }
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) return NextResponse.redirect(new URL('/admin/login', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/superuser/:path*', '/api/:path*'],
};
