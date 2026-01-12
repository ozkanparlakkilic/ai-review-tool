"use client";

import { useState } from "react";
import { AppShell } from "@/shared/components/app-shell";
import { useInsights } from "@/features/insights/hooks/useInsights";
import { InsightsHeader } from "@/features/insights/components/insights-header";
import { KPICards } from "@/features/insights/components/kpi-cards";
import { ReviewsTrendChart } from "@/features/insights/components/reviews-trend-chart";
import { StatusBreakdownChart } from "@/features/insights/components/status-breakdown-chart";
import { DateRange } from "@/features/insights/types";

export function InsightsInner() {
  const [range, setRange] = useState<DateRange>("7d");
  const { metrics, loading, error } = useInsights(range);

  return (
    <AppShell>
      <div className="space-y-6">
        <InsightsHeader range={range} onRangeChange={setRange} />
        
        {error && !loading ? (
          <div className="py-12 text-center">
            <h2 className="mb-2 text-2xl font-bold">Error Loading Insights</h2>
            <p className="text-muted-foreground">
              Failed to load insights data. Please try again later.
            </p>
          </div>
        ) : (
          <>
            <KPICards kpis={metrics?.kpis} isLoading={loading} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <div className="lg:col-span-4">
                <ReviewsTrendChart 
                  daily={metrics?.daily} 
                  range={range} 
                  isLoading={loading}
                />
              </div>
              <div className="lg:col-span-3">
                <StatusBreakdownChart 
                  kpis={metrics?.kpis} 
                  isLoading={loading}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
