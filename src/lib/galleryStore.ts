import fs from 'fs';
import path from 'path';
import { GalleryItem } from '@/types/gallery';
import { supabase, isSupabaseConfigured } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'gallery.json');

const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    type: 'PHOTO',
    title: 'Jeep Traversing Off-Road Track',
    category: 'JEEP ACTION',
    mediaUrl: '/images/img_1_577_jeep_traversing_off-road_track.webp',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'gal-2',
    type: 'PHOTO',
    title: 'Wisatawan Bersorak di Jeep',
    category: 'WISATAWAN',
    mediaUrl: '/images/img_1_579_wisatawan_bersorak_di_jeep.webp',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'gal-3',
    type: 'INSTAGRAM_VIDEO',
    title: 'Aksi Spektakuler Manuver Basah Kali Kuning',
    category: 'VIDEO REELS',
    mediaUrl: 'https://www.instagram.com/reel/C-xyz123/',
    instagramUrl: 'https://www.instagram.com/reel/C-xyz123/',
    thumbnailUrl: '/images/img_1_581_manuver_air_kali_kuning.webp',
    caption: 'Sensasi cipratan air ekstrem bersama tim driver profesional! 🔥 #MerapiJeep #LavaTour',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'gal-4',
    type: 'PHOTO',
    title: 'Manuver Air Kali Kuning (Splash)',
    category: 'JEEP ACTION',
    mediaUrl: '/images/img_1_581_manuver_air_kali_kuning.webp',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'gal-5',
    type: 'INSTAGRAM_VIDEO',
    title: 'Golden Sunrise Magis Berlatar Puncak Merapi',
    category: 'VIDEO REELS',
    mediaUrl: 'https://www.instagram.com/reel/C-sunrise456/',
    instagramUrl: 'https://www.instagram.com/reel/C-sunrise456/',
    thumbnailUrl: '/images/img_1_583_panorama_merapi_pagi_cerah.webp',
    caption: 'Matahari terbit jam 05.00 pagi dengan kabut tipis di Bunker Kaliadem. Wajib coba Paket Sunrise!',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'gal-6',
    type: 'PHOTO',
    title: 'Panorama Merapi Pagi Cerah',
    category: 'DESTINASI',
    mediaUrl: '/images/img_1_583_panorama_merapi_pagi_cerah.webp',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'gal-7',
    type: 'PHOTO',
    title: 'Spot Foto Batu Alien Merapi',
    category: 'DESTINASI',
    mediaUrl: '/images/img_1_585_batu_alien_merapi.webp',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'gal-8',
    type: 'PHOTO',
    title: 'Corporate Outing & Gathering Jeep',
    category: 'WISATAWAN',
    mediaUrl: '/images/img_1_587_corporate_outing_jeep.webp',
    createdAt: new Date().toISOString(),
  },
];

function ensureDirectory(): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    return true;
  } catch {
    return false;
  }
}

function toDatabaseRow(item: GalleryItem) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    category: item.category,
    media_url: item.mediaUrl,
    instagram_url: item.instagramUrl || null,
    thumbnail_url: item.thumbnailUrl || null,
    caption: item.caption || null,
    created_at: item.createdAt,
  };
}

function fromDatabaseRow(row: Record<string, any>): GalleryItem {
  return {
    id: String(row.id),
    type: row.type as any,
    title: String(row.title),
    category: row.category as any,
    mediaUrl: String(row.media_url),
    instagramUrl: row.instagram_url ? String(row.instagram_url) : undefined,
    thumbnailUrl: row.thumbnail_url ? String(row.thumbnail_url) : undefined,
    caption: row.caption ? String(row.caption) : undefined,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export function getLocalGallery(): GalleryItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return INITIAL_GALLERY;
}

export function saveLocalGallery(items: GalleryItem[]): boolean {
  try {
    if (!ensureDirectory()) return false;
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[galleryStore] Tidak bisa menulis cache lokal (normal di Vercel):', (err as Error).message);
    return false;
  }
}

export async function fetchAllGalleryItems(): Promise<GalleryItem[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(fromDatabaseRow);
      }
    } catch (err) {
      console.error('Supabase gallery fetch error, using local fallback:', err);
    }
  }
  return getLocalGallery();
}

export async function insertGalleryItem(item: GalleryItem): Promise<GalleryItem> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const row = toDatabaseRow(item);
      const { data, error } = await supabase
        .from('gallery_items')
        .insert([row])
        .select()
        .single();

      if (!error && data) {
        const local = getLocalGallery();
        local.unshift(item);
        saveLocalGallery(local);
        return fromDatabaseRow(data);
      }
    } catch (err) {
      console.error('Supabase gallery insert error, saving locally:', err);
    }
  }

  const local = getLocalGallery();
  local.unshift(item);
  saveLocalGallery(local);
  return item;
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', id);

      if (!error) {
        let local = getLocalGallery();
        local = local.filter(x => x.id !== id);
        saveLocalGallery(local);
        return true;
      }
    } catch (err) {
      console.error('Supabase gallery delete error:', err);
    }
  }

  let local = getLocalGallery();
  const initLen = local.length;
  local = local.filter(x => x.id !== id);
  if (local.length === initLen) return false;
  saveLocalGallery(local);
  return true;
}
