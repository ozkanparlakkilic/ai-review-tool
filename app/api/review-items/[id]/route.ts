import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/auth";
import { ActivityAction, RISK_LEVELS } from "@/shared/types/activity-log";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  feedback: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAuth();
  if (authError instanceof NextResponse) {
    return authError;
  }

  const { id } = await params;
  const item = await prisma.reviewItem.findUnique({
    where: { id },
  });

  if (!item) {
    return NextResponse.json(
      { message: "Review item not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await params;
  const body = await request.json();

  const validation = updateSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      { message: "Invalid request body", errors: validation.error.issues },
      { status: 400 }
    );
  }

  const { status, feedback } = validation.data;

  const existingItem = await prisma.reviewItem.findUnique({
    where: { id },
  });

  if (!existingItem) {
    return NextResponse.json(
      { message: "Review item not found" },
      { status: 404 }
    );
  }

  const wasPending = existingItem.status === "PENDING";
  const isNowReviewed = status !== "PENDING";

  const updatedItem = await prisma.reviewItem.update({
    where: { id },
    data: {
      status,
      feedback: feedback ?? null,
      reviewedAt: isNowReviewed ? new Date() : null,
      updatedAt: new Date(),
    },
  });

  if (wasPending && isNowReviewed) {
    const action =
      status === "APPROVED"
        ? ActivityAction.REVIEW_APPROVED
        : ActivityAction.REVIEW_REJECTED;

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        userName: session.user.name || session.user.email || "Unknown",
        userRole: session.user.role,
        action,
        targetId: id,
        riskLevel: RISK_LEVELS[action],
        createdAt: new Date(),
      },
    });
  }

  return NextResponse.json(updatedItem);
}
