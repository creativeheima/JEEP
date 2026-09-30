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
  AlertCircle
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
    const url = window.location.href;
    const text = `Halo Kak ${booking.customerName}, berikut adalah E-Tiket & Invoice resmi Merapi Jeep Adventure Anda:%0A%0A` +
      `📌 *Kode Booking:* ${booking.bookingCode}%0A` +
      `🚙 *Paket:* ${booking.packageName}%0A` +
      `📅 *Tanggal:* ${booking.tourDate} (${booking.tourTime})%0A` +
      `👥 *Peserta:* ${booking.paxCount} Orang (${booking.jeepCount} Jeep)%0A` +
      `💰 *Total Deal:* Rp ${booking.totalAmount.toLocaleString('id-ID')}%0A` +
      `✅ *DP Masuk:* Rp ${booking.dpAmount.toLocaleString('id-ID')}%0A` +
      `⏳ *Sisa Pelunasan:* Rp ${booking.remainingAmount.toLocaleString('id-ID')}%0A%0A` +
      `Lihat e-Tiket lengkap disini:%0A${encodeURIComponent(url)}%0A%0A` +
      `Tunjukkan e-tiket ini kepada petugas di Basecamp Kaliurang saat kedatangan. Salam Petualang! 🌋`;

    const waUrl = `https://wa.me/${booking.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${text}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-space text-sm font-semibold text-slate-600">Memuat E-Tiket & Invoice...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-outfit font-black text-2xl text-slate-900">Tiket Tidak Ditemukan</h2>
          <p className="font-work text-sm text-slate-500">
            Kode booking <span className="font-mono font-bold text-slate-800">{code}</span> tidak ditemukan dalam sistem kami.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-space font-bold text-xs hover:bg-slate-800"
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
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-white print:bg-white print:py-0 print:px-0">
      
      {/* Top Action Bar (Hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-space font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-space font-bold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs hover:bg-slate-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Tautan Disalin!' : 'Bagikan'}</span>
          </button>

          <button
            onClick={handleShareWa}
            className="inline-flex items-center gap-1.5 text-xs font-space font-bold text-emerald-800 bg-emerald-100/80 px-3.5 py-2 rounded-xl border border-emerald-300 shadow-xs hover:bg-emerald-200"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Kirim WhatsApp</span>
          </button>

          <button
            onClick={handlePrint}
            className="amber-gradient-btn inline-flex items-center gap-1.5 text-xs font-space font-bold text-slate-950 px-4 py-2 rounded-xl shadow-md cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak / Simpan PDF</span>
          </button>
        </div>
      </div>

      {/* Main E-Ticket & Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Ribbon */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-amber-500/10 pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            {/* Brand Logo & Name */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-md">
                <Car className="w-7 h-7 text-slate-950" />
              </div>
              <div>
                <h1 className="font-outfit font-black text-xl text-white tracking-tight flex items-center gap-2">
                  MERAPI JEEP ADVENTURE
                  <span className="text-[10px] font-space font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded">
                    OFFICIAL
                  </span>
                </h1>
                <p className="font-space text-xs text-amber-400 tracking-wider">
                  SURAT KONFIRMASI & INVOICE ELEKTRONIK
                </p>
              </div>
            </div>

            {/* Approval Badge / Stamp */}
            <div className="inline-flex sm:flex-col items-center sm:items-end gap-1.5 bg-slate-900/90 sm:bg-transparent px-3 py-2 sm:p-0 rounded-xl border border-slate-800 sm:border-none self-start sm:self-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-space font-black tracking-wider uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>BOOKING APPROVED</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {new Date(booking.approvedAt || booking.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Booking Code & Status Strip */}
        <div className="bg-amber-50 border-b border-amber-200/80 px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-space font-bold text-amber-800 tracking-widest uppercase block">
              KODE BOOKING TIKET:
            </span>
            <span className="font-outfit font-black text-2xl sm:text-3xl text-slate-950 tracking-wider font-mono">
              {booking.bookingCode}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-space font-semibold text-slate-500 block uppercase">
                Status Pembayaran:
              </span>
              <span className={`inline-block font-space font-black text-xs px-2.5 py-1 rounded-md uppercase ${
                booking.remainingAmount === 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-slate-950'
              }`}>
                {booking.remainingAmount === 0 ? '✓ LUNAS' : '✓ DP DITERIMA'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8 font-work text-xs">
          
          {/* 2 Column Details: Pemesan & Tur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
            {/* Left: Data Pemesan */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
              <h3 className="font-outfit font-bold text-sm text-slate-900 uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>INFORMASI PEMESAN</span>
              </h3>
              
              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nama Tamu:</span>
                  <span className="font-bold text-slate-900">{booking.customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Nomor WhatsApp:</span>
                  <span className="font-bold text-slate-900 font-mono">{booking.customerPhone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Jumlah Peserta:</span>
                  <span className="font-bold text-slate-900">{booking.paxCount} Orang</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Armada Jeep:</span>
                  <span className="font-bold text-slate-900">{booking.jeepCount} Unit 4x4</span>
                </div>
              </div>
            </div>

            {/* Right: Jadwal & Armada */}
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
              <h3 className="font-outfit font-bold text-sm text-slate-900 uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>JADWAL & OPERASIONAL</span>
              </h3>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Paket Wisata:</span>
                  <span className="font-bold text-amber-700">{booking.packageName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Tanggal Tur:</span>
                  <span className="font-bold text-slate-900">{booking.tourDate}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Waktu Kumpul:</span>
                  <span className="font-bold text-slate-900">{booking.tourTime}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Driver & Unit:</span>
                  <span className="font-bold text-slate-900">
                    {booking.driverName || 'Mas Agus'} ({booking.jeepNumber || 'AB 1928 MJ'})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Breakdown Table */}
          <div className="space-y-3">
            <h3 className="font-outfit font-bold text-sm text-slate-900 uppercase tracking-wider">
              RINCIAN KEUANGAN & PEMBAYARAN (DEAL WA)
            </h3>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 font-space text-[11px] text-slate-700 uppercase">
                  <tr>
                    <th className="p-3.5">Deskripsi Transaksi</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  <tr>
                    <td className="p-3.5">
                      <div className="font-bold">{booking.packageName} (All-Inclusive)</div>
                      <div className="text-[11px] text-slate-500">
                        Driver, BBM, Retribusi Pos, Asuransi Jasa Raharja & Free Foto
                      </div>
                    </td>
                    <td className="p-3.5 text-center font-mono">{booking.jeepCount} Jeep</td>
                    <td className="p-3.5 text-right font-mono font-bold">
                      Rp {booking.totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-mono text-xs">
                  <tr>
                    <td colSpan={2} className="p-3 text-right font-space font-semibold text-slate-600">
                      Total Nilai Kesepakatan:
                    </td>
                    <td className="p-3 text-right font-bold text-slate-900">
                      Rp {booking.totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="text-emerald-700 bg-emerald-50/50">
                    <td colSpan={2} className="p-3 text-right font-space font-semibold">
                      Uang Muka / DP ({booking.paymentMethod}):
                    </td>
                    <td className="p-3 text-right font-black">
                      - Rp {booking.dpAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                  <tr className="bg-amber-100/70 text-slate-950 font-bold text-sm">
                    <td colSpan={2} className="p-3.5 text-right font-outfit uppercase">
                      Sisa Pelunasan di Basecamp:
                    </td>
                    <td className="p-3.5 text-right font-black text-amber-900 text-base">
                      {booking.remainingAmount === 0
                        ? 'LUNAS (Rp 0)'
                        : `Rp ${booking.remainingAmount.toLocaleString('id-ID')}`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes & Special Request if any */}
          {booking.notes && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-space font-bold text-slate-700 block mb-1">Catatan Tambahan:</span>
              <p className="text-slate-600 italic">"{booking.notes}"</p>
            </div>
          )}

          {/* Basecamp Location & Check-in Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
            <div className="md:col-span-2 space-y-3">
              <h4 className="font-outfit font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>TITIK KUMPUL & BASECAMP RESMI</span>
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Basecamp Kaliurang Barat, Hargobinangun, Pakem, Sleman, D.I. Yogyakarta 55582. Harap tiba 15 menit sebelum waktu keberangkatan untuk briefing keselamatan dan pembagian helm SNI.
              </p>
              <div className="flex items-center gap-4 text-slate-500 font-space text-[11px]">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Asuransi Aktif</span>
                </div>
                <div className="flex items-center gap-1">
                  <Car className="w-4 h-4 text-amber-600" />
                  <span>Unit 4x4 Siap Jalur</span>
                </div>
              </div>
            </div>

            {/* Verification Barcode / Stamp Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center space-y-2">
              <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                <QrCode className="w-16 h-16 text-slate-800" />
              </div>
              <span className="font-mono text-[10px] text-slate-500 tracking-wider">
                SCAN FOR BASECAMP CHECK-IN
              </span>
              <span className="font-mono font-bold text-xs text-amber-800">
                {booking.bookingCode}
              </span>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-slate-500 font-work text-[11px]">
          Invoice ini diterbitkan secara sah oleh sistem manajemen operasional Merapi Jeep Adventure Tour Yogyakarta.
        </div>

      </div>

    </div>
  );
}
