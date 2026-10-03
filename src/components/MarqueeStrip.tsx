'use client';

import React from 'react';
import { Mountain } from 'lucide-react';

const ITEMS = [
  'LAVA TOUR MERAPI',
  'KALI KUNING WATER SPLASH',
  'BUNKER KALIADEM',
  'GOLDEN SUNRISE',
  'MUSEUM SISA HARTAKU',
  'BATU ALIEN',
  'JEEP 4x4 OFF-ROAD',
];

/** Pita teks berjalan tanpa henti antara Hero dan section berikutnya. */
export default function MarqueeStrip() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative z-20 -mt-12 -mb-4 py-4 overflow-hidden">
    <div className="rotate-[-1deg] scale-x-[1.03] bg-slate-950 py-3.5 sm:py-4 shadow-2xl shadow-slate-950/20 overflow-hidden marquee-mask">
      <div className="marquee-track flex w-max items-center gap-8 sm:gap-12 whitespace-nowrap">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-8 sm:gap-12">
            <span className="font-outfit font-black text-sm sm:text-lg tracking-[0.18em] text-white/90">
              {item}
            </span>
            <Mountain className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
          </span>
        ))}
      </div>
    </div>
    </div>
  );
}
