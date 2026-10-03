'use client';

import React from 'react';
import { Reveal } from '@/components/motion';

interface SectionHeadingProps {
  /** Nomor bab, mis. "02" — dipakai konsisten di semua section */
  chapter: string;
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  /** Slot kanan (tombol, filter, navigasi) untuk layout rata kiri */
  aside?: React.ReactNode;
  className?: string;
}

/**
 * Header section yang seragam: nomor bab + garis rute + eyebrow, judul besar, deskripsi.
 * Membuat setiap section terasa seperti "bab" dari satu perjalanan yang sama.
 */
export default function SectionHeading({
  chapter,
  eyebrow,
  title,
  description,
  align = 'left',
  aside,
  className = '',
}: SectionHeadingProps) {
  const centered = align === 'center';

  const content = (
    <div className={centered ? 'max-w-3xl mx-auto text-center' : 'max-w-2xl'}>
      <Reveal variant="up">
        <div className={`flex items-center gap-3 mb-5 ${centered ? 'justify-center' : ''}`}>
          <span className="font-space font-bold text-xs text-amber-600 tabular-nums">{chapter}</span>
          <span className="h-px w-10 bg-gradient-to-r from-amber-500 to-amber-500/0" />
          <span className="font-space font-bold text-[11px] tracking-[0.22em] uppercase text-slate-500">
            {eyebrow}
          </span>
        </div>
      </Reveal>
      <Reveal variant="blur" delay={80}>
        <h2 className="font-outfit font-black text-[2rem] leading-[1.05] sm:text-5xl lg:text-[3.5rem] text-slate-950 tracking-[-0.03em] text-balance">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal variant="up" delay={160}>
          <p className={`font-jakarta text-slate-600 text-sm sm:text-lg leading-relaxed mt-4 ${centered ? 'mx-auto max-w-2xl' : 'max-w-xl'}`}>
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );

  if (centered || !aside) {
    return <div className={`mb-9 sm:mb-14 ${className}`}>{content}</div>;
  }

  return (
    <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-9 sm:mb-14 ${className}`}>
      {content}
      <Reveal variant="right" delay={200} className="self-start md:self-auto shrink-0">
        {aside}
      </Reveal>
    </div>
  );
}

/** Teks gradien amber yang dipakai seragam untuk kata kunci di judul. */
export function Accent({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 bg-clip-text text-transparent animate-gradient">
      {children}
    </span>
  );
}
