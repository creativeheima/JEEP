'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronDown, ChevronUp, Heart, Instagram, Play, Share2, X } from 'lucide-react';
import { GalleryItem } from '@/types/gallery';

interface GalleryFeedProps {
  items: GalleryItem[];
  startIndex: number;
  onClose: () => void;
}

const isVideoItem = (item: GalleryItem) => item.type === 'INSTAGRAM_VIDEO' || item.category === 'VIDEO REELS';

const getInstagramEmbedUrl = (url?: string) => {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/i);
  return match?.[1] ? `https://www.instagram.com/reel/${match[1]}/embed/` : null;
};

const imageOf = (item: GalleryItem) => {
  const src = isVideoItem(item) ? item.thumbnailUrl || item.mediaUrl : item.mediaUrl;
  return src && !/instagram\.com/i.test(src) ? src : null;
};

/**
 * Penampil foto ala TikTok: geser vertikal satu layar penuh per foto/video,
 * ketuk dua kali untuk suka, tombol aksi di samping kanan.
 */
export default function GalleryFeed({ items, startIndex, onClose }: GalleryFeedProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastTap = useRef(0);
  const [active, setActive] = useState(startIndex);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [playing, setPlaying] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(true);

  // Mulai dari foto yang diklik
  useEffect(() => {
    const el = slideRefs.current[startIndex];
    if (el && scrollerRef.current) scrollerRef.current.scrollTop = el.offsetTop;
  }, [startIndex]);

  // Deteksi slide aktif
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.index);
            setActive(idx);
          }
        });
      },
      { root, threshold: 0.6 }
    );
    slideRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [items.length]);

  // Hentikan video & tutup caption saat pindah slide; sembunyikan petunjuk geser
  useEffect(() => {
    setPlaying(null);
    setExpanded(null);
    if (active !== startIndex) setShowHint(false);
  }, [active, startIndex]);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3500);
    return () => clearTimeout(t);
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      slideRefs.current[clamped]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [items.length]
  );

  // Kunci scroll halaman + keyboard
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown' || e.key === 'j') { e.preventDefault(); goTo(active + 1); }
      else if (e.key === 'ArrowUp' || e.key === 'k') { e.preventDefault(); goTo(active - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [active, goTo, onClose]);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const toggleLike = (id: string, force?: boolean) =>
    setLiked((prev) => ({ ...prev, [id]: force ?? !prev[id] }));

  // Ketuk dua kali = suka + animasi hati
  const handleTap = (e: React.MouseEvent<HTMLDivElement>, item: GalleryItem) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const id = now;
      setBursts((b) => [...b, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
      setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
      toggleLike(item.id, true);
    }
    lastTap.current = now;
  };

  const share = async (item: GalleryItem) => {
    const url = item.instagramUrl || (typeof window !== 'undefined' ? `${window.location.origin}/#galeri` : '');
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: item.caption || item.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        flash('Link disalin');
      }
    } catch {
      /* dibatalkan pengguna */
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black text-white">
      {/* Feed vertikal dengan snap */}
      <div
        ref={scrollerRef}
        className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar overscroll-contain"
      >
        {items.map((item, idx) => {
          const img = imageOf(item);
          const isVideo = isVideoItem(item);
          const embed = isVideo ? getInstagramEmbedUrl(item.instagramUrl || item.mediaUrl) : null;
          const isActive = idx === active;
          const near = Math.abs(idx - active) <= 1;
          const isLiked = !!liked[item.id];

          return (
            <div
              key={item.id}
              ref={(el) => { slideRefs.current[idx] = el; }}
              data-index={idx}
              className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden"
            >
              {/* Latar blur dari foto yang sama */}
              {img && near && (
                <Image src={img} alt="" fill sizes="50vw" className="object-cover scale-125 blur-2xl opacity-80 saturate-150" aria-hidden="true" />
              )}
              <div className="absolute inset-0 bg-black/25" />

              {/* Media utama */}
              <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => handleTap(e, item)}>
                {isVideo && playing === item.id && embed ? (
                  <iframe
                    src={embed}
                    className="w-full max-w-[420px] h-full max-h-[85dvh] border-0 bg-black rounded-none sm:rounded-3xl"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : img && near ? (
                  <div className={`relative w-full h-full sm:max-w-[min(100%,560px)] ${isActive ? 'feed-zoom' : ''}`}>
                    <Image src={img} alt={item.title} fill sizes="(max-width: 640px) 100vw, 560px" priority={isActive} className="object-contain" />
                  </div>
                ) : (
                  <Instagram className="w-16 h-16 text-white/20" />
                )}

                {isVideo && playing !== item.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (embed) setPlaying(item.id);
                      else window.open(item.instagramUrl || item.mediaUrl, '_blank');
                    }}
                    className="absolute w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                    aria-label="Putar video"
                  >
                    <Play className="w-8 h-8 ml-1 fill-white" />
                  </button>
                )}

                {/* Hati saat ketuk dua kali */}
                {isActive && bursts.map((b) => (
                  <Heart
                    key={b.id}
                    className="heart-burst absolute w-24 h-24 fill-rose-500 text-rose-500 pointer-events-none drop-shadow-2xl"
                    style={{ left: b.x - 48, top: b.y - 48 }}
                  />
                ))}
              </div>

              {/* Info bawah */}
              <div className="absolute inset-x-0 bottom-0 pointer-events-none bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-32 pb-8 sm:pb-10 px-4 sm:px-8">
                <div className={`max-w-xl pr-16 pointer-events-auto transition-all duration-500 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-600 flex items-center justify-center font-outfit font-black text-xs text-slate-950">MJ</span>
                    <span className="font-space font-bold text-xs">@merapijeep_adventure</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm font-space font-bold text-[9px] tracking-wider uppercase">
                      {isVideo ? 'Reel' : item.category}
                    </span>
                  </div>
                  <h3 className="font-outfit font-bold text-lg sm:text-xl leading-snug drop-shadow">{item.title}</h3>
                  {item.caption && (
                    <button
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className="text-left font-jakarta text-[13px] text-white/80 mt-1.5 cursor-pointer"
                    >
                      <span className={expanded === item.id ? '' : 'line-clamp-2'}>{item.caption}</span>
                      {expanded !== item.id && item.caption.length > 80 && (
                        <span className="font-semibold text-white"> lebih</span>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Tombol aksi kanan */}
              <div className={`absolute right-3 sm:right-8 bottom-28 sm:bottom-32 flex flex-col items-center gap-5 transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
                <button onClick={() => toggleLike(item.id)} className="flex flex-col items-center gap-1 cursor-pointer" aria-label="Suka">
                  <span className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-transform ${isLiked ? 'scale-110' : ''}`}>
                    <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'fill-rose-500 text-rose-500 heart-pop' : 'text-white'}`} />
                  </span>
                  <span className="font-space text-[10px] font-bold">{isLiked ? 'Disukai' : 'Suka'}</span>
                </button>
                <button onClick={() => share(item)} className="flex flex-col items-center gap-1 cursor-pointer" aria-label="Bagikan">
                  <span className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <Share2 className="w-5 h-5" />
                  </span>
                  <span className="font-space text-[10px] font-bold">Bagikan</span>
                </button>
                {(item.instagramUrl || (isVideo && item.mediaUrl)) && (
                  <a href={item.instagramUrl || item.mediaUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1" aria-label="Buka di Instagram">
                    <span className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center">
                      <Instagram className="w-5 h-5" />
                    </span>
                    <span className="font-space text-[10px] font-bold">Instagram</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bar atas: tutup + penghitung */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <span className="pointer-events-auto px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md font-space font-bold text-xs tabular-nums">
          {active + 1} / {items.length}
        </span>
        <button
          onClick={onClose}
          className="pointer-events-auto w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Indikator posisi vertikal */}
      <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 pointer-events-none">
        {items.map((it, i) => (
          <span
            key={it.id}
            className={`block w-1 rounded-full transition-all duration-300 ${i === active ? 'h-6 bg-amber-400' : 'h-1.5 bg-white/30'}`}
          />
        ))}
      </div>

      {/* Navigasi atas/bawah untuk desktop */}
      <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-3 -mt-20">
        <button
          onClick={() => goTo(active - 1)}
          disabled={active === 0}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
          aria-label="Sebelumnya"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={() => goTo(active + 1)}
          disabled={active === items.length - 1}
          className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center disabled:opacity-30 cursor-pointer transition-colors"
          aria-label="Berikutnya"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Petunjuk geser */}
      {showHint && items.length > 1 && active < items.length - 1 && (
        <div className="absolute inset-x-0 bottom-36 flex justify-center pointer-events-none">
          <div className="swipe-hint flex flex-col items-center gap-1 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md">
            <ChevronUp className="w-5 h-5" />
            <span className="font-space font-bold text-[10px] tracking-[0.2em] uppercase">Geser ke atas</span>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white text-slate-950 font-space font-bold text-xs shadow-xl fade-rise">
          {toast}
        </div>
      )}
    </div>
  );
}
