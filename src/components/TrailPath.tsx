'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScrollFrame } from '@/components/motion';

const WAYPOINTS = ['tentang', 'paket-wisata', 'sensasi', 'destinasi', 'pengalaman', 'fasilitas', 'galeri', 'ulasan', 'faq', 'kontak'];

/**
 * Jejak rute berkelok yang mengalir di belakang semua section —
 * menghapus kesan "kotak bertumpuk" dan membuat halaman terasa satu perjalanan.
 * Garis terisi mengikuti scroll, dengan titik bercahaya sebagai penanda posisi.
 */
export default function TrailPath() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const [geo, setGeo] = useState<{ d: string; w: number; h: number; start: number; end: number; glows: [number, number][] } | null>(null);
  const lenRef = useRef(0);

  // Bangun path dari posisi tiap section
  useEffect(() => {
    const wrap = wrapRef.current;
    const host = wrap?.parentElement;
    if (!wrap || !host) return;

    const build = () => {
      const hostTop = host.getBoundingClientRect().top + window.scrollY;
      const w = host.clientWidth;
      const h = host.scrollHeight;
      const mobile = w < 768;
      const left = w * (mobile ? 0.1 : 0.08);
      const right = w * (mobile ? 0.9 : 0.92);

      const pts: [number, number][] = [];
      // Titik awal: bagian atas section Intro
      const intro = document.getElementById(WAYPOINTS[0]);
      if (intro) {
        pts.push([w * 0.5, intro.getBoundingClientRect().top + window.scrollY - hostTop + (mobile ? 24 : 48)]);
      }
      // Titik rute: tepat di setiap pemisah pegunungan
      document.querySelectorAll<HTMLElement>('[data-trail-node]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        const y = rect.top + window.scrollY - hostTop + rect.height * 0.5;
        pts.push([el.dataset.trailNode === 'left' ? left : right, y]);
      });
      // Titik akhir: CTA
      const end = document.getElementById(WAYPOINTS[WAYPOINTS.length - 1]);
      if (end) pts.push([w * 0.5, end.getBoundingClientRect().top + window.scrollY - hostTop + 40]);
      if (pts.length < 2) return;

      let d = `M ${pts[0][0]} ${pts[0][1]} `;
      let prev: [number, number] = pts[0];
      pts.slice(1).forEach((p) => {
        const dy = p[1] - prev[1];
        d += `C ${prev[0]} ${prev[1] + dy * 0.55}, ${p[0]} ${p[1] - dy * 0.55}, ${p[0]} ${p[1]} `;
        prev = p;
      });
      setGeo({ d, w, h, start: hostTop + pts[0][1], end: hostTop + prev[1], glows: pts.slice(1, -1) });
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(host);
    window.addEventListener('load', build);
    return () => {
      ro.disconnect();
      window.removeEventListener('load', build);
    };
  }, []);

  useEffect(() => {
    if (progressRef.current) {
      lenRef.current = progressRef.current.getTotalLength();
      progressRef.current.style.strokeDasharray = `${lenRef.current}`;
      progressRef.current.style.strokeDashoffset = `${lenRef.current}`;
    }
  }, [geo]);

  useScrollFrame(() => {
    if (!geo || !progressRef.current) return;
    const len = lenRef.current;
    const pos = window.scrollY + window.innerHeight * 0.55;
    const p = Math.min(1, Math.max(0, (pos - geo.start) / (geo.end - geo.start)));
    progressRef.current.style.strokeDashoffset = `${len * (1 - p)}`;
    if (dotRef.current) {
      const pt = progressRef.current.getPointAtLength(len * p);
      dotRef.current.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
      dotRef.current.style.opacity = p > 0.001 && p < 0.999 ? '1' : '0';
    }
  });

  return (
    <div ref={wrapRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Cahaya lembut yang melintasi batas section (bergantian kiri-kanan) */}
      {geo?.glows.map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: x - geo.w * 0.4,
            top: y - geo.w * 0.4,
            width: geo.w * 0.8,
            height: geo.w * 0.8,
            maxWidth: 900,
            maxHeight: 900,
            background: `radial-gradient(closest-side, ${i % 2 === 0 ? 'rgba(251,191,36,0.14)' : 'rgba(251,146,60,0.11)'}, transparent)`,
          }}
        />
      ))}
      {geo && (
        <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`} className="absolute top-0 left-0">
          <defs>
            <linearGradient id="trail-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>
          {/* Jejak dasar putus-putus */}
          <path d={geo.d} fill="none" stroke="rgba(217, 119, 6, 0.28)" strokeWidth={2} strokeLinecap="round" />
          {/* Jejak terisi sesuai scroll */}
          <path ref={progressRef} d={geo.d} fill="none" stroke="url(#trail-grad)" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
          {/* Penanda posisi */}
          <g ref={dotRef} style={{ opacity: 0, transition: 'opacity .3s' }}>
            <circle r={14} fill="rgba(245, 158, 11, 0.15)" />
            <circle r={5} fill="#f59e0b" />
          </g>
        </svg>
      )}
    </div>
  );
}
