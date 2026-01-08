"use client";

import { useEffect } from "react";
import { GeneralError } from "@/shared/components/errors/general-error";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <GeneralError />;
}
