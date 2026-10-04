'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Star, Users } from 'lucide-react';
import { useScrollFrame } from '@/components/motion';
import { HeroSlide } from '@/types/heroSlide';
import { optimizedSrc } from '@/lib/media';

interface HeroSectionProps {
  onOpenBooking?: () => void;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    imageUrl: '/images/img_1_6_merapi_jeep_adventure_golden_hour_experience.webp',
    title: 'Golden Sunrise Merapi Experience',
    showText: true,
    showButton: true,
    order: 1,
    createdAt: '',
  },
  {
    id: 'slide-2',
    imageUrl: '/images/img_1_53_jeep_cruising_through_volcanic_off-road_track_mount_merapi.webp',
    title: 'Ekspedisi Jalur Vulkanik & Lava Track',
    showText: true,
    showButton: true,
    order: 2,
    createdAt: '',
  },
  {
    id: 'slide-3',
    imageUrl: '/images/img_1_193_paket_medium_kali_kuning_splashing_water.webp',
    title: 'Sensasi Manuver Basah Kali Kuning',
    showText: true,
    showButton: true,
    order: 3,
    createdAt: '',
  },
  {
    id: 'slide-4',
    imageUrl: '/images/img_1_372_bunker_kaliadem.webp',
    title: 'Pesona Bersejarah Bunker Kaliadem',
    showText: true,
    showButton: true,
    order: 4,
    createdAt: '',
  },
  {
    id: 'slide-5',
    imageUrl: '/images/img_1_443_travelers_smiling_in_4x4_jeep_with_mount_merapi_in_the_background.webp',
    title: 'Momen Bahagia Wisatawan & Keluarga',
    showText: true,
    showButton: true,
    order: 5,
    createdAt: '',
  },
];

/** Pecah teks jadi kata-kata yang naik satu per satu. */
function SplitWords({ text, startDelay = 0, step = 70, wordClassName = '' }: { text: string; startDelay?: number; step?: number; wordClassName?: string }) {
  const words = text.split(' ').filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <React.Fragment key={`${w}-${i}`}>
          <span className="word-mask">
            <span
              className="word-rise"
              style={{ '--word-delay': `${startDelay + i * step}ms` } as React.CSSProperties}
            >
              {wordClassName ? <span className={wordClassName}>{w}</span> : w}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </React.Fragment>
      ))}
    </>
  );
}

export default function HeroSection({ onOpenBooking }: HeroSectionProps) {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parallax scroll: latar bergerak lebih lambat, konten naik & memudar
  useScrollFrame(() => {
    const section = sectionRef.current;
    if (!section) return;
    const h = section.offsetHeight;
    const y = window.scrollY;
    if (y > h * 1.1) return;
    const p = Math.min(1, Math.max(0, y / h));
    if (bgRef.current) {
      bgRef.current.style.transform = `translate3d(0, ${(y * 0.45).toFixed(1)}px, 0) scale(${(1 + p * 0.08).toFixed(3)})`;
    }
    if (contentRef.current) {
      contentRef.current.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0)`;
      contentRef.current.style.opacity = String(Math.max(0, 1 - p * 1.35));
    }
  });

  // Parallax kursor (desktop): set CSS var --mx/--my di -1..1
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.setProperty('--mx', mx.toFixed(3));
    el.style.setProperty('--my', my.toFixed(3));
  };

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

  // Auto-play slideshow smoothly
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

  // Touch swipe support for mobile gesture
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

  // Current active slide configuration
  const currentSlide = slides[currentIndex] || slides[0] || DEFAULT_SLIDES[0];
  const isTextVisible = currentSlide?.showText !== false;
  const isButtonVisible = currentSlide?.showButton !== false;

  return (
    <section
      id="hero"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative h-[100svh] min-h-[620px] max-h-[820px] md:h-auto md:max-h-none md:min-h-[820px] lg:min-h-[860px] flex items-start md:items-center justify-center pt-24 md:pt-24 pb-16 overflow-hidden bg-sand select-none"
    >
      {/* Background Slideshow Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div ref={bgRef} className="absolute inset-0 will-change-transform">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isActive
                  ? 'opacity-100 scale-100 z-10'
                  : 'opacity-0 scale-105 pointer-events-none z-0'
              }`}
            >
              <div className={`absolute inset-0 ${isActive ? 'kenburns' : ''}`}>
                <Image
                  src={optimizedSrc(slide.imageUrl)}
                  alt={slide.title || 'Foto Petualangan Merapi Jeep'}
                  fill
                  priority={idx === 0}
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          );
        })}
        </div>

        {/* Soft atmospheric gradient overlays - reduced when font is disabled so custom banners with built-in text are crisp */}
        {/* HP: pudar hanya di bagian atas (area teks), foto di bawah tetap jernih */}
        <div
          className={`md:hidden absolute inset-x-0 top-0 h-[72%] z-20 pointer-events-none transition-opacity duration-700 bg-gradient-to-b from-sand via-sand/85 to-transparent ${
            isTextVisible ? 'opacity-100' : 'opacity-40'
          }`}
        />
        <div className="md:hidden absolute inset-x-0 bottom-0 h-20 z-20 pointer-events-none bg-gradient-to-t from-sand to-transparent" />
        <div
          className={`hidden md:block absolute inset-0 z-20 transition-opacity duration-700 pointer-events-none ${
            isTextVisible
              ? 'opacity-100 bg-gradient-to-t from-sand via-sand/40 to-sand/70'
              : 'opacity-40 bg-gradient-to-t from-sand/90 via-transparent to-sand/60'
          }`}
        />
        <div
          className={`hidden md:block absolute inset-0 z-20 transition-opacity duration-700 pointer-events-none ${
            isTextVisible
              ? 'opacity-100 bg-gradient-to-b from-sand/90 via-transparent to-sand'
              : 'opacity-30 bg-gradient-to-b from-sand/80 via-transparent to-transparent'
          }`}
        />
      </div>

      {/* Orb cahaya lembut yang mengikuti kursor */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="mouse-layer absolute -top-24 -left-24 w-[420px] h-[420px]" style={{ '--depth': -30 } as React.CSSProperties}>
          <div className="w-full h-full rounded-full bg-amber-300/30 blur-3xl float-slow" />
        </div>
        <div className="mouse-layer absolute bottom-0 -right-32 w-[480px] h-[480px]" style={{ '--depth': 40 } as React.CSSProperties}>
          <div className="w-full h-full rounded-full bg-orange-400/20 blur-3xl float-medium" />
        </div>
      </div>

      {/* Kartu kaca melayang (desktop) */}
      {isTextVisible && (
        <div className="hidden lg:block absolute inset-0 z-30 pointer-events-none" aria-hidden="true">
          <div className="mouse-layer absolute left-[5%] xl:left-[8%] top-[30%]" style={{ '--depth': 26 } as React.CSSProperties}>
            <div className="fade-rise" style={{ '--fade-delay': '900ms' } as React.CSSProperties}>
            <div className="float-slow flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-900/10 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <div className="font-outfit font-black text-lg text-slate-950 leading-none">4.9 / 5</div>
                <div className="font-space text-[10px] font-bold text-slate-500 tracking-wider mt-1">RATING WISATAWAN</div>
              </div>
            </div>
            </div>
          </div>
          <div className="mouse-layer absolute right-[5%] xl:right-[8%] top-[56%]" style={{ '--depth': -34 } as React.CSSProperties}>
            <div className="fade-rise" style={{ '--fade-delay': '1100ms' } as React.CSSProperties}>
            <div className="float-medium flex items-center gap-3 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-900/10 px-4 py-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-amber-400 shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-outfit font-black text-lg text-slate-950 leading-none">10.000+</div>
                <div className="font-space text-[10px] font-bold text-slate-500 tracking-wider mt-1">PETUALANG PUAS</div>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide Navigation Arrows */}
      {slides.length > 1 && (
        <div className="hidden md:flex absolute inset-x-6 top-1/2 -translate-y-1/2 z-30 justify-between pointer-events-none">
          <button
            onClick={prevSlide}
            aria-label="Slide sebelumnya"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 pointer-events-auto cursor-pointer border border-white/60"
          >
            <ChevronLeft className="w-5 h-5 text-slate-800" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Slide berikutnya"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-white text-slate-800 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 pointer-events-auto cursor-pointer border border-white/60"
          >
            <ChevronRight className="w-5 h-5 text-slate-800" />
          </button>
        </div>
      )}

      {/* HP: indikator slide tipis di bawah, di atas foto */}
      {slides.length > 1 && (
        <div className="md:hidden absolute bottom-10 inset-x-0 z-30 flex justify-center gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.id || idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Pindah ke slide ${idx + 1}`}
              className={`h-1 rounded-full transition-all duration-500 ${idx === currentIndex ? 'w-7 bg-white' : 'w-3 bg-white/50'}`}
            />
          ))}
        </div>
      )}

      {/* Center Content Container */}
      <div ref={contentRef} className="relative z-20 max-w-5xl mx-auto px-5 sm:px-6 text-center flex flex-col items-center justify-start md:justify-center w-full md:min-h-[600px] will-change-transform">
        {/* Dynamic Typography Section (Only displayed if showText is ON for this slide) */}
        <div
          className={`transition-all duration-700 ease-in-out flex flex-col items-center w-full ${
            isTextVisible
              ? 'opacity-100 translate-y-0 max-h-[800px]'
              : 'opacity-0 -translate-y-4 max-h-0 pointer-events-none overflow-hidden my-0'
          }`}
        >
          {/* Top Badge with Active Slide Tag */}
          <div key={`badge-${currentIndex}`} className="fade-rise inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/70 border border-amber-200 shadow-sm mb-4 md:mb-6 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-space font-bold text-[10px] md:text-xs text-amber-900 tracking-wider">
              {currentSlide?.title || 'JEEP ADVENTURE EXPERIENCE • YOGYAKARTA'}
            </span>
          </div>

          {/* Main Headline */}
          <h1
            key={currentSlide?.headline || 'default-headline'}
            className="font-outfit font-black text-[2.1rem] min-[380px]:text-[2.35rem] sm:text-6xl md:text-7xl lg:text-[76px] tracking-[-0.03em] leading-[1.04] text-slate-950 max-w-4xl mb-4 md:mb-6"
          >
            {currentSlide?.headline ? (
              <SplitWords text={currentSlide.headline} startDelay={150} />
            ) : (
              <>
                <SplitWords text="Jelajahi Alam dengan" startDelay={150} />{' '}
                <span className="block sm:inline">
                  <SplitWords
                    text="Cara yang Berbeda"
                    startDelay={360}
                    wordClassName="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 bg-clip-text text-transparent animate-gradient"
                  />
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p
            key={currentSlide?.subheadline || 'default-sub'}
            className="fade-rise font-jakarta text-[15px] sm:text-xl text-slate-600 max-w-[22rem] sm:max-w-2xl leading-relaxed mb-6 md:mb-10 font-normal"
            style={{ '--fade-delay': '600ms' } as React.CSSProperties}
          >
            {currentSlide?.subheadline ||
              'Rasakan sensasi lava tour Jeep 4x4 di lereng Merapi, Jogja — taklukkan jalur lava track dan sungai berbatu, lalu temukan panorama magis Gunung Merapi.'}
          </p>
        </div>

        {/* Action Buttons (Stay accessible or positioned neatly at bottom) */}
        {isButtonVisible && (
          <div style={{ '--fade-delay': '800ms' } as React.CSSProperties} className={`fade-rise flex flex-row items-center justify-center gap-2.5 sm:gap-4 w-full sm:w-auto transition-all duration-500 ${
            isTextVisible ? 'md:mb-12 md:mt-2' : 'mt-auto pt-44 sm:pt-60 mb-6'
          }`}>
            <button
              onClick={() => onOpenBooking ? onOpenBooking() : document.getElementById('paket-wisata')?.scrollIntoView({ behavior: 'smooth' })}
              className="amber-gradient-btn card-shine overflow-hidden flex-1 sm:flex-none px-5 sm:px-8 py-3.5 sm:py-4 rounded-full font-space font-bold text-xs sm:text-sm text-slate-950 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 group cursor-pointer border border-amber-400/50 hover:-translate-y-0.5"
            >
              <span>PESAN SEKARANG</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-slate-950" />
            </button>

            <a
              href="#paket-wisata"
              className="shrink-0 px-5 sm:px-8 py-3.5 sm:py-4 rounded-full font-space font-semibold text-xs sm:text-sm text-slate-900 bg-white/90 hover:bg-white border border-slate-300/90 hover:border-slate-400 shadow-md backdrop-blur-md transition-all text-center"
            >
              <span className="sm:hidden">LIHAT PAKET</span>
              <span className="hidden sm:inline">JELAJAHI RUTE</span>
            </a>
          </div>
        )}

        {/* Slide Indicators (Dots) */}
        {slides.length > 1 && (
          <div className="hidden md:flex items-center gap-2 mb-8 bg-white/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/60 shadow-xs">
            {slides.map((s, idx) => (
              <button
                key={s.id || idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Pindah ke slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-amber-500 shadow-xs'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Scroll Indicator */}
        <a
          href="#tentang"
          className="hidden md:inline-flex flex-col items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors group cursor-pointer"
        >
          <span className="font-space font-semibold text-[11px] tracking-widest text-slate-500 group-hover:text-slate-800 uppercase">
            GULIR EKSPLORASI
          </span>
          <div className="w-7 h-7 rounded-full bg-white/90 border border-slate-200 flex items-center justify-center shadow-xs group-hover:translate-y-1 transition-transform">
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 animate-bounce" />
          </div>
        </a>
      </div>
    </section>
  );
}
