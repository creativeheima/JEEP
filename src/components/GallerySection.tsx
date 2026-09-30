'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, Eye, X } from 'lucide-react';

export default function GallerySection() {
  const [activeTab, setActiveTab] = useState('SEMUA');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const tabs = ['SEMUA', 'JEEP ACTION', 'DESTINASI', 'WISATAWAN'];

  const photos = [
    {
      id: 1,
      src: '/images/img_1_577_jeep_traversing_off-road_track.png',
      category: 'JEEP ACTION',
      title: 'Jeep Traversing Off-Road Track',
    },
    {
      id: 2,
      src: '/images/img_1_579_wisatawan_bersorak_di_jeep.png',
      category: 'WISATAWAN',
      title: 'Wisatawan Bersorak di Jeep',
    },
    {
      id: 3,
      src: '/images/img_1_581_manuver_air_kali_kuning.png',
      category: 'JEEP ACTION',
      title: 'Manuver Air Kali Kuning (Splash)',
    },
    {
      id: 4,
      src: '/images/img_1_583_panorama_merapi_pagi_cerah.png',
      category: 'DESTINASI',
      title: 'Panorama Merapi Pagi Cerah',
    },
    {
      id: 5,
      src: '/images/img_1_585_batu_alien_merapi.png',
      category: 'DESTINASI',
      title: 'Spot Foto Batu Alien Merapi',
    },
    {
      id: 6,
      src: '/images/img_1_587_corporate_outing_jeep.png',
      category: 'WISATAWAN',
      title: 'Corporate Outing & Gathering Jeep',
    },
  ];

  const filteredPhotos = activeTab === 'SEMUA'
    ? photos
    : photos.filter(p => p.category === activeTab);

  return (
    <section id="galeri" className="py-20 lg:py-28 bg-white border-t border-slate-100 overflow-hidden section-edge">
      <div className="section-line" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header and Filter Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="font-space font-bold text-xs text-amber-600 tracking-widest uppercase mb-2">
              DOKUMENTASI ASLI LAPANGAN
            </div>
            <h2 className="font-outfit font-black text-3xl sm:text-4xl text-slate-950 tracking-tight">
              Momen Seru di Perjalanan
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80 self-start md:self-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-space font-bold text-xs tracking-wider transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedImage(photo.src)}
              className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-sm border border-slate-200 group cursor-pointer"
            >
              <Image
                src={photo.src}
                alt={photo.title}
                fill
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
              
              {/* Category Tag */}
              <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white font-space font-bold text-[10px] tracking-wider px-2.5 py-1 rounded-md">
                {photo.category}
              </div>

              {/* Hover View Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-950 shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                  <Eye className="w-5 h-5" />
                </div>
              </div>

              {/* Title Caption */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h4 className="font-outfit font-bold text-sm text-white drop-shadow-md">
                  {photo.title}
                </h4>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-5xl max-h-[85vh] w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={selectedImage}
              alt="Expanded photo preview"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}
