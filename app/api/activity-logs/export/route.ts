import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/auth";
import { ROLES } from "@/shared/constants/roles";
import { Prisma } from "@prisma/client";

function escapeCsvField(field: string | null | undefined): string {
  if (field === null || field === undefined) {
    return "";
  }
  const stringField = String(field);
  if (
    stringField.includes(",") ||
    stringField.includes('"') ||
    stringField.includes("\n")
  ) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

export async function GET(request: NextRequest) {
  const session = await requireAuth([ROLES.ADMIN]);
  if (session instanceof NextResponse) {
    return session;
  }

  const { searchParams } = new URL(request.url);
  const query = {
    action: searchParams.get("action") || undefined,
    userRole: searchParams.get("userRole") || undefined,
    riskLevel: searchParams.get("riskLevel") || undefined,
    search: searchParams.get("search") || searchParams.get("q") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  };

  const { z } = await import("zod");
  const { ActivityAction } = await import("@/shared/types/activity-log");

  const querySchema = z.object({
    action: z.nativeEnum(ActivityAction).optional(),
    userRole: z.enum(["REVIEWER", "ADMIN"]).optional(),
    riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  });

  const validation = querySchema.safeParse(query);
  if (!validation.success) {
    return NextResponse.json(
      {
        message: "Invalid query parameters",
        errors: validation.error.issues,
      },
      { status: 400 }
    );
  }

  const { action, userRole, riskLevel, search, startDate, endDate } =
    validation.data;

  const where: Prisma.ActivityLogWhereInput = {};

  if (action) {
    where.action = action;
  }

  if (userRole) {
    where.userRole = userRole;
  }

  if (riskLevel) {
    where.riskLevel = riskLevel;
  }

  if (search) {
    where.OR = [
      { userName: { contains: search, mode: "insensitive" } },
      { targetId: { contains: search, mode: "insensitive" } },
    ];
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  const logs = await prisma.activityLog.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });

  const headers = [
    "ID",
    "Timestamp",
    "User",
    "Role",
    "Action",
    "Target ID",
    "Risk Level",
  ];

  const csvRows = [
    headers.join(","),
    ...logs.map(
      (log: {
        id: string;
        createdAt: Date;
        userName: string;
        userRole: string;
        action: string;
        targetId: string | null;
        riskLevel: string;
      }) =>
        [
          escapeCsvField(log.id),
          escapeCsvField(log.createdAt.toISOString()),
          escapeCsvField(log.userName),
          escapeCsvField(log.userRole),
          escapeCsvField(log.action),
          escapeCsvField(log.targetId),
          escapeCsvField(log.riskLevel),
        ].join(",")
    ),
  ];

  const csvContent = csvRows.join("\n");

  const filename = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
