'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Camera, Eye, X, Play, Instagram, Film, Grid3x3 } from 'lucide-react';
import { GalleryItem } from '@/types/gallery';
import { Reveal } from '@/components/motion';
import SectionHeading, { Accent } from '@/components/SectionHeading';
import GalleryFeed from '@/components/GalleryFeed';

const PREVIEW_MOBILE = 5;
const PREVIEW_DESKTOP = 6;

const isVideoItem = (item: GalleryItem) => item.type === 'INSTAGRAM_VIDEO' || item.category === 'VIDEO REELS';

/** Satu kotak foto/video. `compact` = versi kecil untuk HP & galeri lengkap. */
function GalleryTile({
  item,
  onOpen,
  className = '',
  compact = false,
}: {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
  className?: string;
  compact?: boolean;
}) {
  const isVideo = isVideoItem(item);
  const displayImage = isVideo ? item.thumbnailUrl || item.mediaUrl : item.mediaUrl;
  const showImage = !!displayImage && !/instagram\.com/i.test(displayImage);

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={`card-lift card-shine relative block w-full overflow-hidden group cursor-pointer text-left bg-slate-900 ${
        compact ? 'rounded-[20px] sm:rounded-[24px]' : 'rounded-[24px] sm:rounded-[28px]'
      } ${className}`}
    >
      {showImage ? (
        <Image
          src={displayImage as string}
          alt={item.title}
          fill
          sizes={compact ? '(max-width: 1024px) 50vw, 25vw' : '(max-width: 1024px) 100vw, 33vw'}
          className="object-cover object-center group-hover:scale-110 transition-transform duration-[1200ms] ease-out"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Instagram className="w-10 h-10 text-slate-700" />
        </div>
      )}

      <div className={`absolute inset-0 bg-gradient-to-t ${isVideo ? 'from-slate-950/90 via-slate-950/30 to-purple-950/10' : 'from-slate-950/80 via-slate-950/0 to-transparent'}`} />

      {/* Badge */}
      <div className={`absolute flex items-center justify-between ${compact ? 'top-2 left-2 right-2' : 'top-3 left-3 right-3'}`}>
        {isVideo ? (
          <span className={`flex items-center gap-1 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-space font-bold tracking-wider rounded-full shadow-lg ${compact ? 'text-[8px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'}`}>
            <Instagram className={compact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'} />
            REEL
          </span>
        ) : (
          <span className={`bg-slate-950/60 backdrop-blur-sm text-white font-space font-bold tracking-wider rounded-full ${compact ? 'text-[8px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'}`}>
            {item.category}
          </span>
        )}
        {isVideo && !compact && (
          <span className="flex items-center gap-1 text-[10px] font-space font-semibold bg-black/60 backdrop-blur-sm text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
            <Film className="w-3 h-3" />
            Video
          </span>
        )}
      </div>

      {/* Ikon tengah */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isVideo ? (
          <div className={`rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform ${compact ? 'w-10 h-10' : 'w-14 h-14'}`}>
            <Play className={`${compact ? 'w-4 h-4' : 'w-6 h-6'} ml-0.5 fill-white`} />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm items-center justify-center text-slate-950 shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all hidden sm:flex">
            <Eye className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Judul */}
      <div className={`absolute text-white ${compact ? 'bottom-2 left-2.5 right-2.5' : 'bottom-3 left-3 right-3'}`}>
        <h4 className={`font-outfit font-bold text-white drop-shadow-md line-clamp-1 group-hover:text-amber-300 transition-colors ${compact ? 'text-[11px] sm:text-sm' : 'text-sm'}`}>
          {item.title}
        </h4>
        {item.caption && !compact && (
          <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{item.caption}</p>
        )}
      </div>
    </button>
  );
}

export default function GallerySection() {
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<{ items: GalleryItem[]; index: number } | null>(null);
  const [fullOpen, setFullOpen] = useState(false);
  const [fullTab, setFullTab] = useState('SEMUA');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Buka penampil ala TikTok, mulai dari item yang diklik, dalam daftar yang sedang tampil
  const openFeed = (list: GalleryItem[]) => (item: GalleryItem) => {
    const index = Math.max(0, list.findIndex((it) => it.id === item.id));
    setFeed({ items: list, index });
  };

  // Kunci scroll halaman & tutup dengan tombol Esc saat galeri lengkap terbuka
  useEffect(() => {
    if (!fullOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (feed) return;
      setFullOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [fullOpen, feed]);

  const tabs = [
    'SEMUA',
    'FOTO',
    'VIDEO INSTAGRAM',
    'JEEP ACTION',
    'DESTINASI',
    'WISATAWAN',
  ];

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data)) {
          setItems(json.data);
        }
      })
      .catch(err => console.error('Error fetching gallery:', err))
      .finally(() => setLoading(false));
  }, []);

  const filterBy = (tab: string) => (item: GalleryItem) => {
    if (tab === 'SEMUA') return true;
    if (tab === 'FOTO') return item.type === 'PHOTO';
    if (tab === 'VIDEO INSTAGRAM') return isVideoItem(item);
    return item.category === tab;
  };
  const filteredItems = items.filter(filterBy(activeTab));
  const fullItems = items.filter(filterBy(fullTab));

  const renderTabs = (current: string, onChange: (t: string) => void, dark = false) => (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
      {tabs.map((tab) => {
        const isVideoTab = tab === 'VIDEO INSTAGRAM';
        const isActive = current === tab;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full font-space font-bold text-[10px] sm:text-[11px] tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? isVideoTab
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md'
                  : dark ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-white shadow-sm'
                : dark ? 'text-slate-300 bg-white/5 hover:bg-white/10' : 'text-slate-600 bg-white/60 sm:bg-transparent hover:text-slate-950 hover:bg-white/70'
            }`}
          >
            {isVideoTab && <Instagram className="w-3.5 h-3.5" />}
            {tab}
          </button>
        );
      })}
    </div>
  );

  return (
    <section id="galeri" className="flow-section py-14 sm:py-20 lg:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Filter Tabs */}
        <SectionHeading
          chapter="07"
          eyebrow="Dokumentasi asli & reels"
          title={<>Momen Seru di <Accent>Jalur Merapi</Accent></>}
          description="Foto otentik ekspedisi lava tour dan cuplikan video reels aksi ekstrem yang viral di Instagram."
          aside={
            <div className="sm:glass-card sm:p-1.5 sm:rounded-2xl max-w-full">
              {renderTabs(activeTab, setActiveTab)}
            </div>
          }
        />

        {/* Gallery Preview — hanya beberapa item; sisanya di galeri lengkap */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className={`rounded-[22px] sm:rounded-[28px] bg-slate-200/60 animate-pulse ${n === 1 ? 'col-span-2 lg:col-span-1 aspect-[16/10] lg:aspect-auto lg:h-72' : 'aspect-square lg:aspect-auto lg:h-72'} ${n > 5 ? 'hidden lg:block' : ''}`} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="glass-card text-center py-16 rounded-[28px]">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-outfit font-bold text-slate-700 text-lg">Belum Ada Konten di Kategori Ini</h3>
            <p className="text-slate-500 text-sm mt-1">Admin dapat menambahkan foto atau video baru melalui Dashboard Admin.</p>
          </div>
        ) : (
          <>
            <div key={activeTab} className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
              {filteredItems.slice(0, PREVIEW_DESKTOP).map((item, idx) => (
                <Reveal
                  key={item.id}
                  variant="up"
                  delay={(idx % 3) * 100}
                  className={`${idx === 0 ? 'col-span-2 lg:col-span-1' : ''} ${idx >= PREVIEW_MOBILE ? 'hidden lg:block' : ''}`}
                >
                  <GalleryTile
                    item={item}
                    onOpen={openFeed(filteredItems)}
                    className={idx === 0 ? 'aspect-[16/10] lg:aspect-auto lg:h-72' : 'aspect-square lg:aspect-auto lg:h-72'}
                    compact={idx !== 0}
                  />
                </Reveal>
              ))}
            </div>

            {/* Tombol buka galeri lengkap */}
            <Reveal variant="up" delay={150} className="mt-8 sm:mt-10 flex justify-center">
              <button
                onClick={() => setFullOpen(true)}
                className="group glass-card inline-flex items-center gap-3 pl-2 pr-5 py-2 rounded-full cursor-pointer hover:-translate-y-0.5 transition-transform"
              >
                <span className="flex -space-x-3">
                  {items.slice(0, 3).map((it) => (
                    <span key={it.id} className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-white bg-slate-200">
                      {(it.thumbnailUrl || (it.type === 'PHOTO' ? it.mediaUrl : '')) && (
                        <Image src={(it.thumbnailUrl || it.mediaUrl) as string} alt="" fill sizes="36px" className="object-cover" />
                      )}
                    </span>
                  ))}
                </span>
                <span className="text-left">
                  <span className="block font-space font-bold text-xs text-slate-900 tracking-wider">LIHAT SEMUA DOKUMENTASI</span>
                  <span className="block font-jakarta text-[11px] text-slate-500">{items.length} foto & video</span>
                </span>
                <span className="w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                  <Grid3x3 className="w-4 h-4" />
                </span>
              </button>
            </Reveal>
          </>
        )}

      </div>

      {/* Modal dirender ke <body> agar tampil di atas navbar */}
      {mounted && createPortal(
        <>
      {/* ===== Galeri Lengkap (full-screen) ===== */}
      {fullOpen && (
        <div className="fixed inset-0 z-[80] bg-slate-950 flex flex-col fade-rise" style={{ '--fade-delay': '0ms' } as React.CSSProperties}>
          {/* Header */}
          <div className="shrink-0 border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-3 sm:pt-6 sm:pb-4">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-space font-bold text-[10px] tracking-[0.22em] uppercase text-amber-400 mb-1">
                    Galeri Dokumentasi
                  </div>
                  <h3 className="font-outfit font-black text-2xl sm:text-3xl text-white tracking-tight">
                    Momen di Jalur Merapi
                  </h3>
                  <p className="font-jakarta text-xs text-slate-400 mt-0.5">{fullItems.length} dari {items.length} dokumentasi</p>
                </div>
                <button
                  onClick={() => setFullOpen(false)}
                  className="shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Tutup galeri"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderTabs(fullTab, setFullTab, true)}
            </div>
          </div>

          {/* Grid masonry */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
              {fullItems.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Camera className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                  <p className="font-jakarta text-sm">Belum ada konten di kategori ini.</p>
                </div>
              ) : (
                <div key={fullTab} className="columns-2 sm:columns-3 lg:columns-4 gap-2.5 sm:gap-4">
                  {fullItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="mb-2.5 sm:mb-4 break-inside-avoid fade-rise"
                      style={{ '--fade-delay': `${Math.min(idx, 12) * 40}ms` } as React.CSSProperties}
                    >
                      <GalleryTile
                        item={item}
                        onOpen={openFeed(fullItems)}
                        compact
                        className={['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[4/3]'][idx % 4]}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Penampil foto ala TikTok (geser vertikal) */}
      {feed && (
        <GalleryFeed items={feed.items} startIndex={feed.index} onClose={() => setFeed(null)} />
      )}
        </>,
        document.body
      )}
    </section>
  );
}
