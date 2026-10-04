import fs from 'fs';
import path from 'path';
import { Booking } from '@/types/booking';
import { supabase, isSupabaseConfigured } from './supabase';
import { getDbConfig } from './dbConfig';
import { getMySqlPool } from './mysql';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-client-1',
    bookingCode: 'MJA-2026-088',
    customerName: 'Ahmad Fauzi & Rombongan',
    customerPhone: '081298765432',
    packageName: 'Paket Sunrise',
    tourDate: '2026-10-05',
    tourTime: '04:30 WIB',
    paxCount: 6,
    jeepCount: 2,
    totalAmount: 1100000,
    dpAmount: 0,
    remainingAmount: 1100000,
    paymentMethod: 'Transfer BCA',
    paymentStatus: 'MENUNGGU_PEMBAYARAN',
    approvalStatus: 'PENDING',
    driverName: 'Belum Ditugaskan',
    jeepNumber: '-',
    notes: 'Sudah chat di WA, menanyakan kesiapan armada fajar dan mau transfer DP 300rb',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'bkg-client-2',
    bookingCode: 'MJA-2026-089',
    customerName: 'Clarissa Natalia',
    customerPhone: '082133445566',
    packageName: 'Paket Medium',
    tourDate: '2026-10-06',
    tourTime: '10:00 WIB',
    paxCount: 4,
    jeepCount: 1,
    totalAmount: 500000,
    dpAmount: 0,
    remainingAmount: 500000,
    paymentMethod: 'QRIS',
    paymentStatus: 'MENUNGGU_PEMBAYARAN',
    approvalStatus: 'PENDING',
    driverName: 'Belum Ditugaskan',
    jeepNumber: '-',
    notes: 'Input lewat web, minta info nomor rekening untuk DP',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'bkg-1',
    bookingCode: 'MJA-2026-001',
    customerName: 'Bagus Pratama',
    customerPhone: '081234567891',
    packageName: 'Paket Medium',
    tourDate: '2026-10-02',
    tourTime: '09:00 WIB',
    paxCount: 4,
    jeepCount: 1,
    totalAmount: 500000,
    dpAmount: 150000,
    remainingAmount: 350000,
    paymentMethod: 'Transfer BCA',
    paymentStatus: 'DP_DITERIMA',
    approvalStatus: 'APPROVED',
    driverName: 'Mas Agus (Unit 12)',
    jeepNumber: 'AB 1928 MJ',
    notes: 'Minta foto cinematic di Kali Kuning',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'bkg-2',
    bookingCode: 'MJA-2026-002',
    customerName: 'Siti Rahmawati',
    customerPhone: '085712345678',
    packageName: 'Paket Sunrise',
    tourDate: '2026-10-03',
    tourTime: '04:30 WIB',
    paxCount: 8,
    jeepCount: 2,
    totalAmount: 1100000,
    dpAmount: 1100000,
    remainingAmount: 0,
    paymentMethod: 'QRIS',
    paymentStatus: 'LUNAS',
    approvalStatus: 'APPROVED',
    driverName: 'Pak Doni & Mas Eko',
    jeepNumber: 'AB 4421 KP & AB 3310 MX',
    notes: 'Keluarga dari Jakarta, bawa anak-anak',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 11).toISOString(),
  }
];

function ensureDirectory(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function tryWriteLocal(bookings: Booking[]): boolean {
  try {
    if (!ensureDirectory()) return false;
    fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[bookingStore] Tidak bisa menulis data/bookings.json:', (err as Error).message);
    return false;
  }
}

// -------------------------------------------------------------
// HELPER: Konversi format model TypeScript <-> DB Row
// -------------------------------------------------------------
function toDatabaseRow(booking: Booking) {
  return {
    id: booking.id,
    booking_code: booking.bookingCode,
    customer_name: booking.customerName,
    customer_phone: booking.customerPhone,
    package_name: booking.packageName,
    tour_date: booking.tourDate,
    tour_time: booking.tourTime,
    pax_count: booking.paxCount,
    jeep_count: booking.jeepCount,
    total_amount: booking.totalAmount,
    dp_amount: booking.dpAmount,
    remaining_amount: booking.remainingAmount,
    payment_method: booking.paymentMethod,
    payment_status: booking.paymentStatus,
    approval_status: booking.approvalStatus,
    driver_name: booking.driverName || 'Belum Ditugaskan',
    jeep_number: booking.jeepNumber || '-',
    notes: booking.notes || '',
    created_at: booking.createdAt,
    approved_at: booking.approvedAt || null,
  };
}

function fromDatabaseRow(row: Record<string, any>): Booking {
  return {
    id: String(row.id),
    bookingCode: String(row.booking_code),
    customerName: String(row.customer_name),
    customerPhone: String(row.customer_phone),
    packageName: String(row.package_name),
    tourDate: String(row.tour_date),
    tourTime: String(row.tour_time),
    paxCount: Number(row.pax_count) || 1,
    jeepCount: Number(row.jeep_count) || 1,
    totalAmount: Number(row.total_amount) || 0,
    dpAmount: Number(row.dp_amount) || 0,
    remainingAmount: Number(row.remaining_amount) || 0,
    paymentMethod: String(row.payment_method || 'Transfer BCA'),
    paymentStatus: row.payment_status || 'MENUNGGU_PEMBAYARAN',
    approvalStatus: row.approval_status || 'PENDING',
    driverName: row.driver_name || 'Belum Ditugaskan',
    jeepNumber: row.jeep_number || '-',
    notes: row.notes || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    approvedAt: row.approved_at ? new Date(row.approved_at).toISOString() : undefined,
  };
}

// -------------------------------------------------------------
// LOCAL FALLBACK OPERATIONS
// -------------------------------------------------------------
export function getBookings(): Booking[] {
  if (!fs.existsSync(DATA_FILE)) {
    tryWriteLocal(INITIAL_BOOKINGS);
    return [...INITIAL_BOOKINGS];
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBookings(bookings: Booking[]): boolean {
  return tryWriteLocal(bookings);
}

export function getBookingByCode(code: string): Booking | undefined {
  const bookings = getBookings();
  const search = code.trim().toLowerCase();
  return bookings.find(
    b => b.bookingCode.toLowerCase() === search || b.id.toLowerCase() === search
  );
}

// -------------------------------------------------------------
// ASYNC MULTI-DATABASE OPERATIONS (Supabase, MySQL, Local)
// -------------------------------------------------------------
/**
 * Bila database (MySQL/Supabase) aktif, hasilnya SELALU dari database — termasuk saat kosong.
 * Data file lokal hanya dipakai di mode "local" atau saat database belum dikonfigurasi,
 * supaya admin tidak melihat booking contoh/lama yang seolah-olah asli.
 */
export async function fetchAllBookings(): Promise<Booking[]> {
  const mode = getDbConfig().activeMode;

  if (mode === 'mysql') {
    const pool = getMySqlPool();
    if (pool) {
      const [rows]: [any[], any] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC');
      return Array.isArray(rows) ? rows.map(fromDatabaseRow) : [];
    }
  }

  if (mode === 'supabase' && isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(`Gagal membaca booking dari Supabase: ${error.message}`);
    return (data || []).map(fromDatabaseRow);
  }

  return getBookings();
}

/** Hanya izinkan karakter kode/ID yang wajar (mencegah injeksi filter query). */
function cleanId(v: string) {
  return v.trim().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 80);
}

export async function fetchSingleBooking(idOrCode: string): Promise<Booking | null> {
  const search = cleanId(idOrCode);
  if (!search) return null;
  const mode = getDbConfig().activeMode;

  // 1. MySQL Mode
  if (mode === 'mysql') {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const [rows]: [any[], any] = await pool.query(
          'SELECT * FROM bookings WHERE booking_code = ? OR id = ? LIMIT 1',
          [search, search]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          return fromDatabaseRow(rows[0]);
        }
      } catch (err: any) {
        console.error('MySQL fetchSingleBooking error:', err.message);
      }
    }
  }

  // 2. Supabase Mode
  if (mode === 'supabase' && isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .or(`booking_code.eq.${search},id.eq.${search}`)
        .maybeSingle();

      if (!error && data) {
        return fromDatabaseRow(data);
      }
    } catch (err) {
      console.error('Supabase fetchSingleBooking exception:', err);
    }
  }

  // File lokal hanya bila tidak memakai database
  if (mode === 'local' || (mode === 'supabase' && !isSupabaseConfigured()) || (mode === 'mysql' && !getMySqlPool())) {
    return getBookingByCode(search) || null;
  }
  return null;
}

export async function insertNewBooking(booking: Booking): Promise<Booking> {
  const mode = getDbConfig().activeMode;

  // 1. MySQL Mode
  if (mode === 'mysql') {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const row = toDatabaseRow(booking);
        const query = `
          INSERT INTO bookings (
            id, booking_code, customer_name, customer_phone, package_name,
            tour_date, tour_time, pax_count, jeep_count, total_amount,
            dp_amount, remaining_amount, payment_method, payment_status,
            approval_status, driver_name, jeep_number, notes, created_at, approved_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
          row.id,
          row.booking_code,
          row.customer_name,
          row.customer_phone,
          row.package_name,
          row.tour_date,
          row.tour_time,
          row.pax_count,
          row.jeep_count,
          row.total_amount,
          row.dp_amount,
          row.remaining_amount,
          row.payment_method,
          row.payment_status,
          row.approval_status,
          row.driver_name,
          row.jeep_number,
          row.notes,
          row.created_at ? new Date(row.created_at) : new Date(),
          row.approved_at ? new Date(row.approved_at) : null,
        ];
        await pool.query(query, values);
        
        // Simpan cache lokal juga
        const local = getBookings();
        local.unshift(booking);
        tryWriteLocal(local);
        return booking;
      } catch (err: any) {
        console.error('MySQL insertNewBooking error:', err.message);
        // Jangan diam-diam simpan ke file: admin tidak akan melihatnya di database
        throw new Error(`Database MySQL menolak data: ${err.message}`);
      }
    }
  }

  // 2. Supabase Mode
  if (mode === 'supabase' && isSupabaseConfigured() && supabase) {
    let lastError = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const row = toDatabaseRow(booking);
        const { data, error } = await supabase.from('bookings').insert([row]).select().single();

        if (!error && data) {
          const saved = fromDatabaseRow(data);
          const local = getBookings();
          local.unshift(saved);
          tryWriteLocal(local);
          return saved;
        }

        const supabaseError = error?.message || 'Unknown Supabase error';
        lastError = supabaseError;
        const isDuplicate = error?.code === '23505' || /duplicate key/i.test(supabaseError);
        if (isDuplicate) {
          booking = { ...booking, bookingCode: generateBookingCode(), id: `bkg-${Date.now()}-${attempt + 1}` };
          continue;
        }
        console.error('[bookingStore] Supabase insert error:', supabaseError);
        break;
      } catch (err) {
        lastError = (err as Error).message;
        console.error('[bookingStore] Supabase insert exception:', err);
        break;
      }
    }
    throw new Error(`Database menolak data: ${lastError || 'tidak diketahui'}`);
  }

  // 3. Mode lokal: simpan ke file (development / VPS)
  const bookings = getBookings();
  bookings.unshift(booking);
  if (tryWriteLocal(bookings)) return booking;
  throw new Error('Penyimpanan belum dikonfigurasi. Hubungkan database (Supabase/MySQL) di halaman Superuser atau isi environment hosting.');
}

export async function updateExistingBooking(
  idOrCode: string,
  updates: Partial<Booking>
): Promise<Booking | null> {
  const search = cleanId(idOrCode);
  if (!search) return null;
  const mode = getDbConfig().activeMode;

  // 1. MySQL Mode
  if (mode === 'mysql') {
    const pool = getMySqlPool();
    if (pool) {
      try {
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.customerName !== undefined) { fields.push('customer_name = ?'); values.push(updates.customerName); }
        if (updates.customerPhone !== undefined) { fields.push('customer_phone = ?'); values.push(updates.customerPhone); }
        if (updates.packageName !== undefined) { fields.push('package_name = ?'); values.push(updates.packageName); }
        if (updates.tourDate !== undefined) { fields.push('tour_date = ?'); values.push(updates.tourDate); }
        if (updates.tourTime !== undefined) { fields.push('tour_time = ?'); values.push(updates.tourTime); }
        if (updates.paxCount !== undefined) { fields.push('pax_count = ?'); values.push(updates.paxCount); }
        if (updates.jeepCount !== undefined) { fields.push('jeep_count = ?'); values.push(updates.jeepCount); }
        if (updates.totalAmount !== undefined) { fields.push('total_amount = ?'); values.push(updates.totalAmount); }
        if (updates.dpAmount !== undefined) { fields.push('dp_amount = ?'); values.push(updates.dpAmount); }
        if (updates.remainingAmount !== undefined) { fields.push('remaining_amount = ?'); values.push(updates.remainingAmount); }
        if (updates.paymentMethod !== undefined) { fields.push('payment_method = ?'); values.push(updates.paymentMethod); }
        if (updates.paymentStatus !== undefined) { fields.push('payment_status = ?'); values.push(updates.paymentStatus); }
        if (updates.approvalStatus !== undefined) { fields.push('approval_status = ?'); values.push(updates.approvalStatus); }
        if (updates.driverName !== undefined) { fields.push('driver_name = ?'); values.push(updates.driverName); }
        if (updates.jeepNumber !== undefined) { fields.push('jeep_number = ?'); values.push(updates.jeepNumber); }
        if (updates.notes !== undefined) { fields.push('notes = ?'); values.push(updates.notes); }
        if (updates.approvedAt !== undefined) {
          fields.push('approved_at = ?');
          values.push(updates.approvedAt ? new Date(updates.approvedAt) : null);
        }

        if (fields.length > 0) {
          values.push(search, search);
          await pool.query(
            `UPDATE bookings SET ${fields.join(', ')} WHERE booking_code = ? OR id = ?`,
            values
          );
        }
      } catch (err: any) {
        console.error('MySQL update error:', err.message);
      }
    }
  }

  // 2. Supabase Mode
  if (mode === 'supabase' && isSupabaseConfigured() && supabase) {
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.customerName !== undefined) dbUpdates.customer_name = updates.customerName;
      if (updates.customerPhone !== undefined) dbUpdates.customer_phone = updates.customerPhone;
      if (updates.packageName !== undefined) dbUpdates.package_name = updates.packageName;
      if (updates.tourDate !== undefined) dbUpdates.tour_date = updates.tourDate;
      if (updates.tourTime !== undefined) dbUpdates.tour_time = updates.tourTime;
      if (updates.paxCount !== undefined) dbUpdates.pax_count = updates.paxCount;
      if (updates.jeepCount !== undefined) dbUpdates.jeep_count = updates.jeepCount;
      if (updates.totalAmount !== undefined) dbUpdates.total_amount = updates.totalAmount;
      if (updates.dpAmount !== undefined) dbUpdates.dp_amount = updates.dpAmount;
      if (updates.remainingAmount !== undefined) dbUpdates.remaining_amount = updates.remainingAmount;
      if (updates.paymentMethod !== undefined) dbUpdates.payment_method = updates.paymentMethod;
      if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
      if (updates.approvalStatus !== undefined) dbUpdates.approval_status = updates.approvalStatus;
      if (updates.driverName !== undefined) dbUpdates.driver_name = updates.driverName;
      if (updates.jeepNumber !== undefined) dbUpdates.jeep_number = updates.jeepNumber;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.approvedAt !== undefined) dbUpdates.approved_at = updates.approvedAt;

      const { data, error } = await supabase
        .from('bookings')
        .update(dbUpdates)
        .or(`booking_code.eq.${search},id.eq.${search}`)
        .select()
        .single();

      if (!error && data) {
        const result = fromDatabaseRow(data);
        const localList = getBookings();
        const idx = localList.findIndex(
          b => b.id.toLowerCase() === search.toLowerCase() || b.bookingCode.toLowerCase() === search.toLowerCase()
        );
        if (idx !== -1) {
          localList[idx] = result;
          saveBookings(localList);
        }
        return result;
      }
    } catch (err) {
      console.error('Supabase update exception:', err);
    }
  }

  // 3. Local fallback
  const localList = getBookings();
  const idx = localList.findIndex(
    b => b.id.toLowerCase() === search.toLowerCase() || b.bookingCode.toLowerCase() === search.toLowerCase()
  );
  if (idx === -1) return null;

  const current = localList[idx];
  const updated: Booking = { ...current, ...updates };
  localList[idx] = updated;
  saveBookings(localList);
  return updated;
}

export async function deleteExistingBooking(idOrCode: string): Promise<boolean> {
  const search = cleanId(idOrCode);
  if (!search) return false;
  const mode = getDbConfig().activeMode;

  // 1. MySQL Mode
  if (mode === 'mysql') {
    const pool = getMySqlPool();
    if (pool) {
      try {
        await pool.query('DELETE FROM bookings WHERE booking_code = ? OR id = ?', [search, search]);
      } catch (err: any) {
        console.error('MySQL delete error:', err.message);
      }
    }
  }

  // 2. Supabase Mode
  if (mode === 'supabase' && isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('bookings')
        .delete()
        .or(`booking_code.eq.${search},id.eq.${search}`);
    } catch (err) {
      console.error('Supabase delete exception:', err);
    }
  }

  let local = getBookings();
  const initialLen = local.length;
  local = local.filter(
    b => b.id.toLowerCase() !== search.toLowerCase() && b.bookingCode.toLowerCase() !== search.toLowerCase()
  );
  if (local.length === initialLen) return false;
  saveBookings(local);
  return true;
}

/** Kode booking acak 6 karakter (tanpa huruf/angka yang mirip) → sulit ditebak orang lain. */
export function generateBookingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  const rand = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `MJA-${new Date().getFullYear()}-${rand}`;
}
