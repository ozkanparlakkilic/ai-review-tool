import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewStatus } from "@/shared/types";
import { REVIEW_STATUSES, STATUS_LABELS } from "../constants";

interface StatusFilterProps {
  value: ReviewStatus;
  onChange: (value: ReviewStatus) => void;
}

export function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <Tabs value={value} onValueChange={(val) => onChange(val as ReviewStatus)}>
      <TabsList>
        {REVIEW_STATUSES.map((status) => (
          <TabsTrigger key={status} value={status}>
            {STATUS_LABELS[status]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
