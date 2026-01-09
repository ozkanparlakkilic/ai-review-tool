import { describe, it, expect } from "vitest";
import { normalizeFilters } from "./filters";
import { ReviewStatus } from "@/shared/types";

describe("normalizeFilters", () => {
  it("returns undefined for empty values", () => {
    const result = normalizeFilters();
    expect(result).toEqual({ status: undefined, q: undefined });
  });

  it("trims search query", () => {
    const result = normalizeFilters(undefined, "  test  ");
    expect(result.q).toBe("test");
  });

  it("handles status correctly", () => {
    const result = normalizeFilters("APPROVED" as ReviewStatus, "test");
    expect(result).toEqual({ status: "APPROVED", q: "test" });
  });

  it("returns undefined for empty string query", () => {
    const result = normalizeFilters(undefined, "   ");
    expect(result.q).toBeUndefined();
  });
});
