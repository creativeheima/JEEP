import fs from 'fs';
import path from 'path';
import { SystemDatabaseConfig, DatabaseMode } from '@/types/database';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'db_config.json');

const DEFAULT_CONFIG: SystemDatabaseConfig = {
  activeMode: 'supabase',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '',
  },
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

export function resetDbConfigCache() {
  cachedConfig = null;
}

function ensureDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getDbConfig(): SystemDatabaseConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        // Gunakan ?? (nullish) agar nilai kosong ("") tidak tertimpa env-var
        const sbUrl = parsed.supabase?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
        const sbAnon = parsed.supabase?.anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
        const sbSvc = parsed.supabase?.serviceRoleKey ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
        cachedConfig = {
          activeMode: parsed.activeMode ?? 'supabase',
          supabase: {
            url: typeof sbUrl === 'string' ? sbUrl : '',
            anonKey: typeof sbAnon === 'string' ? sbAnon : '',
            serviceRoleKey: typeof sbSvc === 'string' ? sbSvc : '',
          },
          mysql: {
            host: parsed.mysql?.host ?? 'localhost',
            port: Number(parsed.mysql?.port) || 3306,
            database: parsed.mysql?.database ?? 'merapi_jeep_adventure',
            user: parsed.mysql?.user ?? 'root',
            password: parsed.mysql?.password ?? '',
            ssl: Boolean(parsed.mysql?.ssl),
          },
          updatedAt: parsed.updatedAt ?? new Date().toISOString(),
          updatedBy: parsed.updatedBy ?? 'system',
        };
        return cachedConfig;
      }
    }
  } catch (err) {
    console.error('Error reading db_config.json:', err);
  }

  // Fallback to default & save
  cachedConfig = { ...DEFAULT_CONFIG };
  try {
    ensureDirExists();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cachedConfig, null, 2), 'utf-8');
  } catch {}

  return cachedConfig;
}

export function saveDbConfig(
  newConfig: Partial<SystemDatabaseConfig>,
  updatedBy: string = 'superuser'
): boolean {
  try {
    ensureDirExists();
    const current = getDbConfig();
    const merged: SystemDatabaseConfig = {
      activeMode: (newConfig.activeMode as DatabaseMode) || current.activeMode,
      supabase: {
        ...current.supabase,
        ...(newConfig.supabase || {}),
      },
      mysql: {
        ...current.mysql,
        ...(newConfig.mysql || {}),
      },
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
    cachedConfig = merged;
    return true;
  } catch (err: any) {
    console.error('Error saving db_config.json:', err?.message || err);
    return false;
  }
}

/** Tampilkan config aman (password / secret key disensor sebagian atau utuh) */
export function getMaskedDbConfig(): SystemDatabaseConfig {
  const cfg = getDbConfig();
  return {
    ...cfg,
    supabase: {
      url: cfg.supabase.url,
      anonKey: cfg.supabase.anonKey, // Diperlukan di admin untuk edit / verifikasi
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
