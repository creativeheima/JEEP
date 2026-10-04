import fs from 'fs';
import path from 'path';
import { SystemDatabaseConfig, DatabaseMode } from '@/types/database';

/**
 * Strategi penyimpanan berlapis agar kompatibel di semua environment:
 *
 * 1. VERCEL / Production (read-only filesystem):
 *    - Tulis ke /tmp/db_config.json (writable di semua serverless platform)
 *    - /tmp tidak persisten antar cold-start, tetapi config di-cache di memory
 *      selama instance serverless hidup.
 *
 * 2. Local Dev (Next.js dev server):
 *    - Tulis ke <project>/data/db_config.json (persisten & mudah diedit manual)
 *
 * Priority baca: memory cache → /tmp (Vercel) | data/ (local) → env vars → default
 */

const IS_VERCEL =
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV !== undefined ||
  process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_CONFIG_FILE = path.join(LOCAL_DATA_DIR, 'db_config.json');
const TMP_CONFIG_FILE = '/tmp/db_config.json';

function getConfigFilePath(): string {
  return IS_VERCEL ? TMP_CONFIG_FILE : LOCAL_CONFIG_FILE;
}

function ensureDirExists(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getSupabaseFromEnv() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    anonKey:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY ||
      '',
    serviceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_KEY ||
      '',
  };
}

const DEFAULT_CONFIG: SystemDatabaseConfig = {
  activeMode: 'supabase',
  supabase: getSupabaseFromEnv(),
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    database: process.env.MYSQL_DATABASE || 'merapi_jeep_adventure',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    ssl: process.env.MYSQL_SSL === 'true',
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

let cachedConfig: SystemDatabaseConfig | null = null;
let lastSavePersisted = true;

/** true bila penyimpanan terakhir benar-benar tertulis permanen (bukan hanya di memori / /tmp). */
export function wasLastSavePersisted() {
  return lastSavePersisted;
}

export const isServerlessHosting = () => IS_VERCEL;

const MASK_RE = /\.\.\.|•/;
/** Nilai rahasia dari UI yang masih tersensor → pakai nilai tersimpan. */
export function unmaskSecret(incoming: unknown, stored: string): string {
  if (typeof incoming !== 'string') return stored;
  if (MASK_RE.test(incoming)) return stored;
  return incoming;
}

export function resetDbConfigCache() {
  cachedConfig = null;
}

function parseConfigFile(raw: string): SystemDatabaseConfig | null {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    // Gunakan ?? (nullish) agar nilai kosong ("") yang sengaja disimpan tidak tertimpa env-var
    const envSb = getSupabaseFromEnv();
    const sbUrl = parsed.supabase?.url ?? envSb.url;
    const sbAnon = parsed.supabase?.anonKey ?? envSb.anonKey;
    const sbSvc = parsed.supabase?.serviceRoleKey ?? envSb.serviceRoleKey;

    return {
      activeMode: (parsed.activeMode as DatabaseMode) ?? 'supabase',
      supabase: {
        url: typeof sbUrl === 'string' ? sbUrl : '',
        anonKey: typeof sbAnon === 'string' ? sbAnon : '',
        serviceRoleKey: typeof sbSvc === 'string' ? sbSvc : '',
      },
      mysql: {
        host: parsed.mysql?.host ?? DEFAULT_CONFIG.mysql.host,
        port: Number(parsed.mysql?.port) || DEFAULT_CONFIG.mysql.port,
        database: parsed.mysql?.database ?? DEFAULT_CONFIG.mysql.database,
        user: parsed.mysql?.user ?? DEFAULT_CONFIG.mysql.user,
        password: parsed.mysql?.password ?? '',
        ssl: Boolean(parsed.mysql?.ssl),
      },
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      updatedBy: parsed.updatedBy ?? 'system',
    };
  } catch {
    return null;
  }
}

function readConfigFromFile(): SystemDatabaseConfig | null {
  const filePath = getConfigFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = parseConfigFile(raw);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn('[dbConfig] Gagal baca', filePath, ':', err);
  }

  // Di local: juga coba /tmp jika data/ gagal (edge case)
  if (!IS_VERCEL && filePath !== TMP_CONFIG_FILE) {
    try {
      if (fs.existsSync(TMP_CONFIG_FILE)) {
        const raw = fs.readFileSync(TMP_CONFIG_FILE, 'utf-8');
        const parsed = parseConfigFile(raw);
        if (parsed) return parsed;
      }
    } catch {}
  }

  return null;
}

export function getDbConfig(): SystemDatabaseConfig {
  // 1. Memory cache
  if (cachedConfig) return cachedConfig;

  // 2. Baca dari file (env-aware)
  const fromFile = readConfigFromFile();
  if (fromFile) {
    cachedConfig = fromFile;
    return cachedConfig;
  }

  // 3. Fallback ke DEFAULT (env-var)
  cachedConfig = { ...DEFAULT_CONFIG, supabase: { ...getSupabaseFromEnv() } };
  try {
    const filePath = getConfigFilePath();
    ensureDirExists(filePath);
    fs.writeFileSync(filePath, JSON.stringify(cachedConfig, null, 2), 'utf-8');
  } catch {
    // Di read-only env, ini normal — in-memory cache sudah cukup
  }

  return cachedConfig;
}

export function saveDbConfig(
  newConfig: Partial<SystemDatabaseConfig>,
  updatedBy: string = 'superuser'
): boolean {
  try {
    const current = getDbConfig();
    const merged: SystemDatabaseConfig = {
      activeMode: (newConfig.activeMode as DatabaseMode) ?? current.activeMode,
      supabase: {
        ...current.supabase,
        ...(newConfig.supabase ?? {}),
      },
      mysql: {
        ...current.mysql,
        ...(newConfig.mysql ?? {}),
      },
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    // PENTING: Selalu update in-memory cache TERLEBIH DAHULU
    // Ini memastikan config aktif bahkan jika file write gagal (e.g., Vercel read-only issue)
    cachedConfig = merged;

    // Kemudian tulis ke file (best-effort)
    try {
      const filePath = getConfigFilePath();
      ensureDirExists(filePath);
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
      // Di serverless, /tmp hilang saat instance berganti → tidak dianggap permanen
      lastSavePersisted = !IS_VERCEL;
      console.log(`[dbConfig] Config disimpan ke ${filePath} (mode: ${merged.activeMode})`);
    } catch (fsErr: any) {
      lastSavePersisted = false;
      console.warn('[dbConfig] File write gagal (config tetap aktif via memory cache):', fsErr?.message);
    }

    return true; // Selalu sukses karena in-memory cache sudah diupdate
  } catch (err: any) {
    console.error('[dbConfig] Error kritis saveDbConfig:', err?.message || err);
    return false;
  }
}

/** Tampilkan config aman (password / secret key disensor sebagian) */
export function getMaskedDbConfig(): SystemDatabaseConfig {
  const cfg = getDbConfig();
  return {
    ...cfg,
    supabase: {
      url: cfg.supabase.url,
      anonKey: cfg.supabase.anonKey,
      serviceRoleKey: cfg.supabase.serviceRoleKey
        ? cfg.supabase.serviceRoleKey.length > 12
          ? `${cfg.supabase.serviceRoleKey.slice(0, 6)}...${cfg.supabase.serviceRoleKey.slice(-4)}`
          : '••••••••'
        : '',
    },
    mysql: {
      ...cfg.mysql,
      password: cfg.mysql.password ? '••••••••' : '',
    },
  };
}


