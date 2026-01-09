import { ROLES } from "@/shared/constants/roles";

export const mockAdminSession = {
  user: {
    id: "admin-1",
    name: "Admin User",
    email: "admin@test.com",
    role: ROLES.ADMIN,
  },
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
};

export const mockReviewerSession = {
  user: {
    id: "reviewer-1",
    name: "Reviewer User",
    email: "reviewer@test.com",
    role: ROLES.REVIEWER,
  },
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
};
