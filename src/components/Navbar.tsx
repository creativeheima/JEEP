'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Compass, Menu, X, ShieldCheck, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenBooking?: (packageTitle?: string) => void;
  onOpenCheckTicket?: () => void;
}

export default function Navbar({ onOpenBooking, onOpenCheckTicket }: NavbarProps) {
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
    { name: 'CEK TIKET', href: '#cek-tiket', isCheckTicket: true },
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
        <Link href="#hero" className="flex items-center group py-0.5">
          <div className="relative h-11 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="Merapi Jeep 4x4 Adventure Tour"
              width={2171}
              height={724}
              priority
              className="h-11 sm:h-12 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6">
          {navLinks.map((link, idx) => (
            link.isCheckTicket ? (
              <button
                key={link.name}
                onClick={() => onOpenCheckTicket && onOpenCheckTicket()}
                className="text-xs font-space font-semibold tracking-wider transition-colors hover:text-amber-600 text-slate-700 cursor-pointer"
              >
                {link.name}
              </button>
            ) : (
              <Link
                key={link.name}
                href={link.href}
                className={`text-xs font-space font-semibold tracking-wider transition-colors hover:text-amber-600 ${
                  idx === 0 ? 'text-amber-600 font-bold' : 'text-slate-700'
                }`}
              >
                {link.name}
              </Link>
            )
          ))}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
              link.isCheckTicket ? (
                <button
                  key={link.name}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenCheckTicket) onOpenCheckTicket();
                  }}
                  className="text-sm font-space font-bold text-slate-800 hover:text-amber-600 py-2 border-b border-slate-100 flex items-center justify-between text-left w-full cursor-pointer"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-space font-bold text-slate-800 hover:text-amber-600 py-2 border-b border-slate-100 flex items-center justify-between"
                >
                  <span>{link.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              )
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
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center font-space text-[11px] text-slate-400 hover:text-slate-600 pt-1"
              >
                Portal Admin Basecamp →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
