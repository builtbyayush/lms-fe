'use client';

import { CalendarDays } from 'lucide-react';
import { formatCurrentMonthLabel, isEmployeeScopedView } from '@/lib/employee-month-scope';
import { useStore } from '@/store';

export function EmployeeMonthScopeBanner() {
  const role = useStore((s) => s.role);
  if (!isEmployeeScopedView(role)) return null;

  const label = formatCurrentMonthLabel();

  return (
    <div
      className="mb-6 flex items-center gap-3 rounded-lg border border-sky-200/80 bg-sky-50/90 dark:bg-sky-950/40 dark:border-sky-900/60 px-4 py-3 text-sm"
      role="status"
    >
      <CalendarDays className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
      <p className="text-foreground">
        <span className="font-semibold">Showing data for {label}.</span>{' '}
        <span className="text-muted-foreground">
          Leads, sales, and dashboard numbers are limited to this month.
        </span>
      </p>
    </div>
  );
}
