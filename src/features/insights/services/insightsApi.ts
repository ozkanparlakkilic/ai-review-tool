import { http } from "@/shared/services/http";
import { MetricsResponse, DateRange } from "../types";

export async function getMetrics(range: DateRange): Promise<MetricsResponse> {
  return http<MetricsResponse>(`/metrics?range=${range}`);
}
