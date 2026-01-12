import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RejectReasonDialog } from "../reject-reason-dialog";

describe("RejectReasonDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when open is false", () => {
    render(
      <RejectReasonDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText(/Reject/)).not.toBeInTheDocument();
  });

  it("should render with correct content when open", () => {
    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Reject 5 items?")).toBeInTheDocument();
    expect(
      screen.getByText("Please provide a reason for rejecting these items.")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter rejection reason...")
    ).toBeInTheDocument();
  });

  it("should display singular 'item' when count is 1", () => {
    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={1}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getAllByText(/Reject 1 item/).length).toBeGreaterThan(0);
  });

  it("should display plural 'items' when count is greater than 1", () => {
    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={10}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Reject 10 items?")).toBeInTheDocument();
    expect(screen.getByText("Reject 10 items")).toBeInTheDocument();
  });

  it("should allow typing in textarea", async () => {
    const user = userEvent.setup();

    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    const textarea = screen.getByPlaceholderText("Enter rejection reason...");
    await user.type(textarea, "Test rejection reason");

    expect(textarea).toHaveValue("Test rejection reason");
  });

  it("should show error when reason is too short", async () => {
    const user = userEvent.setup();

    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    const textarea = screen.getByPlaceholderText("Enter rejection reason...");
    await user.type(textarea, "Test");

    const rejectButton = screen.getByText("Reject 5 items");
    await user.click(rejectButton);

    expect(
      screen.getByText("Reason must be at least 5 characters")
    ).toBeInTheDocument();
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it("should call onConfirm with trimmed reason when valid", async () => {
    const user = userEvent.setup();

    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    const textarea = screen.getByPlaceholderText("Enter rejection reason...");
    await user.type(textarea, "  Valid rejection reason  ");

    const rejectButton = screen.getByText("Reject 5 items");
    await user.click(rejectButton);

    expect(mockOnConfirm).toHaveBeenCalledWith("Valid rejection reason");
  });

  it("should clear textarea and error when Cancel is clicked", async () => {
    const user = userEvent.setup();

    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    const textarea = screen.getByPlaceholderText("Enter rejection reason...");
    await user.type(textarea, "Test");

    const rejectButton = screen.getByText("Reject 5 items");
    await user.click(rejectButton);

    expect(
      screen.getByText("Reason must be at least 5 characters")
    ).toBeInTheDocument();

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(textarea).toHaveValue("");
  });

  it("should clear error when typing after error", async () => {
    const user = userEvent.setup();

    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    const textarea = screen.getByPlaceholderText("Enter rejection reason...");
    await user.type(textarea, "Test");

    const rejectButton = screen.getByText("Reject 5 items");
    await user.click(rejectButton);

    expect(
      screen.getByText("Reason must be at least 5 characters")
    ).toBeInTheDocument();

    await user.type(textarea, " more text");

    expect(
      screen.queryByText("Reason must be at least 5 characters")
    ).not.toBeInTheDocument();
  });

  it("should accept minimum length reason", async () => {
    const user = userEvent.setup();

    render(
      <RejectReasonDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    const textarea = screen.getByPlaceholderText("Enter rejection reason...");
    await user.type(textarea, "12345");

    const rejectButton = screen.getByText("Reject 5 items");
    await user.click(rejectButton);

    expect(mockOnConfirm).toHaveBeenCalledWith("12345");
  });
});
