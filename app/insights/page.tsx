"use client";

import { useState } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { ProtectedRoute } from "@/shared/components/protected-route";
import { ROLES } from "@/shared/constants/roles";
import { useInsights } from "@/features/insights/hooks/useInsights";
import { InsightsHeader } from "@/features/insights/components/insights-header";
import { KPICards } from "@/features/insights/components/kpi-cards";
import { ReviewsTrendChart } from "@/features/insights/components/reviews-trend-chart";
import { StatusBreakdownChart } from "@/features/insights/components/status-breakdown-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "@/features/insights/types";

export default function InsightsPage() {
  const [range, setRange] = useState<DateRange>("7d");
  const { metrics, loading, error } = useInsights(range);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AppShell>
          <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[400px]" />
            </div>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  if (error || !metrics) {
    return (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
        <AppShell>
          <div className="py-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">Error Loading Insights</h2>
            <p className="text-muted-foreground">
              Failed to load insights data. Please try again later.
            </p>
          </div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <AppShell>
        <div className="space-y-6">
          <InsightsHeader range={range} onRangeChange={setRange} />
          <KPICards kpis={metrics.kpis} />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="lg:col-span-4">
              <ReviewsTrendChart daily={metrics.daily} range={range} />
            </div>
            <div className="lg:col-span-3">
              <StatusBreakdownChart kpis={metrics.kpis} />
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
