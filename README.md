# AI Output Review Tool

A human-in-the-loop workflow application for reviewing AI-generated outputs.

## M1 - Project Bootstrap Complete ✅

This milestone includes:

- ✅ Next.js 15 App Router with TypeScript
- ✅ shadcn/ui component library + Tailwind CSS
- ✅ MSW (Mock Service Worker) for API mocking
- ✅ Review Queue page with filtering and search
- ✅ Feature-based folder structure
- ✅ 20 mock review items with mixed statuses

## Features

### Review Queue

- **Status Filtering**: Switch between Pending, Approved, and Rejected items using tabs
- **Search**: Search review items by prompt text
- **Table View**: Clean table displaying prompt, status badge, timestamp, and actions
- **Empty State**: Helpful message when no results are found
- **Navigation**: Click "Review" to view item details

### Review Detail Page (Placeholder)

- Shows the item ID
- Back button to return to queue

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Runtime**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Button, Input, Table, Badge, Tabs, Sonner)
- **API Mocking**: MSW (Mock Service Worker)
- **State Management**: React hooks (useState, useEffect, useCallback)
- **Package Manager**: pnpm 9.15.4
- **Code Quality**: ESLint, Prettier, Husky, lint-staged
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions (Quality, Docker, Lighthouse)

## Project Structure

```
ai-review-tool/
├── app/
│   ├── layout.tsx              # Root layout with Providers
│   ├── page.tsx                # Review Queue page
│   ├── providers.tsx           # MSW initialization + Toaster
│   └── review/[id]/page.tsx    # Review detail placeholder
├── src/
│   ├── features/
│   │   └── review/
│   │       └── queue/
│   │           ├── components/
│   │           │   ├── queue-header.tsx
│   │           │   ├── review-table.tsx
│   │           │   └── status-filter.tsx
│   │           ├── hooks/
│   │           │   └── useReviewQueue.ts
│   │           ├── services/
│   │           │   └── reviewItemsApi.ts
│   │           ├── types.ts
│   │           └── constants.ts
│   ├── shared/
│   │   ├── components/
│   │   │   ├── app-shell.tsx
│   │   │   └── empty-state.tsx
│   │   ├── services/
│   │   │   └── http.ts          # Fetch wrapper
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── constants/
│   │       └── index.ts
│   └── mocks/
│       ├── handlers.ts           # MSW request handlers
│       ├── browser.ts            # MSW worker setup
│       └── data.ts               # Mock review items (20)
├── components/ui/               # shadcn/ui components
├── docs/
│   └── COMMITS.md
└── public/
    └── mockServiceWorker.js     # MSW service worker
```

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

- ✅ Review Queue page loads successfully
- ✅ Mock data displays in table
- ✅ Status filter switches between Pending/Approved/Rejected
- ✅ Search filters results by prompt text
- ✅ Review button navigates to detail page
- ✅ Back button returns to queue
- ✅ Empty state shows when no results
- ✅ MSW intercepts API calls in development

## CI/CD Workflows

This project includes three GitHub Actions workflows:

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

## Next Steps (M2/M3)

Future milestones will include:

- TanStack Query for server state management
- Full review detail page with approve/reject actions
- API integration for persisting changes
- Additional features and refinements
- E2E testing with Playwright
- Monitoring and observability

## License

MIT
