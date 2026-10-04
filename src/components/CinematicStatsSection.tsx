'use client';

import React from 'react';
import { Mountain, ShieldCheck, ThumbsUp } from 'lucide-react';
import { Reveal, ParallaxImage, CountUp } from '@/components/motion';
import SectionHeading, { Accent } from '@/components/SectionHeading';

const STATS = [
  { number: '20+', title: 'Rute off-road', desc: 'Dari lereng berpasir hingga sungai berbatu', icon: Mountain },
  { number: '50+', title: 'Unit 4x4 prima', desc: 'Inspeksi mekanik rutin setiap pagi', icon: ShieldCheck },
  { number: '10K+', title: 'Wisatawan puas', desc: 'Garansi keselamatan & kenyamanan penuh', icon: ThumbsUp },
];

export default function CinematicStatsSection() {
  return (
    <section id="sensasi" className="flow-section py-14 sm:py-20 lg:py-24">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading
          chapter="03"
          eyebrow="Sensasi off-road nyata"
          align="center"
          title={<>Rasakan <Accent>Petualangannya</Accent></>}
          description="Jalur yang menantang. Pemandangan yang tak terlupakan."
          className="!mb-8 sm:!mb-12"
        />

        {/* Panel sinematik: foto Merapi + 3 angka dalam satu baris */}
        <Reveal variant="zoom">
          <div className="relative overflow-hidden rounded-[28px] sm:rounded-[40px] bg-slate-950 shadow-2xl shadow-slate-950/25 isolate">
            <ParallaxImage
              src="/images/img_1_312_mount_merapi_volcano_landscape_scenery.webp"
              alt="Jeep lava tour melintasi lereng Gunung Merapi, Yogyakarta"
              speed={0.15}
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-slate-950/20" />

            <div className="relative pt-28 sm:pt-56 lg:pt-72">
              <div className="grid grid-cols-3 divide-x divide-white/10 border-t border-white/10 bg-slate-950/30 backdrop-blur-md">
                {STATS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <Reveal key={s.title} variant="up" delay={200 + i * 120} className="px-2 py-5 sm:px-8 sm:py-9 text-center sm:text-left">
                      <Icon className="hidden sm:block w-5 h-5 text-amber-400 mb-4" />
                      <div className="font-outfit font-black text-[1.75rem] leading-none sm:text-5xl lg:text-6xl text-white tracking-[-0.04em]">
                        <CountUp value={s.number} suffixClassName="text-amber-400" />
                      </div>
                      <div className="mt-2 sm:mt-3 font-space font-bold text-[9px] sm:text-xs tracking-[0.14em] uppercase text-white/70">
                        {s.title}
                      </div>
                      <p className="hidden md:block mt-1.5 font-jakarta text-sm text-white/50 leading-relaxed">{s.desc}</p>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
