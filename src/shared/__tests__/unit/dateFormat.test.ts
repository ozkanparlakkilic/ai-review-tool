import { describe, it, expect } from "vitest";
import { formatDate, formatDateTime } from "../../utils/date";

describe("dateFormat", () => {
  const testDate = "2023-05-15T10:30:00Z";

  describe("formatDate", () => {
    it("formats date string correctly", () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/May 15, 2023/);
    });
  });

  describe("formatDateTime", () => {
    it("formats date and time correctly", () => {
      const result = formatDateTime(testDate);
      expect(result).toMatch(/May 15, 2023/);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });
});
