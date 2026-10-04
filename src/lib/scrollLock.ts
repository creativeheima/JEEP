/**
 * Kunci scroll halaman dengan penghitung, agar beberapa popup (galeri, mode foto, form booking)
 * tidak saling menimpa. Scroll baru dibuka lagi setelah SEMUA popup ditutup.
 */
let locks = 0;

export function lockScroll(): () => void {
  if (typeof document === 'undefined') return () => {};
  locks += 1;
  document.body.style.overflow = 'hidden';
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.body.style.overflow = '';
  };
}
