/**
 * Helper media bersama (client & server):
 * - mengubah link Google Drive menjadi URL yang bisa ditampilkan di website
 * - mendeteksi jenis media (gambar, video file, video Drive, Instagram)
 */

export type MediaKind = 'image' | 'video';

/** Ambil ID file dari berbagai format link Google Drive. */
export function parseDriveId(url: string): string | null {
  if (!url) return null;
  const u = url.trim();
  if (!/drive\.google\.com|docs\.google\.com|googleusercontent\.com/i.test(u)) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{10,})/, // /file/d/ID/view
    /[?&]id=([a-zA-Z0-9_-]{10,})/, // open?id=ID, uc?id=ID, thumbnail?id=ID
    /\/d\/([a-zA-Z0-9_-]{10,})/, // lh3.googleusercontent.com/d/ID
  ];
  for (const p of patterns) {
    const m = u.match(p);
    if (m) return m[1];
  }
  return null;
}

export const driveImageUrl = (id: string, width = 2000) => `https://lh3.googleusercontent.com/d/${id}=w${width}`;
export const driveThumbnailUrl = (id: string, width = 1000) => `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`;
export const driveVideoPreviewUrl = (id: string) => `https://drive.google.com/file/d/${id}/preview`;

export const isDriveFolderLink = (url: string) => /drive\.google\.com\/drive\/(u\/\d+\/)?folders\//i.test(url);
export const isDrivePreview = (url?: string) => !!url && /drive\.google\.com\/file\/d\/[^/]+\/preview/i.test(url);
export const isInstagramUrl = (url?: string) => !!url && /instagram\.com\/(reel|p|tv)\//i.test(url);
export const isYouTubeUrl = (url?: string) => !!url && /(youtube\.com\/(watch|shorts|embed)|youtu\.be\/)/i.test(url);
export const isDirectVideoUrl = (url?: string) =>
  !!url && (/\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/i.test(url) || /\/storage\/v1\/object\/public\/.+\.(mp4|webm|mov|m4v)/i.test(url));

/** Link embed YouTube (untuk video yang ditautkan dari YouTube). */
export function youTubeEmbedUrl(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&playsinline=1` : null;
}

export function instagramEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const m = url.match(/instagram\.com\/(?:reel|p|tv)\/([^/?#&]+)/i);
  return m ? `https://www.instagram.com/reel/${m[1]}/embed/` : null;
}

/**
 * Normalisasi link yang ditempel admin.
 * Mengembalikan URL siap pakai + thumbnail otomatis (untuk video Drive).
 */
export function normalizeMediaLink(
  raw: string,
  kind: MediaKind
): { url: string; thumbnail?: string; error?: string } {
  const url = raw.trim();
  if (!url) return { url: '' };

  if (isDriveFolderLink(url)) {
    return { url: '', error: 'Itu link folder. Buka file-nya di Drive lalu salin link file (bukan folder).' };
  }

  const driveId = parseDriveId(url);
  if (driveId) {
    return kind === 'video'
      ? { url: driveVideoPreviewUrl(driveId), thumbnail: driveThumbnailUrl(driveId) }
      : { url: driveImageUrl(driveId) };
  }

  if (!/^(https?:\/\/|\/)/i.test(url)) {
    return { url: '', error: 'Link harus diawali https:// atau / (untuk file di folder public).' };
  }
  return { url };
}

/** Jenis video dari sebuah URL untuk menentukan cara memutarnya. */
export function videoSourceType(url?: string): 'drive' | 'instagram' | 'youtube' | 'file' | null {
  if (!url) return null;
  if (isDrivePreview(url) || parseDriveId(url)) return 'drive';
  if (isInstagramUrl(url)) return 'instagram';
  if (isYouTubeUrl(url)) return 'youtube';
  if (isDirectVideoUrl(url)) return 'file';
  return null;
}
