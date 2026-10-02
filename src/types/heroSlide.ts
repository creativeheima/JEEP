export interface HeroSlide {
  id: string;
  imageUrl: string;
  title: string;
  showText?: boolean; // Apakah teks/font di beranda ditampilkan (default: true)
  headline?: string; // Judul custom (opsional, jika kosong pakai default)
  subheadline?: string; // Subjudul custom (opsional)
  showButton?: boolean; // Apakah tombol CTA ditampilkan (default: true)
  order: number;
  createdAt: string;
}

export const MAX_HERO_SLIDES = 5;

