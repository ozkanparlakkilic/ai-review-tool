import * as React from "react";
import { CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";
import { type Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type DataTableFacetedFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>;
  title?: string;
  options: {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
  value?: string;
  onChange?: (value: string | undefined) => void;
  multiple?: boolean;
};

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  value,
  onChange,
  multiple = false,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const isServerSide = !!onChange;
  const facets = column?.getFacetedUniqueValues();
  
  const selectedValues = React.useMemo(() => {
    if (isServerSide && value) {
      const values = multiple ? value.split(",").filter(Boolean) : [value];
      return new Set(values);
    }
    if (!isServerSide && column) {
      const filterValue = column.getFilterValue();
      if (multiple && Array.isArray(filterValue)) {
        return new Set(filterValue);
      }
      if (!multiple && filterValue) {
        return new Set([filterValue as string]);
      }
    }
    return new Set<string>();
  }, [isServerSide, value, multiple, column]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircledIcon className="size-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isServerSide && onChange) {
                        if (multiple) {
                          const newValues = new Set(selectedValues);
                          if (isSelected) {
                            newValues.delete(option.value);
                          } else {
                            newValues.add(option.value);
                          }
                          onChange(newValues.size > 0 ? Array.from(newValues).join(",") : undefined);
                        } else {
                          onChange(isSelected ? undefined : option.value);
                        }
                      } else {
                        if (multiple) {
                          const newValues = new Set(selectedValues);
                          if (isSelected) {
                            newValues.delete(option.value);
                          } else {
                            newValues.add(option.value);
                          }
                          const filterValues = Array.from(newValues);
                          column?.setFilterValue(
                            filterValues.length > 0 ? filterValues : undefined
                          );
                        } else {
                          column?.setFilterValue(isSelected ? undefined : option.value);
                        }
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "border-primary flex size-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("text-background h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="text-muted-foreground size-4" />
                    )}
                    <span>{option.label}</span>
                    {facets?.get(option.value) && (
                      <span className="ms-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {facets.get(option.value)}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      if (isServerSide && onChange) {
                        onChange(undefined);
                      } else {
                        column?.setFilterValue(undefined);
                      }
                    }}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
