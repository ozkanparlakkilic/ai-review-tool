import { describe, it, expect } from "vitest";
import {
  formatPercentage,
  formatDuration,
  calculateApprovalRate,
} from "@/features/insights/utils/metrics-format";

describe("metricsFormat", () => {
  describe("formatPercentage", () => {
    it("formats number as percentage string", () => {
      expect(formatPercentage(85)).toBe("85%");
    });
  });

  describe("formatDuration", () => {
    it("formats minutes as string with m suffix", () => {
      expect(formatDuration(45)).toBe("45m");
    });

    it("returns dash for null value", () => {
      expect(formatDuration(null)).toBe("—");
    });
  });

  describe("calculateApprovalRate", () => {
    it("calculates correct percentage and rounds it", () => {
      expect(calculateApprovalRate(2, 3)).toBe(67);
    });

    it("returns 0 if total is 0", () => {
      expect(calculateApprovalRate(5, 0)).toBe(0);
    });
  });
});
