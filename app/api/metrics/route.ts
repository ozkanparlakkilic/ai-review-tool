import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/auth";
import { ROLES } from "@/shared/constants/roles";

const metricsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "all"]).default("7d"),
});

export async function GET(request: NextRequest) {
  const authResult = await requireAuth([ROLES.ADMIN]);
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d";

  const validation = metricsQuerySchema.safeParse({ range });
  if (!validation.success) {
    return NextResponse.json(
      { message: "Invalid query parameters", errors: validation.error.issues },
      { status: 400 }
    );
  }

  const { range: validRange } = validation.data;

  const now = new Date();
  const cutoffDate = new Date();

  if (validRange === "7d") {
    cutoffDate.setDate(now.getDate() - 7);
  } else if (validRange === "30d") {
    cutoffDate.setDate(now.getDate() - 30);
  } else {
    cutoffDate.setFullYear(2000);
  }

  const whereClause =
    validRange === "all"
      ? {}
      : {
          createdAt: {
            gte: cutoffDate,
          },
        };

  const [total, pending, approved, rejected, allItemsForDaily] =
    await Promise.all([
      prisma.reviewItem.count({ where: whereClause }),
      prisma.reviewItem.count({
        where: {
          ...whereClause,
          status: "PENDING",
        },
      }),
      prisma.reviewItem.count({
        where: {
          ...whereClause,
          status: "APPROVED",
        },
      }),
      prisma.reviewItem.count({
        where: {
          ...whereClause,
          status: "REJECTED",
        },
      }),
      prisma.reviewItem.findMany({
        where: whereClause,
        select: {
          createdAt: true,
          reviewedAt: true,
          status: true,
        },
      }),
    ]);

  const reviewedItems = allItemsForDaily.filter(
    (item) => item.reviewedAt && new Date(item.reviewedAt) >= cutoffDate
  );

  const approvalRate =
    approved + rejected > 0
      ? Math.round((approved / (approved + rejected)) * 100)
      : 0;

  let avgReviewMinutes: number | null = null;
  if (reviewedItems.length > 0) {
    const totalMinutes = reviewedItems.reduce((sum, item) => {
      if (!item.reviewedAt) return sum;
      const created = new Date(item.createdAt).getTime();
      const reviewed = new Date(item.reviewedAt).getTime();
      return sum + (reviewed - created) / 1000 / 60;
    }, 0);
    avgReviewMinutes = Math.round(totalMinutes / reviewedItems.length);
  }

  const dailyMap = new Map<
    string,
    { approved: number; rejected: number; pending: number }
  >();

  if (validRange !== "all") {
    const daysToShow = validRange === "7d" ? 7 : 30;
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split("T")[0];
      dailyMap.set(dateStr, { approved: 0, rejected: 0, pending: 0 });
    }
  }

  allItemsForDaily.forEach((item) => {
    const date = item.reviewedAt
      ? new Date(item.reviewedAt).toISOString().split("T")[0]
      : new Date(item.createdAt).toISOString().split("T")[0];

    if (validRange !== "all" && !dailyMap.has(date)) {
      return;
    }

    if (!dailyMap.has(date)) {
      dailyMap.set(date, { approved: 0, rejected: 0, pending: 0 });
    }

    const day = dailyMap.get(date)!;
    if (item.status === "APPROVED") day.approved++;
    else if (item.status === "REJECTED") day.rejected++;
    else if (item.status === "PENDING") day.pending++;
  });

  const daily = Array.from(dailyMap.entries())
    .map(([date, counts]) => ({
      date,
      approved: counts.approved,
      rejected: counts.rejected,
      pending: counts.pending,
      reviewed: counts.approved + counts.rejected,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    range: validRange,
    kpis: {
      total,
      pending,
      approved,
      rejected,
      approvalRate,
      avgReviewMinutes,
    },
    daily,
  });
}
