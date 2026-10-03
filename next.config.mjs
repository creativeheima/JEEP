/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    // Domain foto dari luar (Google Drive & Supabase Storage) — dibutuhkan bila optimasi gambar diaktifkan
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'drive.google.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
