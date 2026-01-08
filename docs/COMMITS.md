# Commit Standards & History

This document defines commit message standards and tracks the commit history for the AI Output Review Tool project.

## Commit Message Format

We follow **Conventional Commits** (simplified version) for clear and consistent commit messages.

### Types

- **feat:** New feature or functionality
- **fix:** Bug fix
- **refactor:** Code refactoring (no functional changes)
- **test:** Adding or updating tests
- **chore:** Tooling, configuration, dependencies
- **docs:** Documentation changes
- **ui:** UI/styling changes (can also use `feat:` for UI features)

### Format

```
<type>: <short description>

[optional body with more details]
```

### Examples

```
feat: add review queue page with status filter
feat: implement review detail layout and feedback form
feat: add approve/reject mutation with optimistic update
fix: resolve infinite loop in useReviewQueue hook
refactor: extract status filter logic to custom hook
chore: set up msw handlers for review-items api
chore: configure prettier and husky pre-commit hooks
ui: add shadcn table, badge, and toast components
docs: update README with docker instructions
test: add unit tests for http service
```

### Guidelines

- Use lowercase for type and description
- Keep description concise (50 chars or less)
- Use imperative mood ("add" not "added")
- Add body for complex changes
- Reference issues when applicable

---

## Commit History

## M1 - Project Bootstrap

### Milestone 1: Bootstrap + Review Queue

**Scope:**

- Next.js 15 App Router with TypeScript
- shadcn/ui component library with Tailwind CSS
- MSW (Mock Service Worker) for API mocking in development
- Review Queue page with status filtering and search
- Feature-based folder structure (v2-ready)

**Features Implemented:**

- Review item listing with table display
- Status filtering (PENDING/APPROVED/REJECTED) using tabs
- Search functionality by prompt text
- Navigation to review detail page (placeholder)
- Empty state handling
- Mock API with 20 sample review items

**Technical Stack:**

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components (Button, Input, Table, Badge, Tabs, Sonner)
- MSW for API mocking
- React hooks for state management

**Folder Structure:**

```
app/
  layout.tsx
  providers.tsx
  page.tsx (Review Queue)
  review/[id]/page.tsx (Detail placeholder)
src/
  features/
    review/
      queue/
        components/ (queue-header, review-table, status-filter)
        hooks/ (useReviewQueue)
        services/ (reviewItemsApi)
        types.ts
        constants.ts
  shared/
    components/ (app-shell, empty-state)
    services/ (http)
    types/
    constants/
  mocks/ (handlers, browser, data)
```

**Commit Message:**

```
feat: bootstrap nextjs + shadcn + msw and implement review queue page

- Initialize Next.js 15 App Router with TypeScript and Tailwind CSS
- Set up shadcn/ui component library
- Configure MSW for API mocking in development
- Implement Review Queue page with filtering and search
- Add feature-based folder structure
- Create mock data with 20 review items
- Add navigation to review detail placeholder page
```
