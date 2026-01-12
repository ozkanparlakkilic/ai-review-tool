"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { DailyMetrics, DateRange } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewsTrendChartProps {
  daily?: DailyMetrics[];
  range: DateRange;
  isLoading?: boolean;
}

const chartConfig = {
  approved: {
    label: "Approved",
    color: "var(--chart-1)",
  },
  rejected: {
    label: "Rejected",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ReviewsTrendChart({
  daily,
  range,
  isLoading,
}: ReviewsTrendChartProps) {
  if (range === "all") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews Trend</CardTitle>
          <CardDescription>Daily approved and rejected reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
            Daily trend chart not available for all time range
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews Trend</CardTitle>
          <CardDescription>Daily approved and rejected reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!daily || daily.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews Trend</CardTitle>
          <CardDescription>Daily approved and rejected reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-[250px] items-center justify-center text-sm">
            No review data yet for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = daily.map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    approved: d.approved,
    rejected: d.rejected,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviews Trend</CardTitle>
        <CardDescription>Daily approved and rejected reviews</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-none h-[250px] w-full"
        >
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="approved" fill="var(--color-approved)" radius={4} />
            <Bar dataKey="rejected" fill="var(--color-rejected)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
