import { NextResponse } from 'next/server';
import { getBookings, saveBookings, generateBookingCode } from '@/lib/bookingStore';
import { Booking } from '@/types/booking';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') || '';

    let list = getBookings();

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
    return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json({ success: false, error: 'Nama dan Nomor WhatsApp wajib diisi' }, { status: 400 });
    }

    const pax = Number(body.paxCount) || 4;
    const jeep = Number(body.jeepCount) || Math.ceil(pax / 4);

    // Default estimate pricing if not yet set by admin
    let defaultPrice = 500000 * jeep;
    if (body.packageName?.includes('Short')) defaultPrice = 400000 * jeep;
    if (body.packageName?.includes('Long')) defaultPrice = 600000 * jeep;
    if (body.packageName?.includes('Sunrise')) defaultPrice = 550000 * jeep;

    const total = body.totalAmount !== undefined ? Number(body.totalAmount) : defaultPrice;
    const dp = Number(body.dpAmount) || 0;
    const remaining = Math.max(0, total - dp);

    const isPending = body.approvalStatus === 'PENDING' || body.isClientSubmission === true;

    const newBooking: Booking = {
      id: 'bkg-' + Date.now(),
      bookingCode: generateBookingCode(),
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone.trim(),
      packageName: body.packageName || 'Paket Medium',
      tourDate: body.tourDate || new Date().toISOString().split('T')[0],
      tourTime: body.tourTime || '09:00 WIB',
      paxCount: pax,
      jeepCount: jeep,
      totalAmount: total,
      dpAmount: dp,
      remainingAmount: remaining,
      paymentMethod: body.paymentMethod || 'Transfer BCA / Bank',
      paymentStatus: isPending
        ? 'MENUNGGU_PEMBAYARAN'
        : (remaining === 0 ? 'LUNAS' : (dp > 0 ? 'DP_DITERIMA' : 'MENUNGGU_PEMBAYARAN')),
      approvalStatus: isPending ? 'PENDING' : 'APPROVED',
      driverName: body.driverName || 'Menunggu Penugasan Driver',
      jeepNumber: body.jeepNumber || '-',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      approvedAt: isPending ? undefined : new Date().toISOString(),
    };

    const bookings = getBookings();
    bookings.unshift(newBooking);
    saveBookings(bookings);

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
  }
}
