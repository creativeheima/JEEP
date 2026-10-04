import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Halaman Tidak Ditemukan',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-sand flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-space font-bold text-xs tracking-[0.22em] uppercase text-amber-600">Error 404</div>
        <h1 className="mt-3 font-outfit font-black text-4xl sm:text-5xl text-slate-950 tracking-tight">
          Jalurnya Tidak Ditemukan
        </h1>
        <p className="mt-4 font-jakarta text-slate-600 leading-relaxed">
          Halaman yang Anda cari mungkin sudah dipindah atau tidak pernah ada. Yuk kembali ke basecamp dan pilih rute petualangan Anda.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="amber-gradient-btn px-7 py-3.5 rounded-full font-space font-bold text-sm text-slate-950 shadow-lg shadow-amber-500/25"
          >
            KEMBALI KE BERANDA
          </Link>
          <Link
            href="/#paket-wisata"
            className="px-7 py-3.5 rounded-full font-space font-bold text-sm text-slate-800 bg-white border border-slate-200"
          >
            LIHAT PAKET
          </Link>
        </div>
      </div>
    </main>
  );
}
