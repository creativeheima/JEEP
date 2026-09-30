import { NextResponse } from 'next/server';
import { getBookings, saveBookings } from '@/lib/bookingStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookings = getBookings();
    const booking = bookings.find(
      b => b.id.toLowerCase() === id.toLowerCase() || b.bookingCode.toLowerCase() === id.toLowerCase()
    );

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const bookings = getBookings();
    const index = bookings.findIndex(
      b => b.id.toLowerCase() === id.toLowerCase() || b.bookingCode.toLowerCase() === id.toLowerCase()
    );

    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    const current = bookings[index];
    const updated = {
      ...current,
      ...updates,
    };

    // If marked as lunas or dp changed, recalculate remaining
    if (updates.paymentStatus === 'LUNAS') {
      updated.dpAmount = updated.totalAmount;
      updated.remainingAmount = 0;
    } else if (updates.dpAmount !== undefined || updates.totalAmount !== undefined) {
      const tot = Number(updated.totalAmount) || 0;
      const dp = Number(updated.dpAmount) || 0;
      updated.remainingAmount = Math.max(0, tot - dp);
      if (updated.remainingAmount === 0) {
        updated.paymentStatus = 'LUNAS';
      }
    }

    bookings[index] = updated;
    saveBookings(bookings);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let bookings = getBookings();
    const initialLen = bookings.length;
    bookings = bookings.filter(
      b => b.id.toLowerCase() !== id.toLowerCase() && b.bookingCode.toLowerCase() !== id.toLowerCase()
    );

    if (bookings.length === initialLen) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    saveBookings(bookings);
    return NextResponse.json({ success: true, message: 'Booking berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 500 });
  }
}
