import { NextResponse } from 'next/server';
import { fetchAllGalleryItems, insertGalleryItem } from '@/lib/galleryStore';
import { GalleryItem } from '@/types/gallery';
import { isInstagramUrl, parseDriveId, driveThumbnailUrl } from '@/lib/media';

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

    const media = String(body.mediaUrl).trim();
    const isVideo = body.type === 'INSTAGRAM_VIDEO' || body.type === 'VIDEO' || body.category === 'VIDEO REELS';
    const type: GalleryItem['type'] = !isVideo ? 'PHOTO' : isInstagramUrl(media) ? 'INSTAGRAM_VIDEO' : 'VIDEO';
    const driveId = isVideo ? parseDriveId(media) : null;

    const newItem: GalleryItem = {
      id: 'gal-' + Date.now(),
      type,
      title: body.title.trim(),
      category: body.category || (isVideo ? 'VIDEO REELS' : 'JEEP ACTION'),
      mediaUrl: media,
      instagramUrl: body.instagramUrl?.trim() || (isInstagramUrl(media) ? media : undefined),
      thumbnailUrl: body.thumbnailUrl?.trim() || (driveId ? driveThumbnailUrl(driveId) : undefined),
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
