# AI Output Review Tool

A modern human-in-the-loop workflow application for reviewing AI-generated outputs. Built with Next.js 16, featuring role-based access control, real-time streaming, comprehensive audit logging, and production-ready infrastructure.

## 📚 Documentation

- **[Case Study](docs/CASE_STUDY.md)** - Complete project case study with implementation details, challenges, and results
- **[Architecture](docs/ARCHITECTURE.md)** - System architecture, design decisions, and technical deep-dives
- **[README](README.md)** - Quick start guide and project overview (you are here)

## Features

### Core Functionality

- **Review Queue**: Filter, search, sort, and paginate AI-generated outputs with advanced table controls
- **Bulk Actions**: Multi-select approve/reject with optimistic updates and confirmation dialogs
- **Streaming Output**: Real-time buffered rendering with cancel support and auto-scroll awareness
- **Review Detail**: View prompts and outputs, provide feedback, approve/reject with validation

### Security & Access Control

- **Authentication**: Complete auth flows (Sign Up, Login, Forgot Password, OTP verification)
- **Role-Based Access**: Reviewer and Admin roles with protected routes and permissions
- **Audit Log**: Complete activity timeline with CSV export, risk level calculation (Admin only)

### Analytics & Monitoring

- **Insights Dashboard**: KPIs (total reviews, approval rate, average time), status distribution charts, review trends
- **Command Search**: Quick navigation with ⌘K keyboard shortcut
- **Error Tracking**: Sentry integration for production monitoring
- **Performance**: React.memo optimizations, code splitting, bundle analysis

## Tech Stack

| Category             | Technologies                                                |
| -------------------- | ----------------------------------------------------------- |
| **Frontend**         | Next.js 16 (App Router), React 19, TypeScript 5             |
| **Styling**          | Tailwind CSS 4, shadcn/ui components                        |
| **State Management** | TanStack Query v5 (server state), React hooks (local state) |
| **Backend**          | Next.js API Routes, PostgreSQL, Prisma ORM                  |
| **Authentication**   | NextAuth.js v4 with Credentials provider                    |
| **Testing**          | Vitest, React Testing Library, Playwright (E2E)             |
| **Monitoring**       | Sentry (error tracking & performance)                       |
| **DevOps**           | Docker, Docker Compose, GitHub Actions                      |
| **Package Manager**  | pnpm 9.15.4                                                 |

## Project Structure

```
ai-review-tool/
├── app/                                 # Next.js App Router (Pages & Layouts)
│   ├── (auth)/                          # Authentication pages (grouped route)
│   │   ├── login/                       # Login page
│   │   ├── signup/                      # Sign up page
│   │   ├── forgot-password/             # Password reset flow
│   │   └── verify-otp/                  # OTP verification
│   ├── (protected)/                     # Protected pages (require auth)
│   │   ├── dashboard/                   # Main dashboard (review queue)
│   │   ├── reviews/[id]/                # Review detail page (dynamic route)
│   │   ├── insights/                    # Analytics & insights dashboard
│   │   └── audit-log/                   # Activity audit log (admin only)
│   ├── (error)/                         # Error pages
│   │   ├── 401/                         # Unauthorized
│   │   ├── 403/                         # Forbidden
│   │   ├── 404/                         # Not Found
│   │   ├── 500/                         # Internal Server Error
│   │   └── 503/                         # Service Unavailable
│   ├── api/                             # API Routes (Backend)
│   │   ├── auth/                        # NextAuth.js endpoints
│   │   ├── reviews/                     # Review CRUD operations
│   │   ├── insights/                    # Dashboard metrics
│   │   └── audit-log/                   # Activity log endpoints
│   ├── layout.tsx                       # Root layout (providers, metadata)
│   ├── page.tsx                         # Landing/redirect page
│   └── providers.tsx                    # Client providers wrapper
│
├── src/                                 # Source code (Business Logic)
│   ├── components/ui/                   # shadcn/ui primitives
│   │   ├── button.tsx                   # Button component
│   │   ├── input.tsx                    # Input component
│   │   ├── table.tsx                    # Table component
│   │   ├── badge.tsx                    # Badge component
│   │   ├── card.tsx                     # Card component (polymorphic)
│   │   ├── dialog.tsx                   # Dialog/Modal component
│   │   ├── chart.tsx                    # Recharts wrapper
│   │   ├── command.tsx                  # Command menu (⌘K)
│   │   └── ...                          # Other UI primitives
│   │
│   ├── features/                        # Feature-based modules
│   │   ├── auth/                        # Authentication feature
│   │   │   ├── components/              # Auth forms (Login, SignUp, ForgotPassword, OTP)
│   │   │   ├── hooks/                   # useAuth hook
│   │   │   ├── auth.ts                  # NextAuth configuration
│   │   │   └── types.ts                 # Auth types
│   │   │
│   │   ├── review/                      # Review feature
│   │   │   ├── queue/                   # Review queue sub-feature
│   │   │   │   ├── components/          # QueueHeader, StatusFilter, BulkActionBar, DataTable
│   │   │   │   ├── hooks/               # useReviewQueue, useRowSelection, useBulkActions
│   │   │   │   ├── services/            # API service layer
│   │   │   │   ├── utils/               # Filter utilities
│   │   │   │   └── constants/           # Table columns, filter options
│   │   │   │
│   │   │   └── detail/                  # Review detail sub-feature
│   │   │       ├── components/          # ReviewHeader, PromptPanel, OutputPanel, DecisionBar
│   │   │       ├── hooks/               # useReviewDetail, useStreamedOutput
│   │   │       ├── services/            # Review API, streaming API
│   │   │       ├── utils/               # Auto-scroll, stream buffer
│   │   │       └── types.ts             # Review types
│   │   │
│   │   ├── insights/                    # Insights dashboard feature
│   │   │   ├── components/              # KPICards, StatusChart, TrendChart
│   │   │   ├── hooks/                   # useInsights
│   │   │   ├── services/                # Insights API
│   │   │   ├── utils/                   # Metrics formatting
│   │   │   └── types.ts                 # Metrics types
│   │   │
│   │   └── audit-log/                   # Audit log feature
│   │       ├── components/              # ActivityTimeline, CSVExport, Filters
│   │       ├── hooks/                   # useAuditLog
│   │       ├── services/                # Audit log API, CSV export
│   │       ├── utils/                   # Risk level calculation, grouping
│   │       └── types.ts                 # Activity log types
│   │
│   ├── shared/                          # Shared code across features
│   │   ├── components/                  # Reusable business components
│   │   │   ├── header.tsx               # App header with command search
│   │   │   ├── status-badge.tsx         # Status badge (memoized)
│   │   │   ├── empty-state.tsx          # Empty state placeholder
│   │   │   └── errors/                  # Error page components
│   │   │
│   │   ├── providers/                   # React providers
│   │   │   └── query-provider.tsx       # TanStack Query provider
│   │   │
│   │   ├── services/                    # Shared services
│   │   │   └── http.ts                  # HTTP client wrapper
│   │   │
│   │   ├── types/                       # Shared types
│   │   │   ├── review.ts                # Review domain types
│   │   │   └── activity-log.ts          # Activity log types
│   │   │
│   │   ├── utils/                       # Shared utilities
│   │   │   ├── date.ts                  # Date formatting
│   │   │   └── risk-level.ts            # Risk calculation
│   │   │
│   │   └── constants/                   # Shared constants
│   │       └── roles.ts                 # User roles
│   │
│   ├── lib/                             # External library utilities
│   │   └── utils.ts                     # cn() utility, etc.
│   │
│   ├── contexts/                        # React contexts
│   │   └── search-provider.tsx          # Command search context
│   │
│   └── test/                            # Test infrastructure
│       ├── setup/                       # Test setup files
│       ├── utils/                       # Test utilities (render, mocks)
│       └── msw/                         # Mock Service Worker handlers
│
├── prisma/                              # Database
│   ├── schema.prisma                    # Database schema
│   ├── seed.ts                          # Seed data script
│   └── migrations/                      # Database migrations
│
├── e2e/                                 # Playwright E2E tests
│   ├── auth/                            # Authentication tests
│   ├── review/                          # Review flow tests
│   ├── insights/                        # Dashboard tests
│   ├── audit-log/                       # Audit log tests
│   └── utils/                           # E2E test helpers
│
├── public/                              # Static assets
│   ├── robots.txt                       # SEO robots file
│   └── sitemap.xml                      # SEO sitemap
│
└── .github/workflows/                   # CI/CD pipelines
    ├── quality.yml                      # Type check, lint, build
    ├── tests.yml                        # Vitest unit/integration tests
    ├── e2e.yml                          # Playwright E2E tests
    ├── docker.yml                       # Docker build & security scan
    └── lighthouse.yml                   # Performance & accessibility audits
```

### Architecture Principles

- **Feature-based organization**: Code organized by features (auth, review, insights, audit-log) rather than technical layers
- **Clear separation**: `app/` for routing, `src/` for business logic
- **Colocation**: Keep related code together (components, hooks, services, tests in same feature folder)
- **Shared code**: Common utilities and components in `src/shared/`
- **Type safety**: Strict TypeScript with comprehensive type definitions

## Getting Started

### Prerequisites

- **Node.js**: 22.x or higher (configured in [.nvmrc](.nvmrc))
- **pnpm**: 9.15.4 or higher
- **Docker & Docker Compose**: Optional, for containerized development

### Installation

1. **Clone and install dependencies**

```bash
git clone <repository-url>
cd ai-review-tool
pnpm install
```

2. **Setup environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration (see Environment Variables section below)

3. **Start database**

```bash
# Using Docker Compose (recommended)
docker-compose -f docker-compose.dev.yml up -d db

# Wait for database to be ready (5-10 seconds)
```

4. **Run database migrations and seed data**

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
pnpm db:seed        # Seed with test data
```

5. **Start development server**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Test Users

After seeding, you can login with:

- **Admin**: `admin@example.com` / `password123`
  - Full access to all features including audit log
- **Reviewer**: `reviewer@example.com` / `password123`
  - Can review items but cannot access audit log

## Available Scripts

### Development

```bash
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
pnpm analyze          # Analyze bundle size with Bundle Analyzer
```

### Database

```bash
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database (development)
pnpm db:migrate       # Create migration (production)
pnpm db:seed          # Seed database with test data
pnpm db:studio        # Open Prisma Studio (database GUI)
pnpm db:reset         # Reset database (WARNING: deletes all data)
```

### Testing

```bash
pnpm test                      # Run all Vitest tests
pnpm test:unit                 # Run unit tests only
pnpm test:integration          # Run integration tests only
pnpm test:coverage:vitest      # Run tests with coverage
pnpm test:coverage:open        # Open coverage report in browser
pnpm test:coverage:check       # Check coverage thresholds

pnpm test:e2e                  # Run Playwright E2E tests
pnpm test:e2e:ui               # Run E2E tests with UI mode
pnpm test:e2e:report           # View E2E test report

pnpm lighthouse                # Run Lighthouse CI tests
pnpm lighthouse:manual         # Run single Lighthouse test
```

### Docker

```bash
pnpm docker:build     # Build production Docker image
pnpm docker:up        # Start production container
pnpm docker:down      # Stop container
pnpm docker:logs      # View container logs
pnpm docker:dev       # Start development with Docker
```

## Environment Variables

Create a `.env.local` file in the root directory. **All values below are examples for local development**.

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-key-min-32-chars-for-local-dev-only
AUTH_TRUST_HOST=true

# Database Configuration (PostgreSQL)
# This connects to the Docker Compose PostgreSQL container
DATABASE_URL="postgresql://testuser:testpassword@localhost:5432/ai_review_test?schema=public"

# PostgreSQL Container Configuration (for Docker Compose)
POSTGRES_USER=testuser
POSTGRES_PASSWORD=testpassword
POSTGRES_DB=ai_review_test
POSTGRES_PORT=5432

# Server Configuration
PORT=3000
BASE_URL=http://127.0.0.1:3000
NEXT_RUNTIME=nodejs

# Development Settings
NODE_ENV=development
SENTRY_ENABLED=false          # Disable Sentry in development

# Optional: Sentry (Production only - leave empty for development)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
```

### Production Environment Variables

For production deployment, use secure values:

```bash
# Generate a secure secret (minimum 32 characters)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Use production database URL
DATABASE_URL="postgresql://user:password@production-host:5432/database?schema=public"

# Enable Sentry
SENTRY_ENABLED=true
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project
SENTRY_DSN=https://your-dsn@sentry.io/project

# Production settings
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
BASE_URL=https://your-domain.com
```

## Testing

### Test Coverage

The project maintains **70%+ test coverage** across:

- **Unit Tests**: 26 test files covering utilities, hooks, services, and business logic
- **Integration Tests**: API routes, database operations, and critical user flows
- **E2E Tests**: 49 Playwright tests covering complete user journeys

### Running Tests Locally

```bash
# Run all Vitest tests (unit + integration)
pnpm test

# Run with coverage report
pnpm test:coverage:vitest

# Open coverage report in browser
pnpm test:coverage:open

# Run E2E tests (requires dev server running)
pnpm dev                    # Terminal 1
pnpm test:e2e               # Terminal 2

# Or use UI mode for debugging
pnpm test:e2e:ui
```

### E2E Test Coverage (49 tests)

- Authentication flows (login, logout, signup, OTP)
- Role-based access control (reviewer vs admin)
- Review queue (filtering, sorting, search, pagination)
- Review detail (approve/reject with feedback validation)
- Streaming output (start, cancel, auto-scroll)
- Bulk actions (multi-select approve/reject)
- Audit log (filtering, CSV export, user search)
- Command search (⌘K navigation, keyboard shortcuts)
- Error handling (404, network errors, form validation)

## CI/CD Workflows

All workflows run on push/PR to `main` and `develop` branches:

### 1. Quality (`quality.yml`)

- TypeScript type checking
- ESLint linting
- Prettier formatting check
- Production build verification
- Uploads build artifacts

### 2. Tests (`tests.yml`)

- Runs Vitest test suite
- Reports test coverage
- Ensures 70%+ coverage threshold

### 3. E2E (`e2e.yml`)

- Runs Playwright E2E tests
- Tests critical user flows
- Uploads test reports and traces

### 4. Docker (`docker.yml`)

- Builds multi-platform images (amd64, arm64)
- Runs Trivy security scanner
- Pushes to GitHub Container Registry (main branch only)
- Automatic tagging (branch, semver, sha, latest)

### 5. Lighthouse (`lighthouse.yml`)

- Performance audits
- Accessibility checks (100/100 score)
- SEO optimization (100/100 score)
- Best practices validation

## Performance Optimizations

### Implemented Optimizations

✅ **React.memo**: 7 components optimized (StatusBadge, KPICards, Charts, PromptPanel, BulkActionBar, DecisionBar)
✅ **Code Splitting**: Chart components lazy loaded with dynamic imports
✅ **useMemo/useCallback**: Expensive computations and callbacks memoized
✅ **Bundle Analysis**: Bundle Analyzer integration for profiling (`pnpm analyze`)

### Results

- **Render Performance**: 15-25% improvement
- **Bundle Size**: 5-10% reduction
- **Lighthouse Score**: 0.8 → 0.85-0.9

See [PERFORMANCE_ANALYSIS.md](PERFORMANCE_ANALYSIS.md) for detailed analysis.

## Docker Deployment

### Development with Docker

```bash
# Start development environment
pnpm docker:dev

# This starts:
# - PostgreSQL database
# - Next.js dev server with hot reload
```

### Production Deployment

```bash
# Build production image
pnpm docker:build

# Start production container
pnpm docker:up

# View logs
pnpm docker:logs

# Stop container
pnpm docker:down
```

The production Docker image:

- Multi-stage build for minimal size
- Security scanning with Trivy
- Multi-platform support (amd64, arm64)
- Automatic health checks

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models:

- **User**: Authentication and roles (REVIEWER, ADMIN)
- **ReviewItem**: AI outputs to be reviewed
- **ActivityLog**: Audit trail of all actions

See [prisma/schema.prisma](prisma/schema.prisma) for complete schema.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Commit Convention**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `test:` Test updates

## License

MIT

---

**Need help?** Check the [issues](https://github.com/your-repo/issues) or create a new one.
