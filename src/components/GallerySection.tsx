'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, Eye, X, Play, Instagram, ExternalLink, Film, Sparkles } from 'lucide-react';
import { GalleryItem } from '@/types/gallery';

export default function GallerySection() {
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<GalleryItem | null>(null);

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

  const filteredItems = items.filter((item) => {
    if (activeTab === 'SEMUA') return true;
    if (activeTab === 'FOTO') return item.type === 'PHOTO';
    if (activeTab === 'VIDEO INSTAGRAM') return item.type === 'INSTAGRAM_VIDEO' || item.category === 'VIDEO REELS';
    return item.category === activeTab;
  });

  // Helper untuk mengekstrak embed url instagram jika tersedia
  const getInstagramEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/instagram\.com\/(?:reel|p)\/([^/?#&]+)/i);
    if (match && match[1]) {
      return `https://www.instagram.com/reel/${match[1]}/embed/`;
    }
    return null;
  };

  return (
    <section id="galeri" className="py-20 lg:py-28 bg-white border-t border-slate-100 overflow-hidden section-edge">
      <div className="section-line" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 font-space font-bold text-xs text-amber-600 tracking-widest uppercase mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>DOKUMENTASI ASLI & REELS INSTAGRAM</span>
            </div>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
              Momen Seru di Jalur Merapi
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-xl">
              Foto otentik ekspedisi lava tour dan cuplikan video reels aksi ekstrem yang viral di Instagram.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80 self-start md:self-auto">
            {tabs.map((tab) => {
              const isVideoTab = tab === 'VIDEO INSTAGRAM';
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-space font-bold text-xs tracking-wider transition-all cursor-pointer ${
                    isActive
                      ? isVideoTab
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md'
                        : 'bg-slate-950 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {isVideoTab && <Instagram className="w-3.5 h-3.5" />}
                  {tab}
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-64 sm:h-72 rounded-2xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
            <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-outfit font-bold text-slate-700 text-lg">Belum Ada Konten di Kategori Ini</h3>
            <p className="text-slate-500 text-sm mt-1">Admin dapat menambahkan foto atau video baru melalui Dashboard Admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const isVideo = item.type === 'INSTAGRAM_VIDEO' || item.category === 'VIDEO REELS';
              const displayImage = isVideo ? (item.thumbnailUrl || item.mediaUrl) : item.mediaUrl;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isVideo) {
                      setSelectedVideo(item);
                    } else {
                      setSelectedPhoto(item.mediaUrl);
                    }
                  }}
                  className={`relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 group cursor-pointer ${
                    isVideo
                      ? 'border-purple-200 hover:border-pink-500 hover:shadow-pink-500/20'
                      : 'border-slate-200 hover:border-amber-400'
                  }`}
                >
                  {/* Image Background */}
                  {displayImage ? (
                    <Image
                      src={displayImage}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                      <Instagram className="w-16 h-16 text-slate-700" />
                    </div>
                  )}

                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t opacity-70 group-hover:opacity-90 transition-opacity ${
                    isVideo 
                      ? 'from-slate-950 via-slate-950/40 to-purple-950/20' 
                      : 'from-slate-950/80 via-transparent to-transparent'
                  }`} />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {isVideo ? (
                      <span className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-space font-bold text-[10px] tracking-wider px-2.5 py-1 rounded-md shadow-lg">
                        <Instagram className="w-3.5 h-3.5" />
                        INSTAGRAM REEL
                      </span>
                    ) : (
                      <span className="bg-slate-950/80 backdrop-blur-sm text-white font-space font-bold text-[10px] tracking-wider px-2.5 py-1 rounded-md">
                        {item.category}
                      </span>
                    )}

                    {isVideo && (
                      <span className="flex items-center gap-1 text-[10px] font-space font-semibold bg-black/60 backdrop-blur-sm text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
                        <Film className="w-3 h-3" />
                        Video
                      </span>
                    )}
                  </div>

                  {/* Center Action Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {isVideo ? (
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-2xl transform scale-90 group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 ml-1 fill-white" />
                        </div>
                        {/* Ripple animation */}
                        <div className="absolute -inset-2 rounded-full border-2 border-pink-400/50 animate-ping opacity-75 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-950 shadow-xl opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
                        <Eye className="w-5 h-5" />
                      </div>
                    )}
                  </div>

                  {/* Bottom Caption & Title */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-outfit font-bold text-sm text-white drop-shadow-md line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h4>
                    {item.caption && (
                      <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5 font-sans">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Lightbox Modal (Foto) */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={selectedPhoto}
              alt="Expanded photo preview"
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}

      {/* Video Reels Modal (Instagram) */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedVideo(null);
          }}
        >
          <div className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header Modal Video */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center text-white">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-outfit font-bold text-white text-xs leading-none">Instagram Reels</h5>
                  <span className="text-[10px] text-slate-400">@merapijeep_adventure</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Body / Player */}
            <div className="relative flex-1 bg-black overflow-y-auto flex items-center justify-center min-h-[380px]">
              {getInstagramEmbedUrl(selectedVideo.mediaUrl || selectedVideo.instagramUrl) ? (
                <iframe
                  src={getInstagramEmbedUrl(selectedVideo.mediaUrl || selectedVideo.instagramUrl)!}
                  className="w-full h-[480px] border-0"
                  allowFullScreen
                  scrolling="no"
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              ) : (
                <div className="p-6 text-center text-white">
                  <div className="relative w-full h-56 rounded-xl overflow-hidden mb-4 border border-slate-800">
                    <Image
                      src={selectedVideo.thumbnailUrl || '/images/img_1_581_manuver_air_kali_kuning.png'}
                      alt={selectedVideo.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <a
                        href={selectedVideo.instagramUrl || selectedVideo.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-space font-bold text-xs tracking-wider flex items-center gap-2 shadow-lg hover:brightness-110 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        Tonton di Instagram
                      </a>
                    </div>
                  </div>
                  <h4 className="font-outfit font-bold text-white text-base mb-1">
                    {selectedVideo.title}
                  </h4>
                  <p className="text-slate-400 text-xs line-clamp-2">
                    {selectedVideo.caption || 'Video keseruan wisata off-road Jeep Merapi Adventure'}
                  </p>
                </div>
              )}
            </div>

            {/* Footer with External Link */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
              <div className="text-xs text-slate-300 font-medium truncate">
                {selectedVideo.title}
              </div>
              <a
                href={selectedVideo.instagramUrl || selectedVideo.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/30 hover:bg-pink-500/20 text-pink-400 font-space font-bold text-[11px] tracking-wider transition-colors cursor-pointer"
              >
                <span>Buka di Instagram</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
