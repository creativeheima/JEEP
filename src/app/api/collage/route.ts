import { NextRequest, NextResponse } from 'next/server';
import { getCollageContent, saveCollageContent } from '@/lib/collageStore';

export async function GET() {
  try {
    const content = getCollageContent();
    return NextResponse.json({ success: true, data: content });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal memuat konten' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { headline, description, image1, image1Caption, image2, image2Caption } = body;
    if (!headline || !description || !image1) {
      return NextResponse.json({ success: false, error: 'Field wajib tidak boleh kosong' }, { status: 400 });
    }
    const content = { headline, description, image1, image1Caption: image1Caption || '', image2: image2 || '', image2Caption: image2Caption || '' };
    saveCollageContent(content);
    return NextResponse.json({ success: true, data: content });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Gagal menyimpan konten' }, { status: 500 });
  }
}