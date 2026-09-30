'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Phone, Compass, Menu, X, ShieldCheck, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenBooking?: (packageTitle?: string) => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'BERANDA', href: '#hero' },
    { name: 'TENTANG', href: '#tentang' },
    { name: 'PAKET WISATA', href: '#paket-wisata' },
    { name: 'DESTINASI', href: '#destinasi' },
    { name: 'PENGALAMAN', href: '#pengalaman' },
    { name: 'GALERI', href: '#galeri' },
    { name: 'KONTAK', href: '#kontak' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'glass-nav shadow-sm border-b border-slate-200/80 py-3'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-100 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6 fill-current text-slate-950"
              viewBox="0 0 24 24"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
            </svg>
          </div>
          <div>
            <div className="font-outfit font-extrabold text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-1.5">
              MERAPI JEEP
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-space font-bold bg-amber-100 text-amber-800">
                4X4
              </span>
            </div>
            <p className="text-[10px] font-space tracking-widest text-slate-500 font-semibold uppercase">
              Adventure Tour
            </p>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-7">
          {navLinks.map((link, idx) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs font-space font-semibold tracking-wider transition-colors hover:text-amber-600 ${
                idx === 0 ? 'text-amber-600 font-bold' : 'text-slate-700'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden sm:flex items-center gap-4">
          <a
            href="https://wa.me/6281234567890?text=Halo%20Merapi%20Jeep%20Adventure,%20saya%20ingin%20tanya%20informasi%20tur"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-space font-bold text-slate-800 hover:text-amber-700 transition-colors"
          >
            <Phone className="w-4 h-4 text-amber-600" />
            <span>CS 24/7</span>
          </a>

          <button
            onClick={() => onOpenBooking ? onOpenBooking() : document.getElementById('paket-wisata')?.scrollIntoView({ behavior: 'smooth' })}
            className="amber-gradient-btn px-5 py-2.5 rounded-lg text-xs font-space font-bold text-slate-950 flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Compass className="w-4 h-4 text-slate-950" />
            <span>PESAN SEKARANG</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => onOpenBooking ? onOpenBooking() : document.getElementById('paket-wisata')?.scrollIntoView({ behavior: 'smooth' })}
            className="amber-gradient-btn px-3 py-1.5 rounded-lg text-xs font-space font-bold text-slate-950 flex items-center gap-1.5"
          >
            <span>PESAN</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 border-b border-slate-200 px-6 py-5 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-space font-bold text-slate-800 hover:text-amber-600 py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-3">
              <a
                href="https://wa.me/6281234567890?text=Halo%20Merapi%20Jeep%20Adventure"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-slate-100 text-slate-800 text-xs font-space font-bold"
              >
                <Phone className="w-4 h-4 text-amber-600" />
                <span>CS 24/7 WhatsApp Hotline</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenBooking) onOpenBooking();
                  else document.getElementById('paket-wisata')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="amber-gradient-btn w-full py-3 rounded-lg text-xs font-space font-bold text-slate-950 text-center shadow-md flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>PESAN SEKARANG VIA WHATSAPP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
