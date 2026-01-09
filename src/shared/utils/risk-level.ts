import { ActivityAction, RiskLevel, RISK_LEVELS } from "../types/activity-log";

export function deriveRiskLevel(action: ActivityAction): RiskLevel {
  return RISK_LEVELS[action] || "LOW";
}
