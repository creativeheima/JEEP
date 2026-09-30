'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown, Sparkles, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onOpenBooking?: () => void;
}

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  return (
    <section id="hero" className="relative min-h-[920px] flex items-center justify-center pt-24 pb-16 overflow-hidden bg-white">
      {/* Background Watermark / Golden Hour Image with soft atmospheric fades */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/img_1_6_merapi_jeep_adventure_golden_hour_experience.png"
            alt="Merapi Jeep Adventure Golden Hour Experience"
            fill
            priority
            className="object-cover object-center opacity-85 scale-105 transition-transform duration-1000"
          />
          {/* Subtle gradients from Figma (overlay to blend top/bottom smoothly) */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-white/70" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-transparent to-white" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50/90 border border-amber-300/80 shadow-sm mb-6 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-space font-bold text-xs text-amber-900 tracking-wider">
            JEEP ADVENTURE EXPERIENCE • YOGYAKARTA
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-outfit font-black text-4xl sm:text-6xl md:text-7xl lg:text-[76px] tracking-tight leading-[1.08] text-slate-950 max-w-4xl mb-6">
          Jelajahi Alam dengan{' '}
          <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 bg-clip-text text-transparent drop-shadow-sm block sm:inline">
            Cara yang Berbeda
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-jakarta text-base sm:text-xl text-slate-700 max-w-2xl leading-relaxed mb-10 font-normal">
          Rasakan sensasi petualangan Jeep 4x4, taklukkan jalur lava track dan sungai berbatu, lalu temukan panorama magis di lereng sakral Gunung Merapi.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={() => onOpenBooking ? onOpenBooking() : document.getElementById('paket-wisata')?.scrollIntoView({ behavior: 'smooth' })}
            className="amber-gradient-btn w-full sm:w-auto px-8 py-4 rounded-xl font-space font-bold text-sm text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2.5 group cursor-pointer"
          >
            <span>PESAN SEKARANG</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-slate-950" />
          </button>

          <a
            href="#paket-wisata"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-space font-semibold text-sm text-slate-800 bg-white/80 hover:bg-white border border-slate-300/80 hover:border-slate-400 shadow-sm backdrop-blur-sm transition-all text-center"
          >
            JELAJAHI RUTE
          </a>
        </div>

        {/* Scroll Indicator */}
        <a
          href="#tentang"
          className="inline-flex flex-col items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
        >
          <span className="font-space font-semibold text-xs tracking-widest text-slate-500 group-hover:text-slate-800 uppercase">
            GULIR EKSPLORASI
          </span>
          <div className="w-8 h-8 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs group-hover:translate-y-1 transition-transform">
            <ChevronDown className="w-4 h-4 text-slate-600" />
          </div>
        </a>
      </div>
    </section>
  );
}
