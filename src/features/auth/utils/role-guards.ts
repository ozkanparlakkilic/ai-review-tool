import { Role, ROLES } from "@/shared/constants/roles";

export function isAdmin(role: Role | undefined): boolean {
  return role === ROLES.ADMIN;
}

export function isReviewer(role: Role | undefined): boolean {
  return role === ROLES.REVIEWER;
}

export function canAccess(
  role: Role | undefined,
  allowedRoles: Role[]
): boolean {
  if (!role) return false;
  return allowedRoles.includes(role);
}
