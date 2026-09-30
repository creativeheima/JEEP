'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search, Ticket, ArrowRight, AlertCircle } from 'lucide-react';

interface CheckTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckTicketModal({ isOpen, onClose }: CheckTicketModalProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = code.trim();
    if (!query) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(query)}`);
      const json = await res.json();
      if (json.success && json.data) {
        onClose();
        router.push(`/invoice/${json.data.bookingCode}`);
      } else {
        setError('Tiket tidak ditemukan. Pastikan Kode Booking atau No HP sudah benar.');
      }
    } catch {
      setError('Terjadi kendala saat memeriksa tiket.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="font-outfit font-black text-2xl text-slate-950">
            Cek E-Tiket & Invoice
          </h3>
          <p className="font-work text-xs text-slate-500 mt-1">
            Masukkan Kode Booking (contoh: <span className="font-mono font-bold text-slate-700">MJA-2026-001</span>) untuk membuka tiket Anda.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4 font-work text-xs">
          <div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="MJA-2026-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50 font-mono font-bold text-sm uppercase"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1.5 text-red-600 text-[11px] mt-2 bg-red-50 p-2 rounded-lg border border-red-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="amber-gradient-btn w-full py-3.5 rounded-xl font-space font-bold text-xs text-slate-950 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Memeriksa...' : 'CARI TIKET SAYA'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="font-work text-[11px] text-slate-400">
            Belum menerima kode tiket setelah deal di WhatsApp? Hubungi CS kami di WhatsApp 0812-3456-7890.
          </p>
        </div>

      </div>
    </div>
  );
}
