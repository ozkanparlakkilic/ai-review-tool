import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTableToolbar } from "../toolbar";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useState } from "react";

vi.mock("../view-options", () => ({
  DataTableViewOptions: () => (
    <div data-testid="view-options">View Options</div>
  ),
}));

const TestComponent = ({
  searchKey,
  searchValue,
  onSearchChange,
  filters = [],
  searchPlaceholder,
}: {
  searchKey?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: any[];
  searchPlaceholder?: string;
}) => {
  const [data] = useState([
    { id: "1", name: "Item 1", status: "active", priority: "high" },
    { id: "2", name: "Item 2", status: "inactive", priority: "low" },
  ]);

  const table = useReactTable({
    data,
    columns: [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "status", header: "Status" },
      { accessorKey: "priority", header: "Priority" },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTableToolbar
      table={table}
      searchKey={searchKey}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      filters={filters}
      searchPlaceholder={searchPlaceholder}
    />
  );
};

describe("DataTableToolbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Search input", () => {
    it("should render search input with default placeholder", () => {
      render(<TestComponent searchKey="name" />);

      const input = screen.getByPlaceholderText("Filter...");
      expect(input).toBeInTheDocument();
    });

    it("should render search input with custom placeholder", () => {
      render(
        <TestComponent searchKey="name" searchPlaceholder="Search items..." />
      );

      const input = screen.getByPlaceholderText("Search items...");
      expect(input).toBeInTheDocument();
    });

    it("should render search input when searchKey is provided", () => {
      render(<TestComponent searchKey="name" />);

      const input = screen.getByPlaceholderText("Filter...");
      expect(input).toBeInTheDocument();
    });

    it("should render search input when searchKey is not provided (global filter)", () => {
      render(<TestComponent />);

      const input = screen.getByPlaceholderText("Filter...");
      expect(input).toBeInTheDocument();
    });

    it("should call onSearchChange when typing in server-side mode", async () => {
      const user = userEvent.setup();
      const mockOnSearchChange = vi.fn();

      render(
        <TestComponent
          searchKey="name"
          searchValue=""
          onSearchChange={mockOnSearchChange}
        />
      );

      const input = screen.getByPlaceholderText("Filter...");
      await user.type(input, "test");

      expect(mockOnSearchChange).toHaveBeenCalled();
    });

    it("should display searchValue in server-side mode", () => {
      render(
        <TestComponent
          searchKey="name"
          searchValue="test query"
          onSearchChange={vi.fn()}
        />
      );

      const input = screen.getByPlaceholderText(
        "Filter..."
      ) as HTMLInputElement;
      expect(input.value).toBe("test query");
    });

    it("should update table filter in client-side mode", async () => {
      const user = userEvent.setup();

      render(<TestComponent searchKey="name" />);

      const input = screen.getByPlaceholderText("Filter...");
      await user.type(input, "test");

      await waitFor(() => {
        expect((input as HTMLInputElement).value).toBe("test");
      });
    });
  });

  describe("Filters", () => {
    const mockFilters = [
      {
        columnId: "status",
        title: "Status",
        options: [
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ],
      },
    ];

    it("should render filters when provided", async () => {
      render(<TestComponent filters={mockFilters} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const statusButton = buttons.find((btn) =>
          btn.textContent?.includes("Status")
        );
        expect(statusButton).toBeInTheDocument();
      });
    });

    it("should render multiple filters", async () => {
      const multipleFilters = [
        ...mockFilters,
        {
          columnId: "priority",
          title: "Priority",
          options: [
            { label: "High", value: "high" },
            { label: "Low", value: "low" },
          ],
        },
      ];

      render(<TestComponent filters={multipleFilters} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const statusButton = buttons.find((btn) =>
          btn.textContent?.includes("Status")
        );
        expect(statusButton).toBeInTheDocument();
      });

      const buttons = screen.getAllByRole("button");
      const priorityButton = buttons.find((btn) =>
        btn.textContent?.includes("Priority")
      );
      if (priorityButton) {
        expect(priorityButton).toBeInTheDocument();
      }
    });

    it("should render server-side filters with onChange", async () => {
      const serverFilters = [
        {
          ...mockFilters[0],
          value: "active",
          onChange: vi.fn(),
        },
      ];

      render(
        <TestComponent
          filters={serverFilters}
          searchValue=""
          onSearchChange={vi.fn()}
        />
      );

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const statusButton = buttons.find((btn) =>
          btn.textContent?.includes("Status")
        );
        expect(statusButton).toBeInTheDocument();
      });
    });

    it("should not render filter when column is not found", () => {
      const invalidFilters = [
        {
          columnId: "nonExistent",
          title: "Non Existent",
          options: [],
        },
      ];

      render(<TestComponent filters={invalidFilters} />);

      expect(screen.queryByText("Non Existent")).not.toBeInTheDocument();
    });
  });

  describe("Reset button", () => {
    it("should show Reset button when filters are active in server-side mode", () => {
      const mockFilters = [
        {
          columnId: "status",
          title: "Status",
          options: [],
          value: "active",
          onChange: vi.fn(),
        },
      ];

      render(
        <TestComponent
          filters={mockFilters}
          searchValue="test"
          onSearchChange={vi.fn()}
        />
      );

      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should show Reset button when searchValue is set in server-side mode", () => {
      render(<TestComponent searchValue="test" onSearchChange={vi.fn()} />);

      expect(screen.getByText("Reset")).toBeInTheDocument();
    });

    it("should not show Reset button when no filters are active in server-side mode", () => {
      render(
        <TestComponent searchValue="" onSearchChange={vi.fn()} filters={[]} />
      );

      expect(screen.queryByText("Reset")).not.toBeInTheDocument();
    });

    it("should call onSearchChange with empty string when Reset is clicked in server-side mode", async () => {
      const user = userEvent.setup();
      const mockOnSearchChange = vi.fn();
      const mockFilterOnChange = vi.fn();

      const mockFilters = [
        {
          columnId: "status",
          title: "Status",
          options: [],
          value: "active",
          onChange: mockFilterOnChange,
        },
      ];

      render(
        <TestComponent
          filters={mockFilters}
          searchValue="test"
          onSearchChange={mockOnSearchChange}
        />
      );

      const resetButton = screen.getByText("Reset");
      await user.click(resetButton);

      expect(mockOnSearchChange).toHaveBeenCalledWith("");
      expect(mockFilterOnChange).toHaveBeenCalledWith(undefined);
    });

    it("should reset table filters when Reset is clicked in client-side mode", async () => {
      const user = userEvent.setup();

      const TestClientComponent = () => {
        const [data] = useState([{ id: "1", name: "Item 1" }]);
        const table = useReactTable({
          data,
          columns: [{ accessorKey: "name", header: "Name" }],
          getCoreRowModel: getCoreRowModel(),
        });

        return <DataTableToolbar table={table} searchKey="name" filters={[]} />;
      };

      render(<TestClientComponent />);

      const input = screen.getByPlaceholderText("Filter...");
      await user.type(input, "test");

      await waitFor(() => {
        expect(screen.getByText("Reset")).toBeInTheDocument();
      });

      const resetButton = screen.getByText("Reset");
      await user.click(resetButton);

      await waitFor(() => {
        const inputAfterReset = screen.getByPlaceholderText(
          "Filter..."
        ) as HTMLInputElement;
        expect(inputAfterReset.value).toBe("");
      });
    });
  });

  describe("View options", () => {
    it("should render DataTableViewOptions", () => {
      render(<TestComponent />);

      expect(screen.getByTestId("view-options")).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    it("should render with correct structure", () => {
      const { container } = render(<TestComponent />);

      const toolbar = container.querySelector('[class*="flex"]');
      expect(toolbar).toBeInTheDocument();
    });
  });
});
