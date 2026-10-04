import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/apiAuth';
import { getSiteSettings, saveSiteSettings } from '@/lib/settingsStore';

export const dynamic = 'force-dynamic';

/** Publik: dipakai website untuk tombol & pesan WhatsApp. */
export async function GET() {
  const data = await getSiteSettings();
  return NextResponse.json({ success: true, data }, { headers: { 'Cache-Control': 'no-store' } });
}

/** Admin: ubah pengaturan. */
export async function PUT(request: Request) {
  const auth = await requireSession(request);
  if (auth instanceof NextResponse) return auth;
  try {
    const body = await request.json().catch(() => ({}));
    const { value, warning } = await saveSiteSettings({ whatsapp: String(body?.whatsapp || '') });
    return NextResponse.json({ success: true, data: value, warning });
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 400 });
  }
}
