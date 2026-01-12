"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean;
};

export function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const router = useRouter();
  return (
    <div className={cn("h-svh w-full", className)}>
      <main
        className="m-auto flex h-full w-full flex-col items-center justify-center gap-2"
        role="main"
        aria-labelledby="error-heading"
      >
        {!minimal && (
          <h1
            id="error-heading"
            className="text-[7rem] leading-tight font-bold"
          >
            500
          </h1>
        )}
        <span className="font-medium">Oops! Something went wrong {":')"}</span>
        <p className="text-muted-foreground text-center">
          We apologize for the inconvenience. <br /> Please try again later.
        </p>
        {!minimal && (
          <nav className="mt-6 flex gap-4" aria-label="Error page navigation">
            <Button
              variant="outline"
              onClick={() => router.back()}
              aria-label="Go back to previous page"
            >
              Go Back
            </Button>
            <Button
              onClick={() => router.push("/")}
              aria-label="Return to home page"
            >
              Back to Home
            </Button>
          </nav>
        )}
      </main>
    </div>
  );
}
