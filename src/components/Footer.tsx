'use client';

import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Lock,
  Instagram,
  Facebook,
  Youtube,
  Award,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0a0f1d] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-slate-800">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="#hero" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-md">
                <svg
                  className="w-6 h-6 fill-current text-slate-950"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
                </svg>
              </div>
              <div className="font-outfit font-extrabold text-white tracking-tight text-lg leading-tight">
                MERAPI JEEP
                <span className="text-[10px] font-space font-bold text-amber-400 block tracking-widest uppercase">
                  ADVENTURE TOUR
                </span>
              </div>
            </Link>

            <p className="font-work text-xs text-slate-400 leading-relaxed max-w-sm">
              Penyedia tur eksplorasi ekstrem Merapi 4x4 terpercaya di Yogyakarta. Menghadirkan sensasi off-road autentik menyusuri sisa erupsi, bunker Kaliadem, dan lava track dengan standar keselamatan internasional.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-amber-500/40 text-[11px] font-space font-semibold text-amber-400">
              <Award className="w-4 h-4 text-amber-400" />
              <span>OFFICIAL EXPEDITION LICENSE</span>
            </div>
          </div>

          {/* Column 2: Popular Packages */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-amber-500 rounded-sm" />
              <h4 className="font-outfit font-bold text-sm text-white tracking-wider uppercase">
                PAKET POPULER
              </h4>
            </div>
            <ul className="space-y-2.5 font-work text-xs text-slate-400">
              <li>
                <a href="#paket-wisata" className="hover:text-amber-400 transition-colors">
                  Sunrise Kaliadem Track (Short)
                </a>
              </li>
              <li>
                <a href="#paket-wisata" className="hover:text-amber-400 transition-colors">
                  Alien Rock & Museum (Medium)
                </a>
              </li>
              <li>
                <a href="#paket-wisata" className="hover:text-amber-400 transition-colors">
                  Extreme Caldera Trail (Long)
                </a>
              </li>
              <li>
                <a href="#paket-wisata" className="hover:text-amber-400 transition-colors">
                  Yellow River Water Crossing
                </a>
              </li>
              <li>
                <a href="#paket-wisata" className="hover:text-amber-400 transition-colors">
                  Custom Corporate Outing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-amber-500 rounded-sm" />
              <h4 className="font-outfit font-bold text-sm text-white tracking-wider uppercase">
                NAVIGASI CEPAT
              </h4>
            </div>
            <ul className="space-y-2.5 font-work text-xs text-slate-400">
              <li>
                <a href="#hero" className="hover:text-amber-400 transition-colors">
                  Beranda Ekspedisi
                </a>
              </li>
              <li>
                <a href="#tentang" className="hover:text-amber-400 transition-colors">
                  Profil Armada & Basecamp
                </a>
              </li>
              <li>
                <a href="#paket-wisata" className="hover:text-amber-400 transition-colors">
                  Pilihan Jalur Rute Off-Road
                </a>
              </li>
              <li>
                <a href="#destinasi" className="hover:text-amber-400 transition-colors">
                  Bunker Kaliadem & Batu Alien
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-amber-400 font-bold hover:text-amber-300 transition-colors">
                  → Portal Admin Basecamp (Input Deal WA)
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Basecamp & Contact */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-amber-500 rounded-sm" />
              <h4 className="font-outfit font-bold text-sm text-white tracking-wider uppercase">
                BASECAMP & KONTAK
              </h4>
            </div>
            
            <div className="space-y-3 font-work text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Basecamp Kaliurang Barat, Hargobinangun, Pakem, Sleman, D.I. Yogyakarta 55582
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="tel:+6281234567890" className="hover:text-amber-400">
                  +62 812-3456-7890
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <a href="mailto:booking@merapijeepadventure.com" className="hover:text-amber-400">
                  booking@merapijeepadventure.com
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all border border-slate-800"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all border border-slate-800"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all border border-slate-800"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-work text-slate-500">
          <p className="text-center sm:text-left">
            © 2025. Powered by Merapi Jeep Adventure Tour. Design by Heima Creative.
          </p>

          <div className="flex items-center gap-6 text-slate-400 font-space text-[11px]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Garansi Asuransi Jiwa Jasa Raharja</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Booking Instan Aman</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
