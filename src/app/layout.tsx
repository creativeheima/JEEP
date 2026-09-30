import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://merapijeepadventure.com'),
  title: 'Merapi Jeep Adventure • Jelajahi Alam dengan Cara yang Berbeda',
  description: 'Rasakan sensasi petualangan Jeep 4x4 Merapi, taklukkan jalur lava track dan sungai berbatu di lereng Gunung Merapi Yogyakarta.',
  keywords: 'sewa jeep merapi, lava tour merapi, jeep adventure yogyakarta, wisata kaliurang, paket jeep merapi',
  openGraph: {
    title: 'Merapi Jeep Adventure • Jelajahi Alam dengan Cara yang Berbeda',
    description: 'Penyedia tur eksplorasi ekstrem Merapi 4x4 terpercaya di Yogyakarta dengan standar keselamatan internasional.',
    images: ['/images/img_1_6_merapi_jeep_adventure_golden_hour_experience.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
