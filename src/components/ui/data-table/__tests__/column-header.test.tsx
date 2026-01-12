import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTableColumnHeader } from "../column-header";
import { type Column } from "@tanstack/react-table";

const createMockColumn = (options: {
  getCanSort?: () => boolean;
  getIsSorted?: () => false | "asc" | "desc";
  toggleSorting?: (desc?: boolean) => void;
  clearSorting?: () => void;
  getCanHide?: () => boolean;
  toggleVisibility?: (visible: boolean) => void;
}) => ({
  id: "test-column",
  toggleSorting: options.toggleSorting || vi.fn(),
  getIsSorted: options.getIsSorted || vi.fn(() => false),
  getCanSort: options.getCanSort || vi.fn(() => true),
  getCanHide: options.getCanHide || vi.fn(() => true),
  toggleVisibility: options.toggleVisibility || vi.fn(),
  getIsVisible: vi.fn(() => true),
  clearSorting: options.clearSorting || vi.fn(),
  getToggleSortingHandler: vi.fn(() => vi.fn()),
}) as unknown as Column<any, any>;

describe("DataTableColumnHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Non-sortable column", () => {
    it("should render simple title when column cannot be sorted", () => {
      const mockColumn = createMockColumn({ getCanSort: () => false });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      expect(screen.getByText("Test Column")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should apply custom className when column cannot be sorted", () => {
      const mockColumn = createMockColumn({ getCanSort: () => false });

      const { container } = render(
        <DataTableColumnHeader
          column={mockColumn}
          title="Test Column"
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("Sortable column - button rendering", () => {
    it("should render button with title when column can be sorted", () => {
      const mockColumn = createMockColumn({ getCanSort: () => true });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(screen.getByText("Test Column")).toBeInTheDocument();
    });

    it("should show CaretSortIcon when not sorted", () => {
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getIsSorted: () => false,
      });

      const { container } = render(
        <DataTableColumnHeader column={mockColumn} title="Test Column" />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should show ArrowDownIcon when sorted descending", () => {
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getIsSorted: () => "desc",
      });

      const { container } = render(
        <DataTableColumnHeader column={mockColumn} title="Test Column" />
      );

      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("should show ArrowUpIcon when sorted ascending", () => {
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getIsSorted: () => "asc",
      });

      const { container } = render(
        <DataTableColumnHeader column={mockColumn} title="Test Column" />
      );

      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe("Sortable column - dropdown menu", () => {
    it("should open dropdown menu when button is clicked", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({ getCanSort: () => true });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Asc")).toBeInTheDocument();
        expect(screen.getByText("Desc")).toBeInTheDocument();
      });
    });

    it("should call toggleSorting with false when Asc is clicked", async () => {
      const user = userEvent.setup();
      const mockToggleSorting = vi.fn();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        toggleSorting: mockToggleSorting,
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Asc")).toBeInTheDocument();
      });

      const ascItem = screen.getByText("Asc");
      await user.click(ascItem);

      expect(mockToggleSorting).toHaveBeenCalledWith(false);
    });

    it("should call toggleSorting with true when Desc is clicked", async () => {
      const user = userEvent.setup();
      const mockToggleSorting = vi.fn();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        toggleSorting: mockToggleSorting,
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Desc")).toBeInTheDocument();
      });

      const descItem = screen.getByText("Desc");
      await user.click(descItem);

      expect(mockToggleSorting).toHaveBeenCalledWith(true);
    });

    it("should show Cancel option when column is sorted", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getIsSorted: () => "asc",
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });
    });

    it("should not show Cancel option when column is not sorted", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getIsSorted: () => false,
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Asc")).toBeInTheDocument();
      });

      expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
    });

    it("should call clearSorting when Cancel is clicked", async () => {
      const user = userEvent.setup();
      const mockClearSorting = vi.fn();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getIsSorted: () => "desc",
        clearSorting: mockClearSorting,
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      const cancelItem = screen.getByText("Cancel");
      await user.click(cancelItem);

      expect(mockClearSorting).toHaveBeenCalled();
    });

    it("should show Hide option when column can be hidden", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getCanHide: () => true,
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Hide")).toBeInTheDocument();
      });
    });

    it("should not show Hide option when column cannot be hidden", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getCanHide: () => false,
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Asc")).toBeInTheDocument();
      });

      expect(screen.queryByText("Hide")).not.toBeInTheDocument();
    });

    it("should call toggleVisibility with false when Hide is clicked", async () => {
      const user = userEvent.setup();
      const mockToggleVisibility = vi.fn();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getCanHide: () => true,
        toggleVisibility: mockToggleVisibility,
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Hide")).toBeInTheDocument();
      });

      const hideItem = screen.getByText("Hide");
      await user.click(hideItem);

      expect(mockToggleVisibility).toHaveBeenCalledWith(false);
    });

    it("should render both Cancel and Hide options when column is sorted and can be hidden", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getCanSort: () => true,
        getIsSorted: () => "asc",
        getCanHide: () => true,
      });

      render(<DataTableColumnHeader column={mockColumn} title="Test Column" />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
        expect(screen.getByText("Hide")).toBeInTheDocument();
      });
    });
  });

  describe("Custom className", () => {
    it("should apply custom className to wrapper div when sortable", () => {
      const mockColumn = createMockColumn({ getCanSort: () => true });

      const { container } = render(
        <DataTableColumnHeader
          column={mockColumn}
          title="Test Column"
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("custom-class");
    });

    it("should merge className with default classes", () => {
      const mockColumn = createMockColumn({ getCanSort: () => true });

      const { container } = render(
        <DataTableColumnHeader
          column={mockColumn}
          title="Test Column"
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain("custom-class");
      expect(wrapper.className).toContain("flex");
    });
  });
});

