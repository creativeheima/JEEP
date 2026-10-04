import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from './supabase';
import { getDbConfig } from './dbConfig';
import { getMySqlPool } from './mysql';
import { SITE } from './site';
import { normalizeWaNumber, isValidWaNumber } from './phone';

/**
 * Pengaturan website yang bisa diubah admin (mis. nomor WhatsApp).
 * Disimpan di tabel `site_settings` (Supabase / MySQL) dengan cadangan file data/site_settings.json.
 */
export interface SiteSettings {
  whatsapp: string; // format 62xxxxxxxxxx
}

const SETTINGS_KEY = 'general';
const DATA_FILE = path.join(process.cwd(), 'data', 'site_settings.json');
const CACHE_MS = 30_000;

const DEFAULTS: SiteSettings = { whatsapp: SITE.whatsapp };

let cache: { at: number; value: SiteSettings } | null = null;

function sanitize(raw: Partial<SiteSettings> | null | undefined): SiteSettings {
  const wa = normalizeWaNumber(raw?.whatsapp || '');
  return { whatsapp: isValidWaNumber(wa) ? wa : DEFAULTS.whatsapp };
}

function readLocal(): Partial<SiteSettings> | null {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {}
  return null;
}

function writeLocal(value: SiteSettings): boolean {
  try {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(value, null, 2), 'utf8');
    return true;
  } catch {
    return false;
  }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  const mode = getDbConfig().activeMode;
  let raw: Partial<SiteSettings> | null = null;

  try {
    if (mode === 'mysql') {
      const pool = getMySqlPool();
      if (pool) {
        const [rows]: [any[], any] = await pool.query('SELECT value FROM site_settings WHERE `key` = ? LIMIT 1', [SETTINGS_KEY]);
        if (rows?.[0]?.value) raw = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
      }
    } else if (mode === 'supabase' && isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('site_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle();
      if (error) throw new Error(error.message);
      if (data?.value) raw = data.value as Partial<SiteSettings>;
    }
  } catch (err) {
    console.warn('[settingsStore] Gagal membaca site_settings dari database, memakai file lokal:', (err as Error).message);
  }

  const value = sanitize(raw || readLocal());
  cache = { at: Date.now(), value };
  return value;
}

export async function saveSiteSettings(input: Partial<SiteSettings>): Promise<{ value: SiteSettings; warning?: string }> {
  const wa = normalizeWaNumber(input.whatsapp || '');
  if (!isValidWaNumber(wa)) {
    throw new Error('Nomor WhatsApp tidak valid. Contoh: 081234567890 atau 6281234567890.');
  }
  const value: SiteSettings = { whatsapp: wa };
  const mode = getDbConfig().activeMode;
  let warning: string | undefined;

  if (mode === 'mysql' && getMySqlPool()) {
    const pool = getMySqlPool()!;
    try {
      await pool.query(
        'INSERT INTO site_settings (`key`, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)',
        [SETTINGS_KEY, JSON.stringify(value)]
      );
    } catch (err) {
      throw new Error(
        `Gagal menyimpan ke MySQL: ${(err as Error).message}. Jalankan "Inisialisasi Tabel" di halaman Superuser agar tabel site_settings dibuat.`
      );
    }
  } else if (mode === 'supabase' && isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('site_settings')
      .upsert({ key: SETTINGS_KEY, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      const hint = 'Jalankan bagian "11. SITE SETTINGS" di supabase/schema.sql (Supabase → SQL Editor).';
      const tableMissing = /does not exist|schema cache|relation/i.test(error.message);
      // Tabel belum dibuat: tetap simpan ke file lokal (berfungsi di laptop/VPS), beri peringatan
      if (tableMissing && writeLocal(value)) {
        warning = `Tersimpan sementara di server ini saja karena tabel site_settings belum ada di Supabase. ${hint}`;
      } else {
        throw new Error(`Gagal menyimpan ke Supabase: ${error.message}. ${hint}`);
      }
    }
  } else if (!writeLocal(value)) {
    throw new Error('Penyimpanan belum dikonfigurasi. Hubungkan database di halaman Superuser.');
  }

  writeLocal(value); // cache lokal (diabaikan bila filesystem read-only)
  cache = { at: Date.now(), value };
  return { value, warning };
}
