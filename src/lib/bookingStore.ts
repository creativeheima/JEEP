import fs from 'fs';
import path from 'path';
import { Booking } from '@/types/booking';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'bookings.json');

const INITIAL_BOOKINGS: Booking[] = [
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
  },
  {
    id: 'bkg-3',
    bookingCode: 'MJA-2026-003',
    customerName: 'Dimas Anggoro',
    customerPhone: '087899988776',
    packageName: 'Paket Long',
    tourDate: '2026-10-04',
    tourTime: '13:30 WIB',
    paxCount: 3,
    jeepCount: 1,
    totalAmount: 600000,
    dpAmount: 200000,
    remainingAmount: 400000,
    paymentMethod: 'Transfer Mandiri',
    paymentStatus: 'DP_DITERIMA',
    approvalStatus: 'APPROVED',
    driverName: 'Mas Yanto',
    jeepNumber: 'AB 8812 ZQ',
    notes: 'Deal via WA kemarin sore',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    approvedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  }
];

function ensureDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getBookings(): Booking[] {
  ensureDirectory();
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_BOOKINGS, null, 2), 'utf8');
    return INITIAL_BOOKINGS;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return INITIAL_BOOKINGS;
  }
}

export function saveBookings(bookings: Booking[]) {
  ensureDirectory();
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), 'utf8');
}

export function getBookingByCode(code: string): Booking | undefined {
  const bookings = getBookings();
  const search = code.trim().toLowerCase();
  return bookings.find(
    b => b.bookingCode.toLowerCase() === search || b.id.toLowerCase() === search
  );
}

export function generateBookingCode(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const year = now.getFullYear();
  return `MJA-${year}-${randomNum}`;
}
