'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useScrollFrame, isLiteMotion } from './useScrollFrame';

interface ParallaxProps {
  children: React.ReactNode;
  /** 0.1–0.4 = lebih lambat dari scroll (latar). Negatif = lebih cepat (elemen depan). */
  speed?: number;
  /** Skala dasar lapisan dalam, berguna agar tepi gambar tidak terlihat saat bergeser. */
  scale?: number;
  /** Kelas untuk wrapper luar (yang diukur, tidak ikut bergerak). */
  className?: string;
  /** Kelas untuk lapisan dalam (yang digeser). */
  innerClassName?: string;
  /** Tetap aktif di HP (default: dimatikan di HP agar scroll mulus) */
  mobile?: boolean;
}

export default function Parallax({
  children,
  speed = 0.2,
  scale = 1,
  className = '',
  innerClassName = '',
  mobile = false,
}: ParallaxProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const lastY = useRef<number | null>(null);

  useEffect(() => {
    setEnabled(mobile || !isLiteMotion());
  }, [mobile]);

  useScrollFrame(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const rect = outer.getBoundingClientRect();
    const vh = window.innerHeight;
    // Lewati elemen yang jauh dari layar
    if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) return;

    const distanceFromCenter = rect.top + rect.height / 2 - vh / 2;
    const y = Math.round(-distanceFromCenter * speed * 2) / 2;
    if (y === lastY.current) return; // hindari tulis style yang sama
    lastY.current = y;
    inner.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
  }, enabled);

  return (
    <div ref={outerRef} className={className}>
      <div
        ref={innerRef}
        className={innerClassName}
        style={{ transform: `scale(${scale})`, willChange: enabled ? 'transform' : undefined }}
      >
        {children}
      </div>
    </div>
  );
}
