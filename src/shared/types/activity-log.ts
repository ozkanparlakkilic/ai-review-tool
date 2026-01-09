import { Role } from "@/shared/constants/roles";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export enum ActivityAction {
  REVIEW_APPROVED = "REVIEW_APPROVED",
  REVIEW_REJECTED = "REVIEW_REJECTED",
  BULK_APPROVE = "BULK_APPROVE",
  BULK_REJECT = "BULK_REJECT",
  STREAM_STARTED = "STREAM_STARTED",
  STREAM_CANCELLED = "STREAM_CANCELLED",
  USER_LOGIN = "USER_LOGIN",
  USER_LOGOUT = "USER_LOGOUT",
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: ActivityAction;
  targetId?: string;
  groupId?: string;
  metadata?: Record<string, unknown>;
  riskLevel: RiskLevel;
  createdAt: string;
}

export const RISK_LEVELS: Record<ActivityAction, RiskLevel> = {
  [ActivityAction.REVIEW_APPROVED]: "LOW",
  [ActivityAction.REVIEW_REJECTED]: "LOW",
  [ActivityAction.BULK_APPROVE]: "MEDIUM",
  [ActivityAction.BULK_REJECT]: "HIGH",
  [ActivityAction.STREAM_STARTED]: "LOW",
  [ActivityAction.STREAM_CANCELLED]: "MEDIUM",
  [ActivityAction.USER_LOGIN]: "LOW",
  [ActivityAction.USER_LOGOUT]: "LOW",
};
