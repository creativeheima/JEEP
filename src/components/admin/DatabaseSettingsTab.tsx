'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Server,
  Zap,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Code,
  ShieldCheck,
  HelpCircle,
  Play
} from 'lucide-react';
import { DatabaseMode, SystemDatabaseConfig, DbConnectionTestResult } from '@/types/database';

interface DatabaseSettingsTabProps {
  currentUserRole?: string;
}

export default function DatabaseSettingsTab({ currentUserRole }: DatabaseSettingsTabProps) {
  const isSuperuser = currentUserRole === 'SUPERUSER';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Config form state
  const [activeMode, setActiveMode] = useState<DatabaseMode>('supabase');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseServiceRoleKey, setSupabaseServiceRoleKey] = useState('');
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [showServiceRoleKey, setShowServiceRoleKey] = useState(false);

  // MySQL state
  const [mySqlHost, setMySqlHost] = useState('localhost');
  const [mySqlPort, setMySqlPort] = useState(3306);
  const [mySqlDatabase, setMySqlDatabase] = useState('merapi_jeep_adventure');
  const [mySqlUser, setMySqlUser] = useState('root');
  const [mySqlPassword, setMySqlPassword] = useState('');
  const [mySqlSsl, setMySqlSsl] = useState(false);
  const [showMySqlPassword, setShowMySqlPassword] = useState(false);

  // Test connection state
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<DbConnectionTestResult | null>(null);

  const [testingMySql, setTestingMySql] = useState(false);
  const [mySqlTestResult, setMySqlTestResult] = useState<DbConnectionTestResult | null>(null);

  // Init tables state
  const [initializingMySql, setInitializingMySql] = useState(false);
  const [initResult, setInitResult] = useState<{ success: boolean; message: string } | null>(null);

  // SQL Schema modal state
  const [showSqlModal, setShowSqlModal] = useState(false);
  const [sqlTab, setSqlTab] = useState<'mysql' | 'supabase'>('mysql');
  const [copiedSql, setCopiedSql] = useState(false);

  // Load config on mount
  const fetchConfig = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/database');
      const json = await res.json();
      if (json.success && json.data) {
        const d: SystemDatabaseConfig = json.data;
        setActiveMode(d.activeMode || 'supabase');
        setSupabaseUrl(d.supabase?.url || '');
        setSupabaseAnonKey(d.supabase?.anonKey || '');
        setSupabaseServiceRoleKey(d.supabase?.serviceRoleKey || '');

        setMySqlHost(d.mysql?.host || 'localhost');
        setMySqlPort(d.mysql?.port || 3306);
        setMySqlDatabase(d.mysql?.database || 'merapi_jeep_adventure');
        setMySqlUser(d.mysql?.user || 'root');
        setMySqlPassword(d.mysql?.password || '');
        setMySqlSsl(Boolean(d.mysql?.ssl));
      }
    } catch (err: any) {
      setErrorMessage('Gagal memuat konfigurasi database dari server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperuser) {
      alert('Akses ditolak: Hanya Superuser yang memiliki izin mengubah konfigurasi database!');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const payload: Partial<SystemDatabaseConfig> = {
        activeMode,
        supabase: {
          url: supabaseUrl.trim(),
          anonKey: supabaseAnonKey.trim(),
          serviceRoleKey: supabaseServiceRoleKey.trim(),
        },
        mysql: {
          host: mySqlHost.trim(),
          port: Number(mySqlPort) || 3306,
          database: mySqlDatabase.trim(),
          user: mySqlUser.trim(),
          password: mySqlPassword,
          ssl: mySqlSsl,
        },
      };

      const res = await fetch('/api/admin/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        // Hosting serverless: konfigurasi tidak tersimpan permanen → beri tahu superuser
        if (json.persisted === false && json.message) setErrorMessage(json.message);
      } else {
        setErrorMessage(json.error || 'Gagal menyimpan konfigurasi');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan jaringan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestSupabase = async () => {
    setTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await fetch('/api/admin/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-supabase',
          payload: {
            url: supabaseUrl.trim(),
            anonKey: supabaseAnonKey.trim(),
            serviceRoleKey: supabaseServiceRoleKey.trim(),
          },
        }),
      });
      const json = await res.json();
      setSupabaseTestResult(json.result);
    } catch (err: any) {
      setSupabaseTestResult({
        success: false,
        message: 'Koneksi gagal: ' + err.message,
      });
    } finally {
      setTestingSupabase(false);
    }
  };

  const handleTestMySql = async () => {
    setTestingMySql(true);
    setMySqlTestResult(null);
    try {
      const res = await fetch('/api/admin/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test-mysql',
          payload: {
            host: mySqlHost.trim(),
            port: Number(mySqlPort) || 3306,
            database: mySqlDatabase.trim(),
            user: mySqlUser.trim(),
            password: mySqlPassword,
            ssl: mySqlSsl,
          },
        }),
      });
      const json = await res.json();
      setMySqlTestResult(json.result);
    } catch (err: any) {
      setMySqlTestResult({
        success: false,
        message: 'Koneksi gagal: ' + err.message,
      });
    } finally {
      setTestingMySql(false);
    }
  };

  const handleInitMySqlTables = async () => {
    if (!confirm('Buat tabel-tabel Jeep Merapi (bookings, packages, gallery, hero_slides) di database MySQL ini sekarang?')) {
      return;
    }
    setInitializingMySql(true);
    setInitResult(null);
    try {
      const res = await fetch('/api/admin/database', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'init-mysql-schema',
          payload: {
            host: mySqlHost.trim(),
            port: Number(mySqlPort) || 3306,
            database: mySqlDatabase.trim(),
            user: mySqlUser.trim(),
            password: mySqlPassword,
            ssl: mySqlSsl,
          },
        }),
      });
      const json = await res.json();
      setInitResult(json.result);
    } catch (err: any) {
      setInitResult({
        success: false,
        message: 'Gagal inisialisasi tabel: ' + err.message,
      });
    } finally {
      setInitializingMySql(false);
    }
  };

  const mySqlSchemaCode = `-- ==============================================================
-- SKEMA MYSQL UNTUK JEEP MERAPI ADVENTURE
-- Jalankan di phpMyAdmin / MySQL Workbench / CLI
-- ==============================================================

CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(100) PRIMARY KEY,
  booking_code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  package_name VARCHAR(255) NOT NULL,
  tour_date VARCHAR(50) NOT NULL,
  tour_time VARCHAR(50) NOT NULL,
  pax_count INT NOT NULL DEFAULT 1,
  jeep_count INT NOT NULL DEFAULT 1,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  dp_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(100) NOT NULL DEFAULT 'Transfer BCA',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'MENUNGGU_PEMBAYARAN',
  approval_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  driver_name VARCHAR(150) DEFAULT 'Belum Ditugaskan',
  jeep_number VARCHAR(100) DEFAULT '-',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  approved_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS gallery_items (
  id VARCHAR(100) PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'PHOTO',
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'JEEP ACTION',
  media_url TEXT NOT NULL,
  instagram_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS hero_slides (
  id VARCHAR(100) PRIMARY KEY,
  image_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL DEFAULT '',
  show_text BOOLEAN NOT NULL DEFAULT TRUE,
  headline VARCHAR(255),
  subheadline VARCHAR(255),
  show_button BOOLEAN NOT NULL DEFAULT TRUE,
  order_index INT NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tour_packages (
  id VARCHAR(100) PRIMARY KEY,
  badge VARCHAR(100) DEFAULT '',
  sub_badge VARCHAR(100) DEFAULT '',
  title VARCHAR(255) NOT NULL,
  price VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  image VARCHAR(500) NOT NULL,
  destinations JSON,
  is_featured BOOLEAN DEFAULT FALSE,
  feature_text VARCHAR(255),
  color VARCHAR(50) DEFAULT 'slate',
  order_index INT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS collage_content (
  id VARCHAR(50) PRIMARY KEY,
  headline VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  image1 TEXT NOT NULL,
  image1_caption VARCHAR(255),
  image2 TEXT NOT NULL,
  image2_caption VARCHAR(255),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
        <p className="font-space font-bold text-sm text-slate-700">Memuat Pengaturan Database Superuser...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Privilege Notice */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-outfit font-black text-lg text-slate-900 tracking-tight">
                Pusat Kontrol Database Multi-Provider
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-space font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
                👑 Superuser
              </span>
            </div>
            <p className="font-work text-xs text-slate-600 mt-0.5">
              Kelola koneksi backend fleksibel: beralih antara <strong>Supabase (Cloud)</strong>, <strong>MySQL (Local / VPS / RDS)</strong>, atau <strong>Local JSON</strong> tanpa edit file kode manual.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowSqlModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-amber-800 hover:border-amber-400 font-space text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Code className="w-4 h-4 text-amber-600" />
          <span>Lihat Skrip SQL</span>
        </button>
      </div>

      {/* Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-space font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Konfigurasi database berhasil disimpan dan provider aktif telah diperbarui secara instan!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-work flex items-center gap-2.5 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Step 1: Mode Selector Cards */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-outfit font-bold text-base text-slate-900">
                1. Pilih Database Engine Utama
              </h3>
              <p className="font-work text-xs text-slate-500">
                Pilih database mana yang aktif memproses transaksi booking, paket, dan galeri saat ini.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-space text-slate-500 font-bold uppercase tracking-wider">
                Sedang Aktif:
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-space font-black uppercase tracking-wider ${
                activeMode === 'supabase'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : activeMode === 'mysql'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-slate-100 text-slate-800 border border-slate-300'
              }`}>
                {activeMode}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Supabase Option */}
            <div
              onClick={() => setActiveMode('supabase')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                activeMode === 'supabase'
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-2 ring-emerald-500/10'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                  <Zap className="w-5 h-5" />
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  activeMode === 'supabase' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                }`}>
                  {activeMode === 'supabase' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <h4 className="font-outfit font-bold text-sm text-slate-900">Supabase Cloud (PostgreSQL)</h4>
              <p className="font-work text-xs text-slate-500 mt-1">
                Database cloud modern dengan fitur REST API, RLS security, dan media storage. Sangat direkomendasikan untuk deployment online.
              </p>
            </div>

            {/* MySQL Option */}
            <div
              onClick={() => setActiveMode('mysql')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                activeMode === 'mysql'
                  ? 'border-blue-500 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/10'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                  <Server className="w-5 h-5" />
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  activeMode === 'mysql' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                }`}>
                  {activeMode === 'mysql' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <h4 className="font-outfit font-bold text-sm text-slate-900">MySQL Database</h4>
              <p className="font-work text-xs text-slate-500 mt-1">
                Koneksi langsung ke server MySQL / MariaDB (Localhost XAMPP, VPS Ubuntu, TiDB, atau Cloud AWS RDS).
              </p>
            </div>

            {/* Local Storage Option */}
            <div
              onClick={() => setActiveMode('local')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                activeMode === 'local'
                  ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-2 ring-amber-500/10'
                  : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  activeMode === 'local' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                }`}>
                  {activeMode === 'local' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
              <h4 className="font-outfit font-bold text-sm text-slate-900">Local JSON Storage</h4>
              <p className="font-work text-xs text-slate-500 mt-1">
                Penyimpanan file JSON di server lokal (`data/*.json`). Cocok untuk demo cepat tanpa konfigurasi database server eksternal.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Supabase Credentials */}
        <div className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 ${
          activeMode === 'supabase' ? 'ring-2 ring-emerald-500/20' : 'opacity-85'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-base text-slate-900">
                  Konfigurasi Supabase Cloud
                </h3>
                <span className="font-work text-xs text-slate-400">
                  Didapatkan dari: Supabase Dashboard → Settings → API
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={testingSupabase || !supabaseUrl}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 text-xs font-space font-bold transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
            >
              {testingSupabase ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                  <span>Menguji Koneksi...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tes Koneksi Supabase</span>
                </>
              )}
            </button>
          </div>

          {/* Test Result Banner */}
          {supabaseTestResult && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              supabaseTestResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {supabaseTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{supabaseTestResult.message}</p>
                {supabaseTestResult.details?.latencyMs && (
                  <p className="font-mono text-[11px] text-slate-500">
                    Latency: {supabaseTestResult.details.latencyMs}ms
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 font-work text-xs">
            {/* Supabase URL */}
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                Project URL (NEXT_PUBLIC_SUPABASE_URL)
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-900 font-mono transition-colors"
              />
            </div>

            {/* Supabase Anon Public Key */}
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                Anon Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
              </label>
              <div className="relative">
                <input
                  type={showAnonKey ? 'text' : 'password'}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-900 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowAnonKey(!showAnonKey)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showAnonKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="font-work text-[11px] text-slate-400 mt-1">
                Kunci publik aman yang dapat digunakan oleh browser client untuk membaca & memasukkan pesanan.
              </p>
            </div>

            {/* Supabase Service Role Key */}
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                Service Role Key / Secret (SUPABASE_SERVICE_ROLE_KEY) - Opsional
              </label>
              <div className="relative">
                <input
                  type={showServiceRoleKey ? 'text' : 'password'}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={supabaseServiceRoleKey}
                  onChange={(e) => setSupabaseServiceRoleKey(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-emerald-500 text-slate-900 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowServiceRoleKey(!showServiceRoleKey)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showServiceRoleKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="font-work text-[11px] text-slate-400 mt-1">
                Kunci rahasia khusus server API untuk bypass RLS (misalnya upload file media besar ke bucket Supabase Storage).
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: MySQL Credentials */}
        <div className={`bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 ${
          activeMode === 'mysql' ? 'ring-2 ring-blue-500/20' : 'opacity-85'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-base text-slate-900">
                  Konfigurasi MySQL Database
                </h3>
                <span className="font-work text-xs text-slate-400">
                  Mendukung MySQL 5.7+, MySQL 8.0+, MariaDB, TiDB, dan AWS RDS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleInitMySqlTables}
                disabled={initializingMySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 text-xs font-space font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {initializingMySql ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-700" />
                    <span>Membuat Tabel...</span>
                  </>
                ) : (
                  <>
                    <Code className="w-3.5 h-3.5 text-amber-700" />
                    <span>Inisialisasi Tabel Otomatis</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestMySql}
                disabled={testingMySql || !mySqlHost}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100 text-xs font-space font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {testingMySql ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-700" />
                    <span>Menguji Koneksi...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-blue-700" />
                    <span>Tes Koneksi MySQL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* MySQL Test Result Banner */}
          {mySqlTestResult && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              mySqlTestResult.success
                ? 'bg-blue-50 border border-blue-200 text-blue-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {mySqlTestResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{mySqlTestResult.message}</p>
                {mySqlTestResult.details?.detectedTables && (
                  <p className="font-mono text-[11px] text-slate-600">
                    Tabel ditemukan ({mySqlTestResult.details.detectedTables.length}):{' '}
                    {mySqlTestResult.details.detectedTables.join(', ') || 'Belum ada tabel'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* MySQL Init Result Banner */}
          {initResult && (
            <div className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
              initResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {initResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <p className="font-bold">{initResult.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-work text-xs">
            {/* Host */}
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                MySQL Host
              </label>
              <input
                type="text"
                placeholder="localhost atau 127.0.0.1"
                value={mySqlHost}
                onChange={(e) => setMySqlHost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-mono transition-colors"
              />
            </div>

            {/* Port */}
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                Port
              </label>
              <input
                type="number"
                placeholder="3306"
                value={mySqlPort}
                onChange={(e) => setMySqlPort(Number(e.target.value) || 3306)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-mono transition-colors"
              />
            </div>

            {/* Database Name */}
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                Nama Database
              </label>
              <input
                type="text"
                placeholder="merapi_jeep_adventure"
                value={mySqlDatabase}
                onChange={(e) => setMySqlDatabase(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-mono transition-colors"
              />
            </div>

            {/* User */}
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                Username Database
              </label>
              <input
                type="text"
                placeholder="root"
                value={mySqlUser}
                onChange={(e) => setMySqlUser(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-mono transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                Kata Sandi Database
              </label>
              <div className="relative">
                <input
                  type={showMySqlPassword ? 'text' : 'password'}
                  placeholder="Kosongkan jika tanpa password"
                  value={mySqlPassword}
                  onChange={(e) => setMySqlPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-blue-500 text-slate-900 font-mono transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowMySqlPassword(!showMySqlPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showMySqlPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* SSL Switch */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={mySqlSsl}
                  onChange={(e) => setMySqlSsl(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="font-space font-bold text-slate-700 text-xs">
                  Gunakan Koneksi SSL (Cloud RDS)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h4 className="font-outfit font-bold text-sm">Simpan Konfigurasi & Terapkan Perubahan</h4>
            </div>
            <p className="font-work text-xs text-slate-400 mt-0.5">
              Perubahan langsung disimpan ke sistem server dan active database engine segera beralih ke <strong>{activeMode.toUpperCase()}</strong>.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving || !isSuperuser}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SIMPAN & AKTIFKAN DATABASE</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* SQL Script View Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-slate-900">
                    Skrip SQL Skema Database
                  </h3>
                  <p className="font-work text-xs text-slate-500">
                    Salin skrip berikut bila Anda ingin mengeksekusi tabel secara manual di SQL Editor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(mySqlSchemaCode)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-space text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Tersalin!' : 'Salin SQL'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed">
              <pre className="whitespace-pre-wrap">{mySqlSchemaCode}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
