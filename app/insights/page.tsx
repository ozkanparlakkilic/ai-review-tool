"use client";

import React, { useState } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { InsightsHeader } from "@/features/insights/components/insights-header";
import { KPICards } from "@/features/insights/components/kpi-cards";
import { ReviewsTrendChart } from "@/features/insights/components/reviews-trend-chart";
import { StatusBreakdownChart } from "@/features/insights/components/status-breakdown-chart";
import { useInsights } from "@/features/insights/hooks/useInsights";
import { DateRange } from "@/features/insights/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsPage() {
  const [range, setRange] = useState<DateRange>("7d");
  const { metrics, loading, error } = useInsights(range);

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-32" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !metrics) {
    return (
      <AppShell>
        <div className="py-12 text-center">
          <h2 className="mb-2 text-2xl font-bold">Error Loading Insights</h2>
          <p className="text-muted-foreground">
            {error ? error.message : "Failed to load metrics"}
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <InsightsHeader range={range} onRangeChange={setRange} />
      <KPICards kpis={metrics.kpis} />
      <div className="grid gap-6 md:grid-cols-2">
        <ReviewsTrendChart daily={metrics.daily} range={range} />
        <StatusBreakdownChart kpis={metrics.kpis} />
      </div>
    </AppShell>
  );
}
