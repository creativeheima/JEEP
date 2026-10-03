'use client';

import React from 'react';
import { MessageSquare, PhoneCall, CheckCircle, ShieldCheck, Zap } from 'lucide-react';
import { Reveal, ParallaxImage } from '@/components/motion';

interface CtaSectionProps {
  onOpenBooking?: () => void;
}

export default function CtaSection({ onOpenBooking }: CtaSectionProps) {
  return (
    <section id="kontak" className="flow-section pt-10 pb-0 lg:pt-16">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal variant="zoom">
          {/* Kartu imersif gelap — jembatan visual menuju footer */}
          <div className="relative overflow-hidden rounded-[36px] sm:rounded-[48px] bg-slate-950 shadow-2xl shadow-slate-950/30 isolate">
            <ParallaxImage
              src="/images/img_1_670_mount_merapi_sunrise_jeep_watermark.png"
              alt="Jeep Merapi saat sunrise di Kaliurang"
              speed={0.18}
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-center opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[70%] h-72 pointer-events-none">
              <div className="w-full h-full rounded-full bg-amber-500/30 blur-3xl float-slow" />
            </div>

            <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:py-28 text-center">
              {/* Bab */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="font-space font-bold text-xs text-amber-400 tabular-nums">10</span>
                <span className="h-px w-10 bg-gradient-to-r from-amber-400 to-amber-400/0" />
                <span className="font-space font-bold text-[11px] tracking-[0.22em] uppercase text-slate-400">
                  Siap berangkat
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-amber-300 font-space font-bold text-[11px] tracking-wider uppercase mb-8">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Slot terbatas saat weekend & hari libur</span>
              </div>

              <h2 className="font-outfit font-black text-4xl sm:text-6xl lg:text-7xl text-white tracking-[-0.035em] leading-[1.02] max-w-4xl mx-auto text-balance mb-6">
                Siap Memulai{' '}
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-400 bg-clip-text text-transparent animate-gradient">
                  Petualangan Vulkanikmu
                </span>{' '}
                Hari Ini?
              </h2>

              <p className="font-jakarta text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10">
                Amankan armada Jeep 4x4 pilihanmu sekarang. Proses reservasi instan tanpa ribet, langsung terhubung dengan tim operasional di Basecamp.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
                <button
                  onClick={() => onOpenBooking ? onOpenBooking() : window.open('https://wa.me/6281234567890?text=Halo%20Merapi%20Jeep%20Adventure,%20saya%20ingin%20booking%20Jeep', '_blank')}
                  className="amber-gradient-btn card-shine overflow-hidden hover:-translate-y-0.5 w-full sm:w-auto px-8 py-4 rounded-full font-space font-bold text-xs sm:text-sm text-slate-950 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-slate-950" />
                  <span>PESAN SEKARANG VIA WHATSAPP</span>
                </button>

                <a
                  href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20konsultasi%20rute%20jeep%20merapi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-space font-bold text-xs sm:text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-colors flex items-center justify-center gap-2"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>KONSULTASI GRATIS</span>
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-space font-medium text-slate-400">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Konfirmasi Instan</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  <span>Pembatalan Fleksibel</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Driver Berlisensi Asosiasi</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      {/* Kartu CTA "menggantung" di atas footer gelap */}
      <div className="relative h-24 sm:h-32 -mt-12 sm:-mt-16 bg-[#0a0f1d] rounded-t-[36px] sm:rounded-t-[56px]" aria-hidden="true" />
    </section>
  );
}
