export const ADMIN_CREDENTIALS = {
  username: 'admin',
  email: 'admin@merapijeep.com',
  password: 'admin123',
};

export const AUTH_STORAGE_KEY = 'mja_admin_session';

export function isClientAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const session = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return data.isAuthenticated === true && Boolean(data.token);
  } catch {
    return false;
  }
}

export function setClientSession(user: { username: string; email: string }) {
  if (typeof window === 'undefined') return;
  const session = {
    isAuthenticated: true,
    user,
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
