import { describe, it, expect } from "vitest";
import { cn, getPageNumbers } from "@/lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("a", "b")).toBe("a b");
    expect(cn("a", { b: true, c: false })).toBe("a b");
    expect(cn("a", ["b", "c"])).toBe("a b c");
  });

  it("handles tailwind conflicts", () => {
    expect(cn("px-2 py-2", "p-4")).toBe("p-4");
  });
});

describe("getPageNumbers", () => {
  it("returns all pages when total pages is less than or equal to max visible", () => {
    expect(getPageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPageNumbers(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("returns range with dots when current page is near the start", () => {
    expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, "...", 10]);
    expect(getPageNumbers(3, 10)).toEqual([1, 2, 3, 4, "...", 10]);
  });

  it("returns range with dots when current page is near the end", () => {
    expect(getPageNumbers(10, 10)).toEqual([1, "...", 7, 8, 9, 10]);
    expect(getPageNumbers(8, 10)).toEqual([1, "...", 7, 8, 9, 10]);
  });

  it("returns range with dots on both sides when current page is in the middle", () => {
    expect(getPageNumbers(5, 10)).toEqual([1, "...", 4, 5, 6, "...", 10]);
  });
});
