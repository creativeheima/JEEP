import { NextRequest, NextResponse } from 'next/server';
import { updatePackage, deletePackage } from '@/lib/packageStore';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updatePackage(id, body);
    if (!updated) return NextResponse.json({ success: false, error: 'Paket tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui paket' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ok = deletePackage(id);
    if (!ok) return NextResponse.json({ success: false, error: 'Paket tidak ditemukan' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Paket berhasil dihapus' });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal menghapus paket' }, { status: 500 });
  }
}