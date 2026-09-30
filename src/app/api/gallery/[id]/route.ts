import { NextResponse } from 'next/server';
import { deleteGalleryItem } from '@/lib/galleryStore';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteGalleryItem(id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Item galeri tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Item galeri berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting gallery item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery item' },
      { status: 500 }
    );
  }
}
