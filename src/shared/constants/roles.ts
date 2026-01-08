export const ROLES = {
  REVIEWER: "REVIEWER",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
