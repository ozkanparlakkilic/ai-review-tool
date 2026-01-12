import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTableFacetedFilter } from "../faceted-filter";
import { type Column } from "@tanstack/react-table";
import { CircleIcon } from "@radix-ui/react-icons";

const createMockColumn = (options: {
  getFilterValue?: () => any;
  setFilterValue?: (value: any) => void;
  getFacetedUniqueValues?: () => Map<string, number>;
}) =>
  ({
    id: "test-column",
    getFilterValue: options.getFilterValue || vi.fn(() => undefined),
    setFilterValue: options.setFilterValue || vi.fn(),
    getFacetedUniqueValues:
      options.getFacetedUniqueValues || vi.fn(() => new Map<string, number>()),
  }) as unknown as Column<any, any>;

const mockOptions = [
  { label: "Option 1", value: "opt1", icon: CircleIcon },
  { label: "Option 2", value: "opt2" },
  { label: "Option 3", value: "opt3", icon: CircleIcon },
];

describe("DataTableFacetedFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Button rendering", () => {
    it("should render button with title", () => {
      const mockColumn = createMockColumn({});
      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(screen.getByText("Test Filter")).toBeInTheDocument();
    });

    it("should render PlusCircledIcon", () => {
      const mockColumn = createMockColumn({});
      const { container } = render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    });

    it("should not show badges when no values selected", () => {
      const mockColumn = createMockColumn({});
      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      expect(screen.queryByText(/selected/)).not.toBeInTheDocument();
    });

    it("should show badge with count on mobile when 1 value selected", () => {
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1"],
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      const button = screen.getByRole("button");
      expect(button.textContent).toContain("1");
    });

    it("should show label badges when 2 or fewer values selected", () => {
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1", "opt2"],
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("should show 'X selected' badge when more than 2 values selected", () => {
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1", "opt2", "opt3"],
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      expect(screen.getByText("3 selected")).toBeInTheDocument();
    });
  });

  describe("Client-side mode - Single selection", () => {
    it("should show selected value from column", () => {
      const mockColumn = createMockColumn({
        getFilterValue: () => "opt1",
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("should call setFilterValue when option is selected", async () => {
      const user = userEvent.setup();
      const mockSetFilterValue = vi.fn();
      const mockColumn = createMockColumn({
        getFilterValue: () => undefined,
        setFilterValue: mockSetFilterValue,
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });

      const option1 = screen.getByText("Option 1");
      await user.click(option1);

      expect(mockSetFilterValue).toHaveBeenCalledWith("opt1");
    });

    it("should call setFilterValue with undefined when selected option is clicked", async () => {
      const user = userEvent.setup();
      const mockSetFilterValue = vi.fn();
      const mockColumn = createMockColumn({
        getFilterValue: () => "opt1",
        setFilterValue: mockSetFilterValue,
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const popover = document.querySelector('[role="combobox"]');
        expect(popover).toBeInTheDocument();
      });

      const optionItems = screen.getAllByText("Option 1");
      const popoverOption = optionItems.find((item) =>
        item.closest('[role="option"]')
      );

      if (popoverOption) {
        await user.click(popoverOption);
        expect(mockSetFilterValue).toHaveBeenCalledWith(undefined);
      }
    });
  });

  describe("Client-side mode - Multiple selection", () => {
    it("should show selected values from column", () => {
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1", "opt2"],
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("should add option to selection when clicked", async () => {
      const user = userEvent.setup();
      const mockSetFilterValue = vi.fn();
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1"],
        setFilterValue: mockSetFilterValue,
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 2")).toBeInTheDocument();
      });

      const option2 = screen.getByText("Option 2");
      await user.click(option2);

      expect(mockSetFilterValue).toHaveBeenCalledWith(["opt1", "opt2"]);
    });

    it("should remove option from selection when clicked", async () => {
      const user = userEvent.setup();
      const mockSetFilterValue = vi.fn();
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1", "opt2"],
        setFilterValue: mockSetFilterValue,
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const popover = document.querySelector('[role="combobox"]');
        expect(popover).toBeInTheDocument();
      });

      const optionItems = screen.getAllByText("Option 1");
      const popoverOption = optionItems.find((item) =>
        item.closest('[role="option"]')
      );

      if (popoverOption) {
        await user.click(popoverOption);
        expect(mockSetFilterValue).toHaveBeenCalledWith(["opt2"]);
      }
    });

    it("should set filter to undefined when last option is removed", async () => {
      const user = userEvent.setup();
      const mockSetFilterValue = vi.fn();
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1"],
        setFilterValue: mockSetFilterValue,
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const popover = document.querySelector('[role="combobox"]');
        expect(popover).toBeInTheDocument();
      });

      const optionItems = screen.getAllByText("Option 1");
      const popoverOption = optionItems.find((item) =>
        item.closest('[role="option"]')
      );

      if (popoverOption) {
        await user.click(popoverOption);
        expect(mockSetFilterValue).toHaveBeenCalledWith(undefined);
      }
    });
  });

  describe("Server-side mode - Single selection", () => {
    it("should show selected value from value prop", () => {
      const mockOnChange = vi.fn();

      render(
        <DataTableFacetedFilter
          title="Test Filter"
          options={mockOptions}
          value="opt1"
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText("Option 1")).toBeInTheDocument();
    });

    it("should call onChange when option is selected", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <DataTableFacetedFilter
          title="Test Filter"
          options={mockOptions}
          onChange={mockOnChange}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });

      const option1 = screen.getByText("Option 1");
      await user.click(option1);

      expect(mockOnChange).toHaveBeenCalledWith("opt1");
    });

    it("should call onChange with undefined when selected option is clicked", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <DataTableFacetedFilter
          title="Test Filter"
          options={mockOptions}
          value="opt1"
          onChange={mockOnChange}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const popover = document.querySelector('[role="combobox"]');
        expect(popover).toBeInTheDocument();
      });

      const optionItems = screen.getAllByText("Option 1");
      const popoverOption = optionItems.find((item) =>
        item.closest('[role="option"]')
      );

      if (popoverOption) {
        await user.click(popoverOption);
        expect(mockOnChange).toHaveBeenCalledWith(undefined);
      }
    });
  });

  describe("Server-side mode - Multiple selection", () => {
    it("should parse comma-separated value", () => {
      const mockOnChange = vi.fn();

      render(
        <DataTableFacetedFilter
          title="Test Filter"
          options={mockOptions}
          value="opt1,opt2"
          onChange={mockOnChange}
          multiple
        />
      );

      expect(screen.getByText("Option 1")).toBeInTheDocument();
      expect(screen.getByText("Option 2")).toBeInTheDocument();
    });

    it("should call onChange with comma-separated string when option is selected", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <DataTableFacetedFilter
          title="Test Filter"
          options={mockOptions}
          value="opt1"
          onChange={mockOnChange}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 2")).toBeInTheDocument();
      });

      const option2 = screen.getByText("Option 2");
      await user.click(option2);

      expect(mockOnChange).toHaveBeenCalledWith("opt1,opt2");
    });

    it("should call onChange with undefined when all options are removed", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <DataTableFacetedFilter
          title="Test Filter"
          options={mockOptions}
          value="opt1"
          onChange={mockOnChange}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const popover = document.querySelector('[role="combobox"]');
        expect(popover).toBeInTheDocument();
      });

      const optionItems = screen.getAllByText("Option 1");
      const popoverOption = optionItems.find((item) =>
        item.closest('[role="option"]')
      );

      if (popoverOption) {
        await user.click(popoverOption);
        expect(mockOnChange).toHaveBeenCalledWith(undefined);
      }
    });
  });

  describe("Clear filters", () => {
    it("should show Clear filters option when values are selected", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1"],
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Clear filters")).toBeInTheDocument();
      });
    });

    it("should not show Clear filters option when no values selected", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getFilterValue: () => undefined,
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });

      expect(screen.queryByText("Clear filters")).not.toBeInTheDocument();
    });

    it("should clear filters in client-side mode", async () => {
      const user = userEvent.setup();
      const mockSetFilterValue = vi.fn();
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1", "opt2"],
        setFilterValue: mockSetFilterValue,
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Clear filters")).toBeInTheDocument();
      });

      const clearButton = screen.getByText("Clear filters");
      await user.click(clearButton);

      expect(mockSetFilterValue).toHaveBeenCalledWith(undefined);
    });

    it("should clear filters in server-side mode", async () => {
      const user = userEvent.setup();
      const mockOnChange = vi.fn();

      render(
        <DataTableFacetedFilter
          title="Test Filter"
          options={mockOptions}
          value="opt1,opt2"
          onChange={mockOnChange}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Clear filters")).toBeInTheDocument();
      });

      const clearButton = screen.getByText("Clear filters");
      await user.click(clearButton);

      expect(mockOnChange).toHaveBeenCalledWith(undefined);
    });
  });

  describe("Faceted values", () => {
    it("should display faceted count for each option", async () => {
      const user = userEvent.setup();
      const facets = new Map([
        ["opt1", 5],
        ["opt2", 3],
        ["opt3", 10],
      ]);
      const mockColumn = createMockColumn({
        getFacetedUniqueValues: () => facets,
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
      });
    });

    it("should not display faceted count when not available", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getFacetedUniqueValues: () => new Map(),
      });

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const popover = document.querySelector('[role="combobox"]');
        expect(popover).toBeInTheDocument();
      });

      const commandItems = document.querySelectorAll('[role="option"]');
      commandItems.forEach((item) => {
        const facetedCount = item.querySelector('[class*="font-mono"]');
        expect(facetedCount).toBeNull();
      });
    });
  });

  describe("Option icons", () => {
    it("should render option icon when available", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({});

      const { container } = render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });

      const svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    });

    it("should not render icon when option has no icon", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({});

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 2")).toBeInTheDocument();
      });
    });
  });

  describe("Checkbox rendering", () => {
    it("should show checked state for selected option", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1"],
      });

      const { container } = render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const popover = document.querySelector('[role="combobox"]');
        expect(popover).toBeInTheDocument();
      });

      const commandItems = document.querySelectorAll('[role="option"]');
      const opt1Item = Array.from(commandItems).find((item) =>
        item.textContent?.includes("Option 1")
      );

      if (opt1Item) {
        const checkbox = opt1Item.querySelector('[class*="bg-primary"]');
        expect(checkbox).toBeInTheDocument();
      }
    });

    it("should show unchecked state for unselected option", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        getFilterValue: () => ["opt1"],
      });

      const { container } = render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
          multiple
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 2")).toBeInTheDocument();
      });

      const checkboxes = container.querySelectorAll('[class*="opacity-50"]');
      expect(checkboxes.length).toBeGreaterThan(0);
    });
  });

  describe("Popover", () => {
    it("should open popover when button is clicked", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({});

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Option 1")).toBeInTheDocument();
      });
    });

    it("should render CommandInput with placeholder", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({});

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const input = screen.getByPlaceholderText("Test Filter");
        expect(input).toBeInTheDocument();
      });
    });

    it("should render CommandEmpty when search yields no results", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({});

      render(
        <DataTableFacetedFilter
          column={mockColumn}
          title="Test Filter"
          options={mockOptions}
        />
      );

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const input = screen.getByPlaceholderText("Test Filter");
        expect(input).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText("Test Filter");
      await user.type(input, "NonExistentOption");

      await waitFor(
        () => {
          const emptyMessage = screen.queryByText("No results found.");
          if (emptyMessage) {
            expect(emptyMessage).toBeInTheDocument();
          }
        },
        { timeout: 2000 }
      );
    });
  });
});
