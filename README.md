# AI Output Review Tool

A human-in-the-loop workflow application for reviewing AI-generated outputs.

## M1 - Project Bootstrap Complete ✅

This milestone includes:

- ✅ Next.js 16 App Router with TypeScript
- ✅ shadcn/ui component library + Tailwind CSS
- ✅ MSW (Mock Service Worker) for API mocking
- ✅ Review Queue page with filtering and search
- ✅ Feature-based folder structure
- ✅ 20 mock review items with mixed statuses
- ✅ pnpm, Prettier, Husky, Docker, GitHub Actions

## M2 - Review Detail & Actions Complete ✅

This milestone includes:

- ✅ Full review detail page with prompt and output display
- ✅ Approve/Reject actions with persistence
- ✅ Optional feedback form with validation
- ✅ Real-time status updates and toast notifications
- ✅ Copy-to-clipboard for model output
- ✅ Loading states and error handling
- ✅ MSW PATCH endpoint for updating reviews

## M3 - Advanced Features Complete ✅

This milestone includes:

- ✅ TanStack Query for server-state management (caching, invalidation, optimistic updates)
- ✅ Streaming AI output rendering (buffered, cancellable, auto-scroll aware)
- ✅ Bulk actions (multi-select approve / reject with optimistic UI)
- ✅ Advanced filtering & search in review queue
- ✅ Paginated & sortable data table for reviews
- ✅ Insights dashboard (KPIs, trends, status distribution)
- ✅ MSW-powered mock backend with realistic handlers
- ✅ CI/CD with GitHub Actions
- ✅ Dockerized development environment

## M4 - Authentication & Authorization Complete ✅

This milestone includes:

- ✅ NextAuth.js (v4) integration with Credentials provider
- ✅ Role-Based Access Control (RBAC) with `REVIEWER` and `ADMIN` roles
- ✅ Secure route protection with `ProtectedRoute` component
- ✅ Complete auth flows: Sign Up, Login, Forgot Password, OTP
- ✅ Standardized error pages (401, 403, 404, 500, 503)
- ✅ Modern Header redesign with `CommandSearch` (⌘K)
- ✅ Redesigned Profile Dropdown with sign-out confirmation

## M5 - Testing & Audit Log Complete ✅

This milestone includes:

- ✅ Comprehensive test suite with Vitest (26 test files, 71 tests)
- ✅ Unit tests for all features (hooks, utilities, services)
- ✅ Integration tests for critical user flows
- ✅ Test infrastructure setup (MSW, test utilities, mocks)
- ✅ Audit log page with activity timeline
- ✅ CSV export functionality for audit logs
- ✅ Activity log grouping for bulk actions
- ✅ Risk level calculation for audit entries
- ✅ Admin-only access to audit log
- ✅ Test isolation and cleanup mechanisms
- ✅ CI/CD integration for automated testing

## M6 - End-to-End Testing Complete ✅

This milestone includes:

- ✅ Playwright E2E testing framework setup
- ✅ Authentication flow tests (login/logout)
- ✅ Role-based access control tests (reviewer vs admin)
- ✅ Review queue tests (filtering, sorting, search)
- ✅ Review detail tests (approve/reject flows)
- ✅ Streaming output tests (start/cancel)
- ✅ Bulk actions tests (multi-select, bulk reject)
- ✅ Audit log tests (CSV export, filtering)
- ✅ CI/CD integration for E2E tests
- ✅ Test helpers for common operations (login/logout)

## Features

### Review Queue

- **Status Filtering**: Switch between Pending, Approved, and Rejected items using tabs
- **Advanced Search**: Filter by prompt text, status, and priority
- **Bulk Actions**: Select multiple items to approve or reject in bulk
- **Table View**: Sortable columns for prompt, status, priority, and date
- **Empty State**: Helpful message when no results are found
- **Navigation**: Click "Review" to view item details

### Insights Dashboard

- **KPI Cards**: View total reviews, pending count, approval rate, and average time
- **Charts**: Visual distribution of review statuses
- **Trends**: Track review volume over time

### Review Detail Page

- **Prompt Display**: Read-only card showing user input
- **Output Display**: Scrollable card with AI-generated response
- **Copy Output**: One-click copy to clipboard
- **Status Badge**: Current review status (updates in real-time)
- **Feedback Form**: Optional textarea for review notes
- **Approve/Reject**: Actions that persist via MSW PATCH
- **Validation**: Reject requires minimum 5 characters feedback
- **Loading States**: Skeleton components during fetch
- **Error Handling**: Graceful 404 and error states

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Runtime**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Button, Input, Table, Badge, Tabs, Card, Textarea, Separator, Skeleton, Sonner)
- **API Mocking**: MSW (Mock Service Worker)
- **Data Fetching**: TanStack Query v5
- **State Management**: React hooks + TanStack Query (Server State)
- **Package Manager**: pnpm 9.15.4
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **Testing**: Vitest, React Testing Library, MSW, Playwright
- **Test Coverage**: Vitest coverage (v8 provider) for unit/integration tests
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (Quality, Docker, Lighthouse, Tests, E2E)

## Project Structure

```
ai-review-tool/
├── app/                         # Next.js App Router (routing layer)
│   ├── layout.tsx              # Root layout with Providers
│   ├── page.tsx                # Review Queue page
│   ├── providers.tsx           # MSW initialization + Toaster
│   └── review/[id]/page.tsx    # Review detail page
└── src/                         # Business logic layer
    ├── components/
    │   └── ui/                  # shadcn/ui primitives
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── input.tsx
    │       ├── separator.tsx
    │       ├── skeleton.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       └── sonner.tsx
    ├── features/
    │   └── review/
    │       ├── queue/           # Queue feature module
    │       │   ├── components/
    │       │   ├── hooks/
    │       │   ├── services/
    │       │   └── constants.ts
    │       └── detail/          # Detail feature module
    │           ├── components/
    │           ├── hooks/
    │           ├── services/
    │           ├── types.ts
    │           └── constants.ts
    ├── shared/
    │   ├── components/          # Shared business components
    │   │   ├── app-shell.tsx
    │   │   ├── empty-state.tsx
    │   │   └── status-badge.tsx
    │   ├── services/
    │   │   └── http.ts
    │   ├── types/
    │   └── constants/
    ├── lib/                     # Utility functions
    │   └── utils.ts
    └── mocks/                   # MSW handlers & data
        ├── handlers.ts
        ├── browser.ts
        └── data.ts
```

**Architecture Principles:**

- `app/` - Thin routing layer (Next.js pages, layouts)
- `src/` - Thick business layer (all logic, components, features)
- `src/components/ui/` - Low-level UI primitives (shadcn)
- `src/shared/components/` - Reusable business components
- `src/features/` - Feature modules (queue, detail)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm 9.15.4 or higher (recommended)
- Docker & Docker Compose (optional, for containerized development)

### Installation

1. Navigate to the project directory:

```bash
cd /tmp/ai-review-tool
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Alternative: Docker Development

Start the development environment with Docker:

```bash
pnpm docker:dev
# or
docker-compose -f docker-compose.dev.yml up
```

### Production Docker Build

```bash
# Build the production image
pnpm docker:build

# Run the production container
pnpm docker:up

# View logs
pnpm docker:logs

# Stop the container
pnpm docker:down
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm docker:build` - Build Docker image
- `pnpm docker:up` - Start Docker container
- `pnpm docker:down` - Stop Docker container
- `pnpm docker:logs` - View Docker logs
- `pnpm docker:dev` - Start development with Docker
- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests only
- `pnpm test:integration` - Run integration tests only
- `pnpm test:e2e` - Run E2E tests with Playwright
- `pnpm test:e2e:ui` - Run E2E tests with Playwright UI mode
- `pnpm test:e2e:report` - Show E2E test report
- `pnpm test:e2e:ci` - Run E2E tests in CI mode
- `pnpm test:coverage:unit` - Run unit tests with coverage
- `pnpm test:coverage:integration` - Run integration tests with coverage
- `pnpm test:coverage:vitest` - Run all Vitest tests with coverage
- `pnpm test:coverage:open` - Open coverage report in browser
- `pnpm test:coverage:check` - Run coverage with strict thresholds

### Development Notes

- **MSW**: Mock Service Worker runs only in development mode
- **Path Aliases**: Use `@/` to import from both `src/` and root directories
- **TypeScript**: Strict mode enabled for better type safety
- **Git Hooks**: Husky runs lint-staged on pre-commit (auto-format + lint)
- **Code Style**: Prettier with Tailwind CSS plugin for consistent formatting

## API Endpoints (Mocked)

### GET /api/review-items

Query parameters:

- `status`: Filter by status (PENDING | APPROVED | REJECTED)
- `q`: Search by prompt text

Returns: Array of ReviewItem

### GET /api/review-items/:id

Returns: Single ReviewItem or 404

### PATCH /api/review-items/:id

Request body:

```json
{
  "status": "APPROVED" | "REJECTED",
  "feedback": "Optional feedback text"
}
```

Response: Updated ReviewItem

Errors:

- 404 if not found
- 400 if invalid status

## Data Model

```typescript
interface ReviewItem {
  id: string;
  prompt: string;
  modelOutput: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  feedback?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

## Testing Checklist ✅

### M1 - Review Queue

- ✅ Review Queue page loads successfully
- ✅ Mock data displays in table
- ✅ Status filter switches between Pending/Approved/Rejected
- ✅ Search filters results by prompt text
- ✅ Review button navigates to detail page
- ✅ Back button returns to queue
- ✅ Empty state shows when no results
- ✅ MSW intercepts API calls in development

### M2 - Review Detail

- ✅ Detail page displays prompt and output
- ✅ Status badge shows current status
- ✅ Copy button copies output to clipboard
- ✅ Approve button updates status with feedback
- ✅ Reject button validates feedback (min 5 chars)
- ✅ Toast notifications on success/error
- ✅ Status updates persist via MSW PATCH
- ✅ Queue reflects updated status after navigation
- ✅ Loading skeletons display during fetch
- ✅ 404 and error states handled gracefully

### M3 - Advanced Features

- ✅ Bulk actions work correctly (optimistic updates)
- ✅ Insights dashboard renders charts and KPIs
- ✅ Advanced filtering (Status + Priority) works
- ✅ Sorting by columns works
- ✅ TanStack Query caching and invalidation verified

### M4 - Authentication & Authorization

- ✅ Login/Logout flows work correctly
- ✅ Sign Up, Forgot Password, and OTP flows verified
- ✅ Role-based access (Reviewer vs Admin) verified
- ✅ Protected routes redirect correctly
- ✅ Command Search (⌘K) opens and navigates
- ✅ Error pages (401, 403, 404, 500, 503) render correctly

### M5 - Testing & Audit Log

- ✅ All unit tests passing (14 test files)
- ✅ All integration tests passing (7 test files)
- ✅ Test infrastructure properly configured
- ✅ Audit log page displays activity timeline
- ✅ CSV export generates correct data
- ✅ Activity log grouping works for bulk actions
- ✅ Risk level calculation is accurate
- ✅ Admin-only access enforced for audit log
- ✅ Reviewer blocked from accessing audit log
- ✅ Test isolation and cleanup working correctly

### M6 - End-to-End Testing ✅

- ✅ Playwright E2E testing framework setup
- ✅ 49 E2E tests across 13 test files
- ✅ Authentication flow tests (login/logout, reviewer/admin)
- ✅ Role-based access control tests (RBAC)
- ✅ Review queue tests (filtering, sorting, search, pagination)
- ✅ Review detail tests (approve/reject with feedback)
- ✅ Streaming output tests (start/cancel)
- ✅ Bulk actions tests (multi-select approve/reject)
- ✅ Audit log tests (CSV export, filtering, user search)
- ✅ Command search tests (role-based navigation, keyboard shortcuts)
- ✅ Form validation tests (login, feedback)
- ✅ Error handling tests (404, network errors)
- ✅ Complete user journey tests (queue → detail → approve/reject)
- ✅ Global setup for parallel user authentication
- ✅ CI/CD integration for E2E tests
- ✅ Test coverage infrastructure (Vitest coverage for unit/integration)

## Running Tests Locally

### Running E2E Tests

1. **Start the development server** (in one terminal):

   ```bash
   pnpm dev
   ```

2. **Run E2E tests** (in another terminal):

   ```bash
   pnpm test:e2e
   ```

3. **Run E2E tests with UI mode** (interactive):

   ```bash
   pnpm test:e2e:ui
   ```

4. **View test report**:
   ```bash
   pnpm test:e2e:report
   ```

**Note**: The Playwright config automatically starts the dev server if not already running. In CI, it builds and starts the production server.

**E2E Test Coverage (49 tests, 13 files):**

- Authentication flows (login/logout, reviewer/admin)
- Role-based access control (RBAC) tests
- Review queue (filtering, sorting, search, pagination)
- Review detail (approve/reject with feedback)
- Streaming output (start/cancel)
- Bulk actions (multi-select approve/reject)
- Audit log (CSV export, filtering, user search)
- Command search (role-based navigation, keyboard shortcuts)
- Form validation (login, feedback)
- Error handling (404, network errors)
- Complete user journeys (queue → detail → approve/reject)

## CI/CD Workflows

This project includes five GitHub Actions workflows:

### 1. Quality (`quality.yml`)

- Runs on push/PR to main/develop
- Type checking with TypeScript
- Linting with ESLint
- Format checking with Prettier
- Production build verification
- Uploads build artifacts

### 2. Docker (`docker.yml`)

- Builds and pushes Docker images to GitHub Container Registry
- Multi-platform support (amd64, arm64)
- Runs Trivy security scanner
- Automatic tagging (branch, semver, sha, latest)
- Only pushes on main branch (PR builds for testing)

### 3. Lighthouse (`lighthouse.yml`)

- Performance, accessibility, SEO, and best practices audits
- Runs on push/PR to main/develop
- Generates Lighthouse reports
- Uploads results as artifacts

### 4. Tests (`tests.yml`)

- Runs test suite with Vitest
- Executes on push/PR to main/develop
- Reports test coverage
- Ensures all tests pass before merge

### 5. E2E Tests (`e2e.yml`)

- Runs end-to-end tests with Playwright
- Executes on push/PR to main/develop
- Tests critical user flows (auth, roles, review queue/detail, streaming, bulk actions, audit log, command search)
- 49 tests across 13 test files
- Uploads test reports and traces as artifacts
- Requires application build before running
- Global setup for parallel user authentication (reviewer/admin)

## Project Configuration Files

- `.cursorrules` - AI assistant coding guidelines
- `.prettierrc` - Code formatting rules
- `.prettierignore` - Files to skip formatting
- `.lintstagedrc.js` - Pre-commit hook configuration
- `.npmrc` - pnpm configuration
- `.dockerignore` - Files to exclude from Docker builds
- `Dockerfile` - Multi-stage production build
- `Dockerfile.dev` - Development build with hot reload
- `docker-compose.yml` - Production compose setup
- `docker-compose.dev.yml` - Development compose setup
- `lighthouserc.json` - Lighthouse CI configuration
- `playwright.config.ts` - Playwright E2E test configuration
- `playwright.global-setup.ts` - Global setup for E2E authentication
- `vitest.config.ts` - Vitest unit/integration test configuration with coverage

## Next Steps

- 📡 Real backend API integration (replace MSW)
- 📊 Monitoring & observability (Sentry)
- ⚡ Performance optimizations (virtualization, profiling)
- 📄 Full case study & architecture documentation
- 🧪 Increase test coverage thresholds (currently 70% target)

## License

MIT
