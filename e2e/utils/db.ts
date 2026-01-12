import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.test"), override: true });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

export async function waitForDatabase(maxRetries = 30, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw new Error(
          `Database connection failed after ${maxRetries} attempts: ${error}`
        );
      }
    }
  }
  return false;
}

export async function cleanDatabase() {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  for (const { tablename } of tablenames) {
    if (tablename !== "_prisma_migrations") {
      try {
        await prisma.$executeRawUnsafe(
          `TRUNCATE TABLE "public"."${tablename}" CASCADE;`
        );
      } catch (error) {
        console.error(`Error truncating table ${tablename}:`, error);
      }
    }
  }
}

let isSchemaReady = false;

export async function setupDatabase() {
  console.log("[DB Setup] Waiting for database connection...");
  await waitForDatabase();

  if (!isSchemaReady) {
    console.log("[DB Setup] Pushing database schema...");
    try {
      execSync("pnpm db:generate", { stdio: "pipe" });
      execSync(
        `dotenv -e .env.test -- prisma db push --skip-generate --accept-data-loss`,
        {
          stdio: "pipe",
          env: { ...process.env, DATABASE_URL },
        }
      );
      isSchemaReady = true;
      console.log("[DB Setup] Database schema pushed successfully");
    } catch (error) {
      console.error("[DB Setup] Failed to push database schema:", error);
      throw error;
    }
  } else {
    console.log("[DB Setup] Database schema already ready, skipping push");
  }
}

export async function seedDatabase() {
  console.log("[DB Setup] Seeding test data...");
  try {
    await cleanDatabase();

    const reviewItems = [
      {
        id: "clx-item-1",
        prompt: "Test prompt 1",
        modelOutput: "Test output 1",
        status: "PENDING" as const,
        priority: "medium" as const,
        createdAt: new Date(),
      },
      {
        id: "clx-item-2",
        prompt: "Test prompt 2",
        modelOutput: "Test output 2",
        status: "APPROVED" as const,
        priority: "high" as const,
        createdAt: new Date(),
      },
      {
        id: "clx-item-3",
        prompt: "Test prompt 3",
        modelOutput: "Test output 3",
        status: "REJECTED" as const,
        priority: "low" as const,
        createdAt: new Date(),
      },
    ];

    for (const item of reviewItems) {
      await prisma.reviewItem.create({
        data: item,
      });
    }

    await prisma.activityLog.create({
      data: {
        userId: "user-1",
        userName: "Admin User",
        userRole: "ADMIN",
        action: "USER_LOGIN",
        riskLevel: "LOW",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: "user-2",
        userName: "Reviewer User",
        userRole: "REVIEWER",
        action: "USER_LOGIN",
        riskLevel: "LOW",
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    });

    console.log("[DB Setup] Test data seeded successfully");
  } catch (error) {
    console.error("[DB Setup] Failed to seed test data:", error);
    throw error;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
