'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, ChevronRight, Compass, MapPin, Sparkles, Waves, Shield, Flame } from 'lucide-react';

interface DestinationsSectionProps {
  onSelectDestination?: (name: string) => void;
}

export default function DestinationsSection({ onSelectDestination }: DestinationsSectionProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const destinations = [
    {
      id: 'bunker',
      num: '01',
      tag: '1.100 MDPL • SPOT FOTO UTAMA',
      badge: 'Spot Terpopuler',
      icon: Shield,
      title: 'Bunker Kaliadem & Lava Merapi',
      desc: 'Benteng pertahanan bawah tanah saksi bisu awan panas. Berdiri tepat di lereng atas Merapi dengan pemandangan puncak yang menjulang sangat dekat.',
      routeInfo: 'Rute: Short, Medium & Long',
      image: '/images/img_1_372_bunker_kaliadem.png',
    },
    {
      id: 'kalikuning',
      num: '02',
      tag: 'ADRENALINE ZONE • AIR & BEBATUAN',
      badge: 'Sensasi Manuver',
      icon: Waves,
      title: 'Jalur Off-Road Air Kali Kuning',
      desc: 'Puncak keseruan aksi jeep offroad melibas aliran sungai berbatu dengan manuver drift dan cipratan air setinggi kap mobil.',
      routeInfo: 'Rute: Medium & Long',
      image: '/images/img_1_390_jalur_off-road_air_kali_kuning.png',
    },
    {
      id: 'museum',
      num: '03',
      tag: 'HERITAGE & HISTORY • ERUPSI 2010',
      badge: 'Wisata Edukasi',
      icon: Flame,
      title: 'Museum Sisa Hartaku',
      desc: 'Rumah warga yang diabadikan dengan barang-barang meleleh akibat awan panas 600°C saat erupsi 2010. Jam dinding berhenti tepat pukul 00.05.',
      routeInfo: 'Rute: Semua Paket',
      image: '/images/img_1_408_museum_sisa_hartaku.png',
    },
    {
      id: 'batualien',
      num: '04',
      tag: 'NATURAL PHENOMENON • VIEW LEMBAH',
      badge: 'Fenomena Alam',
      icon: Sparkles,
      title: 'Batu Alien (Wajah Merapi)',
      desc: 'Batu vulkanik raksasa terlempar dari kawah Merapi yang membentuk siluet wajah manusia secara alami, menghadap langsung jurang Kali Gendol.',
      routeInfo: 'Rute: Short, Medium & Long',
      image: '/images/img_1_419_batu_alien_merapi.png',
    },
  ];

  const handleScrollTo = (index: number) => {
    setActiveIdx(index);
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.clientWidth * 0.85;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
    }
  };

  const handleNext = () => {
    const nextIdx = (activeIdx + 1) % destinations.length;
    handleScrollTo(nextIdx);
  };

  const handlePrev = () => {
    const prevIdx = (activeIdx - 1 + destinations.length) % destinations.length;
    handleScrollTo(prevIdx);
  };

  return (
    <section id="destinasi" className="relative py-14 sm:py-20 lg:py-28 bg-[#fbfbfe] overflow-hidden border-t border-slate-200/60 section-edge scroll-mt-20 lg:scroll-mt-24">
      <div className="section-line" aria-hidden="true" />
      
      {/* Mountain watermark background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image
          src="/images/img_1_357_mountain_peak_watermark.png"
          alt="Mountain Peak Watermark"
          fill
          className="object-cover object-top mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 font-space font-bold text-[11px] tracking-wider uppercase mb-2.5">
              <Compass className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>SPOT IKONIK JALUR MERAPI</span>
            </div>
            <h2 className="font-outfit font-black text-2xl sm:text-4xl lg:text-5xl text-slate-950 tracking-tight leading-tight">
              Destinasi Petualangan Legendaris
            </h2>
            <p className="font-work text-slate-600 text-xs sm:text-base leading-relaxed mt-2">
              Setiap sudut lereng menyimpan cerita ketangguhan bumi Jawa. Saksikan keagungan alam dan jejak sejarah dahsyatnya erupsi Merapi.
            </p>
          </div>

          {/* Desktop Navigation / Counter */}
          <div className="hidden sm:flex items-center gap-3 self-end">
            <button
              onClick={handlePrev}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
              title="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-xs text-slate-400">
              <strong className="text-slate-900">{activeIdx + 1}</strong> / {destinations.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs active:scale-95 cursor-pointer"
              title="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE VIEW: Horizontal Snap Slider with Peek & Controls (Phone only) */}
        <div className="block md:hidden">
          {/* Snap Container */}
          <div
            ref={scrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const cardWidth = el.scrollWidth / destinations.length;
              const current = Math.round(el.scrollLeft / cardWidth);
              if (current !== activeIdx && current >= 0 && current < destinations.length) {
                setActiveIdx(current);
              }
            }}
            className="flex gap-3.5 overflow-x-auto snap-x snap-mandatory pb-4 pt-1 px-1 -mx-4 px-4 no-scrollbar scroll-smooth"
          >
            {destinations.map((dest, i) => {
              const IconComponent = dest.icon;
              return (
                <div
                  key={dest.id}
                  className="snap-center shrink-0 w-[84vw] max-w-[340px] relative h-[420px] rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 flex flex-col justify-between p-4.5 transition-all duration-300 active:scale-[0.99]"
                >
                  {/* Background Image with Zoom */}
                  <Image
                    src={dest.image}
                    alt={dest.title}
                    fill
                    className="object-cover object-center"
                    priority={i === 0}
                  />

                  {/* Gradient overlays for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/20" />

                  {/* Top Bar inside Card */}
                  <div className="relative z-10 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 text-white font-mono font-bold text-xs">
                      <span className="text-amber-400">#</span>{dest.num}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-space font-bold text-[10px] uppercase shadow-xs">
                      <IconComponent className="w-3 h-3" />
                      <span>{dest.badge}</span>
                    </span>
                  </div>

                  {/* Bottom Content inside Card */}
                  <div className="relative z-10 text-white space-y-2">
                    <div className="font-space text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                      {dest.tag}
                    </div>

                    <h3 className="font-outfit font-black text-xl text-white leading-tight">
                      {dest.title}
                    </h3>

                    <p className="font-work text-xs text-slate-200/90 leading-relaxed line-clamp-3">
                      {dest.desc}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-white/15">
                      <span className="text-[10px] font-space text-slate-300 font-medium">
                        {dest.routeInfo}
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectDestination) {
                            onSelectDestination(dest.title);
                          } else {
                            const el = document.getElementById('paket-wisata');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-space font-bold text-[11px] transition-all shadow-xs cursor-pointer"
                      >
                        <span>Pesan Rute Ini</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Pagination Dots & Indicator */}
          <div className="flex items-center justify-between mt-3 px-1">
            <div className="flex items-center gap-1.5">
              {destinations.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleScrollTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIdx === i ? 'w-6 bg-amber-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            <span className="text-[11px] font-space text-slate-500 font-medium flex items-center gap-1">
              <span>Geser untuk spot lainnya</span>
              <span className="text-amber-600 font-bold">→</span>
            </span>
          </div>
        </div>

        {/* DESKTOP / TABLET VIEW: 2x2 Grid (Unchanged on large screens) */}
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {destinations.map((dest) => {
            const IconComponent = dest.icon;
            return (
              <div
                key={dest.id}
                className="relative h-[380px] lg:h-[420px] rounded-3xl overflow-hidden shadow-lg border border-slate-200 group flex flex-col justify-between p-6 lg:p-8 transition-all hover:shadow-2xl"
              >
                {/* Background Image */}
                <Image
                  src={dest.image}
                  alt={dest.title}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/20" />
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />

                {/* Top Strip */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-mono font-black text-amber-400 text-lg opacity-80">
                    {dest.num}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white font-space font-bold text-xs uppercase shadow-xs">
                    <IconComponent className="w-3.5 h-3.5 text-amber-400" />
                    <span>{dest.badge}</span>
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 text-white space-y-2.5">
                  <div className="inline-block bg-amber-500/95 backdrop-blur-xs text-slate-950 font-space font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded uppercase">
                    {dest.tag}
                  </div>

                  <h3 className="font-outfit font-black text-2xl lg:text-3xl text-white leading-tight">
                    {dest.title}
                  </h3>

                  <p className="font-work text-xs lg:text-sm text-slate-200/90 line-clamp-3 leading-relaxed">
                    {dest.desc}
                  </p>

                  <div className="pt-3 flex items-center justify-between border-t border-white/15">
                    <span className="text-xs font-space text-slate-300 font-medium">
                      {dest.routeInfo}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectDestination) {
                          onSelectDestination(dest.title);
                        } else {
                          const el = document.getElementById('paket-wisata');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="inline-flex items-center gap-2 font-space font-bold text-xs text-amber-400 hover:text-amber-300 transition-colors group/link cursor-pointer py-1"
                    >
                      <span>JELAJAHI RUTE INI</span>
                      <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
