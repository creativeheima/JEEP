'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Quote, Instagram } from 'lucide-react';

export default function ExperienceSection() {
  return (
    <section id="pengalaman" className="py-20 lg:py-28 bg-white border-t border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="font-space font-bold text-xs text-amber-600 tracking-widest uppercase mb-2">
            TRAVELER STORIES
          </div>
          <h2 className="font-outfit font-black text-3xl sm:text-4xl text-slate-950 tracking-tight mb-3">
            Setiap Perjalanan Punya Cerita
          </h2>
          <p className="font-work text-slate-600 text-sm sm:text-lg leading-relaxed">
            Momen kebersamaan, senyuman, dan ketegangan off-road bersama sahabat serta keluarga tercinta.
          </p>
        </div>

        {/* Editorial Pairing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md">
          
          {/* Photo Side */}
          <div className="lg:col-span-6 relative h-[360px] sm:h-[420px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/images/img_1_443_travelers_smiling_in_4x4_jeep_with_mount_merapi_in_the_background.png"
              alt="Travelers smiling in 4x4 jeep"
              fill
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
            
            {/* Top Tag */}
            <div className="absolute top-4 left-4 bg-amber-500 text-slate-950 font-space font-extrabold text-[10px] tracking-wider px-3 py-1.5 rounded-full uppercase">
              SUNRISE EXPEDITION
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="font-outfit font-bold text-lg text-white mb-1">
                Trio Sahabat Jakarta • Rute Kaliadem
              </div>
              <div className="font-space text-xs text-amber-400 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5" />
                <span>@merapijeep_adventure</span>
              </div>
            </div>
          </div>

          {/* Review Story Side */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 lg:pl-4">
            {/* Rating */}
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current text-amber-400" />
              ))}
              <span className="font-space font-bold text-xs text-slate-800 ml-2">5.0 / 5.0 Rating</span>
            </div>

            {/* Big Quote */}
            <div className="relative pt-7">
              <Quote className="w-8 h-8 text-amber-200 absolute -top-1 left-0 -z-0 opacity-60" />
              <p className="relative z-10 font-work text-base sm:text-lg text-slate-700 leading-relaxed italic">
                “Awalnya ragu karena bawa anak-anak, tapi driver Mas Doni sangat perhatian dan mengemudi dengan sangat hati-hati di tanjakan curam. Pas masuk sungai Kali Kuning semua ketawa lepas. Foto-foto yang diambil driver hasilnya cinematic banget!”
              </p>
            </div>

            {/* Customer & Trip Details */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div>
                <div className="font-outfit font-bold text-slate-900 text-base">
                  Keluarga Pak Arisandi
                </div>
                <div className="font-work text-xs text-slate-500">
                  Liburan Keluarga dari Surabaya
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-amber-100/80 border border-amber-200 text-amber-900 font-space font-bold text-xs">
                Paket Medium (Best Seller)
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
