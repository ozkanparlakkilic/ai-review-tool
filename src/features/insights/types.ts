export type DateRange = "7d" | "30d" | "all";

export interface MetricsKPIs {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  approvalRate: number;
  avgReviewMinutes: number | null;
}

export interface DailyMetrics {
  date: string;
  approved: number;
  rejected: number;
  pending: number;
  reviewed: number;
}

export interface MetricsResponse {
  range: DateRange;
  kpis: MetricsKPIs;
  daily: DailyMetrics[];
}
