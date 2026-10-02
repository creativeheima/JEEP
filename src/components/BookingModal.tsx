'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Calendar,
  User,
  Phone,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Car,
  Plus,
  Minus
} from 'lucide-react';
import { defaultPackagesData } from './PackagesSection';
import { TourPackage } from '@/types/package';
import { Booking } from '@/types/booking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackage?: string;
}

export default function BookingModal({
  isOpen,
  onClose,
  initialPackage,
}: BookingModalProps) {
  const [selectedPkg, setSelectedPkg] = useState(
    initialPackage || 'Paket Medium'
  );
  const [availablePackages, setAvailablePackages] = useState<TourPackage[]>(defaultPackagesData);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 WIB');
  const [jeepCount, setJeepCount] = useState(1);
  const [passengers, setPassengers] = useState(4);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetch('/api/packages')
      .then(r => r.json())
      .then(res => { if (res.success && Array.isArray(res.data) && res.data.length > 0) setAvailablePackages(res.data); })
      .catch(() => {});
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Nama dan Nomor WhatsApp wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name.trim(),
          customerPhone: phone.trim(),
          paxCount: passengers,
          jeepCount: jeepCount,
          packageName: selectedPkg,
          tourDate: date || new Date().toISOString().split('T')[0],
          tourTime: time,
          notes: notes,
          isClientSubmission: true,
          approvalStatus: 'PENDING',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSubmittedBooking(json.data);
      } else {
        alert('Gagal mengirim reservasi: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenWaChat = () => {
    if (!submittedBooking) return;
    const message = `Halo Admin Merapi Jeep Adventure,%0A%0A` +
      `Saya sudah mengisi formulir reservasi di website:%0A` +
      `📌 *Kode Booking:* ${submittedBooking.bookingCode}%0A` +
      `👤 *Nama:* ${encodeURIComponent(submittedBooking.customerName)}%0A` +
      `📱 *No HP:* ${encodeURIComponent(submittedBooking.customerPhone)}%0A` +
      `🚙 *Paket:* ${encodeURIComponent(submittedBooking.packageName)}%0A` +
      `📅 *Tanggal Tur:* ${submittedBooking.tourDate} (${submittedBooking.tourTime})%0A` +
      `👥 *Peserta:* ${submittedBooking.paxCount} Orang (${submittedBooking.jeepCount} Jeep)%0A` +
      (submittedBooking.notes ? `📝 *Catatan:* ${encodeURIComponent(submittedBooking.notes)}%0A` : '') +
      `%0ASaya ingin konfirmasi kesepakatan harga & pembayaran DP untuk di-approve tiketnya. Terima kasih! 🌋`;

    window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex sm:items-center items-end justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card / Bottom Sheet Container */}
      <div className="relative bg-white rounded-t-[28px] sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 z-10 overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300">
        
        {/* Mobile Drag Pill */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Sticky Header */}
        <div className="px-5 sm:px-6 pt-2 sm:pt-4 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-outfit font-black text-base sm:text-lg text-slate-950 leading-tight">
                {submittedBooking ? 'Status Pengajuan Reservasi' : 'Pesan Petualangan Merapi'}
              </h3>
              <p className="font-work text-[11px] text-slate-500 leading-none mt-0.5">
                {submittedBooking ? 'Data berhasil masuk ke sistem' : 'Basecamp Kaliurang Barat • 4x4 Offroad'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Tutup Formulir"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-4 font-work text-xs overscroll-contain">
          {submittedBooking ? (
            /* Success Screen */
            <div className="text-center space-y-4 py-2 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-300">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-space font-bold text-[10px] uppercase mb-1.5">
                  <span>DATA TELAH MASUK KE SISTEM BASECAMP</span>
                </div>
                <h3 className="font-outfit font-black text-xl text-slate-950">
                  Pemesanan Berhasil Diajukan!
                </h3>
                <p className="font-work text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Kode reservasi Anda telah terbit. Langkah berikutnya adalah konfirmasi harga final &amp; DP ke Admin via WhatsApp.
                </p>
              </div>

              {/* Booking Code Card */}
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-1">
                <span className="font-space text-[10px] font-bold text-amber-800 uppercase tracking-widest block">
                  NOMOR REGISTRASI / KODE BOOKING
                </span>
                <span className="font-outfit font-black text-2xl text-slate-950 font-mono tracking-wider block">
                  {submittedBooking.bookingCode}
                </span>
                <div className="pt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase bg-amber-200 text-amber-900 border border-amber-300">
                    Status: Menunggu Approval Admin
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleOpenWaChat}
                  className="amber-gradient-btn w-full h-12 rounded-xl font-space font-black text-xs text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] transition-all"
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <span>HUBUNGI ADMIN WA UNTUK DEAL &amp; DP</span>
                </button>

                <Link
                  href={`/invoice/${submittedBooking.bookingCode}`}
                  onClick={onClose}
                  className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-space font-bold flex items-center justify-center gap-2 transition-colors block text-center"
                >
                  <span>Lihat Status E-Tiket Saya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Booking Form */
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-3.5">
              {/* Choose Package */}
              <div>
                <label className="font-space font-bold text-slate-700 block mb-1.5 uppercase tracking-wide text-[11px]">
                  Pilihan Paket Wisata:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePackages.map((pkg) => {
                    const isSelected = selectedPkg === pkg.title;
                    return (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => setSelectedPkg(pkg.title)}
                        className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/30 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-outfit font-bold text-xs text-slate-900 leading-tight">
                            {pkg.title}
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 text-[10px] font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <div className="font-space font-black text-amber-700 text-xs mt-1">
                          {pkg.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase text-[11px]">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 h-11 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase text-[11px]">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="0812xxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 h-11 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase text-[11px]">
                    Tanggal Tur <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 h-11 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase text-[11px]">
                    Perkiraan Jam Kumpul
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="09:00 WIB"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-3 h-11 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                    />
                  </div>
                  {/* Quick Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['04:30 WIB (Sunrise)', '08:30 WIB', '10:00 WIB', '13:30 WIB', '15:30 WIB'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTime(t.split(' ')[0] + ' WIB')}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-space font-semibold transition-all ${
                          time.startsWith(t.split(' ')[0])
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Passengers & Jeep Count Steppers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase text-[11px]">
                    Jumlah Peserta (Orang)
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-2 h-11">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(1, passengers - 1);
                        setPassengers(next);
                        setJeepCount(Math.ceil(next / 4));
                      }}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition-all shadow-xs"
                      title="Kurangi"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 font-outfit font-black text-sm text-slate-900">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>{passengers} Orang</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const next = passengers + 1;
                        setPassengers(next);
                        setJeepCount(Math.ceil(next / 4));
                      }}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold flex items-center justify-center transition-all shadow-xs"
                      title="Tambah"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase text-[11px]">
                    Kebutuhan Armada (Maks 4 org/unit)
                  </label>
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-2 h-11">
                    <button
                      type="button"
                      onClick={() => setJeepCount(Math.max(1, jeepCount - 1))}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 active:scale-95 text-slate-700 font-bold flex items-center justify-center transition-all shadow-xs"
                      title="Kurangi Jeep"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1.5 font-outfit font-black text-sm text-slate-900">
                      <Car className="w-4 h-4 text-amber-600" />
                      <span>{jeepCount} Unit Jeep</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setJeepCount(jeepCount + 1)}
                      className="w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold flex items-center justify-center transition-all shadow-xs"
                      title="Tambah Jeep"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase text-[11px]">
                  Catatan Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Bawa anak kecil / ingin jemput di hotel sekitar Kaliurang"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 text-base sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50 resize-none"
                />
              </div>
            </form>
          )}
        </div>

        {/* Sticky Footer for Form Submission (Only when form is active) */}
        {!submittedBooking && (
          <div className="p-3.5 sm:p-5 border-t border-slate-100 bg-white/95 backdrop-blur-xs shrink-0 z-20">
            <button
              type="submit"
              form="booking-form"
              disabled={submitting}
              className="amber-gradient-btn w-full h-12 rounded-xl font-space font-black text-xs text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] transition-all"
            >
              <span>{submitting ? 'MENGIRIM RESERVASI...' : 'KIRIM DATA RESERVASI KE BASECAMP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center font-work text-[10.5px] text-slate-400 mt-1.5 leading-tight">
              Tanpa biaya sekarang &bull; Deal harga &amp; DP via WhatsApp Admin
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
