'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Ticket, ArrowRight, Menu, X, ChevronRight } from 'lucide-react';

interface NavbarProps {
  onOpenBooking?: (packageTitle?: string) => void;
  onOpenCheckTicket?: () => void;
}

export default function Navbar({ onOpenBooking, onOpenCheckTicket }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);

      // Simple active section detection
      const sections = ['hero', 'tentang', 'paket-wisata', 'destinasi', 'pengalaman', 'galeri', 'kontak'];
      const scrollPosition = window.scrollY + 200;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'BERANDA', href: '#hero', id: 'hero' },
    { name: 'TENTANG', href: '#tentang', id: 'tentang' },
    { name: 'PAKET WISATA', href: '#paket-wisata', id: 'paket-wisata' },
    { name: 'DESTINASI', href: '#destinasi', id: 'destinasi' },
    { name: 'PENGALAMAN', href: '#pengalaman', id: 'pengalaman' },
    { name: 'GALERI', href: '#galeri', id: 'galeri' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-white/95 md:bg-white/75 backdrop-blur-xl backdrop-saturate-150 border-slate-200/60 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.18)] py-3'
          : 'bg-white border-slate-200/80 py-3.5 sm:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo (Left) */}
        <Link href="#hero" className="flex items-center group shrink-0 py-0.5">
          <div className="relative h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/images/logo.png"
              alt="Merapi Jeep Adventure — lava tour jeep Merapi Jogja"
              width={2171}
              height={724}
              priority
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>
        </Link>

        {/* Desktop Nav Links (Center) */}
        <nav className="hidden xl:flex items-center gap-7 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id || (link.id === 'hero' && activeSection === '');
            return (
              <Link
                key={link.name}
                href={link.href}
                className="group relative flex flex-col items-center py-1"
              >
                <span
                  className={`text-xs font-space font-bold tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#ea580c]'
                      : 'text-slate-800 hover:text-[#ea580c]'
                  }`}
                >
                  {link.name}
                </span>

                {/* Orange Active Underline Indicator (Identical to reference screenshot) */}
                <span
                  className={`h-[3px] rounded-full bg-[#ea580c] transition-all duration-300 mt-1 ${
                    isActive ? 'w-6 opacity-100' : 'w-0 opacity-0 group-hover:w-4 group-hover:opacity-60'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Medium screens nav links (slightly more compact) */}
        <nav className="hidden lg:flex xl:hidden items-center gap-5">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id || (link.id === 'hero' && activeSection === '');
            return (
              <Link
                key={link.name}
                href={link.href}
                className="group relative flex flex-col items-center py-1"
              >
                <span
                  className={`text-[11px] font-space font-bold tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#ea580c]'
                      : 'text-slate-800 hover:text-[#ea580c]'
                  }`}
                >
                  {link.name}
                </span>
                <span
                  className={`h-[2.5px] rounded-full bg-[#ea580c] transition-all duration-300 mt-0.5 ${
                    isActive ? 'w-5 opacity-100' : 'w-0 opacity-0 group-hover:w-3 group-hover:opacity-60'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: CEK TIKET Button & KONTAK */}
        <div className="hidden sm:flex items-center gap-4 shrink-0">
          {/* Tombol CEK TIKET (Orange Gradient with Ticket Icon & Arrow) */}
          <button
            onClick={() => onOpenCheckTicket && onOpenCheckTicket()}
            className="group px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#c2410c] hover:brightness-105 active:scale-95 text-white font-space font-extrabold text-xs tracking-wider flex items-center gap-2 shadow-md shadow-orange-500/25 transition-all duration-200 cursor-pointer"
          >
            <Ticket className="w-4 h-4 stroke-[2.5] -rotate-12 group-hover:rotate-0 transition-transform" />
            <span>CEK TIKET</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Thin subtle divider */}
          <div className="h-5 w-px bg-slate-200" aria-hidden="true" />

          {/* KONTAK Link */}
          <Link
            href="#kontak"
            className="flex items-center gap-1.5 text-xs font-space font-extrabold tracking-wider text-slate-900 hover:text-[#ea580c] transition-colors py-1 cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 fill-slate-900 text-slate-900" />
            <span>KONTAK</span>
          </Link>
        </div>

        {/* Mobile controls (CEK TIKET compact & Hamburger menu) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => onOpenCheckTicket && onOpenCheckTicket()}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-space font-extrabold text-[10px] tracking-wider flex items-center gap-1.5 shadow-sm sm:hidden"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>TIKET</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-xl border-b border-slate-200 px-6 py-5 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-space font-bold text-slate-800 hover:text-[#ea580c] py-2 border-b border-slate-100 flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            ))}

            <div className="pt-3 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenCheckTicket) onOpenCheckTicket();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white font-space font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
              >
                <Ticket className="w-4 h-4" />
                <span>CEK E-TIKET & INVOICE SAYA</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                href="#kontak"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-900 text-xs font-space font-bold"
              >
                <Phone className="w-4 h-4 text-slate-900" />
                <span>HUBUNGI KAMI (KONTAK)</span>
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenBooking) onOpenBooking();
                  else document.getElementById('paket-wisata')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 text-white text-xs font-space font-bold text-center"
              >
                Pesan Tur Jeep Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
