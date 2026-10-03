import fs from 'fs';
import path from 'path';
import { TourPackage } from '@/types/package';

const DATA_FILE = path.join(process.cwd(), 'data', 'packages.json');

const DEFAULT_PACKAGES: TourPackage[] = [
  {
    id: 'short',
    badge: 'RUTE DASAR',
    subBadge: 'EKSPEDISI CEPAT',
    title: 'Paket Short',
    price: 'Rp 400.000',
    duration: '1.5 - 2 Jam',
    image: '/images/img_1_156_paket_short_merapi_jeep.png',
    destinations: [
      'Museum Sisa Hartaku (Erupsi 2010)',
      'Batu Alien (Batu Wajah Merapi)',
      'Bunker Kaliadem & Pemandangan Kawah',
      'Spot Foto Estetik Lereng Merapi',
    ],
    isFeatured: false,
    color: 'slate',
    order: 1,
  },
  {
    id: 'medium',
    badge: 'BEST SELLER',
    subBadge: 'PALING DICARI WISATAWAN',
    title: 'Paket Medium',
    price: 'Rp 500.000',
    duration: '2 - 2.5 Jam',
    image: '/images/img_1_193_paket_medium_kali_kuning_splashing_water.png',
    destinations: [
      'Atraksi Basah Air Kali Kuning (Water Splash)',
      'Museum Sisa Hartaku',
      'Batu Alien (Batu Wajah Merapi)',
      'Bunker Kaliadem & Puncak Merapi',
      'Jalur Pasir Lava Bawah Lereng',
    ],
    isFeatured: true,
    featureText: 'PALING FAVORIT & REKOMENDASI',
    color: 'amber',
    order: 2,
  },
  {
    id: 'long',
    badge: 'FULL ADVENTURE',
    subBadge: 'EKSPLORASI LENGKAP',
    title: 'Paket Long',
    price: 'Rp 600.000',
    duration: '3 - 3.5 Jam',
    image: '/images/img_1_243_paket_long_petilasan_mbah_maridjan.png',
    destinations: [
      'Petilasan Mbah Maridjan (Kinahrejo)',
      'Manuver Off-Road Air Kali Kuning',
      'Museum Sisa Hartaku',
      'Batu Alien & Lembah Gendol',
      'Bunker Kaliadem',
    ],
    isFeatured: false,
    color: 'slate',
    order: 3,
  },
  {
    id: 'sunrise',
    badge: 'START 04:30',
    subBadge: 'MAGICAL DAWN',
    title: 'Paket Sunrise',
    price: 'Rp 550.000',
    duration: '2.5 - 3 Jam',
    image: '/images/img_1_280_paket_sunrise_merapi.png',
    destinations: [
      'Golden Sunrise Kaliadem View Point',
      'Sensasi Udara Dingin Fajar Gunung Merapi',
      'Bunker Kaliadem Eksklusif Pagi',
      'Batu Alien & Museum Sisa Hartaku',
    ],
    isFeatured: false,
    color: 'orange',
    order: 4,
  },
];

function readPackages(): TourPackage[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_PACKAGES;
}

function writePackages(packages: TourPackage[]): boolean {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(packages, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn('[packageStore] Tidak bisa menulis data/packages.json (normal di Vercel):', (err as Error).message);
    return false;
  }
}

export function getAllPackages(): TourPackage[] {
  return readPackages().sort((a, b) => a.order - b.order);
}

export function createPackage(data: Omit<TourPackage, 'id' | 'order'>): TourPackage {
  const packages = readPackages();
  const maxOrder = packages.reduce((m, p) => Math.max(m, p.order), 0);
  const newPkg: TourPackage = {
    ...data,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'pkg-' + Date.now(),
    order: maxOrder + 1,
  };
  packages.push(newPkg);
  writePackages(packages);
  return newPkg;
}

export function updatePackage(id: string, data: Partial<TourPackage>): TourPackage | null {
  const packages = readPackages();
  const idx = packages.findIndex(p => p.id === id);
  if (idx === -1) return null;
  packages[idx] = { ...packages[idx], ...data, id };
  writePackages(packages);
  return packages[idx];
}

export function deletePackage(id: string): boolean {
  const packages = readPackages();
  const filtered = packages.filter(p => p.id !== id);
  if (filtered.length === packages.length) return false;
  writePackages(filtered);
  return true;
}