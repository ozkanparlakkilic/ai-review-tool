import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { requireAuth } from "@/server/auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const sortFieldEnum = z.enum(["updatedAt", "createdAt", "priority", "status"]);
const sortDirEnum = z.enum(["asc", "desc"]);

const querySchema = z.object({
  status: z.array(z.enum(["PENDING", "APPROVED", "REJECTED"])).optional(),
  priority: z.array(z.enum(["low", "medium", "high", "critical"])).optional(),
  q: z.string().optional(),
  sortBy: z
    .union([sortFieldEnum, z.array(sortFieldEnum)])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
    }),
  sortDir: z
    .union([sortDirEnum, z.array(sortDirEnum)])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return Array.isArray(val) ? val : [val];
    }),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const SORTABLE_FIELDS = {
  updatedAt: "updatedAt",
  createdAt: "createdAt",
  priority: "priority",
  status: "status",
} as const;

export async function GET(request: NextRequest) {
  const authError = await requireAuth();
  if (authError instanceof NextResponse) {
    return authError;
  }

  const { searchParams } = new URL(request.url);

  const statusParams = searchParams.getAll("status");
  const priorityParams = searchParams.getAll("priority");
  const sortByParams = searchParams.getAll("sortBy");
  const sortDirParams = searchParams.getAll("sortDir");

  const query = {
    status: statusParams.length > 0 ? statusParams : undefined,
    priority: priorityParams.length > 0 ? priorityParams : undefined,
    q: searchParams.get("q") || undefined,
    sortBy: sortByParams.length > 0 ? sortByParams : undefined,
    sortDir: sortDirParams.length > 0 ? sortDirParams : undefined,
    page: searchParams.get("page") || "1",
    limit: searchParams.get("limit") || "10",
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

  const { status, priority, q, sortBy, sortDir, page, limit } = validation.data;

  const where: Prisma.ReviewItemWhereInput = {};

  if (status && status.length > 0) {
    where.status = status.length === 1 ? status[0] : { in: status };
  }

  if (priority && priority.length > 0) {
    where.priority = priority.length === 1 ? priority[0] : { in: priority };
  }

  if (q) {
    where.OR = [
      { prompt: { contains: q, mode: "insensitive" } },
      { modelOutput: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy:
    | Prisma.ReviewItemOrderByWithRelationInput
    | Prisma.ReviewItemOrderByWithRelationInput[];

  if (sortBy && sortBy.length > 0 && sortDir && sortDir.length > 0) {
    const orderByArray: Prisma.ReviewItemOrderByWithRelationInput[] = [];
    const maxLength = Math.min(sortBy.length, sortDir.length);

    for (let i = 0; i < maxLength; i++) {
      const field = sortBy[i];
      const direction = sortDir[i] || "desc";
      const orderByField =
        SORTABLE_FIELDS[field as keyof typeof SORTABLE_FIELDS];
      if (orderByField) {
        orderByArray.push({
          [orderByField]: direction,
        } as Prisma.ReviewItemOrderByWithRelationInput);
      }
    }

    if (orderByArray.length === 0) {
      orderBy = {
        updatedAt: "desc",
      } as Prisma.ReviewItemOrderByWithRelationInput;
    } else if (orderByArray.length === 1) {
      orderBy = orderByArray[0];
    } else {
      orderBy = orderByArray;
    }
  } else {
    orderBy = {
      updatedAt: "desc",
    } as Prisma.ReviewItemOrderByWithRelationInput;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.reviewItem.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.reviewItem.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    items,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  });
}
