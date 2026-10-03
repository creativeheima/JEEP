import type { Metadata } from 'next';

// Invoice berisi data pemesan — jangan diindeks mesin pencari
export const metadata: Metadata = {
  title: 'Invoice',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function InvoiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
