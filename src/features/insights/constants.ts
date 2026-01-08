import { DateRange } from "./types";

export const DATE_RANGES: DateRange[] = ["7d", "30d", "all"];

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  all: "All Time",
};
