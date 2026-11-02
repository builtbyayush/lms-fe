'use client';

import { useMemo } from 'react';
import { getReportingDateRange } from '@/lib/employee-month-scope';
import { useStore } from '@/store';

export function useReportingDateRange() {
  const dateRange = useStore((s) => s.dateRange);
  const role = useStore((s) => s.role);
  return useMemo(() => getReportingDateRange(role, dateRange), [role, dateRange]);
}
