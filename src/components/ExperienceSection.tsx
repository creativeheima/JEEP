'use client';

import React from 'react';
import { Star, Quote, Instagram } from 'lucide-react';
import { Reveal, ParallaxImage } from '@/components/motion';
import SectionHeading, { Accent } from '@/components/SectionHeading';

const STORY = {
  image: '/images/img_1_443_travelers_smiling_in_4x4_jeep_with_mount_merapi_in_the_background.png',
  tag: 'Sunrise Expedition',
  caption: 'Trio Sahabat Jakarta • Rute Kaliadem',
  quote:
    'Awalnya ragu karena bawa anak-anak, tapi driver Mas Doni sangat perhatian dan mengemudi dengan sangat hati-hati di tanjakan curam. Pas masuk sungai Kali Kuning semua ketawa lepas. Foto-foto yang diambil driver hasilnya cinematic banget!',
  name: 'Keluarga Pak Arisandi',
  origin: 'Liburan keluarga dari Surabaya',
  pkg: 'Paket Medium',
};

function Stars({ size = 'w-4 h-4' }: { size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`${size} fill-amber-400 text-amber-400`} />
      ))}
    </div>
  );
}

export default function ExperienceSection() {
  return (
    <section id="pengalaman" className="flow-section py-14 sm:py-20 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          chapter="05"
          eyebrow="Traveler stories"
          align="center"
          title={<>Setiap Perjalanan <Accent>Punya Cerita</Accent></>}
          description="Momen kebersamaan, senyuman, dan ketegangan off-road bersama sahabat serta keluarga tercinta."
        />

        {/* ===== HP: satu kartu cerita, kutipan menempel di atas foto ===== */}
        <Reveal variant="zoom" className="md:hidden">
          <article className="relative aspect-[4/5] rounded-[28px] overflow-hidden shadow-2xl shadow-slate-900/20">
            <ParallaxImage src={STORY.image} alt={STORY.caption} speed={0.1} sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/0" />

            <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-space font-black text-[9px] tracking-wider uppercase">
                {STORY.tag}
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-space font-bold text-[9px]">
                <Instagram className="w-3 h-3" /> @merapijeep_adventure
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4">
              <Stars size="w-3.5 h-3.5" />
              <p className="mt-2 font-jakarta text-[13px] leading-relaxed text-white/90 line-clamp-4">
                “{STORY.quote}”
              </p>
              <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-outfit font-bold text-sm text-white truncate">{STORY.name}</div>
                  <div className="font-jakarta text-[11px] text-white/60 truncate">{STORY.origin}</div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 font-space font-bold text-[9px] tracking-wider uppercase">
                  {STORY.pkg}
                </span>
              </div>
            </div>
          </article>
        </Reveal>

        {/* ===== Tablet & desktop: foto besar + kartu kutipan yang menumpuk ===== */}
        <div className="hidden md:block relative">
          <Reveal variant="left">
            <div className="relative w-[64%] h-[480px] lg:h-[540px] rounded-[36px] overflow-hidden shadow-2xl shadow-slate-900/20 group">
              <ParallaxImage
                src={STORY.image}
                alt={STORY.caption}
                speed={0.12}
                sizes="64vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-[1400ms] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
              <span className="absolute top-5 left-5 px-3 py-1.5 rounded-full bg-amber-400 text-slate-950 font-space font-black text-[10px] tracking-wider uppercase">
                {STORY.tag}
              </span>
              <div className="absolute bottom-6 left-6 text-white">
                <div className="font-outfit font-bold text-xl">{STORY.caption}</div>
                <div className="mt-1 flex items-center gap-1.5 font-space text-xs text-amber-300">
                  <Instagram className="w-3.5 h-3.5" /> @merapijeep_adventure
                </div>
              </div>
            </div>
          </Reveal>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[46%]">
            <Reveal variant="right" delay={200}>
              <figure className="glass-card relative rounded-[32px] p-6 lg:p-10">
                <Quote className="absolute top-6 right-6 w-14 h-14 text-amber-200/70" aria-hidden="true" />
                <div className="flex items-center gap-2">
                  <Stars />
                  <span className="font-space font-bold text-xs text-slate-700">5.0</span>
                </div>
                <blockquote className="mt-5 font-jakarta text-base lg:text-xl leading-relaxed text-slate-800">
                  “{STORY.quote}”
                </blockquote>
                <figcaption className="mt-7 pt-6 border-t border-slate-200/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white font-outfit font-black text-sm flex items-center justify-center">
                      KA
                    </span>
                    <div>
                      <div className="font-outfit font-bold text-slate-900">{STORY.name}</div>
                      <div className="font-jakarta text-xs text-slate-500">{STORY.origin}</div>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-900 font-space font-bold text-[10px] tracking-wider uppercase">
                    {STORY.pkg}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
