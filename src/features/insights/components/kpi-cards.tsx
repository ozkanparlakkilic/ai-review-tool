import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricsKPIs } from "../types";
import {
  FileTextIcon,
  ClockIcon,
  CheckCircle2Icon,
  XCircleIcon,
  TrendingUpIcon,
  TimerIcon,
} from "lucide-react";
import { formatPercentage, formatDuration } from "../utils/metrics-format";

interface KPICardsProps {
  kpis: MetricsKPIs;
}

export function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      title: "Total Items",
      value: kpis.total,
      icon: FileTextIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending",
      value: kpis.pending,
      icon: ClockIcon,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    {
      title: "Approved",
      value: kpis.approved,
      icon: CheckCircle2Icon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Rejected",
      value: kpis.rejected,
      icon: XCircleIcon,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Approval Rate",
      value: formatPercentage(kpis.approvalRate),
      icon: TrendingUpIcon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Avg Review Time",
      value: formatDuration(kpis.avgReviewMinutes),
      icon: TimerIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-muted-foreground text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
