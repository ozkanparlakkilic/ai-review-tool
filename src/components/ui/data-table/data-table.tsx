"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Table as TableInstance,
  Row,
  PaginationState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "./pagination";
import { DataTableToolbar } from "./toolbar";
import { DataTableBulkActions } from "./bulk-actions";

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface DataTableFilter<TValue = string> {
  columnId: string;
  title: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  value?: TValue;
  onChange?: (value: TValue | undefined) => void;
  multiple?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: PaginationMeta;
  searchKey?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: DataTableFilter[];
  sorting?: Array<{ field: string; direction: "asc" | "desc" }>;
  onSortingChange?: (
    sorting: Array<{ field: string; direction: "asc" | "desc" }>
  ) => void;
  pagination?: { page: number; limit: number };
  onPaginationChange?: (pagination: { page: number; limit: number }) => void;
  renderBulkActions?: (table: TableInstance<TData>) => React.ReactNode;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  searchKey,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filters,
  sorting: externalSorting,
  onSortingChange,
  pagination: externalPagination,
  onPaginationChange,
  renderBulkActions,
  enableRowSelection = true,
  isLoading,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const isServerSide = !!meta && !!externalPagination && !!onPaginationChange;

  const internalSorting = React.useMemo<SortingState>(() => {
    if (isServerSide && externalSorting && externalSorting.length > 0) {
      return externalSorting.map((sort) => ({
        id: sort.field,
        desc: sort.direction === "desc",
      }));
    }
    return [];
  }, [isServerSide, externalSorting]);

  const internalPagination = React.useMemo(() => {
    if (isServerSide && externalPagination) {
      return {
        pageIndex: externalPagination.page - 1,
        pageSize: externalPagination.limit,
      };
    }
    return { pageIndex: 0, pageSize: 10 };
  }, [isServerSide, externalPagination]);

  const handleSortingChange = (
    updaterOrValue: SortingState | ((old: SortingState) => SortingState)
  ) => {
    if (isServerSide && onSortingChange) {
      const newSorting =
        typeof updaterOrValue === "function"
          ? updaterOrValue(internalSorting)
          : updaterOrValue;

      if (newSorting.length > 0) {
        const sortingArray = newSorting.map((sort) => ({
          field: sort.id,
          direction: sort.desc ? ("desc" as const) : ("asc" as const),
        }));
        onSortingChange(sortingArray);
      } else {
        onSortingChange([{ field: "updatedAt", direction: "desc" }]);
      }
    }
  };

  const handlePaginationChange = (
    updaterOrValue: PaginationState | ((old: PaginationState) => PaginationState)
  ) => {
    if (isServerSide && onPaginationChange && externalPagination) {
      const newPagination =
        typeof updaterOrValue === "function"
          ? updaterOrValue(internalPagination)
          : updaterOrValue;

      onPaginationChange({
        page: newPagination.pageIndex + 1,
        limit: newPagination.pageSize,
      });
    }
  };

  const table = useReactTable<TData>({
    data,
    columns: columns as ColumnDef<TData, TValue>[],
    state: {
      sorting: internalSorting,
      columnVisibility,
      rowSelection,
      pagination: internalPagination,
    },
    enableRowSelection: enableRowSelection as
      | boolean
      | ((row: Row<TData>) => boolean),
    onRowSelectionChange: setRowSelection,
    onSortingChange: handleSortingChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerSide
      ? {
          manualPagination: true,
          manualSorting: true,
          manualFiltering: true,
          pageCount: meta?.totalPages ?? 0,
        }
      : {
          getFilteredRowModel: getFilteredRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getFacetedRowModel: getFacetedRowModel(),
          getFacetedUniqueValues: getFacetedUniqueValues(),
        }),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        filters={filters}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({
                length: meta?.limit || externalPagination?.limit || 10,
              }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {table.getHeaderGroups()[0]?.headers.map((header) => {
                    if (header.column.getIsVisible() === false) return null;
                    return (
                      <TableCell
                        key={
                          header.id || `skeleton-cell-${index}-${header.index}`
                        }
                      >
                        <Skeleton className="h-12 w-full" />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination
        table={table}
        meta={meta}
        onPageSizeChange={(pageSize) => {
          if (onPaginationChange && externalPagination) {
            onPaginationChange({ page: 1, limit: pageSize });
          }
        }}
      />
      {renderBulkActions && (
        <DataTableBulkActions table={table} entityName="row">
          {renderBulkActions(table)}
        </DataTableBulkActions>
      )}
    </div>
  );
}
