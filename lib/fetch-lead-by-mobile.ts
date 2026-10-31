import { API_BASE_URL } from '@/lib/api';
import { mapLeadFromApi } from '@/lib/lead-api-map';
import { Lead } from '@/types';

/** Lookup one lead by mobile (backend normalizes +91 / 10-digit variants). */
export async function fetchLeadByMobile(
  mobile: string,
  token: string | null,
): Promise<Lead | null> {
  const digits = (mobile || '').replace(/\D/g, '');
  if (digits.length < 10) return null;

  const tryMobile = digits.slice(-10);
  const candidates = [
    tryMobile,
    `+91${tryMobile}`,
    `91${tryMobile}`,
    `0${tryMobile}`,
    mobile.trim(),
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  for (const m of candidates) {
    const res = await fetch(
      `${API_BASE_URL}/sales/leads/by-mobile?mobile=${encodeURIComponent(m)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );
    if (res.status === 404) continue;
    if (!res.ok) return null;
    const raw = (await res.json()) as Record<string, unknown>;
    return mapLeadFromApi(raw);
  }
  return null;
}
