import { NextResponse } from 'next/server';
import { 
  fetchAllBookings, 
  insertNewBooking, 
  generateBookingCode 
} from '@/lib/bookingStore';
import { Booking } from '@/types/booking';
import { getSessionFromRequest } from '@/lib/session';
import { requireSession } from '@/lib/apiAuth';
import { getAllPackages } from '@/lib/packageStore';
import { defaultPackagesData } from '@/lib/defaultPackages';

// Batas kirim booking publik per IP (anti-spam sederhana, in-memory)
const submits = new Map<string, number[]>();
const MAX_SUBMITS = 5;
const SUBMIT_WINDOW_MS = 10 * 60 * 1000;

function clientIp(request: Request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim() || request.headers.get('x-real-ip') || 'local';
}

/** Harga per jeep dihitung di server dari data paket (bukan dari kiriman browser). */
function unitPriceFor(packageName: string): number {
  let list = defaultPackagesData;
  try {
    const stored = getAllPackages();
    if (stored.length) list = stored;
  } catch {
    /* pakai data bawaan */
  }
  const pkg = list.find((p) => p.title.toLowerCase() === packageName.toLowerCase());
  const n = pkg ? Number(String(pkg.price).replace(/[^\d]/g, '')) : 0;
  return n > 0 ? n : 500000;
}

function todayJakarta(): string {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().split('T')[0];
}

export async function GET(request: Request) {
  const auth = await requireSession(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';

    let list = await fetchAllBookings();

    if (search) {
      list = list.filter(b => 
        b.customerName.toLowerCase().includes(search) ||
        b.customerPhone.includes(search) ||
        b.bookingCode.toLowerCase().includes(search)
      );
    }

    if (status) {
      list = list.filter(b => b.approvalStatus === status || b.paymentStatus === status);
    }

    // Sort by newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    const message = error instanceof Error ? error.message : 'Gagal mengambil data booking';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    let body: Record<string, any>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Format data tidak valid' }, { status: 400 });
    }

    const name = String(body.customerName || '').trim();
    const phoneDigits = String(body.customerPhone || '').replace(/[^\d+]/g, '');
    if (!name || !phoneDigits) {
      return NextResponse.json({ success: false, error: 'Nama dan Nomor WhatsApp wajib diisi' }, { status: 400 });
    }
    if (phoneDigits.replace('+', '').length < 9) {
      return NextResponse.json({ success: false, error: 'Nomor WhatsApp tidak valid' }, { status: 400 });
    }

    const session = await getSessionFromRequest(request);
    const isAdmin = !!session;

    if (!isAdmin) {
      // Honeypot: field tersembunyi yang hanya diisi bot
      if (String(body.website || '').trim()) {
        return NextResponse.json({ success: false, error: 'Permintaan ditolak' }, { status: 400 });
      }
      const ip = clientIp(request);
      const now = Date.now();
      const recent = (submits.get(ip) || []).filter((t) => now - t < SUBMIT_WINDOW_MS);
      if (recent.length >= MAX_SUBMITS) {
        return NextResponse.json(
          { success: false, error: 'Terlalu banyak pengajuan dalam waktu singkat. Coba lagi beberapa menit lagi atau hubungi kami via WhatsApp.' },
          { status: 429 }
        );
      }
      recent.push(now);
      submits.set(ip, recent);
    }

    if (name.length > 100) {
      return NextResponse.json({ success: false, error: 'Nama terlalu panjang' }, { status: 400 });
    }
    const pax = Math.min(80, Math.max(1, Math.round(Number(body.paxCount) || 4)));
    const jeep = Math.min(20, Math.max(1, Math.round(Number(body.jeepCount) || Math.ceil(pax / 4))));
    const packageName = String(body.packageName || 'Paket Medium').slice(0, 100);
    const tourDate = /^\d{4}-\d{2}-\d{2}$/.test(String(body.tourDate || '')) ? String(body.tourDate) : todayJakarta();
    if (!isAdmin && tourDate < todayJakarta()) {
      return NextResponse.json({ success: false, error: 'Tanggal tur tidak boleh di masa lalu' }, { status: 400 });
    }

    const estimate = unitPriceFor(packageName) * jeep;

    // Pengunjung publik: status selalu PENDING, harga dari server, tanpa field khusus admin
    const total = isAdmin && body.totalAmount !== undefined ? Math.max(0, Number(body.totalAmount) || 0) : estimate;
    const dp = isAdmin ? Math.max(0, Number(body.dpAmount) || 0) : 0;
    const remaining = Math.max(0, total - dp);
    const isPending = !isAdmin || body.approvalStatus === 'PENDING' || body.isClientSubmission === true;

    const newBooking: Booking = {
      id: 'bkg-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      bookingCode: generateBookingCode(),
      customerName: name,
      customerPhone: phoneDigits,
      packageName,
      tourDate,
      tourTime: String(body.tourTime || '09:00 WIB').slice(0, 30),
      paxCount: pax,
      jeepCount: jeep,
      totalAmount: total,
      dpAmount: dp,
      remainingAmount: remaining,
      paymentMethod: isAdmin ? String(body.paymentMethod || 'Transfer BCA / Bank').slice(0, 60) : 'Transfer BCA / Bank',
      paymentStatus: isPending
        ? 'MENUNGGU_PEMBAYARAN'
        : (remaining === 0 ? 'LUNAS' : (dp > 0 ? 'DP_DITERIMA' : 'MENUNGGU_PEMBAYARAN')),
      approvalStatus: isPending ? 'PENDING' : 'APPROVED',
      driverName: isAdmin ? String(body.driverName || 'Menunggu Penugasan Driver').slice(0, 100) : 'Menunggu Penugasan Driver',
      jeepNumber: isAdmin ? String(body.jeepNumber || '-').slice(0, 60) : '-',
      notes: String(body.notes || '').slice(0, 1000),
      createdAt: new Date().toISOString(),
      approvedAt: isPending ? undefined : new Date().toISOString(),
    };

    const savedBooking = await insertNewBooking(newBooking);

    return NextResponse.json({ success: true, data: savedBooking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    const message = error instanceof Error ? error.message : 'Gagal menyimpan reservasi';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
