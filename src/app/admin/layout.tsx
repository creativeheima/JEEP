import type { Metadata } from 'next';

// Halaman admin tidak boleh muncul di Google
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
