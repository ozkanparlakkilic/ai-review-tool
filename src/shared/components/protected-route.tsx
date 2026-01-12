"use client";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { Role } from "@/shared/constants/roles";
import { ForbiddenError } from "./errors/forbidden-error";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (!isLoading && !isAuthenticated) {
    return null;
  }

  if (!isLoading && allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <ForbiddenError />;
  }

  return <>{children}</>;
}
