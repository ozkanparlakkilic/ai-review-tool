import { describe, it, expect } from "vitest";
import {
  isAdmin,
  isReviewer,
  canAccess,
} from "@/features/auth/utils/role-guards";
import { ROLES } from "@/shared/constants/roles";

describe("roleGuards", () => {
  describe("isAdmin", () => {
    it("returns true for admin role", () => {
      expect(isAdmin(ROLES.ADMIN)).toBe(true);
    });

    it("returns false for reviewer role", () => {
      expect(isAdmin(ROLES.REVIEWER)).toBe(false);
    });

    it("returns false for undefined role", () => {
      expect(isAdmin(undefined)).toBe(false);
    });
  });

  describe("isReviewer", () => {
    it("returns true for reviewer role", () => {
      expect(isReviewer(ROLES.REVIEWER)).toBe(true);
    });

    it("returns false for admin role", () => {
      expect(isReviewer(ROLES.ADMIN)).toBe(false);
    });
  });

  describe("canAccess", () => {
    it("returns true if role is in allowed roles", () => {
      expect(canAccess(ROLES.ADMIN, [ROLES.ADMIN, ROLES.REVIEWER])).toBe(true);
    });

    it("returns false if role is not in allowed roles", () => {
      expect(canAccess(ROLES.REVIEWER, [ROLES.ADMIN])).toBe(false);
    });

    it("returns false for undefined role", () => {
      expect(canAccess(undefined, [ROLES.ADMIN])).toBe(false);
    });
  });
});
