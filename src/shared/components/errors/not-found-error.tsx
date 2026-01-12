"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function NotFoundError() {
  const router = useRouter();
  return (
    <div className="h-svh">
      <main
        className="m-auto flex h-full w-full flex-col items-center justify-center gap-2"
        role="main"
        aria-labelledby="error-heading"
      >
        <h1 id="error-heading" className="text-[7rem] leading-tight font-bold">
          404
        </h1>
        <span className="font-medium">Oops! Page Not Found!</span>
        <p className="text-muted-foreground text-center">
          It seems like the page you&apos;re looking for <br />
          does not exist or might have been removed.
        </p>
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
      </main>
    </div>
  );
}
