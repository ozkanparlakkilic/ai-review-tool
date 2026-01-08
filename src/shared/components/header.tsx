"use client";

import { cn } from "@/lib/utils";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "bg-background/95 sticky top-0 z-50 w-full transition-all duration-200 border-b backdrop-blur-md",
        fixed && "header-fixed peer/header",
        className
      )}
      {...props}
    >
        <div className="container flex h-14 items-center gap-4 mx-auto px-4">
          {children}
        </div>
    </header>
  );
}
