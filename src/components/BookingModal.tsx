'use client';

import React, { useState } from 'react';
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
  ExternalLink,
  MessageSquare,
  Car
} from 'lucide-react';
import { packagesData } from './PackagesSection';
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
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 WIB');
  const [jeepCount, setJeepCount] = useState(1);
  const [passengers, setPassengers] = useState(4);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Nama dan Nomor WhatsApp wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
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
    const pkgInfo = packagesData.find((p) => p.title === submittedBooking.packageName);
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
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedBooking ? (
          /* Success Screen After Client Inputs Booking */
          <div className="text-center space-y-5 py-2 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-space font-bold text-xs uppercase mb-2">
                <span>DATA TELAH MASUK KE SISTEM BASECAMP</span>
              </div>
              <h3 className="font-outfit font-black text-2xl text-slate-950">
                Pemesanan Berhasil Diajukan!
              </h3>
              <p className="font-work text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Kode reservasi Anda telah dibuat. Langkah selanjutnya adalah konfirmasi kesepakatan harga & DP dengan Admin via WhatsApp.
              </p>
            </div>

            {/* Ticket Code Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <span className="font-space text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                KODE RESERVASI ANDA
              </span>
              <span className="font-outfit font-black text-2xl text-slate-950 font-mono tracking-wider">
                {submittedBooking.bookingCode}
              </span>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  Status: Menunggu Konfirmasi & Approval Admin
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleOpenWaChat}
                className="amber-gradient-btn w-full py-3.5 rounded-xl font-space font-black text-xs text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>LANJUTKAN CHAT WA UNTUK DEAL HARGA & DP</span>
              </button>

              <Link
                href={`/invoice/${submittedBooking.bookingCode}`}
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-space font-bold flex items-center justify-center gap-2 transition-colors block text-center"
              >
                <span>Lihat Status E-Tiket Saya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form Input by Client */
          <>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-space font-bold text-xs mb-2">
                <Compass className="w-3.5 h-3.5" />
                <span>FORMULIR PEMESANAN JEEP 4X4</span>
              </div>
              <h3 className="font-outfit font-black text-2xl text-slate-950">
                Pesan Petualangan Merapi
              </h3>
              <p className="font-work text-xs text-slate-500 mt-1">
                Isi data pemesanan Anda di bawah. Admin basecamp akan mereview dan mengonfirmasi reservasi resmi Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-work text-xs">
              {/* Choose Package */}
              <div>
                <label className="font-space font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                  Pilihan Paket Wisata:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {packagesData.map((pkg) => (
                    <button
                      type="button"
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg.title)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        selectedPkg === pkg.title
                          ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="font-outfit font-bold text-xs text-slate-900">
                        {pkg.title}
                      </div>
                      <div className="font-space font-black text-amber-700 text-xs mt-0.5">
                        {pkg.price}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase">
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
                      className="w-full pl-9 pr-3 h-11 py-0 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase">
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
                      className="w-full pl-9 pr-3 h-11 py-0 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase">
                    Tanggal Tur <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-9 pr-3 h-11 py-0 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1 uppercase">
                    Perkiraan Jam Kumpul
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="09:00 WIB"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full pl-9 pr-3 h-11 py-0 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Passengers & Jeep Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-space font-bold text-slate-700 flex items-end sm:min-h-[2rem] mb-1 uppercase">
                    Jumlah Orang
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="number"
                      min={1}
                      required
                      value={passengers}
                      onChange={(e) => {
                        const p = Number(e.target.value);
                        setPassengers(p);
                        setJeepCount(Math.ceil(p / 4));
                      }}
                      className="w-full pl-9 pr-3 h-11 py-0 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-700 flex items-end sm:min-h-[2rem] mb-1 uppercase">
                    Jumlah Unit Jeep (Maks 4 org/unit)
                  </label>
                  <div className="relative">
                    <Car className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                    type="number"
                    min={1}
                    value={jeepCount}
                    onChange={(e) => setJeepCount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 h-11 py-0 text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50 font-mono"
                  />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase">
                  Catatan Khusus (Opsional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Bawa anak kecil / ingin jemput di hotel sekitar Kaliurang"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="amber-gradient-btn w-full py-3.5 rounded-xl font-space font-black text-xs text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{submitting ? 'MENGIRIM RESERVASI...' : 'KIRIM DATA RESERVASI KE BASECAMP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-center font-work text-[11px] text-slate-400 mt-2">
                  Setelah dikirim, data akan masuk ke sistem Admin untuk di-approve invoice resminya.
                </p>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
}
