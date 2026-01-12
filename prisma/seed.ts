import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PROMPTS = [
  "Explain quantum computing in simple terms",
  "Write a SQL query to find duplicate records",
  "How to center a div in CSS",
  "Best practices for API authentication",
  "Explain the difference between let and var in JavaScript",
  "How to implement debouncing in React",
  "What is the CAP theorem in distributed systems",
  "Docker vs Virtual Machines",
  "Explain React hooks useState",
  "What is RESTful API design",
  "How to optimize React performance",
  "What is GraphQL and how does it differ from REST",
  "Explain microservices architecture",
  "What is CI/CD pipeline",
  "How to handle authentication in Next.js",
  "What is TypeScript and its benefits",
  "Explain the concept of closure in JavaScript",
  "What is the purpose of Kubernetes",
  "How to implement pagination in an API",
  "What are the SOLID principles",
  "Explain database indexing strategies",
  "How does caching improve application performance",
  "What is the difference between SQL and NoSQL databases",
  "Explain OAuth 2.0 authentication flow",
  "How to handle errors in async JavaScript code",
];

const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;
const PRIORITIES = ["low", "medium", "high", "critical"] as const;

async function main() {
  console.log("Starting seed...");

  await prisma.reviewItem.deleteMany();
  await prisma.activityLog.deleteMany();

  const reviewItems = [];

  for (let i = 0; i < 25; i++) {
    const statusIndex = i % 3;
    const status = STATUSES[statusIndex];
    const priorityIndex = i % 4;
    const priority = PRIORITIES[priorityIndex];
    const promptIndex = i % PROMPTS.length;

    const created = new Date();
    created.setDate(created.getDate() - (25 - i));

    const updated = new Date(created);
    if (status !== "PENDING") {
      updated.setHours(updated.getHours() + Math.floor(i / 3) + 1);
    }

    const reviewItem = await prisma.reviewItem.create({
      data: {
        prompt: PROMPTS[promptIndex],
        modelOutput:
          "Here is a detailed explanation of the topic you requested. It covers the main concepts, provides examples, and concludes with a summary. This output is deterministic for E2E testing purposes.",
        status,
        priority,
        feedback:
          status === "REJECTED" ? "Output contains factual errors" : null,
        reviewedAt: status !== "PENDING" ? updated : null,
        createdAt: created,
        updatedAt: updated,
      },
    });

    reviewItems.push(reviewItem);

    if (status !== "PENDING") {
      await prisma.activityLog.create({
        data: {
          userId: status === "APPROVED" ? "user-2" : "user-1",
          userName: status === "APPROVED" ? "Reviewer User" : "Admin User",
          userRole: status === "APPROVED" ? "REVIEWER" : "ADMIN",
          action: status === "APPROVED" ? "REVIEW_APPROVED" : "REVIEW_REJECTED",
          targetId: reviewItem.id,
          riskLevel: status === "APPROVED" ? "LOW" : "LOW",
          createdAt: updated,
        },
      });
    }
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
      userId: "user-1",
      userName: "Admin User",
      userRole: "ADMIN",
      action: "BULK_REJECT",
      metadata: {
        count: 5,
        ids: reviewItems.slice(0, 5).map((item) => item.id),
      },
      riskLevel: "HIGH",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
  });

  console.log(`Seeded ${reviewItems.length} review items`);
  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
