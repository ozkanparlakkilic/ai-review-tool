import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StatusFilter } from "../status-filter";
import { ReviewStatus } from "@/shared/types";
import { STATUS_LABELS } from "../../constants";

describe("StatusFilter", () => {
  it("should render all status options", () => {
    const mockOnChange = vi.fn();

    render(<StatusFilter value="PENDING" onChange={mockOnChange} />);

    expect(screen.getByText(STATUS_LABELS.PENDING)).toBeInTheDocument();
    expect(screen.getByText(STATUS_LABELS.APPROVED)).toBeInTheDocument();
    expect(screen.getByText(STATUS_LABELS.REJECTED)).toBeInTheDocument();
  });

  it("should show current selected value", () => {
    const mockOnChange = vi.fn();

    render(<StatusFilter value="APPROVED" onChange={mockOnChange} />);

    const approvedTab = screen.getByRole("tab", {
      name: STATUS_LABELS.APPROVED,
    });
    expect(approvedTab).toHaveAttribute("data-state", "active");
  });

  it("should call onChange when a status is selected", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(<StatusFilter value="PENDING" onChange={mockOnChange} />);

    const approvedTab = screen.getByRole("tab", {
      name: STATUS_LABELS.APPROVED,
    });
    await user.click(approvedTab);

    expect(mockOnChange).toHaveBeenCalledWith("APPROVED");
  });

  it("should allow selecting different statuses", async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(<StatusFilter value="PENDING" onChange={mockOnChange} />);

    const rejectedTab = screen.getByRole("tab", {
      name: STATUS_LABELS.REJECTED,
    });
    await user.click(rejectedTab);

    expect(mockOnChange).toHaveBeenCalledWith("REJECTED");
  });

  it("should display correct labels for each status", () => {
    const mockOnChange = vi.fn();

    render(<StatusFilter value="PENDING" onChange={mockOnChange} />);

    Object.entries(STATUS_LABELS).forEach(([status, label]) => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });
});
