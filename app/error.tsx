"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { GeneralError } from "@/shared/components/errors/general-error";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      Sentry.captureException(error);
    }
    console.error(error);
  }, [error]);

  return <GeneralError />;
}
