import React from "react";
import { Badge } from "@/components/ui/badge";
import { ReviewStatus } from "@/shared/types";
import {
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/features/review/queue/constants";

interface StatusBadgeProps {
  status: ReviewStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>;
}
