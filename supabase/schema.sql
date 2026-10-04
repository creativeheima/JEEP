-- =================================================================
-- SKEMA DATABASE SUPABASE: JEEP MERAPI ADVENTURE
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query
-- =================================================================

-- 1. Buat Tabel bookings
create table if not exists public.bookings (
  id text primary key,
  booking_code text unique not null,
  customer_name text not null,
  customer_phone text not null,
  package_name text not null,
  tour_date text not null,
  tour_time text not null,
  pax_count integer not null default 1,
  jeep_count integer not null default 1,
  total_amount numeric not null default 0,
  dp_amount numeric not null default 0,
  remaining_amount numeric not null default 0,
  payment_method text not null default 'Transfer BCA / Bank',
  payment_status text not null default 'MENUNGGU_PEMBAYARAN',
  approval_status text not null default 'PENDING',
  driver_name text default 'Menunggu Penugasan Driver',
  jeep_number text default '-',
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  approved_at timestamp with time zone
);

-- 2. Index untuk Query Cepat
create index if not exists idx_bookings_code on public.bookings (booking_code);
create index if not exists idx_bookings_phone on public.bookings (customer_phone);
create index if not exists idx_bookings_status on public.bookings (approval_status);
create index if not exists idx_bookings_created on public.bookings (created_at desc);

-- 3. Row Level Security (RLS) & Hak Akses
grant all on table public.bookings to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

alter table public.bookings enable row level security;

-- Policy agar client web bisa memasukkan booking baru (Insert)
drop policy if exists "Allow public insert" on public.bookings;
create policy "Allow public insert" 
on public.bookings for insert 
with check (true);

-- Policy agar client dan admin bisa membaca data booking (Select)
drop policy if exists "Allow public select" on public.bookings;
create policy "Allow public select" 
on public.bookings for select 
using (true);

-- Policy agar update status dan pelunasan diizinkan (Update)
drop policy if exists "Allow public update" on public.bookings;
create policy "Allow public update" 
on public.bookings for update 
using (true);

-- Policy agar delete diizinkan (Delete)
drop policy if exists "Allow public delete" on public.bookings;
create policy "Allow public delete" 
on public.bookings for delete 
using (true);

-- =================================================================
-- CONTOH DATA AWAL (Opsional / Dummy Data)
-- =================================================================
insert into public.bookings (
  id, booking_code, customer_name, customer_phone, package_name, 
  tour_date, tour_time, pax_count, jeep_count, total_amount, 
  dp_amount, remaining_amount, payment_method, payment_status, 
  approval_status, driver_name, jeep_number, notes
) values 
(
  'bkg-demo-1', 'MJA-2026-088', 'Ahmad Fauzi & Rombongan', '081298765432', 'Paket Sunrise',
  '2026-10-05', '04:30 WIB', 6, 2, 1100000,
  0, 1100000, 'Transfer BCA', 'MENUNGGU_PEMBAYARAN',
  'PENDING', 'Belum Ditugaskan', '-', 'Sudah chat di WA, menanyakan kesiapan armada fajar'
),
(
  'bkg-demo-2', 'MJA-2026-001', 'Bagus Pratama', '081234567891', 'Paket Medium',
  '2026-10-02', '09:00 WIB', 4, 1, 500000,
  150000, 350000, 'Transfer BCA', 'DP_DITERIMA',
  'APPROVED', 'Mas Agus (Unit 12)', 'AB 1928 MJ', 'Minta foto cinematic di Kali Kuning'
)
on conflict (id) do nothing;

-- =================================================================
-- 4. TABEL GALERI & VIDEO INSTAGRAM (public.gallery_items)
-- =================================================================
create table if not exists public.gallery_items (
  id text primary key,
  type text not null default 'PHOTO', -- 'PHOTO' atau 'INSTAGRAM_VIDEO'
  title text not null,
  category text not null default 'JEEP ACTION',
  media_url text not null,
  instagram_url text,
  thumbnail_url text,
  caption text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

grant all on table public.gallery_items to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

alter table public.gallery_items enable row level security;

drop policy if exists "Allow public select gallery" on public.gallery_items;
create policy "Allow public select gallery" on public.gallery_items for select using (true);

drop policy if exists "Allow public insert gallery" on public.gallery_items;
create policy "Allow public insert gallery" on public.gallery_items for insert with check (true);

drop policy if exists "Allow public delete gallery" on public.gallery_items;
create policy "Allow public delete gallery" on public.gallery_items for delete using (true);

-- =================================================================
-- 5. TABEL SLIDESHOW BERANDA (public.hero_slides) - MAKSIMAL 5 FOTO
-- =================================================================
create table if not exists public.hero_slides (
  id text primary key,
  image_url text not null,
  title text not null default '',
  show_text boolean not null default true,
  headline text,
  subheadline text,
  show_button boolean not null default true,
  order_index integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migrasi kolom jika tabel sudah pernah dibuat sebelumnya:
alter table public.hero_slides add column if not exists show_text boolean not null default true;
alter table public.hero_slides add column if not exists headline text;
alter table public.hero_slides add column if not exists subheadline text;
alter table public.hero_slides add column if not exists show_button boolean not null default true;

grant all on table public.hero_slides to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

alter table public.hero_slides enable row level security;

drop policy if exists "Allow public select hero_slides" on public.hero_slides;
create policy "Allow public select hero_slides" on public.hero_slides for select using (true);

drop policy if exists "Allow public insert hero_slides" on public.hero_slides;
create policy "Allow public insert hero_slides" on public.hero_slides for insert with check (true);

drop policy if exists "Allow public update hero_slides" on public.hero_slides;
create policy "Allow public update hero_slides" on public.hero_slides for update using (true);

drop policy if exists "Allow public delete hero_slides" on public.hero_slides;
create policy "Allow public delete hero_slides" on public.hero_slides for delete using (true);





-- =================================================================
-- 8. STORAGE: UPLOAD FOTO & VIDEO DARI HALAMAN ADMIN (bucket "media")
--    Dipakai oleh fitur "Upload File" di admin (galeri, slide, collage, paket).
--    Disarankan mengisi SUPABASE_SERVICE_ROLE_KEY di environment server.
-- =================================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 209715200) -- 200 MB per file
on conflict (id) do update set public = true, file_size_limit = 209715200;

-- Semua orang boleh MELIHAT file media (untuk ditampilkan di website)
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media"
on storage.objects for select
using (bucket_id = 'media');

-- -----------------------------------------------------------------
-- OPSIONAL (TIDAK DISARANKAN): hanya bila Anda TIDAK mau memakai
-- SUPABASE_SERVICE_ROLE_KEY. Policy ini membuat siapa pun yang memegang
-- anon key (yang memang terlihat publik di browser) bisa upload ke bucket "media".
-- -----------------------------------------------------------------
-- drop policy if exists "Anon upload media" on storage.objects;
-- create policy "Anon upload media"
-- on storage.objects for insert
-- with check (bucket_id = 'media');

-- =================================================================
-- 9. AKUN ADMIN (public.admin_accounts)
--    Password disimpan sebagai HASH (scrypt), bukan teks asli.
--    Tidak ada policy publik → hanya bisa diakses server dengan SERVICE ROLE KEY.
-- =================================================================
create table if not exists public.admin_accounts (
  id text primary key,
  username text unique not null,
  name text not null default '',
  email text unique not null,
  role text not null default 'ADMIN',          -- 'SUPERUSER' | 'ADMIN'
  password_hash text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone
);
alter table public.admin_accounts enable row level security;
revoke all on table public.admin_accounts from anon, authenticated;
grant all on table public.admin_accounts to service_role;

-- =================================================================
-- 10. PENGETATAN KEAMANAN (WAJIB DIJALANKAN)
--     Sebelumnya siapa pun yang memegang anon key bisa membaca/mengubah/menghapus
--     data booking langsung lewat API Supabase (melewati website).
--     Sekarang semua penulisan & data booking hanya lewat server (SERVICE ROLE KEY).
--     → Pastikan SUPABASE_SERVICE_ROLE_KEY sudah diisi di environment server.
-- =================================================================
-- Booking: data pribadi pelanggan → tidak ada akses publik sama sekali
drop policy if exists "Allow public insert" on public.bookings;
drop policy if exists "Allow public select" on public.bookings;
drop policy if exists "Allow public update" on public.bookings;
drop policy if exists "Allow public delete" on public.bookings;
revoke all on table public.bookings from anon, authenticated;

-- Galeri & slide: boleh DIBACA publik, tapi tidak boleh diubah dari luar server
drop policy if exists "Allow public insert gallery" on public.gallery_items;
drop policy if exists "Allow public delete gallery" on public.gallery_items;
drop policy if exists "Allow public insert hero_slides" on public.hero_slides;
drop policy if exists "Allow public update hero_slides" on public.hero_slides;
drop policy if exists "Allow public delete hero_slides" on public.hero_slides;
revoke insert, update, delete on table public.gallery_items from anon, authenticated;
revoke insert, update, delete on table public.hero_slides from anon, authenticated;


-- =================================================================
-- 11. SITE SETTINGS (nomor WhatsApp admin, diatur dari Dashboard Admin)
--     Dibaca & ditulis oleh server memakai SUPABASE_SERVICE_ROLE_KEY.
-- =================================================================
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
revoke all on table public.site_settings from anon, authenticated;
