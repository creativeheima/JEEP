import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDbConfig } from './dbConfig';
import { DbConnectionTestResult, SupabaseConfig } from '@/types/database';

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
  try {
    const dyn = getDbConfig()?.supabase?.url;
    if (dyn && dyn.trim()) return dyn.trim();
  } catch {}

  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    findEnvValue(/^next_public_supabase.*url$/i) ||
    findEnvValue(/^supabase.*url$/i) ||
    ''
  ).trim();
}

export function getSupabaseServiceRoleKey(): string {
  try {
    const dyn = getDbConfig()?.supabase?.serviceRoleKey;
    if (dyn && dyn.trim()) return dyn.trim();
  } catch {}

  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    findEnvValue(/^supabase.*service.*(role|key)?$/i) ||
    findEnvValue(/^supabase.*secret.*key?$/i) ||
    ''
  ).trim();
}

export function getSupabaseAnonKey(): string {
  try {
    const dyn = getDbConfig()?.supabase?.anonKey;
    if (dyn && dyn.trim()) return dyn.trim();
  } catch {}

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

export function resetSupabaseCache() {
  cachedClient = null;
  lastUrl = '';
  lastKey = '';
}

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

/** Uji koneksi Supabase secara langsung */
export async function testSupabaseConnection(override?: Partial<SupabaseConfig>): Promise<DbConnectionTestResult> {
  const url = (override?.url || getSupabaseUrl()).trim();
  const key = (override?.serviceRoleKey || override?.anonKey || getSupabaseKey()).trim();

  if (!url || !key) {
    return {
      success: false,
      message: 'URL atau API Key Supabase belum diisi!',
      error: 'MISSING_CREDENTIALS',
    };
  }

  const startTime = Date.now();
  try {
    const testClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Uji fetch salah satu tabel atau health endpoint
    const { data, error } = await testClient.from('bookings').select('id').limit(1);
    const latency = Date.now() - startTime;

    if (error) {
      // Jika tabel belum ada atau RLS membatasi, cek apakah error 42P01 (relation does not exist)
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: `Koneksi ke Supabase Berhasil (${latency}ms)! URL & API Key valid, namun tabel 'bookings' belum dibuat. Silakan jalankan skema SQL di Supabase SQL Editor.`,
          details: { latencyMs: latency },
        };
      }

      return {
        success: false,
        message: `Koneksi Supabase Ditolak: ${error.message} (Code: ${error.code || 'UNKNOWN'})`,
        error: error.message,
        details: { latencyMs: latency },
      };
    }

    return {
      success: true,
      message: `Koneksi Supabase Sukses! Terhubung ke project ${url} dalam ${latency}ms. Data siap diakses.`,
      details: {
        latencyMs: latency,
        detectedTables: ['bookings'],
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal menghubungi Supabase: ${err.message || String(err)}`,
      error: err.code || err.message,
    };
  }
}

// Proxy agar export lama `supabase` selalu reaktif terhadap runtime
export const supabase: SupabaseClient | null = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) return undefined;
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
