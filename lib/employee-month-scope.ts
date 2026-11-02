import { endOfMonth, format, startOfMonth } from 'date-fns';
import type { Role } from '@/types';

export function getCurrentMonthRange(reference = new Date()): { from: Date; to: Date } {
  return { from: startOfMonth(reference), to: endOfMonth(reference) };
}

export function formatCurrentMonthLabel(reference = new Date()): string {
  return format(reference, 'MMMM yyyy');
}

export function isEmployeeScopedView(role: Role | null): boolean {
  return role === 'NON_ADMIN';
}

/** Admins use the global date picker; employees are locked to the calendar month. */
export function getReportingDateRange(
  role: Role | null,
  dateRange: { from?: Date; to?: Date },
): { from?: Date; to?: Date } {
  if (isEmployeeScopedView(role)) {
    return getCurrentMonthRange();
  }
  return dateRange;
}

export function filterSalesByDateRange<T extends { saleDate: string }>(
  rows: T[],
  range: { from?: Date; to?: Date },
): T[] {
  if (!range.from && !range.to) return rows;
  return rows.filter((s) => {
    const d = new Date(s.saleDate);
    d.setHours(0, 0, 0, 0);
    if (range.from) {
      const from = new Date(range.from);
      from.setHours(0, 0, 0, 0);
      if (d < from) return false;
    }
    if (range.to) {
      const to = new Date(range.to);
      to.setHours(23, 59, 59, 999);
      if (d > to) return false;
    }
    return true;
  });
}
