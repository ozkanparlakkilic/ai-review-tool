import { Cross2Icon } from "@radix-ui/react-icons";
import { type Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "./faceted-filter";
import { DataTableViewOptions } from "./view-options";

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  searchPlaceholder?: string;
  searchKey?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: {
    columnId: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
    value?: string;
    onChange?: (value: string | undefined) => void;
    multiple?: boolean;
  }[];
};

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Filter...",
  searchKey,
  searchValue,
  onSearchChange,
  filters = [],
}: DataTableToolbarProps<TData>) {
  const isServerSide = !!onSearchChange;
  const isFiltered = isServerSide
    ? !!searchValue || filters.some((f) => f.value)
    : table.getState().columnFilters.length > 0 ||
      table.getState().globalFilter;

  const handleReset = () => {
    if (isServerSide) {
      onSearchChange?.("");
      filters.forEach((filter) => filter.onChange?.(undefined));
    } else {
      table.resetColumnFilters();
      table.setGlobalFilter("");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2">
        {searchKey ? (
          <Input
            placeholder={searchPlaceholder}
            value={
              isServerSide
                ? (searchValue ?? "")
                : ((table.getColumn(searchKey)?.getFilterValue() as string) ??
                  "")
            }
            onChange={(event) => {
              if (isServerSide) {
                onSearchChange?.(event.target.value);
              } else {
                table.getColumn(searchKey)?.setFilterValue(event.target.value);
              }
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        ) : (
          <Input
            placeholder={searchPlaceholder}
            value={
              isServerSide
                ? (searchValue ?? "")
                : (table.getState().globalFilter ?? "")
            }
            onChange={(event) => {
              if (isServerSide) {
                onSearchChange?.(event.target.value);
              } else {
                table.setGlobalFilter(event.target.value);
              }
            }}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        <div className="flex gap-x-2">
          {filters.map((filter) => {
            if (isServerSide && filter.onChange) {
              const column = table.getColumn(filter.columnId);
              if (!column) return null;
              return (
                <DataTableFacetedFilter
                  key={filter.columnId}
                  column={column}
                  title={filter.title}
                  options={filter.options}
                  value={filter.value}
                  onChange={filter.onChange}
                  multiple={filter.multiple ?? false}
                />
              );
            }
            const column = table.getColumn(filter.columnId);
            if (!column) return null;
            return (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={column}
                title={filter.title}
                options={filter.options}
                multiple={filter.multiple ?? false}
              />
            );
          })}
        </div>
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ms-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
