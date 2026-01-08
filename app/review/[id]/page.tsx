"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/shared/components/app-shell";
import { Button } from "@/components/ui/button";

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <Button
          variant="outline"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          ← Back to Queue
        </Button>

        <div className="bg-muted rounded-lg p-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">Review Detail Page</h2>
          <p className="text-muted-foreground mb-4">
            This is a placeholder for the review detail page.
          </p>
          <p className="bg-background inline-block rounded px-4 py-2 font-mono text-sm">
            Item ID: {id}
          </p>
        </div>
      </div>
    </AppShell>
  );
}
