'use client';

import { useEffect, useState } from 'react';
import { SITE } from '@/lib/site';
import { formatPhoneIntl, formatPhoneLocal } from '@/lib/phone';

export interface ContactInfo {
  whatsapp: string; // 62xxxxxxxxxx
  phone: string; // +62 812-3456-7890
  phoneLocal: string; // 0812-3456-7890
}

function toContact(whatsapp: string): ContactInfo {
  return { whatsapp, phone: formatPhoneIntl(whatsapp), phoneLocal: formatPhoneLocal(whatsapp) };
}

let current: ContactInfo = toContact(SITE.whatsapp);
let request: Promise<ContactInfo> | null = null;
const listeners = new Set<(c: ContactInfo) => void>();

function load(force = false): Promise<ContactInfo> {
  if (!request || force) {
    request = fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => {
        if (j?.success && j.data?.whatsapp) current = toContact(j.data.whatsapp);
        listeners.forEach((fn) => fn(current));
        return current;
      })
      .catch(() => current);
  }
  return request;
}

/** Nomor WhatsApp admin terbaru (diatur di dashboard admin). Diambil sekali per kunjungan. */
export function useSiteSettings(): ContactInfo {
  const [contact, setContact] = useState<ContactInfo>(current);
  useEffect(() => {
    listeners.add(setContact);
    load().then(setContact);
    return () => {
      listeners.delete(setContact);
    };
  }, []);
  return contact;
}

/** Dipanggil admin setelah menyimpan agar komponen lain ikut terbarui. */
export function refreshSiteSettings() {
  return load(true);
}
