import { describe, it, expect } from "vitest";
import { queryKeys } from "@/shared/constants/queryKeys";

describe("queryKeys", () => {
  it("reviewItems returns correct key with params", () => {
    const params = { status: "PENDING" as const, q: "test" };
    expect(queryKeys.reviewItems(params)).toEqual(["review-items", params]);
  });

  it("reviewItems returns correct key without params", () => {
    expect(queryKeys.reviewItems()).toEqual(["review-items", undefined]);
  });

  it("reviewItem returns correct key with id", () => {
    expect(queryKeys.reviewItem("123")).toEqual(["review-item", "123"]);
  });

  it("metrics returns correct key with range", () => {
    const range = { from: "2023-01-01", to: "2023-01-31" };
    expect(queryKeys.metrics(range as any)).toEqual(["metrics", range]);
  });
});
