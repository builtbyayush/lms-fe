import { API_BASE_URL } from '@/lib/api';
import { mapLeadFromApi } from '@/lib/lead-api-map';
import { Lead } from '@/types';

export type MobileLeadCheckStatus = 'available' | 'owned_by_self' | 'owned_by_other';

export interface MobileLeadCheckResult {
  status: MobileLeadCheckStatus;
  leadId?: string;
  leadName?: string;
}

/** Real-time duplicate check while typing mobile on create (includes other-owner case). */
export async function checkLeadMobileAvailability(
  mobile: string,
  token: string | null,
): Promise<MobileLeadCheckResult | null> {
  const digits = (mobile || '').replace(/\D/g, '');
  if (digits.length < 10) return null;

  const res = await fetch(
    `${API_BASE_URL}/sales/leads/check-mobile?mobile=${encodeURIComponent(mobile.trim())}`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  );
  if (!res.ok) return null;
  return (await res.json()) as MobileLeadCheckResult;
}

export async function fetchLeadById(leadId: string, token: string | null): Promise<Lead | null> {
  const res = await fetch(`${API_BASE_URL}/sales/leads/${leadId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) return null;
  const raw = (await res.json()) as Record<string, unknown>;
  return mapLeadFromApi(raw);
}
