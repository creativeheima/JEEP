'use client';

import React, { useEffect, useRef, useState } from 'react';

type Variant = 'up' | 'down' | 'left' | 'right' | 'zoom' | 'blur';

interface RevealProps {
  children: React.ReactNode;
  variant?: Variant;
  /** Jeda dalam milidetik — pakai untuk efek berurutan (stagger). */
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'span';
  /** Animasi hanya sekali (default) atau setiap kali masuk layar. */
  once?: boolean;
}

export default function Reveal({
  children,
  variant = 'up',
  delay = 0,
  className = '',
  as = 'div',
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${visible ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
