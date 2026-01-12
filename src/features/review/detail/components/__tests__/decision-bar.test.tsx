import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DecisionBar } from "../decision-bar";
import { ReviewStatus } from "@/shared/types";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("DecisionBar", () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with approve and reject buttons", () => {
    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    expect(screen.getByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("Reject")).toBeInTheDocument();
  });

  it("should render FeedbackForm", () => {
    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    expect(screen.getByText("Feedback (Optional)")).toBeInTheDocument();
  });

  it("should display current feedback value", () => {
    render(
      <DecisionBar
        currentStatus="PENDING"
        currentFeedback="Existing feedback"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    const textarea = screen.getByPlaceholderText("Add notes about this review...");
    expect(textarea).toHaveValue("Existing feedback");
  });

  it("should call onUpdate with APPROVED status when Approve button is clicked", async () => {
    const user = userEvent.setup();
    mockOnUpdate.mockResolvedValue(undefined);

    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    const approveButton = screen.getByText("Approve");
    await user.click(approveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith("APPROVED", null);
    });
  });

  it("should call onUpdate with REJECTED status when Reject button is clicked", async () => {
    const user = userEvent.setup();
    mockOnUpdate.mockResolvedValue(undefined);

    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    const textarea = screen.getByPlaceholderText("Add notes about this review...");
    await user.type(textarea, "Rejection reason");

    const rejectButton = screen.getByText("Reject");
    await user.click(rejectButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith("REJECTED", "Rejection reason");
    });
  });

  it("should show error when rejecting without feedback", async () => {
    const user = userEvent.setup();

    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    const rejectButton = screen.getByText("Reject");
    await user.click(rejectButton);

    await waitFor(() => {
      expect(screen.getByText(/Feedback is required when rejecting/)).toBeInTheDocument();
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it("should disable buttons when saving", () => {
    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={true}
      />
    );

    const savingButtons = screen.getAllByText("Saving...");
    expect(savingButtons.length).toBeGreaterThan(0);
    
    const buttons = screen.getAllByRole("button");
    const saveButtons = buttons.filter((btn) => btn.textContent === "Saving...");
    saveButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it("should disable buttons when disabled prop is true", () => {
    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={false}
        disabled={true}
      />
    );

    const approveButton = screen.getByText("Approve");
    const rejectButton = screen.getByText("Reject");

    expect(approveButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });

  it("should disable Approve button when current status is APPROVED", () => {
    render(
      <DecisionBar
        currentStatus="APPROVED"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    const approveButton = screen.getByText("Approve");
    expect(approveButton).toBeDisabled();
  });

  it("should disable Reject button when current status is REJECTED", () => {
    render(
      <DecisionBar
        currentStatus="REJECTED"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    const rejectButton = screen.getByText("Reject");
    expect(rejectButton).toBeDisabled();
  });

  it("should trim feedback before calling onUpdate", async () => {
    const user = userEvent.setup();
    mockOnUpdate.mockResolvedValue(undefined);

    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    const textarea = screen.getByPlaceholderText("Add notes about this review...");
    await user.type(textarea, "  Trimmed feedback  ");

    const approveButton = screen.getByText("Approve");
    await user.click(approveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith("APPROVED", "Trimmed feedback");
    });
  });

  it("should pass null for feedback when textarea is empty", async () => {
    const user = userEvent.setup();
    mockOnUpdate.mockResolvedValue(undefined);

    render(
      <DecisionBar
        currentStatus="PENDING"
        onUpdate={mockOnUpdate}
        saving={false}
      />
    );

    const approveButton = screen.getByText("Approve");
    await user.click(approveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith("APPROVED", null);
    });
  });
});

