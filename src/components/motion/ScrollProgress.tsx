'use client';

import React, { useRef } from 'react';
import { useScrollFrame } from './useScrollFrame';

/** Garis progres tipis di paling atas layar yang terisi saat halaman di-scroll. */
export default function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useScrollFrame(() => {
    const bar = barRef.current;
    if (!bar) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${progress})`;
  });

  return (
    <div className="fixed top-0 inset-x-0 h-[3px] z-[60] pointer-events-none" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full origin-left bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
