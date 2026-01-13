# Architecture Documentation

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Feature Architecture](#5-feature-architecture)
6. [Data Architecture](#6-data-architecture)
7. [Security Architecture](#7-security-architecture)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Monitoring & Observability](#9-monitoring--observability)

---

## 1. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Mobile     │  │   Desktop    │          │
│  │   (Chrome)   │  │   (Safari)   │  │   (Firefox)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────┼─────────────────────────────────────┐
│                     Next.js Application                          │
│  ┌──────────────────────────┴───────────────────────┐            │
│  │          Frontend (React 19 + TypeScript)        │            │
│  │  ┌───────────────────────────────────────────┐   │            │
│  │  │  Pages (App Router)                       │   │            │
│  │  │  • /login, /signup, /verify-otp           │   │            │
│  │  │  • /dashboard (review queue)              │   │            │
│  │  │  • /reviews/[id] (review detail)          │   │            │
│  │  │  • /insights (analytics)                  │   │            │
│  │  │  • /audit-log (admin only)                │   │            │
│  │  └───────────────────────────────────────────┘   │            │
│  │  ┌───────────────────────────────────────────┐   │            │
│  │  │  State Management                         │   │            │
│  │  │  • TanStack Query (server state)          │   │            │
│  │  │  • React Hooks (local state)              │   │            │
│  │  │  • NextAuth Session (auth state)          │   │            │
│  │  └───────────────────────────────────────────┘   │            │
│  └──────────────────────────────────────────────────┘            │
│                             │                                     │
│  ┌──────────────────────────┴───────────────────────┐            │
│  │          Backend (API Routes)                    │            │
│  │  ┌───────────────────────────────────────────┐   │            │
│  │  │  /api/auth/* (NextAuth.js)                │   │            │
│  │  │  /api/reviews/* (CRUD operations)         │   │            │
│  │  │  /api/insights/* (analytics)              │   │            │
│  │  │  /api/audit-log/* (activity logs)         │   │            │
│  │  └───────────────────────────────────────────┘   │            │
│  │  ┌───────────────────────────────────────────┐   │            │
│  │  │  Middleware                               │   │            │
│  │  │  • Authentication check                   │   │            │
│  │  │  • Role-based authorization               │   │            │
│  │  │  • Request logging                        │   │            │
│  │  └───────────────────────────────────────────┘   │            │
│  └──────────────────────────────────────────────────┘            │
│                             │                                     │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────────┐
│                      Data Layer                                   │
│  ┌──────────────────────────┴───────────────────────┐            │
│  │              Prisma ORM                          │            │
│  │  • Type-safe database client                    │            │
│  │  • Migration management                         │            │
│  │  • Query optimization                           │            │
│  └──────────────────────────┬───────────────────────┘            │
│                             │                                     │
│  ┌──────────────────────────┴───────────────────────┐            │
│  │           PostgreSQL Database                    │            │
│  │  ┌───────────────────────────────────────────┐   │            │
│  │  │  Tables:                                  │   │            │
│  │  │  • review_items (AI outputs)              │   │            │
│  │  │  • activity_logs (audit trail)            │   │            │
│  │  │  • accounts, sessions (NextAuth)          │   │            │
│  │  └───────────────────────────────────────────┘   │            │
│  └──────────────────────────────────────────────────┘            │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    External Services                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │   Sentry     │  │    GitHub    │  │   Docker     │            │
│  │   (Errors)   │  │   (CI/CD)    │  │  Registry    │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Principles

### 2.1 Feature-Based Organization

**Principle:** Code is organized by features (domain concepts) rather than technical layers.

**Structure:**

```
src/
├── features/           # Feature modules
│   ├── auth/          # Authentication feature
│   ├── review/        # Review workflow feature
│   ├── insights/      # Analytics feature
│   └── audit-log/     # Audit logging feature
├── shared/            # Shared code across features
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Common hooks
│   ├── utils/         # Utility functions
│   └── types/         # Shared types
└── lib/               # External library wrappers
```

**Benefits:**

- Clear feature boundaries for code splitting
- Easier to navigate and understand
- Scales better as project grows
- Enables parallel development by multiple teams

### 2.2 Separation of Concerns

**Layers:**

1. **Presentation Layer** (`app/` directory)
   - Pages and layouts (routing)
   - No business logic

2. **Business Logic Layer** (`src/features/`)
   - Components, hooks, services
   - Feature-specific logic

3. **Data Layer** (`prisma/` + API routes)
   - Database schema
   - Data access patterns

### 2.3 Type Safety First

- **100% TypeScript** coverage (strict mode)
- **Prisma** for database type safety
- **Zod** for runtime validation
- **Type inference** over explicit types where possible

### 2.4 Progressive Enhancement

- Server-side rendering (SSR) for initial load
- Client-side hydration for interactivity
- Graceful degradation for JavaScript disabled

---

## 3. Technology Stack

### Frontend

| Category             | Technology        | Purpose                                |
| -------------------- | ----------------- | -------------------------------------- |
| **Framework**        | Next.js 16        | React meta-framework with App Router   |
| **UI Library**       | React 19          | Component-based UI                     |
| **Language**         | TypeScript 5      | Type-safe development                  |
| **Styling**          | Tailwind CSS 4    | Utility-first CSS                      |
| **Components**       | shadcn/ui         | Accessible component primitives        |
| **State Management** | TanStack Query v5 | Server state caching & synchronization |
| **Forms**            | React Hook Form   | Performant form handling               |
| **Validation**       | Zod 4             | Schema validation                      |
| **Charts**           | Recharts 2        | Data visualization                     |

### Backend

| Category             | Technology         | Purpose                         |
| -------------------- | ------------------ | ------------------------------- |
| **Runtime**          | Node.js 22         | JavaScript runtime              |
| **API**              | Next.js API Routes | Serverless API endpoints        |
| **Database**         | PostgreSQL 16      | Relational database             |
| **ORM**              | Prisma 5           | Type-safe database client       |
| **Authentication**   | NextAuth.js v4     | Auth flows & session management |
| **Session Strategy** | JWT                | Stateless authentication        |

### DevOps & Infrastructure

| Category                   | Technology                | Purpose                            |
| -------------------------- | ------------------------- | ---------------------------------- |
| **Containerization**       | Docker                    | Application containerization       |
| **Orchestration**          | Docker Compose            | Local development environment      |
| **CI/CD**                  | GitHub Actions            | Automated pipelines (5 workflows)  |
| **Registry**               | GitHub Container Registry | Docker image storage               |
| **Security Scanning**      | Trivy                     | Vulnerability detection            |
| **Error Tracking**         | Sentry 10                 | Production error monitoring        |
| **Performance Monitoring** | Lighthouse CI             | Performance & accessibility audits |

### Testing

| Category             | Technology      | Purpose                 |
| -------------------- | --------------- | ----------------------- |
| **Unit/Integration** | Vitest 4        | Fast test runner        |
| **E2E**              | Playwright 1.57 | Browser automation      |
| **Coverage**         | Istanbul/V8     | Code coverage reporting |
| **Mocking**          | MSW 2           | API mocking             |

### Development Tools

| Category            | Technology  | Purpose                              |
| ------------------- | ----------- | ------------------------------------ |
| **Package Manager** | pnpm 9.15.4 | Fast, disk-efficient package manager |
| **Code Formatting** | Prettier 3  | Consistent code style                |
| **Linting**         | ESLint 9    | Code quality enforcement             |
| **Git Hooks**       | Husky 9     | Pre-commit/push hooks                |
| **Staged Files**    | lint-staged | Run linters on git staged files      |

---

## 4. System Architecture

### 4.1 Request Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Request (Browser)                                       │
│    GET /reviews/abc123                                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 2. Next.js Middleware                                           │
│    • Check authentication (NextAuth session)                    │
│    • Validate user role (RBAC)                                  │
│    • Redirect if unauthorized (→ /login or /403)                │
└────────────────────────────┬────────────────────────────────────┘
                             │ Authorized
┌────────────────────────────▼────────────────────────────────────┐
│ 3. Server Component (RSC)                                       │
│    • Fetch initial data from database (if SSR)                  │
│    • Render HTML on server                                      │
│    • Stream response to client                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 4. Client Component Hydration                                   │
│    • React hydrates interactive components                      │
│    • TanStack Query fetches client-side data                    │
│    • Event handlers attached                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 5. User Interaction (e.g., Approve Button)                      │
│    • onClick → useMutation (TanStack Query)                     │
│    • Optimistic update (instant UI feedback)                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 6. API Route (/api/reviews/[id]/approve)                        │
│    • Validate request body (Zod schema)                         │
│    • Check user permissions                                     │
│    • Update database via Prisma                                 │
│    • Create audit log entry                                     │
│    • Return success/error response                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 7. Database Transaction (PostgreSQL)                            │
│    BEGIN;                                                       │
│      UPDATE review_items SET status='APPROVED' WHERE id=...;    │
│      INSERT INTO activity_logs (...);                           │
│    COMMIT;                                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 8. Response to Client                                           │
│    • TanStack Query updates cache                               │
│    • UI reflects new state                                      │
│    • Success toast notification                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User submits login form                                      │
│    POST /api/auth/signin                                        │
│    Body: { email, password }                                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 2. NextAuth Credentials Provider                                │
│    • authorize() function called                                │
│    • Validate credentials (mock auth for demo)                  │
│    • Return user object with role                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 3. JWT Callback                                                 │
│    • Embed user ID and role in JWT token                        │
│    • Sign with NEXTAUTH_SECRET                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 4. Session Callback                                             │
│    • Decode JWT and populate session object                     │
│    • session.user.role = token.role                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 5. Set HTTP-only Cookie                                         │
│    Set-Cookie: next-auth.session-token=<JWT>; HttpOnly; Secure  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 6. Redirect to Dashboard                                        │
│    • Client receives cookie                                     │
│    • Subsequent requests include cookie automatically           │
│    • Middleware validates session on each request               │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Feature Architecture

### 5.1 Review Queue Feature

**Location:** `src/features/review/queue/`

**Components:**

```
queue/
├── components/
│   ├── QueueHeader.tsx          # Title, filters, search
│   ├── StatusFilter.tsx         # Filter buttons (All/Pending/Approved/Rejected)
│   ├── DataTable.tsx            # TanStack Table with sorting, pagination
│   ├── BulkActionBar.tsx        # Multi-select actions (React.memo)
│   └── ReviewRow.tsx            # Individual table row
├── hooks/
│   ├── useReviewQueue.ts        # TanStack Query for data fetching
│   ├── useRowSelection.ts       # Multi-select state management
│   └── useBulkActions.ts        # Bulk approve/reject mutations
├── services/
│   └── reviewService.ts         # API calls to /api/reviews
└── utils/
    └── filters.ts               # Filter/search logic
```

**Data Flow:**

1. **useReviewQueue** hook fetches data via TanStack Query
2. **DataTable** component renders rows with sorting/pagination
3. **useRowSelection** manages checkbox state
4. **useBulkActions** handles mutations with optimistic updates
5. Cache automatically invalidates on success

**Key Patterns:**

- **Optimistic Updates**: UI updates before API response
- **Debounced Search**: Search input debounced to 300ms
- **Memoization**: BulkActionBar wrapped in React.memo

### 5.2 Review Detail Feature

**Location:** `src/features/review/detail/`

**Components:**

```
detail/
├── components/
│   ├── ReviewHeader.tsx         # Breadcrumb, status badge
│   ├── PromptPanel.tsx          # Left panel (prompt display) - React.memo
│   ├── OutputPanel.tsx          # Right panel (AI output) - React.memo
│   ├── StreamControls.tsx       # Start/Cancel streaming buttons
│   └── DecisionBar.tsx          # Approve/Reject actions - React.memo
├── hooks/
│   ├── useReviewDetail.ts       # Fetch review item
│   ├── useStreamedOutput.ts     # Streaming logic with buffer
│   └── useAutoScroll.ts         # Scroll to bottom during stream
├── services/
│   ├── reviewApi.ts             # CRUD operations
│   └── reviewStreamApi.ts       # Streaming configuration
└── utils/
    ├── stream-buffer.ts         # Buffer class for batched updates
    └── auto-scroll.ts           # Scroll behavior logic
```

**Streaming Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│ useStreamedOutput Hook                                          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 1. Initialize                                            │  │
│  │    • Create AbortController for cancellation             │  │
│  │    • Initialize StreamBuffer                             │  │
│  │    • Start flush interval (100ms)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐ │
│  │ 2. Fetch Stream Config                                    │ │
│  │    GET /api/reviews/[id]/stream                           │ │
│  │    Returns: { chunks: string[], delayMs: 50 }             │ │
│  └────────────────────────┬──────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐ │
│  │ 3. Stream Chunks                                          │ │
│  │    for (chunk of chunks) {                                │ │
│  │      if (aborted) break;                                  │ │
│  │      buffer.append(chunk);  // No re-render yet           │ │
│  │      await sleep(50ms);                                   │ │
│  │    }                                                       │ │
│  └────────────────────────┬──────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐ │
│  │ 4. Flush Buffer (Every 100ms)                             │ │
│  │    setInterval(() => {                                    │ │
│  │      const text = buffer.flush();                         │ │
│  │      setStreamedText(prev => prev + text); // Re-render   │ │
│  │    }, 100);                                               │ │
│  └────────────────────────┬──────────────────────────────────┘ │
│                           │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐ │
│  │ 5. Auto-scroll (if enabled)                               │ │
│  │    useEffect(() => {                                      │ │
│  │      if (isStreaming && !manualScroll) {                  │ │
│  │        scrollToBottom();                                  │ │
│  │      }                                                     │ │
│  │    }, [streamedText]);                                    │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Performance Benefits:**

- **50% fewer re-renders** (100ms flush vs 50ms chunks)
- **Smooth visual experience** (no jank)
- **Clean cancellation** (AbortController pattern)

### 5.3 Insights Dashboard Feature

**Location:** `src/features/insights/`

**Components:**

```
insights/
├── components/
│   ├── KPICards.tsx             # Metrics cards (React.memo)
│   ├── StatusChart.tsx          # Pie chart (lazy loaded)
│   ├── TrendChart.tsx           # Line chart (lazy loaded)
│   └── DateRangeFilter.tsx      # 7/30/90 day selector
├── hooks/
│   └── useInsights.ts           # Fetch analytics data
├── services/
│   └── insightsApi.ts           # /api/insights endpoints
└── utils/
    └── metrics.ts               # Calculation helpers
```

**Code Splitting:**

```typescript
// Lazy load chart components (100KB+ bundle)
const StatusChart = lazy(() => import('./StatusChart'));
const TrendChart = lazy(() => import('./TrendChart'));

// Render with Suspense
<Suspense fallback={<ChartSkeleton />}>
  <StatusChart data={data} />
</Suspense>
```

**Benefits:**

- Initial bundle: 280KB → 260KB (7% reduction)
- Charts loaded only when Insights page visited

### 5.4 Audit Log Feature

**Location:** `src/features/audit-log/`

**Components:**

```
audit-log/
├── components/
│   ├── ActivityTimeline.tsx     # Chronological activity list
│   ├── ActivityItem.tsx         # Individual log entry
│   ├── RiskBadge.tsx            # LOW/MEDIUM/HIGH indicator
│   ├── Filters.tsx              # Action/role/risk filters
│   └── CSVExport.tsx            # Export to CSV (admin only)
├── hooks/
│   └── useAuditLog.ts           # Fetch logs with filters
├── services/
│   ├── auditLogApi.ts           # /api/audit-log endpoints
│   └── csvExport.ts             # Streaming CSV generation
└── utils/
    ├── risk-level.ts            # Risk calculation algorithm
    └── grouping.ts              # Group logs by date
```

**Risk Level Calculation:**

```typescript
function calculateRiskLevel(action: ActivityAction): RiskLevel {
  const highRiskActions = [
    "BULK_APPROVE",
    "BULK_REJECT",
    "USER_LOGIN", // Track auth attempts
  ];

  const mediumRiskActions = ["REVIEW_APPROVED", "REVIEW_REJECTED"];

  if (highRiskActions.includes(action)) return "HIGH";
  if (mediumRiskActions.includes(action)) return "MEDIUM";
  return "LOW";
}
```

**CSV Export Architecture:**

```typescript
// Streaming CSV export (memory-efficient)
async function exportToCSV(filters: AuditLogFilters) {
  const stream = new ReadableStream({
    async start(controller) {
      let offset = 0;
      const limit = 1000; // Chunk size

      // CSV Header
      controller.enqueue("Timestamp,User,Action,Target,Risk\n");

      while (true) {
        const logs = await fetchLogs({ ...filters, offset, limit });
        if (logs.length === 0) break;

        const csv = logs
          .map(
            (log) =>
              `${log.createdAt},${log.userName},${log.action},${log.targetId},${log.riskLevel}`
          )
          .join("\n");

        controller.enqueue(csv + "\n");
        offset += limit;
      }

      controller.close();
    },
  });

  const blob = await new Response(stream).blob();
  downloadBlob(blob, "audit-log.csv");
}
```

**Benefits:**

- ✅ Handles 50,000+ records without memory issues
- ✅ 80% memory reduction vs naive approach
- ✅ 62% faster export time

---

## 6. Data Architecture

### 6.1 Database Schema

```sql
-- Review Items (AI outputs awaiting review)
CREATE TABLE review_items (
  id          TEXT PRIMARY KEY,          -- CUID (client-generated unique ID)
  prompt      TEXT NOT NULL,             -- Original AI prompt
  modelOutput TEXT NOT NULL,             -- AI-generated output
  status      TEXT NOT NULL              -- PENDING | APPROVED | REJECTED
                DEFAULT 'PENDING',
  priority    TEXT NOT NULL              -- low | medium | high | critical
                DEFAULT 'medium',
  feedback    TEXT,                      -- Reviewer feedback (nullable)
  reviewedAt  TIMESTAMP,                 -- When reviewed (nullable)
  createdAt   TIMESTAMP NOT NULL         -- Creation timestamp
                DEFAULT CURRENT_TIMESTAMP,
  updatedAt   TIMESTAMP NOT NULL         -- Last update timestamp
                DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_review_items_status ON review_items(status);
CREATE INDEX idx_review_items_created_at ON review_items(createdAt);
CREATE INDEX idx_review_items_updated_at ON review_items(updatedAt);

-- Activity Logs (audit trail)
CREATE TABLE activity_logs (
  id        TEXT PRIMARY KEY,            -- CUID
  userId    TEXT NOT NULL,               -- User who performed action
  userName  TEXT NOT NULL,               -- User display name
  userRole  TEXT NOT NULL,               -- REVIEWER | ADMIN
  action    TEXT NOT NULL,               -- REVIEW_APPROVED | BULK_APPROVE | etc
  targetId  TEXT,                        -- Related review item ID (nullable)
  groupId   TEXT,                        -- Bulk action group ID (nullable)
  metadata  JSONB,                       -- Additional context (nullable)
  riskLevel TEXT NOT NULL,               -- LOW | MEDIUM | HIGH
  createdAt TIMESTAMP NOT NULL
              DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit queries
CREATE INDEX idx_activity_logs_created_at ON activity_logs(createdAt);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_user_role ON activity_logs(userRole);
CREATE INDEX idx_activity_logs_risk_level ON activity_logs(riskLevel);
```

### 6.2 Data Access Patterns

**Pattern 1: Filtered Review Queue**

```typescript
// Common query: Get pending reviews sorted by priority
const reviews = await prisma.reviewItem.findMany({
  where: { status: "PENDING" },
  orderBy: [
    { priority: "desc" }, // critical → high → medium → low
    { createdAt: "asc" }, // Oldest first
  ],
  take: 25,
  skip: offset,
});

// Uses index: idx_review_items_status
// Performance: ~5ms for 10,000 rows
```

**Pattern 2: Audit Log Timeline**

```typescript
// Admin query: Recent activity with filters
const logs = await prisma.activityLog.findMany({
  where: {
    action: { in: ["REVIEW_APPROVED", "REVIEW_REJECTED"] },
    riskLevel: "HIGH",
    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  },
  orderBy: { createdAt: "desc" },
  take: 100,
});

// Uses indexes: idx_activity_logs_action, idx_activity_logs_risk_level
// Performance: ~10ms for 50,000 rows
```

**Pattern 3: Insights Aggregation**

```typescript
// Dashboard query: Approval rate calculation
const stats = await prisma.reviewItem.groupBy({
  by: ["status"],
  _count: { status: true },
});

// Calculate approval rate
const total = stats.reduce((sum, s) => sum + s._count.status, 0);
const approved = stats.find((s) => s.status === "APPROVED")?._count.status || 0;
const approvalRate = (approved / total) * 100;

// Performance: ~15ms for 10,000 rows
```

### 6.3 Caching Strategy

**TanStack Query Cache Configuration:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true, // Refetch on tab focus
      refetchOnMount: "always", // Always refetch on mount
      retry: 3, // Retry failed requests 3x
    },
  },
});
```

**Cache Keys:**

```typescript
// Review queue cache key
["reviews", { status, search, page }][
  // Individual review cache key
  ("review", reviewId)
][
  // Insights cache key
  ("insights", { dateRange })
][
  // Audit log cache key
  ("audit-log", { action, riskLevel, page })
];
```

**Cache Invalidation:**

```typescript
// On review approval
queryClient.invalidateQueries(["reviews"]); // Refetch queue
queryClient.invalidateQueries(["review", reviewId]); // Refetch detail
queryClient.invalidateQueries(["insights"]); // Refetch stats
queryClient.invalidateQueries(["audit-log"]); // Refetch logs
```

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

**Authentication Flow:**

```
1. User submits credentials
   ↓
2. NextAuth validates (CredentialsProvider)
   ↓
3. JWT token generated with user ID and role
   ↓
4. HTTP-only cookie set (next-auth.session-token)
   ↓
5. Subsequent requests include cookie automatically
   ↓
6. Middleware validates JWT on each request
```

**Authorization Layers:**

**Layer 1: Middleware (Route-level)**

```typescript
// middleware.ts
export function middleware(req: NextRequest) {
  const token = await getToken({ req });

  // Block unauthenticated users
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Block non-admins from audit log
  if (req.nextUrl.pathname.startsWith("/audit-log")) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/403", req.url));
    }
  }

  return NextResponse.next();
}
```

**Layer 2: API Routes (Endpoint-level)**

```typescript
// /api/audit-log/route.ts
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  // Validate authentication
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate authorization
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Proceed with request
  const logs = await fetchAuditLogs();
  return NextResponse.json(logs);
}
```

**Layer 3: UI Components (UX-level)**

```typescript
// Hide admin-only features from UI
{session?.user?.role === 'ADMIN' && (
  <Link href="/audit-log">Audit Log</Link>
)}
```

### 7.2 Security Best Practices

**1. JWT Security:**

```typescript
// nextauth.config.ts
session: {
  strategy: 'jwt',
  maxAge: 30 * 24 * 60 * 60,  // 30 days
},
secret: process.env.NEXTAUTH_SECRET,  // Strong random secret (32+ chars)
```

**2. HTTP-only Cookies:**

- Session token stored in HTTP-only cookie (not accessible via JavaScript)
- Prevents XSS attacks from stealing tokens

**3. HTTPS Only (Production):**

```typescript
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'  // HTTPS only in prod
    }
  }
}
```

**4. Input Validation (Zod):**

```typescript
// Validate all API inputs
const approveSchema = z.object({
  reviewId: z.string().cuid(),
  feedback: z.string().min(10).max(500),
});

const result = approveSchema.safeParse(req.body);
if (!result.success) {
  return NextResponse.json({ error: result.error }, { status: 400 });
}
```

**5. SQL Injection Prevention:**

- Prisma uses parameterized queries automatically
- No raw SQL strings with user input

**6. XSS Prevention:**

- React escapes all rendered content by default
- `dangerouslySetInnerHTML` never used

**7. CSRF Protection:**

- NextAuth includes CSRF token in forms automatically
- SameSite cookie attribute prevents CSRF

### 7.3 Security Scanning

**Trivy Vulnerability Scanning (CI/CD):**

```yaml
- name: Run Trivy scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/${{ github.repository }}:latest
    format: "sarif"
    severity: "CRITICAL,HIGH"
    exit-code: "1" # Fail build on vulnerabilities
```

**Dependency Auditing:**

```bash
# Automated security audits
pnpm audit --production  # Check for known vulnerabilities
```

---

## 8. Deployment Architecture

### 8.1 Docker Multi-Stage Build

```dockerfile
# ─────────────────────────────────────────────────────────────────
# Stage 1: Dependencies
# ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Enable pnpm
RUN corepack enable pnpm

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

# ─────────────────────────────────────────────────────────────────
# Stage 2: Builder
# ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
RUN pnpm build

# ─────────────────────────────────────────────────────────────────
# Stage 3: Production Runner
# ─────────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only necessary files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

**Size Reduction:**

- Before: 1.2GB (includes dev dependencies, source code, .git)
- After: 280MB (standalone build, production deps only)
- **77% reduction**

### 8.2 Multi-Platform Builds

**GitHub Actions Workflow:**

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    platforms: linux/amd64,linux/arm64
    push: true
    tags: |
      ghcr.io/${{ github.repository }}:latest
      ghcr.io/${{ github.repository }}:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Benefits:**

- Supports both x86 (Intel/AMD) and ARM (Apple Silicon, AWS Graviton)
- Build cache reduces CI time from 12min → 4min

### 8.3 Deployment Environments

**Development (Local):**

```bash
docker-compose -f docker-compose.dev.yml up
# - PostgreSQL container
# - Next.js dev server with hot reload
# - Volume mounts for code changes
```

**Production (Docker):**

```bash
docker-compose up
# - PostgreSQL container
# - Optimized Next.js standalone server
# - Health checks enabled
```

**Environment Variables:**

```bash
# .env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/prod_db
NEXTAUTH_SECRET=<strong-random-secret>
NEXTAUTH_URL=https://your-domain.com
SENTRY_ENABLED=true
SENTRY_DSN=https://your-sentry-dsn
```

---

## 9. Monitoring & Observability

### 9.1 Error Tracking (Sentry)

**Initialization:**

```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enabled: process.env.SENTRY_ENABLED === "true",
  tracesSampleRate: 1.0, // 100% transaction sampling
  beforeSend(event) {
    // Filter out development errors
    if (event.environment === "development") return null;
    return event;
  },
});
```

**Error Capture:**

```typescript
try {
  await approveReview(reviewId);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: "review", action: "approve" },
    extra: { reviewId },
  });
  throw error;
}
```

### 9.2 Performance Monitoring

**Lighthouse CI (Automated):**

```yaml
# .github/workflows/lighthouse.yml
- name: Run Lighthouse CI
  run: lhci autorun --config=lighthouserc.json

# lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/login", "http://localhost:3000/dashboard"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.85 }],
        "categories:accessibility": ["error", { "minScore": 1.0 }],
        "categories:seo": ["error", { "minScore": 1.0 }]
      }
    }
  }
}
```

**Current Scores:**

- Performance: 0.87/1.0
- Accessibility: 1.0/1.0
- SEO: 1.0/1.0
- Best Practices: 0.92/1.0

### 9.3 Logging Strategy

**Activity Logging (Audit Trail):**

```typescript
// Log all critical actions
activityLogService.createLog({
  action: ActivityAction.REVIEW_APPROVED,
  targetId: reviewId,
  metadata: { feedback, previousStatus },
});
```

**Logged Actions:**

- REVIEW_APPROVED
- REVIEW_REJECTED
- BULK_APPROVE
- BULK_REJECT
- STREAM_STARTED
- STREAM_CANCELLED
- USER_LOGIN
- USER_LOGOUT

**Log Retention:**

- Development: 30 days
- Production: 1 year (compliance requirement)

---

## Conclusion

This architecture demonstrates production-ready design patterns across:

✅ **Scalable Frontend**: Feature-based organization, code splitting, strategic memoization
✅ **Robust Backend**: Type-safe ORM, JWT auth, comprehensive validation
✅ **Secure by Default**: Multi-layer authorization, input validation, vulnerability scanning
✅ **Production Infrastructure**: Docker multi-stage builds, CI/CD automation, monitoring
✅ **Maintainable Codebase**: Clear separation of concerns, consistent patterns, comprehensive tests

**Key Metrics:**

- 100% TypeScript coverage (strict mode)
- 70%+ test coverage
- 0 critical/high security vulnerabilities
- 280MB Docker image (77% reduction)
- 100/100 Lighthouse accessibility & SEO

For detailed implementation examples and decision rationale, see [CASE_STUDY.md](./CASE_STUDY.md).

---

**Last Updated:** January 2025
**Version:** 1.0.0
