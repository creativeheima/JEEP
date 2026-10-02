import fs from 'fs';
import path from 'path';

export interface CollageContent {
  headline: string;
  description: string;
  image1: string;
  image1Caption: string;
  image2: string;
  image2Caption: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'collage_content.json');

const DEFAULT_CONTENT: CollageContent = {
  headline: 'Petualangan Dimulai di Sini, Menembus Jejak Vulkanik Legendaris',
  description: 'Menembus aroma belerang tipis, melintasi hamparan pasir hitam muntahan lahar dingin, dan memacu adrenalin di jalur air Kali Kuning. Bersama kami, Anda tidak sekadar berwisata, tetapi merasakan hembusan sejarah ketangguhan lereng Merapi secara langsung dan intim.',
  image1: '/images/img_1_53_jeep_cruising_through_volcanic_off-road_track_mount_merapi.png',
  image1Caption: 'Lereng Selatan Gunung Merapi',
  image2: '/images/img_1_66_travelers_cheering_in_the_open_jeep.png',
  image2Caption: 'Momen Seru Penumpang',
};

export function getCollageContent(): CollageContent {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return { ...DEFAULT_CONTENT, ...JSON.parse(raw) };
    }
  } catch {}
  return DEFAULT_CONTENT;
}

export function saveCollageContent(content: CollageContent): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(content, null, 2), 'utf-8');
}