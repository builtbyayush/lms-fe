'use client';

import { Card } from '@/components/ui/card';
import { useStore } from '@/store';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { formatCurrentMonthLabel, isEmployeeScopedView } from '@/lib/employee-month-scope';

export function Topbar() {
  const { user, role } = useStore();
  const employeeView = isEmployeeScopedView(role);

  return (
    <Card className="p-6 shadow-md border border-border bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-foreground">
            Lead Management System
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            Welcome back, <span className="text-foreground font-semibold">{user?.name || 'User'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {employeeView ? (
            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
              {formatCurrentMonthLabel()}
            </Badge>
          ) : (
            <DateRangePicker />
          )}
          <ThemeToggle />
        </div>
      </div>
    </Card>
  );
}
