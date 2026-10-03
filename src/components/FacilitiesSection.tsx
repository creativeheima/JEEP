'use client';

import React from 'react';
import Image from 'next/image';
import {
  Car,
  UserCheck,
  Fuel,
  ParkingCircle,
  Sparkles,
  Camera,
  Umbrella,
  ShieldCheck,
} from 'lucide-react';
import { Reveal, Parallax, ParallaxImage } from '@/components/motion';
import SectionHeading, { Accent } from '@/components/SectionHeading';

export default function FacilitiesSection() {
  const facilities = [
    {
      title: 'Armada 4x4 Prima',
      desc: 'Mesin dicek harian, ban off-road cengkeraman maksimal.',
      icon: Car,
    },
    {
      title: 'Driver & Pemandu',
      desc: 'Sertifikasi BNSP & Paguyuban Resmi Jeep Merapi.',
      icon: UserCheck,
    },
    {
      title: 'BBM & Retribusi',
      desc: 'Sudah termasuk tiket masuk pos desa & retribusi jalur.',
      icon: Fuel,
    },
    {
      title: 'Area Parkir Luas',
      desc: 'Mampu menampung puluhan mobil pribadi hingga bus besar.',
      icon: ParkingCircle,
    },
    {
      title: 'Mushola & Toilet',
      desc: 'Fasilitas MCK higienis untuk bilas setelah atraksi air.',
      icon: Sparkles,
    },
    {
      title: 'Bantuan Foto Video',
      desc: 'Pemandu proaktif mengarahkan pose & angle terbaik.',
      icon: Camera,
    },
    {
      title: 'Helm & Jas Hujan',
      desc: 'Disediakan gratis jika terjadi hujan di tengah rute.',
      icon: Umbrella,
    },
    {
      title: 'Asuransi Jiwa',
      desc: 'Jaminan premi asuransi resmi dari awal start hingga kembali.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="fasilitas" className="flow-section py-14 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background Watermark */}
      <Parallax speed={0.3} className="absolute inset-0 pointer-events-none opacity-[0.18] overflow-hidden fade-mask-y" innerClassName="absolute inset-x-0 -top-[20%] -bottom-[20%]">
        <Image
          src="/images/img_1_490_landscape_background.png"
          alt="" aria-hidden="true"
          fill
          className="object-cover object-center mix-blend-multiply"
        />
      </Parallax>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          chapter="06"
          eyebrow="Standar layanan all-inclusive"
          title={<>Semua Sudah <Accent>Kami Siapkan</Accent></>}
          description="Kenyamanan Anda dari mulai tiba di Basecamp hingga tur selesai adalah prioritas mutlak kami."
        />

        {/* Bento Grid: 1 kartu foto besar + 8 kartu fasilitas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 lg:auto-rows-[minmax(190px,auto)]">
          {/* Kartu utama (2x2 di desktop) */}
          <Reveal variant="zoom" className="sm:col-span-2 lg:row-span-2">
            <div className="card-shine relative h-full min-h-[200px] sm:min-h-[320px] rounded-[28px] sm:rounded-[32px] overflow-hidden shadow-xl shadow-slate-900/10 group">
              <ParallaxImage
                src="/images/img_1_53_jeep_cruising_through_volcanic_off-road_track_mount_merapi.png"
                alt="Armada jeep 4x4 lava tour Merapi melintasi jalur vulkanik"
                speed={0.1}
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-[1400ms] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
              <div className="absolute top-5 left-5 glass-card px-3 py-1.5 rounded-full font-space font-bold text-[10px] tracking-[0.18em] text-slate-900 uppercase">
                All-inclusive
              </div>
              <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 text-white">
                <div className="font-outfit font-black text-4xl sm:text-6xl tracking-[-0.04em] leading-none">
                  8<span className="text-amber-400">+</span>
                </div>
                <p className="font-outfit font-bold text-sm sm:text-xl mt-1.5 sm:mt-2 max-w-sm leading-snug">
                  Fasilitas sudah termasuk di setiap paket — tinggal datang dan nikmati.
                </p>
              </div>
            </div>
          </Reveal>

          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <Reveal key={idx} variant="up" delay={(idx % 4) * 80 + Math.floor(idx / 4) * 100} className="h-full hidden sm:block">
              <div className="card-lift glass-card h-full p-5 rounded-[24px] group flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 flex items-center justify-center group-hover:from-amber-400 group-hover:to-orange-500 group-hover:text-white transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-space font-bold text-[10px] text-slate-300 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="font-outfit font-bold text-base text-slate-900 mb-1.5">
                  {fac.title}
                </h3>
                <p className="font-work text-xs text-slate-500 leading-relaxed">
                  {fac.desc}
                </p>
              </div>
              </Reveal>
            );
          })}
        </div>

        {/* HP: kartu kecil geser kanan-kiri, tanpa keterangan */}
        <Reveal variant="right" className="sm:hidden mt-4">
          <div className="flex gap-2.5 overflow-x-auto snap-x snap-mandatory scroll-px-4 no-scrollbar -mx-4 px-4 pb-2">
            {facilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div
                  key={idx}
                  className="glass-card snap-start shrink-0 w-[30%] min-w-[104px] rounded-[20px] p-3 flex flex-col items-start gap-3"
                >
                  <div className="flex w-full items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 flex items-center justify-center">
                      <Icon className="w-[18px] h-[18px]" />
                    </div>
                    <span className="font-space font-bold text-[9px] text-slate-300 tabular-nums">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-outfit font-bold text-[12px] leading-tight text-slate-900">
                    {fac.title}
                  </h3>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-end gap-1 mt-1 font-space text-[10px] font-medium text-slate-400">
            <span>Geser untuk lihat semua</span>
            <span className="text-amber-600 font-bold">→</span>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
