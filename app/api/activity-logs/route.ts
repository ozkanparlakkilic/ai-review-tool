import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/auth";
import { ROLES } from "@/shared/constants/roles";
import { ActivityAction } from "@/shared/types/activity-log";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const querySchema = z.object({
  action: z.nativeEnum(ActivityAction).optional(),
  userRole: z.enum(["REVIEWER", "ADMIN"]).optional(),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(["createdAt", "action", "riskLevel"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

const SORTABLE_FIELDS = {
  createdAt: "createdAt",
  action: "action",
  riskLevel: "riskLevel",
} as const;

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
    sortBy: searchParams.get("sortBy") || undefined,
    sortDir: searchParams.get("sortDir") || undefined,
  };

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

  const {
    action,
    userRole,
    riskLevel,
    search,
    startDate,
    endDate,
    sortBy,
    sortDir,
  } = validation.data;

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

  const orderByField = sortBy
    ? SORTABLE_FIELDS[sortBy as keyof typeof SORTABLE_FIELDS]
    : "createdAt";
  const orderByDir = sortDir || "desc";

  const orderBy: Prisma.ActivityLogOrderByWithRelationInput = {
    [orderByField]: orderByDir,
  } as Prisma.ActivityLogOrderByWithRelationInput;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return NextResponse.json({
    items: logs,
    meta: { total },
  });
}

const createLogSchema = z.object({
  action: z.nativeEnum(ActivityAction),
  targetId: z.string().optional().nullable(),
  groupId: z.string().optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const session = await requireAuth();
  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const validation = createLogSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        message: "Invalid request body",
        errors: validation.error.issues,
      },
      { status: 400 }
    );
  }

  const { action, targetId, groupId, metadata } = validation.data;

  const { RISK_LEVELS } = await import("@/shared/types/activity-log");
  const riskLevel = RISK_LEVELS[action] || "LOW";

  const log = await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      userName: session.user.name || session.user.email || "Unknown",
      userRole: session.user.role,
      action,
      targetId: targetId || null,
      groupId: groupId || null,
      metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
      riskLevel,
      createdAt: new Date(),
    },
  });

  return NextResponse.json(log, { status: 201 });
}
