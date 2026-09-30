import { NextResponse } from 'next/server';
import { 
  fetchSingleBooking, 
  updateExistingBooking, 
  deleteExistingBooking 
} from '@/lib/bookingStore';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await fetchSingleBooking(id);

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
    
    // Fetch current to calculate remaining
    const current = await fetchSingleBooking(id);
    if (!current) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan' }, { status: 404 });
    }

    const merged = { ...current, ...updates };

    // If marked as lunas or dp changed, recalculate remaining
    if (updates.paymentStatus === 'LUNAS') {
      merged.dpAmount = merged.totalAmount;
      merged.remainingAmount = 0;
    } else if (updates.dpAmount !== undefined || updates.totalAmount !== undefined) {
      const tot = Number(merged.totalAmount) || 0;
      const dp = Number(merged.dpAmount) || 0;
      merged.remainingAmount = Math.max(0, tot - dp);
      if (merged.remainingAmount === 0) {
        merged.paymentStatus = 'LUNAS';
      }
    }

    const updated = await updateExistingBooking(id, merged);

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Gagal memperbarui booking' }, { status: 500 });
    }

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
    const success = await deleteExistingBooking(id);

    if (!success) {
      return NextResponse.json({ success: false, error: 'Booking tidak ditemukan atau gagal dihapus' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Booking berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete booking' }, { status: 500 });
  }
}
