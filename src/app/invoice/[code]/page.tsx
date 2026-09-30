'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Printer,
  Share2,
  CheckCircle2,
  Calendar,
  Clock,
  Users,
  Car,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Phone,
  QrCode,
  Download,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Award
} from 'lucide-react';
import { Booking } from '@/types/booking';

export default function InvoicePage() {
  const params = useParams();
  const code = params?.code as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/bookings/${code}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setBooking(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [code]);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWa = () => {
    if (!booking) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Halo Kak ${booking.customerName}, berikut adalah E-Tiket & Invoice resmi Merapi Jeep Adventure Anda:%0A%0A` +
      `📌 *Kode Booking:* ${booking.bookingCode}%0A` +
      `🚙 *Paket:* ${booking.packageName}%0A` +
      `📅 *Tanggal Tur:* ${booking.tourDate} (${booking.tourTime})%0A` +
      `👥 *Peserta:* ${booking.paxCount} Orang (${booking.jeepCount} Jeep)%0A` +
      `💰 *Total Deal:* Rp ${booking.totalAmount.toLocaleString('id-ID')}%0A` +
      `✅ *DP Masuk:* Rp ${booking.dpAmount.toLocaleString('id-ID')}%0A` +
      `⏳ *Sisa Pelunasan di Lokasi:* Rp ${booking.remainingAmount.toLocaleString('id-ID')}%0A%0A` +
      `Buka e-Tiket lengkap disini:%0A${encodeURIComponent(url)}%0A%0A` +
      `Tunjukkan e-tiket ini kepada petugas di Basecamp Kaliurang saat kedatangan. Salam Petualang! 🌋`;

    const waUrl = `https://wa.me/${booking.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${text}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] text-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-space text-sm font-semibold text-slate-300">Memuat E-Tiket & Invoice Resmi...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b14] p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center shadow-2xl space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-outfit font-black text-2xl text-white">Tiket Tidak Ditemukan</h2>
          <p className="font-work text-sm text-slate-400">
            Kode booking <span className="font-mono font-bold text-amber-400">{code}</span> tidak terdaftar dalam sistem reservasi kami.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold text-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b14] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950 print:bg-white print:py-0 print:px-0">
      
      {/* Top Floating Control Bar (Hidden When Printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-space font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 shadow-md transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-space font-bold text-slate-300 bg-slate-900/80 hover:bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
          </button>

          <button
            onClick={handleShareWa}
            className="inline-flex items-center gap-1.5 text-xs font-space font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Kirim ke WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="amber-gradient-btn inline-flex items-center gap-1.5 text-xs font-space font-black text-slate-950 px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Tiket / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Luxury Boarding Pass & Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 print:shadow-none print:border-none print:rounded-none">
        
        {/* Luxury Header Banner */}
        <div className="bg-[#0a0f1d] text-white p-6 sm:p-8 relative overflow-hidden">
          {/* Subtle gold grid & light glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-xl shrink-0">
                <Car className="w-8 h-8 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-outfit font-black text-2xl text-white tracking-tight leading-tight">
                    MERAPI JEEP
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-space font-black uppercase">
                    OFFICIAL 4X4 PASS
                  </span>
                </div>
                <p className="font-space text-xs text-amber-400 tracking-widest uppercase mt-0.5">
                  E-TIKET & SURAT KONFIRMASI INVOICE RESMI
                </p>
                <div className="flex items-center gap-2 text-[11px] font-work text-slate-400 mt-1">
                  <span>Basecamp Kaliurang Barat</span>
                  <span>•</span>
                  <span>Paguyuban Resmi Sleman, DIY</span>
                </div>
              </div>
            </div>

            {/* Official Stamp */}
            <div className="self-start sm:self-auto text-left sm:text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-space font-black text-xs uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>APPROVED & TERVERIFIKASI</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 block">
                Diterbitkan: {new Date(booking.approvedAt || booking.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Perforated Stub Line with Circles */}
        <div className="relative py-2 bg-slate-900 border-t border-b border-slate-800">
          <div className="border-b border-dashed border-slate-700 w-full" />
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070b14] print:bg-white" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070b14] print:bg-white" />
        </div>

        {/* Booking Code Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 sm:px-8 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-space font-bold text-amber-800 tracking-widest uppercase block">
              NOMOR REGISTRASI / KODE TIKET:
            </span>
            <span className="font-outfit font-black text-3xl sm:text-4xl text-slate-950 font-mono tracking-wider">
              {booking.bookingCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-space font-bold text-slate-500 uppercase block">
                Status Pembayaran:
              </span>
              <span className={`inline-block font-space font-black text-xs px-3.5 py-1.5 rounded-lg uppercase tracking-wider ${
                booking.remainingAmount === 0
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-amber-500 text-slate-950 shadow-sm'
              }`}>
                {booking.remainingAmount === 0 ? '✓ SUDAH LUNAS' : '✓ DP MASUK (TERVERIFIKASI)'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 font-work text-xs">
          
          {/* 2-Column Boarding Pass Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Informasi Tamu */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-outfit font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>DATA TAMU & PESERTA</span>
                </span>
                <span className="font-space text-[10px] font-bold text-slate-500 uppercase">
                  PRIMARY CONTACT
                </span>
              </div>

              <div className="space-y-2 text-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Nama Pemesan:</span>
                  <span className="font-bold text-slate-950 text-sm">{booking.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Nomor WhatsApp:</span>
                  <span className="font-mono font-bold text-slate-900">{booking.customerPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Jumlah Penumpang:</span>
                  <span className="font-bold text-slate-900">{booking.paxCount} Orang Dewasa</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Alokasi Armada:</span>
                  <span className="font-bold text-slate-900">{booking.jeepCount} Unit Jeep 4x4</span>
                </div>
              </div>
            </div>

            {/* Box 2: Jadwal & Armada Tur */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-outfit font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>JADWAL OPERASIONAL TUR</span>
                </span>
                <span className="font-space text-[10px] font-bold text-slate-500 uppercase">
                  CONFIRMED SCHEDULE
                </span>
              </div>

              <div className="space-y-2 text-slate-800">
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Paket Wisata:</span>
                  <span className="font-bold text-amber-800">{booking.packageName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Tanggal Keberangkatan:</span>
                  <span className="font-bold text-slate-950">{booking.tourDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50">
                  <span className="text-slate-500">Waktu Kumpul Basecamp:</span>
                  <span className="font-bold text-slate-950 font-space text-xs">{booking.tourTime}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Driver & No. Polisi:</span>
                  <span className="font-bold text-slate-900">
                    {booking.driverName || 'Driver Terjadwal'} ({booking.jeepNumber || 'Unit 4x4'})
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Rincian Finansial & Deal Invoice Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-outfit font-bold text-sm text-slate-950 uppercase tracking-wider">
                RINCIAN PEMBAYARAN & REKAP KESEPAKATAN
              </h3>
              <span className="text-[10px] font-space text-slate-500 uppercase">
                Metode DP: {booking.paymentMethod}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-space text-[11px] text-slate-700 uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Item Deskripsi Layanan</th>
                    <th className="p-3.5 text-center">Unit</th>
                    <th className="p-3.5 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-950">{booking.packageName}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Termasuk Unit 4x4, Driver berpengalaman, BBM, Retribusi Pos Desa, Asuransi Resmi Jasa Raharja, dan Bantuan Foto Video.
                      </div>
                    </td>
                    <td className="p-4 text-center font-mono font-bold">{booking.jeepCount} Jeep</td>
                    <td className="p-4 text-right font-mono font-bold text-sm text-slate-900">
                      Rp {booking.totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-mono text-xs">
                  <tr>
                    <td colSpan={2} className="p-3.5 text-right font-space font-semibold text-slate-600">
                      Total Kesepakatan (Deal WA):
                    </td>
                    <td className="p-3.5 text-right font-bold text-slate-900 text-sm">
                      Rp {booking.totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/60 text-emerald-800">
                    <td colSpan={2} className="p-3.5 text-right font-space font-bold">
                      Uang Muka / DP Diterima ({booking.paymentMethod}):
                    </td>
                    <td className="p-3.5 text-right font-black text-sm text-emerald-700">
                      - Rp {booking.dpAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="bg-amber-100/80 text-slate-950 font-bold">
                    <td colSpan={2} className="p-4 text-right font-outfit uppercase text-xs tracking-wider">
                      Sisa Pembayaran / Pelunasan di Lokasi:
                    </td>
                    <td className="p-4 text-right font-black text-amber-950 text-base">
                      {booking.remainingAmount === 0
                        ? 'LUNAS (Rp 0)'
                        : `Rp ${booking.remainingAmount.toLocaleString('id-ID')}`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-slate-800">
              <span className="font-space font-bold text-amber-900 block mb-1">Catatan Khusus dari Tamu:</span>
              <p className="italic text-slate-700">"{booking.notes}"</p>
            </div>
          )}

          {/* Basecamp Location & QR Check-in Box */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-slate-200 items-center">
            <div className="md:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <h4 className="font-outfit font-bold text-sm uppercase text-slate-950">
                  LOKASI CHECK-IN BASECAMP RESMI
                </h4>
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                Basecamp Kaliurang Barat, Hargobinangun, Pakem, Sleman, D.I. Yogyakarta 55582. Mohon hadir 15 menit sebelum jam keberangkatan untuk pembagian perlengkapan dan arahan keselamatan bersama driver.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-slate-600 font-space text-[11px] pt-1">
                <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Garansi Asuransi Jiwa Jasa Raharja</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Car className="w-4 h-4 text-amber-600" />
                  <span>Armada 4x4 SNI Bersertifikasi</span>
                </div>
              </div>
            </div>

            {/* Simulated QR Code */}
            <div className="md:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-1.5">
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200">
                <QrCode className="w-20 h-20 text-slate-950" />
              </div>
              <span className="font-space font-bold text-[10px] text-slate-500 uppercase tracking-widest">
                VERIFIED TICKET PASS
              </span>
              <span className="font-mono font-bold text-xs text-amber-900">
                {booking.bookingCode}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-slate-500 font-work text-[11px]">
          Dokumen ini merupakan e-Tiket & Bukti Pembayaran Resmi yang sah diterbitkan oleh Operasional Merapi Jeep Adventure Tour.
        </div>

      </div>

    </div>
  );
}
