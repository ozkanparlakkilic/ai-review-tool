import { describe, it, expect } from "vitest";
import { isNearBottom } from "./auto-scroll";

describe("isNearBottom", () => {
  it("returns true when near bottom", () => {
    expect(isNearBottom(100, 500, 400)).toBe(true);
    expect(isNearBottom(90, 500, 400)).toBe(true);
  });

  it("returns false when far from bottom", () => {
    expect(isNearBottom(40, 500, 400)).toBe(false);
  });

  it("respects custom threshold", () => {
    expect(isNearBottom(80, 500, 400, 10)).toBe(false);
  });
});
