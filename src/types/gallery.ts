/** PHOTO = foto, INSTAGRAM_VIDEO = reel Instagram, VIDEO = video upload / Google Drive / YouTube */
export type GalleryItemType = 'PHOTO' | 'INSTAGRAM_VIDEO' | 'VIDEO';

export type GalleryCategory = 'JEEP ACTION' | 'DESTINASI' | 'WISATAWAN' | 'VIDEO REELS';

export interface GalleryItem {
  id: string;
  type: GalleryItemType;
  title: string;
  category: GalleryCategory;
  mediaUrl: string; // Foto src atau Instagram Reel / Post URL
  instagramUrl?: string; // Link tautan langsung ke Instagram
  thumbnailUrl?: string; // Gambar cover untuk video instagram
  caption?: string;
  createdAt: string;
}

export type CreateGalleryInput = Omit<GalleryItem, 'id' | 'createdAt'>;
