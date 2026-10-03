'use client';

import React, { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './useScrollFrame';

interface CountUpProps {
  /** Contoh: "10,000+", "50+", "4.9" */
  value: string;
  duration?: number;
  className?: string;
  /** Kelas tambahan untuk akhiran, mis. warna aksen pada "+" */
  suffixClassName?: string;
}

export default function CountUp({ value, duration = 1800, className = '', suffixClassName = '' }: CountUpProps) {
  const match = value.match(/^([^\d]*)([\d.,]+)(.*)$/);
  const prefix = match?.[1] ?? '';
  const rawNumber = match?.[2] ?? '0';
  const suffix = match?.[3] ?? '';
  const usesThousands = rawNumber.includes(',');
  const decimals = rawNumber.includes('.') ? rawNumber.split('.')[1].length : 0;
  const target = parseFloat(rawNumber.replace(/,/g, '')) || 0;

  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setCurrent(target);
      return;
    }

    let raf = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - t, 4); // easeOutQuart
          setCurrent(target * eased);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target, duration]);

  const formatted = usesThousands
    ? Math.round(current).toLocaleString('en-US')
    : current.toFixed(decimals);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix && <span className={suffixClassName}>{suffix}</span>}
    </span>
  );
}
