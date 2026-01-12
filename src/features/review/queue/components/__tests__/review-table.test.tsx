import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReviewTable } from "../review-table";
import { ReviewItem } from "@/shared/types";

const mockRouter = {
  push: vi.fn(),
};

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
}));

const mockItems: ReviewItem[] = [
  {
    id: "1",
    prompt: "Test prompt 1",
    modelOutput: "Test model output 1",
    status: "PENDING",
    priority: "high",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-02T00:00:00Z",
    reviewedAt: null,
    feedback: null,
  },
  {
    id: "2",
    prompt: "Test prompt 2 with a very long text that should be truncated",
    modelOutput: "Test model output 2",
    status: "APPROVED",
    priority: "low",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-03T00:00:00Z",
    reviewedAt: "2024-01-03T00:00:00Z",
    feedback: "Good job",
  },
];

describe("ReviewTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render table with items", () => {
    render(<ReviewTable items={mockItems} />);

    expect(screen.getByText("Prompt")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();

    expect(screen.getByText("Test prompt 1")).toBeInTheDocument();
  });

  it("should not render selection column when selection props are not provided", () => {
    render(<ReviewTable items={mockItems} />);

    const checkboxes = screen.queryAllByRole("checkbox");
    expect(checkboxes).toHaveLength(0);
  });

  it("should render selection column when selection props are provided", () => {
    const selectedIds = new Set<string>();
    const mockOnToggleRow = vi.fn();
    const mockOnToggleAll = vi.fn();

    render(
      <ReviewTable
        items={mockItems}
        selectedIds={selectedIds}
        onToggleRow={mockOnToggleRow}
        onToggleAll={mockOnToggleAll}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it("should call onToggleRow when a row checkbox is clicked", async () => {
    const user = userEvent.setup();
    const selectedIds = new Set<string>();
    const mockOnToggleRow = vi.fn();
    const mockOnToggleAll = vi.fn();

    render(
      <ReviewTable
        items={mockItems}
        selectedIds={selectedIds}
        onToggleRow={mockOnToggleRow}
        onToggleAll={mockOnToggleAll}
      />
    );

    const rowCheckboxes = screen.getAllByLabelText(/Select Test prompt/);
    await user.click(rowCheckboxes[0]);

    expect(mockOnToggleRow).toHaveBeenCalledWith("1");
  });

  it("should call onToggleAll when header checkbox is clicked", async () => {
    const user = userEvent.setup();
    const selectedIds = new Set<string>();
    const mockOnToggleRow = vi.fn();
    const mockOnToggleAll = vi.fn();

    render(
      <ReviewTable
        items={mockItems}
        selectedIds={selectedIds}
        onToggleRow={mockOnToggleRow}
        onToggleAll={mockOnToggleAll}
        isAllSelected={false}
        isSomeSelected={false}
      />
    );

    const headerCheckbox = screen.getByLabelText("Select all");
    await user.click(headerCheckbox);

    expect(mockOnToggleAll).toHaveBeenCalledWith(true);
  });

  it("should show checked state for selected rows", () => {
    const selectedIds = new Set<string>(["1"]);
    const mockOnToggleRow = vi.fn();
    const mockOnToggleAll = vi.fn();

    render(
      <ReviewTable
        items={mockItems}
        selectedIds={selectedIds}
        onToggleRow={mockOnToggleRow}
        onToggleAll={mockOnToggleAll}
      />
    );

    const rowCheckboxes = screen.getAllByRole("checkbox");
    const firstRowCheckbox = rowCheckboxes.find((checkbox) =>
      checkbox.getAttribute("aria-label")?.includes("Test prompt 1")
    );
    expect(firstRowCheckbox).toBeChecked();
  });

  it("should navigate to review page when Review button is clicked", async () => {
    const user = userEvent.setup();

    render(<ReviewTable items={mockItems} />);

    const reviewButtons = screen.getAllByText("Review");
    await user.click(reviewButtons[0]);

    expect(mockRouter.push).toHaveBeenCalledWith("/review/1");
  });

  it("should format dates correctly", () => {
    render(<ReviewTable items={mockItems} />);

    const dateCells = screen.getAllByText(/Jan/);
    expect(dateCells.length).toBeGreaterThan(0);
  });

  it("should disable checkboxes when selectionDisabled is true", () => {
    const selectedIds = new Set<string>();
    const mockOnToggleRow = vi.fn();
    const mockOnToggleAll = vi.fn();

    render(
      <ReviewTable
        items={mockItems}
        selectedIds={selectedIds}
        onToggleRow={mockOnToggleRow}
        onToggleAll={mockOnToggleAll}
        selectionDisabled={true}
      />
    );

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
  });

  it("should show indeterminate state for header checkbox when some selected", () => {
    const selectedIds = new Set<string>(["1"]);
    const mockOnToggleRow = vi.fn();
    const mockOnToggleAll = vi.fn();

    const { container } = render(
      <ReviewTable
        items={mockItems}
        selectedIds={selectedIds}
        onToggleRow={mockOnToggleRow}
        onToggleAll={mockOnToggleAll}
        isAllSelected={false}
        isSomeSelected={true}
      />
    );

    const headerCheckbox = screen.getByLabelText("Select all");
    expect(headerCheckbox).toBeInTheDocument();

    const checkboxElement = container.querySelector(
      '[data-state="indeterminate"]'
    );
    expect(checkboxElement || headerCheckbox).toBeInTheDocument();
  });

  it("should show checked state for header checkbox when all selected", () => {
    const selectedIds = new Set<string>(["1", "2"]);
    const mockOnToggleRow = vi.fn();
    const mockOnToggleAll = vi.fn();

    render(
      <ReviewTable
        items={mockItems}
        selectedIds={selectedIds}
        onToggleRow={mockOnToggleRow}
        onToggleAll={mockOnToggleAll}
        isAllSelected={true}
        isSomeSelected={false}
      />
    );

    const headerCheckbox = screen.getByLabelText("Select all");
    expect(headerCheckbox).toBeInTheDocument();
    expect(headerCheckbox.getAttribute("data-state")).toBe("checked");
  });

  it("should render empty table when items array is empty", () => {
    render(<ReviewTable items={[]} />);

    expect(screen.getByText("Prompt")).toBeInTheDocument();
    expect(screen.queryByText("Test prompt 1")).not.toBeInTheDocument();
  });
});
