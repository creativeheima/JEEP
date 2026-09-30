'use client';

import React from 'react';
import Image from 'next/image';
import { Users, Clock, Check, Sparkles, Compass } from 'lucide-react';

interface PackagesSectionProps {
  onSelectPackage?: (pkgName: string, price: string) => void;
}

export const packagesData = [
  {
    id: 'short',
    badge: 'RUTE DASAR',
    subBadge: 'EKSPEDISI CEPAT',
    title: 'Paket Short',
    price: 'Rp 400.000',
    duration: '1.5 - 2 Jam',
    image: '/images/img_1_156_paket_short_merapi_jeep.png',
    destinations: [
      'Museum Sisa Hartaku (Erupsi 2010)',
      'Batu Alien (Batu Wajah Merapi)',
      'Bunker Kaliadem & Pemandangan Kawah',
      'Spot Foto Estetik Lereng Merapi',
    ],
    isFeatured: false,
    color: 'slate',
  },
  {
    id: 'medium',
    badge: 'BEST SELLER',
    subBadge: 'PALING DICARI WISATAWAN',
    title: 'Paket Medium',
    price: 'Rp 500.000',
    duration: '2 - 2.5 Jam',
    image: '/images/img_1_193_paket_medium_kali_kuning_splashing_water.png',
    destinations: [
      'Atraksi Basah Air Kali Kuning (Water Splash)',
      'Museum Sisa Hartaku',
      'Batu Alien (Batu Wajah Merapi)',
      'Bunker Kaliadem & Puncak Merapi',
      'Jalur Pasir Lava Bawah Lereng',
    ],
    isFeatured: true,
    featureText: 'PALING FAVORIT & REKOMENDASI',
    color: 'amber',
  },
  {
    id: 'long',
    badge: 'FULL ADVENTURE',
    subBadge: 'EKSPLORASI LENGKAP',
    title: 'Paket Long',
    price: 'Rp 600.000',
    duration: '3 - 3.5 Jam',
    image: '/images/img_1_243_paket_long_petilasan_mbah_maridjan.png',
    destinations: [
      'Petilasan Mbah Maridjan (Kinahrejo)',
      'Manuver Off-Road Air Kali Kuning',
      'Museum Sisa Hartaku',
      'Batu Alien & Lembah Gendol',
      'Bunker Kaliadem',
    ],
    isFeatured: false,
    color: 'slate',
  },
  {
    id: 'sunrise',
    badge: 'START 04:30',
    subBadge: 'MAGICAL DAWN',
    title: 'Paket Sunrise',
    price: 'Rp 550.000',
    duration: '2.5 - 3 Jam',
    image: '/images/img_1_280_paket_sunrise_merapi.png',
    destinations: [
      'Golden Sunrise Kaliadem View Point',
      'Sensasi Udara Dingin Fajar Gunung Merapi',
      'Bunker Kaliadem Eksklusif Pagi',
      'Batu Alien & Museum Sisa Hartaku',
    ],
    isFeatured: false,
    color: 'orange',
  },
];

export default function PackagesSection({ onSelectPackage }: PackagesSectionProps) {
  return (
    <section id="paket-wisata" className="relative py-20 lg:py-28 bg-[#fbfbfe] overflow-hidden border-t border-slate-200/60">
      {/* Offroad watermark layer */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image
          src="/images/img_1_134_offroad_trail_watermark.png"
          alt="Offroad Trail Watermark"
          fill
          className="object-cover object-center mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-space font-bold text-xs text-amber-600 tracking-widest uppercase mb-2">
              TARIF TRANSPARAN • ALL IN TANPA BIAYA TERSEMBUNYI
            </div>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
              Pilihan Paket Wisata
            </h2>
            <p className="font-jakarta text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
              Format visual editorial dengan foto-dominan. Pilih petualangan yang pas dengan waktu liburan dan denyut keberanianmu!
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm self-start md:self-auto font-space text-xs font-bold text-slate-800">
            <Users className="w-4 h-4 text-amber-600" />
            <span>1 Jeep = Kapasitas Maks. 4 Dewasa</span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 items-stretch">
          {packagesData.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative rounded-2xl bg-white transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-xl group ${
                pkg.isFeatured
                  ? 'border-2 border-amber-500 ring-4 ring-amber-500/10 -translate-y-1'
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Featured Ribbon */}
              {pkg.isFeatured && (
                <div className="absolute top-0 inset-x-0 z-20 bg-amber-500 text-slate-950 font-space font-black text-[10px] tracking-wider py-1.5 px-4 text-center uppercase flex items-center justify-center gap-1.5 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>{pkg.featureText}</span>
                </div>
              )}

              <div>
                {/* Photo with Overlay Info */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={pkg.image}
                    alt={pkg.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                  
                  {/* Top Category Badge */}
                  <div className={`absolute left-3 flex items-center gap-1.5 ${pkg.isFeatured ? 'top-10' : 'top-3'}`}>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-space font-extrabold tracking-wider ${
                      pkg.isFeatured ? 'bg-amber-400 text-slate-950' : 'bg-slate-950/80 text-white backdrop-blur-sm'
                    }`}>
                      {pkg.badge}
                    </span>
                  </div>

                  {/* Duration Tag */}
                  <div className={`absolute right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-space font-bold text-slate-900 flex items-center gap-1 ${pkg.isFeatured ? 'top-10' : 'top-3'}`}>
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{pkg.duration}</span>
                  </div>

                  {/* Title on Photo */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <div className="font-space font-bold text-[10px] text-amber-400 uppercase tracking-wider mb-0.5">
                      {pkg.subBadge}
                    </div>
                    <h3 className="font-outfit font-extrabold text-xl sm:text-2xl text-white">
                      {pkg.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content & Features */}
                <div className="p-5 space-y-4">
                  {/* Price Row */}
                  <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-space font-bold text-slate-400 uppercase block">Tarif per unit</span>
                      <span className="font-outfit font-black text-2xl text-slate-950">{pkg.price}</span>
                    </div>
                    <span className="text-xs font-space font-semibold text-slate-500">/ 4 org</span>
                  </div>

                  {/* Destination List */}
                  <div className="space-y-2.5 text-xs text-slate-600 font-work">
                    <div className="font-space font-bold text-[11px] text-slate-900 uppercase">
                      Destinasi Utama:
                    </div>
                    {pkg.destinations.map((dest, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{dest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectPackage ? onSelectPackage(pkg.title, pkg.price) : null}
                  className={`w-full py-3 rounded-xl font-space font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    pkg.isFeatured
                      ? 'amber-gradient-btn text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>PESAN PAKET</span>
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
