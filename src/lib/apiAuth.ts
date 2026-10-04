import { NextResponse } from 'next/server';
import { getSessionFromRequest, SessionPayload, SessionRole } from './session';

/**
 * Pastikan request berasal dari admin yang login (dicek di server).
 * Pemakaian:
 *   const auth = await requireSession(request);           // admin atau superuser
 *   const auth = await requireSession(request, 'SUPERUSER');
 *   if (auth instanceof NextResponse) return auth;
 */
export async function requireSession(request: Request, role?: SessionRole): Promise<SessionPayload | NextResponse> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Sesi berakhir. Silakan login ulang.' }, { status: 401 });
  }
  if (role === 'SUPERUSER' && session.role !== 'SUPERUSER') {
    return NextResponse.json({ success: false, error: 'Akses khusus Superuser.' }, { status: 403 });
  }
  return session;
}
