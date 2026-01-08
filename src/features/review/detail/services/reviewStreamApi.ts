import { http } from "@/shared/services/http";

export interface StreamConfig {
  chunks: string[];
  delayMs: number;
}

export async function getStreamConfig(id: string): Promise<StreamConfig> {
  return http<StreamConfig>(`/review-items/${id}/stream`);
}
