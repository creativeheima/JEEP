import { NextResponse } from 'next/server';
import { fetchAllGalleryItems, insertGalleryItem } from '@/lib/galleryStore';
import { GalleryItem } from '@/types/gallery';

export async function GET() {
  try {
    const items = await fetchAllGalleryItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.mediaUrl) {
      return NextResponse.json(
        { success: false, error: 'Judul dan URL Media wajib diisi' },
        { status: 400 }
      );
    }

    const isVideo = body.type === 'INSTAGRAM_VIDEO' || body.category === 'VIDEO REELS';

    const newItem: GalleryItem = {
      id: 'gal-' + Date.now(),
      type: isVideo ? 'INSTAGRAM_VIDEO' : 'PHOTO',
      title: body.title.trim(),
      category: body.category || (isVideo ? 'VIDEO REELS' : 'JEEP ACTION'),
      mediaUrl: body.mediaUrl.trim(),
      instagramUrl: body.instagramUrl?.trim() || (isVideo ? body.mediaUrl.trim() : undefined),
      thumbnailUrl: body.thumbnailUrl?.trim() || undefined,
      caption: body.caption?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    const saved = await insertGalleryItem(newItem);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery item:', error);
    return NextResponse.json({ success: false, error: 'Failed to save gallery item' }, { status: 500 });
  }
}
