import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/auth";
import { ActivityAction, RISK_LEVELS } from "@/shared/types/activity-log";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const batchUpdateSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  feedback: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const validation = batchUpdateSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { message: "Invalid request body", errors: validation.error.issues },
      { status: 400 }
    );
  }

  const { ids, status, feedback } = validation.data;

  const updated: Awaited<ReturnType<typeof prisma.reviewItem.update>>[] = [];
  const failed: { id: string; reason: string }[] = [];
  const now = new Date();
  const wasBulkAction = ids.length > 1;
  const pendingItems: string[] = [];

  for (const id of ids) {
    try {
      const existingItem = await prisma.reviewItem.findUnique({
        where: { id },
      });

      if (!existingItem) {
        failed.push({ id, reason: "Item not found" });
        continue;
      }

      const wasPending = existingItem.status === "PENDING";
      const isNowReviewed = status !== "PENDING";

      if (wasPending && isNowReviewed) {
        pendingItems.push(id);
      }

      const updatedItem = await prisma.reviewItem.update({
        where: { id },
        data: {
          status,
          feedback: feedback ?? null,
          reviewedAt: isNowReviewed ? now : null,
          updatedAt: now,
        },
      });

      updated.push(updatedItem);
    } catch (error) {
      failed.push({
        id,
        reason: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (pendingItems.length > 0 && status !== "PENDING") {
    const action =
      status === "APPROVED"
        ? wasBulkAction
          ? ActivityAction.BULK_APPROVE
          : ActivityAction.REVIEW_APPROVED
        : wasBulkAction
          ? ActivityAction.BULK_REJECT
          : ActivityAction.REVIEW_REJECTED;

    if (wasBulkAction) {
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          userName: session.user.name || session.user.email || "Unknown",
          userRole: session.user.role,
          action,
          targetId: pendingItems[0] || null,
          metadata: {
            count: pendingItems.length,
            ids: pendingItems,
          } as Prisma.InputJsonValue,
          riskLevel: RISK_LEVELS[action],
          createdAt: now,
        },
      });
    } else {
      for (const id of pendingItems) {
        await prisma.activityLog.create({
          data: {
            userId: session.user.id,
            userName: session.user.name || session.user.email || "Unknown",
            userRole: session.user.role,
            action,
            targetId: id,
            riskLevel: RISK_LEVELS[action],
            createdAt: now,
          },
        });
      }
    }
  }

  return NextResponse.json({
    updatedIds: updated.map((item) => item.id),
    failed,
    items: updated,
  });
}
