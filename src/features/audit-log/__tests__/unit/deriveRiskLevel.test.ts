import { describe, it, expect } from "vitest";
import { deriveRiskLevel } from "@/shared/utils/risk-level";
import { ActivityAction } from "@/shared/types/activity-log";

describe("deriveRiskLevel", () => {
  it("verifies each action maps to expected risk level", () => {
    expect(deriveRiskLevel(ActivityAction.REVIEW_APPROVED)).toBe("LOW");
    expect(deriveRiskLevel(ActivityAction.BULK_APPROVE)).toBe("MEDIUM");
    expect(deriveRiskLevel(ActivityAction.BULK_REJECT)).toBe("HIGH");
    expect(deriveRiskLevel(ActivityAction.STREAM_CANCELLED)).toBe("MEDIUM");
  });

  it("defaults to LOW for unknown actions", () => {
    expect(deriveRiskLevel("UNKNOWN_ACTION" as any)).toBe("LOW");
  });
});
