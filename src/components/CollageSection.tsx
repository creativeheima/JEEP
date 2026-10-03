'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Shield, MapPin, ArrowRight } from 'lucide-react';
import { Reveal, Parallax, ParallaxImage } from '@/components/motion';

interface CollageSectionProps {
  onOpenBooking?: () => void;
}

interface CollageContent {
  headline: string;
  description: string;
  image1: string;
  image1Caption: string;
  image2: string;
  image2Caption: string;
}

const DEFAULT: CollageContent = {
  headline: 'Petualangan Dimulai di Sini, Menembus Jejak Vulkanik Legendaris',
  description: 'Menembus aroma belerang tipis, melintasi hamparan pasir hitam muntahan lahar dingin, dan memacu adrenalin di jalur air Kali Kuning. Bersama kami, Anda tidak sekadar berwisata, tetapi merasakan hembusan sejarah ketangguhan lereng Merapi secara langsung dan intim.',
  image1: '/images/img_1_53_jeep_cruising_through_volcanic_off-road_track_mount_merapi.png',
  image1Caption: 'Lereng Selatan Gunung Merapi',
  image2: '/images/img_1_66_travelers_cheering_in_the_open_jeep.png',
  image2Caption: 'Momen Seru Penumpang',
};

export default function CollageSection({ onOpenBooking }: CollageSectionProps) {
  const [content, setContent] = useState<CollageContent>(DEFAULT);

  useEffect(() => {
    fetch('/api/collage')
      .then(r => r.json())
      .then(res => { if (res.success && res.data) setContent(res.data); })
      .catch(() => {});
  }, []);

  return (
    <section id="tentang" className="flow-section pt-20 pb-14 sm:pb-20 lg:pt-28 lg:pb-24 overflow-hidden">
      {/* Background Watermark */}
      <Parallax speed={0.3} className="absolute inset-0 pointer-events-none opacity-[0.18] overflow-hidden fade-mask-y" innerClassName="absolute inset-x-0 -top-[20%] -bottom-[20%]">
        <Image
          src="/images/img_1_48_mount_merapi_watermark.png"
          alt="" aria-hidden="true"
          fill
          className="object-cover object-top mix-blend-multiply"
        />
      </Parallax>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Photo Collage */}
          <Reveal variant="left" className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Primary Image */}
              <div className="relative h-[380px] sm:h-[440px] rounded-[32px] overflow-hidden shadow-2xl shadow-slate-900/20 border-4 border-white group">
                {content.image1 ? (
                  <ParallaxImage
                    src={content.image1}
                    alt={content.image1Caption || 'Gambar utama'}
                    speed={0.12}
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-sm">Belum ada gambar</div>
                )}
                {/* Top Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-space font-bold text-[11px] text-slate-900 tracking-wider">BASECAMP RESMI KALIURANG</span>
                </div>
                {/* Bottom Overlay */}
                {content.image1Caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-5 text-white">
                    <div className="font-space font-bold text-xs text-amber-400 tracking-wider uppercase mb-1">TITIK EKSPEDISI</div>
                    <div className="font-outfit font-bold text-lg sm:text-xl text-white">{content.image1Caption}</div>
                  </div>
                )}
              </div>

              {/* Secondary Overlapping Card — bergerak lebih cepat (lapisan depan) */}
              {content.image2 && (
                <Parallax
                  speed={-0.12}
                  className="absolute -bottom-8 -right-4 sm:-right-8 w-44 sm:w-56 h-48 sm:h-60 hidden sm:block z-10"
                  innerClassName="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white group"
                >
                  <Image
                    src={content.image2}
                    alt={content.image2Caption || 'Gambar kedua'}
                    fill
                    className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  {content.image2Caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                      <span className="font-space font-bold text-[11px] text-white tracking-wide">{content.image2Caption}</span>
                    </div>
                  )}
                </Parallax>
              )}

              {/* Safety Badge */}
              <div className="float-medium absolute z-20 -top-4 -right-2 sm:-right-4 bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl shadow-lg font-space font-extrabold text-xs flex items-center gap-1.5 border-2 border-white">
                <Shield className="w-4 h-4 text-slate-950 fill-current" />
                <div>
                  <div className="leading-none text-[11px] font-black">100% SAFETY</div>
                  <div className="text-[9px] font-semibold text-slate-800">CERTIFIED GUIDE</div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right Column: Text */}
          <div className="lg:col-span-6 space-y-6">
            <Reveal variant="up" className="flex items-center gap-3">
              <span className="font-space font-bold text-xs text-amber-600 tabular-nums">01</span>
              <span className="h-px w-10 bg-gradient-to-r from-amber-500 to-amber-500/0" />
              <span className="font-space font-bold text-[11px] tracking-[0.22em] uppercase text-slate-500">
                Merapi Jeep Experience
              </span>
            </Reveal>

            <Reveal variant="blur" delay={100}>
              <h2 className="font-outfit font-black text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1.08] text-slate-950 tracking-[-0.03em] text-balance">
                {content.headline}
              </h2>
            </Reveal>

            <Reveal variant="up" delay={200}>
              <p className="font-jakarta text-slate-600 text-sm sm:text-base leading-relaxed">
                {content.description}
              </p>
            </Reveal>

            <Reveal variant="up" delay={260}>
            <div className="glass-card inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-space font-bold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>LAT -7.5407° S | LONG 110.4457° E • SLEMAN, D.I. YOGYAKARTA</span>
            </div>
            </Reveal>


            <Reveal variant="up" delay={500} className="flex flex-wrap items-center gap-4 pt-4">
              <a href="#paket-wisata" className="amber-gradient-btn px-6 py-3 rounded-full font-space font-bold text-xs text-slate-950 shadow-md flex items-center gap-2 group">
                <span>PILIH RUTE PERJALANAN</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </a>
              <a href="#fasilitas" className="glass-card px-6 py-3 rounded-full font-space font-bold text-xs text-slate-800 hover:text-amber-700 transition-colors">
                KENALI KAMI
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}