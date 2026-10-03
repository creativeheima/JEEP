'use client';

import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import { Reveal } from '@/components/motion';
import SectionHeading, { Accent } from '@/components/SectionHeading';

export default function TestimonialsSection() {
  const testimonials = [
    {
      initials: 'RA',
      name: 'Rian Aditya & Istri',
      origin: 'Jakarta Selatan • Paket Sunrise',
      quote: '“Paket Sunrise benar-benar magis! Berangkat jam 04.30 pagi dengan udara dingin Merapi, lalu disambut matahari terbit tepat di samping kawah. Driver Mas Agus sangat handal dan jago motret!”',
      rating: 5,
    },
    {
      initials: 'DW',
      name: 'Dewi Wulandari & Fam',
      origin: 'Surabaya • Paket Medium',
      quote: '“Manuver di sungai Kali Kuning bikin anak-anak histeris senang banget. Airnya sejuk, sopirnya sangat ramah menjelaskan sejarah Museum Sisa Hartaku. Pasti kembali lagi.”',
      rating: 5,
    },
    {
      initials: 'HF',
      name: 'Hendro Fauzan',
      origin: 'Bandung • Corporate Outing',
      quote: '“Gathering kantor kami pesan 15 Jeep sekaligus. Koordinasi tim Merapi Jeep Adventure sangat rapi dari konvoi, briefing keselamatan hingga makan siang. Rekomendasi nomor 1!”',
      rating: 5,
    },
  ];

  return (
    <section id="ulasan" className="flow-section py-14 sm:py-20 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <SectionHeading
          chapter="08"
          eyebrow="Ulasan jujur"
          align="center"
          title={<>Mereka yang Sudah <Accent>Menguji Nyali</Accent></>}
          description="Ratusan keluarga, pecinta alam, dan rombongan kantor telah merasakan ketagihan serunya tur Jeep kami."
        />

        {/* Testimonials 3 Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((item, idx) => (
            <Reveal key={idx} variant="up" delay={idx * 140} className="h-full">
            <div
              className="card-lift h-full relative overflow-hidden glass-card rounded-[28px] p-7 flex flex-col justify-between group"
            >
              <Quote className="absolute -top-2 -right-2 w-24 h-24 text-amber-200/50 rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" aria-hidden="true" />
              <div className="relative space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="font-space font-bold text-xs text-slate-800 ml-1.5">5.0</span>
                </div>

                {/* Review Text */}
                <p className="font-work text-sm text-slate-600 leading-relaxed italic">
                  {item.quote}
                </p>
              </div>

              {/* Author Row */}
              <div className="relative flex items-center gap-3.5 pt-6 mt-6 border-t border-slate-200/70">
                <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 font-outfit font-bold text-sm flex items-center justify-center border border-amber-200 shrink-0">
                  {item.initials}
                </div>
                <div>
                  <div className="font-outfit font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <span>{item.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-100" />
                  </div>
                  <div className="font-work text-xs text-slate-500">
                    {item.origin}
                  </div>
                </div>
              </div>

            </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
}
