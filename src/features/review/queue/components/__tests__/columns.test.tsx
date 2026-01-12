import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { columns } from "../columns";
import { ReviewItem } from "@/shared/types";
import { formatDistanceToNow } from "date-fns";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("date-fns", () => ({
  formatDistanceToNow: vi.fn((date, options) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }),
}));

const createMockTable = (options: {
  isAllPageRowsSelected?: boolean;
  isSomePageRowsSelected?: boolean;
  toggleAllPageRowsSelected?: () => void;
}) => ({
  getIsAllPageRowsSelected: vi.fn(() => options.isAllPageRowsSelected || false),
  getIsSomePageRowsSelected: vi.fn(
    () => options.isSomePageRowsSelected || false
  ),
  toggleAllPageRowsSelected: options.toggleAllPageRowsSelected || vi.fn(),
});

const createMockRow = (
  item: ReviewItem,
  options: {
    isSelected?: boolean;
    canSelect?: boolean;
    toggleSelected?: () => void;
  }
) => ({
  getValue: vi.fn((key: string) => {
    if (key === "prompt") return item.prompt;
    if (key === "status") return item.status;
    if (key === "priority") return item.priority;
    if (key === "createdAt") return item.createdAt;
    return undefined;
  }),
  getIsSelected: vi.fn(() => options.isSelected || false),
  getCanSelect: vi.fn(() => options.canSelect !== false),
  toggleSelected: options.toggleSelected || vi.fn(),
  original: item,
});

const createMockColumn = () => ({
  id: "test-column",
  toggleSorting: vi.fn(),
  getIsSorted: vi.fn(() => false),
  getCanSort: vi.fn(() => true),
  getCanHide: vi.fn(() => true),
  toggleVisibility: vi.fn(),
  getIsVisible: vi.fn(() => true),
  getToggleSortingHandler: vi.fn(() => vi.fn()),
});

const mockItem: ReviewItem = {
  id: "1",
  prompt: "Test prompt",
  modelOutput: "Test output",
  status: "PENDING",
  priority: "high",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  reviewedAt: null,
  feedback: null,
};

describe("columns", () => {
  describe("Select column", () => {
    it("should render header checkbox with checked state when all rows selected", () => {
      const selectColumn = columns[0];
      const mockTable = createMockTable({ isAllPageRowsSelected: true });

      const Header = selectColumn.header as any;
      render(<Header table={mockTable} />);

      const checkbox = screen.getByLabelText("Select all");
      expect(checkbox).toBeChecked();
    });

    it("should render header checkbox with indeterminate state when some rows selected", () => {
      const selectColumn = columns[0];
      const mockTable = createMockTable({ isSomePageRowsSelected: true });

      const Header = selectColumn.header as any;
      const { container } = render(<Header table={mockTable} />);

      const checkbox = screen.getByLabelText("Select all");
      expect(checkbox.getAttribute("data-state")).toBe("indeterminate");
    });

    it("should call toggleAllPageRowsSelected when header checkbox is clicked", () => {
      const selectColumn = columns[0];
      const mockToggle = vi.fn();
      const mockTable = createMockTable({
        toggleAllPageRowsSelected: mockToggle,
      });

      const Header = selectColumn.header as any;
      render(<Header table={mockTable} />);

      const checkbox = screen.getByLabelText("Select all");
      checkbox.click();

      expect(mockToggle).toHaveBeenCalledWith(true);
    });

    it("should render cell checkbox with checked state when row is selected", () => {
      const selectColumn = columns[0];
      const mockRow = createMockRow(mockItem, { isSelected: true });

      const Cell = selectColumn.cell as any;
      render(<Cell row={mockRow} />);

      const checkbox = screen.getByLabelText("Select row");
      expect(checkbox).toBeChecked();
    });

    it("should render cell checkbox as disabled when row cannot be selected", () => {
      const selectColumn = columns[0];
      const mockRow = createMockRow(mockItem, { canSelect: false });

      const Cell = selectColumn.cell as any;
      render(<Cell row={mockRow} />);

      const checkbox = screen.getByLabelText("Select row");
      expect(checkbox).toBeDisabled();
    });

    it("should call toggleSelected when cell checkbox is clicked", () => {
      const selectColumn = columns[0];
      const mockToggle = vi.fn();
      const mockRow = createMockRow(mockItem, { toggleSelected: mockToggle });

      const Cell = selectColumn.cell as any;
      render(<Cell row={mockRow} />);

      const checkbox = screen.getByLabelText("Select row");
      checkbox.click();

      expect(mockToggle).toHaveBeenCalledWith(true);
    });

    it("should have enableSorting false", () => {
      const selectColumn = columns[0];
      expect(selectColumn.enableSorting).toBe(false);
    });

    it("should have enableHiding false", () => {
      const selectColumn = columns[0];
      expect(selectColumn.enableHiding).toBe(false);
    });
  });

  describe("Prompt column", () => {
    it("should render prompt value", () => {
      const promptColumn = columns[1];
      const mockRow = createMockRow(mockItem, {});

      const Cell = promptColumn.cell as any;
      render(<Cell row={mockRow} />);

      expect(screen.getByText("Test prompt")).toBeInTheDocument();
    });

    it("should truncate long prompts", () => {
      const promptColumn = columns[1];
      const longPromptItem = {
        ...mockItem,
        prompt: "A".repeat(600),
      };
      const mockRow = createMockRow(longPromptItem, {});

      const Cell = promptColumn.cell as any;
      const { container } = render(<Cell row={mockRow} />);

      const span = container.querySelector("span");
      expect(span?.className).toContain("truncate");
      expect(span?.className).toContain("max-w-[500px]");
    });

    it("should render header with DataTableColumnHeader", () => {
      const promptColumn = columns[1];
      const mockColumn = createMockColumn();

      const Header = promptColumn.header as any;
      render(<Header column={mockColumn} />);

      expect(screen.getByText("Prompt")).toBeInTheDocument();
    });
  });

  describe("Status column", () => {
    it("should render status label for PENDING", () => {
      const statusColumn = columns[2];
      const mockRow = createMockRow({ ...mockItem, status: "PENDING" }, {});

      const Cell = statusColumn.cell as any;
      render(<Cell row={mockRow} />);

      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("should render status label for APPROVED", () => {
      const statusColumn = columns[2];
      const mockRow = createMockRow({ ...mockItem, status: "APPROVED" }, {});

      const Cell = statusColumn.cell as any;
      render(<Cell row={mockRow} />);

      expect(screen.getByText("Approved")).toBeInTheDocument();
    });

    it("should render status label for REJECTED", () => {
      const statusColumn = columns[2];
      const mockRow = createMockRow({ ...mockItem, status: "REJECTED" }, {});

      const Cell = statusColumn.cell as any;
      render(<Cell row={mockRow} />);

      expect(screen.getByText("Rejected")).toBeInTheDocument();
    });

    it("should render status icon when available", () => {
      const statusColumn = columns[2];
      const mockRow = createMockRow({ ...mockItem, status: "APPROVED" }, {});

      const Cell = statusColumn.cell as any;
      const { container } = render(<Cell row={mockRow} />);

      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should return null for unknown status", () => {
      const statusColumn = columns[2];
      const mockRow = createMockRow(
        { ...mockItem, status: "UNKNOWN" as any },
        {}
      );

      const Cell = statusColumn.cell as any;
      const { container } = render(<Cell row={mockRow} />);

      expect(container.firstChild).toBeNull();
    });

    it("should filter rows by status correctly", () => {
      const statusColumn = columns[2];
      const filterFn = statusColumn.filterFn as any;

      const row1 = createMockRow({ ...mockItem, status: "PENDING" }, {});
      const row2 = createMockRow({ ...mockItem, status: "APPROVED" }, {});

      expect(filterFn(row1, "status", ["PENDING"])).toBe(true);
      expect(filterFn(row1, "status", ["APPROVED"])).toBe(false);
      expect(filterFn(row2, "status", ["PENDING", "APPROVED"])).toBe(true);
    });

    it("should render header with DataTableColumnHeader", () => {
      const statusColumn = columns[2];
      const mockColumn = createMockColumn();

      const Header = statusColumn.header as any;
      render(<Header column={mockColumn} />);

      expect(screen.getByText("Status")).toBeInTheDocument();
    });
  });

  describe("Priority column", () => {
    it("should render priority label for low", () => {
      const priorityColumn = columns[3];
      const mockRow = createMockRow({ ...mockItem, priority: "low" }, {});

      const Cell = priorityColumn.cell as any;
      render(<Cell row={mockRow} />);

      expect(screen.getByText("Low")).toBeInTheDocument();
    });

    it("should render priority label for high", () => {
      const priorityColumn = columns[3];
      const mockRow = createMockRow({ ...mockItem, priority: "high" }, {});

      const Cell = priorityColumn.cell as any;
      render(<Cell row={mockRow} />);

      expect(screen.getByText("High")).toBeInTheDocument();
    });

    it("should render priority icon when available", () => {
      const priorityColumn = columns[3];
      const mockRow = createMockRow({ ...mockItem, priority: "high" }, {});

      const Cell = priorityColumn.cell as any;
      const { container } = render(<Cell row={mockRow} />);

      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should return null for unknown priority", () => {
      const priorityColumn = columns[3];
      const mockRow = createMockRow(
        { ...mockItem, priority: "unknown" as any },
        {}
      );

      const Cell = priorityColumn.cell as any;
      const { container } = render(<Cell row={mockRow} />);

      expect(container.firstChild).toBeNull();
    });

    it("should filter rows by priority correctly", () => {
      const priorityColumn = columns[3];
      const filterFn = priorityColumn.filterFn as any;

      const row1 = createMockRow({ ...mockItem, priority: "low" }, {});
      const row2 = createMockRow({ ...mockItem, priority: "high" }, {});

      expect(filterFn(row1, "priority", ["low"])).toBe(true);
      expect(filterFn(row1, "priority", ["high"])).toBe(false);
      expect(filterFn(row2, "priority", ["low", "high"])).toBe(true);
    });

    it("should render header with DataTableColumnHeader", () => {
      const priorityColumn = columns[3];
      const mockColumn = createMockColumn();

      const Header = priorityColumn.header as any;
      render(<Header column={mockColumn} />);

      expect(screen.getByText("Priority")).toBeInTheDocument();
    });
  });

  describe("CreatedAt column", () => {
    it("should format date using formatDistanceToNow", () => {
      const createdAtColumn = columns[4];
      const pastDate = new Date(Date.now() - 3600000).toISOString();
      const mockRow = createMockRow({ ...mockItem, createdAt: pastDate }, {});

      const Cell = createdAtColumn.cell as any;
      render(<Cell row={mockRow} />);

      expect(formatDistanceToNow).toHaveBeenCalledWith(expect.any(Date), {
        addSuffix: true,
      });
    });

    it("should render formatted date text", () => {
      const createdAtColumn = columns[4];
      const mockRow = createMockRow(mockItem, {});

      const Cell = createdAtColumn.cell as any;
      render(<Cell row={mockRow} />);

      const dateText = screen.getByText(/ago|now/);
      expect(dateText).toBeInTheDocument();
    });

    it("should render header with DataTableColumnHeader", () => {
      const createdAtColumn = columns[4];
      const mockColumn = createMockColumn();

      const Header = createdAtColumn.header as any;
      render(<Header column={mockColumn} />);

      expect(screen.getByText("Created")).toBeInTheDocument();
    });
  });

  describe("Actions column", () => {
    it("should render Review button with link", () => {
      const actionsColumn = columns[5];
      const mockRow = createMockRow(mockItem, {});

      const Cell = actionsColumn.cell as any;
      render(<Cell row={mockRow} />);

      const link = screen.getByRole("link", { name: "Review" });
      expect(link).toHaveAttribute("href", "/review/1");
    });

    it("should have correct href for different item IDs", () => {
      const actionsColumn = columns[5];
      const mockRow = createMockRow({ ...mockItem, id: "test-id-123" }, {});

      const Cell = actionsColumn.cell as any;
      render(<Cell row={mockRow} />);

      const link = screen.getByRole("link", { name: "Review" });
      expect(link).toHaveAttribute("href", "/review/test-id-123");
    });

    it("should have enableHiding false", () => {
      const actionsColumn = columns[5];
      expect(actionsColumn.enableHiding).toBe(false);
    });
  });

  describe("Column structure", () => {
    it("should have 6 columns defined", () => {
      expect(columns).toHaveLength(6);
    });

    it("should have correct column order", () => {
      expect(columns[0].id).toBe("select");
      expect((columns[1] as { accessorKey?: string }).accessorKey).toBe(
        "prompt"
      );
      expect((columns[2] as { accessorKey?: string }).accessorKey).toBe(
        "status"
      );
      expect((columns[3] as { accessorKey?: string }).accessorKey).toBe(
        "priority"
      );
      expect((columns[4] as { accessorKey?: string }).accessorKey).toBe(
        "createdAt"
      );
      expect(columns[5].id).toBe("actions");
    });
  });
});
