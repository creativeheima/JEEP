'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowUpRight, Compass, Sparkles } from 'lucide-react';

interface DestinationsSectionProps {
  onSelectDestination?: (name: string) => void;
}

export default function DestinationsSection({ onSelectDestination }: DestinationsSectionProps) {
  const destinations = [
    {
      id: 'bunker',
      tag: '1.100 MDPL • Spot Foto Utama',
      title: 'Bunker Kaliadem & Lava Merapi',
      desc: 'Benteng pertahanan bawah tanah saksi bisu awan panas wedhus gembel. Di sini, lereng Merapi tampak menjulang megah tepat di hadapan mata Anda.',
      image: '/images/img_1_372_bunker_kaliadem.png',
      isLarge: true,
    },
    {
      id: 'kalikuning',
      tag: 'ADRENALINE ZONE • Siap Berbasah Ria',
      title: 'Jalur Off-Road Air Kali Kuning',
      desc: 'Puncak keseruan di mana driver Jeep melakukan manuver drift di aliran sungai berbatu dengan cipratan air setinggi kap mobil.',
      image: '/images/img_1_390_jalur_off-road_air_kali_kuning.png',
      isLarge: true,
    },
    {
      id: 'museum',
      tag: 'HERITAGE & HISTORY',
      title: 'Museum Sisa Hartaku',
      desc: 'Rumah warga yang diabadikan dengan barang-barang meleleh akibat awan panas 600°C saat erupsi 2010. Jam dinding berhenti tepat pukul 00.05.',
      image: '/images/img_1_408_museum_sisa_hartaku.png',
      isLarge: false,
    },
    {
      id: 'batualien',
      tag: 'NATURAL PHENOMENON • View Lembah Kali Gendol',
      title: 'Batu Alien (Batu Wajah Merapi)',
      desc: 'Batu vulkanik berbobot tonase besar terlempar dari kawah Merapi yang membentuk guratan wajah manusia secara alami menghadap jurang lahar.',
      image: '/images/img_1_419_batu_alien_merapi.png',
      isLarge: false,
    },
  ];

  return (
    <section id="destinasi" className="relative py-20 lg:py-28 bg-[#fbfbfe] overflow-hidden border-t border-slate-200/60">
      {/* Mountain watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image
          src="/images/img_1_357_mountain_peak_watermark.png"
          alt="Mountain Peak Watermark"
          fill
          className="object-cover object-top mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="font-space font-bold text-xs text-amber-600 tracking-widest uppercase mb-2">
            SPOT IKONIK JALUR MERAPI
          </div>
          <h2 className="font-outfit font-black text-3xl sm:text-4xl text-slate-950 tracking-tight mb-3">
            Temukan Destinasi Petualangan
          </h2>
          <p className="font-work text-slate-600 text-sm sm:text-base leading-relaxed">
            Setiap kilometer menyimpan cerita ketangguhan bumi Jawa. Saksikan keagungan alam dan jejak sejarah dahsyatnya erupsi.
          </p>
        </div>

        {/* Editorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="relative h-[360px] sm:h-[400px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 group flex flex-col justify-end p-6 sm:p-8 transition-all hover:shadow-2xl"
            >
              {/* Background Image */}
              <Image
                src={dest.image}
                alt={dest.title}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlays for Deep Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/10 transition-colors" />

              {/* Content */}
              <div className="relative z-10 text-white space-y-3">
                <div className="inline-block bg-amber-500/90 backdrop-blur-xs text-slate-950 font-space font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded uppercase">
                  {dest.tag}
                </div>

                <h3 className="font-outfit font-bold text-2xl sm:text-3xl text-white leading-tight">
                  {dest.title}
                </h3>

                <p className="font-work text-xs sm:text-sm text-slate-200/90 line-clamp-3 leading-relaxed">
                  {dest.desc}
                </p>

                <div className="pt-2">
                  <a
                    href="#paket-wisata"
                    className="inline-flex items-center gap-2 font-space font-bold text-xs text-amber-400 hover:text-amber-300 transition-colors group/link"
                  >
                    <span>JELAJAHI RUTE INI</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
