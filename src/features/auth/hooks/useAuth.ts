import { useSession } from "next-auth/react";
import { isAdmin, isReviewer } from "../utils/role-guards";

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  const isReviewerUser = isReviewer(user?.role);
  const isAdminUser = isAdmin(user?.role);

  return {
    session,
    user,
    isAuthenticated,
    isLoading,
    isReviewer: isReviewerUser,
    isAdmin: isAdminUser,
  };
}
