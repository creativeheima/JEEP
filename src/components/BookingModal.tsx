'use client';

import React, { useState } from 'react';
import { X, Calendar, User, Phone, Users, Compass, CheckCircle2 } from 'lucide-react';
import { packagesData } from './PackagesSection';

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
  const [jeepCount, setJeepCount] = useState(1);
  const [passengers, setPassengers] = useState(4);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pkgInfo = packagesData.find((p) => p.title === selectedPkg);
    const message = `Halo Admin Merapi Jeep Adventure, saya ingin booking tur:%0A%0A` +
      `*Nama:* ${encodeURIComponent(name || 'Pelanggan')}%0A` +
      `*No HP:* ${encodeURIComponent(phone || '-')}%0A` +
      `*Pilihan Paket:* ${encodeURIComponent(selectedPkg)} (${pkgInfo?.price || ''})%0A` +
      `*Tanggal:* ${encodeURIComponent(date || 'Hari ini/Besok')}%0A` +
      `*Jumlah Jeep:* ${jeepCount} Unit (${passengers} Penumpang)%0A` +
      (notes ? `*Catatan Tambahan:* ${encodeURIComponent(notes)}%0A` : '') +
      `%0AMohon info ketersediaan slot armada. Terima kasih!`;

    window.open(`https://wa.me/6281234567890?text=${message}`, '_blank');
    onClose();
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

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-space font-bold text-xs mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>RESERVASI ARMADA 4X4</span>
          </div>
          <h3 className="font-outfit font-black text-2xl text-slate-950">
            Pesan Petualangan Merapi
          </h3>
          <p className="font-work text-xs text-slate-500 mt-1">
            Isi formulir singkat di bawah untuk konfirmasi cepat via WhatsApp Basecamp.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-work text-xs">
          {/* Choose Package */}
          <div>
            <label className="font-space font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
              Pilihan Paket:
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
              <label className="font-space font-bold text-slate-700 block mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="font-space font-bold text-slate-700 block mb-1">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="0812xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                />
              </div>
            </div>
          </div>

          {/* Date & Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1">
                Tanggal Keberangkatan
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="font-space font-bold text-slate-700 block mb-1">
                Jumlah Jeep (Maks 4 org/unit)
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={jeepCount}
                  onChange={(e) => {
                    const cnt = parseInt(e.target.value, 10);
                    setJeepCount(cnt);
                    setPassengers(cnt * 4);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
                >
                  <option value={1}>1 Jeep (1 - 4 Orang)</option>
                  <option value={2}>2 Jeep (5 - 8 Orang)</option>
                  <option value={3}>3 Jeep (9 - 12 Orang)</option>
                  <option value={5}>5+ Jeep (Rombongan/Gathering)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="font-space font-bold text-slate-700 block mb-1">
              Catatan Khusus (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Jemput di hotel Kaliurang / bawa anak kecil"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="amber-gradient-btn w-full py-3.5 rounded-xl font-space font-bold text-xs text-slate-950 shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>LANJUTKAN PESAN KE WHATSAPP</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <p className="text-center font-work text-[11px] text-slate-400 mt-2">
              Tanpa DP wajib di muka • Pembatalan gratis sebelum H-1
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}
