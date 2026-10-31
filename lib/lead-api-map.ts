import { Lead, Sale } from '@/types';

export function toIdString(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object' && v !== null && '$oid' in v) {
    return String((v as { $oid?: string }).$oid || '');
  }
  if (typeof (v as { toString?: () => string }).toString === 'function') {
    const s = (v as { toString: () => string }).toString();
    if (typeof s === 'string' && s && s !== '[object Object]') return s;
  }
  return String(v);
}

const isTrue = (val: unknown): boolean =>
  val === true || val === 'true' || val === 1 || val === '1';

/** Normalizes a lead row from GET /sales/leads (list or by-mobile). */
export function mapLeadFromApi(l: Record<string, unknown>): Lead {
  return {
    ...(l as unknown as Lead),
    id: String(l.id ?? l._id),
    createdBy: toIdString(l.createdBy) || (l.createdBy as string | undefined),
    conversionDate:
      l.conversionDate != null ? String(l.conversionDate) : l.conversionDate,
    paymentInfoShared:
      l.paymentInfoShared === true ||
      l.paymentInfoShared === 'true' ||
      String(l.paymentInfoShared) === 'true',
    gstCustomer:
      l.gstStatus !== undefined
        ? l.gstStatus === 'YES' ||
          l.gstStatus === 'APPLIED' ||
          l.gstStatus === 'APPLIED_THROUGH_US'
        : l.gstCustomer !== undefined
          ? isTrue(l.gstCustomer)
          : isTrue(l.gst),
    gstStatus: l.gstStatus as Lead['gstStatus'],
  } as Lead;
}

export function mapLeadsFromApi(data: unknown): Lead[] {
  if (!Array.isArray(data)) return [];
  return data.map((row) => mapLeadFromApi(row as Record<string, unknown>));
}

/** Same projection as legacy loadSales (converted leads from lead documents). */
export function salesFromLeads(leads: Lead[]): Sale[] {
  return leads
    .filter(
      (item) =>
        isTrue(item.converted) ||
        Number(item.salesAmount || (item as { amount?: number }).amount || 0) >
          0,
    )
    .map((item) => ({
      id: String(item.id),
      leadId: String(item.id),
      influencerId: item.influencerId || '',
      amount: Number(item.salesAmount || (item as { amount?: number }).amount || 0),
      gst:
        item.gstStatus === 'YES' ||
        item.gstStatus === 'APPLIED' ||
        item.gstStatus === 'APPLIED_THROUGH_US' ||
        isTrue(item.gst) ||
        isTrue(item.gstCustomer),
      saleDate:
        item.conversionDate ||
        item.createdAt ||
        item.updatedAt ||
        new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString(),
    }));
}
