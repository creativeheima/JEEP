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
  KeyRound,
  Sparkles
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
        router.push('/admin');
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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Background Ambience & Glowing Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 max-w-md w-full">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-7 h-7 text-slate-950" />
            </div>
            <div className="text-left">
              <span className="font-outfit font-black text-2xl text-white tracking-tight block leading-none">
                MERAPI JEEP
              </span>
              <span className="font-space font-bold text-[10px] text-amber-400 tracking-widest uppercase">
                ADMIN COMMAND CENTER
              </span>
            </div>
          </Link>
          <p className="font-work text-xs text-slate-400 max-w-xs mx-auto">
            Masuk untuk memverifikasi pesanan hasil deal WhatsApp dan menerbitkan tiket resmi.
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-slate-900/80 backdrop-blur-2xl p-7 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
          
          {/* Top glow border */}
          <div className="absolute top-0 inset-x-8 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 font-work text-xs">
            <div>
              <label className="font-space font-bold text-slate-300 block mb-1.5 uppercase tracking-wide">
                Username / Email Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white placeholder-slate-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-space font-bold text-slate-300 uppercase tracking-wide">
                  Kata Sandi
                </label>
                <span className="text-[11px] text-slate-500 font-work">
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
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/70 border border-slate-800 focus:outline-none focus:border-amber-500 text-white placeholder-slate-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Auto-fill demo button */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleDemoFill}
                className="inline-flex items-center gap-1.5 text-[11px] font-space font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Auto-fill Demo Akun</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enkripsi Aman</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="amber-gradient-btn w-full py-3.5 rounded-xl font-space font-bold text-xs text-slate-950 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
              >
                <span>{loading ? 'Memverifikasi...' : 'MASUK KE DASHBOARD ADMIN'}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </form>

        </div>

        {/* Footer Back Link */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs font-space font-semibold text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Kembali ke Website Utama Merapi Jeep
          </Link>
        </div>

      </div>

    </div>
  );
}
