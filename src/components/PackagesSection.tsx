'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Users, Clock, Check, Sparkles, Compass } from 'lucide-react';
import { TourPackage } from '@/types/package';
import { defaultPackagesData } from '@/lib/defaultPackages';
import { Reveal, Parallax } from '@/components/motion';
import SectionHeading, { Accent } from '@/components/SectionHeading';
import { optimizedSrc } from '@/lib/media';

interface PackagesSectionProps {
  onSelectPackage?: (pkgName: string, price: string) => void;
}

// Data bawaan dipindah ke lib agar bisa dipakai juga di server (JSON-LD)
export { defaultPackagesData };

// Keep backward-compat export
export const packagesData = defaultPackagesData;

export default function PackagesSection({ onSelectPackage }: PackagesSectionProps) {
  const [packages, setPackages] = useState<TourPackage[]>(defaultPackagesData);
  const [mobileIdx, setMobileIdx] = useState(0);
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(res => { if (res.success && Array.isArray(res.data) && res.data.length > 0) setPackages(res.data); })
      .catch(() => {});
  }, []);

  return (
    <section id="paket-wisata" className="flow-section py-14 sm:py-20 lg:py-24 overflow-hidden">
      <Parallax speed={0.3} className="absolute inset-0 pointer-events-none opacity-[0.18] overflow-hidden fade-mask-y" innerClassName="absolute inset-x-0 -top-[20%] -bottom-[20%]">
        <Image src="/images/img_1_134_offroad_trail_watermark.webp" alt="" aria-hidden="true" fill className="object-cover object-center mix-blend-multiply" />
      </Parallax>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          chapter="02"
          eyebrow="Tarif transparan • all-in"
          title={<>Pilih <Accent>Petualanganmu</Accent></>}
          description="Empat paket jeep lava tour Merapi dengan karakter berbeda. Harga per jeep sudah termasuk driver, BBM, retribusi, dan dokumentasi — tanpa biaya tersembunyi."
          aside={
            <div className="glass-card inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-space text-xs font-bold text-slate-800">
              <Users className="w-4 h-4 text-amber-600" />
              <span>1 Jeep = Maks. 4 Dewasa</span>
            </div>
          }
        />

        {/* HP: kartu ringkas geser kanan-kiri */}
        <div className="md:hidden">
          <div
            ref={mobileScrollRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const card = el.firstElementChild as HTMLElement | null;
              if (!card) return;
              const idx = Math.round(el.scrollLeft / (card.offsetWidth + 12));
              if (idx !== mobileIdx) setMobileIdx(Math.max(0, Math.min(packages.length - 1, idx)));
            }}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 no-scrollbar -mx-4 px-4 pt-3 pb-4"
          >
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`snap-start shrink-0 w-[78%] max-w-[300px] rounded-[24px] bg-white/95 overflow-hidden flex flex-col shadow-lg shadow-slate-900/5 ${
                  pkg.isFeatured ? 'ring-2 ring-amber-500' : 'border border-white'
                }`}
              >
                {/* Foto */}
                <div className="relative h-32 w-full bg-slate-100">
                  {pkg.image && <Image src={optimizedSrc(pkg.image)} alt={`${pkg.title} jeep lava tour Merapi`} fill sizes="300px" className="object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    {pkg.isFeatured ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-space font-black text-[9px] tracking-wider uppercase">
                        <Sparkles className="w-3 h-3 fill-current" /> Favorit
                      </span>
                    ) : pkg.badge ? (
                      <span className="px-2 py-0.5 rounded-full bg-slate-950/70 backdrop-blur-sm text-white font-space font-bold text-[9px] tracking-wider uppercase">
                        {pkg.badge}
                      </span>
                    ) : <span />}
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-slate-900 font-space font-bold text-[9px]">
                      <Clock className="w-2.5 h-2.5 text-amber-600" /> {pkg.duration}
                    </span>
                  </div>
                  <h3 className="absolute bottom-2.5 left-3 right-3 font-outfit font-extrabold text-lg text-white leading-tight">
                    {pkg.title}
                  </h3>
                </div>

                {/* Isi */}
                <div className="p-3.5 flex-1 flex flex-col">
                  <div className="flex items-baseline justify-between">
                    <span className="font-outfit font-black text-xl text-slate-950">{pkg.price}</span>
                    <span className="font-space font-semibold text-[10px] text-slate-500">/ jeep · 4 org</span>
                  </div>
                  <ul className="mt-2.5 space-y-1 flex-1">
                    {pkg.destinations.slice(0, 3).map((d, i) => (
                      <li key={i} className="flex items-center gap-1.5 font-work text-[11px] text-slate-600">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="line-clamp-1">{d}</span>
                      </li>
                    ))}
                    {pkg.destinations.length > 3 && (
                      <li className="pl-[18px] font-space font-bold text-[10px] text-amber-700">
                        +{pkg.destinations.length - 3} destinasi lainnya
                      </li>
                    )}
                  </ul>
                  <button
                    onClick={() => onSelectPackage ? onSelectPackage(pkg.title, pkg.price) : null}
                    className={`mt-3 w-full py-2.5 rounded-full font-space font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-transform ${
                      pkg.isFeatured ? 'amber-gradient-btn text-slate-950' : 'bg-slate-900 text-white'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    PESAN PAKET
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Indikator */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              {packages.map((p, i) => (
                <button
                  key={p.id}
                  aria-label={`Paket ${i + 1}`}
                  onClick={() => {
                    const el = mobileScrollRef.current;
                    const card = el?.children[i] as HTMLElement | undefined;
                    if (el && card) el.scrollTo({ left: card.offsetLeft - 16, behavior: 'smooth' });
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${i === mobileIdx ? 'w-6 bg-amber-500' : 'w-2 bg-slate-300'}`}
                />
              ))}
            </div>
            <span className="font-space text-[10px] font-medium text-slate-400">
              Geser untuk paket lain <span className="text-amber-600 font-bold">→</span>
            </span>
          </div>
        </div>

        {/* Tablet & desktop: grid */}
        <div className={`hidden md:grid md:grid-cols-2 gap-6 items-stretch ${packages.length <= 2 ? 'lg:grid-cols-2' : packages.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
          {packages.map((pkg, idx) => (
            <Reveal key={pkg.id} variant="up" delay={idx * 110} className="h-full">
            <div
              className={`card-lift card-shine h-full relative rounded-[28px] bg-white/90 backdrop-blur flex flex-col justify-between overflow-hidden shadow-sm group ${
                pkg.isFeatured
                  ? 'border-2 border-amber-500 ring-4 ring-amber-500/10 -translate-y-1'
                  : 'border border-white shadow-slate-900/5 hover:border-amber-200'
              }`}
            >
              {pkg.isFeatured && (
                <div className="absolute top-0 inset-x-0 z-20 bg-amber-500 text-slate-950 font-space font-black text-[10px] tracking-wider py-1.5 px-4 text-center uppercase flex items-center justify-center gap-1.5 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>{pkg.featureText || 'PALING FAVORIT'}</span>
                </div>
              )}

              <div>
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100">
                  {pkg.image ? (
                    <Image src={optimizedSrc(pkg.image)} alt={`${pkg.title} jeep lava tour Merapi`} fill className="object-cover object-center group-hover:scale-110 transition-transform duration-[1200ms] ease-out" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-400 text-xs font-space">FOTO PAKET</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

                  <div className={`absolute left-3 flex items-center gap-1.5 ${pkg.isFeatured ? 'top-10' : 'top-3'}`}>
                    {pkg.badge && (
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-space font-extrabold tracking-wider ${pkg.isFeatured ? 'bg-amber-400 text-slate-950' : 'bg-slate-950/80 text-white backdrop-blur-sm'}`}>
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <div className={`absolute right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[10px] font-space font-bold text-slate-900 flex items-center gap-1 ${pkg.isFeatured ? 'top-10' : 'top-3'}`}>
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{pkg.duration}</span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    {pkg.subBadge && <div className="font-space font-bold text-[10px] text-amber-400 uppercase tracking-wider mb-0.5">{pkg.subBadge}</div>}
                    <h3 className="font-outfit font-extrabold text-xl sm:text-2xl text-white">{pkg.title}</h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-space font-bold text-slate-400 uppercase block">Tarif per unit</span>
                      <span className="font-outfit font-black text-2xl text-slate-950">{pkg.price}</span>
                    </div>
                    <span className="text-xs font-space font-semibold text-slate-500">/ 4 org</span>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-600 font-work">
                    <div className="font-space font-bold text-[11px] text-slate-900 uppercase">Destinasi Utama:</div>
                    {pkg.destinations.map((dest, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-tight">{dest}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => onSelectPackage ? onSelectPackage(pkg.title, pkg.price) : null}
                  className={`w-full py-3 rounded-full font-space font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    pkg.isFeatured
                      ? 'amber-gradient-btn text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>PESAN PAKET</span>
                </button>
              </div>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}