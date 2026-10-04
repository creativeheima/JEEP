import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Superuser Portal',
  description: 'Pusat Kontrol Database & Manajemen Akun Super Admin Merapi Jeep Adventure',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function SuperuserLayout({ children }: { children: React.ReactNode }) {
  return children;
}
