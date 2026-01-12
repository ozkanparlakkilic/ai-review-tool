"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { MetricsKPIs } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusBreakdownChartProps {
  kpis?: MetricsKPIs;
  isLoading?: boolean;
}

const chartConfig = {
  status: {
    label: "Status",
  },
  pending: {
    label: "Pending",
    color: "var(--chart-3)",
  },
  approved: {
    label: "Approved",
    color: "var(--chart-1)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function StatusBreakdownChart({
  kpis,
  isLoading,
}: StatusBreakdownChartProps) {
  if (isLoading) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Current review status breakdown</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto aspect-square max-h-[300px] w-full">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!kpis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Current review status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
            No items yet
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = [
    { status: "pending", count: kpis.pending, fill: "var(--color-pending)" },
    {
      status: "approved",
      count: kpis.approved,
      fill: "var(--color-approved)",
    },
    {
      status: "rejected",
      count: kpis.rejected,
      fill: "var(--color-rejected)",
    },
  ].filter((item) => item.count > 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status Distribution</CardTitle>
          <CardDescription>Current review status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
            No items yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Status Distribution</CardTitle>
        <CardDescription>Current review status breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="status" hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="count"
              labelLine={false}
              label={({ payload, ...props }) => {
                return (
                  <text
                    cx={props.cx}
                    cy={props.cy}
                    x={props.x}
                    y={props.y}
                    textAnchor={props.textAnchor}
                    dominantBaseline={props.dominantBaseline}
                    fill="hsla(var(--foreground))"
                  >
                    {payload.count}
                  </text>
                );
              }}
              nameKey="status"
            />
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
