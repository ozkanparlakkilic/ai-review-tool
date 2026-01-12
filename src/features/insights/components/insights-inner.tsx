"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AppShell } from "@/shared/components/app-shell";
import { useInsights } from "@/features/insights/hooks/useInsights";
import { InsightsHeader } from "@/features/insights/components/insights-header";
import { KPICards } from "@/features/insights/components/kpi-cards";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRange } from "@/features/insights/types";

const ReviewsTrendChart = dynamic(
  () =>
    import("@/features/insights/components/reviews-trend-chart").then(
      (mod) => ({ default: mod.ReviewsTrendChart })
    ),
  {
    ssr: false,
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Reviews Trend</CardTitle>
          <CardDescription>Daily approved and rejected reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    ),
  }
);

const StatusBreakdownChart = dynamic(
  () =>
    import("@/features/insights/components/status-breakdown-chart").then(
      (mod) => ({ default: mod.StatusBreakdownChart })
    ),
  {
    ssr: false,
    loading: () => (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Current review status breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <Skeleton className="mx-auto aspect-square max-h-[300px] w-full rounded-full" />
        </CardContent>
      </Card>
    ),
  }
);

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
