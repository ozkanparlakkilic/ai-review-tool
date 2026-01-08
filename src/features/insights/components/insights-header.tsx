import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRange } from "../types";
import { DATE_RANGE_LABELS, DATE_RANGES } from "../constants";

interface InsightsHeaderProps {
  range: DateRange;
  onRangeChange: (range: DateRange) => void;
}

export function InsightsHeader({ range, onRangeChange }: InsightsHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-3xl font-bold">Insights</h2>
      <p className="text-muted-foreground mt-1 mb-4">
        Review activity and quality signals
      </p>

      <Tabs
        value={range}
        onValueChange={(val) => onRangeChange(val as DateRange)}
      >
        <TabsList>
          {DATE_RANGES.map((r) => (
            <TabsTrigger key={r} value={r}>
              {DATE_RANGE_LABELS[r]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
