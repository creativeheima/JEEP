'use client';

import React from 'react';
import Image from 'next/image';
import { Shield, Award, Camera, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';

interface CollageSectionProps {
  onOpenBooking?: () => void;
}

export default function CollageSection({ onOpenBooking }: CollageSectionProps) {
  return (
    <section id="tentang" className="relative py-20 lg:py-28 bg-white overflow-hidden border-t border-slate-100">
      {/* Background Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image
          src="/images/img_1_48_mount_merapi_watermark.png"
          alt="Mount Merapi Watermark"
          fill
          className="object-cover object-top mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Photo Editorial Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Primary Large Image */}
              <div className="relative h-[380px] sm:h-[440px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/images/img_1_53_jeep_cruising_through_volcanic_off-road_track_mount_merapi.png"
                  alt="Jeep cruising volcanic off-road track"
                  fill
                  className="object-cover object-center hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Top Badge */}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-md border border-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="font-space font-bold text-[11px] text-slate-900 tracking-wider">
                    BASECAMP RESMI KALIURANG
                  </span>
                </div>

                {/* Bottom Overlay Info Banner */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-5 text-white">
                  <div className="font-space font-bold text-xs text-amber-400 tracking-wider uppercase mb-1">
                    TITIK EKSPEDISI
                  </div>
                  <div className="font-outfit font-bold text-lg sm:text-xl text-white">
                    Lereng Selatan Gunung Merapi
                  </div>
                </div>
              </div>

              {/* Secondary Overlapping Image Card */}
              <div className="absolute -bottom-8 -right-4 sm:-right-8 w-44 sm:w-56 h-48 sm:h-60 rounded-2xl overflow-hidden shadow-2xl border-4 border-white hidden sm:block">
                <Image
                  src="/images/img_1_66_travelers_cheering_in_the_open_jeep.png"
                  alt="Travelers cheering in the jeep"
                  fill
                  className="object-cover object-center hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                  <span className="font-space font-bold text-[11px] text-white tracking-wide">
                    Momen Seru Penumpang
                  </span>
                </div>
              </div>

              {/* 100% Safety Badge */}
              <div className="absolute -top-4 -right-2 sm:-right-4 bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl shadow-lg font-space font-extrabold text-xs flex items-center gap-1.5 border-2 border-white">
                <Shield className="w-4 h-4 text-slate-950 fill-current" />
                <div>
                  <div className="leading-none text-[11px] font-black">100% SAFETY</div>
                  <div className="text-[9px] font-semibold text-slate-800">CERTIFIED GUIDE</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Text & Benefits */}
          <div className="lg:col-span-6 space-y-6">
            {/* Section Tag */}
            <div className="flex items-center gap-2 font-space">
              <span className="text-amber-600 font-bold text-xs tracking-wider">01 / INTRO</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-900 font-bold text-xs tracking-widest uppercase bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                MERAPI JEEP EXPERIENCE
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="font-outfit font-black text-2xl sm:text-3xl lg:text-4xl text-slate-950 tracking-tight leading-tight">
              Petualangan Dimulai di Sini, Menembus Jejak Vulkanik Legendaris
            </h2>

            {/* Paragraph Description */}
            <p className="font-jakarta text-slate-600 text-sm sm:text-base leading-relaxed">
              Menembus aroma belerang tipis, melintasi hamparan pasir hitam muntahan lahar dingin, dan memacu adrenalin di jalur air Kali Kuning. Bersama kami, Anda tidak sekadar berwisata, tetapi merasakan hembusan sejarah ketangguhan lereng Merapi secara langsung dan intim.
            </p>

            {/* Location Coordinates Strip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-space font-bold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span>LAT -7.5407° S | LONG 110.4457° E • SLEMAN, D.I. YOGYAKARTA</span>
            </div>

            {/* 3 Key Guarantees / Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2 font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="font-outfit font-bold text-xs sm:text-sm text-slate-900 mb-1">SNI & Rollcage</h4>
                <p className="font-work text-[11px] text-slate-500 leading-tight">
                  Kabin kokoh dan helm berstandar SNI.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2 font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="font-outfit font-bold text-xs sm:text-sm text-slate-900 mb-1">Asuransi Lengkap</h4>
                <p className="font-work text-[11px] text-slate-500 leading-tight">
                  Kemitraan resmi Jasa Raharja seluruh tamu.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-amber-200 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center mb-2 font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <h4 className="font-outfit font-bold text-xs sm:text-sm text-slate-900 mb-1">Free Dokumentasi</h4>
                <p className="font-work text-[11px] text-slate-500 leading-tight">
                  Driver siap abadikan momen sinematik terbaik.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <a
                href="#paket-wisata"
                className="amber-gradient-btn px-6 py-3 rounded-xl font-space font-bold text-xs text-slate-950 shadow-md flex items-center gap-2 group"
              >
                <span>PILIH RUTE PERJALANAN</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#fasilitas"
                className="px-6 py-3 rounded-xl font-space font-bold text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                KENALI KAMI
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
