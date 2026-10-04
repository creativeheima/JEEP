'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Instagram, Facebook, Youtube, ArrowUpRight, ArrowUp } from 'lucide-react';

const NAV = [
  { label: 'Tentang', href: '#tentang' },
  { label: 'Paket', href: '#paket-wisata' },
  { label: 'Destinasi', href: '#destinasi' },
  { label: 'Galeri', href: '#galeri' },
  { label: 'Kontak', href: '#kontak' },
];

const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Facebook', href: 'https://facebook.com', icon: Facebook },
  { label: 'YouTube', href: 'https://youtube.com', icon: Youtube },
];

export default function Footer() {
  const contact = useSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 bg-[#0a0f1d] text-slate-400 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        {/* Baris utama: brand — navigasi — kontak */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-10 pb-10 sm:pb-14">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="#hero" className="inline-block">
              <Image
                src="/images/logo.webp"
                alt="Merapi Jeep Adventure — lava tour jeep Merapi Jogja"
                width={2171}
                height={724}
                className="h-10 sm:h-11 w-auto object-contain"
              />
            </Link>
            <p className="font-jakarta text-sm leading-relaxed mt-4 text-slate-400">
              Petualangan Jeep 4x4 di lereng Merapi — aman, autentik, tak terlupakan.
            </p>
          </div>

          {/* Navigasi */}
          <nav className="flex flex-wrap gap-x-7 gap-y-3" aria-label="Navigasi footer">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="font-space text-xs font-semibold tracking-[0.14em] uppercase text-slate-300 hover:text-amber-400 transition-colors"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* Kontak */}
          <div className="space-y-2 lg:text-right">
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 font-outfit font-bold text-xl sm:text-2xl text-white hover:text-amber-400 transition-colors"
            >
              {contact.phone}
              <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <a
              href="mailto:booking@merapijeepadventure.com"
              className="block font-jakarta text-sm hover:text-amber-400 transition-colors"
            >
              booking@merapijeepadventure.com
            </a>
            <p className="font-jakarta text-sm text-slate-500">Kaliurang, Sleman — Yogyakarta</p>
          </div>
        </div>

        {/* Garis tipis */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700/70 to-transparent" />

        {/* Baris bawah */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-5 py-6 sm:py-7">
          <p className="font-jakarta text-xs text-slate-500 text-center sm:text-left">
            © {year} Merapi Jeep Adventure
            <span className="mx-2 text-slate-700">·</span>
            <Link href="/admin" className="hover:text-slate-300 transition-colors">
              Admin
            </Link>
          </p>

          <div className="flex items-center gap-2">
            {SOCIALS.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-slate-700/80 text-slate-400 hover:text-slate-950 hover:bg-amber-400 hover:border-amber-400 flex items-center justify-center transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
            <a
              href="#hero"
              aria-label="Kembali ke atas"
              className="ml-2 w-9 h-9 rounded-full bg-white/5 text-slate-300 hover:bg-white hover:text-slate-950 flex items-center justify-center transition-all"
            >
              <ArrowUp className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Wordmark besar samar sebagai penutup */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none text-center font-outfit font-black uppercase leading-[0.8] tracking-[-0.05em] text-[19vw] lg:text-[15rem] -mb-[3vw] lg:-mb-10 bg-gradient-to-b from-white/[0.07] to-white/0 bg-clip-text text-transparent"
      >
        Merapi
      </div>
    </footer>
  );
}
