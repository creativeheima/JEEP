import { normalizeWaNumber, formatPhoneIntl, formatPhoneLocal } from './phone';
/**
 * Data bisnis terpusat untuk SEO (metadata, JSON-LD, sitemap, FAQ).
 * ⚠️ GANTI nilai bertanda TODO dengan data asli sebelum website online.
 */
/** Nomor default (cadangan). Nomor utama diatur admin di Dashboard → Konten Website → Kontak & WhatsApp. */
const WA_NUMBER = normalizeWaNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '') || '6281234567890';

export const SITE = {
  // TODO: ganti dengan domain final (atau isi NEXT_PUBLIC_SITE_URL di .env)
  url: (process.env.NEXT_PUBLIC_SITE_URL || 'https://merapijeepadventure.com').replace(/\/$/, ''),
  name: 'Merapi Jeep Adventure',
  shortName: 'Merapi Jeep',
  title: 'Jeep Merapi Jogja – Lava Tour Merapi Mulai Rp400rb',
  description:
    'Sewa jeep lava tour Merapi Jogja mulai Rp400.000/jeep (maks. 4 orang). Paket Short, Medium, Long & Sunrise ke Bunker Kaliadem, Kali Kuning, Museum Sisa Hartaku. Driver berlisensi, asuransi, booking via WhatsApp.',
  keywords: [
    'jeep merapi',
    'jeep merapi jogja',
    'lava tour merapi',
    'harga jeep merapi',
    'paket lava tour merapi',
    'sewa jeep merapi',
    'jeep kaliurang',
    'wisata jeep merapi',
    'sunrise merapi jeep',
    'lava tour jogja',
    'bunker kaliadem',
    'kali kuning jeep',
    'wisata jogja',
  ],
  // Nomor WhatsApp default — nomor aktif diambil dari pengaturan admin (lihat useSiteSettings)
  whatsapp: WA_NUMBER,
  phone: formatPhoneIntl(WA_NUMBER).replace(' ', '-'),
  phoneLocal: formatPhoneLocal(WA_NUMBER),
  email: 'booking@merapijeepadventure.com',
  address: {
    street: 'Basecamp Kaliurang Barat, Hargobinangun',
    locality: 'Pakem, Sleman',
    region: 'Daerah Istimewa Yogyakarta',
    postalCode: '55582',
    country: 'ID',
  },
  geo: { lat: -7.5407, lng: 110.4457 },
  // TODO: sesuaikan jam operasional asli
  openingHours: { opens: '04:00', closes: '17:00' },
  priceRange: 'Rp400.000 – Rp600.000',
  ogImage: '/images/og-merapi-jeep.jpg',
  // TODO: isi link sosial media asli
  socials: ['https://instagram.com/merapijeep_adventure'],
};

/** FAQ — tampil di halaman & dipakai untuk structured data (FAQPage). */
export const FAQS: { q: string; a: string }[] = [
  {
    q: 'Berapa harga sewa jeep lava tour Merapi?',
    a: 'Mulai Rp400.000 per jeep untuk Paket Short. Paket Medium Rp500.000, Paket Sunrise Rp550.000, dan Paket Long Rp600.000. Harga per jeep (maksimal 4 orang dewasa), sudah termasuk driver, BBM, dan retribusi.',
  },
  {
    q: 'Satu jeep bisa diisi berapa orang?',
    a: 'Satu jeep maksimal 4 orang dewasa. Untuk rombongan, keluarga besar, atau gathering kantor, Anda bisa memesan beberapa jeep sekaligus.',
  },
  {
    q: 'Berapa lama durasi lava tour Merapi?',
    a: 'Sekitar 1,5–2 jam (Short), 2–2,5 jam (Medium), 2,5–3 jam (Sunrise), dan 3–3,5 jam (Long), tergantung rute dan waktu berhenti di spot foto.',
  },
  {
    q: 'Jam berapa paket sunrise Merapi berangkat?',
    a: 'Paket Sunrise berangkat pukul 04.30 WIB dari basecamp agar tiba di titik pandang Kaliadem saat matahari terbit.',
  },
  {
    q: 'Apa saja yang sudah termasuk dalam paket?',
    a: 'Jeep 4x4 beserta driver berlisensi, BBM, tiket retribusi jalur, helm, jas hujan saat dibutuhkan, asuransi perjalanan, dan bantuan dokumentasi foto oleh driver.',
  },
  {
    q: 'Apakah lava tour Merapi aman untuk anak-anak?',
    a: 'Aman. Driver berpengalaman menyesuaikan kecepatan, armada dicek setiap pagi, dan seluruh tamu dilindungi asuransi. Untuk anak kecil atau lansia, Paket Short dengan ritme lebih santai bisa menjadi pilihan.',
  },
  {
    q: 'Di mana lokasi basecamp jeep Merapi?',
    a: 'Basecamp kami berada di Kaliurang Barat, Hargobinangun, Pakem, Sleman, Yogyakarta — sekitar 45–60 menit berkendara dari pusat Kota Jogja.',
  },
  {
    q: 'Bagaimana cara booking jeep Merapi?',
    a: 'Klik tombol "Pesan Sekarang" di website ini atau hubungi kami via WhatsApp. Pilih paket, tanggal, dan jumlah jeep — konfirmasi langsung dari tim basecamp.',
  },
];
