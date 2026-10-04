import { ClientAdminSession, UserRole } from '@/types/account';

/**
 * Helper sesi di BROWSER — hanya untuk tampilan (nama user, role di UI).
 * Keamanan sebenarnya ada di cookie httpOnly `mja_session` yang dicek server (lihat lib/session.ts & middleware.ts).
 */
export const AUTH_STORAGE_KEY = 'mja_admin_session';

export function getClientSession(): {
  isAuthenticated: boolean;
  user?: {
    id?: string;
    username: string;
    name?: string;
    email: string;
    role: UserRole;
  };
  token?: string;
  loginTime?: string;
} | null {
  if (typeof window === 'undefined') return null;
  const session = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!session) return null;
  try {
    const data = JSON.parse(session);
    if (data.isAuthenticated === true && Boolean(data.token)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

export function isClientAuthenticated(): boolean {
  return Boolean(getClientSession()?.isAuthenticated);
}

export function getClientUser() {
  return getClientSession()?.user || null;
}

export function isSuperuser(): boolean {
  const user = getClientUser();
  return user?.role === 'SUPERUSER';
}

export function setClientSession(user: {
  id?: string;
  username: string;
  name?: string;
  email: string;
  role?: string;
}) {
  if (typeof window === 'undefined') return;
  const normalizedRole: UserRole =
    user.role === 'SUPERUSER' || user.role?.toLowerCase().includes('super')
      ? 'SUPERUSER'
      : 'ADMIN';

  const session = {
    isAuthenticated: true,
    user: {
      id: user.id || 'usr-' + Date.now(),
      username: user.username,
      name: user.name || user.username,
      email: user.email,
      role: normalizedRole,
    },
    token: 'ui',
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearClientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  // Hapus cookie sesi httpOnly di server
  fetch('/api/admin/auth', { method: 'DELETE', keepalive: true }).catch(() => {});
}

/**
 * Pastikan sesi server masih valid. Bila tidak (cookie habis/dihapus), bersihkan sesi UI.
 * Mengembalikan data user dari server atau null.
 */
export async function verifyServerSession(): Promise<{ id: string; username: string; name?: string; role: UserRole } | null> {
  try {
    const res = await fetch('/api/admin/auth', { cache: 'no-store' });
    if (!res.ok) {
      if (typeof window !== 'undefined') localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    const json = await res.json();
    return json.user || null;
  } catch {
    return null;
  }
}
