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
  const { isAdmin, isAuthenticated, isLoading } = useAuth();

  const links = [
    { href: "/", label: "Review Queue", visible: true, requiresAuth: true },
    {
      href: "/insights",
      label: "Insights",
      visible: isAdmin,
      requiresAuth: true,
    },
    {
      href: "/audit-log",
      label: "Audit Log",
      visible: isAdmin,
      requiresAuth: true,
    },
  ];

  const visibleLinks = links.filter((link) => {
    if (isLoading) {
      return link.href === "/";
    }
    return link.visible;
  });

  return (
    <SearchProvider>
      <div className="bg-background min-h-screen">
        {(isAuthenticated || isLoading) && (
          <Header fixed>
            <div className="mr-4 flex items-center gap-2">
              <span className="text-sm font-bold whitespace-nowrap lg:text-base">
                AI Output Review Tool
              </span>
            </div>

            <nav className="hidden items-center gap-1 lg:flex">
              {visibleLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
                    pathname === link.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isLoading &&
                      link.requiresAuth &&
                      link.href !== "/" &&
                      "opacity-50"
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

              {(isAuthenticated || isLoading) && (
                <>
                  <Separator
                    orientation="vertical"
                    className="hidden h-4 lg:block"
                  />

                  <ProfileDropdown isLoading={isLoading && !isAuthenticated} />
                </>
              )}
            </div>
          </Header>
        )}
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    </SearchProvider>
  );
}
