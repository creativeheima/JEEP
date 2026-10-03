'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  PlusCircle,
  Plus,
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
  ChevronDown,
  Type,
  EyeOff,
  Edit3,
  Package,
  Check,
  MapPin,
  Layers,
  Info,
  Image as ImageIcon,
  Database,
  Users,
  Crown
} from 'lucide-react';
import { Booking } from '@/types/booking';
import { GalleryItem, GalleryCategory } from '@/types/gallery';
import { HeroSlide, MAX_HERO_SLIDES } from '@/types/heroSlide';
import { TourPackage } from '@/types/package';
import { isClientAuthenticated, clearClientSession, getClientUser } from '@/lib/adminAuth';
import MediaInput from '@/components/admin/MediaInput';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Settings dropdown in sidebar
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  
  // Navigation active tab: 'dashboard' is the default overview
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'approved' | 'settled' | 'gallery' | 'hero' | 'collage' | 'packages'>('dashboard');

  // Admin Packages CRUD states
  const [adminPackages, setAdminPackages] = useState<TourPackage[]>([]);

  // Collage Section (Intro) states
  const [collageHeadline, setCollageHeadline] = useState('');
  const [collageDescription, setCollageDescription] = useState('');
  const [collageImage1, setCollageImage1] = useState('');
  const [collageImage1Caption, setCollageImage1Caption] = useState('');
  const [collageImage2, setCollageImage2] = useState('');
  const [collageImage2Caption, setCollageImage2Caption] = useState('');
  const [collageSaving, setCollageSaving] = useState(false);

  // Hero Slideshow States (Max 5 photos)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroLoading, setHeroLoading] = useState(false);
  const [newSlideImage, setNewSlideImage] = useState('');
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideShowText, setNewSlideShowText] = useState(true);
  const [newSlideHeadline, setNewSlideHeadline] = useState('');
  const [newSlideSubheadline, setNewSlideSubheadline] = useState('');
  const [newSlideShowButton, setNewSlideShowButton] = useState(true);
  const [slideSubmitting, setSlideSubmitting] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [togglingSlideId, setTogglingSlideId] = useState<string | null>(null);

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

  // Manual Input Modal & Form states
  const [showManualModal, setShowManualModal] = useState(false);
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
    } else {
      setCurrentUser(getClientUser());
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

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packages');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAdminPackages(json.data);
      }
    } catch (err) {
      console.error('Error fetching packages:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      fetchPackages();
    }
  }, [search, isAuthenticated]);

  // Filter bookings by status & payment status
  const pendingBookings = bookings.filter((b) => b.approvalStatus === 'PENDING');
  const filteredPendingBookings = pendingBookings.filter((b) => {
    if (!pendingSearch.trim()) return true;
    const q = pendingSearch.toLowerCase().trim();
    return (
      (b.bookingCode && b.bookingCode.toLowerCase().includes(q)) ||
      (b.customerName && b.customerName.toLowerCase().includes(q)) ||
      (b.customerPhone && b.customerPhone.toLowerCase().includes(q)) ||
      (b.packageName && b.packageName.toLowerCase().includes(q))
    );
  });
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
        setShowManualModal(false);
        fetchBookings();
        setCustomerName('');
        setCustomerPhone('');
        setNotes('');
        if (rem === 0) {
          setActiveTab('settled');
        } else {
          setActiveTab('approved');
        }
      } else {
        alert('Gagal membuat booking: ' + (json.error || 'Terjadi kesalahan sistem'));
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
      alert('Judul dan foto/video wajib diisi (upload, link Drive, atau link URL)!');
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
        alert(galleryFormType === 'PHOTO' ? 'Foto berhasil ditambahkan ke galeri!' : 'Video berhasil ditambahkan ke galeri!');
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
          showText: newSlideShowText,
          headline: newSlideHeadline,
          subheadline: newSlideSubheadline,
          showButton: newSlideShowButton,
        }),
      });

      const json = await res.json();
      if (json.success) {
        alert('Foto slide berhasil ditambahkan ke beranda!');
        setNewSlideImage('');
        setNewSlideTitle('');
        setNewSlideShowText(true);
        setNewSlideHeadline('');
        setNewSlideSubheadline('');
        setNewSlideShowButton(true);
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

  const handleToggleSlideText = async (slide: HeroSlide) => {
    const nextStatus = slide.showText === false ? true : false;
    setTogglingSlideId(slide.id);
    try {
      // Optimistic update
      setHeroSlides((prev) =>
        prev.map((s) => (s.id === slide.id ? { ...s, showText: nextStatus } : s))
      );

      const res = await fetch(`/api/hero-slides/${slide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showText: nextStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        alert('Gagal mengubah pengaturan font: ' + (json.error || ''));
        fetchHeroSlides();
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala jaringan saat memperbarui status font.');
      fetchHeroSlides();
    } finally {
      setTogglingSlideId(null);
    }
  };

  const handleSaveEditSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    setEditSubmitting(true);
    try {
      const res = await fetch(`/api/hero-slides/${editingSlide.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: editingSlide.imageUrl,
          title: editingSlide.title,
          showText: editingSlide.showText !== false,
          headline: editingSlide.headline || '',
          subheadline: editingSlide.subheadline || '',
          showButton: editingSlide.showButton !== false,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEditingSlide(null);
        fetchHeroSlides();
      } else {
        alert('Gagal menyimpan perubahan slide: ' + (json.error || ''));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setEditSubmitting(false);
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
                activeTab === 'gallery' || activeTab === 'hero' || activeTab === 'collage' || activeTab === 'packages'
                  ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200/80 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-1.5 rounded-lg ${activeTab === 'gallery' || activeTab === 'hero' || activeTab === 'collage' || activeTab === 'packages' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
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

                {/* Submenu 3: Konten Intro (Collage) */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('collage')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-space text-xs transition-all cursor-pointer text-left ${
                    activeTab === 'collage'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Type className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Konten Intro</span>
                  </div>
                </button>

                {/* Submenu 4: Paket Wisata */}
                <button
                  type="button"
                  onClick={() => handleSelectTab('packages')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-space text-xs transition-all cursor-pointer text-left ${
                    activeTab === 'packages'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Package className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Paket Wisata</span>
                  </div>
                  <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === 'packages' ? 'bg-amber-600 text-slate-950' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {adminPackages.length}
                  </span>
                </button>
              </div>
            )}

          </div>

          {/* Shortcut to Superuser Portal (Hanya tampil jika login sebagai Superuser) */}
          {currentUser?.role === 'SUPERUSER' && (
            <div className="pt-3 px-1">
              <Link
                href="/superuser"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-space text-xs font-bold shadow-md shadow-amber-500/10 transition-all border border-amber-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Buka Portal Superuser</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          )}

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
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center font-outfit font-black text-sm shrink-0 ${
                currentUser?.role === 'SUPERUSER'
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                {(currentUser?.username || 'AD').slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-tight truncate">
                <span className="font-outfit font-bold text-xs text-slate-900 block truncate">
                  {currentUser?.name || currentUser?.username || 'Admin Basecamp'}
                </span>
                <span className="text-[10px] font-space text-slate-500 block truncate">
                  {currentUser?.role === 'SUPERUSER' ? '👑 Superuser Master' : '🛡️ Staf Admin'} • Aktif
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
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
                {activeTab === 'gallery' && 'Kelola Galeri & IG'}
                {activeTab === 'hero' && 'Slideshow Beranda'}
                {activeTab === 'collage' && 'Konten Intro (Beranda)'}
                {activeTab === 'packages' && 'Paket Wisata'}
              </span>
            </div>
            <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Ringkasan Operasional'}
              {activeTab === 'pending' && 'Permintaan Masuk dari Tamu Website'}
              {activeTab === 'approved' && 'Jadwal Tur Aktif (Menunggu Pelunasan)'}
              {activeTab === 'settled' && 'Riwayat & Arsip Booking Lunas (Selesai 100%)'}
              {activeTab === 'gallery' && 'Kelola Galeri & Video Reels Instagram'}
              {activeTab === 'hero' && 'Kelola Foto Slideshow Beranda'}
              {activeTab === 'collage' && 'Kelola Teks & Gambar Seksi Intro'}
              {activeTab === 'packages' && 'Kelola Paket Wisata'}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setShowManualModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-space font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span>+ Booking Manual</span>
            </button>

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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-space font-bold text-white shadow-xs transition-colors"
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
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-outfit font-black text-xl text-slate-900 flex flex-wrap items-center gap-2.5">
                  <span>Permintaan Masuk dari Tamu Website</span>
                  <span className="px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-space font-bold border border-amber-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {pendingBookings.length} Menunggu Konfirmasi
                  </span>
                </h3>
                <p className="font-work text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  Data yang diisi oleh calon tamu langsung dari formulir website. Klik tombol <strong className="text-slate-700">"Review & Approve Deal"</strong> untuk menentukan harga kesepakatan final, nominal DP, dan menerbitkan tiket resmi.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowManualModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>+ Booking Manual</span>
                </button>

                <button
                  onClick={fetchBookings}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                  title="Segarkan Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Search Bar Kode Booking / Nama / HP */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/80 p-2.5 sm:p-3 rounded-xl border border-slate-200/80">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari kode tiket (cth: NJA-2026), nama tamu, atau no HP..."
                  value={pendingSearch}
                  onChange={(e) => setPendingSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-work"
                />
                {pendingSearch && (
                  <button
                    type="button"
                    onClick={() => setPendingSearch('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer font-bold"
                    title="Hapus pencarian"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-space text-slate-500 self-end sm:self-center">
                {pendingSearch ? (
                  <span>
                    Ditemukan <strong className="text-amber-600 font-bold">{filteredPendingBookings.length}</strong> dari {pendingBookings.length} data
                  </span>
                ) : (
                  <span>
                    Total: <strong className="text-slate-800 font-bold">{pendingBookings.length}</strong> permintaan
                  </span>
                )}
              </div>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="py-16 text-center text-slate-500 space-y-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <p className="font-outfit font-bold text-lg text-slate-800">
                    Semua Permintaan Booking Selesai Dikonfirmasi!
                  </p>
                  <p className="font-work text-xs text-slate-400 max-w-md mx-auto">
                    Tidak ada permintaan reservasi yang tertunda saat ini. Anda dapat mencatat pesanan tamu baru yang datang langsung atau via WhatsApp menggunakan tombol di bawah.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold text-xs shadow-xs transition-all cursor-pointer hover:shadow"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Input Booking Manual</span>
                  </button>
                </div>
              </div>
            ) : filteredPendingBookings.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Search className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-outfit font-bold text-base text-slate-800">
                    Tidak Ditemukan Hasil untuk "{pendingSearch}"
                  </p>
                  <p className="font-work text-xs text-slate-400">
                    Periksa kembali penulisan kode booking, nama tamu, atau nomor HP.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingSearch('')}
                  className="px-3 py-1.5 text-xs font-space font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredPendingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-xl bg-white border border-slate-200 hover:border-amber-400 shadow-xs hover:shadow transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Top Header Strip - Compact */}
                    <div className="px-3.5 py-2 bg-gradient-to-r from-amber-50/80 via-slate-50 to-white border-b border-slate-100 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono font-bold text-amber-800 text-[11px] bg-amber-100/90 px-2 py-0.5 rounded border border-amber-300/80 shrink-0">
                          {b.bookingCode}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-space text-slate-400 truncate">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{new Date(b.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-space font-bold uppercase bg-amber-100/90 text-amber-900 border border-amber-300 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Menunggu</span>
                      </span>
                    </div>

                    {/* Card Body - Compact & Clean */}
                    <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                      {/* Customer Info */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center font-outfit font-black text-amber-800 text-xs shrink-0">
                          {b.customerName ? b.customerName.charAt(0).toUpperCase() : 'T'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-outfit font-bold text-sm text-slate-900 truncate leading-tight">
                            {b.customerName}
                          </h4>
                          <a
                            href={`https://wa.me/${b.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-700 hover:text-emerald-800 mt-0.5"
                            title="Klik untuk chat WhatsApp"
                          >
                            <Phone className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{b.customerPhone}</span>
                          </a>
                        </div>
                      </div>

                      {/* Trip Details Grid - Compact 2x2 */}
                      <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-[11px]">
                        <div className="min-w-0">
                          <span className="text-[9px] font-space font-semibold uppercase tracking-wider text-slate-400 block leading-tight">
                            Paket
                          </span>
                          <span className="font-bold text-slate-800 block truncate" title={b.packageName}>
                            {b.packageName}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <span className="text-[9px] font-space font-semibold uppercase tracking-wider text-slate-400 block leading-tight">
                            Jadwal Tur
                          </span>
                          <span className="font-bold text-slate-800 block truncate">
                            {b.tourDate} <span className="text-amber-700 font-semibold">({b.tourTime})</span>
                          </span>
                        </div>

                        <div className="min-w-0 pt-1 border-t border-slate-200/60">
                          <span className="text-[9px] font-space font-semibold uppercase tracking-wider text-slate-400 block leading-tight">
                            Peserta
                          </span>
                          <span className="font-bold text-slate-800">
                            {b.paxCount} Orang
                          </span>
                        </div>

                        <div className="min-w-0 pt-1 border-t border-slate-200/60">
                          <span className="text-[9px] font-space font-semibold uppercase tracking-wider text-slate-400 block leading-tight">
                            Armada
                          </span>
                          <span className="font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded border border-amber-200 text-[10px] inline-block">
                            {b.jeepCount} Unit Jeep
                          </span>
                        </div>
                      </div>

                      {/* Notes from guest (if any) */}
                      {b.notes && (
                        <div className="p-1.5 rounded-lg bg-amber-50/40 border border-amber-200/50 text-slate-600 text-[10px] flex items-start gap-1">
                          <span className="text-amber-500 font-bold shrink-0 leading-none">“</span>
                          <p className="italic leading-tight text-slate-600 line-clamp-2">
                            {b.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons - Compact */}
                    <div className="px-3 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenApproveModal(b)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg font-space font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-1.5 shadow-xs hover:shadow transition-all cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                        <span>Review & Approve</span>
                      </button>

                      <a
                        href={`https://wa.me/${b.customerPhone.replace(/^0/, '62').replace(/[^0-9]/g, '')}?text=Halo%20Kak%20${encodeURIComponent(b.customerName)},%20kami%20dari%20Merapi%20Jeep%20Adventure%20melihat%20reservasi%20Kakak%20untuk%20${encodeURIComponent(b.packageName)}%20di%20tanggal%20${b.tourDate}.%20Boleh%20kami%20bantu%20konfirmasi%20kesepakatan%20harga%20dan%20DP?`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors shrink-0"
                        title="Chat WA Pelanggan"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-colors shrink-0 cursor-pointer"
                        title="Tolak / Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
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
                    <span>+ Video</span>
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
                    <MediaInput
                      key={galleryFormType}
                      label={galleryFormType === 'PHOTO' ? 'Foto' : 'Video'}
                      required
                      kind={galleryFormType === 'PHOTO' ? 'image' : 'video'}
                      folder="gallery"
                      value={galleryMediaUrl}
                      onChange={setGalleryMediaUrl}
                      onThumbnail={(t) => !galleryThumbnailUrl && setGalleryThumbnailUrl(t)}
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

                {galleryFormType === 'INSTAGRAM_VIDEO' && (
                  <div className="max-w-md">
                    <MediaInput
                      label="Cover / Thumbnail Video (opsional)"
                      kind="image"
                      folder="gallery"
                      compact
                      value={galleryThumbnailUrl}
                      onChange={setGalleryThumbnailUrl}
                    />
                  </div>
                )}

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
                      <MediaInput label="Foto Slide" required kind="image" folder="hero" value={newSlideImage} onChange={setNewSlideImage} />
                    </div>

                    <div>
                      <label className="font-space font-bold text-slate-700 block mb-1">
                        Label / Judul Slide (Opsional)
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

                  {/* Toggle Font / Teks Per Slide */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Type className="w-4 h-4 text-amber-600" />
                          <span className="font-space font-bold text-slate-800 text-xs">
                            Pengaturan Font & Teks Beranda di Slide ini
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-work mt-1 max-w-xl">
                          {newSlideShowText
                            ? 'Teks judul & subjudul website akan ditampilkan. Matikan jika gambar banner sudah memiliki font/teks desain sendiri agar tidak saling bertumpuk.'
                            : 'Font & teks beranda dinonaktifkan untuk slide ini. Gambar banner custom akan tampil bersih dan jernih tanpa tertutup tulisan.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className={`text-[11px] font-space font-bold px-2 py-0.5 rounded ${
                          newSlideShowText ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {newSlideShowText ? 'Font: AKTIF' : 'Font: MATI'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNewSlideShowText(!newSlideShowText)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            newSlideShowText ? 'bg-amber-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              newSlideShowText ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Jika Font ON: Bolehkan kustomisasi teks khusus untuk slide ini */}
                    {newSlideShowText && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                        <div>
                          <label className="font-space font-semibold text-slate-600 text-[11px] block mb-1">
                            Judul Utama Custom (Opsional)
                          </label>
                          <input
                            type="text"
                            value={newSlideHeadline}
                            onChange={(e) => setNewSlideHeadline(e.target.value)}
                            placeholder="Kosongkan jika ingin memakai judul standar"
                            className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:border-amber-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-space font-semibold text-slate-600 text-[11px] block mb-1">
                            Subjudul / Deskripsi Custom (Opsional)
                          </label>
                          <input
                            type="text"
                            value={newSlideSubheadline}
                            onChange={(e) => setNewSlideSubheadline(e.target.value)}
                            placeholder="Kosongkan jika ingin memakai deskripsi standar"
                            className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:border-amber-500 outline-none"
                          />
                        </div>
                      </div>
                    )}
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-outfit font-black text-lg text-slate-900">
                    Urutan Slide yang Aktif di Beranda ({heroSlides.length}/{MAX_HERO_SLIDES})
                  </h4>
                  <p className="font-work text-xs text-slate-500 mt-0.5">
                    Klik tombol <strong>&ldquo;Matikan / Hidupkan Font&rdquo;</strong> untuk mengatur apakah teks beranda ditampilkan pada masing-masing slide secara instan.
                  </p>
                </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {heroSlides.map((slide, idx) => (
                    <div
                      key={slide.id || idx}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md hover:border-amber-400 transition-all"
                    >
                      {/* Image Preview & Badge */}
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="bg-slate-950/85 text-white font-space font-black text-[10px] px-2 py-0.5 rounded shadow-xs">
                            #{idx + 1}
                          </span>
                          <span className={`font-space font-bold text-[9px] px-2 py-0.5 rounded shadow-xs ${
                            slide.showText !== false
                              ? 'bg-emerald-600 text-white'
                              : 'bg-violet-700 text-white'
                          }`}>
                            {slide.showText !== false ? 'FONT AKTIF' : 'FONT MATI'}
                          </span>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h5 className="font-outfit font-bold text-slate-900 text-xs line-clamp-1">
                            {slide.title || `Slide ${idx + 1}`}
                          </h5>
                          <span className="text-[10px] text-slate-400 block font-mono truncate">
                            {slide.imageUrl}
                          </span>

                          {/* Font status pill */}
                          <div className={`p-2 rounded-lg text-[10px] font-work border ${
                            slide.showText !== false
                              ? 'bg-emerald-50/70 text-emerald-800 border-emerald-200/80'
                              : 'bg-violet-50/70 text-violet-800 border-violet-200/80'
                          }`}>
                            {slide.showText !== false ? (
                              <div className="flex items-center gap-1.5">
                                <Type className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>Teks Beranda: <strong>Muncul di slide ini</strong></span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <EyeOff className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                                <span>Banner Custom: <strong>Font dinonaktifkan</strong></span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick 1-Click Toggle Button for Font ON/OFF */}
                        <div className="pt-2 border-t border-slate-100 space-y-2">
                          <button
                            type="button"
                            onClick={() => handleToggleSlideText(slide)}
                            disabled={togglingSlideId === slide.id}
                            className={`w-full py-1.5 px-2 rounded-lg font-space font-bold text-[10px] cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                              slide.showText !== false
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-xs'
                            }`}
                          >
                            {togglingSlideId === slide.id ? (
                              <span>Menyimpan...</span>
                            ) : slide.showText !== false ? (
                              <>
                                <EyeOff className="w-3 h-3 text-slate-500" />
                                <span>Matikan Font di Slide Ini</span>
                              </>
                            ) : (
                              <>
                                <Type className="w-3 h-3 text-slate-950" />
                                <span>Hidupkan Font di Slide Ini</span>
                              </>
                            )}
                          </button>

                          {/* Action Links: Edit, View, Delete */}
                          <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingSlide(slide)}
                              className="font-space font-semibold text-slate-600 hover:text-amber-600 flex items-center gap-1 cursor-pointer"
                              title="Edit Pengaturan Slide"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            <a
                              href={slide.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-space font-semibold text-slate-600 hover:text-amber-600 flex items-center gap-1"
                            >
                              <span>Lihat</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeleteHeroSlide(slide.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Hapus Slide"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


      {/* ============================================================== */}
      {/* MODAL INPUT BOOKING MANUAL (KASIR / WA DIRECT) */}
      {/* ============================================================== */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-800 max-h-[92vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-space font-bold uppercase mb-1">
                <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
                <span>PENCATATAN MANUAL KASIR</span>
              </div>
              <h3 className="font-outfit font-black text-2xl text-slate-900">
                Input Booking Manual (Offline / WA Direct)
              </h3>
              <p className="font-work text-xs text-slate-500 mt-0.5">
                Gunakan formulir ini jika pelanggan menghubungi langsung via WhatsApp atau datang langsung ke basecamp.
              </p>
            </div>

            <form onSubmit={handleCreateManualBooking} className="space-y-4 font-work text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Nama Tamu / Rombongan *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Bpk. Budi Santoso & Keluarga"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">No WhatsApp Tamu *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Paket Wisata</label>
                  <select
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                  >
                    {(adminPackages.length > 0 ? adminPackages : [{id:'s1',title:'Paket Short'},{id:'m1',title:'Paket Medium (Best Seller)'},{id:'l1',title:'Paket Long'},{id:'sr1',title:'Paket Sunrise'}]).map(p => (
                      <option key={p.id} value={p.title}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Jumlah Peserta (Pax)</label>
                  <input
                    type="number"
                    min={1}
                    value={paxCount}
                    onChange={(e) => setPaxCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Jumlah Armada Jeep</label>
                  <input
                    type="number"
                    min={1}
                    value={jeepCount}
                    onChange={(e) => setJeepCount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Tanggal Tur *</label>
                  <input
                    type="date"
                    required
                    value={tourDate}
                    onChange={(e) => setTourDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Jam Keberangkatan</label>
                  <input
                    type="text"
                    value={tourTime}
                    onChange={(e) => setTourTime(e.target.value)}
                    placeholder="Contoh: 09:00 WIB"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3">
                <span className="font-space font-bold text-xs uppercase tracking-wider text-amber-900 block">
                  Biaya Kesepakatan & Pembayaran
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-space font-bold text-slate-700 block mb-1">
                      Total Deal Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-space font-bold text-emerald-700 block mb-1">
                      DP Masuk / Dibayar (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={dpAmount}
                      onChange={(e) => setDpAmount(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-emerald-700 font-mono font-bold focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <span className="text-slate-600 font-medium">Sisa Pelunasan di Basecamp:</span>
                  <span className="font-mono font-bold text-sm text-red-600">
                    Rp {Math.max(0, (Number(totalAmount) || 0) - (Number(dpAmount) || 0)).toLocaleString('id-ID')}
                  </span>
                </div>

                {Number(dpAmount) >= Number(totalAmount) && Number(totalAmount) > 0 ? (
                  <div className="p-2.5 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-[11px] font-space font-bold flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4 text-emerald-700" />
                    <span>Lunas 100% — Data otomatis akan langsung masuk ke tabel Riwayat Lunas.</span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] font-space font-bold flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-amber-700" />
                    <span>DP Masuk — Data akan masuk ke Jadwal Tur Aktif untuk ditagih pelunasan di lokasi.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Metode Bayar DP</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                  >
                    <option value="Transfer BCA">Transfer BCA</option>
                    <option value="Transfer Mandiri">Transfer Mandiri</option>
                    <option value="Transfer BRI">Transfer BRI</option>
                    <option value="QRIS">QRIS</option>
                    <option value="Tunai / Cash">Tunai / Cash di Basecamp</option>
                  </select>
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Driver Ditugaskan</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Nama Driver"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="font-space font-bold text-slate-700 block mb-1">Nomor Plat Jeep</label>
                  <input
                    type="text"
                    value={jeepNumber}
                    onChange={(e) => setJeepNumber(e.target.value)}
                    placeholder="Contoh: AB 1234 MJ"
                    className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Tamu minta dijemput di Kaliurang, bawa kamera..."
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-5 py-2.5 rounded-xl font-space font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingManual}
                  className="px-6 py-2.5 rounded-xl font-space font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer transition-all hover:shadow"
                >
                  {submittingManual ? 'Menyimpan...' : '✓ SIMPAN & TERBITKAN TIKET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

      {/* ============================================================== */}
      {/* MODAL EDIT SLIDE BERANDA & PENGATURAN FONT */}
      {/* ============================================================== */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-800">
            <button
              type="button"
              onClick={() => setEditingSlide(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-space font-bold uppercase mb-1">
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>PENGATURAN SLIDE #{editingSlide.order}</span>
              </div>
              <h3 className="font-outfit font-black text-xl text-slate-900">
                Edit Slide & Pengaturan Font
              </h3>
              <p className="font-work text-xs text-slate-500 mt-0.5">
                Sesuaikan gambar dan pilih apakah teks/font beranda ingin dihidupkan atau dimatikan untuk slide ini.
              </p>
            </div>

            <form onSubmit={handleSaveEditSlide} className="space-y-4 text-xs font-work">
              <div>
                <MediaInput
                  label="Foto Slide"
                  required
                  kind="image"
                  folder="hero"
                  value={editingSlide.imageUrl}
                  onChange={(url) => setEditingSlide({ ...editingSlide, imageUrl: url })}
                />
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1">
                  Label / Judul Slide
                </label>
                <input
                  type="text"
                  value={editingSlide.title}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  placeholder="Contoh: Golden Sunrise Merapi Experience"
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-amber-500 outline-none"
                />
              </div>

              {/* Toggle Font / Teks */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label className="font-space font-bold text-slate-800 text-xs flex items-center gap-1.5 cursor-pointer">
                      <Type className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tampilkan Font & Teks di Slide ini</span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-work mt-0.5">
                      {editingSlide.showText !== false
                        ? 'Font & teks beranda aktif.'
                        : 'Font dimatikan. Gambar banner custom tampil bersih tanpa tertutup teks.'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingSlide({
                        ...editingSlide,
                        showText: editingSlide.showText === false ? true : false,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      editingSlide.showText !== false ? 'bg-amber-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        editingSlide.showText !== false ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {editingSlide.showText !== false && (
                  <div className="space-y-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="font-space font-semibold text-slate-600 text-[11px] block mb-1">
                        Judul Utama Custom (Opsional)
                      </label>
                      <input
                        type="text"
                        value={editingSlide.headline || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, headline: e.target.value })}
                        placeholder="Kosongkan jika pakai judul standar"
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="font-space font-semibold text-slate-600 text-[11px] block mb-1">
                        Subjudul / Deskripsi Custom (Opsional)
                      </label>
                      <input
                        type="text"
                        value={editingSlide.subheadline || ''}
                        onChange={(e) => setEditingSlide({ ...editingSlide, subheadline: e.target.value })}
                        placeholder="Kosongkan jika pakai deskripsi standar"
                        className="w-full p-2 rounded-lg bg-white border border-slate-200 text-slate-800 text-xs focus:border-amber-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Gambar Kecil */}
              {editingSlide.imageUrl && (
                <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={editingSlide.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="text-white font-space font-bold text-xs bg-black/60 px-3 py-1 rounded-full">
                      Preview Gambar
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSlide(null)}
                  className="px-5 py-2.5 rounded-xl font-space font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-6 py-2.5 rounded-xl font-space font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs cursor-pointer transition-all hover:shadow"
                >
                  {editSubmitting ? 'Menyimpan...' : '✓ SIMPAN PERUBAHAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

        {/* ============================================================== */}
        {/* TAB 6: KELOLA KONTEN INTRO (COLLAGE SECTION) */}
        {/* ============================================================== */}
        {activeTab === 'collage' && (
          <CollageAdminPanel
            headline={collageHeadline}
            setHeadline={setCollageHeadline}
            description={collageDescription}
            setDescription={setCollageDescription}
            image1={collageImage1}
            setImage1={setCollageImage1}
            image1Caption={collageImage1Caption}
            setImage1Caption={setCollageImage1Caption}
            image2={collageImage2}
            setImage2={setCollageImage2}
            image2Caption={collageImage2Caption}
            setImage2Caption={setCollageImage2Caption}
            saving={collageSaving}
            onLoad={(d) => {
              setCollageHeadline(d.headline);
              setCollageDescription(d.description);
              setCollageImage1(d.image1);
              setCollageImage1Caption(d.image1Caption);
              setCollageImage2(d.image2);
              setCollageImage2Caption(d.image2Caption);
            }}
            onSave={async () => {
              setCollageSaving(true);
              try {
                const res = await fetch('/api/collage', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    headline: collageHeadline,
                    description: collageDescription,
                    image1: collageImage1,
                    image1Caption: collageImage1Caption,
                    image2: collageImage2,
                    image2Caption: collageImage2Caption,
                  }),
                });
                const json = await res.json();
                if (json.success) alert('Konten intro berhasil disimpan!');
                else alert('Gagal menyimpan: ' + json.error);
              } catch { alert('Gagal menyimpan.'); }
              finally { setCollageSaving(false); }
            }}
          />
        )}

        {/* ============================================================== */}
        {/* TAB 7: KELOLA PAKET WISATA */}
        {/* ============================================================== */}
        {activeTab === 'packages' && (
          <PackagesAdminPanel
            packages={adminPackages}
            onRefresh={fetchPackages}
          />
        )}

      </main>

    </div>
  );
}



/* ─── Collage Admin Panel Component ─────────────────────────────── */

interface CollageAdminPanelProps {
  headline: string;
  setHeadline: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  image1: string;
  setImage1: (v: string) => void;
  image1Caption: string;
  setImage1Caption: (v: string) => void;
  image2: string;
  setImage2: (v: string) => void;
  image2Caption: string;
  setImage2Caption: (v: string) => void;
  saving: boolean;
  onLoad: (d: { headline: string; description: string; image1: string; image1Caption: string; image2: string; image2Caption: string }) => void;
  onSave: () => Promise<void>;
}

function CollageAdminPanel({
  headline, setHeadline,
  description, setDescription,
  image1, setImage1,
  image1Caption, setImage1Caption,
  image2, setImage2,
  image2Caption, setImage2Caption,
  saving, onLoad, onSave,
}: CollageAdminPanelProps) {
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    if (loaded) return;
    fetch('/api/collage')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          onLoad(res.data);
          setLoaded(true);
        }
      })
      .catch(() => {});
  }, [loaded, onLoad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !description.trim() || !image1.trim()) {
      alert('Judul, deskripsi, dan foto utama wajib diisi!');
      return;
    }
    await onSave();
  };

  return (
    <div className="space-y-6">
      {/* Main Grid: Left Editor & Right Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Form Controls (7 cols) */}
        <div className="xl:col-span-7 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Card 1: Text Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Type className="w-3.5 h-3.5 text-amber-600" />
                </div>
                <div>
                  <span className="font-space font-black text-xs text-slate-900 uppercase tracking-wider">
                    1. Teks Narasi Intro
                  </span>
                  <p className="text-[10px] text-slate-400 font-work mt-0.5">
                    Judul & paragraf sambutan yang tampil di beranda
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-5">
              {/* Headline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-space font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Judul Utama (Headline)
                    <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    headline.length > 50 ? 'text-amber-700 bg-amber-50' : 'text-slate-400'
                  }`}>
                    {headline.length} karakter
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 font-outfit font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white focus:border-amber-300 transition-all placeholder:font-normal placeholder:text-slate-400"
                  placeholder="Contoh: Petualangan Menembus Batas di Kaki Gunung Merapi"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-space font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    Deskripsi / Paragraf Sambutan
                    <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    description.length > 200 ? 'text-amber-700 bg-amber-50' : 'text-slate-400'
                  }`}>
                    {description.length} karakter
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 font-work text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white focus:border-amber-300 transition-all resize-none leading-relaxed placeholder:text-slate-400"
                  placeholder="Tuliskan pengalaman atau ringkasan tur Jeep Merapi yang menggugah selera petualangan tamu..."
                />
              </div>
              </div>
            </div>

            {/* Card 2: Photo Collage Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-space font-black text-xs text-slate-900 uppercase tracking-wider">
                      2. Foto Kolase
                    </span>
                    <p className="text-[10px] text-slate-400 font-work mt-0.5">
                      Maksimal 2 foto untuk kolase beranda
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-space font-bold px-2.5 py-1 rounded-full border ${
                  image2 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {image2 ? '2 Foto Aktif' : '1 Foto Aktif'}
                </span>
              </div>

              <div className="p-6 space-y-5">
              {/* Photos 2-Col Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Photo 1: Main */}
                <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-b from-amber-50/30 to-white overflow-hidden">
                  {/* Photo Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-amber-50 border-b border-amber-100">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-space font-bold text-[10px] uppercase">
                      <span>①</span>
                      <span>Foto Utama (Wajib)</span>
                    </span>
                    <span className="text-[10px] font-space text-amber-700 font-bold">Latar Besar</span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Image Preview Box */}
                    <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                      {image1 ? (
                        <img
                          src={image1}
                          alt="Preview Foto 1"
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = '/images/img_1_53_jeep_cruising_through_volcanic_off-road_track_mount_merapi.png'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                          <span className="font-space text-xs">Belum ada foto</span>
                        </div>
                      )}
                    </div>

                    {/* Input URL */}
                    <div className="space-y-1.5">
                      <MediaInput label="Foto Utama" required kind="image" folder="collage" compact value={image1} onChange={setImage1} />
                    </div>

                    {/* Input Caption */}
                    <div className="space-y-1.5">
                      <label className="block font-space font-bold text-[10px] text-slate-600 uppercase tracking-wider">
                        Caption / Keterangan Foto
                      </label>
                      <input
                        type="text"
                        value={image1Caption}
                        onChange={e => setImage1Caption(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-work text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                        placeholder="Lereng Selatan Gunung Merapi"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo 2: Secondary / Overlay */}
                <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-b from-slate-50/50 to-white overflow-hidden">
                  {/* Photo Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-700 text-white font-space font-bold text-[10px] uppercase">
                      <span>②</span>
                      <span>Foto Aksen (Opsional)</span>
                    </span>
                    <span className="text-[10px] font-space text-slate-500 font-bold">Kartu Tumpuk</span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Image Preview Box */}
                    <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                      {image2 ? (
                        <img
                          src={image2}
                          alt="Preview Foto 2"
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display='none'; }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                          <ImageIcon className="w-8 h-8 opacity-40" />
                          <span className="font-space text-xs">Foto kedua kosong</span>
                        </div>
                      )}
                    </div>

                    {/* Input URL */}
                    <div className="space-y-1.5">
                      <MediaInput label="Foto Kedua (opsional)" kind="image" folder="collage" compact value={image2} onChange={setImage2} />
                    </div>

                    {/* Input Caption */}
                    <div className="space-y-1.5">
                      <label className="block font-space font-bold text-[10px] text-slate-600 uppercase tracking-wider">
                        Caption / Keterangan Foto
                      </label>
                      <input
                        type="text"
                        value={image2Caption}
                        onChange={e => setImage2Caption(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-work text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
                        placeholder="Momen Seru Penumpang"
                      />
                    </div>

                    {image2 && (
                      <button
                        type="button"
                        onClick={() => { setImage2(''); setImage2Caption(''); }}
                        className="flex items-center gap-1.5 text-[11px] font-space font-bold text-red-500 hover:text-red-600 transition-colors pt-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Hapus Foto Kedua</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Tips */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs font-work text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Tips Kolase:</strong> Foto pertama tampil dominan di latar belakang. Foto kedua tampil sebagai kartu aksen melayang di sudut kolase — biarkan kosong untuk tampilan satu foto saja.
                </div>
              </div>
              </div>
            </div>

            {/* Submit Button Bar */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-space font-bold text-sm bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{saving ? 'Menyimpan Konten...' : 'SIMPAN PERUBAHAN INTRO'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Realtime Live Preview (5 cols) */}
        <div className="xl:col-span-5 xl:sticky xl:top-6 space-y-4">
          {/* Live Preview Card */}
          <div className="bg-slate-950 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-space font-bold text-[11px] uppercase tracking-wider text-slate-300">
                    Live Visual Preview
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                Tampilan Beranda
              </span>
            </div>

            {/* Mockup Container */}
            <div className="p-5 space-y-5">
              {/* Badge & Headline Preview */}
              <div className="space-y-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-space font-bold text-[10px] tracking-wider uppercase">
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  MERAPI EXPEDITION
                </span>
                <h4 className={`font-outfit font-black text-xl leading-tight transition-all ${
                  headline ? 'text-white' : 'text-slate-600 italic'
                }`}>
                  {headline || 'Judul intro belum diisi...'}
                </h4>
                <p className={`text-xs font-work leading-relaxed line-clamp-4 transition-all ${
                  description ? 'text-slate-400' : 'text-slate-700 italic'
                }`}>
                  {description || 'Paragraf deskripsi intro akan tampil di sini...'}
                </p>
              </div>

              {/* Collage Image Mockup */}
              <div className="relative pb-8">
                {/* Image 1 */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-slate-700 shadow-lg bg-slate-800">
                  {image1 ? (
                    <img src={image1} alt="Mockup 1" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                      <ImageIcon className="w-10 h-10 opacity-30" />
                      <span className="text-xs font-space">Foto 1 Belum Dipilih</span>
                    </div>
                  )}
                  {image1Caption && (
                    <div className="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                      <span className="flex items-center gap-1 text-[10px] font-space text-slate-200 truncate">
                        <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                        {image1Caption}
                      </span>
                    </div>
                  )}
                </div>

                {/* Image 2 Overlay */}
                {image2 && (
                  <div className="absolute -bottom-1 right-1 w-[46%] aspect-[4/3] rounded-xl overflow-hidden border-2 border-amber-400 shadow-2xl bg-slate-900 ring-4 ring-slate-950 transition-all">
                    <img src={image2} alt="Mockup 2" className="w-full h-full object-cover" />
                    {image2Caption && (
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/90 to-transparent">
                        <span className="flex items-center gap-1 text-[9px] font-space text-amber-300 truncate">
                          <span className="text-amber-400">★</span>
                          {image2Caption}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Helper text */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="w-1 h-1 rounded-full bg-slate-700" />
                <p className="text-[11px] font-work text-slate-600 text-center">
                  Perubahan ter-update secara real-time
                </p>
                <span className="w-1 h-1 rounded-full bg-slate-700" />
              </div>
            </div>
          </div>

          {/* Status Konten Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
            <span className="font-space font-bold text-[10px] uppercase tracking-wider text-slate-500 block">
              Status Konten
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-work text-slate-600">Judul</span>
                <span className={`font-space font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  headline.trim() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {headline.trim() ? '✓ Terisi' : '○ Kosong'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-work text-slate-600">Deskripsi</span>
                <span className={`font-space font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  description.trim() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {description.trim() ? '✓ Terisi' : '○ Kosong'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-work text-slate-600">Foto Utama</span>
                <span className={`font-space font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  image1.trim() ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {image1.trim() ? '✓ Terisi' : '⚠ Wajib diisi'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-work text-slate-600">Foto Aksen</span>
                <span className={`font-space font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  image2.trim() ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {image2.trim() ? '✓ Terisi' : '○ Opsional'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Packages Admin Panel Component ─────────────────────────────── */

interface PackagesAdminPanelProps {
  packages: TourPackage[];
  onRefresh: () => Promise<void>;
}

function PackagesAdminPanel({ packages, onRefresh }: PackagesAdminPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<TourPackage | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [badge, setBadge] = useState('');
  const [subBadge, setSubBadge] = useState('');
  const [image, setImage] = useState('');
  const [color, setColor] = useState<'slate' | 'amber' | 'orange'>('slate');
  const [isFeatured, setIsFeatured] = useState(false);
  const [featureText, setFeatureText] = useState('');
  const [destinationsText, setDestinationsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingPkg(null);
    setTitle('');
    setPrice('Rp ');
    setDuration('2 - 2.5 Jam');
    setBadge('RUTE MERAPI');
    setSubBadge('OFFROAD TOUR');
    setImage('/images/img_1_156_paket_short_merapi_jeep.png');
    setColor('slate');
    setIsFeatured(false);
    setFeatureText('');
    setDestinationsText('Museum Sisa Hartaku (Erupsi 2010)\nBatu Alien (Batu Wajah Merapi)\nBunker Kaliadem & Puncak Merapi\nSpot Foto Estetik Lereng Merapi');
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: TourPackage) => {
    setEditingPkg(pkg);
    setTitle(pkg.title);
    setPrice(pkg.price);
    setDuration(pkg.duration);
    setBadge(pkg.badge || '');
    setSubBadge(pkg.subBadge || '');
    setImage(pkg.image || '');
    setColor((pkg.color as 'slate' | 'amber' | 'orange') || 'slate');
    setIsFeatured(!!pkg.isFeatured);
    setFeatureText(pkg.featureText || '');
    setDestinationsText((pkg.destinations || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price.trim() || !duration.trim()) {
      alert('Nama paket, tarif harga, dan durasi wajib diisi!');
      return;
    }

    const destinations = destinationsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        price: price.trim(),
        duration: duration.trim(),
        badge: badge.trim(),
        subBadge: subBadge.trim(),
        image: image.trim(),
        color,
        isFeatured,
        featureText: isFeatured ? featureText.trim() : '',
        destinations,
      };

      let res;
      if (editingPkg) {
        res = await fetch(`/api/packages/${editingPkg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/packages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        setIsModalOpen(false);
        await onRefresh();
      } else {
        alert('Gagal menyimpan: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pkg: TourPackage) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus paket "${pkg.title}"?`)) return;

    setDeletingId(pkg.id);
    try {
      const res = await fetch(`/api/packages/${pkg.id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        await onRefresh();
      } else {
        alert('Gagal menghapus: ' + (json.error || 'Terjadi kesalahan'));
      }
    } catch {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-mono font-bold">
            {packages.length} Paket Wisata Aktif
          </span>
          <span className="text-xs text-slate-500 font-work hidden sm:inline">
            Klik <strong>Edit Paket</strong> untuk mengubah rute destinasi atau tarif harga.
          </span>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Paket Baru</span>
        </button>
      </div>

      {/* Packages Grid: 4 Columns on XL screens for balanced layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
              pkg.isFeatured
                ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/5'
                : 'border-slate-200/80'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Media Header (Aspect 16/10) */}
              <div className="relative aspect-[16/10] w-full bg-slate-900 overflow-hidden shrink-0">
                {pkg.image ? (
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/img_1_156_paket_short_merapi_jeep.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-xs font-space">
                    Tidak ada gambar
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/40" />

                {/* Badges Overlay */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1.5">
                  {pkg.badge && (
                    <span className="px-2.5 py-1 rounded-md text-[9px] font-space font-bold uppercase tracking-wider bg-slate-950/85 text-amber-400 border border-amber-400/30 backdrop-blur-xs shadow-xs">
                      {pkg.badge}
                    </span>
                  )}
                  {pkg.isFeatured && pkg.badge !== 'BEST SELLER' && (
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-space font-bold uppercase bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>BEST SELLER</span>
                    </span>
                  )}
                </div>

                {/* Duration chip on bottom right of photo */}
                <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded bg-black/75 backdrop-blur-xs text-[10px] font-space text-slate-200 flex items-center gap-1 border border-white/10">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>{pkg.duration}</span>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col">
                <div>
                  <span className="block text-[10px] font-space font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                    {pkg.subBadge || 'OFFROAD ADVENTURE'}
                  </span>
                  <h3 className="font-outfit font-black text-lg text-slate-900 leading-tight">
                    {pkg.title}
                  </h3>
                  <div className="font-space font-black text-amber-600 text-xl mt-1">
                    {pkg.price}
                  </div>
                </div>

                {/* Highlight Slot (Consistent height so destination boxes align) */}
                <div className="h-7 flex items-center">
                  {pkg.featureText ? (
                    <div className="w-full text-[10px] font-space font-bold text-amber-900 bg-amber-50 border border-amber-200/90 px-2 py-1 rounded-lg flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                      <span className="truncate">{pkg.featureText}</span>
                    </div>
                  ) : (
                    <div className="h-full" />
                  )}
                </div>

                {/* Destinations Box */}
                <div className="bg-slate-50/90 border border-slate-200/70 rounded-xl p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="block font-space font-bold text-[9px] text-slate-400 uppercase tracking-wider mb-2">
                      DESTINASI & RUTE ({pkg.destinations?.length || 0})
                    </span>
                    <ul className="space-y-1.5">
                      {(pkg.destinations || []).map((dest, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] font-work text-slate-700 leading-snug">
                          <Check className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                          <span>{dest}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => openEditModal(pkg)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-amber-400 hover:text-amber-800 text-slate-700 font-space font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit Paket</span>
              </button>

              <button
                type="button"
                onClick={() => handleDelete(pkg)}
                disabled={deletingId === pkg.id}
                className="inline-flex items-center justify-center p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                title="Hapus Paket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add / Edit (Redesigned) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-7 my-8 space-y-6 relative max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-outfit font-black text-xl text-slate-900">
                    {editingPkg ? `Edit Data: ${editingPkg.title}` : 'Tambah Paket Wisata Baru'}
                  </h3>
                  <p className="text-xs text-slate-500 font-work">
                    Atur nama paket, tarif sewa, estimasi durasi, dan daftar destinasi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Section 1: Detail Utama */}
              <div className="space-y-3">
                <span className="block font-space font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Informasi Paket
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="block font-space font-bold text-[11px] text-slate-700 uppercase">
                      Nama Paket <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Paket Short"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-outfit font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="block font-space font-bold text-[11px] text-slate-700 uppercase">
                      Tarif Sewa <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Rp 400.000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-space font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="block font-space font-bold text-[11px] text-slate-700 uppercase">
                      Estimasi Durasi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="1.5 - 2 Jam"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-work text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Badges & Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block font-space font-bold text-[11px] text-slate-700 uppercase">
                    Badge Atas (Contoh: RUTE DASAR / BEST SELLER)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="RUTE DASAR"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-space text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-space font-bold text-[11px] text-slate-700 uppercase">
                    Sub-Badge (Contoh: EKSPEDISI CEPAT)
                  </label>
                  <input
                    type="text"
                    value={subBadge}
                    onChange={(e) => setSubBadge(e.target.value)}
                    placeholder="EKSPEDISI CEPAT"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-space text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white"
                  />
                </div>
              </div>

              {/* Section 3: Foto Banner Paket */}
              <MediaInput label="Foto Banner Paket" kind="image" folder="packages" value={image} onChange={setImage} />

              {/* Section 4: Best Seller / Highlight Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                  />
                  <span className="font-space font-bold text-xs text-slate-800 uppercase">
                    Tandai Sebagai Paket Populer (Highlight &amp; Best Seller)
                  </span>
                </label>

                {isFeatured && (
                  <div className="space-y-1 pt-1">
                    <label className="block font-space font-bold text-[10px] text-amber-800 uppercase">
                      Teks Keterangan Highlight
                    </label>
                    <input
                      type="text"
                      value={featureText}
                      onChange={(e) => setFeatureText(e.target.value)}
                      placeholder="Contoh: PALING FAVORIT & REKOMENDASI"
                      className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white font-space text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Section 5: Daftar Destinasi */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-space font-bold text-xs text-slate-700 uppercase">
                    Daftar Rute Destinasi
                  </label>
                  <span className="text-[10px] text-slate-400 font-work">
                    Tulis 1 destinasi per baris (tekan Enter)
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={destinationsText}
                  onChange={(e) => setDestinationsText(e.target.value)}
                  placeholder="Museum Sisa Hartaku (Erupsi 2010)&#10;Batu Alien (Batu Wajah Merapi)&#10;Bunker Kaliadem & Puncak Merapi&#10;Spot Foto Estetik Lereng Merapi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-work text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white leading-relaxed"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-space font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Menyimpan...' : editingPkg ? 'Simpan Perubahan' : 'Tambah Paket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

