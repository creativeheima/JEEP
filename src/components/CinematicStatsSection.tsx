'use client';

import React from 'react';
import Image from 'next/image';
import { Mountain, ShieldCheck, ThumbsUp } from 'lucide-react';

export default function CinematicStatsSection() {
  const stats = [
    {
      number: '20+',
      title: 'Rute Off-Road Vulkanik',
      desc: 'Dari lereng berpasir hingga sungai berbatu',
      icon: Mountain,
    },
    {
      number: '50+',
      title: 'Unit 4x4 Terawat Prima',
      desc: 'Inspeksi mekanik rutin setiap pagi',
      icon: ShieldCheck,
    },
    {
      number: '10,000+',
      title: 'Perjalanan Wisatawan Aman',
      desc: 'Garansi keselamatan dan kenyamanan penuh',
      icon: ThumbsUp,
    },
  ];

  return (
    <section className="relative py-24 lg:py-28 bg-white overflow-hidden border-t border-b border-slate-100 section-edge">
      <div className="section-line" aria-hidden="true" />
      {/* Background Volcano Landscape Watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <Image
          src="/images/img_1_312_mount_merapi_volcano_landscape_scenery.png"
          alt="Mount Merapi Scenery"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Tag */}
        <div className="inline-block font-space font-bold text-xs text-amber-700 tracking-widest uppercase bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 mb-4">
          SENSASI OFF-ROAD NYATA
        </div>

        {/* Title */}
        <h2 className="font-outfit font-black text-3xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tight mb-4">
          RASAKAN PETUALANGANNYA
        </h2>

        {/* Subtitle */}
        <p className="font-work text-base sm:text-2xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-16">
          Jalur yang menantang. Pemandangan yang tak terlupakan.
        </p>

        {/* 3 Prominent Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white/95 backdrop-blur-md rounded-2xl p-7 border border-slate-200/90 shadow-lg hover:shadow-xl hover:border-amber-300 transition-all group flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="font-outfit font-black text-4xl sm:text-5xl text-amber-600 mb-2 tracking-tight">
                  {stat.number}
                </div>
                <h3 className="font-outfit font-bold text-base sm:text-lg text-slate-900 mb-1.5">
                  {stat.title}
                </h3>
                <p className="font-work text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
                  {stat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
