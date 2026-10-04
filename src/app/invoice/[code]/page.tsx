'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  Printer,
  Share2,
  CheckCircle2,
  Calendar,
  Users,
  Car,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Phone,
  AlertCircle,
  Clock,
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
        if (res.success && res.data) setBooking(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [code]);

  const isPending = booking?.approvalStatus === 'PENDING';
  const isCancelled = booking?.approvalStatus === 'CANCELLED';
  const isLunas = booking ? (booking.remainingAmount === 0 || booking.paymentStatus === 'LUNAS') : false;
  const hasDp = booking ? booking.dpAmount > 0 : false;

  const handlePrint = () => window.print();

  const handleShareWa = () => {
    if (!booking) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = isPending
      ? `Halo Kak ${booking.customerName}, berikut info pengajuan reservasi Merapi Jeep Adventure Anda:%0A%0A` +
        `Kode Booking: ${booking.bookingCode}%0A` +
        `Paket: ${booking.packageName}%0A` +
        `Tanggal: ${booking.tourDate} (${booking.tourTime})%0A` +
        `Status: MENUNGGU APPROVAL ADMIN%0A%0A` +
        `Cek Status: ${encodeURIComponent(url)}%0A%0AAdmin basecamp kami akan segera menghubungi untuk konfirmasi ketersediaan armada dan DP.`
      : `Halo Kak ${booking.customerName}, berikut E-Tiket resmi Merapi Jeep Adventure:%0A%0A` +
        `Kode: ${booking.bookingCode}%0A` +
        `Paket: ${booking.packageName}%0A` +
        `Tanggal: ${booking.tourDate} (${booking.tourTime})%0A` +
        `Total: Rp ${booking.totalAmount.toLocaleString('id-ID')}%0A` +
        `DP: Rp ${booking.dpAmount.toLocaleString('id-ID')}%0A` +
        `Sisa: Rp ${booking.remainingAmount.toLocaleString('id-ID')}%0A%0A` +
        `E-Tiket: ${encodeURIComponent(url)}%0A%0ATunjukkan tiket di Basecamp Kaliurang. Salam Petualang!`;
    window.open(`https://wa.me/${booking.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-space text-xs font-semibold text-slate-300">Memuat E-Tiket...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 text-white">
        <div className="max-w-sm w-full bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="font-outfit font-black text-xl text-white">Tiket Tidak Ditemukan</h2>
          <p className="font-work text-sm text-slate-400">
            Kode <span className="font-mono font-bold text-amber-400">{code}</span> tidak terdaftar.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold text-xs transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          html, body { margin: 0; padding: 0; background: #fff !important; }
          .no-print { display: none !important; }
          .ticket-page-bg { background: #fff !important; padding: 0 !important; min-height: auto !important; }
          .ticket-card { box-shadow: none !important; border-radius: 6px !important; page-break-inside: avoid; max-width: 100% !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="ticket-page-bg min-h-screen bg-slate-900 py-8 px-4 sm:px-6">

        <div className="no-print max-w-2xl mx-auto mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-space font-bold text-slate-300 hover:text-white bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            Kembali
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyLink} className="inline-flex items-center gap-1.5 text-xs font-space font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer">
              <Share2 className="w-3.5 h-3.5 text-slate-400" />
              {copied ? 'Disalin!' : 'Bagikan'}
            </button>
            <button onClick={handleShareWa} className="inline-flex items-center gap-1.5 text-xs font-space font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl shadow transition-all cursor-pointer">
              <Phone className="w-3.5 h-3.5" />
              WA Tamu
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-1.5 text-xs font-space font-black text-slate-950 bg-amber-400 hover:bg-amber-300 px-5 py-2.5 rounded-xl shadow transition-all cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              Cetak / PDF
            </button>
          </div>
        </div>

        <div className="ticket-card max-w-2xl mx-auto bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-200 text-slate-900">

          {/* Top dark header */}
          <div className="bg-[#090e1c] px-6 py-3.5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 w-56 h-full bg-amber-500/10 blur-2xl rounded-full pointer-events-none" />
            <div className="flex items-center gap-3 relative z-10">
              <Image src="/images/logo.webp" alt="Merapi Jeep 4x4" width={2171} height={724} className="h-8 w-auto object-contain" />
              <div className="border-l border-slate-700 pl-3">
                <p className="font-space text-[9px] text-amber-400 font-bold tracking-widest uppercase">
                  {isPending ? 'Formulir Reservasi Wisata' : 'E-Tiket & Invoice Resmi'}
                </p>
                <p className="font-work text-[10px] text-slate-400">Basecamp Kaliurang Barat &bull; Sleman, DIY</p>
              </div>
            </div>

            {/* Approval badge in header */}
            <div className="relative z-10 text-right shrink-0">
              {isPending ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-space font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Clock className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                  <span>MENUNGGU APPROVAL</span>
                </div>
              ) : isCancelled ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-space font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/40">
                  <AlertCircle className="w-2.5 h-2.5 text-red-400" />
                  <span>DIBATALKAN</span>
                </div>
              ) : isLunas ? (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-space font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>LUNAS</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-space font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>APPROVED</span>
                </div>
              )}
              <p className="font-mono text-[9px] text-slate-500 mt-0.5">
                {new Date(booking.approvedAt || booking.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Yellow strip: Booking code & Payment/Approval Status */}
          <div className="bg-amber-50 border-y border-amber-200 px-6 py-2.5 flex items-center justify-between">
            <div>
              <p className="text-[8.5px] font-space font-bold text-amber-700 uppercase tracking-widest">
                {isPending ? 'Nomor Registrasi / Kode Booking' : 'Nomor Registrasi / Kode Tiket'}
              </p>
              <p className="font-outfit font-black text-[22px] text-slate-950 tracking-wider leading-none mt-0.5">{booking.bookingCode}</p>
            </div>
            <div className="text-right">
              <p className="text-[8.5px] font-space font-bold text-slate-500 uppercase">
                {isPending ? 'Status Reservasi' : 'Status Pembayaran'}
              </p>
              <span className={`inline-block font-space font-black text-[10px] px-3 py-1 rounded-lg uppercase mt-1 ${
                isPending
                  ? (hasDp ? 'bg-amber-400 text-slate-950' : 'bg-amber-200 text-amber-950 border border-amber-300')
                  : isCancelled
                  ? 'bg-red-500 text-white'
                  : isLunas
                  ? 'bg-emerald-600 text-white'
                  : (hasDp ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white')
              }`}>
                {isPending
                  ? (hasDp ? 'MENUNGGU VERIFIKASI DP' : 'MENUNGGU APPROVAL')
                  : isCancelled
                  ? 'DIBATALKAN'
                  : isLunas
                  ? 'LUNAS'
                  : (hasDp ? 'DP TERVERIFIKASI' : 'BAYAR DI BASECAMP')
                }
              </span>
            </div>
          </div>

          {/* Alert Notice for Pending Bookings */}
          {isPending && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50/90 border border-amber-300 flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-200/80 border border-amber-300 flex items-center justify-center shrink-0 text-amber-800">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
              <div className="text-[11px] leading-relaxed text-amber-950 flex-1">
                <p className="font-bold font-outfit text-amber-900 text-xs">
                  Permintaan Reservasi Sedang Menunggu Konfirmasi & Approval Admin
                </p>
                <p className="text-[10.5px] text-amber-800/90 mt-0.5 font-work leading-snug">
                  Data booking Anda telah tercatat di sistem kami. Admin Basecamp Merapi Jeep Adventure akan segera menghubungi WhatsApp Anda (<strong>{booking.customerPhone}</strong>) untuk memastikan ketersediaan armada, negosiasi harga deal, serta instruksi DP. Setelah disetujui oleh admin, tiket resmi ini akan aktif dan terverifikasi secara otomatis.
                </p>
              </div>
            </div>
          )}

          {/* Customer & Operational Schedule Grid */}
          <div className="px-5 pt-4 pb-3 grid grid-cols-2 gap-5 text-[10.5px] font-work">
            <div>
              <SectionTitle icon={<Users className="w-3 h-3" />} label="Data Tamu & Peserta" />
              <div className="mt-2 space-y-1.5">
                <InfoRow label="Nama Pemesan" value={booking.customerName} bold />
                <InfoRow label="No. WhatsApp" value={booking.customerPhone} mono />
                <InfoRow label="Jumlah Peserta" value={`${booking.paxCount} Orang`} bold />
                <InfoRow label="Alokasi Jeep" value={`${booking.jeepCount} Unit Jeep 4x4`} bold />
              </div>
            </div>
            <div>
              <SectionTitle icon={<Calendar className="w-3 h-3" />} label="Jadwal Operasional Tur" />
              <div className="mt-2 space-y-1.5">
                <InfoRow label="Paket Wisata" value={booking.packageName} bold amber />
                <InfoRow label="Tanggal Keberangkatan" value={booking.tourDate} bold />
                <InfoRow label="Jam Kumpul Basecamp" value={booking.tourTime} bold />
                <InfoRow
                  label="Driver / Armada"
                  value={
                    isPending
                      ? 'Menunggu Penugasan Driver'
                      : `${booking.driverName || 'Terjadwal'} - ${booking.jeepNumber || 'Unit 4x4'}`
                  }
                />
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="px-5 pb-3">
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-100 grid grid-cols-12 px-3.5 py-1.5 text-[8.5px] font-space font-bold uppercase text-slate-500 border-b border-slate-200">
                <span className="col-span-7">Deskripsi Layanan</span>
                <span className="col-span-2 text-center">Qty</span>
                <span className="col-span-3 text-right">Nominal</span>
              </div>
              <div className="grid grid-cols-12 px-3.5 py-2.5 text-[10.5px] border-b border-slate-100 items-start">
                <div className="col-span-7">
                  <p className="font-bold text-slate-950">{booking.packageName}</p>
                  <p className="text-[8.5px] text-slate-400 mt-0.5">Unit 4x4, driver, BBM, retribusi pos desa, asuransi Jasa Raharja</p>
                </div>
                <div className="col-span-2 text-center font-mono font-bold text-slate-700">{booking.jeepCount}x</div>
                <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                  Rp {booking.totalAmount.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                <FinRow
                  label={isPending ? 'Estimasi Total' : 'Total Kesepakatan'}
                  value={`Rp ${booking.totalAmount.toLocaleString('id-ID')}`}
                />
                <FinRow
                  label={`Uang Muka / DP (${booking.paymentMethod})`}
                  value={
                    isPending && !hasDp
                      ? 'Rp 0 (Belum Bayar DP)'
                      : `- Rp ${booking.dpAmount.toLocaleString('id-ID')}`
                  }
                  green={hasDp}
                />
                <FinRow
                  label={isPending ? 'Estimasi Sisa / Pelunasan' : 'Sisa Pelunasan di Lokasi'}
                  value={isLunas ? 'LUNAS (Rp 0)' : `Rp ${booking.remainingAmount.toLocaleString('id-ID')}`}
                  highlight
                  isLunas={isLunas}
                />
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="px-5 pb-3">
              <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-[9.5px] font-work text-slate-700">
                <span className="font-bold text-amber-800">Catatan: </span>
                <span className="italic">"{booking.notes}"</span>
              </div>
            </div>
          )}

          <div className="px-5 pb-4 grid grid-cols-12 gap-3 items-start">
            <div className="col-span-8 space-y-1.5">
              <p className="font-outfit font-bold text-[8.5px] uppercase text-amber-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 shrink-0" /> Lokasi Check-In Basecamp Resmi
              </p>
              <p className="text-[9.5px] text-slate-500 leading-relaxed">
                Basecamp Kaliurang Barat, Hargobinangun, Pakem, Sleman, D.I. Yogyakarta 55582.
                Hadir <strong className="text-slate-700">15 menit lebih awal</strong> untuk perlengkapan dan safety briefing.
              </p>
              <div className="flex flex-wrap gap-3 pt-0.5">
                <SmallBadge icon={<ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />} label="Asuransi Jasa Raharja" />
                <SmallBadge icon={<Car className="w-2.5 h-2.5 text-amber-600" />} label="Armada 4x4 Bersertifikasi" />
              </div>
            </div>
            <div className="col-span-4 flex flex-col items-center justify-center bg-slate-50 rounded-xl py-2.5 px-3 border border-slate-200 text-center space-y-1">
              <div className="w-14 h-14 grid grid-cols-4 gap-[2px] p-1 bg-white rounded-md border border-slate-200">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className={`rounded-[1px] ${
                    isPending
                      ? [0,2,5,7,8,10,13,15].includes(i) ? 'bg-amber-600' : 'bg-slate-100'
                      : [0,1,3,4,6,8,9,10,12,15].includes(i) ? 'bg-slate-950' : 'bg-slate-100'
                  }`} />
                ))}
              </div>
              <p className="font-space font-bold text-[7.5px] text-slate-400 uppercase tracking-widest">
                {isPending ? 'MENUNGGU APPROVAL' : isCancelled ? 'VOID PASS' : 'VERIFIED PASS'}
              </p>
              <p className="font-mono font-black text-[9px] text-amber-800">{booking.bookingCode}</p>
            </div>
          </div>

          <div className="bg-slate-900 px-5 py-2.5 flex items-center justify-between">
            <p className="text-[8.5px] font-work text-slate-400">
              Dokumen resmi Merapi Jeep Adventure Tour &bull; {new Date(booking.createdAt).getFullYear()}
            </p>
            <p className="font-mono text-[8.5px] text-amber-400 font-bold">{booking.bookingCode}</p>
          </div>

        </div>
      </div>
    </>
  );
}

function SectionTitle({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <p className="font-outfit font-bold text-[8.5px] uppercase tracking-widest text-amber-700 flex items-center gap-1 border-b border-slate-200 pb-1">
      {icon} {label}
    </p>
  );
}

function InfoRow({
  label,
  value,
  bold,
  mono,
  amber,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
  amber?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-1 last:border-0">
      <span className="text-slate-400 shrink-0 text-[10px]">{label}:</span>
      <span className={`text-right text-[10.5px] ${bold ? 'font-bold text-slate-900' : 'text-slate-700'} ${mono ? 'font-mono' : ''} ${amber ? 'text-amber-800' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function FinRow({
  label,
  value,
  green,
  highlight,
  isLunas,
}: {
  label: string;
  value: string;
  green?: boolean;
  highlight?: boolean;
  isLunas?: boolean;
}) {
  return (
    <div className={`grid grid-cols-12 px-3.5 py-1.5 ${highlight ? (isLunas ? 'bg-emerald-50' : 'bg-amber-100/70') : 'bg-slate-50'}`}>
      <span className={`col-span-9 text-right pr-3 font-space text-[9px] font-semibold ${green ? 'text-emerald-700' : highlight ? 'text-slate-800 font-bold uppercase text-[8.5px]' : 'text-slate-600'}`}>
        {label}:
      </span>
      <span className={`col-span-3 text-right font-black text-[10px] ${green ? 'text-emerald-700' : highlight ? (isLunas ? 'text-emerald-700' : 'text-amber-900') : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}

function SmallBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 text-[8.5px] font-space font-semibold text-slate-600">
      {icon}
      <span>{label}</span>
    </div>
  );
}