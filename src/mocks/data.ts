import { ReviewItem, ReviewStatus, Priority } from "@/shared/types";
import { ActivityLog, ActivityAction } from "@/shared/types/activity-log";
import { ROLES } from "@/shared/constants/roles";

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
];

const getRandomStatus = (): ReviewStatus => {
  const statuses: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];
  return statuses[Math.floor(Math.random() * statuses.length)];
};

const getRandomPriority = (): Priority => {
  const priorities: Priority[] = ["low", "medium", "high", "critical"];
  return priorities[Math.floor(Math.random() * priorities.length)];
};

export const mockReviewItems: ReviewItem[] = Array.from({ length: 50 }).map(
  (_, i) => {
    const status = getRandomStatus();
    const created = new Date();
    created.setDate(created.getDate() - Math.floor(Math.random() * 30));

    const updated = new Date(created);
    updated.setHours(updated.getHours() + Math.floor(Math.random() * 24));

    return {
      id: `review-${i + 1}`,
      prompt: PROMPTS[Math.floor(Math.random() * PROMPTS.length)],
      modelOutput:
        "Here is a detailed explanation of the topic you requested. It covers the main concepts, provides examples, and concludes with a summary...",
      status,
      priority: getRandomPriority(),
      createdAt: created.toISOString(),
      updatedAt: updated.toISOString(),
      reviewedAt: status !== "PENDING" ? updated.toISOString() : null,
      feedback: status === "REJECTED" ? "Output contains factual errors" : null,
    };
  }
);

export const mockActivityLogs: ActivityLog[] = [
  {
    id: "log-1",
    userId: "user-1",
    userName: "Admin User",
    userRole: ROLES.ADMIN,
    action: ActivityAction.USER_LOGIN,
    riskLevel: "LOW",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "log-2",
    userId: "user-2",
    userName: "Reviewer User",
    userRole: ROLES.REVIEWER,
    action: ActivityAction.REVIEW_APPROVED,
    targetId: "review-1",
    riskLevel: "LOW",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: "log-3",
    userId: "user-1",
    userName: "Admin User",
    userRole: ROLES.ADMIN,
    action: ActivityAction.BULK_REJECT,
    metadata: {
      count: 5,
      ids: ["review-2", "review-3", "review-4", "review-5", "review-6"],
    },
    riskLevel: "HIGH",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];
