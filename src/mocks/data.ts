import { ReviewItem } from "@/shared/types";

export const mockReviewItems: ReviewItem[] = [
  {
    id: "1",
    prompt: "Explain quantum computing in simple terms",
    modelOutput:
      "Quantum computing uses quantum bits or qubits which can exist in multiple states simultaneously, allowing for parallel processing of information...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    prompt: "Write a SQL query to find duplicate records",
    modelOutput:
      "SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name HAVING COUNT(*) > 1;",
    status: "APPROVED",
    feedback: "Correct and efficient query",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    prompt: "How to center a div in CSS",
    modelOutput:
      "Use flexbox: display: flex; justify-content: center; align-items: center;",
    status: "APPROVED",
    feedback: "Modern and recommended approach",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "4",
    prompt: "Best practices for API authentication",
    modelOutput:
      "Use OAuth 2.0 or JWT tokens. Always use HTTPS. Implement rate limiting and token expiration...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "5",
    prompt: "Explain the difference between let and var in JavaScript",
    modelOutput:
      "let has block scope while var has function scope. let prevents hoisting issues...",
    status: "REJECTED",
    feedback: "Incomplete explanation, missing const comparison",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
  },
  {
    id: "6",
    prompt: "How to implement debouncing in React",
    modelOutput:
      "You can use useEffect with setTimeout or libraries like lodash.debounce...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "7",
    prompt: "What is the CAP theorem in distributed systems",
    modelOutput:
      "CAP theorem states that a distributed system can only guarantee two out of three: Consistency, Availability, and Partition tolerance...",
    status: "APPROVED",
    feedback: "Clear and accurate explanation",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "8",
    prompt: "Docker vs Virtual Machines",
    modelOutput:
      "Docker containers are lightweight and share the host OS kernel, while VMs include a full OS...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "9",
    prompt: "Explain React hooks useState",
    modelOutput:
      "useState is a hook that allows functional components to have state. It returns an array with the current state and a setter function...",
    status: "APPROVED",
    feedback: "Good basic explanation",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "10",
    prompt: "What is RESTful API design",
    modelOutput:
      "REST uses HTTP methods (GET, POST, PUT, DELETE) and follows stateless client-server architecture...",
    status: "REJECTED",
    feedback: "Missing important REST constraints like HATEOAS",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "11",
    prompt: "How to optimize React performance",
    modelOutput:
      "Use React.memo, useMemo, useCallback, lazy loading, code splitting, and avoid unnecessary re-renders...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "12",
    prompt: "What is GraphQL and how does it differ from REST",
    modelOutput:
      "GraphQL is a query language that allows clients to request exactly the data they need...",
    status: "APPROVED",
    feedback: "Comprehensive comparison",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "13",
    prompt: "Explain microservices architecture",
    modelOutput:
      "Microservices is an architectural style where applications are structured as collections of loosely coupled services...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "14",
    prompt: "What is CI/CD pipeline",
    modelOutput:
      "CI/CD stands for Continuous Integration and Continuous Deployment. It automates the software delivery process...",
    status: "REJECTED",
    feedback: "Too vague, needs specific examples",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 15).toISOString(),
  },
  {
    id: "15",
    prompt: "How to handle authentication in Next.js",
    modelOutput:
      "Use NextAuth.js or implement JWT-based authentication with API routes and middleware...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "16",
    prompt: "What is TypeScript and its benefits",
    modelOutput:
      "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. Benefits include type safety, better IDE support...",
    status: "APPROVED",
    feedback: "Clear and accurate",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
  {
    id: "17",
    prompt: "Explain the concept of closure in JavaScript",
    modelOutput:
      "A closure is when a function remembers variables from its outer scope even after the outer function has returned...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: "18",
    prompt: "What is the purpose of Kubernetes",
    modelOutput:
      "Kubernetes is a container orchestration platform that automates deployment, scaling, and management of containerized applications...",
    status: "APPROVED",
    feedback: "Solid overview",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "19",
    prompt: "How to implement pagination in an API",
    modelOutput:
      "Use offset and limit parameters, or cursor-based pagination for better performance at scale...",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: "20",
    prompt: "What are the SOLID principles",
    modelOutput:
      "SOLID is an acronym for five design principles: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion...",
    status: "REJECTED",
    feedback: "List only, needs detailed explanation of each principle",
    reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 11).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
  },
];
