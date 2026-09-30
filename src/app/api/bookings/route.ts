import { NextResponse } from 'next/server';
import { getBookings, saveBookings, generateBookingCode } from '@/lib/bookingStore';
import { Booking, CreateBookingInput } from '@/types/booking';

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
    const body: CreateBookingInput = await request.json();

    if (!body.customerName || !body.customerPhone) {
      return NextResponse.json({ success: false, error: 'Nama dan Nomor HP wajib diisi' }, { status: 400 });
    }

    const total = Number(body.totalAmount) || 0;
    const dp = Number(body.dpAmount) || 0;
    const remaining = Math.max(0, total - dp);

    const newBooking: Booking = {
      id: 'bkg-' + Date.now(),
      bookingCode: generateBookingCode(),
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone.trim(),
      packageName: body.packageName || 'Paket Medium',
      tourDate: body.tourDate || new Date().toISOString().split('T')[0],
      tourTime: body.tourTime || '09:00 WIB',
      paxCount: Number(body.paxCount) || 4,
      jeepCount: Number(body.jeepCount) || 1,
      totalAmount: total,
      dpAmount: dp,
      remainingAmount: remaining,
      paymentMethod: body.paymentMethod || 'Transfer Bank',
      paymentStatus: remaining === 0 ? 'LUNAS' : (dp > 0 ? 'DP_DITERIMA' : 'MENUNGGU_PEMBAYARAN'),
      approvalStatus: 'APPROVED',
      driverName: body.driverName || 'Menunggu Penugasan Driver',
      jeepNumber: body.jeepNumber || '-',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
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
