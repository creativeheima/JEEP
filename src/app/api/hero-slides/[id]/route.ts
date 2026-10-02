import { NextResponse } from 'next/server';
import { deleteHeroSlide, updateHeroSlide } from '@/lib/heroSlideStore';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await updateHeroSlide(id, body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal memperbarui slide' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui slide' },
      { status: 500 }
    );
  }
}

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

