'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Home,
  LogOut,
  ShieldCheck,
  Calendar,
  Sparkles,
  QrCode,
  FileText,
  BadgePercent,
  Check,
  Compass
} from 'lucide-react';
import { Booking } from '@/types/booking';
import { isClientAuthenticated, clearClientSession } from '@/lib/adminAuth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paxCount, setPaxCount] = useState(4);
  const [jeepCount, setJeepCount] = useState(1);
  const [packageName, setPackageName] = useState('Paket Medium (Best Seller)');
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

  // Check login authentication
  useEffect(() => {
    const auth = isClientAuthenticated();
    setIsAuthenticated(auth);
    if (!auth) {
      router.push('/admin/login');
    }
  }, [router]);

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
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [search, statusFilter, isAuthenticated]);

  const numTotal = Number(totalAmount) || 0;
  const numDp = Number(dpAmount) || 0;
  const numRemaining = Math.max(0, numTotal - numDp);

  // Quick DP presets
  const applyDpPreset = (percent: number) => {
    const calc = Math.round((numTotal * percent) / 100);
    setDpAmount(calc);
  };

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
        // Reset form to ready state
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

  const handleLogout = () => {
    clearClientSession();
    router.push('/admin/login');
  };

  const handleSendWa = (b: Booking) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
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

  // Stats calculations
  const totalBookingsCount = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalDpCollected = bookings.reduce((sum, b) => sum + b.dpAmount, 0);
  const totalRemaining = bookings.reduce((sum, b) => sum + b.remainingAmount, 0);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-24 selection:bg-amber-500 selection:text-slate-950">
      
      {/* Executive Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo & Operational Status */}
          <div className="flex items-center gap-3.5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <div className="font-outfit font-black text-base text-white tracking-tight flex items-center gap-2">
                  MERAPI JEEP
                  <span className="text-[10px] font-space font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    ADMIN HQ
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-space text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Basecamp Kaliurang Barat • Online</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Actions & Logout */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-space font-semibold text-slate-300 border border-slate-700/60 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Buka Website</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-space font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Top Header Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
              Pusat Verifikasi & Approval Tiket
            </h1>
            <p className="font-work text-xs sm:text-sm text-slate-400 mt-1">
              Input data hasil negosiasi/deal di WhatsApp, terbitkan e-tiket resmi, dan kirim langsung ke pelanggan.
            </p>
          </div>
        </div>

        {/* 4 Glowing Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1 */}
          <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-space text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Booking
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
            </div>
            <div className="font-outfit font-black text-3xl sm:text-4xl text-white">
              {totalBookingsCount}
            </div>
            <div className="text-[11px] font-work text-slate-500 mt-2 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Semua tur terkonfirmasi</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-space text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nilai Kesepakatan
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="font-outfit font-black text-2xl sm:text-3xl text-white font-mono">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-work text-slate-500 mt-2">
              Total omset dari chat WA
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-space text-xs font-bold text-emerald-400 uppercase tracking-wider">
                DP Terkumpul
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="font-outfit font-black text-2xl sm:text-3xl text-emerald-400 font-mono">
              Rp {totalDpCollected.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-work text-emerald-500/80 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dana masuk rekening</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-900/70 backdrop-blur-md p-5 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <span className="font-space text-xs font-bold text-amber-400 uppercase tracking-wider">
                Pelunasan di Lokasi
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="font-outfit font-black text-2xl sm:text-3xl text-amber-400 font-mono">
              Rp {totalRemaining.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-work text-amber-500/80 mt-2">
              Ditagihkan saat tamu tiba
            </div>
          </div>
        </div>

        {/* Success Modal / Banner After Approval */}
        {successBooking && (
          <div className="p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/60 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-outfit font-black text-xl text-white">
                      E-Tiket Berhasil Diterbitkan & Di-Approve!
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-space font-bold uppercase">
                      READY TO SEND
                    </span>
                  </div>
                  <p className="font-work text-xs text-slate-300 mt-1">
                    Kode Tiket: <span className="font-mono font-bold text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{successBooking.bookingCode}</span> atas nama <strong className="text-white">{successBooking.customerName}</strong> ({successBooking.customerPhone}).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={`/invoice/${successBooking.bookingCode}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-space font-bold text-white border border-slate-700 shadow-md transition-all"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Lihat E-Tiket / Invoice</span>
                </Link>

                <button
                  onClick={() => handleSendWa(successBooking)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-space font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Kirim Invoice ke WA Tamu</span>
                </button>

                <button
                  onClick={() => setSuccessBooking(null)}
                  className="text-xs font-space text-slate-400 hover:text-white px-2 py-1"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Split Section: Input Form (Left) & Real-time Live Ticket Preview (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form Input Deal WA (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-5 border-b border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-outfit font-black text-xl text-white">
                  Form Input Hasil Deal WhatsApp
                </h2>
                <p className="font-work text-xs text-slate-400">
                  Data wajib: Nama, No WhatsApp, Jumlah Orang, Total Harga Deal, & DP yang dibayarkan.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-5 font-work text-xs">
              
              {/* Row 1: Nama & No HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                    Nama Pemesan / Tamu <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Aditya"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white placeholder-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                    No WhatsApp Tamu <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08123456789"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white placeholder-slate-600 font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Paket Wisata, Pax, & Jeep */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                    Pilihan Paket Wisata
                  </label>
                  <select
                    value={packageName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPackageName(val);
                      if (val.includes('Short')) setTotalAmount(400000 * jeepCount);
                      else if (val.includes('Medium')) setTotalAmount(500000 * jeepCount);
                      else if (val.includes('Long')) setTotalAmount(600000 * jeepCount);
                      else if (val.includes('Sunrise')) setTotalAmount(550000 * jeepCount);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white transition-colors"
                  >
                    <option value="Paket Short (Rute Dasar - 1.5 Jam)">Paket Short (Rp 400.000 / unit)</option>
                    <option value="Paket Medium (Best Seller - 2.5 Jam)">Paket Medium - Best Seller (Rp 500.000 / unit)</option>
                    <option value="Paket Long (Full Adventure - 3.5 Jam)">Paket Long (Rp 600.000 / unit)</option>
                    <option value="Paket Sunrise (Magical Dawn - 04:30)">Paket Sunrise (Rp 550.000 / unit)</option>
                    <option value="Paket Custom Gathering">Paket Custom Corporate Gathering</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                      Jml Orang
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={paxCount}
                      onChange={(e) => setPaxCount(Number(e.target.value))}
                      className="w-full px-3 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white font-mono text-center"
                    />
                  </div>
                  <div>
                    <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                      Jml Jeep
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={jeepCount}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setJeepCount(val);
                        if (packageName.includes('Short')) setTotalAmount(400000 * val);
                        else if (packageName.includes('Medium')) setTotalAmount(500000 * val);
                        else if (packageName.includes('Long')) setTotalAmount(600000 * val);
                        else if (packageName.includes('Sunrise')) setTotalAmount(550000 * val);
                      }}
                      className="w-full px-3 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Tanggal & Jam Tur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                    Tanggal Tur
                  </label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                    Jam Kumpul di Basecamp
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 WIB"
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white"
                  />
                </div>
              </div>

              {/* Row 4: Deal Amount & DP (Key Section) */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-space font-bold text-amber-400 block mb-1.5 uppercase tracking-wide">
                      Total Harga Deal di WA (Rp) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="500000"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:border-amber-500 text-white font-mono font-black text-base"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="font-space font-bold text-emerald-400 uppercase tracking-wide">
                        DP yang Sudah Masuk (Rp) <span className="text-red-400">*</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => applyDpPreset(30)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-space font-bold text-slate-300"
                        >
                          30%
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDpPreset(50)}
                          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-space font-bold text-slate-300"
                        >
                          50%
                        </button>
                        <button
                          type="button"
                          onClick={() => applyDpPreset(100)}
                          className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-[10px] font-space font-bold"
                        >
                          Lunas
                        </button>
                      </div>
                    </div>
                    <input
                      type="number"
                      required
                      placeholder="150000"
                      value={dpAmount}
                      onChange={(e) => setDpAmount(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:outline-none focus:border-amber-500 text-emerald-400 font-mono font-black text-base"
                    />
                  </div>
                </div>

                {/* Sisa Pelunasan Banner */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="font-space font-bold text-xs text-slate-400 uppercase">
                    Sisa Pelunasan di Lokasi:
                  </span>
                  <span className={`font-mono font-black text-lg ${numRemaining === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {numRemaining === 0 ? 'LUNAS (Rp 0)' : `Rp ${numRemaining.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>

              {/* Row 5: Payment Method & Driver Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                    Metode Pembayaran DP
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white"
                  >
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="Transfer Mandiri">Transfer Mandiri</option>
                    <option value="Transfer BRI">Transfer BRI</option>
                    <option value="QRIS Online">QRIS Online</option>
                    <option value="Tunai di Basecamp">Tunai di Basecamp</option>
                  </select>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                    Driver & Unit (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Mas Agus (AB 1928 MJ)"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="amber-gradient-btn w-full py-4 rounded-2xl font-space font-black text-sm text-slate-950 shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-98 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-slate-950" />
                  <span>{submitting ? 'MEMPROSES APPROVAL...' : '✓ APPROVE & TERBITKAN TIKET RESMI'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: LIVE REAL-TIME TICKET PREVIEW (5 cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="flex items-center justify-between text-xs font-space font-bold text-slate-400">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>LIVE PREVIEW E-TIKET & INVOICE</span>
              </span>
              <span className="text-[10px] text-amber-400/80 uppercase">Update Otomatis</span>
            </div>

            {/* Boarding Pass Preview Card */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
              {/* Top Bar */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-outfit font-black text-sm text-white block">
                      MERAPI JEEP 4X4
                    </span>
                    <span className="font-space text-[9px] text-amber-400 uppercase tracking-widest">
                      OFFICIAL ADVENTURE PASS
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-space text-slate-400 uppercase block">KODE TIKET</span>
                  <span className="font-mono font-bold text-xs text-amber-400">MJA-2026-PREVIEW</span>
                </div>
              </div>

              {/* Perforated Divider Simulation */}
              <div className="relative py-2 bg-slate-950/40">
                <div className="border-b border-dashed border-slate-700 w-full" />
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070b14]" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#070b14]" />
              </div>

              {/* Content Preview */}
              <div className="p-6 space-y-5 text-xs font-work">
                
                {/* Guest & Trip Info */}
                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-space text-slate-400 block uppercase">Nama Tamu</span>
                    <span className="font-outfit font-bold text-sm text-white block truncate">
                      {customerName || 'Nama Tamu Anda'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {customerPhone || '08xxxxxxxxxx'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-space text-slate-400 block uppercase">Jadwal Tur</span>
                    <span className="font-outfit font-bold text-sm text-white block">
                      {tourDate}
                    </span>
                    <span className="font-space text-[11px] text-amber-400">
                      {tourTime}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-space text-slate-400 block uppercase">Pilihan Paket</span>
                    <span className="font-outfit font-bold text-xs text-amber-400 block">
                      {packageName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-space text-slate-400 block uppercase">Kapasitas</span>
                    <span className="font-bold text-white block">
                      {paxCount} Orang ({jeepCount} Jeep)
                    </span>
                  </div>
                </div>

                {/* Live Payment Breakdown */}
                <div className="space-y-2 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Total Deal:</span>
                    <span className="text-white font-bold">Rp {numTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>DP Masuk ({paymentMethod}):</span>
                    <span className="font-bold">- Rp {numDp.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-amber-400 font-bold border-t border-slate-800 pt-2 text-xs">
                    <span>Sisa di Basecamp:</span>
                    <span>{numRemaining === 0 ? 'LUNAS (Rp 0)' : `Rp ${numRemaining.toLocaleString('id-ID')}`}</span>
                  </div>
                </div>

                {/* Simulated QR Code for Boarding */}
                <div className="flex items-center gap-3.5 pt-2">
                  <div className="p-2 bg-white rounded-xl text-slate-950 shadow-md shrink-0">
                    <QrCode className="w-10 h-10" />
                  </div>
                  <div className="text-[11px] text-slate-400 leading-tight">
                    <span className="font-space font-bold text-white block mb-0.5">
                      TIKET RESMI SIAP DISERAHKAN
                    </span>
                    Tamu tinggal menunjukkan e-tiket ini saat tiba di Basecamp Kaliurang Barat.
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* Tabel Daftar Booking Terverifikasi */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-outfit font-black text-xl text-white">
                Daftar Booking Terverifikasi
              </h3>
              <p className="font-work text-xs text-slate-400">
                Semua data pemesanan yang telah deal dan di-approve oleh admin.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama, no hp, kode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:border-amber-500 text-white placeholder-slate-600"
                />
              </div>

              {/* Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-500"
              >
                <option value="">Semua Status</option>
                <option value="APPROVED">Approved</option>
                <option value="LUNAS">Lunas</option>
                <option value="DP_DITERIMA">DP Diterima</option>
              </select>

              <button
                onClick={fetchBookings}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Modern Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left font-work text-xs">
              <thead className="bg-slate-950 text-slate-400 font-space text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="p-4">Kode Booking & Waktu</th>
                  <th className="p-4">Data Tamu</th>
                  <th className="p-4">Paket Wisata</th>
                  <th className="p-4 text-right">Total Deal</th>
                  <th className="p-4 text-right">DP Masuk</th>
                  <th className="p-4 text-right">Sisa Lokasi</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Aksi Cepat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-slate-500">
                      {loading ? 'Memuat data booking...' : 'Belum ada data booking yang sesuai pencarian.'}
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-amber-400 block text-xs">
                          {b.bookingCode}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {b.tourDate} • {b.tourTime}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-white block text-sm">
                          {b.customerName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {b.customerPhone}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-200 block">
                          {b.packageName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {b.paxCount} Orang ({b.jeepCount} Jeep)
                        </span>
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-white">
                        Rp {b.totalAmount.toLocaleString('id-ID')}
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-emerald-400">
                        Rp {b.dpAmount.toLocaleString('id-ID')}
                      </td>

                      <td className="p-4 text-right font-mono font-bold text-amber-400">
                        {b.remainingAmount === 0 ? 'LUNAS' : `Rp ${b.remainingAmount.toLocaleString('id-ID')}`}
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-space font-bold uppercase ${
                          b.remainingAmount === 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${b.remainingAmount === 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span>{b.remainingAmount === 0 ? 'LUNAS' : 'DP DITERIMA'}</span>
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Invoice */}
                          <Link
                            href={`/invoice/${b.bookingCode}`}
                            target="_blank"
                            title="Buka e-Tiket / Invoice Resmi"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          >
                            <Eye className="w-4 h-4 text-amber-400" />
                          </Link>

                          {/* Send WhatsApp */}
                          <button
                            onClick={() => handleSendWa(b)}
                            title="Kirim Invoice ke WA Tamu"
                            className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors cursor-pointer"
                          >
                            <Phone className="w-4 h-4" />
                          </button>

                          {/* Mark Lunas */}
                          {b.remainingAmount > 0 && (
                            <button
                              onClick={() => handleMarkLunas(b.id)}
                              title="Tandai Sudah Lunas"
                              className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(b.id)}
                            title="Hapus Booking"
                            className="p-2 rounded-xl hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
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
