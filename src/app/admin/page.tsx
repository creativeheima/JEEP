'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  Trash2,
  Phone,
  Eye,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Home
} from 'lucide-react';
import { Booking } from '@/types/booking';

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form states (wajib sesuai instruksi: nama, no hp, jumlah orang, jumlah bayar, dp)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paxCount, setPaxCount] = useState(4);
  const [jeepCount, setJeepCount] = useState(1);
  const [packageName, setPackageName] = useState('Paket Medium');
  const [tourDate, setTourDate] = useState(new Date().toISOString().split('T')[0]);
  const [tourTime, setTourTime] = useState('09:00 WIB');
  const [totalAmount, setTotalAmount] = useState<number | string>(500000);
  const [dpAmount, setDpAmount] = useState<number | string>(150000);
  const [paymentMethod, setPaymentMethod] = useState('Transfer BCA');
  const [driverName, setDriverName] = useState('Mas Agus');
  const [jeepNumber, setJeepNumber] = useState('AB 1928 MJ');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?search=${encodeURIComponent(search)}&status=${statusFilter}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [search, statusFilter]);

  // Recalculate remaining amount on form
  const numTotal = Number(totalAmount) || 0;
  const numDp = Number(dpAmount) || 0;
  const numRemaining = Math.max(0, numTotal - numDp);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !numTotal) {
      alert('Nama pemesan, No WhatsApp, dan Total harga wajib diisi!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          paxCount,
          jeepCount,
          packageName,
          tourDate,
          tourTime,
          totalAmount: numTotal,
          dpAmount: numDp,
          paymentMethod,
          driverName,
          jeepNumber,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessBooking(json.data);
        fetchBookings();
        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
      } else {
        alert('Gagal membuat booking: ' + (json.error || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkLunas = async (id: string) => {
    if (!confirm('Tandai booking ini sebagai LUNAS?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'LUNAS' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus booking ini?')) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendWa = (b: Booking) => {
    const origin = window.location.origin;
    const invoiceUrl = `${origin}/invoice/${b.bookingCode}`;
    const text = `Halo Kak ${b.customerName}, terima kasih sudah reservasi di Merapi Jeep Adventure.%0A%0A` +
      `Pesanan Anda sudah kami *APPROVE & TERKONFIRMASI*:%0A` +
      `📌 *Kode Booking:* ${b.bookingCode}%0A` +
      `🚙 *Paket:* ${b.packageName}%0A` +
      `📅 *Tanggal:* ${b.tourDate} (${b.tourTime})%0A` +
      `👥 *Peserta:* ${b.paxCount} Orang (${b.jeepCount} Jeep)%0A` +
      `💰 *Total Deal:* Rp ${b.totalAmount.toLocaleString('id-ID')}%0A` +
      `✅ *DP Masuk:* Rp ${b.dpAmount.toLocaleString('id-ID')}%0A` +
      `⏳ *Sisa Pelunasan di Lokasi:* Rp ${b.remainingAmount.toLocaleString('id-ID')}%0A%0A` +
      `Silakan buka e-Tiket & Invoice resmi Anda melalui tautan berikut:%0A${encodeURIComponent(invoiceUrl)}%0A%0A` +
      `Sampai jumpa di Basecamp Kaliurang! 🌋`;

    const wa = `https://wa.me/${b.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${text}`;
    window.open(wa, '_blank');
  };

  // Stats
  const totalBookingsCount = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalDpCollected = bookings.reduce((sum, b) => sum + b.dpAmount, 0);
  const totalRemaining = bookings.reduce((sum, b) => sum + b.remainingAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 selection:bg-amber-500 selection:text-white">
      
      {/* Top Navbar Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <div className="font-outfit font-black text-base text-white tracking-tight flex items-center gap-2">
                PORTAL ADMIN BASECAMP
                <span className="text-[10px] font-space font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded">
                  APPROVAL & INVOICE
                </span>
              </div>
              <p className="text-[10px] font-space text-slate-400">
                Merapi Jeep Adventure Tour Yogyakarta
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-space font-semibold text-slate-200 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Lihat Website</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Stat Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-space font-semibold text-slate-500 block uppercase">
              Total Booking
            </span>
            <div className="font-outfit font-black text-3xl text-slate-950 mt-1">
              {totalBookingsCount}
            </div>
            <span className="text-[11px] font-work text-slate-400 mt-1 block">
              Transaksi terverifikasi
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-space font-semibold text-slate-500 block uppercase">
              Total Nilai Deal
            </span>
            <div className="font-outfit font-black text-2xl text-slate-900 mt-1 font-mono">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] font-work text-slate-400 mt-1 block">
              Nilai kesepakatan WA
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-space font-semibold text-emerald-700 block uppercase">
              DP Terkumpul
            </span>
            <div className="font-outfit font-black text-2xl text-emerald-600 mt-1 font-mono">
              Rp {totalDpCollected.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] font-work text-emerald-600/80 mt-1 block">
              Uang muka masuk rekening
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-space font-semibold text-amber-700 block uppercase">
              Sisa Pelunasan di Lokasi
            </span>
            <div className="font-outfit font-black text-2xl text-amber-600 mt-1 font-mono">
              Rp {totalRemaining.toLocaleString('id-ID')}
            </div>
            <span className="text-[11px] font-work text-amber-700/80 mt-1 block">
              Dibayarkan saat tiba di Basecamp
            </span>
          </div>
        </div>

        {/* Input Booking Baru (Hasil Deal Chat WA) Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-space font-bold text-xs mb-2">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>INPUT MANUAL HASIL DEAL WHATSAPP</span>
              </div>
              <h2 className="font-outfit font-black text-2xl text-slate-950">
                Input & Approve Booking Pelanggan
              </h2>
              <p className="font-work text-xs text-slate-500 mt-1">
                Wajib input Nama, No HP, Jumlah Orang, Total Harga Deal, dan DP yang dibayar pelanggan.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateBooking} className="space-y-6 font-work text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Field 1: Nama Pelanggan */}
              <div>
                <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                  Nama Pemesan / Tamu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                />
              </div>

              {/* Field 2: No WhatsApp */}
              <div>
                <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                  Nomor HP / WhatsApp <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0812xxxxxxxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                />
              </div>

              {/* Field 3: Jumlah Orang & Jeep */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                    Jml Orang <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={paxCount}
                    onChange={(e) => setPaxCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                    Jml Jeep
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={jeepCount}
                    onChange={(e) => setJeepCount(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Field 4: Paket Wisata */}
              <div>
                <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                  Paket Wisata
                </label>
                <select
                  value={packageName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPackageName(val);
                    // auto default prices
                    if (val === 'Paket Short') setTotalAmount(400000 * jeepCount);
                    if (val === 'Paket Medium') setTotalAmount(500000 * jeepCount);
                    if (val === 'Paket Long') setTotalAmount(600000 * jeepCount);
                    if (val === 'Paket Sunrise') setTotalAmount(550000 * jeepCount);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                >
                  <option value="Paket Short">Paket Short (Rp 400.000 / unit)</option>
                  <option value="Paket Medium">Paket Medium - Best Seller (Rp 500.000 / unit)</option>
                  <option value="Paket Long">Paket Long (Rp 600.000 / unit)</option>
                  <option value="Paket Sunrise">Paket Sunrise (Rp 550.000 / unit)</option>
                  <option value="Paket Custom Gathering">Paket Custom Gathering</option>
                </select>
              </div>

              {/* Field 5: Tanggal & Jam Tur */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                    Tanggal Tur
                  </label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                    Jam Kumpul
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 WIB"
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Field 6: Pembayaran Deal & DP */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                    Total Deal (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="500000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-800 block mb-1.5 uppercase">
                    DP Dibayar (Rp) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="150000"
                    value={dpAmount}
                    onChange={(e) => setDpAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 text-slate-900 bg-slate-50/50 font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

            </div>

            {/* Calculations & Secondary Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 items-center">
              <div>
                <span className="font-space text-[10px] font-bold text-slate-500 uppercase block">
                  Sisa Pelunasan di Lokasi:
                </span>
                <span className="font-outfit font-black text-xl text-amber-900 font-mono">
                  {numRemaining === 0 ? 'LUNAS (Rp 0)' : `Rp ${numRemaining.toLocaleString('id-ID')}`}
                </span>
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase">
                  Metode Bayar DP:
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Transfer BCA">Transfer BCA</option>
                  <option value="Transfer Mandiri">Transfer Mandiri</option>
                  <option value="Transfer BRI">Transfer BRI</option>
                  <option value="QRIS">QRIS</option>
                  <option value="Tunai di Basecamp">Tunai di Basecamp</option>
                </select>
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase">
                  Driver & Jeep Unit (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Mas Agus (AB 1928 MJ)"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="pt-2 sm:pt-0">
                <button
                  type="submit"
                  disabled={submitting}
                  className="amber-gradient-btn w-full py-3 rounded-xl font-space font-bold text-xs text-slate-950 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Menyimpan...' : '✓ APPROVE & TERBITKAN TIKET'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Pop-up Saat Berhasil Input & Terbit Tiket */}
        {successBooking && (
          <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-400 shadow-lg space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-lg text-emerald-950">
                    Booking Telah Berhasil Di-Approve!
                  </h3>
                  <p className="font-work text-xs text-emerald-800">
                    Tiket & Invoice resmi dengan kode booking <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-slate-900">{successBooking.bookingCode}</span> sudah terbit.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/invoice/${successBooking.bookingCode}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-space font-bold text-slate-900 hover:bg-emerald-100 shadow-xs"
                >
                  <Eye className="w-4 h-4 text-emerald-700" />
                  <span>Buka Tiket / Invoice</span>
                </Link>

                <button
                  onClick={() => handleSendWa(successBooking)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-space font-bold hover:bg-emerald-700 shadow-md cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Kirim Invoice ke WA Tamu</span>
                </button>

                <button
                  onClick={() => setSuccessBooking(null)}
                  className="text-xs font-space text-slate-500 hover:text-slate-800 px-2"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabel Daftar Booking */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-outfit font-black text-xl text-slate-950">
                Daftar Booking Terverifikasi
              </h3>
              <p className="font-work text-xs text-slate-500">
                Semua data pemesanan yang telah deal dan di-approve oleh admin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama, no hp, kode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-amber-500 bg-slate-50"
                />
              </div>

              {/* Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-slate-50"
              >
                <option value="">Semua Status</option>
                <option value="APPROVED">Approved</option>
                <option value="LUNAS">Lunas</option>
                <option value="DP_DITERIMA">DP Diterima</option>
              </select>

              <button
                onClick={fetchBookings}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left font-work text-xs">
              <thead className="bg-slate-100 text-slate-700 font-space text-[11px] uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Kode & Tanggal</th>
                  <th className="p-3.5">Nama & No HP</th>
                  <th className="p-3.5">Paket & Peserta</th>
                  <th className="p-3.5 text-right">Total Deal</th>
                  <th className="p-3.5 text-right">DP Masuk</th>
                  <th className="p-3.5 text-right">Sisa Lokasi</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Aksi Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      {loading ? 'Memuat data booking...' : 'Belum ada data booking yang sesuai.'}
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-amber-900 block">
                          {b.bookingCode}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {b.tourDate} • {b.tourTime}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">
                          {b.customerName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {b.customerPhone}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {b.packageName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {b.paxCount} Org ({b.jeepCount} Jeep)
                        </span>
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                        Rp {b.totalAmount.toLocaleString('id-ID')}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                        Rp {b.dpAmount.toLocaleString('id-ID')}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-amber-800">
                        {b.remainingAmount === 0 ? 'LUNAS' : `Rp ${b.remainingAmount.toLocaleString('id-ID')}`}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase ${
                          b.remainingAmount === 0
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}>
                          {b.remainingAmount === 0 ? 'LUNAS' : 'DP DITERIMA'}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View Invoice */}
                          <Link
                            href={`/invoice/${b.bookingCode}`}
                            target="_blank"
                            title="Buka e-Tiket / Invoice"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          {/* Send WhatsApp */}
                          <button
                            onClick={() => handleSendWa(b)}
                            title="Kirim Invoice ke WA Tamu"
                            className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                          </button>

                          {/* Mark Lunas */}
                          {b.remainingAmount > 0 && (
                            <button
                              onClick={() => handleMarkLunas(b.id)}
                              title="Tandai Lunas"
                              className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(b.id)}
                            title="Hapus Booking"
                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

    </div>
  );
}
