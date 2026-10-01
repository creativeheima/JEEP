import { NextResponse } from 'next/server';
import { deleteHeroSlide } from '@/lib/heroSlideStore';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteHeroSlide(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Slide tidak ditemukan atau gagal dihapus' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Slide berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus slide' },
      { status: 500 }
    );
  }
}
