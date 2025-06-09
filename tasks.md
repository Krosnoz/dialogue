# T3 Chat Rebuild - Implementation Plan

This document outlines the tasks required to implement the T3 Chat application based on the provided technical specification, adapting it to the existing monorepo architecture.

**Architectural Recommendation:** To best leverage the monorepo structure, we recommend the following adjustments:
- **`packages/db`:** Create a new package to house the Drizzle ORM schema, database client, and migration files. This allows both the web and server apps to share a single source of truth for the database. The contents of `apps/server/src/db` should be moved here.
- **`packages/types`:** Create a new package for shared TypeScript types and interfaces (e.g., for Chat, Projects, Users). This ensures type consistency across the entire application stack.
- **`apps/web`:** This will be the full-stack Next.js application, containing all UI components, pages, and API routes as detailed in the specification.
- **`apps/server`:** The role of this app should be clarified. If the Next.js app handles all API logic, this server might be used for other purposes like long-running workers, a separate API for other clients, or it might be deprecated. For this plan, we'll assume most backend logic resides within `apps/web/src/app/api`.

---

## Milestone 1: Project Setup & Core Infrastructure (1-2 days)

### 1.1. Monorepo & Tooling
- [X] Configure `turbo.json` for the new `packages/db` and `packages/types`.
- [X] Verify `biome.json` is configured correctly for the entire monorepo.
- [X] Create `packages/db` and `packages/types` directories.
- [X] Create `package.json` files for the new packages.

### 1.2. Database (Neon + Drizzle)
- [X] Set up a new project on Neon.
- [X] Add `DATABASE_URL` to environment variables (`.env`).
- [X] In `packages/db`, install `drizzle-orm`, `@neondatabase/serverless`, and `drizzle-kit`.
- [X] Create schema files in `packages/db/schema/` for `users`, `accounts`, `sessions`, `subscriptions`, and `usage`.
- [X] Create a `drizzle.config.ts` in `packages/db`.
- [X] Run initial Drizzle migrations to create database tables.
- [X] Move any existing schema from `apps/server/src/db/schema` to `packages/db/schema` and refactor.

### 1.3. Authentication (Better-Auth)
- [X] Install `better-auth` in `apps/web`.
- [X] Create auth configuration file: `apps/web/src/lib/auth/config.ts`.
- [X] Configure the `drizzleAdapter` to use the schema from `packages/db`.
- [X] Set up auth API routes: `apps/web/src/app/api/auth/[...auth]/route.ts`.
- [X] Implement auth middleware in `apps/web/middleware.ts`.

---

## Milestone 2: Local Storage & Core App Logic (2-3 days)

### 2.1. Local Storage (Dexie.js)
- [ ] Install `dexie` and `dexie-react-hooks` in `apps/web`.
- [ ] Create IndexedDB schema in `apps/web/src/lib/storage/indexdb.ts` for projects, threads, and messages.

### 2.2. Core APIs
- [ ] Set up placeholder API routes in `apps/web/src/app/api/` for `chat`, `projects`, and `user`.

### 2.3. Shared Types & Hooks
- [ ] Define shared types in `packages/types` for `Auth`, `Chat`, `Project`, `Subscription`.
- [ ] Set up custom hooks in `apps/web/src/hooks/` for:
  - [ ] `use-auth.ts`
  - [ ] `use-chat.ts`
  - [ ] `use-projects.ts`
  - [ ] `use-subscription.ts`
  - [ ] `use-local-storage.ts`

---

## Milestone 3: AI & Stripe Integration (2-3 days)

### 3.1. AI Providers
- [ ] Install SDKs in `apps/web`: `openai`, `@anthropic-ai/sdk`.
- [ ] Create AI provider abstraction: `apps/web/src/lib/ai/providers.ts`.
- [ ] Implement chat streaming logic: `apps/web/src/lib/ai/streaming.ts`.
- [ ] Build out the `chat` API route with streaming support.

### 3.2. Stripe Integration
- [ ] Install `stripe` SDK in `apps/web`.
- [ ] Create pricing configuration: `apps/web/src/lib/stripe/config.ts`.
- [ ] Set up Stripe API routes in `apps/web/src/app/api/stripe/` for `checkout` and `webhook`.
- [ ] Implement webhook handling for subscription events.

---

## Milestone 4: UI Development - Components (3-5 days)

- [ ] **Base UI:** Create generic, reusable components in `apps/web/src/components/ui/` (Button, Input, Card, etc.).
- [ ] **Authentication:** Build components in `apps/web/src/components/auth/` (LoginForm, RegisterForm).
- [ ] **Layout:** Create `apps/web/src/components/layout/` (Navbar, Sidebar, Footer).
- [ ] **Project Management:** Build components in `apps/web/src/components/projects/` (ProjectList, CreateProjectDialog).
- [ ] **Chat:** Build components in `apps/web/src/components/chat/` (ChatInterface, MessageList, MessageInput).
- [ ] **Subscription:** Build components in `apps/web/src/components/subscription/` (PricingCard, UpgradeButton).

---

## Milestone 5: UI Development - Pages & Views (2-4 days)

- [ ] **Auth Pages:** Create pages for login and register under `apps/web/src/app/(auth)/`.
- [ ] **Dashboard:**
  - [ ] Create the main dashboard layout `apps/web/src/app/(dashboard)/layout.tsx`.
  - [ ] Build the projects page `apps/web/src/app/(dashboard)/projects/page.tsx`.
  - [ ] Build the chat page `apps/web/src/app/(dashboard)/chat/[projectId]/page.tsx`.
  - [ ] Build the settings page `apps/web/src/app/(dashboard)/settings/page.tsx`.

---

## Milestone 6: Advanced Features & Polish (4-6 days)

- [ ] **Data Sync:** Implement `DataSyncManager` in `apps/web/src/lib/storage/sync.ts`.
- [ ] **Usage Tracking:** Implement `UsageTracker` in `apps/web/src/lib/usage/tracker.ts`.
- [ ] **Advanced UI/UX:**
  - [ ] Virtual scrolling for messages.
  - [ ] Syntax highlighting in messages.
  - [ ] Keyboard shortcuts (`use-keyboard-shortcuts.ts`).
- [ ] **Security:** Implement `MessageEncryption` and privacy settings UI.
- [ ] **Error Handling:** Implement error boundaries and loading states globally.
- [ ] **Responsiveness:** Ensure the UI is fully responsive.

---

## Milestone 7: Testing & Deployment (3-5 days)

### 7.1. Testing
- [ ] Configure Jest/Vitest and React Testing Library.
- [ ] Write unit tests for critical hooks and utility functions.
- [ ] Write integration tests for auth flow, chat flow, and subscription flow.
- [ ] Set up End-to-End tests with Playwright/Cypress.

### 7.2. DevOps & Deployment
- [ ] Finalize `.env.example` with all required variables.
- [ ] Create a production-ready `Dockerfile`.
- [ ] Set up a CI/CD pipeline in `.github/workflows/` to run tests and deploy.
- [ ] Deploy to a hosting platform (Vercel, Railway, etc.).
- [ ] Configure production environment, domain, and SSL.

---

## Milestone 8: Post-Launch (Ongoing)

- [ ] Set up error tracking (Sentry).
- [ ] Implement performance monitoring.
- [ ] Implement feature flags system.
- [ ] Implement data export/import.
- [ ] User onboarding.
- [ ] And other items from the "Advanced Features" list. 