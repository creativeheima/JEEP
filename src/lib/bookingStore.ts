import fs from 'fs';
import path from 'path';
import { Booking } from '@/types/booking';
import { supabase, isSupabaseConfigured } from './supabase';

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

/**
 * Penulisan file lokal dibuat "aman": di hosting serverless (Vercel, Netlify, dll.)
 * folder project bersifat READ-ONLY, sehingga writeFileSync akan error (EROFS).
 * Error itu sebelumnya membuat seluruh proses booking gagal walau Supabase sukses.
 */
function ensureDirectory(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

/** Tulis cache lokal; kembalikan false (bukan throw) bila filesystem tidak bisa ditulis. */
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
// HELPER: Konversi format model TypeScript <-> Supabase DB Row
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
    driver_name: booking.driverName || 'Menunggu Penugasan Driver',
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
    paymentMethod: String(row.payment_method || 'Transfer Bank'),
    paymentStatus: row.payment_status || 'MENUNGGU_PEMBAYARAN',
    approvalStatus: row.approval_status || 'PENDING',
    driverName: row.driver_name || 'Menunggu Penugasan Driver',
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
// ASYNC DATABASE OPERATIONS (Supabase with Local Fallback)
// -------------------------------------------------------------
export async function fetchAllBookings(): Promise<Booking[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error, fallback to local:', error.message);
        return getBookings();
      }

      if (data && data.length > 0) {
        return data.map(fromDatabaseRow);
      }
    } catch (err) {
      console.error('Supabase exception, fallback to local:', err);
    }
  }
  return getBookings();
}

export async function fetchSingleBooking(idOrCode: string): Promise<Booking | null> {
  const search = idOrCode.trim();
  if (isSupabaseConfigured() && supabase) {
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

  const local = getBookingByCode(search);
  return local || null;
}

export async function insertNewBooking(booking: Booking): Promise<Booking> {
  let supabaseError = '';

  if (isSupabaseConfigured() && supabase) {
    // Coba hingga 3x bila kode booking kebetulan bentrok (kolom booking_code unik)
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const row = toDatabaseRow(booking);
        const { data, error } = await supabase.from('bookings').insert([row]).select().single();

        if (!error && data) {
          const saved = fromDatabaseRow(data);
          // Cache lokal hanya pelengkap — gagal pun tidak masalah
          const local = getBookings();
          local.unshift(saved);
          tryWriteLocal(local);
          return saved;
        }

        supabaseError = error?.message || 'Unknown Supabase error';
        const isDuplicate = error?.code === '23505' || /duplicate key/i.test(supabaseError);
        if (isDuplicate) {
          booking = { ...booking, bookingCode: generateBookingCode(), id: `bkg-${Date.now()}-${attempt + 1}` };
          continue;
        }
        console.error('[bookingStore] Supabase insert error:', supabaseError);
        break;
      } catch (err) {
        supabaseError = (err as Error).message;
        console.error('[bookingStore] Supabase insert exception:', supabaseError);
        break;
      }
    }
  }

  // Fallback: simpan ke file lokal (berfungsi saat development / server biasa)
  const bookings = getBookings();
  bookings.unshift(booking);
  if (tryWriteLocal(bookings)) return booking;

  // Supabase gagal DAN file tidak bisa ditulis → beri pesan yang jelas
  throw new Error(
    supabaseError
      ? `Database menolak data: ${supabaseError}`
      : 'Penyimpanan belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL & kunci Supabase di environment hosting.'
  );
}

export async function updateExistingBooking(
  idOrCode: string,
  updates: Partial<Booking>
): Promise<Booking | null> {
  const search = idOrCode.trim();

  if (isSupabaseConfigured() && supabase) {
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
        // Sync local
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

  // Local fallback
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
  const search = idOrCode.trim();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .or(`booking_code.eq.${search},id.eq.${search}`);

      if (!error) {
        let local = getBookings();
        local = local.filter(
          b => b.id.toLowerCase() !== search.toLowerCase() && b.bookingCode.toLowerCase() !== search.toLowerCase()
        );
        saveBookings(local);
        return true;
      }
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

export function generateBookingCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const year = now.getFullYear();
  return `MJA-${year}-${randomNum}`;
}
