'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  KeyRound,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  X,
  Lock,
  Mail,
  User as UserIcon,
  Crown
} from 'lucide-react';
import { AdminAccount, UserRole } from '@/types/account';

interface UserManagementTabProps {
  currentUserRole?: string;
  currentUsername?: string;
}

export default function UserManagementTab({ currentUserRole, currentUsername }: UserManagementTabProps) {
  const isSuperuser = currentUserRole === 'SUPERUSER';

  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Modal Create
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('ADMIN');
  const [submittingCreate, setSubmittingCreate] = useState(false);

  // Modal Edit / Change Password
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('ADMIN');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAccounts(json.data);
      } else {
        setErrorMessage(json.error || 'Gagal memuat daftar akun');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan jaringan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperuser) {
      alert('Hanya Superuser yang berwenang menambah akun!');
      return;
    }

    setSubmittingCreate(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createUsername.trim(),
          name: createName.trim() || createUsername.trim(),
          email: createEmail.trim(),
          password: createPassword,
          role: createRole,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMessage(json.message || 'Akun berhasil dibuat!');
        setShowCreateModal(false);
        setCreateUsername('');
        setCreateName('');
        setCreateEmail('');
        setCreatePassword('');
        setCreateRole('ADMIN');
        fetchAccounts();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(json.error || 'Gagal membuat akun');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan: ' + err.message);
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openEditModal = (acc: AdminAccount) => {
    setEditingAccount(acc);
    setEditName(acc.name || '');
    setEditEmail(acc.email || '');
    setEditRole(acc.role);
    setEditIsActive(acc.isActive !== false);
    setEditNewPassword('');
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount || !isSuperuser) return;

    setSubmittingEdit(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAccount.id,
          name: editName.trim(),
          email: editEmail.trim(),
          role: editRole,
          isActive: editIsActive,
          password: editNewPassword.trim() ? editNewPassword.trim() : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMessage('Data akun berhasil diperbarui!');
        setEditingAccount(null);
        fetchAccounts();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(json.error || 'Gagal memperbarui akun');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan: ' + err.message);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDeleteAccount = async (acc: AdminAccount) => {
    if (!isSuperuser) {
      alert('Hanya Superuser yang berwenang menghapus akun!');
      return;
    }
    if (acc.username === currentUsername) {
      alert('Anda tidak dapat menghapus akun yang sedang Anda gunakan saat ini!');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus akun ${acc.username} (${acc.name})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users?id=${encodeURIComponent(acc.id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage(`Akun ${acc.username} berhasil dihapus.`);
        fetchAccounts();
        setTimeout(() => setSuccessMessage(''), 4000);
      } else {
        setErrorMessage(json.error || 'Gagal menghapus akun');
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kesalahan: ' + err.message);
    }
  };

  const superuserCount = accounts.filter((a) => a.role === 'SUPERUSER').length;
  const adminCount = accounts.filter((a) => a.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-outfit font-black text-lg text-slate-900 tracking-tight">
                Pengelolaan Akun & Hak Akses
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-space font-black bg-amber-500 text-slate-950 uppercase tracking-wider">
                👑 Superuser
              </span>
            </div>
            <p className="font-work text-xs text-slate-600 mt-0.5">
              Atur hak akses staf dan pimpinan. Buat akun baru, reset kata sandi, dan tetapkan role <strong>Superuser</strong> atau <strong>Staff Operasional</strong>.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          disabled={!isSuperuser}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space text-xs font-bold shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="font-space text-xs text-slate-500 font-bold uppercase tracking-wider block">
            Total Akun Terdaftar
          </span>
          <span className="font-outfit font-black text-2xl text-slate-900 mt-1 block">
            {accounts.length}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-space text-xs text-amber-800 font-bold uppercase tracking-wider block">
              Superuser (Full Control)
            </span>
            <Crown className="w-4 h-4 text-amber-600" />
          </div>
          <span className="font-outfit font-black text-2xl text-amber-900 mt-1 block">
            {superuserCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-blue-200 bg-blue-50/20 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="font-space text-xs text-blue-800 font-bold uppercase tracking-wider block">
              Staf Operasional (Admin)
            </span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-outfit font-black text-2xl text-blue-900 mt-1 block">
            {adminCount}
          </span>
        </div>
      </div>

      {/* Feedback Messages */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-space font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-work flex items-center gap-2.5 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Accounts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-outfit font-bold text-base text-slate-900">Daftar Akun Pengguna</h3>
            <p className="font-work text-xs text-slate-500">
              Kelola kredensial dan hak akses ke dashboard administrasi Merapi Jeep
            </p>
          </div>
          <button
            type="button"
            onClick={fetchAccounts}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-work text-xs">
            <thead className="bg-slate-50 text-slate-500 font-space font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Pengguna</th>
                <th className="py-3.5 px-4">Kontak / Email</th>
                <th className="py-3.5 px-4">Role Akses</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Terakhir Login</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((acc) => {
                const isCurrent = acc.username === currentUsername;
                return (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-outfit font-black text-xs ${
                          acc.role === 'SUPERUSER'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-300'
                        }`}>
                          {acc.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-outfit font-bold text-slate-900 text-sm">
                              {acc.name || acc.username}
                            </span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-space font-bold bg-slate-900 text-white">
                                Anda
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-xs text-slate-500 block">
                            @{acc.username}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-4">
                      <span className="text-slate-700">{acc.email}</span>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      {acc.role === 'SUPERUSER' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-space font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Crown className="w-3.5 h-3.5 text-amber-700" />
                          <span>SUPERUSER</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-space font-bold bg-blue-100 text-blue-900 border border-blue-200">
                          <Shield className="w-3.5 h-3.5 text-blue-700" />
                          <span>STAF ADMIN</span>
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {acc.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Aktif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 font-bold text-xs">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          <span>Nonaktif</span>
                        </span>
                      )}
                    </td>

                    {/* Last Login */}
                    <td className="py-4 px-4 text-slate-500">
                      {acc.lastLogin
                        ? new Date(acc.lastLogin).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Belum pernah login'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(acc)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Edit Akun & Password"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAccount(acc)}
                          disabled={isCurrent}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isCurrent ? 'Tidak bisa menghapus akun sendiri' : 'Hapus Akun'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create Account */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-slate-900">
                    Tambah Akun Admin Baru
                  </h3>
                  <p className="font-work text-xs text-slate-500">
                    Buat kredensial akses untuk staf atau superuser
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 font-work text-xs">
              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                  Username (Untuk Login) *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="contoh: budi_ops"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                  Nama Lengkap / Tampilan
                </label>
                <input
                  type="text"
                  placeholder="contoh: Budi Santoso"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                  Alamat Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="budi@merapijeep.com"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                  Kata Sandi Baru *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                  Tingkat Hak Akses (Role)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setCreateRole('ADMIN')}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                      createRole === 'ADMIN'
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Staf Admin</span>
                  </label>

                  <label
                    onClick={() => setCreateRole('SUPERUSER')}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                      createRole === 'SUPERUSER'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>Superuser</span>
                  </label>
                </div>
                <p className="font-work text-[11px] text-slate-400 mt-1">
                  {createRole === 'SUPERUSER'
                    ? 'Superuser memiliki kontrol penuh termasuk pengaturan database dan manajemen akun.'
                    : 'Staf Admin hanya dapat mengelola pesanan, galeri, slide foto, dan paket tour.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-space font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingCreate ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Simpan Akun Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Account */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-outfit font-bold text-base text-slate-900">
                    Edit Akun: @{editingAccount.username}
                  </h3>
                  <p className="font-work text-xs text-slate-500">
                    Ubah peran, status, atau reset kata sandi
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateAccount} className="p-6 space-y-4 font-work text-xs">
              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                  Nama Lengkap / Tampilan
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1 uppercase tracking-wide">
                  Ganti Kata Sandi (Opsional)
                </label>
                <input
                  type="password"
                  placeholder="Kosongkan jika tidak ingin mengubah password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-amber-500 text-slate-900"
                />
              </div>

              <div>
                <label className="font-space font-bold text-slate-700 block mb-1.5 uppercase tracking-wide">
                  Hak Akses (Role)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setEditRole('ADMIN')}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                      editRole === 'ADMIN'
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Staf Admin</span>
                  </label>

                  <label
                    onClick={() => setEditRole('SUPERUSER')}
                    className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                      editRole === 'SUPERUSER'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <Crown className="w-4 h-4 text-amber-600" />
                    <span>Superuser</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span className="font-space font-bold text-slate-700">Akun Aktif (Dapat Login)</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAccount(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-space font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-space font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {submittingEdit ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Perbarui Akun</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
