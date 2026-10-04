'use client';

import React, { useState } from 'react';
import { Plus, MessageCircle } from 'lucide-react';
import { Reveal } from '@/components/motion';
import SectionHeading, { Accent } from '@/components/SectionHeading';
import { FAQS } from '@/lib/site';
import { useSiteSettings } from '@/hooks/useSiteSettings';

/** Pertanyaan yang paling sering dicari wisatawan — juga dipakai untuk structured data FAQ. */
export default function FaqSection() {
  const contact = useSiteSettings();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="flow-section py-14 sm:py-20 lg:py-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-12 gap-8 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHeading
            chapter="09"
            eyebrow="Tanya jawab"
            title={<>Pertanyaan yang <Accent>Sering Ditanyakan</Accent></>}
            description="Semua yang perlu Anda tahu sebelum memesan jeep lava tour Merapi."
            className="!mb-6"
          />
          <Reveal variant="up" delay={200} className="hidden lg:block">
            <a
              href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent('Halo, saya ingin bertanya tentang paket jeep Merapi')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full hover:-translate-y-0.5 transition-transform"
            >
              <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </span>
              <span className="font-space font-bold text-xs text-slate-900 tracking-wider">TANYA LANGSUNG VIA WHATSAPP</span>
            </a>
          </Reveal>
        </div>

        <div className="lg:col-span-7 space-y-2.5">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={i} variant="up" delay={Math.min(i, 5) * 60}>
                <div className={`glass-card rounded-[20px] sm:rounded-[24px] transition-shadow ${isOpen ? 'shadow-lg shadow-amber-900/5' : ''}`}>
                  <h3>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 sm:px-6 sm:py-5 cursor-pointer"
                    >
                      <span className="font-outfit font-bold text-[15px] sm:text-base text-slate-900">{f.q}</span>
                      <span
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen ? 'bg-amber-500 text-slate-950 rotate-45' : 'bg-slate-900/5 text-slate-600'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </span>
                    </button>
                  </h3>
                  {/* Jawaban tetap ada di HTML (baik untuk SEO), hanya disembunyikan secara visual */}
                  <div
                    id={`faq-${i}`}
                    className={`grid transition-all duration-500 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 sm:px-6 sm:pb-6 -mt-1 font-jakarta text-sm leading-relaxed text-slate-600">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
