"use client";

import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/shared/providers/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function initMSW() {
      if (process.env.NODE_ENV === "development") {
        const { worker } = await import("@/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
        });
      }
      setMswReady(true);
    }

    initMSW();
  }, []);

  if (process.env.NODE_ENV === "development" && !mswReady) {
    return null;
  }

  return (
    <QueryProvider>
      {children}
      <Toaster />
    </QueryProvider>
  );
}
