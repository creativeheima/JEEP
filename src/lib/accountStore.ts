import fs from 'fs';
import path from 'path';
import { AdminAccount, UserRole } from '@/types/account';
import { hashPassword, isHashed, verifyPassword, validateNewPassword, KNOWN_WEAK_PASSWORDS } from './password';
import { getDbConfig } from './dbConfig';
import { getMySqlPool } from './mysql';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Penyimpanan akun admin.
 * - Mode Supabase → tabel public.admin_accounts
 * - Mode MySQL    → tabel admin_accounts
 * - Mode lokal    → data/accounts.json (hanya untuk development / VPS)
 * Password SELALU disimpan dalam bentuk hash (scrypt). Data lama plaintext otomatis di-upgrade.
 */

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const TABLE = 'admin_accounts';

type SafeAccount = Omit<AdminAccount, 'password' | 'passwordHash'>;

function storageMode(): 'supabase' | 'mysql' | 'local' {
  const mode = getDbConfig().activeMode;
  if (mode === 'mysql' && getMySqlPool()) return 'mysql';
  if (mode === 'supabase' && isSupabaseConfigured()) return 'supabase';
  return 'local';
}

function toSafe(acc: AdminAccount): SafeAccount {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, passwordHash, ...rest } = acc;
  return rest;
}

/** Akun awal bila belum ada akun sama sekali. */
function initialAccounts(): AdminAccount[] {
  const user = process.env.ADMIN_INITIAL_USERNAME?.trim();
  const pass = process.env.ADMIN_INITIAL_PASSWORD;
  if (user && pass) {
    return [
      {
        id: 'usr-superuser-1',
        username: user,
        name: 'Superuser',
        email: process.env.ADMIN_INITIAL_EMAIL?.trim() || `${user}@localhost`,
        role: 'SUPERUSER',
        passwordHash: hashPassword(pass),
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  if (process.env.NODE_ENV !== 'production') {
    // Khusus development: akun sementara, WAJIB diganti dari menu Manajemen Akun
    return [
      {
        id: 'usr-superuser-1',
        username: 'superuser',
        name: 'Superuser (sementara)',
        email: 'super@localhost',
        role: 'SUPERUSER',
        passwordHash: hashPassword('admin123'),
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
  }
  return [];
}

// ---------------- Konversi baris DB ----------------
function fromRow(r: Record<string, any>): AdminAccount {
  return {
    id: String(r.id),
    username: String(r.username),
    name: String(r.name || r.username),
    email: String(r.email || ''),
    role: r.role === 'SUPERUSER' ? 'SUPERUSER' : 'ADMIN',
    passwordHash: r.password_hash ? String(r.password_hash) : undefined,
    isActive: r.is_active === true || r.is_active === 1 || r.is_active === '1',
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    lastLogin: r.last_login ? new Date(r.last_login).toISOString() : undefined,
  };
}

function toRow(a: AdminAccount) {
  return {
    id: a.id,
    username: a.username,
    name: a.name,
    email: a.email,
    role: a.role,
    password_hash: a.passwordHash || null,
    is_active: a.isActive,
    created_at: a.createdAt,
    last_login: a.lastLogin || null,
  };
}

// ---------------- File lokal ----------------
function readLocal(): AdminAccount[] {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(ACCOUNTS_FILE, 'utf-8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        let migrated = false;
        const list: AdminAccount[] = parsed.map((a: AdminAccount) => {
          // Upgrade password plaintext lama → hash
          if (!a.passwordHash && a.password) {
            migrated = true;
            const { password, ...rest } = a;
            return { ...rest, passwordHash: isHashed(password) ? password : hashPassword(password) };
          }
          return a;
        });
        if (migrated) writeLocal(list);
        return list;
      }
    }
  } catch (err) {
    console.error('[accountStore] Gagal membaca accounts.json:', err);
  }
  const init = initialAccounts();
  if (init.length) writeLocal(init);
  return init;
}

function writeLocal(accounts: AdminAccount[]): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('[accountStore] Gagal menulis accounts.json:', (err as Error).message);
    return false;
  }
}

// ---------------- API umum (async) ----------------
export async function listAccounts(): Promise<AdminAccount[]> {
  const mode = storageMode();
  if (mode === 'supabase') {
    const { data, error } = await supabase!.from(TABLE).select('*').order('created_at', { ascending: true });
    if (error) {
      // Tabel belum dibuat → fallback ke lokal, jangan crash
      const isTableMissing =
        error.code === '42P01' ||
        error.message.includes('does not exist') ||
        error.message.includes('schema cache') ||
        error.code === 'PGRST116' ||
        error.message.includes('relation');
      if (isTableMissing) {
        console.warn(
          '[accountStore] Tabel admin_accounts belum ada di Supabase.\n' +
          'Jalankan script di: Supabase Dashboard → SQL Editor → salin dari supabase/schema.sql (bagian 9).\n' +
          'Sementara ini menggunakan penyimpanan lokal (data/accounts.json).'
        );
        return readLocal();
      }
      throw new Error(`Gagal memuat akun dari Supabase: ${error.message}`);
    }
    if (data && data.length) return data.map(fromRow);
    const init = initialAccounts();
    if (init.length) await supabase!.from(TABLE).insert(init.map(toRow));
    return init;
  }
  if (mode === 'mysql') {
    const pool = getMySqlPool()!;
    const [rows]: [any[], any] = await pool.query(`SELECT * FROM ${TABLE} ORDER BY created_at ASC`);
    if (rows.length) return rows.map(fromRow);
    const init = initialAccounts();
    for (const a of init) await insertRow(a);
    return init;
  }
  return readLocal();
}

async function insertRow(a: AdminAccount): Promise<void> {
  const mode = storageMode();
  if (mode === 'supabase') {
    const { error } = await supabase!.from(TABLE).insert([toRow(a)]);
    if (error) {
      const isTableMissing = error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache') || error.message.includes('relation');
      if (isTableMissing) { const list = readLocal(); list.push(a); writeLocal(list); return; }
      throw new Error(error.message);
    }
    return;
  }
  if (mode === 'mysql') {
    const r = toRow(a);
    await getMySqlPool()!.query(
      `INSERT INTO ${TABLE} (id, username, name, email, role, password_hash, is_active, created_at, last_login) VALUES (?,?,?,?,?,?,?,?,?)`,
      [r.id, r.username, r.name, r.email, r.role, r.password_hash, r.is_active ? 1 : 0, new Date(r.created_at), r.last_login ? new Date(r.last_login) : null]
    );
    return;
  }
  const list = readLocal();
  list.push(a);
  if (!writeLocal(list)) throw new Error('Penyimpanan akun lokal tidak bisa ditulis. Hubungkan database (Supabase/MySQL).');
}

async function updateRow(a: AdminAccount): Promise<void> {
  const mode = storageMode();
  if (mode === 'supabase') {
    const { error } = await supabase!.from(TABLE).update(toRow(a)).eq('id', a.id);
    if (error) {
      const isTableMissing = error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('schema cache') || error.message.includes('relation');
      if (isTableMissing) { const list = readLocal().map((x) => (x.id === a.id ? a : x)); writeLocal(list); return; }
      throw new Error(error.message);
    }
    return;
  }
  if (mode === 'mysql') {
    const r = toRow(a);
    await getMySqlPool()!.query(
      `UPDATE ${TABLE} SET username=?, name=?, email=?, role=?, password_hash=?, is_active=?, last_login=? WHERE id=?`,
      [r.username, r.name, r.email, r.role, r.password_hash, r.is_active ? 1 : 0, r.last_login ? new Date(r.last_login) : null, r.id]
    );
    return;
  }
  const list = readLocal().map((x) => (x.id === a.id ? a : x));
  if (!writeLocal(list)) throw new Error('Penyimpanan akun lokal tidak bisa ditulis. Hubungkan database (Supabase/MySQL).');
}

async function deleteRow(id: string): Promise<void> {
  const mode = storageMode();
  if (mode === 'supabase') {
    const { error } = await supabase!.from(TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
    return;
  }
  if (mode === 'mysql') {
    await getMySqlPool()!.query(`DELETE FROM ${TABLE} WHERE id=?`, [id]);
    return;
  }
  if (!writeLocal(readLocal().filter((x) => x.id !== id))) throw new Error('Penyimpanan akun lokal tidak bisa ditulis.');
}

/** Otentikasi username/email + password. Mengembalikan akun & penanda password lemah. */
export async function authenticateUser(identifier: string, pass: string): Promise<{ account: AdminAccount; weakPassword: boolean } | null> {
  const accounts = await listAccounts();
  const lower = identifier.trim().toLowerCase();
  const acc = accounts.find((a) => a.username.toLowerCase() === lower || a.email.toLowerCase() === lower);
  if (!acc) return null;

  const stored = acc.passwordHash || acc.password;
  if (!verifyPassword(pass, stored)) return null;

  const updated: AdminAccount = {
    ...acc,
    passwordHash: isHashed(stored) ? stored : hashPassword(pass),
    lastLogin: new Date().toISOString(),
  };
  delete updated.password;
  try {
    await updateRow(updated);
  } catch {
    /* gagal catat last login tidak boleh menggagalkan login */
  }
  return { account: updated, weakPassword: KNOWN_WEAK_PASSWORDS.includes(pass.toLowerCase()) };
}

export async function getSafeAccounts(): Promise<SafeAccount[]> {
  return (await listAccounts()).map(toSafe);
}

export async function createAccount(data: {
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}): Promise<{ success: boolean; error?: string; account?: SafeAccount }> {
  const pwErr = validateNewPassword(data.password);
  if (pwErr) return { success: false, error: pwErr };
  if (!/^[a-zA-Z0-9._-]{3,32}$/.test(data.username.trim())) {
    return { success: false, error: 'Username 3–32 karakter: huruf, angka, titik, strip, atau garis bawah.' };
  }

  const accounts = await listAccounts();
  const lowerUser = data.username.trim().toLowerCase();
  const lowerEmail = data.email.trim().toLowerCase();
  if (accounts.some((a) => a.username.toLowerCase() === lowerUser)) return { success: false, error: 'Username sudah digunakan oleh akun lain!' };
  if (accounts.some((a) => a.email.toLowerCase() === lowerEmail)) return { success: false, error: 'Email sudah terdaftar!' };

  const acc: AdminAccount = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    username: data.username.trim(),
    name: data.name.trim() || data.username.trim(),
    email: data.email.trim(),
    role: data.role === 'SUPERUSER' ? 'SUPERUSER' : 'ADMIN',
    passwordHash: hashPassword(data.password),
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  await insertRow(acc);
  return { success: true, account: toSafe(acc) };
}

export async function updateAccount(
  id: string,
  updates: Partial<Omit<AdminAccount, 'id' | 'createdAt'>>
): Promise<{ success: boolean; error?: string; account?: SafeAccount }> {
  const accounts = await listAccounts();
  const existing = accounts.find((a) => a.id === id);
  if (!existing) return { success: false, error: 'Akun tidak ditemukan!' };

  if (existing.role === 'SUPERUSER' && (updates.role === 'ADMIN' || updates.isActive === false)) {
    const activeSupers = accounts.filter((a) => a.role === 'SUPERUSER' && a.isActive);
    if (activeSupers.length <= 1) {
      return { success: false, error: 'Tidak dapat mengubah role atau menonaktifkan Superuser terakhir sistem!' };
    }
  }
  if (updates.username && updates.username.toLowerCase() !== existing.username.toLowerCase()) {
    if (accounts.some((a) => a.id !== id && a.username.toLowerCase() === updates.username!.toLowerCase())) {
      return { success: false, error: 'Username baru sudah dipakai!' };
    }
  }
  if (updates.email && updates.email.toLowerCase() !== existing.email.toLowerCase()) {
    if (accounts.some((a) => a.id !== id && a.email.toLowerCase() === updates.email!.toLowerCase())) {
      return { success: false, error: 'Email baru sudah dipakai!' };
    }
  }

  let passwordHash = existing.passwordHash || (existing.password ? hashPassword(existing.password) : undefined);
  if (updates.password?.trim()) {
    const pwErr = validateNewPassword(updates.password.trim());
    if (pwErr) return { success: false, error: pwErr };
    passwordHash = hashPassword(updates.password.trim());
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _p, passwordHash: _h, ...safeUpdates } = updates;
  const merged: AdminAccount = {
    ...existing,
    ...safeUpdates,
    role: safeUpdates.role === 'SUPERUSER' ? 'SUPERUSER' : safeUpdates.role === 'ADMIN' ? 'ADMIN' : existing.role,
    passwordHash,
  };
  delete merged.password;
  await updateRow(merged);
  return { success: true, account: toSafe(merged) };
}

export async function deleteAccount(id: string): Promise<{ success: boolean; error?: string }> {
  const accounts = await listAccounts();
  const target = accounts.find((a) => a.id === id);
  if (!target) return { success: false, error: 'Akun tidak ditemukan!' };
  if (target.role === 'SUPERUSER' && accounts.filter((a) => a.role === 'SUPERUSER').length <= 1) {
    return { success: false, error: 'Sistem harus memiliki minimal 1 akun Superuser!' };
  }
  await deleteRow(id);
  return { success: true };
}

export async function findAccountById(id: string): Promise<AdminAccount | undefined> {
  return (await listAccounts()).find((a) => a.id === id);
}
