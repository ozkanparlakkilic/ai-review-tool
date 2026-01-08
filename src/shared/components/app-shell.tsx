"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProfileDropdown } from "@/features/auth/components/profile-dropdown";
import { Header } from "@/shared/components/header";
import { Separator } from "@/components/ui/separator";

import { SearchProvider } from "@/contexts/search-provider";
import { CommandSearch } from "@/shared/components/command-search";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { isAdmin, isAuthenticated } = useAuth();

  const links = [
    { href: "/", label: "Review Queue", visible: true },
    { href: "/insights", label: "Insights", visible: isAdmin },
  ];

  return (
    <SearchProvider>
      <div className="bg-background min-h-screen">
        {isAuthenticated && (
          <Header fixed>
            <div className="flex items-center gap-2 mr-4">
              <span className="font-bold text-sm lg:text-base whitespace-nowrap">
                AI Output Review Tool
              </span>
            </div>

            <nav className="items-center gap-1 hidden lg:flex">
              {links
                .filter((link) => link.visible)
                .map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors h-8 rounded-md px-3",
                      pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
              <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
                <CommandSearch />
              </div>

              <Separator orientation="vertical" className="h-4 hidden lg:block" />

              <ProfileDropdown />
            </div>
          </Header>
        )}
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </SearchProvider>
  );
}
