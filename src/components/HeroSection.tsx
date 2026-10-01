'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { HeroSlide } from '@/types/heroSlide';

interface HeroSectionProps {
  onOpenBooking?: () => void;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    imageUrl: '/images/img_1_6_merapi_jeep_adventure_golden_hour_experience.png',
    title: 'Golden Sunrise Merapi Experience',
    order: 1,
    createdAt: '',
  },
  {
    id: 'slide-2',
    imageUrl: '/images/img_1_53_jeep_cruising_through_volcanic_off-road_track_mount_merapi.png',
    title: 'Ekspedisi Jalur Vulkanik & Lava Track',
    order: 2,
    createdAt: '',
  },
  {
    id: 'slide-3',
    imageUrl: '/images/img_1_193_paket_medium_kali_kuning_splashing_water.png',
    title: 'Sensasi Manuver Basah Kali Kuning',
    order: 3,
    createdAt: '',
  },
  {
    id: 'slide-4',
    imageUrl: '/images/img_1_372_bunker_kaliadem.png',
    title: 'Pesona Bersejarah Bunker Kaliadem',
    order: 4,
    createdAt: '',
  },
  {
    id: 'slide-5',
    imageUrl: '/images/img_1_443_travelers_smiling_in_4x4_jeep_with_mount_merapi_in_the_background.png',
    title: 'Momen Bahagia Wisatawan & Keluarga',
    order: 5,
    createdAt: '',
  },
];

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Fetch dynamic slides from server API
  useEffect(() => {
    fetch('/api/hero-slides')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setSlides(json.data);
        }
      })
      .catch(err => console.error('Error fetching hero slides:', err));
  }, []);

  // Auto-play slideshow every 6 seconds smoothly
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch swipe support for mobile gesture (optional swipe gesture remains active)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[820px] lg:min-h-[860px] flex items-center justify-center pt-20 sm:pt-24 pb-16 overflow-hidden bg-white select-none"
    >
      {/* Background Slideshow Layer (Clean Seamless Transition) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive
                  ? 'opacity-85 scale-100 z-10'
                  : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title || 'Foto Petualangan Merapi Jeep'}
                fill
                priority={idx === 0}
                className="object-cover object-center"
              />
            </div>
          );
        })}

        {/* Soft atmospheric gradient overlays to ensure text readability */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-white via-white/40 to-white/70 pointer-events-none" />
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-white/90 via-transparent to-white pointer-events-none" />
      </div>

      {/* Center Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Top Badge with Active Slide Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50/95 border border-amber-300/80 shadow-sm mb-6 backdrop-blur-sm">
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
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-14">
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
          className="inline-flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
        >
          <span className="font-space font-semibold text-[11px] tracking-widest text-slate-500 group-hover:text-slate-800 uppercase">
            GULIR EKSPLORASI
          </span>
          <div className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs group-hover:translate-y-1 transition-transform">
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </a>
      </div>
    </section>
  );
}
