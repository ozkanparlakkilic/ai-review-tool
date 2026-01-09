export function formatPercentage(value: number): string {
  return `${value}%`;
}

export function formatDuration(minutes: number | null): string {
  if (minutes === null) return "—";
  return `${minutes}m`;
}

export function calculateApprovalRate(approved: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((approved / total) * 100);
}
