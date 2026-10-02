import { NextRequest, NextResponse } from 'next/server';
import { getAllPackages, createPackage } from '@/lib/packageStore';

export async function GET() {
  try {
    const packages = getAllPackages();
    return NextResponse.json({ success: true, data: packages });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal memuat paket' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, price, duration, badge, subBadge, image, destinations, isFeatured, featureText, color } = body;
    if (!title || !price || !duration) {
      return NextResponse.json({ success: false, error: 'Judul, harga, dan durasi wajib diisi' }, { status: 400 });
    }
    const pkg = createPackage({
      title,
      price,
      duration,
      badge: badge || '',
      subBadge: subBadge || '',
      image: image || '',
      destinations: Array.isArray(destinations) ? destinations : [],
      isFeatured: !!isFeatured,
      featureText: featureText || '',
      color: color || 'slate',
    });
    return NextResponse.json({ success: true, data: pkg }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Gagal membuat paket' }, { status: 500 });
  }
}