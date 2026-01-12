import { PrismaClient, Prisma } from "@prisma/client";
import { execSync } from "child_process";

let prismaTestInstance: PrismaClient | null = null;

export function getTestPrisma(): PrismaClient {
  if (!prismaTestInstance) {
    prismaTestInstance = new PrismaClient({
      datasourceUrl: process.env.DATABASE_URL,
    });
  }
  return prismaTestInstance;
}

export async function cleanDatabase() {
  const prisma = getTestPrisma();

  await prisma.activityLog.deleteMany();
  await prisma.reviewItem.deleteMany();
}

export function resetDatabase() {
  try {
    execSync("pnpm prisma migrate reset --force --skip-seed", {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });
  } catch (error) {
    console.error("Failed to reset database:", error);
    throw error;
  }
}

export async function pushSchema() {
  try {
    execSync("pnpm prisma db push --skip-generate", {
      stdio: "inherit",
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });
  } catch (error) {
    console.error("Failed to push schema:", error);
    throw error;
  }
}

export async function disconnectTestDb() {
  if (prismaTestInstance) {
    await prismaTestInstance.$disconnect();
    prismaTestInstance = null;
  }
}

export const seedFactory = {
  async createReviewItem(
    data: {
      prompt?: string;
      modelOutput?: string;
      status?: "PENDING" | "APPROVED" | "REJECTED";
      priority?: "low" | "medium" | "high" | "critical";
      feedback?: string | null;
      reviewedAt?: Date | null;
      createdAt?: Date;
      updatedAt?: Date;
    } = {}
  ) {
    const prisma = getTestPrisma();
    const now = new Date();

    return prisma.reviewItem.create({
      data: {
        prompt: data.prompt ?? "Test prompt",
        modelOutput: data.modelOutput ?? "Test model output",
        status: data.status ?? "PENDING",
        priority: data.priority ?? "medium",
        feedback: data.feedback ?? null,
        reviewedAt: data.reviewedAt ?? null,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
      },
    });
  },

  async createReviewItems(count: number, overrides = {}) {
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push(await this.createReviewItem(overrides));
    }
    return items;
  },

  async createActivityLog(
    data: {
      userId?: string;
      userName?: string;
      userRole?: "REVIEWER" | "ADMIN";
      action?:
        | "REVIEW_APPROVED"
        | "REVIEW_REJECTED"
        | "BULK_APPROVE"
        | "BULK_REJECT"
        | "STREAM_STARTED"
        | "STREAM_CANCELLED"
        | "USER_LOGIN"
        | "USER_LOGOUT";
      targetId?: string | null;
      groupId?: string | null;
      metadata?: Prisma.InputJsonValue | null;
      riskLevel?: "LOW" | "MEDIUM" | "HIGH";
      createdAt?: Date;
    } = {}
  ) {
    const prisma = getTestPrisma();
    const now = new Date();

    return prisma.activityLog.create({
      data: {
        userId: data.userId ?? "test-user-id",
        userName: data.userName ?? "Test User",
        userRole: data.userRole ?? "REVIEWER",
        action: data.action ?? "USER_LOGIN",
        targetId: data.targetId ?? null,
        groupId: data.groupId ?? null,
        metadata: data.metadata === null ? Prisma.JsonNull : data.metadata,
        riskLevel: data.riskLevel ?? "LOW",
        createdAt: data.createdAt ?? now,
      },
    });
  },

  async createTestDataset() {
    getTestPrisma(); // Ensure database connection is available

    const pending1 = await this.createReviewItem({
      prompt: "Test pending 1",
      status: "PENDING",
      priority: "high",
    });

    const pending2 = await this.createReviewItem({
      prompt: "Test pending 2",
      status: "PENDING",
      priority: "medium",
    });

    const approved1 = await this.createReviewItem({
      prompt: "Test approved 1",
      status: "APPROVED",
      priority: "low",
      reviewedAt: new Date(),
    });

    const rejected1 = await this.createReviewItem({
      prompt: "Test rejected 1",
      status: "REJECTED",
      priority: "critical",
      feedback: "Test rejection feedback",
      reviewedAt: new Date(),
    });

    await this.createActivityLog({
      action: "REVIEW_APPROVED",
      targetId: approved1.id,
      userId: "reviewer-1",
      userName: "Test Reviewer",
      userRole: "REVIEWER",
    });

    await this.createActivityLog({
      action: "REVIEW_REJECTED",
      targetId: rejected1.id,
      userId: "admin-1",
      userName: "Test Admin",
      userRole: "ADMIN",
    });

    return {
      pending: [pending1, pending2],
      approved: [approved1],
      rejected: [rejected1],
    };
  },
};
