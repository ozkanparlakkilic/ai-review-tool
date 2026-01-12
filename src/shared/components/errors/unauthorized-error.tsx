"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UnauthorizedError() {
  const router = useRouter();
  return (
    <div className="h-svh">
      <main
        className="m-auto flex h-full w-full flex-col items-center justify-center gap-2"
        role="main"
        aria-labelledby="error-heading"
      >
        <h1 id="error-heading" className="text-[7rem] leading-tight font-bold">
          401
        </h1>
        <span className="font-medium">Unauthorized Access</span>
        <p className="text-muted-foreground text-center">
          Please log in with the appropriate credentials <br /> to access this
          resource.
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
            onClick={() => router.push("/login")}
            aria-label="Go to sign in page"
          >
            Sign In
          </Button>
        </nav>
      </main>
    </div>
  );
}
