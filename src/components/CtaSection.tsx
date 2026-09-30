'use client';

import React from 'react';
import Image from 'next/image';
import { MessageSquare, PhoneCall, CheckCircle, ShieldCheck, Zap } from 'lucide-react';

interface CtaSectionProps {
  onOpenBooking?: () => void;
}

export default function CtaSection({ onOpenBooking }: CtaSectionProps) {
  return (
    <section id="kontak" className="relative py-24 lg:py-32 bg-white overflow-hidden border-t border-slate-200 section-edge">
      <div className="section-line" aria-hidden="true" />
      {/* Background Watermark with subtle sunrise overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <Image
          src="/images/img_1_670_mount_merapi_sunrise_jeep_watermark.png"
          alt="Mount Merapi Sunrise Jeep Watermark"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/70 to-white" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Warning/Urgency Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 font-space font-bold text-xs tracking-wider uppercase mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
          <span>SLOT TERBATAS SAAT WEEKEND & HARI LIBUR</span>
        </div>

        {/* Big Closing Headline */}
        <h2 className="font-outfit font-black text-3xl sm:text-5xl lg:text-6xl text-slate-950 tracking-tight leading-tight mb-6">
          Siap Memulai Petualangan Vulkanikmu Hari Ini?
        </h2>

        {/* Paragraph */}
        <p className="font-work text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10">
          Amankan armada Jeep 4x4 pilihanmu sekarang. Proses reservasi instan tanpa ribet, langsung terhubung dengan tim operasional di Basecamp.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => onOpenBooking ? onOpenBooking() : window.open('https://wa.me/6281234567890?text=Halo%20Merapi%20Jeep%20Adventure,%20saya%20ingin%20booking%20Jeep', '_blank')}
            className="amber-gradient-btn w-full sm:w-auto px-8 py-4 rounded-xl font-space font-bold text-xs sm:text-sm text-slate-950 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-slate-950" />
            <span>PESAN SEKARANG VIA WHATSAPP</span>
          </button>

          <a
            href="https://wa.me/6281234567890?text=Halo,%20saya%20ingin%20konsultasi%20rute%20jeep%20merapi"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl font-space font-bold text-xs sm:text-sm text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-slate-700" />
            <span>KONSULTASI GRATIS</span>
          </a>
        </div>

        {/* 3 Trust Signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-space font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Konfirmasi Instan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-amber-600" />
            <span>Pembatalan Fleksibel</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Driver Berlisensi Asosiasi</span>
          </div>
        </div>

      </div>
    </section>
  );
}
