"use client";

import { cn } from "@/lib/utils";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  return (
    <header
      className={cn(
        "bg-background/95 sticky top-0 z-50 w-full border-b backdrop-blur-md transition-all duration-200",
        fixed && "header-fixed peer/header",
        className
      )}
      {...props}
    >
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        {children}
      </div>
    </header>
  );
}
