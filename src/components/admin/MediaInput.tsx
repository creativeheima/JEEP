'use client';

import React, { useEffect, useRef, useState } from 'react';
import { UploadCloud, Link2, HardDrive, X, CheckCircle2, AlertTriangle, Loader2, Film, Image as ImageIcon } from 'lucide-react';
import {
  MediaKind,
  normalizeMediaLink,
  parseDriveId,
  isDrivePreview,
  isInstagramUrl,
  isYouTubeUrl,
  isDirectVideoUrl,
} from '@/lib/media';

type Tab = 'upload' | 'drive' | 'link';

interface MediaInputProps {
  value: string;
  onChange: (url: string) => void;
  /** 'image' = foto, 'video' = video */
  kind?: MediaKind;
  /** Folder penyimpanan: gallery | hero | collage | packages */
  folder?: string;
  label?: string;
  required?: boolean;
  /** Dipanggil saat link video Drive menghasilkan thumbnail otomatis */
  onThumbnail?: (url: string) => void;
  compact?: boolean;
}

const MAX_SERVER_UPLOAD = 4 * 1024 * 1024; // di atas ini coba upload langsung ke Supabase

/** Kompres foto di browser (WebP, sisi terpanjang maks. 2000px) agar website ringan. */
async function compressImage(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 400 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const maxSide = 2000;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.84));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}

function xhrUpload(
  url: string,
  method: 'POST' | 'PUT',
  body: FormData,
  headers: Record<string, string>,
  onProgress: (p: number) => void
): Promise<{ status: number; text: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText });
    xhr.onerror = () => reject(new Error('Koneksi terputus saat upload'));
    xhr.send(body);
  });
}

export default function MediaInput({
  value,
  onChange,
  kind = 'image',
  folder = 'misc',
  label,
  required,
  onThumbnail,
  compact,
}: MediaInputProps) {
  const initialTab: Tab = parseDriveId(value) ? 'drive' : value ? 'link' : 'upload';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [linkInput, setLinkInput] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const requiredRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requiredRef.current?.setCustomValidity(value ? '' : 'Silakan upload atau tempel link media terlebih dahulu');
  }, [value]);

  // Sinkron bila nilai diubah dari luar (mis. form di-reset / mode edit)
  useEffect(() => {
    setLinkInput(value);
    setPreviewBroken(false);
    if (!value) setError(null);
  }, [value]);

  const accept = kind === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif';

  const applyLink = (raw: string) => {
    setError(null);
    const res = normalizeMediaLink(raw, kind);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (tab === 'drive' && raw.trim() && !parseDriveId(raw)) {
      setError('Ini bukan link Google Drive. Gunakan tab "Link URL" untuk link lain.');
      return;
    }
    onChange(res.url);
    if (res.thumbnail && onThumbnail) onThumbnail(res.thumbnail);
  };

  const handleFile = async (picked: File | undefined) => {
    if (!picked) return;
    setError(null);
    const isVideo = picked.type.startsWith('video/');
    if (kind === 'image' && !picked.type.startsWith('image/')) return setError('Pilih file foto (JPG, PNG, WebP).');
    if (kind === 'video' && !isVideo) return setError('Pilih file video (MP4, MOV, WebM).');

    setUploading(true);
    setProgress(0);
    try {
      const file = isVideo ? picked : await compressImage(picked);
      let url = '';

      // File besar → coba upload langsung ke Supabase lewat signed URL (lewati batas ukuran server)
      if (file.size > MAX_SERVER_UPLOAD) {
        const signRes = await fetch('/api/upload?sign=1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: file.name, contentType: file.type, folder }),
        });
        const sign = await signRes.json().catch(() => ({}));
        const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (signRes.ok && sign.success && supaUrl) {
          const fd = new FormData();
          fd.append('cacheControl', '31536000');
          fd.append('', file);
          const headers: Record<string, string> = { 'x-upsert': 'false' };
          const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
          if (anon) headers.apikey = anon;
          const put = await xhrUpload(
            `${supaUrl.replace(/\/$/, '')}/storage/v1/object/upload/sign/${sign.bucket}/${sign.path}?token=${sign.token}`,
            'PUT',
            fd,
            headers,
            setProgress
          );
          if (put.status >= 200 && put.status < 300) url = sign.publicUrl;
        } else if (signRes.status === 401) {
          throw new Error(sign.error || 'Sesi admin berakhir. Silakan login ulang.');
        }
      }

      // Upload lewat server (default untuk foto & file kecil)
      if (!url) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', folder);
        const res = await xhrUpload('/api/upload', 'POST', fd, {}, setProgress);
        let json: { success?: boolean; url?: string; error?: string } = {};
        try {
          json = JSON.parse(res.text);
        } catch {
          json = {
            error:
              res.status === 413
                ? 'File terlalu besar untuk server hosting. Gunakan opsi Link Google Drive.'
                : `Server error (${res.status})`,
          };
        }
        if (!json.success || !json.url) throw new Error(json.error || 'Upload gagal');
        url = json.url;
      }

      onChange(url);
      setProgress(100);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'upload', label: 'Upload File', icon: UploadCloud },
    { id: 'drive', label: 'Google Drive', icon: HardDrive },
    { id: 'link', label: 'Link URL', icon: Link2 },
  ];

  const isVideoValue = kind === 'video' || isDrivePreview(value) || isDirectVideoUrl(value);

  return (
    <div className="relative space-y-2">
      {label && (
        <label className="block font-space font-bold text-[11px] text-slate-700 uppercase tracking-wide">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Tab metode */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
        {tabs.map(({ id, label: l, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setError(null);
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-space font-bold text-[10px] sm:text-[11px] transition-all cursor-pointer ${
              tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{l}</span>
          </button>
        ))}
      </div>

      {/* Isi tab */}
      {tab === 'upload' && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-colors ${
            compact ? 'py-4' : 'py-6'
          } ${dragOver ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50'}`}
        >
          <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          {uploading ? (
            <>
              <Loader2 className="w-6 h-6 text-amber-600 animate-spin" />
              <span className="font-space font-bold text-[11px] text-slate-700">Mengupload… {progress}%</span>
              <div className="w-40 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full bg-amber-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              {kind === 'video' ? <Film className="w-6 h-6 text-slate-400" /> : <UploadCloud className="w-6 h-6 text-slate-400" />}
              <span className="font-space font-bold text-[11px] text-slate-700">
                Klik atau seret {kind === 'video' ? 'video' : 'foto'} ke sini
              </span>
              <span className="font-work text-[10px] text-slate-400">
                {kind === 'video' ? 'MP4 / MOV / WebM • maks. 200 MB' : 'JPG / PNG / WebP • otomatis dikompres'}
              </span>
            </>
          )}
        </div>
      )}

      {tab === 'drive' && (
        <div className="space-y-1.5">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onBlur={() => linkInput !== value && applyLink(linkInput)}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text');
              setTimeout(() => applyLink(text), 0);
            }}
            placeholder="https://drive.google.com/file/d/…/view?usp=sharing"
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-amber-500"
          />
          <p className="font-work text-[10px] text-slate-500 leading-snug">
            Di Google Drive: klik kanan file → <b>Bagikan</b> → ubah akses ke <b>&quot;Siapa saja yang memiliki link&quot;</b> → Salin link.
          </p>
        </div>
      )}

      {tab === 'link' && (
        <input
          type="text"
          value={linkInput}
          onChange={(e) => setLinkInput(e.target.value)}
          onBlur={() => linkInput !== value && applyLink(linkInput)}
          placeholder={
            kind === 'video'
              ? 'https://instagram.com/reel/… • youtube.com/… • https://…/video.mp4'
              : 'https://…/foto.jpg atau /images/foto.png'
          }
          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:border-amber-500"
        />
      )}

      {/* Pesan error */}
      {error && (
        <div className="flex items-start gap-1.5 rounded-lg bg-red-50 border border-red-200 px-2.5 py-2 font-work text-[11px] text-red-700">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Pratinjau hasil */}
      {value && !error && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
          <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
            {isVideoValue ? (
              isDirectVideoUrl(value) ? (
                <video src={`${value}#t=0.5`} muted preload="metadata" className="w-full h-full object-cover" />
              ) : (
                <Film className="w-5 h-5 text-white/70" />
              )
            ) : previewBroken ? (
              <ImageIcon className="w-5 h-5 text-white/50" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="w-full h-full object-cover" onError={() => setPreviewBroken(true)} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1 font-space font-bold text-[10px] text-emerald-700">
              <CheckCircle2 className="w-3 h-3" />
              {isDrivePreview(value) || parseDriveId(value)
                ? 'Google Drive tersambung'
                : isInstagramUrl(value)
                ? 'Link Instagram'
                : isYouTubeUrl(value)
                ? 'Link YouTube'
                : /supabase\.co|^\/uploads\//.test(value)
                ? 'File terupload'
                : 'Link tersimpan'}
            </div>
            <div className="font-mono text-[10px] text-slate-500 truncate">{value}</div>
            {previewBroken && (
              <div className="font-work text-[10px] text-amber-700 mt-0.5">
                Pratinjau gagal dimuat — cek izin berbagi Drive / link gambar.
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              onChange('');
              setLinkInput('');
            }}
            className="shrink-0 w-7 h-7 rounded-full hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer"
            aria-label="Hapus media"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* input tersembunyi agar validasi "required" form tetap jalan */}
      {required && (
        <input
          ref={requiredRef}
          tabIndex={-1}
          aria-hidden="true"
          required
          value={value}
          onChange={() => {}}
          className="absolute opacity-0 pointer-events-none w-px h-px"
        />
      )}
    </div>
  );
}
