import type { Lead, Sale } from '@/types';

/**
 * Stable conversion instant for reporting: persisted conversionDate, else linked saleDate, else updatedAt.
 */
export function effectiveConversionDate(lead: Lead, sales: Sale[]): Date | null {
  if (!lead.converted) return null;
  if (lead.conversionDate) return new Date(lead.conversionDate);
  const sale = sales.find((s) => String(s.leadId) === String(lead.id));
  if (sale?.saleDate) return new Date(sale.saleDate);
  return lead.updatedAt ? new Date(lead.updatedAt) : null;
}

export function isConversionInDateRange(
  lead: Lead,
  sales: Sale[],
  from: Date | undefined,
  to: Date | undefined,
): boolean {
  const conv = effectiveConversionDate(lead, sales);
  if (!conv) return false;
  if (from) {
    const f = new Date(from);
    f.setHours(0, 0, 0, 0);
    if (conv < f) return false;
  }
  if (to) {
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    if (conv > t) return false;
  }
  return true;
}

export function isCreatedInDateRange(
  lead: Lead,
  from: Date | undefined,
  to: Date | undefined,
): boolean {
  const d = new Date(lead.createdAt);
  d.setHours(0, 0, 0, 0);
  if (from) {
    const f = new Date(from);
    f.setHours(0, 0, 0, 0);
    if (d < f) return false;
  }
  if (to) {
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    if (d > t) return false;
  }
  return true;
}

/** Local calendar day at midnight (no time component). */
export function localCalendarDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Non-converted lead with a follow-up on or before today (includes overdue / carry-forward).
 * 1★ leads are excluded — treated as not interested and not part of the daily follow-up queue.
 */
/**
 * Admin/sales KPI cards: prefer API (Sale collection) when it reports activity;
 * if API returns 0 but client derived converted rows from leads, use client (legacy sync).
 */
export function mergeKpiWithLeadFallback(
  apiValue: number | undefined,
  clientValue: number,
): number {
  if (apiValue != null && apiValue > 0) return apiValue;
  if (clientValue > 0) return clientValue;
  return apiValue ?? clientValue ?? 0;
}

export function isFollowUpDueOnOrBeforeToday(lead: {
  followUpDate: string | null;
  converted: boolean;
  rating?: number | null;
}): boolean {
  if (lead.converted || !lead.followUpDate) return false;
  if (lead.rating === 1) return false;
  const due = localCalendarDay(new Date(lead.followUpDate));
  const today = localCalendarDay(new Date());
  return due.getTime() <= today.getTime();
}
