import { describe, it, expect } from "vitest";
import { authOptions } from "@/features/auth/auth";
import { ROLES } from "@/shared/constants/roles";

describe("sessionMapping", () => {
  const { jwt, session } = authOptions.callbacks!;

  describe("jwt callback", () => {
    it("maps user id and role to token", async () => {
      const token = {};
      const user = { id: "user-1", role: ROLES.ADMIN } as any;

      const result = await (jwt as any)({ token, user });

      expect(result.id).toBe("user-1");
      expect(result.role).toBe(ROLES.ADMIN);
    });

    it("returns token as is if no user", async () => {
      const token = { existing: "value" };
      const result = await (jwt as any)({ token });
      expect(result).toEqual(token);
    });
  });

  describe("session callback", () => {
    it("maps token id and role to session user", async () => {
      const sessionObj = { user: {} };
      const token = { id: "user-1", role: ROLES.ADMIN };

      const result = await (session as any)({ session: sessionObj, token });

      expect(result.user.id).toBe("user-1");
      expect(result.user.role).toBe(ROLES.ADMIN);
    });
  });
});
