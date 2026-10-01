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
  Trash2,
  Phone,
  Eye,
  RefreshCw,
  Home,
  LogOut,
  Bell,
  CheckSquare,
  X,
  Camera,
  Instagram,
  Sliders,
  ExternalLink,
  Menu,
  LayoutDashboard,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  CheckCheck,
  Archive,
  Settings,
  ChevronDown
} from 'lucide-react';
import { Booking } from '@/types/booking';
import { GalleryItem, GalleryCategory } from '@/types/gallery';
import { HeroSlide, MAX_HERO_SLIDES } from '@/types/heroSlide';
import { isClientAuthenticated, clearClientSession } from '@/lib/adminAuth';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Settings dropdown in sidebar
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Navigation active tab: 'dashboard' is the default overview
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'approved' | 'settled' | 'manual' | 'gallery' | 'hero'>('dashboard');

  // Hero Slideshow States (Max 5 photos)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroLoading, setHeroLoading] = useState(false);
  const [newSlideImage, setNewSlideImage] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [slideSubmitting, setSlideSubmitting] = useState(false);

  // Gallery Management States
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [galleryFormType, setGalleryFormType] = useState<'PHOTO' | 'INSTAGRAM_VIDEO'>('PHOTO');
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategory>('JEEP ACTION');
  const [galleryMediaUrl, setGalleryMediaUrl] = useState('');
  const [galleryInstagramUrl, setGalleryInstagramUrl] = useState('');
  const [galleryThumbnailUrl, setGalleryThumbnailUrl] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [gallerySubmitting, setGallerySubmitting] = useState(false);

  // Approval Modal State
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

  // Filter bookings by status & payment status
  const pendingBookings = bookings.filter((b) => b.approvalStatus === 'PENDING');
  const approvedBookings = bookings.filter((b) => b.approvalStatus === 'APPROVED');

  // 1. Jadwal Tur Aktif (Belum Lunas / Masih ada sisa yang harus dibayar di Basecamp)
  const activeUnpaidBookings = approvedBookings.filter(
    (b) => b.remainingAmount > 0 && b.paymentStatus !== 'LUNAS'
  );

  // 2. Riwayat Booking Selesai & LUNAS 100% (Dipisahkan agar tabel aktif tetap bersih!)
  const settledLunasBookings = approvedBookings.filter(
    (b) => b.remainingAmount === 0 || b.paymentStatus === 'LUNAS'
  );

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
    const rem = Math.max(0, tot - dp);
    const payStatus = rem === 0 ? 'LUNAS' : 'DP_PAID';

    try {
      const res = await fetch(`/api/bookings/${approvingBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalStatus: 'APPROVED',
          paymentStatus: payStatus,
          totalAmount: tot,
          dpAmount: dp,
          remainingAmount: rem,
          paymentMethod: dealPaymentMethod,
          driverName: dealDriver,
          jeepNumber: dealJeepNumber,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setSuccessBooking(json.data);
        setApprovingBooking(null);
        fetchBookings();
        // If lunas, direct to settled, else approved active
        if (rem === 0) {
          setActiveTab('settled');
        } else {
          setActiveTab('approved');
        }
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

  // Submit Manual Booking
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
        if (rem === 0) {
          setActiveTab('settled');
        } else {
          setActiveTab('approved');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Mark Lunas -> Pindah ke tabel Riwayat Lunas
  const handleMarkLunas = async (id: string, name: string) => {
    if (!confirm(`Tandai booking atas nama "${name}" sebagai LUNAS?\n\nBooking ini akan otomatis dipindahkan ke tabel Riwayat Lunas agar daftar jadwal aktif tetap bersih.`)) return;
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'LUNAS', remainingAmount: 0 }),
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
    if (!confirm('Apakah Anda yakin ingin menghapus data booking ini?')) return;
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

  // Gallery handlers
  const fetchGalleryItems = async () => {
    setGalleryLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setGalleryItems(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchGalleryItems();
    }
  }, [isAuthenticated]);

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle || !galleryMediaUrl) {
      alert('Judul dan URL foto/media wajib diisi!');
      return;
    }

    setGallerySubmitting(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: galleryFormType,
          title: galleryTitle,
          category: galleryCategory,
          mediaUrl: galleryMediaUrl,
          instagramUrl: galleryInstagramUrl || (galleryFormType === 'INSTAGRAM_VIDEO' ? galleryMediaUrl : undefined),
          thumbnailUrl: galleryThumbnailUrl || undefined,
          caption: galleryCaption || undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert(galleryFormType === 'PHOTO' ? 'Foto berhasil ditambahkan ke galeri!' : 'Video Instagram berhasil ditautkan ke galeri!');
        setGalleryTitle('');
        setGalleryMediaUrl('');
        setGalleryInstagramUrl('');
        setGalleryThumbnailUrl('');
        setGalleryCaption('');
        fetchGalleryItems();
      } else {
        alert('Gagal menyimpan: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setGallerySubmitting(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm('Hapus item galeri ini?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchGalleryItems();
      } else {
        alert('Gagal menghapus: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Hero Slideshow handlers
  const fetchHeroSlides = async () => {
    setHeroLoading(true);
    try {
      const res = await fetch('/api/hero-slides');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setHeroSlides(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHeroLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHeroSlides();
    }
  }, [isAuthenticated]);

  const handleAddHeroSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlideImage) {
      alert('URL / Path gambar wajib diisi!');
      return;
    }

    if (heroSlides.length >= MAX_HERO_SLIDES) {
      alert(`Maksimal hanya ${MAX_HERO_SLIDES} foto untuk slideshow beranda! Hapus salah satu foto terlebih dahulu.`);
      return;
    }

    setSlideSubmitting(true);
    try {
      const res = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: newSlideImage,
          title: newSlideTitle || 'Slide Foto Beranda',
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert('Foto slide berhasil ditambahkan ke beranda!');
        setNewSlideImage('');
        setNewSlideTitle('');
        fetchHeroSlides();
      } else {
        alert('Gagal: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSlideSubmitting(false);
    }
  };

  const handleDeleteHeroSlide = async (id: string) => {
    if (heroSlides.length <= 1) {
      alert('Minimal harus ada 1 foto untuk banner beranda!');
      return;
    }
    if (!confirm('Hapus foto ini dari slideshow beranda?')) return;

    try {
      const res = await fetch(`/api/hero-slides/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        fetchHeroSlides();
      } else {
        alert('Gagal menghapus: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // WhatsApp Sender
  const handleSendWa = (b: Booking) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const invoiceUrl = `${origin}/invoice/${b.bookingCode}`;

    const text =
      `Halo Kak *${b.customerName}*,%0A%0A` +
      `Reservasi Merapi Jeep Adventure Anda telah *DISETUJUI & TIKET RESMI DITERBITKAN*! 🌋🚙%0A%0A` +
      `📋 *Kode Tiket:* ${b.bookingCode}%0A` +
      `📅 *Jadwal Tur:* ${b.tourDate} (${b.tourTime})%0A` +
      `📦 *Paket:* ${b.packageName}%0A` +
      `👥 *Peserta:* ${b.paxCount} Orang (${b.jeepCount} Unit Jeep)%0A` +
      `👤 *Driver & Jeep:* ${b.driverName || 'Mas Agus'} (${b.jeepNumber || 'AB 1928 MJ'})%0A%0A` +
      `💰 *Total Kesepakatan:* Rp ${b.totalAmount.toLocaleString('id-ID')}%0A` +
      `✅ *DP Diterima:* Rp ${b.dpAmount.toLocaleString('id-ID')}%0A` +
      `⏳ *Sisa Pelunasan di Basecamp:* Rp ${b.remainingAmount.toLocaleString('id-ID')}%0A%0A` +
      `Buka e-Tiket & Invoice resmi Anda melalui tautan berikut:%0A${encodeURIComponent(invoiceUrl)}%0A%0A` +
      `Sampai jumpa di Basecamp Kaliurang! 🌋`;

    const wa = `https://wa.me/${b.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=${text}`;
    window.open(wa, '_blank');
  };

  // Stats
  const totalDpCollected = approvedBookings.reduce((sum, b) => sum + b.dpAmount, 0);
  const totalRemaining = approvedBookings.reduce((sum, b) => sum + b.remainingAmount, 0);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Sidebar operational menu items definition
  const operationalMenuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      sublabel: 'Ringkasan & Metrik',
      icon: LayoutDashboard,
    },
    {
      id: 'pending' as const,
      label: 'Booking Masuk',
      sublabel: 'Permintaan dari Web',
      icon: Clock,
      count: pendingBookings.length,
      badgeColor: pendingBookings.length > 0 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'approved' as const,
      label: 'Jadwal Aktif (DP)',
      sublabel: 'Perlu Pelunasan di Lokasi',
      icon: Ticket,
      count: activeUnpaidBookings.length,
      badgeColor: activeUnpaidBookings.length > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-600',
    },
    {
      id: 'settled' as const,
      label: 'Riwayat Selesai & Lunas',
      sublabel: 'Arsip Lunas 100%',
      icon: CheckCheck,
      count: settledLunasBookings.length,
      badgeColor: 'bg-emerald-100 text-emerald-800 font-bold',
    },
    {
      id: 'manual' as const,
      label: 'Input Booking Kasir',
      sublabel: 'Direct Chat WA / Offline',
      icon: PlusCircle,
    },
  ];

  const handleSelectTab = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab === 'gallery' || tab === 'hero') {
      setIsSettingsOpen(true);
    }
    setIsMobileSidebarOpen(false); // Close mobile drawer when clicked
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col lg:flex-row antialiased">
      
      {/* ============================================================== */}
      {/* MOBILE TOP NAVBAR (Visible only on screens < lg) */}
      {/* ============================================================== */}
      <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <Car className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <span className="font-outfit font-black text-sm text-slate-900 tracking-tight block leading-none">
                MERAPI JEEP
              </span>
              <span className="text-[10px] font-space font-bold text-amber-600">
                ADMIN PANEL
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingBookings.length > 0 && (
            <button
              onClick={() => handleSelectTab('pending')}
              className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-space font-bold flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
              <span>{pendingBookings.length}</span>
            </button>
          )}

          <Link
            href="/"
            target="_blank"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
            title="Buka Website"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MOBILE DRAWER BACKDROP */}
      {/* ============================================================== */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 transition-opacity"
        />
      )}

      {/* ============================================================== */}
      {/* SIDEBAR NAVIGATION (Desktop: Sticky, Mobile: Drawer) */}
      {/* ============================================================== */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col justify-between shadow-lg lg:shadow-xs transition-transform duration-300 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ height: '100vh' }}
      >
        {/* Top: Logo & System Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="font-outfit font-black text-base text-slate-900 tracking-tight leading-tight">
                  MERAPI JEEP
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-space text-slate-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Admin Basecamp Online</span>
                </div>
              </div>
            </Link>

            {/* Close Button on Mobile Drawer */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Middle: Menu Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-space font-bold uppercase tracking-wider text-slate-400">
            Menu Operasional
          </div>

          {operationalMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-space text-xs font-semibold transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-amber-600/30 text-slate-950' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <div className="truncate">
                    <span className="block truncate font-bold">{item.label}</span>
                    <span className={`block text-[10px] truncate ${isActive ? 'text-slate-900/80 font-medium' : 'text-slate-400'}`}>
                      {item.sublabel}
                    </span>
                  </div>
                </div>

                {/* Counter Badges */}
                {item.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] shrink-0 font-bold ${item.badgeColor}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Group Dropdown: Settingan Website */}
          <div className="pt-2">
            <div className="px-3 py-1.5 text-[11px] font-space font-bold uppercase tracking-wider text-slate-400">
              Pengaturan
            </div>

            {/* Dropdown Toggle Header */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-space text-xs font-semibold transition-all cursor-pointer text-left ${
                activeTab === 'gallery' || activeTab === 'hero'
                  ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg ${activeTab === 'gallery' || activeTab === 'hero' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                  <Settings className="w-4 h-4 shrink-0" />
                </div>
                <div className="truncate">
                  <span className="block truncate font-bold">Settingan Website</span>
                  <span className="block text-[10px] truncate text-slate-400">
                    Galeri & Slideshow
                  </span>
                </div>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${isSettingsOpen ? 'rotate-180 text-amber-700' : ''}`} />
            </button>

            {/* Dropdown Children (Galeri & Slideshow) */}
            {isSettingsOpen && (
              <div className="pl-3 pr-1 py-1 space-y-1 ml-5 border-l-2 border-slate-200 mt-1">
                {/* Submenu 1: Galeri & Video IG */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('gallery')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-space text-xs transition-all cursor-pointer text-left ${
                    activeTab === 'gallery'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Camera className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Galeri & Video IG</span>
                  </div>
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === 'gallery' ? 'bg-amber-600 text-slate-950' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {galleryItems.length}
                  </span>
                </button>

                {/* Submenu 2: Slideshow Beranda */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('hero')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-space text-xs transition-all cursor-pointer text-left ${
                    activeTab === 'hero'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Slideshow Beranda</span>
                  </div>
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === 'hero' ? 'bg-amber-600 text-slate-950' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {heroSlides.length}/{MAX_HERO_SLIDES}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="pt-4 px-3 py-1.5 text-[11px] font-space font-bold uppercase tracking-wider text-slate-400">
            Akses Publik
          </div>

          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-space text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Home className="w-4 h-4" />
              </div>
              <span>Lihat Website Beranda</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Bottom: Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center font-outfit font-black text-amber-800 text-sm">
                AD
              </div>
              <div className="leading-tight">
                <span className="font-outfit font-bold text-xs text-slate-900 block">
                  Admin Basecamp
                </span>
                <span className="text-[10px] font-space text-slate-500 block">
                  Super Admin • Aktif
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              title="Keluar dari Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================== */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Top Header Bar for Desktop: Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-space text-slate-500 mb-1">
              <span>Admin Panel</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-amber-600">
                {activeTab === 'dashboard' && 'Dashboard Utama'}
                {activeTab === 'pending' && 'Permintaan Masuk'}
                {activeTab === 'approved' && 'Jadwal Tur Aktif (DP)'}
                {activeTab === 'settled' && 'Riwayat Selesai & Lunas'}
                {activeTab === 'manual' && 'Input Booking Kasir'}
                {activeTab === 'gallery' && 'Kelola Galeri & IG'}
                {activeTab === 'hero' && 'Slideshow Beranda'}
              </span>
            </div>
            <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Ringkasan Operasional'}
              {activeTab === 'pending' && 'Permintaan Masuk dari Tamu Website'}
              {activeTab === 'approved' && 'Jadwal Tur Aktif (Menunggu Pelunasan)'}
              {activeTab === 'settled' && 'Riwayat & Arsip Booking Lunas (Selesai 100%)'}
              {activeTab === 'manual' && 'Input Manual Booking (Chat WA / Kasir)'}
              {activeTab === 'gallery' && 'Kelola Galeri & Video Reels Instagram'}
              {activeTab === 'hero' && 'Kelola Foto Slideshow Beranda'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={fetchBookings}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-space font-semibold text-slate-700 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : 'text-slate-500'}`} />
              <span>Segarkan Data</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-xs font-space font-bold text-slate-950 shadow-xs transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Web</span>
            </Link>
          </div>
        </div>

        {/* Success Banner After Approval (Global notification) */}
        {successBooking && (
          <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-outfit font-black text-base sm:text-lg text-emerald-950">
                      Booking Berhasil Disetujui & Tiket Resmi Diterbitkan!
                    </h3>
                  </div>
                  <p className="font-work text-xs text-emerald-800 mt-0.5">
                    Kode Tiket: <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-900">{successBooking.bookingCode}</span> atas nama <strong>{successBooking.customerName}</strong> ({successBooking.customerPhone}).
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/invoice/${successBooking.bookingCode}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-xs font-space font-bold text-slate-800 border border-slate-300 shadow-xs transition-all"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                  <span>Buka E-Tiket</span>
                </Link>

                <button
                  onClick={() => handleSendWa(successBooking)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-space font-bold shadow-xs transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Kirim Tiket ke WA</span>
                </button>

                <button
                  onClick={() => setSuccessBooking(null)}
                  className="text-xs font-space text-slate-500 hover:text-slate-800 px-2 py-1"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 0: DASHBOARD RINGKASAN UTAMA (4 Metric Cards appear ONLY here!) */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Notification alert if pending bookings exist */}
            {pendingBookings.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
                    <Bell className="w-5 h-5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-outfit font-black text-sm text-amber-950">
                      Ada {pendingBookings.length} Permintaan Booking Baru Menunggu Persetujuan!
                    </h4>
                    <p className="font-work text-xs text-amber-800">
                      Tamu telah mengirim reservasi dari website. Segera review dan terbitkan tiket resminya.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('pending')}
                  className="px-4 py-2 rounded-xl font-space font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>Review Booking</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* 4 Summary Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div
                onClick={() => setActiveTab('pending')}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-space text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    Booking Masuk
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 mt-2">
                  {pendingBookings.length}
                </div>
                <div className="text-[11px] font-work text-slate-500 mt-0.5">
                  Menunggu persetujuan deal
                </div>
              </div>

              <div
                onClick={() => setActiveTab('approved')}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-space text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    Jadwal Aktif (DP)
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                    <Ticket className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-outfit font-black text-2xl sm:text-3xl text-amber-600 mt-2">
                  {activeUnpaidBookings.length}
                </div>
                <div className="text-[11px] font-work text-slate-500 mt-0.5">
                  Perlu pelunasan di Basecamp
                </div>
              </div>

              <div
                onClick={() => setActiveTab('settled')}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-space text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Sudah Lunas
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                    <CheckCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-outfit font-black text-2xl sm:text-3xl text-emerald-600 mt-2">
                  {settledLunasBookings.length}
                </div>
                <div className="text-[11px] font-work text-slate-500 mt-0.5">
                  Booking lunas 100% (Selesai)
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-space text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    Sisa Pelunasan
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-outfit font-black text-lg sm:text-2xl text-blue-700 mt-2 font-mono truncate">
                  Rp {totalRemaining.toLocaleString('id-ID')}
                </div>
                <div className="text-[11px] font-work text-slate-500 mt-0.5">
                  Akan dilunasi di Basecamp
                </div>
              </div>
            </div>

            {/* Recent Confirmed Bookings Table Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-outfit font-black text-lg text-slate-900">
                    Jadwal Tur Aktif Terbaru
                  </h3>
                  <p className="font-work text-xs text-slate-500 mt-0.5">
                    Reservasi yang sedang berjalan dan menunggu hari-H.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('approved')}
                  className="text-xs font-space font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Jadwal Aktif ({activeUnpaidBookings.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeUnpaidBookings.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-work text-xs">
                  Tidak ada jadwal tur aktif yang menunggu pelunasan saat ini.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-work text-xs">
                    <thead className="bg-slate-50 text-slate-700 font-space text-[10px] uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">Kode</th>
                        <th className="p-3">Nama Tamu</th>
                        <th className="p-3">Paket & Tanggal</th>
                        <th className="p-3 text-right">Total Deal</th>
                        <th className="p-3 text-right">DP Masuk</th>
                        <th className="p-3 text-right">Sisa Lokasi</th>
                        <th className="p-3 text-center">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeUnpaidBookings.slice(0, 5).map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-700">{b.bookingCode}</td>
                          <td className="p-3 font-bold text-slate-900">{b.customerName}</td>
                          <td className="p-3 text-slate-600">{b.packageName} • {b.tourDate}</td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">Rp {b.totalAmount.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-700">Rp {b.dpAmount.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono font-bold text-amber-700">Rp {b.remainingAmount.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Link
                                href={`/invoice/${b.bookingCode}`}
                                target="_blank"
                                className="p-1 rounded bg-slate-100 text-slate-700 hover:text-amber-600"
                                title="Buka E-Tiket"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                onClick={() => handleMarkLunas(b.id, b.customerName)}
                                className="p-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100"
                                title="Tandai Lunas"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: PERMINTAAN BOOKING DARI CLIENT (MENUNGGU APPROVAL) */}
        {/* ============================================================== */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-outfit font-black text-xl text-slate-900 flex flex-wrap items-center gap-2">
                  <span>Permintaan Masuk dari Tamu Website</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-space font-bold border border-amber-200">
                    {pendingBookings.length} Menunggu Konfirmasi
                  </span>
                </h3>
                <p className="font-work text-xs text-slate-500 mt-1">
                  Data yang diisi oleh client di website langsung muncul di sini. Klik tombol <strong>"Review & Approve Deal"</strong> untuk mengisi harga deal & menerbitkan tiket.
                </p>
              </div>

              <button
                onClick={fetchBookings}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
                title="Refresh Data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
              </button>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-70" />
                <p className="font-outfit font-bold text-base text-slate-800">
                  Semua permintaan booking telah disetujui!
                </p>
                <p className="font-work text-xs text-slate-400">
                  Tidak ada permintaan reservasi yang tertunda saat ini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-white border-2 border-amber-200/80 hover:border-amber-400 shadow-xs hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-700 text-xs bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                          {b.bookingCode}
                        </span>
                        <span className="text-[11px] font-space text-slate-400">
                          {new Date(b.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                        PENDING APPROVAL
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-1">
                      <h4 className="font-outfit font-black text-lg text-slate-900">
                        {b.customerName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{b.customerPhone}</span>
                      </div>
                    </div>

                    {/* Trip details requested */}
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div>
                        <span className="text-[10px] font-space text-slate-500 uppercase block">Paket Pilihan</span>
                        <span className="font-bold text-slate-800">{b.packageName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-space text-slate-500 uppercase block">Jadwal Tur</span>
                        <span className="font-bold text-slate-800">{b.tourDate} ({b.tourTime})</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] font-space text-slate-500 uppercase block">Peserta</span>
                        <span className="font-bold text-slate-800">{b.paxCount} Orang</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] font-space text-slate-500 uppercase block">Estimasi Jeep</span>
                        <span className="font-bold text-amber-700">{b.jeepCount} Unit</span>
                      </div>
                    </div>

                    {b.notes && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] italic">
                        "{b.notes}"
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleOpenApproveModal(b)}
                        className="flex-1 py-2.5 px-3 rounded-xl font-space font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckSquare className="w-4 h-4 shrink-0" />
                        <span>REVIEW & APPROVE</span>
                      </button>

                      <a
                        href={`https://wa.me/${b.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=Halo%20Kak%20${encodeURIComponent(b.customerName)},%20kami%20dari%20Merapi%20Jeep%20Adventure%20melihat%20reservasi%20Kakak%20untuk%20${encodeURIComponent(b.packageName)}%20di%20tanggal%20${b.tourDate}.%20Boleh%20kami%20bantu%20konfirmasi%20kesepakatan%20harga%20dan%20DP?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                        title="Chat WA Pelanggan"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
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

        {/* ============================================================== */}
        {/* TAB 2: JADWAL TUR AKTIF (HANYA YANG BELUM LUNAS / DP) */}
        {/* ============================================================== */}
        {activeTab === 'approved' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-outfit font-black text-xl text-slate-900 flex items-center gap-2">
                  <span>Jadwal Tur Aktif (Menunggu Pelunasan)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-space font-bold border border-amber-200">
                    {activeUnpaidBookings.length} Tur
                  </span>
                </h3>
                <p className="font-work text-xs text-slate-500 mt-0.5">
                  Daftar tur yang telah di-approve dan masih menunggu pelunasan sisa di Basecamp. Setelah ditandai lunas, data otomatis dipindahkan ke tabel <strong>Riwayat Lunas</strong> agar halaman ini tetap bersih.
                </p>
              </div>

              {/* Sub-tab navigation pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setActiveTab('approved')}
                  className="px-3 py-1.5 rounded-lg text-xs font-space font-bold bg-white text-slate-900 shadow-xs cursor-pointer"
                >
                  Jadwal Aktif ({activeUnpaidBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('settled')}
                  className="px-3 py-1.5 rounded-lg text-xs font-space font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Riwayat Lunas ({settledLunasBookings.length})
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari nama tamu, no hp, kode booking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-amber-500 text-slate-800 placeholder-slate-400 w-full sm:w-72"
              />
            </div>

            {/* Table: ONLY Unpaid/Active Bookings */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left font-work text-xs">
                <thead className="bg-slate-50 text-slate-700 font-space text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Kode Tiket</th>
                    <th className="p-3.5">Nama Tamu & HP</th>
                    <th className="p-3.5">Paket & Waktu</th>
                    <th className="p-3.5 text-right">Total Deal</th>
                    <th className="p-3.5 text-right">DP Masuk</th>
                    <th className="p-3.5 text-right">Sisa Pelunasan</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Tindakan Kasir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {activeUnpaidBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400 space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
                        <p className="font-bold text-slate-700 text-sm">
                          Tidak ada jadwal tur yang menunggu pelunasan!
                        </p>
                        <p className="text-xs text-slate-400">
                          Semua booking telah lunas dan tersimpan rapi di tab <strong>Riwayat Selesai & Lunas</strong>.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    activeUnpaidBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-amber-700 block text-xs">
                            {b.bookingCode}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {b.tourDate}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block text-sm">
                            {b.customerName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {b.customerPhone}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">
                            {b.packageName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {b.paxCount} Org ({b.jeepCount} Jeep) • {b.tourTime}
                          </span>
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          Rp {b.totalAmount.toLocaleString('id-ID')}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-emerald-700">
                          Rp {b.dpAmount.toLocaleString('id-ID')}
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-amber-700">
                          Rp {b.remainingAmount.toLocaleString('id-ID')}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-space font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                            <span>DP DITERIMA</span>
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Invoice */}
                            <Link
                              href={`/invoice/${b.bookingCode}`}
                              target="_blank"
                              title="Buka e-Tiket / Invoice Resmi"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-amber-600" />
                            </Link>

                            {/* Send WhatsApp */}
                            <button
                              onClick={() => handleSendWa(b)}
                              title="Kirim Invoice ke WA Tamu"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <Phone className="w-4 h-4" />
                            </button>

                            {/* Mark Lunas -> Pindah ke tabel Lunas */}
                            <button
                              onClick={() => handleMarkLunas(b.id, b.customerName)}
                              title="Tandai Sudah Lunas & Pindahkan ke Tabel Riwayat Lunas"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-space font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Pelunasan Selesai</span>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(b.id)}
                              title="Hapus Booking"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

        {/* ============================================================== */}
        {/* TAB 2.5: RIWAYAT BOOKING SELESAI & LUNAS 100% (TABEL TERPISAH) */}
        {/* ============================================================== */}
        {activeTab === 'settled' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-outfit font-black text-xl text-slate-900 flex items-center gap-2">
                  <span>Riwayat & Arsip Booking Lunas (Selesai 100%)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-space font-bold border border-emerald-200">
                    {settledLunasBookings.length} Lunas
                  </span>
                </h3>
                <p className="font-work text-xs text-slate-500 mt-0.5">
                  Daftar transaksi yang sudah diselesaikan dan lunas 100%. Data di sini tersimpan rapi sebagai arsip resmi.
                </p>
              </div>

              {/* Sub-tab navigation pills */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setActiveTab('approved')}
                  className="px-3 py-1.5 rounded-lg text-xs font-space font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Jadwal Aktif ({activeUnpaidBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('settled')}
                  className="px-3 py-1.5 rounded-lg text-xs font-space font-bold bg-white text-slate-900 shadow-xs cursor-pointer"
                >
                  Riwayat Lunas ({settledLunasBookings.length})
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Cari arsip lunas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:border-emerald-500 text-slate-800 placeholder-slate-400 w-full sm:w-72"
              />
            </div>

            {/* Table: ONLY Settled/Lunas Bookings */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left font-work text-xs">
                <thead className="bg-slate-50 text-slate-700 font-space text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Kode Tiket</th>
                    <th className="p-3.5">Nama Tamu & HP</th>
                    <th className="p-3.5">Paket Wisata</th>
                    <th className="p-3.5">Driver & Jeep</th>
                    <th className="p-3.5 text-right">Total Pembayaran</th>
                    <th className="p-3.5 text-center">Metode</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {settledLunasBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-10 text-center text-slate-400">
                        Belum ada riwayat booking yang berstatus lunas.
                      </td>
                    </tr>
                  ) : (
                    settledLunasBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-slate-900 block text-xs">
                            {b.bookingCode}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {b.tourDate} ({b.tourTime})
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block text-sm">
                            {b.customerName}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {b.customerPhone}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800 block">
                            {b.packageName}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {b.paxCount} Org ({b.jeepCount} Jeep)
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="text-slate-800 font-medium block">
                            {b.driverName || 'Mas Agus'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {b.jeepNumber || 'AB 1928 MJ'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right font-mono font-bold text-emerald-700 text-sm">
                          Rp {b.totalAmount.toLocaleString('id-ID')}
                        </td>

                        <td className="p-3.5 text-center font-space text-[11px] text-slate-600">
                          {b.paymentMethod || 'Transfer BCA'}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-space font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>LUNAS 100%</span>
                          </span>
                        </td>

                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View Invoice */}
                            <Link
                              href={`/invoice/${b.bookingCode}`}
                              target="_blank"
                              title="Buka e-Tiket / Invoice Resmi"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-emerald-600" />
                            </Link>

                            {/* Send WhatsApp */}
                            <button
                              onClick={() => handleSendWa(b)}
                              title="Kirim Konfirmasi Lunas ke WA Tamu"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                            >
                              <Phone className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(b.id)}
                              title="Hapus Arsip"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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

        {/* ============================================================== */}
        {/* TAB 3: INPUT MANUAL (DIRECT CHAT WA / KASIR) */}
        {/* ============================================================== */}
        {activeTab === 'manual' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="font-outfit font-black text-xl text-slate-900">
                Input Manual Booking Hasil Chat WA Langsung
              </h3>
              <p className="font-work text-xs text-slate-500 mt-0.5">
                Gunakan menu ini jika pelanggan mengontak WhatsApp secara langsung tanpa melalui form di website.
              </p>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 font-work text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Nama Tamu *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Bpk. Budi Santoso"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">No WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="08123456789"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Paket Wisata</label>
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                  >
                    <option value="Paket Short">Paket Short</option>
                    <option value="Paket Medium (Best Seller)">Paket Medium (Best Seller)</option>
                    <option value="Paket Long">Paket Long</option>
                    <option value="Paket Sunrise">Paket Sunrise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Jam</label>
                  <input
                    type="text"
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-amber-700 block mb-1">Total Deal (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-emerald-700 block mb-1">DP Masuk (Rp) *</label>
                  <input
                    type="number"
                    required
                    value={dpAmount}
                    onChange={(e) => setDpAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-emerald-700 font-mono font-bold focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-6 py-2.5 rounded-xl font-space font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs cursor-pointer transition-colors"
                >
                  {submittingManual ? 'Menyimpan...' : '✓ SIMPAN & TERBITKAN TIKET'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: KELOLA GALERI & VIDEO INSTAGRAM */}
        {/* ============================================================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-space font-bold text-xs text-pink-600 uppercase tracking-wider">
                      MEDIA & INSTAGRAM
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 text-[10px] font-space font-bold">
                      LIVE DI HOMEPAGE
                    </span>
                  </div>
                  <h3 className="font-outfit font-black text-xl text-slate-900">
                    Kelola Galeri & Video Instagram
                  </h3>
                  <p className="font-work text-xs text-slate-500 mt-0.5">
                    Tambahkan foto dokumentasi terbaru atau tautkan video reels Instagram agar tampil di beranda.
                  </p>
                </div>

                {/* Form Type Toggle */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryFormType('PHOTO');
                      setGalleryCategory('JEEP ACTION');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-space font-bold transition-all cursor-pointer ${
                      galleryFormType === 'PHOTO'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>+ Tambah Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGalleryFormType('INSTAGRAM_VIDEO');
                      setGalleryCategory('VIDEO REELS');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-space font-bold transition-all cursor-pointer ${
                      galleryFormType === 'INSTAGRAM_VIDEO'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>+ Video IG Reels</span>
                  </button>
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleAddGalleryItem} className="space-y-4 text-xs font-work">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-space font-bold text-slate-700 block mb-1">
                      {galleryFormType === 'PHOTO' ? 'Judul Foto *' : 'Judul Video Reels *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={galleryTitle}
                      onChange={(e) => setGalleryTitle(e.target.value)}
                      placeholder="Contoh: Rombongan Sunrise Bunker Kaliadem"
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-space font-bold text-slate-700 block mb-1">Kategori Tampilan</label>
                    <select
                      value={galleryCategory}
                      onChange={(e) => setGalleryCategory(e.target.value as GalleryCategory)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                    >
                      <option value="JEEP ACTION">JEEP ACTION</option>
                      <option value="DESTINASI">DESTINASI</option>
                      <option value="WISATAWAN">WISATAWAN</option>
                      <option value="VIDEO REELS">VIDEO REELS</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-space font-bold text-slate-700 block mb-1">
                      URL Gambar / Thumbnail *
                    </label>
                    <input
                      type="text"
                      required
                      value={galleryMediaUrl}
                      onChange={(e) => setGalleryMediaUrl(e.target.value)}
                      placeholder="/images/foto.png atau https://..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:border-amber-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-space font-bold text-slate-700 block mb-1">
                      Tautan Instagram Post / Reels (Opsional)
                    </label>
                    <input
                      type="url"
                      value={galleryInstagramUrl}
                      onChange={(e) => setGalleryInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/reel/..."
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={gallerySubmitting}
                    className="px-5 py-2.5 rounded-xl font-space font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-xs transition-colors"
                  >
                    {gallerySubmitting ? 'Menyimpan...' : '+ Tambahkan ke Galeri'}
                  </button>
                </div>
              </form>
            </div>

            {/* Gallery Grid List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
              <h4 className="font-outfit font-black text-lg text-slate-900">
                Item Galeri Aktif ({galleryItems.length})
              </h4>

              {galleryLoading ? (
                <div className="py-8 text-center text-slate-400 font-work text-xs">
                  Memuat item galeri...
                </div>
              ) : galleryItems.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-work text-xs">
                  Belum ada item galeri. Tambahkan lewat formulir di atas.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryItems.map((item) => {
                    const isVideo = item.type === 'INSTAGRAM_VIDEO';
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all"
                      >
                        <div className="relative h-36 bg-slate-100 overflow-hidden">
                          <img
                            src={item.thumbnailUrl || item.mediaUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2">
                            {isVideo ? (
                              <span className="flex items-center gap-1 bg-purple-600 text-white font-space font-bold text-[9px] px-2 py-0.5 rounded shadow-xs">
                                <Instagram className="w-3 h-3" />
                                REELS
                              </span>
                            ) : (
                              <span className="bg-white/90 text-slate-800 font-space font-bold text-[9px] px-2 py-0.5 rounded shadow-xs">
                                {item.category}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                          <div>
                            <h5 className="font-outfit font-bold text-slate-900 text-xs line-clamp-1">
                              {item.title}
                            </h5>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <a
                              href={item.instagramUrl || item.mediaUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-space font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                            >
                              <span>Lihat</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              onClick={() => handleDeleteGalleryItem(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Hapus Media"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: KELOLA SLIDESHOW BANNER BERANDA (MAKSIMAL 5 FOTO) */}
        {/* ============================================================== */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-space font-bold text-xs text-amber-600 uppercase tracking-wider">
                      SLIDESHOW LATAR BERANDA
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-space font-black uppercase border ${
                      heroSlides.length >= MAX_HERO_SLIDES
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      KUOTA: {heroSlides.length} / {MAX_HERO_SLIDES} FOTO
                    </span>
                  </div>
                  <h3 className="font-outfit font-black text-xl text-slate-900">
                    Kelola Foto Slideshow Beranda
                  </h3>
                  <p className="font-work text-xs text-slate-500 mt-0.5 max-w-2xl">
                    Foto-foto di bawah ini ditampilkan sebagai latar belakang utama beranda yang dapat <strong>bergeser (slide show) kanan dan kiri</strong> secara otomatis maupun manual dengan batas ketat <strong>maksimal 5 foto</strong>.
                  </p>
                </div>
              </div>

              {/* Form Tambah Slide (Hanya aktif jika belum 5 foto) */}
              {heroSlides.length >= MAX_HERO_SLIDES ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-outfit font-bold text-sm text-amber-900">
                      Kuota Maksimal 5 Foto Telah Penuh
                    </h5>
                    <p className="font-work text-xs text-amber-800 mt-0.5">
                      Slideshow beranda telah memiliki 5 foto aktif. Jika ingin mengganti foto, silakan hapus salah satu foto pada daftar di bawah terlebih dahulu.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddHeroSlide} className="space-y-4 text-xs font-work">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="font-space font-bold text-slate-700 block mb-1">
                        URL / Path Gambar Foto *
                      </label>
                      <input
                        type="text"
                        required
                        value={newSlideImage}
                        onChange={(e) => setNewSlideImage(e.target.value)}
                        placeholder="Contoh: /images/nama_foto.png atau link https://..."
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-mono focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-space font-bold text-slate-700 block mb-1">
                        Judul Slide (Opsional)
                      </label>
                      <input
                        type="text"
                        value={newSlideTitle}
                        onChange={(e) => setNewSlideTitle(e.target.value)}
                        placeholder="Contoh: Golden Sunrise Merapi Experience"
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={slideSubmitting}
                      className="px-5 py-2.5 rounded-xl font-space font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-xs transition-colors"
                    >
                      {slideSubmitting ? 'Menyimpan...' : `+ Tambahkan Foto ke Slideshow (${heroSlides.length}/5)`}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* List 5 Slides Saat Ini */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-outfit font-black text-lg text-slate-900">
                  Urutan Slide yang Aktif di Beranda ({heroSlides.length}/{MAX_HERO_SLIDES})
                </h4>
              </div>

              {heroLoading ? (
                <div className="py-8 text-center text-slate-400 font-work text-xs">
                  Memuat data slide...
                </div>
              ) : heroSlides.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-work text-xs">
                  Belum ada slide aktif.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {heroSlides.map((slide, idx) => (
                    <div
                      key={slide.id || idx}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md hover:border-amber-400 transition-all"
                    >
                      <div className="relative h-40 bg-slate-100 overflow-hidden">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="bg-white/95 text-slate-900 font-space font-black text-[10px] px-2 py-0.5 rounded shadow-xs border border-slate-200">
                            SLIDE #{idx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h5 className="font-outfit font-bold text-slate-900 text-xs line-clamp-1">
                            {slide.title || `Slide ${idx + 1}`}
                          </h5>
                          <span className="text-[10px] text-slate-400 block font-mono truncate mt-0.5">
                            {slide.imageUrl}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <a
                            href={slide.imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-space font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                          >
                            <span>Lihat</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={() => handleDeleteHeroSlide(slide.id)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Hapus Slide"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ============================================================== */}
      {/* APPROVAL MODAL (Light Clean Theme) */}
      {/* ============================================================== */}
      {approvingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-800">
            
            <button
              onClick={() => setApprovingBooking(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-space font-bold uppercase mb-1">
                <span>KONFIRMASI BOOKING DEAL</span>
              </div>
              <h3 className="font-outfit font-black text-2xl text-slate-900">
                Approve Booking & Terbitkan Invoice
              </h3>
              <p className="font-work text-xs text-slate-500 mt-0.5">
                Masukkan total harga kesepakatan WhatsApp dan DP yang sudah dibayarkan tamu.
              </p>
            </div>

            {/* Client info summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs font-work">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Kode Booking:</span>
                <span className="font-mono font-bold text-amber-700">{approvingBooking.bookingCode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Nama Tamu:</span>
                <span className="font-bold text-slate-900">{approvingBooking.customerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">No WhatsApp:</span>
                <span className="font-mono text-slate-700">{approvingBooking.customerPhone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Paket Wisata:</span>
                <span className="font-bold text-amber-700">{approvingBooking.packageName}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Jadwal & Peserta:</span>
                <span className="text-slate-800">{approvingBooking.tourDate} ({approvingBooking.tourTime}) • {approvingBooking.paxCount} Org ({approvingBooking.jeepCount} Jeep)</span>
              </div>
            </div>

            {/* Admin Deal Fields */}
            <div className="space-y-3.5 font-work text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">
                    Total Kesepakatan di WA (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={dealTotal}
                    onChange={(e) => setDealTotal(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-space font-bold text-emerald-700 block mb-1">
                    DP yang Ditransfer (Rp) *
                  </label>
                  <input
                    type="number"
                    required
                    value={dealDp}
                    onChange={(e) => setDealDp(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-emerald-700 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Sisa Auto-Calculate */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex justify-between items-center font-mono">
                <span className="text-amber-900 text-xs font-space font-semibold uppercase">
                  Sisa Pelunasan di Basecamp:
                </span>
                <span className="font-black text-amber-800 text-sm">
                  {Math.max(0, Number(dealTotal) - Number(dealDp)) === 0
                    ? 'LUNAS (Rp 0)'
                    : `Rp ${(Math.max(0, Number(dealTotal) - Number(dealDp))).toLocaleString('id-ID')}`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">
                    Metode Pembayaran DP
                  </label>
                  <select
                    value={dealPaymentMethod}
                    onChange={(e) => setDealPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                  >
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="Transfer Mandiri">Transfer Mandiri</option>
                    <option value="Transfer BRI">Transfer BRI</option>
                    <option value="QRIS Online">QRIS Online</option>
                    <option value="Tunai di Basecamp">Tunai di Basecamp</option>
                  </select>
                </div>

                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">
                    Driver & No. Polisi
                  </label>
                  <input
                    type="text"
                    value={dealDriver}
                    onChange={(e) => setDealDriver(e.target.value)}
                    placeholder="Mas Agus (AB 1928 MJ)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setApprovingBooking(null)}
                className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-space font-bold cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={approvingLoading}
                onClick={handleConfirmApproval}
                className="flex-1 py-2.5 rounded-xl font-space font-black text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
