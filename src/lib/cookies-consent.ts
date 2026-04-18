export interface CookieConsent {
  essential: true;       // toujours actif
  analytics: boolean;
  marketing: boolean;
}

const KEY = 'lumiere-cookie-consent';

export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveConsent(consent: CookieConsent) {
  localStorage.setItem(KEY, JSON.stringify({ ...consent, essential: true }));
  window.dispatchEvent(new Event('lumiere-consent-change'));
}

export function acceptAll(): void {
  saveConsent({ essential: true, analytics: true, marketing: true });
}

export function refuseAll(): void {
  saveConsent({ essential: true, analytics: false, marketing: false });
}
