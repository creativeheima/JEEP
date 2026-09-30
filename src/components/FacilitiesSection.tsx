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
    <section id="fasilitas" className="relative py-20 lg:py-28 bg-[#fbfbfe] overflow-hidden border-t border-slate-200/60">
      {/* Background Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image
          src="/images/img_1_490_landscape_background.png"
          alt="Landscape Background"
          fill
          className="object-cover object-center mix-blend-multiply"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-space font-bold text-xs text-amber-600 tracking-widest uppercase mb-2">
              STANDAR LAYANAN ALL-INCLUSIVE
            </div>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
              Fasilitas Lengkap Perjalananmu
            </h2>
            <p className="font-work text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
              Kenyamanan Anda dari mulai tiba di Basecamp hingga tur selesai adalah prioritas mutlak kami.
            </p>
          </div>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-outfit font-bold text-base text-slate-900 mb-1.5">
                  {fac.title}
                </h3>
                <p className="font-work text-xs text-slate-500 leading-relaxed">
                  {fac.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
