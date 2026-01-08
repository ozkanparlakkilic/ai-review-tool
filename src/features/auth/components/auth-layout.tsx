"use client";

import Image from "next/image";
import { Logo } from "@/assets/logo";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative container mx-auto grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8">
          <div className="mb-4 flex items-center justify-center">
            <Logo className="mr-2" />
            <h1 className="text-xl font-medium">AI Output Review Tool</h1>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-2">
          {children}
        </div>
      </div>

      <div
        className={cn(
          "bg-muted relative h-full overflow-hidden max-lg:hidden",
          "[&>img]:absolute [&>img]:top-[15%] [&>img]:left-20 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>img]:object-top-left [&>img]:select-none"
        )}
      >
        <Image
          src="/auth.png"
          width={1024}
          height={1151}
          alt="Auth Background"
          className="rounded-xl border object-cover shadow-2xl"
          priority
        />
      </div>
    </div>
  );
}
