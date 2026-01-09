import { describe, it, expect } from "vitest";
import { generateCsv } from "@/shared/utils/csv-export";

describe("csvExport", () => {
  const headers = ["ID", "Name", "Comment"];
  const data = [
    ["1", "John Doe", "Hello, world!"],
    ["2", "Jane Smith", 'He said "Hello"'],
    ["3", "Bob", "Line 1\nLine 2"],
  ];

  it("outputs correct headers", () => {
    const csv = generateCsv([], headers);
    expect(csv.split("\n")[0]).toBe("ID,Name,Comment");
  });

  it("outputs correct data rows", () => {
    const csv = generateCsv(data, headers);
    expect(csv).toContain("1,John Doe");
    expect(csv).toContain("2,Jane Smith");
    expect(csv).toContain("3,Bob");
  });

  it("correctly escapes commas, quotes, and newlines", () => {
    const csv = generateCsv(data, headers);
    expect(csv).toContain('1,John Doe,"Hello, world!"');
    expect(csv).toContain('2,Jane Smith,"He said ""Hello"""');
    expect(csv).toContain('3,Bob,"Line 1\nLine 2"');
  });
});
