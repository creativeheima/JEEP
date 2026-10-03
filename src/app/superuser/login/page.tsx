'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Crown,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Database,
  ArrowLeft
} from 'lucide-react';
import { setClientSession } from '@/lib/adminAuth';

export default function SuperuserLoginPage() {
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
        if (data.user.role !== 'SUPERUSER') {
          setError('Akses Ditolak: Akun ini adalah staf admin biasa. Halaman ini khusus untuk Superuser. Silakan login di Portal Admin (/admin/login).');
          setLoading(false);
          return;
        }

        setClientSession(data.user);
        router.push('/superuser');
      } else {
        setError(data.error || 'Username atau password Superuser tidak sesuai.');
      }
    } catch {
      setError('Gagal menghubungi server. Periksa koneksi Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFill = () => {
    setUsername('superuser');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-md w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Crown className="w-8 h-8 text-slate-950 stroke-[2.2]" />
            </div>
          </Link>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-space font-bold text-xs uppercase tracking-widest mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>SUPERUSER MASTER PORTAL</span>
          </div>

          <h1 className="font-outfit font-black text-2xl text-white tracking-tight">
            Pusat Kontrol Sistem & Database
          </h1>
          <p className="font-work text-xs text-slate-400 max-w-xs mx-auto mt-1">
            Khusus Superuser untuk konfigurasi database (Supabase/MySQL), API Keys, dan manajemen akun staf.
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/90 backdrop-blur-md p-7 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 font-work text-xs">
            <div>
              <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                Username / Email Superuser
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="superuser atau admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:bg-slate-900 focus:outline-none focus:border-amber-500 text-white placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-space font-bold text-slate-300 uppercase tracking-wide">
                  Kata Sandi Master
                </label>
                <span className="text-[11px] text-amber-500 font-work">
                  Default: admin123
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:bg-slate-900 focus:outline-none focus:border-amber-500 text-white placeholder-slate-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick Auto-fill */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleAutoFill}
                className="inline-flex items-center gap-1.5 text-[11px] font-space font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Auto-fill Superuser</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Enkripsi Level 3</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-space font-bold text-xs bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all group"
              >
                <span>{loading ? 'Memverifikasi Akses Master...' : 'MASUK KE SUPERUSER PORTAL'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>

          {/* Switch to regular admin login */}
          <div className="mt-5 pt-4 border-t border-slate-800 text-center">
            <span className="text-[11px] font-work text-slate-500">
              Bukan Superuser?{' '}
            </span>
            <Link
              href="/admin/login"
              className="text-[11px] font-space font-bold text-amber-400 hover:text-amber-300 transition-colors"
            >
              Masuk ke Panel Staf Admin Biasa →
            </Link>
          </div>

        </div>

        {/* Footer Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-space font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Beranda Website</span>
          </Link>
        </div>

      </div>

    </div>
  );
}
