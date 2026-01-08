import { useSession } from "next-auth/react";
import { ROLES } from "@/shared/constants/roles";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const isReviewer = user?.role === ROLES.REVIEWER;
  const isAdmin = user?.role === ROLES.ADMIN;

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    isReviewer,
    isAdmin,
  };
}
