import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Cari value dari process.env secara toleran (abaikan spasi, huruf besar/kecil, atau variasi nama) */
function findEnvValue(pattern: RegExp): string {
  for (const [key, value] of Object.entries(process.env)) {
    if (pattern.test(key.trim()) && typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return '';
}

export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    findEnvValue(/^next_public_supabase.*url$/i) ||
    findEnvValue(/^supabase.*url$/i) ||
    ''
  ).trim();
}

export function getSupabaseServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    findEnvValue(/^supabase.*service.*(role|key)?$/i) ||
    findEnvValue(/^supabase.*secret.*key?$/i) ||
    ''
  ).trim();
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    findEnvValue(/^next_public_supabase.*anon.*(key)?$/i) ||
    findEnvValue(/^supabase.*anon.*(key)?$/i) ||
    findEnvValue(/^next_public_supabase.*public.*(key)?$/i) ||
    ''
  ).trim();
}

export function getSupabaseKey(): string {
  return getSupabaseServiceRoleKey() || getSupabaseAnonKey();
}

export const isSupabaseConfigured = (): boolean => {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project')
  );
};

let cachedClient: SupabaseClient | null = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (cachedClient && lastUrl === url && lastKey === key) {
    return cachedClient;
  }
  lastUrl = url;
  lastKey = key;
  cachedClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedClient;
}

export function getSupabaseEnvDiagnostics() {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  const service = getSupabaseServiceRoleKey();
  
  // Kumpulkan nama key di process.env yang berkaitan
  const detectedKeys = Object.keys(process.env).filter(
    (k) => /supabase|project.*url|anon|service_role/i.test(k)
  );

  return {
    isConfigured: isSupabaseConfigured(),
    hasUrl: Boolean(url),
    urlPreview: url ? `${url.slice(0, 16)}...` : 'KOSONG',
    hasAnonKey: Boolean(anon),
    hasServiceRoleKey: Boolean(service),
    detectedKeys,
  };
}

// Proxy agar export lama `supabase` selalu reaktif terhadap runtime process.env
export const supabase: SupabaseClient | null = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) return undefined;
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
