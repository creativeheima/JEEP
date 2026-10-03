import { ClientAdminSession, UserRole } from '@/types/account';

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  email: 'admin@merapijeep.com',
  password: 'admin123',
};

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
    token: 'mja_token_' + Date.now(),
    loginTime: new Date().toISOString(),
  };
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  // Also set cookie for simple server inspection
  document.cookie = `mja_admin_token=${session.token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearClientSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  document.cookie = `mja_admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
