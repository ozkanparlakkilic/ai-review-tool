"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Role } from "@/shared/constants/roles";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Middleware handles the primary authentication check and redirection to /login.
  // This component now only handles client-side role checks and loading states.

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[300px]" />
          <Skeleton className="h-[400px] w-full max-w-4xl" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <ForbiddenError />;
  }

  return <>{children}</>;
}
