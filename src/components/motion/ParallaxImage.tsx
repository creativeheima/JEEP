'use client';

import React from 'react';
import Image from 'next/image';
import Parallax from './Parallax';

interface ParallaxImageProps {
  src: string;
  alt: string;
  speed?: number;
  className?: string;
  wrapperClassName?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Gambar full-cover yang bergeser pelan di dalam bingkainya (efek "jendela").
 * Parent harus `relative` + `overflow-hidden`.
 */
export default function ParallaxImage({
  src,
  alt,
  speed = 0.12,
  className = 'object-cover object-center',
  wrapperClassName = '',
  priority,
  sizes,
}: ParallaxImageProps) {
  return (
    <Parallax
      speed={speed}
      className={`absolute inset-0 overflow-hidden ${wrapperClassName}`}
      innerClassName="absolute inset-x-0 -top-[14%] -bottom-[14%]"
    >
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className={className} />
    </Parallax>
  );
}
