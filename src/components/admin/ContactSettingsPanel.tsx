'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle, Save, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { normalizeWaNumber, isValidWaNumber, formatPhoneIntl } from '@/lib/phone';
import { refreshSiteSettings } from '@/hooks/useSiteSettings';

/** Pengaturan nomor WhatsApp admin: dipakai di form booking, tombol WA, footer, FAQ & cek tiket. */
export default function ContactSettingsPanel() {
  const [value, setValue] = useState('');
  const [saved, setSaved] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        const wa = j?.data?.whatsapp || '';
        setSaved(wa);
        setValue(wa ? `0${wa.slice(2)}` : '');
      })
      .catch(() => setMessage({ type: 'err', text: 'Gagal memuat pengaturan.' }))
      .finally(() => setLoading(false));
  }, []);

  const normalized = normalizeWaNumber(value);
  const valid = isValidWaNumber(normalized);
  const changed = normalized !== saved;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setMessage({ type: 'err', text: 'Nomor tidak valid. Contoh: 081234567890' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whatsapp: normalized }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || `Gagal menyimpan (${res.status})`);
      setSaved(json.data.whatsapp);
      refreshSiteSettings();
      setMessage(
        json.warning
          ? { type: 'err', text: json.warning }
          : { type: 'ok', text: 'Nomor WhatsApp tersimpan. Website langsung memakai nomor baru.' }
      );
    } catch (err) {
      setMessage({ type: 'err', text: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-outfit font-black text-lg text-slate-900">Nomor WhatsApp Admin</h2>
            <p className="font-work text-xs text-slate-500 mt-0.5 leading-relaxed">
              Pesan booking dari customer akan dikirim ke nomor ini. Nomor juga tampil di tombol WhatsApp, footer, FAQ, dan halaman cek tiket.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="wa-number" className="font-space text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Nomor WhatsApp
          </label>
          <input
            id="wa-number"
            type="tel"
            inputMode="tel"
            disabled={loading}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setMessage(null);
            }}
            placeholder="081234567890"
            className="w-full h-12 px-4 rounded-xl border border-slate-300 bg-slate-50 font-mono text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 disabled:opacity-60"
          />
          <p className={`text-xs font-work ${value && !valid ? 'text-rose-600' : 'text-slate-500'}`}>
            {loading
              ? 'Memuat…'
              : value && !valid
              ? 'Format belum benar. Gunakan nomor HP Indonesia, mis. 081234567890.'
              : valid
              ? <>Akan disimpan sebagai <strong className="font-mono">{formatPhoneIntl(normalized)}</strong></>
              : 'Boleh diawali 08, 62, atau +62.'}
          </p>
        </div>

        {message && (
          <div
            className={`flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs font-work ${
              message.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {message.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5">
          <button
            type="submit"
            disabled={saving || loading || !valid || !changed}
            className="amber-gradient-btn h-11 px-5 rounded-xl font-space font-black text-xs text-slate-950 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Menyimpan…' : 'Simpan Nomor'}
          </button>
          {valid && (
            <a
              href={`https://wa.me/${normalized}?text=${encodeURIComponent('Tes nomor WhatsApp admin Merapi Jeep Adventure')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-space font-bold text-xs flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Tes Buka WhatsApp
            </a>
          )}
        </div>
      </form>
    </div>
  );
}
