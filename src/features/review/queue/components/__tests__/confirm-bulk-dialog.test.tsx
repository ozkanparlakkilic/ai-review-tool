import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmBulkDialog } from "../confirm-bulk-dialog";

describe("ConfirmBulkDialog", () => {
  const mockOnOpenChange = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when open is false", () => {
    render(
      <ConfirmBulkDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        action="approve"
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    expect(
      screen.queryByText("Approve selected items?")
    ).not.toBeInTheDocument();
  });

  it("should render approve dialog with correct content", () => {
    render(
      <ConfirmBulkDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        action="approve"
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Approve selected items?")).toBeInTheDocument();
    expect(
      screen.getByText("This will mark 5 items as Approved.")
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("should render reject dialog with correct content", () => {
    render(
      <ConfirmBulkDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        action="reject"
        count={3}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText("Reject selected items?")).toBeInTheDocument();
    expect(
      screen.getByText("This will mark 3 items as Rejected.")
    ).toBeInTheDocument();
  });

  it("should display singular 'item' when count is 1", () => {
    render(
      <ConfirmBulkDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        action="approve"
        count={1}
        onConfirm={mockOnConfirm}
      />
    );

    expect(
      screen.getByText("This will mark 1 item as Approved.")
    ).toBeInTheDocument();
  });

  it("should display plural 'items' when count is greater than 1", () => {
    render(
      <ConfirmBulkDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        action="approve"
        count={10}
        onConfirm={mockOnConfirm}
      />
    );

    expect(
      screen.getByText("This will mark 10 items as Approved.")
    ).toBeInTheDocument();
  });

  it("should call onConfirm when Confirm button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmBulkDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        action="approve"
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    const confirmButton = screen.getByText("Confirm");
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onOpenChange with false when Cancel is clicked", async () => {
    const user = userEvent.setup();

    render(
      <ConfirmBulkDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        action="approve"
        count={5}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText("Cancel");
    await user.click(cancelButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
