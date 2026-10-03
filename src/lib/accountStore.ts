import fs from 'fs';
import path from 'path';
import { AdminAccount, UserRole } from '@/types/account';

const DATA_DIR = path.join(process.cwd(), 'data');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');

const INITIAL_ACCOUNTS: AdminAccount[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    name: 'Admin Basecamp',
    email: 'admin@merapijeep.com',
    role: 'ADMIN',
    password: 'admin123',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-superuser-2',
    username: 'superuser',
    name: 'Superuser Eksekutif',
    email: 'super@merapijeep.com',
    role: 'SUPERUSER',
    password: 'admin123',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr-staff-3',
    username: 'staff',
    name: 'Staf Operasional',
    email: 'staff@merapijeep.com',
    role: 'ADMIN',
    password: 'staff123',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

function ensureDirExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function readAccounts(): AdminAccount[] {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const raw = fs.readFileSync(ACCOUNTS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading accounts file:', err);
  }

  // Fallback & write initial accounts
  try {
    ensureDirExists();
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(INITIAL_ACCOUNTS, null, 2), 'utf-8');
  } catch {}

  return INITIAL_ACCOUNTS;
}

export function writeAccounts(accounts: AdminAccount[]): boolean {
  try {
    ensureDirExists();
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing accounts file:', err);
    return false;
  }
}

/** Otentikasi username/email & password */
export function authenticateUser(identifier: string, pass: string): AdminAccount | null {
  const accounts = readAccounts();
  const lower = identifier.trim().toLowerCase();
  
  const user = accounts.find(
    (acc) =>
      acc.isActive &&
      (acc.username.toLowerCase() === lower || acc.email.toLowerCase() === lower) &&
      acc.password === pass
  );

  if (user) {
    // Catat last login
    user.lastLogin = new Date().toISOString();
    writeAccounts(accounts);
    return user;
  }

  return null;
}

/** Dapatkan semua user (password disembunyikan/dikosongkan untuk API response) */
export function getSafeAccounts(): Omit<AdminAccount, 'password'>[] {
  const accounts = readAccounts();
  return accounts.map(({ password: _, ...rest }) => rest);
}

/** Tambah akun baru */
export function createAccount(data: {
  username: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}): { success: boolean; error?: string; account?: Omit<AdminAccount, 'password'> } {
  const accounts = readAccounts();
  const lowerUser = data.username.trim().toLowerCase();
  const lowerEmail = data.email.trim().toLowerCase();

  if (accounts.some((a) => a.username.toLowerCase() === lowerUser)) {
    return { success: false, error: 'Username sudah digunakan oleh akun lain!' };
  }
  if (accounts.some((a) => a.email.toLowerCase() === lowerEmail)) {
    return { success: false, error: 'Email sudah terdaftar!' };
  }

  const newAcc: AdminAccount = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    username: data.username.trim(),
    name: data.name.trim() || data.username.trim(),
    email: data.email.trim(),
    role: data.role || 'ADMIN',
    password: data.password || 'password123',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  accounts.push(newAcc);
  writeAccounts(accounts);

  const { password: _, ...safe } = newAcc;
  return { success: true, account: safe };
}

/** Update akun */
export function updateAccount(
  id: string,
  updates: Partial<Omit<AdminAccount, 'id' | 'createdAt'>>
): { success: boolean; error?: string; account?: Omit<AdminAccount, 'password'> } {
  const accounts = readAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx === -1) {
    return { success: false, error: 'Akun tidak ditemukan!' };
  }

  const existing = accounts[idx];

  // Cegah mengubah role/menonaktifkan Superuser terakhir
  if (existing.role === 'SUPERUSER' && (updates.role === 'ADMIN' || updates.isActive === false)) {
    const superusers = accounts.filter((a) => a.role === 'SUPERUSER' && a.isActive);
    if (superusers.length <= 1) {
      return {
        success: false,
        error: 'Tidak dapat mengubah role atau menonaktifkan Superuser terakhir sistem!',
      };
    }
  }

  // Cek duplikasi username/email bila diganti
  if (updates.username && updates.username.toLowerCase() !== existing.username.toLowerCase()) {
    const exists = accounts.some(
      (a) => a.id !== id && a.username.toLowerCase() === updates.username!.toLowerCase()
    );
    if (exists) return { success: false, error: 'Username baru sudah dipakai!' };
  }

  if (updates.email && updates.email.toLowerCase() !== existing.email.toLowerCase()) {
    const exists = accounts.some(
      (a) => a.id !== id && a.email.toLowerCase() === updates.email!.toLowerCase()
    );
    if (exists) return { success: false, error: 'Email baru sudah dipakai!' };
  }

  accounts[idx] = {
    ...existing,
    ...updates,
    // Jangan overwrite password jika kosong
    password: updates.password?.trim() ? updates.password.trim() : existing.password,
  };

  writeAccounts(accounts);
  const { password: _, ...safe } = accounts[idx];
  return { success: true, account: safe };
}

/** Hapus akun */
export function deleteAccount(id: string): { success: boolean; error?: string } {
  const accounts = readAccounts();
  const target = accounts.find((a) => a.id === id);
  if (!target) {
    return { success: false, error: 'Akun tidak ditemukan!' };
  }

  // Cegah menghapus Superuser terakhir
  if (target.role === 'SUPERUSER') {
    const superusers = accounts.filter((a) => a.role === 'SUPERUSER');
    if (superusers.length <= 1) {
      return { success: false, error: 'Sistem harus memiliki minimal 1 akun Superuser!' };
    }
  }

  const filtered = accounts.filter((a) => a.id !== id);
  writeAccounts(filtered);
  return { success: true };
}
