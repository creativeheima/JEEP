'use client';

import React, { useRef, useState } from 'react';
import { useScrollFrame } from '@/components/motion';

const CHAPTERS = [
  { id: 'tentang', label: 'Intro' },
  { id: 'paket-wisata', label: 'Paket' },
  { id: 'sensasi', label: 'Sensasi' },
  { id: 'destinasi', label: 'Destinasi' },
  { id: 'pengalaman', label: 'Cerita' },
  { id: 'fasilitas', label: 'Fasilitas' },
  { id: 'galeri', label: 'Galeri' },
  { id: 'ulasan', label: 'Ulasan' },
  { id: 'faq', label: 'FAQ' },
  { id: 'kontak', label: 'Pesan' },
];

/**
 * Rel perjalanan di sisi kiri (layar lebar): garis rute yang terisi saat scroll
 * dan titik untuk setiap bab — benang merah yang menyambungkan semua section.
 */
export default function JourneyRail() {
  const [active, setActive] = useState(-1);
  const fillRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  useScrollFrame(() => {
    const mid = window.scrollY + window.innerHeight * 0.45;
    let idx = -1;
    const tops: number[] = [];
    CHAPTERS.forEach((c, i) => {
      const el = document.getElementById(c.id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      tops[i] = top;
      if (mid >= top) idx = i;
    });
    setActive((prev) => (prev === idx ? prev : idx));

    // Isi garis: progres di antara bab pertama & terakhir
    const first = tops[0];
    const last = tops[tops.length - 1];
    if (fillRef.current && first !== undefined && last !== undefined && last > first) {
      const p = Math.min(1, Math.max(0, (mid - first) / (last - first)));
      fillRef.current.style.transform = `scaleY(${p})`;
    }
    if (railRef.current) {
      const footer = document.querySelector('footer');
      const footerInView = !!footer && footer.getBoundingClientRect().top < window.innerHeight * 0.65;
      const visible = first !== undefined && window.scrollY + window.innerHeight * 0.7 > first && !footerInView;
      railRef.current.style.opacity = visible ? '1' : '0';
      railRef.current.style.transform = visible ? 'translate3d(0,-50%,0)' : 'translate3d(-16px,-50%,0)';
    }
  });

  return (
    <nav
      ref={railRef}
      aria-label="Navigasi bab"
      className="hidden min-[1400px]:flex fixed left-6 top-1/2 z-40 flex-col items-start transition-all duration-500"
      style={{ opacity: 0, transform: 'translate3d(-16px,-50%,0)' }}
    >
      <div className="relative flex flex-col gap-5 py-2">
        {/* Garis dasar & isi */}
        <div className="absolute left-[5px] top-3 bottom-3 w-[2px] rounded-full bg-slate-300/60" />
        <div
          ref={fillRef}
          className="absolute left-[5px] top-3 bottom-3 w-[2px] rounded-full bg-gradient-to-b from-amber-400 to-orange-600 origin-top"
          style={{ transform: 'scaleY(0)' }}
        />
        {CHAPTERS.map((c, i) => {
          const isActive = i === active;
          const passed = i < active;
          return (
            <a key={c.id} href={`#${c.id}`} className="group relative flex items-center gap-3 pl-0">
              <span
                className={`relative z-10 block w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-500 border-amber-500 scale-125 shadow-[0_0_0_5px_rgba(245,158,11,0.18)]'
                    : passed
                    ? 'bg-amber-400 border-amber-400'
                    : 'bg-sand border-slate-300 group-hover:border-amber-400'
                }`}
              />
              <span
                className={`absolute left-6 top-1/2 -translate-y-1/2 glass-card px-2.5 py-1 rounded-full font-space text-[10px] font-bold tracking-[0.18em] uppercase whitespace-nowrap transition-all duration-300 pointer-events-none ${
                  isActive
                    ? 'opacity-0 min-[1640px]:opacity-100 text-slate-900 group-hover:opacity-100'
                    : 'opacity-0 -translate-x-1 text-slate-600 group-hover:opacity-100 group-hover:translate-x-0'
                }`}
              >
                <span className="text-amber-600 mr-1.5">{String(i + 1).padStart(2, '0')}</span>
                {c.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
