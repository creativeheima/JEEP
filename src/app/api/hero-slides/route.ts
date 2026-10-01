import { NextResponse } from 'next/server';
import { fetchAllHeroSlides, insertHeroSlide } from '@/lib/heroSlideStore';
import { MAX_HERO_SLIDES } from '@/types/heroSlide';

export async function GET() {
  try {
    const slides = await fetchAllHeroSlides();
    return NextResponse.json({
      success: true,
      data: slides,
      maxLimit: MAX_HERO_SLIDES,
      currentCount: slides.length,
    });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data slide beranda' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.imageUrl) {
      return NextResponse.json(
        { success: false, error: 'URL atau path gambar wajib diisi' },
        { status: 400 }
      );
    }

    const result = await insertHeroSlide({
      imageUrl: body.imageUrl,
      title: body.title || 'Foto Petualangan Merapi',
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data }, { status: 201 });
  } catch (error) {
    console.error('Error adding hero slide:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menambahkan slide' },
      { status: 500 }
    );
  }
}
