import type { Metadata, Viewport } from 'next';
import { Outfit, Plus_Jakarta_Sans, Space_Grotesk, Work_Sans } from 'next/font/google';
import { SITE } from '@/lib/site';
import './globals.css';

// Font di-host sendiri oleh Next.js (lebih cepat, tidak memblokir render)
const outfit = Outfit({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'], variable: '--font-outfit', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-jakarta', display: 'swap' });
const space = Space_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-space', display: 'swap' });
const work = Work_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-work', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.title} | ${SITE.name}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: SITE.keywords,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  category: 'travel',
  alternates: {
    canonical: '/',
    languages: { 'id-ID': '/' },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: '/',
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: 'Jeep lava tour Merapi saat golden hour' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  formatDetection: { telephone: true },
  // TODO: isi kode verifikasi Google Search Console setelah domain online
  // verification: { google: 'KODE_VERIFIKASI' },
};

export const viewport: Viewport = {
  themeColor: '#faf8f4',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`scroll-smooth ${outfit.variable} ${jakarta.variable} ${space.variable} ${work.variable}`}>
      <body className="bg-sand text-slate-900 font-sans antialiased selection:bg-amber-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
