import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulkActionBar } from "../bulk-action-bar";

describe("BulkActionBar", () => {
  const mockOnApprove = vi.fn();
  const mockOnReject = vi.fn();
  const mockOnClear = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when selectedCount is 0", () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={0}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    const bar = container.querySelector('[class*="max-h-0"]');
    expect(bar).toBeInTheDocument();

    const selectedText = container.querySelector('[class*="font-medium"]');
    expect(selectedText).toBeInTheDocument();
    expect(selectedText?.textContent).toContain("0 items selected");
  });

  it("should render when selectedCount is greater than 0", () => {
    render(
      <BulkActionBar
        selectedCount={3}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("3 items selected")).toBeInTheDocument();
    expect(screen.getByText("Reject Selected")).toBeInTheDocument();
    expect(screen.getByText("Approve Selected")).toBeInTheDocument();
    expect(screen.getByText("Clear selection")).toBeInTheDocument();
  });

  it("should display singular 'item' when count is 1", () => {
    render(
      <BulkActionBar
        selectedCount={1}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("1 item selected")).toBeInTheDocument();
  });

  it("should display plural 'items' when count is greater than 1", () => {
    render(
      <BulkActionBar
        selectedCount={5}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    expect(screen.getByText("5 items selected")).toBeInTheDocument();
  });

  it("should call onApprove when Approve Selected button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <BulkActionBar
        selectedCount={2}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    const approveButton = screen.getByText("Approve Selected");
    await user.click(approveButton);

    expect(mockOnApprove).toHaveBeenCalledTimes(1);
  });

  it("should call onReject when Reject Selected button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <BulkActionBar
        selectedCount={2}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    const rejectButton = screen.getByText("Reject Selected");
    await user.click(rejectButton);

    expect(mockOnReject).toHaveBeenCalledTimes(1);
  });

  it("should call onClear when Clear selection button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <BulkActionBar
        selectedCount={3}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    const clearButton = screen.getByText("Clear selection");
    await user.click(clearButton);

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it("should disable buttons when disabled prop is true", () => {
    render(
      <BulkActionBar
        selectedCount={2}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
        disabled
      />
    );

    const approveButton = screen.getByText("Approve Selected");
    const rejectButton = screen.getByText("Reject Selected");

    expect(approveButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();
  });

  it("should not disable buttons when disabled prop is false", () => {
    render(
      <BulkActionBar
        selectedCount={2}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
        disabled={false}
      />
    );

    const approveButton = screen.getByText("Approve Selected");
    const rejectButton = screen.getByText("Reject Selected");

    expect(approveButton).not.toBeDisabled();
    expect(rejectButton).not.toBeDisabled();
  });

  it("should have correct visibility classes based on selectedCount", () => {
    const { container, rerender } = render(
      <BulkActionBar
        selectedCount={0}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    let bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain("max-h-0");
    expect(bar.className).toContain("opacity-0");

    rerender(
      <BulkActionBar
        selectedCount={1}
        onApprove={mockOnApprove}
        onReject={mockOnReject}
        onClear={mockOnClear}
      />
    );

    bar = container.firstChild as HTMLElement;
    expect(bar.className).toContain("max-h-24");
    expect(bar.className).toContain("opacity-100");
  });
});
