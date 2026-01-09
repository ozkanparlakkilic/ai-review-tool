"use client";

import {
  SearchIcon,
  ChevronRight,
  CornerDownLeft,
  Gauge,
  LayoutDashboard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/contexts/search-provider";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Kbd } from "@/components/ui/kbd";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface CommandSearchProps {
  className?: string;
  placeholder?: string;
}

const allNavigationItems = [
  {
    title: "Review Queue",
    url: "/",
    icon: LayoutDashboard,
    keywords: ["review", "queue", "home", "dashboard", "items"],
    adminOnly: false,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: Gauge,
    keywords: ["insights", "analytics", "statistics", "charts", "data"],
    adminOnly: true,
  },
  {
    title: "Audit Log",
    url: "/audit-log",
    icon: FileText,
    keywords: ["audit", "log", "activity", "history", "tracking"],
    adminOnly: true,
  },
];

const searchDescriptions: Record<string, string> = {
  "Review Queue": "View and process items waiting for review",
  Insights: "View performance metrics and review trends",
  "Audit Log": "Track and audit all critical actions performed in the system",
};

export function CommandSearch({
  className = "",
  placeholder,
}: CommandSearchProps) {
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const defaultPlaceholder = placeholder || "Search pages...";

  const navigationItems = allNavigationItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const handleSelect = (url: string) => {
    setSelectedUrl(url);
  };

  const handleGoToPage = useCallback(() => {
    if (selectedUrl) {
      setOpen(false);
      router.push(selectedUrl);
      setSelectedUrl(null);
    }
  }, [selectedUrl, setOpen, router]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && selectedUrl) {
        e.preventDefault();
        handleGoToPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, selectedUrl, handleGoToPage]);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "bg-muted/25 group text-muted-foreground hover:bg-accent relative h-8 w-full flex-1 justify-start rounded-md text-sm font-normal shadow-none sm:w-40 sm:pe-12 md:flex-none lg:w-52 xl:w-64",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <SearchIcon
          aria-hidden="true"
          className="absolute start-1.5 top-1/2 -translate-y-1/2"
          size={16}
        />
        <span className="ms-4">{defaultPlaceholder}</span>
        <kbd className="bg-muted group-hover:bg-accent pointer-events-none absolute end-[0.3rem] top-[0.3rem] hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setSelectedUrl(null);
          }
        }}
        title="Search"
        description="Search pages and navigate quickly"
        className="ring-muted max-w-2xl ring-4"
        showCloseButton={false}
      >
        <div className="bg-muted m-2 flex h-8 items-center gap-2 rounded-lg px-3 [&_[data-slot=command-input-wrapper]]:h-full [&_[data-slot=command-input-wrapper]]:flex-1 [&_[data-slot=command-input-wrapper]]:border-0 [&_[data-slot=command-input-wrapper]]:p-0 [&_[data-slot=command-input-wrapper]_svg]:opacity-50">
          <CommandInput
            placeholder={defaultPlaceholder}
            className="h-full border-0 bg-transparent py-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Kbd
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground h-6 shrink-0 px-2 text-xs"
          >
            <span className="text-xs">Esc</span>
          </Kbd>
        </div>
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const title = item.title;
              const description = searchDescriptions[item.title] || "";
              const isSelected = selectedUrl === item.url;

              return (
                <CommandItem
                  key={item.url}
                  value={`${title} ${description}`}
                  keywords={item.keywords}
                  onSelect={() => handleSelect(item.url)}
                  className={cn(
                    "group aria-selected:bg-muted flex cursor-pointer items-center gap-2 px-3 py-2.5",
                    isSelected && "bg-muted"
                  )}
                >
                  <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" />
                  {Icon && (
                    <Icon className="text-muted-foreground h-4 w-4 shrink-0" />
                  )}
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{title}</span>
                    {description && (
                      <span className="text-muted-foreground line-clamp-1 text-xs">
                        {description}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>

        <div className="bg-muted flex h-12 items-center gap-2 border-t px-3">
          <Kbd
            onClick={handleGoToPage}
            className="text-muted-foreground hover:text-foreground bg-popover h-6 shrink-0 px-2 text-xs"
          >
            <CornerDownLeft className="h-4 w-4" />
          </Kbd>
          <span className="text-muted-foreground text-xs">Go to Page</span>
        </div>
      </CommandDialog>
    </>
  );
}
