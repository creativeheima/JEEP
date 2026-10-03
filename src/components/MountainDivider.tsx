'use client';

import React, { useId } from 'react';
import { Parallax } from '@/components/motion';

/**
 * Pemisah section berupa siluet pegunungan berlapis berkabut (lereng Merapi).
 * - Setiap lapisan memudar ke bawah (gradien), jadi tidak ada garis potong.
 * - Lapisan belakang bergerak lebih lambat (parallax) → terasa berkedalaman.
 * - Titik oranye = simpul jejak rute (sejajar dengan TrailPath).
 */

/** Garis punggung gunung yang halus (Catmull-Rom → kurva Bezier), puncak tetap terasa. */
const ridgeLine = (pts: number[][], tension = 0.35) => {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) * tension) / 2;
    const c1y = p1[1] + ((p2[1] - p0[1]) * tension) / 2;
    const c2x = p2[0] - ((p3[0] - p1[0]) * tension) / 2;
    const c2y = p2[1] - ((p3[1] - p1[1]) * tension) / 2;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
};
const toPath = (pts: number[][]) => `${ridgeLine(pts)} L1440,160 L0,160 Z`;

const RANGES = [
  {
    back: [[0, 84], [70, 66], [140, 72], [230, 34], [300, 56], [360, 46], [455, 10], [545, 50], [615, 40], [705, 64], [795, 30], [865, 46], [945, 16], [1035, 56], [1115, 42], [1205, 66], [1295, 32], [1375, 52], [1440, 44]],
    mid: [[0, 104], [110, 84], [200, 96], [330, 68], [430, 92], [530, 78], [650, 100], [770, 74], [890, 94], [1010, 70], [1130, 96], [1250, 80], [1350, 98], [1440, 86]],
    front: [[0, 128], [160, 116], [300, 126], [470, 112], [640, 128], [800, 114], [980, 128], [1150, 116], [1310, 126], [1440, 118]],
  },
  {
    back: [[0, 50], [90, 70], [170, 40], [260, 60], [340, 22], [430, 58], [520, 44], [600, 70], [700, 26], [790, 52], [880, 38], [980, 64], [1070, 14], [1160, 54], [1250, 42], [1340, 68], [1440, 36]],
    mid: [[0, 90], [120, 100], [240, 74], [360, 94], [480, 82], [600, 102], [720, 72], [850, 96], [980, 80], [1100, 100], [1230, 76], [1340, 94], [1440, 84]],
    front: [[0, 120], [180, 128], [350, 114], [520, 126], [700, 112], [880, 126], [1060, 114], [1240, 128], [1440, 116]],
  },
];

interface MountainDividerProps {
  variant?: number;
  flip?: boolean;
  className?: string;
}

export default function MountainDivider({ variant = 0, flip = false, className = '' }: MountainDividerProps) {
  const uid = useId().replace(/:/g, '');
  const r = RANGES[variant % RANGES.length];
  const svgClass = `absolute inset-0 w-full h-full ${flip ? '-scale-x-100' : ''}`;

  const Layer = ({ pts, id, top, bottom, stroke }: { pts: number[][]; id: string; top: string; bottom: string; stroke?: string }) => (
    <svg viewBox="0 0 1440 160" preserveAspectRatio="none" className={svgClass}>
      <defs>
        <linearGradient id={`${uid}-${id}`} x1="0" y1="0" x2="0" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0.05" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <path d={toPath(pts)} fill={`url(#${uid}-${id})`} />
      {stroke && (
        <path
          d={ridgeLine(pts)}
          fill="none"
          stroke={stroke}
          strokeWidth="1.2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );

  return (
    <div
      data-trail-node={flip ? 'left' : 'right'}
      aria-hidden="true"
      className={`relative z-0 h-24 sm:h-32 lg:h-40 -my-8 sm:-my-10 pointer-events-none ${className}`}
    >
      {/* Lapisan belakang: pegunungan jauh, kabut tipis */}
      <Parallax speed={0.1} className="absolute inset-0" innerClassName="absolute inset-0">
        <Layer pts={r.back} id="b" top="rgba(205, 184, 150, 0.55)" bottom="rgba(240, 232, 218, 0)" stroke="rgba(190, 165, 125, 0.45)" />
      </Parallax>
      {/* Lapisan tengah */}
      <Parallax speed={0.05} className="absolute inset-0" innerClassName="absolute inset-0">
        <Layer pts={r.mid} id="m" top="rgba(226, 210, 182, 0.75)" bottom="rgba(245, 239, 228, 0)" stroke="rgba(205, 184, 150, 0.4)" />
      </Parallax>

      {/* Simpul jejak rute */}
      <span className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 ${flip ? 'left-[10%] md:left-[8%]' : 'left-[90%] md:left-[92%]'}`}>
        <span className="absolute inset-0 -m-2 rounded-full bg-amber-400/30 animate-ping" />
        <span className="relative block w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 ring-4 ring-white shadow-[0_0_24px_rgba(245,158,11,0.6)]" />
      </span>

      {/* Lapisan depan: bukit dekat, menyatu dengan latar */}
      <Layer pts={r.front} id="f" top="rgba(247, 242, 233, 0.95)" bottom="rgba(250, 248, 244, 0)" />
    </div>
  );
}
