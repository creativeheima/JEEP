import fs from 'fs';
import path from 'path';
import { HeroSlide, MAX_HERO_SLIDES } from '@/types/heroSlide';
import { supabase, isSupabaseConfigured } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'hero_slides.json');

const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    imageUrl: '/images/img_1_6_merapi_jeep_adventure_golden_hour_experience.webp',
    title: 'Golden Sunrise Merapi Experience',
    showText: true,
    showButton: true,
    order: 1,
    createdAt: new Date(Date.now() - 50000).toISOString(),
  },
  {
    id: 'slide-2',
    imageUrl: '/images/img_1_53_jeep_cruising_through_volcanic_off-road_track_mount_merapi.webp',
    title: 'Ekspedisi Jalur Vulkanik & Lava Track',
    showText: true,
    showButton: true,
    order: 2,
    createdAt: new Date(Date.now() - 40000).toISOString(),
  },
  {
    id: 'slide-3',
    imageUrl: '/images/img_1_193_paket_medium_kali_kuning_splashing_water.webp',
    title: 'Sensasi Manuver Basah Kali Kuning',
    showText: true,
    showButton: true,
    order: 3,
    createdAt: new Date(Date.now() - 30000).toISOString(),
  },
  {
    id: 'slide-4',
    imageUrl: '/images/img_1_372_bunker_kaliadem.webp',
    title: 'Pesona Bersejarah Bunker Kaliadem',
    showText: true,
    showButton: true,
    order: 4,
    createdAt: new Date(Date.now() - 20000).toISOString(),
  },
  {
    id: 'slide-5',
    imageUrl: '/images/img_1_443_travelers_smiling_in_4x4_jeep_with_mount_merapi_in_the_background.webp',
    title: 'Momen Bahagia Wisatawan & Keluarga',
    showText: true,
    showButton: true,
    order: 5,
    createdAt: new Date(Date.now() - 10000).toISOString(),
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

function toDatabaseRow(slide: HeroSlide) {
  return {
    id: slide.id,
    image_url: slide.imageUrl,
    title: slide.title,
    show_text: slide.showText !== false,
    headline: slide.headline || null,
    subheadline: slide.subheadline || null,
    show_button: slide.showButton !== false,
    order_index: slide.order,
    created_at: slide.createdAt,
  };
}

function fromDatabaseRow(row: Record<string, any>): HeroSlide {
  return {
    id: String(row.id),
    imageUrl: String(row.image_url),
    title: String(row.title || ''),
    showText: row.show_text !== false && row.showText !== false,
    headline: row.headline || '',
    subheadline: row.subheadline || '',
    showButton: row.show_button !== false && row.showButton !== false,
    order: Number(row.order_index) || 1,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

export function getLocalHeroSlides(): HeroSlide[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Normalize showText default to true if undefined
        return parsed.map(slide => ({
          ...slide,
          showText: slide.showText !== false,
          showButton: slide.showButton !== false,
        }));
      }
    }
  } catch {}
  return INITIAL_HERO_SLIDES;
}

export function saveLocalHeroSlides(slides: HeroSlide[]): boolean {
  try {
    if (!ensureDirectory()) return false;
    fs.writeFileSync(DATA_FILE, JSON.stringify(slides.slice(0, MAX_HERO_SLIDES), null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('[heroSlideStore] Tidak bisa menulis cache lokal (normal di Vercel):', (err as Error).message);
    return false;
  }
}

export async function fetchAllHeroSlides(): Promise<HeroSlide[]> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('order_index', { ascending: true })
        .limit(MAX_HERO_SLIDES);

      if (!error && data && data.length > 0) {
        return data.map(fromDatabaseRow);
      }
    } catch (err) {
      console.error('Supabase hero_slides fetch error, using local fallback:', err);
    }
  }
  return getLocalHeroSlides().sort((a, b) => a.order - b.order).slice(0, MAX_HERO_SLIDES);
}

export async function insertHeroSlide(slide: Omit<HeroSlide, 'id' | 'createdAt' | 'order'>): Promise<{ success: boolean; data?: HeroSlide; error?: string }> {
  const currentSlides = await fetchAllHeroSlides();
  if (currentSlides.length >= MAX_HERO_SLIDES) {
    return {
      success: false,
      error: `Maksimal foto beranda adalah ${MAX_HERO_SLIDES} foto. Hapus salah satu foto terlebih dahulu untuk menambah baru.`
    };
  }

  const newSlide: HeroSlide = {
    id: 'slide-' + Date.now(),
    imageUrl: slide.imageUrl.trim(),
    title: (slide.title || 'Slide Beranda').trim(),
    showText: slide.showText !== false,
    headline: slide.headline?.trim() || '',
    subheadline: slide.subheadline?.trim() || '',
    showButton: slide.showButton !== false,
    order: currentSlides.length + 1,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const row = toDatabaseRow(newSlide);
      const { data, error } = await supabase
        .from('hero_slides')
        .insert([row])
        .select()
        .single();

      if (!error && data) {
        const local = getLocalHeroSlides();
        local.push(newSlide);
        saveLocalHeroSlides(local);
        return { success: true, data: fromDatabaseRow(data) };
      }
    } catch (err) {
      console.error('Supabase insert hero slide error:', err);
    }
  }

  const local = getLocalHeroSlides();
  local.push(newSlide);
  saveLocalHeroSlides(local);
  return { success: true, data: newSlide };
}

export async function updateHeroSlide(
  id: string,
  updates: Partial<Omit<HeroSlide, 'id' | 'createdAt' | 'order'>>
): Promise<{ success: boolean; data?: HeroSlide; error?: string }> {
  let local = getLocalHeroSlides();
  const slideIndex = local.findIndex((s) => s.id === id);
  if (slideIndex === -1) {
    return { success: false, error: 'Slide tidak ditemukan' };
  }

  const existing = local[slideIndex];
  const updatedSlide: HeroSlide = {
    ...existing,
    ...updates,
    showText: updates.showText !== undefined ? updates.showText : (existing.showText !== false),
    showButton: updates.showButton !== undefined ? updates.showButton : (existing.showButton !== false),
  };

  local[slideIndex] = updatedSlide;
  saveLocalHeroSlides(local);

  if (isSupabaseConfigured() && supabase) {
    try {
      const row = toDatabaseRow(updatedSlide);
      await supabase
        .from('hero_slides')
        .update(row)
        .eq('id', id);
    } catch (err) {
      console.error('Supabase update hero slide error:', err);
    }
  }

  return { success: true, data: updatedSlide };
}

export async function deleteHeroSlide(id: string): Promise<boolean> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (!error) {
        let local = getLocalHeroSlides();
        local = local.filter(s => s.id !== id);
        saveLocalHeroSlides(local);
        return true;
      }
    } catch (err) {
      console.error('Supabase hero slide delete error:', err);
    }
  }

  let local = getLocalHeroSlides();
  const initLen = local.length;
  local = local.filter(s => s.id !== id);
  if (local.length === initLen) return false;
  saveLocalHeroSlides(local);
  return true;
}

export async function reorderHeroSlides(reorderedIds: string[]): Promise<boolean> {
  const local = getLocalHeroSlides();
  const updated: HeroSlide[] = [];

  reorderedIds.forEach((id, index) => {
    const item = local.find(s => s.id === id);
    if (item) {
      updated.push({ ...item, order: index + 1 });
    }
  });

  saveLocalHeroSlides(updated);

  if (isSupabaseConfigured() && supabase) {
    try {
      for (const item of updated) {
        await supabase
          .from('hero_slides')
          .update({ order_index: item.order })
          .eq('id', item.id);
      }
    } catch (err) {
      console.error('Supabase reorder exception:', err);
    }
  }

  return true;
}
