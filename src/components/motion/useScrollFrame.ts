'use client';

import { useEffect, useRef } from 'react';

/**
 * Satu listener scroll + requestAnimationFrame yang dibagi ke semua komponen
 * (Parallax, Hero, ScrollProgress) supaya animasi tetap ringan di HP.
 */
type FrameCallback = () => void;

const subscribers = new Set<FrameCallback>();
let ticking = false;
let bound = false;

function runFrame() {
  ticking = false;
  subscribers.forEach((cb) => cb());
}

function requestFrame() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(runFrame);
  }
}

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** true di HP/tablet (layar kecil atau perangkat sentuh) — dipakai untuk mode hemat animasi */
export function isLiteMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px), (hover: none) and (pointer: coarse)').matches;
}

export function useScrollFrame(callback: FrameCallback, enabled = true) {
  const cbRef = useRef(callback);

  useEffect(() => {
    cbRef.current = callback;
  });

  useEffect(() => {
    if (!enabled || prefersReducedMotion()) return;

    const fn = () => cbRef.current();
    subscribers.add(fn);

    if (!bound) {
      window.addEventListener('scroll', requestFrame, { passive: true });
      window.addEventListener('resize', requestFrame);
      bound = true;
    }

    fn();

    return () => {
      subscribers.delete(fn);
      if (subscribers.size === 0 && bound) {
        window.removeEventListener('scroll', requestFrame);
        window.removeEventListener('resize', requestFrame);
        bound = false;
      }
    };
  }, [enabled]);
}
