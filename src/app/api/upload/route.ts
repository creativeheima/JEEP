import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Upload foto/video dari halaman admin.
 * - Bila Supabase terkonfigurasi → disimpan di Supabase Storage (bucket "media", publik).
 * - Bila tidak → disimpan ke folder public/uploads (hanya untuk development / server biasa).
 *
 * Mode:
 *   POST multipart/form-data { file, folder }           → upload langsung lewat server
 *   POST ?sign=1  JSON { fileName, contentType, folder } → minta signed URL untuk file besar
 *                                                          (browser upload langsung ke Supabase)
 */

export const runtime = 'nodejs';

const BUCKET = 'media';
const MAX_IMAGE = 15 * 1024 * 1024; // 15 MB
const MAX_VIDEO = 200 * 1024 * 1024; // 200 MB
const ALLOWED_FOLDERS = ['gallery', 'hero', 'collage', 'packages', 'misc'];

const usingServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

/** Pesan error Supabase yang mudah dipahami admin. */
function explainStorageError(message: string): string {
  if (/row-level security|not authorized|unauthorized|403/i.test(message)) {
    return usingServiceRole
      ? `Supabase menolak upload (izin storage): ${message}`
      : 'Supabase menolak upload karena server memakai ANON KEY. Isi SUPABASE_SERVICE_ROLE_KEY di .env.local / environment hosting, lalu restart server.';
  }
  if (/bucket not found/i.test(message)) {
    return 'Bucket "media" belum ada. Jalankan bagian "8. STORAGE" di supabase/schema.sql lewat SQL Editor Supabase, atau isi SUPABASE_SERVICE_ROLE_KEY agar dibuat otomatis.';
  }
  return `Supabase Storage: ${message}`;
}

/** Buat bucket hanya bila memang belum ada (butuh service role key). */
async function createBucketIfPossible() {
  if (!supabase) return false;
  const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
  return !error || /already exists/i.test(error.message);
}

function isAdmin(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  return /(?:^|;\s*)mja_admin_token=mja_[^;]+/.test(cookie);
}

function buildPath(folder: string, fileName: string) {
  const safeFolder = ALLOWED_FOLDERS.includes(folder) ? folder : 'misc';
  const ext = (fileName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
  const base = fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'file';
  return `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${base}.${ext}`;
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, error: 'Sesi admin berakhir. Silakan login ulang.' }, { status: 401 });
  }

  const url = new URL(request.url);

  try {
    // ---------- Mode signed URL (file besar, khususnya video) ----------
    if (url.searchParams.get('sign') === '1') {
      if (!isSupabaseConfigured() || !supabase) {
        return NextResponse.json({ success: false, error: 'SIGNED_UNAVAILABLE' }, { status: 400 });
      }
      const { fileName, contentType, folder } = await request.json();
      if (!/^(image|video)\//.test(String(contentType))) {
        return NextResponse.json({ success: false, error: 'Hanya file foto atau video yang diizinkan' }, { status: 400 });
      }
      const filePath = buildPath(String(folder || 'misc'), String(fileName || 'file'));
      let { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(filePath);
      if (error && /bucket not found/i.test(error.message) && (await createBucketIfPossible())) {
        ({ data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(filePath));
      }
      if (error || !data) throw new Error(explainStorageError(error?.message || 'Gagal membuat signed URL'));
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      return NextResponse.json({ success: true, mode: 'signed', bucket: BUCKET, path: filePath, token: data.token, publicUrl: pub.publicUrl });
    }

    // ---------- Mode upload langsung ----------
    const form = await request.formData();
    const file = form.get('file');
    const folder = String(form.get('folder') || 'misc');

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'File tidak ditemukan' }, { status: 400 });
    }
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) {
      return NextResponse.json({ success: false, error: 'Format tidak didukung. Gunakan JPG, PNG, WebP, MP4, atau MOV.' }, { status: 400 });
    }
    if ((isImage && file.size > MAX_IMAGE) || (isVideo && file.size > MAX_VIDEO)) {
      return NextResponse.json(
        { success: false, error: `Ukuran file terlalu besar (maks. ${isImage ? '15' : '200'} MB).` },
        { status: 413 }
      );
    }

    const filePath = buildPath(folder, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());

    if (isSupabaseConfigured() && supabase) {
      const doUpload = () =>
        supabase!.storage.from(BUCKET).upload(filePath, buffer, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: false,
        });
      let { error } = await doUpload();
      if (error && /bucket not found/i.test(error.message) && (await createBucketIfPossible())) {
        ({ error } = await doUpload());
      }
      if (error) throw new Error(explainStorageError(error.message));
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      return NextResponse.json({ success: true, url: data.publicUrl, storage: 'supabase' }, { status: 201 });
    }

    // Fallback lokal (development / VPS)
    try {
      const dest = path.join(process.cwd(), 'public', 'uploads', filePath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, buffer);
      return NextResponse.json({ success: true, url: `/uploads/${filePath}`, storage: 'local' }, { status: 201 });
    } catch (localErr) {
      console.error('[upload] local storage fallback error:', localErr);
      throw new Error(
        'Server tidak bisa menyimpan file. Hubungkan Supabase (isi env SUPABASE) atau gunakan opsi Link Google Drive.'
      );
    }
  } catch (error) {
    console.error('[upload] error:', error);
    const message = error instanceof Error ? error.message : 'Upload gagal';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
