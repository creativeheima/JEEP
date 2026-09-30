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
  Compass,
  Bell,
  CheckSquare,
  X
} from 'lucide-react';
import { Booking } from '@/types/booking';
import { isClientAuthenticated, clearClientSession } from '@/lib/adminAuth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'manual'>('pending');

  // Approval Modal State (when admin clicks to approve a client's booking)
  const [approvingBooking, setApprovingBooking] = useState<Booking | null>(null);
  const [dealTotal, setDealTotal] = useState<number | string>(500000);
  const [dealDp, setDealDp] = useState<number | string>(150000);
  const [dealPaymentMethod, setDealPaymentMethod] = useState('Transfer BCA');
  const [dealDriver, setDealDriver] = useState('Mas Agus');
  const [dealJeepNumber, setDealJeepNumber] = useState('AB 1928 MJ');
  const [approvingLoading, setApprovingLoading] = useState(false);

  // Manual Input Form states
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
  const [submittingManual, setSubmittingManual] = useState(false);

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
      const res = await fetch(`/api/bookings?search=${encodeURIComponent(search)}`);
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
  }, [search, isAuthenticated]);

  // Filter bookings by status
  const pendingBookings = bookings.filter((b) => b.approvalStatus === 'PENDING');
  const approvedBookings = bookings.filter((b) => b.approvalStatus === 'APPROVED');

  // Open Approval Modal for a specific client booking
  const handleOpenApproveModal = (b: Booking) => {
    setApprovingBooking(b);
    setDealTotal(b.totalAmount || 500000);
    setDealDp(b.dpAmount || Math.round((b.totalAmount || 500000) * 0.3));
    setDealPaymentMethod(b.paymentMethod || 'Transfer BCA');
    setDealDriver(b.driverName && b.driverName !== 'Menunggu Penugasan Driver' ? b.driverName : 'Mas Agus');
    setDealJeepNumber(b.jeepNumber && b.jeepNumber !== '-' ? b.jeepNumber : 'AB 1928 MJ');
  };

  // Submit Approval for a client booking
  const handleConfirmApproval = async () => {
    if (!approvingBooking) return;
    setApprovingLoading(true);

    const tot = Number(dealTotal) || 0;
    const dp = Number(dealDp) || 0;
    const remaining = Math.max(0, tot - dp);

    try {
      const res = await fetch(`/api/bookings/${approvingBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: tot,
          dpAmount: dp,
          remainingAmount: remaining,
          paymentMethod: dealPaymentMethod,
          paymentStatus: remaining === 0 ? 'LUNAS' : (dp > 0 ? 'DP_DITERIMA' : 'MENUNGGU_PEMBAYARAN'),
          approvalStatus: 'APPROVED',
          driverName: dealDriver,
          jeepNumber: dealJeepNumber,
          approvedAt: new Date().toISOString(),
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessBooking(json.data);
        setApprovingBooking(null);
        fetchBookings();
        setActiveTab('approved');
      } else {
        alert('Gagal menyetujui booking: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setApprovingLoading(false);
    }
  };

  // Submit Manual Booking (if someone calls directly without web form)
  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Nama dan No WhatsApp wajib diisi!');
      return;
    }

    setSubmittingManual(true);
    const tot = Number(totalAmount) || 0;
    const dp = Number(dpAmount) || 0;
    const rem = Math.max(0, tot - dp);

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
          totalAmount: tot,
          dpAmount: dp,
          paymentMethod,
          driverName,
          jeepNumber,
          notes,
          approvalStatus: 'APPROVED',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessBooking(json.data);
        fetchBookings();
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        setActiveTab('approved');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingManual(false);
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
      `Buka e-Tiket & Invoice resmi Anda melalui tautan berikut:%0A${encodeURIComponent(invoiceUrl)}%0A%0A` +
      `Sampai jumpa di Basecamp Kaliurang! 🌋`;

    const wa = `https://wa.me/${b.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${text}`;
    window.open(wa, '_blank');
  };

  // Stats
  const totalRevenue = approvedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalDpCollected = approvedBookings.reduce((sum, b) => sum + b.dpAmount, 0);
  const totalRemaining = approvedBookings.reduce((sum, b) => sum + b.remainingAmount, 0);

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
      
      {/* Top Header */}
      <header className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
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
        
        {/* Title & Notification Banner if pending bookings exist */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-outfit font-black text-3xl sm:text-4xl text-white tracking-tight">
              Pusat Approval & Konfirmasi Booking
            </h1>
            <p className="font-work text-xs sm:text-sm text-slate-400 mt-1">
              Data yang diisi oleh client di website masuk ke sini. Admin tinggal mereview, menyepakati harga deal WA & DP, lalu klik <strong>Approve</strong>.
            </p>
          </div>

          {pendingBookings.length > 0 && (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-space font-bold animate-pulse">
              <Bell className="w-4 h-4" />
              <span>Ada {pendingBookings.length} booking dari client menunggu persetujuan Anda!</span>
            </div>
          )}
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-md">
            <span className="font-space text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Menunggu Approval
            </span>
            <div className="font-outfit font-black text-3xl text-white mt-1">
              {pendingBookings.length} <span className="text-sm font-normal text-slate-500">Permintaan</span>
            </div>
            <div className="text-[11px] font-work text-slate-400 mt-1">
              Inputan langsung dari website tamu
            </div>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-md">
            <span className="font-space text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Booking Ter-Approve
            </span>
            <div className="font-outfit font-black text-3xl text-emerald-400 mt-1">
              {approvedBookings.length} <span className="text-sm font-normal text-slate-500">Tiket Resmi</span>
            </div>
            <div className="text-[11px] font-work text-slate-400 mt-1">
              Sudah deal & diterbitkan tiket
            </div>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-md">
            <span className="font-space text-xs font-bold text-blue-400 uppercase tracking-wider block">
              DP Terkumpul
            </span>
            <div className="font-outfit font-black text-2xl text-white mt-1 font-mono">
              Rp {totalDpCollected.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-work text-slate-400 mt-1">
              Uang muka terverifikasi
            </div>
          </div>

          <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 shadow-md">
            <span className="font-space text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Sisa Pelunasan
            </span>
            <div className="font-outfit font-black text-2xl text-amber-400 mt-1 font-mono">
              Rp {totalRemaining.toLocaleString('id-ID')}
            </div>
            <div className="text-[11px] font-work text-slate-400 mt-1">
              Akan dilunasi saat tiba di Basecamp
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
                      Booking Berhasil Di-Approve & Tiket Resmi Diterbitkan!
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-space font-bold uppercase">
                      OFFICIAL TICKET ISSUED
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
                  <span>Buka E-Tiket / Invoice</span>
                </Link>

                <button
                  onClick={() => handleSendWa(successBooking)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-space font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Kirim Tiket ke WA Tamu</span>
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

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 self-start">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2.5 rounded-xl text-xs font-space font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Permintaan Booking Client</span>
            {pendingBookings.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'pending' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500 text-slate-950'
              }`}>
                {pendingBookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2.5 rounded-xl text-xs font-space font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'approved'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Booking Resmi Ter-Approve ({approvedBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-2.5 rounded-xl text-xs font-space font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Input Manual (Direct WA)</span>
          </button>
        </div>

        {/* TAB 1: PERMINTAAN BOOKING DARI CLIENT (MENUNGGU APPROVAL) */}
        {activeTab === 'pending' && (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-outfit font-black text-xl text-white flex items-center gap-2">
                  <span>Permintaan Masuk dari Client Website</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-space font-bold">
                    Menunggu Approval
                  </span>
                </h3>
                <p className="font-work text-xs text-slate-400 mt-1">
                  Client sudah mengisi data di website. Klik <strong>"Review & Approve Deal"</strong> untuk memasukkan harga kesepakatan WA dan menerbitkan invoice resminya.
                </p>
              </div>

              <button
                onClick={fetchBookings}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="font-outfit font-bold text-base text-slate-300">
                  Tidak ada permintaan booking yang pending saat ini.
                </p>
                <p className="font-work text-xs text-slate-500">
                  Semua reservasi client dari website telah disetujui atau belum ada inputan baru.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 shadow-lg space-y-4 relative group transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400 text-xs bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                          {b.bookingCode}
                        </span>
                        <span className="text-[10px] font-space text-slate-500">
                          {new Date(b.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        PENDING APPROVAL
                      </span>
                    </div>

                    {/* Customer Info (Already filled by client!) */}
                    <div className="space-y-1.5 pt-1">
                      <h4 className="font-outfit font-black text-lg text-white">
                        {b.customerName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-amber-500" />
                        <span>{b.customerPhone}</span>
                      </div>
                    </div>

                    {/* Trip details requested */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] font-space text-slate-500 uppercase block">Paket Pilihan</span>
                        <span className="font-bold text-slate-200">{b.packageName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-space text-slate-500 uppercase block">Tanggal Tur</span>
                        <span className="font-bold text-slate-200">{b.tourDate} ({b.tourTime})</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] font-space text-slate-500 uppercase block">Peserta</span>
                        <span className="font-bold text-slate-200">{b.paxCount} Orang</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] font-space text-slate-500 uppercase block">Estimasi Jeep</span>
                        <span className="font-bold text-amber-400">{b.jeepCount} Unit</span>
                      </div>
                    </div>

                    {/* Notes if any */}
                    {b.notes && (
                      <div className="p-2.5 rounded-lg bg-slate-900 text-slate-400 text-[11px] italic">
                        "{b.notes}"
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenApproveModal(b)}
                        className="amber-gradient-btn flex-1 py-3 rounded-xl font-space font-bold text-xs text-slate-950 flex items-center justify-center gap-2 shadow-md hover:brightness-110 cursor-pointer"
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>REVIEW & APPROVE DEAL INI</span>
                      </button>

                      <a
                        href={`https://wa.me/${b.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=Halo%20Kak%20${encodeURIComponent(b.customerName)},%20kami%20dari%20Merapi%20Jeep%20Adventure%20melihat%20reservasi%20Kakak%20untuk%20${encodeURIComponent(b.packageName)}%20di%20tanggal%20${b.tourDate}.%20Boleh%20kami%20bantu%20konfirmasi%20kesepakatan%20harga%20dan%20DP?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors"
                        title="Chat WA Pelanggan"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-3 rounded-xl bg-slate-900 hover:bg-red-500/20 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
                        title="Tolak / Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DAFTAR BOOKING RESMI TER-APPROVE */}
        {activeTab === 'approved' && (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-outfit font-black text-xl text-white">
                  Daftar Booking Resmi Terverifikasi
                </h3>
                <p className="font-work text-xs text-slate-400">
                  Data yang sudah di-approve oleh admin. E-tiket dan invoice resmi siap dibagikan atau dicetak.
                </p>
              </div>

              {/* Search */}
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
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left font-work text-xs">
                <thead className="bg-slate-950 text-slate-400 font-space text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-4">Kode Tiket</th>
                    <th className="p-4">Nama Tamu & HP</th>
                    <th className="p-4">Paket & Waktu</th>
                    <th className="p-4 text-right">Total Deal</th>
                    <th className="p-4 text-right">DP Masuk</th>
                    <th className="p-4 text-right">Sisa Lokasi</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {approvedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-500">
                        {loading ? 'Memuat data booking...' : 'Belum ada data booking ter-approve.'}
                      </td>
                    </tr>
                  ) : (
                    approvedBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-amber-400 block text-xs">
                            {b.bookingCode}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {b.tourDate}
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
                            {b.paxCount} Org ({b.jeepCount} Jeep) • {b.tourTime}
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
        )}

        {/* TAB 3: INPUT MANUAL (DIRECT CHAT WA) */}
        {activeTab === 'manual' && (
          <div className="bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <div>
              <h3 className="font-outfit font-black text-xl text-white">
                Input Manual Booking Hasil Chat WA Langsung
              </h3>
              <p className="font-work text-xs text-slate-400 mt-1">
                Gunakan menu ini jika pelanggan mengontak WhatsApp secara langsung tanpa melalui form di website.
              </p>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 font-work text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1">Nama Tamu *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1">No WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1">Paket Wisata</label>
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Paket Short">Paket Short</option>
                    <option value="Paket Medium">Paket Medium</option>
                    <option value="Paket Long">Paket Long</option>
                    <option value="Paket Sunrise">Paket Sunrise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1">Jam</label>
                  <input
                    type="text"
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-amber-400 block mb-1">Total Deal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-emerald-400 block mb-1">DP Masuk (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={dpAmount}
                    onChange={(e) => setDpAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingManual}
                className="amber-gradient-btn px-6 py-3 rounded-xl font-space font-bold text-xs text-slate-950 cursor-pointer"
              >
                {submittingManual ? 'Menyimpan...' : '✓ SIMPAN & TERBITKAN TIKET'}
              </button>
            </form>
          </div>
        )}

      </main>

      {/* APPROVAL MODAL (When admin clicks "Review & Approve Deal Ini" on a client booking) */}
      {approvingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            
            <button
              onClick={() => setApprovingBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-space font-bold uppercase mb-2">
                <span>VERIFIKASI & SETUJUI BOOKING</span>
              </div>
              <h3 className="font-outfit font-black text-2xl text-white">
                Approve Booking & Terbitkan Invoice
              </h3>
              <p className="font-work text-xs text-slate-400 mt-1">
                Data client sudah terisi otomatis. Masukkan nominal harga deal yang telah disepakati di WhatsApp dan DP yang diterima.
              </p>
            </div>

            {/* Client Pre-filled summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-work">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Kode Booking:</span>
                <span className="font-mono font-bold text-amber-400">{approvingBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Nama Tamu:</span>
                <span className="font-bold text-white">{approvingBooking.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Nomor WhatsApp:</span>
                <span className="font-mono text-slate-300">{approvingBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Paket Wisata:</span>
                <span className="font-bold text-amber-400">{approvingBooking.packageName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Jadwal & Peserta:</span>
                <span className="text-white">{approvingBooking.tourDate} ({approvingBooking.tourTime}) • {approvingBooking.paxCount} Org ({approvingBooking.jeepCount} Jeep)</span>
              </div>
              {approvingBooking.notes && (
                <div className="pt-1">
                  <span className="text-slate-400 block mb-0.5">Catatan Tamu:</span>
                  <span className="text-slate-300 italic">"{approvingBooking.notes}"</span>
                </div>
              )}
            </div>

            {/* Admin Input Deal Fields */}
            <div className="space-y-4 font-work text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-amber-400 block mb-1 uppercase">
                    Total Harga Deal di WA (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={dealTotal}
                    onChange={(e) => setDealTotal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-space font-bold text-emerald-400 block mb-1 uppercase">
                    DP yang Sudah Ditransfer (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={dealDp}
                    onChange={(e) => setDealDp(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Sisa auto-calculate */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center font-mono">
                <span className="text-slate-400 text-xs font-space font-semibold uppercase">
                  Sisa Pelunasan di Basecamp:
                </span>
                <span className="font-black text-amber-400 text-sm">
                  {Math.max(0, Number(dealTotal) - Number(dealDp)) === 0
                    ? 'LUNAS (Rp 0)'
                    : `Rp ${(Math.max(0, Number(dealTotal) - Number(dealDp))).toLocaleString('id-ID')}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1 uppercase">
                    Metode Pembayaran DP
                  </label>
                  <select
                    value={dealPaymentMethod}
                    onChange={(e) => setDealPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="Transfer Mandiri">Transfer Mandiri</option>
                    <option value="Transfer BRI">Transfer BRI</option>
                    <option value="QRIS Online">QRIS Online</option>
                    <option value="Tunai di Basecamp">Tunai di Basecamp</option>
                  </select>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-300 block mb-1 uppercase">
                    Driver & No. Polisi
                  </label>
                  <input
                    type="text"
                    value={dealDriver}
                    onChange={(e) => setDealDriver(e.target.value)}
                    placeholder="Mas Agus (AB 1928 MJ)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setApprovingBooking(null)}
                className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-space font-bold"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={approvingLoading}
                onClick={handleConfirmApproval}
                className="amber-gradient-btn flex-1 py-3 rounded-xl font-space font-black text-xs text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{approvingLoading ? 'Memproses...' : '✓ SETUJUI & TERBITKAN TIKET'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
