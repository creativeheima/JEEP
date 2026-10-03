'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Crown,
  Database,
  Users,
  ShieldCheck,
  LogOut,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Home,
  CheckCircle2,
  Server,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Car
} from 'lucide-react';
import { isClientAuthenticated, getClientUser, clearClientSession, isSuperuser } from '@/lib/adminAuth';
import DatabaseSettingsTab from '@/components/admin/DatabaseSettingsTab';
import UserManagementTab from '@/components/admin/UserManagementTab';

export default function SuperuserDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'database' | 'users'>('database');
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = isClientAuthenticated();
    if (!auth) {
      router.push('/superuser/login');
      return;
    }

    const user = getClientUser();
    if (!user || user.role !== 'SUPERUSER') {
      alert('Akses Ditolak: Anda bukan Superuser! Mengalihkan ke panel staf admin...');
      router.push('/admin');
      return;
    }

    setCurrentUser(user);
    setAuthorized(true);
  }, [router]);

  const handleLogout = () => {
    if (confirm('Keluar dari Sesi Superuser?')) {
      clearClientSession();
      router.push('/superuser/login');
    }
  };

  if (authorized === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 gap-3">
        <Crown className="w-10 h-10 text-amber-500 animate-bounce" />
        <p className="font-space font-bold text-sm text-slate-400">
          Memverifikasi Otoritas Superuser...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      {/* Superuser Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Crown className="w-5 h-5 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-outfit font-black text-base text-white tracking-tight block leading-none">
                  MERAPI JEEP
                </span>
                <span className="font-space font-bold text-[10px] text-amber-400 tracking-wider uppercase">
                  SUPERUSER CONTROL HQ
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Actions & Profile */}
          <div className="flex items-center gap-3">
            {/* Shortcut to Operational Admin */}
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-space font-bold transition-colors"
            >
              <Car className="w-3.5 h-3.5 text-amber-400" />
              <span>Ke Dashboard Admin</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>

            {/* User Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-outfit font-black text-xs">
                {currentUser?.username?.slice(0, 2).toUpperCase() || 'SU'}
              </div>
              <div className="hidden md:block text-left text-xs leading-tight">
                <span className="font-outfit font-bold text-white block">
                  {currentUser?.name || currentUser?.username}
                </span>
                <span className="text-[10px] font-space text-amber-400 block font-semibold">
                  👑 Superuser Master
                </span>
              </div>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title="Keluar dari Superuser"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-space text-slate-500 mb-1">
              <span>Superuser Portal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-bold text-amber-700 uppercase">
                {activeTab === 'database' ? 'Konfigurasi Database' : 'Manajemen Akun Pengguna'}
              </span>
            </div>
            <h1 className="font-outfit font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {activeTab === 'database'
                ? 'Pusat Pengaturan Multi-Database'
                : 'Pengelolaan Hak Akses & Kredensial Admin'}
            </h1>
          </div>

          {/* Quick tab switcher pill */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-space font-bold transition-all cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-300/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Setting Database</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-space font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-300/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Kelola Akun Admin</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Database Settings */}
        {activeTab === 'database' && (
          <DatabaseSettingsTab currentUserRole={currentUser?.role} />
        )}

        {/* Tab 2: User Management */}
        {activeTab === 'users' && (
          <UserManagementTab
            currentUserRole={currentUser?.role}
            currentUsername={currentUser?.username}
          />
        )}

      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs font-work text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Merapi Jeep Adventure • Superuser Master Console</span>
          <div className="flex items-center gap-4 font-space text-[11px]">
            <Link href="/admin" className="text-amber-800 hover:underline">
              Buka Panel Staf Admin (/admin)
            </Link>
            <Link href="/" target="_blank" className="text-slate-600 hover:underline">
              Lihat Website Beranda ↗
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
