'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Car,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound
} from 'lucide-react';
import { setClientSession } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success && data.user) {
        setClientSession(data.user);
        if (data.user.role === 'SUPERUSER') {
          router.push('/superuser');
        } else {
          router.push('/admin');
        }
      } else {
        setError(data.error || 'Username atau password tidak sesuai.');
      }
    } catch {
      setError('Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4 relative font-sans antialiased">
      
      {/* Main Login Container */}
      <div className="relative z-10 max-w-md w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-7 h-7 text-slate-950" />
            </div>
            <div className="text-left">
              <span className="font-outfit font-black text-2xl text-slate-900 tracking-tight block leading-none">
                MERAPI JEEP
              </span>
              <span className="font-space font-bold text-[10px] text-amber-600 tracking-widest uppercase">
                ADMIN HQ PANEL
              </span>
            </div>
          </Link>
          <p className="font-work text-xs text-slate-500 max-w-xs mx-auto">
            Masuk ke panel admin untuk verifikasi pesanan, terbitkan tiket resmi, dan kelola foto beranda.
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-lg relative">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 font-work text-xs">
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                Username Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-space font-bold text-slate-700 uppercase tracking-wide">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-slate-400 font-work">
                  Default: admin123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Auto-fill admin button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDemoFill}
                className="inline-flex items-center gap-1.5 text-[11px] font-space font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Auto-fill Akun Admin</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sesi Terenkripsi</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-space font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors group"
              >
                <span>{loading ? 'Memverifikasi...' : 'MASUK KE DASHBOARD ADMIN'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>

          {/* Direct link to Superuser Portal */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <span className="text-[11px] font-work text-slate-500">
              Pengelola Sistem / Pimpinan?{' '}
            </span>
            <Link
              href="/superuser/login"
              className="text-[11px] font-space font-bold text-amber-700 hover:text-amber-800 transition-colors inline-flex items-center gap-1"
            >
              <span>👑 Buka Portal Superuser Khusus</span>
              <span>→</span>
            </Link>
          </div>

        </div>

        {/* Footer Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-space font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Kembali ke Halaman Utama Website
          </Link>
        </div>

      </div>

    </div>
  );
}
