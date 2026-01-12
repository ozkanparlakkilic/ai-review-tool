"use client";

import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/shared/providers/query-provider";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    async function initMSW() {
      const shouldUseMSW =
        process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_USE_MSW === "true";

      if (shouldUseMSW) {
        const { worker } = await import("@/mocks/browser");
        await worker.start({
          onUnhandledRequest: "bypass",
        });
      }
      setMswReady(true);
    }

    initMSW();
  }, []);

  const shouldUseMSW =
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_USE_MSW === "true";

  if (shouldUseMSW && !mswReady) {
    return null;
  }

  return (
    <SessionProvider>
      <QueryProvider>
        {children}
        <Toaster />
      </QueryProvider>
    </SessionProvider>
  );
}
