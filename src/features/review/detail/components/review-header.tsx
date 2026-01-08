import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/shared/components/status-badge";
import { ReviewStatus } from "@/shared/types";

interface ReviewHeaderProps {
  status: ReviewStatus;
}

export function ReviewHeader({ status }: ReviewHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/")}>
          ← Back to Queue
        </Button>
        <h1 className="text-2xl font-bold">Review Item</h1>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}
