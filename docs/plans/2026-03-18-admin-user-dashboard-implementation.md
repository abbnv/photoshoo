# Admin User Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an admin dashboard section that summarizes user growth and monetization, then lists per-user metrics such as registration date, token usage, generated images, payments, and recent activity.

**Architecture:** Compute dashboard data on the server with a dedicated admin analytics helper that aggregates users, token transactions, generated images, and billing payments. Render the new dashboard as a separate admin component on `/admin`, leaving the existing config editor intact.

**Tech Stack:** Next.js App Router, React Server Components, Prisma, PostgreSQL, Tailwind CSS

---

### Task 1: Add server-side admin analytics helper

**Files:**
- Create: `lib/admin-user-dashboard.ts`

**Step 1: Write the helper types**

Define summary and row types for the dashboard payload so the admin page and dashboard component share one contract.

**Step 2: Aggregate per-user metrics**

Use SQL via Prisma to return one row per user with:
- registration timestamp
- current token balance
- generated image count
- spent tokens for `generation` and `variation`
- successful payment count
- purchased token count
- payment totals grouped by currency
- recent activity timestamp

**Step 3: Build summary metrics**

Derive top-level cards from the user rows:
- total users
- new users in 7 days
- total generated images
- successful payments
- purchased tokens
- spent tokens

### Task 2: Render the new admin dashboard section

**Files:**
- Create: `app/admin/_components/admin-users-dashboard.tsx`
- Modify: `app/admin/page.tsx`

**Step 1: Create the dashboard component**

Render summary cards plus a responsive table of users. Format dates and payment totals server-side or in the component without introducing client state.

**Step 2: Wire the component into `/admin`**

Load analytics inside the admin page and place the new section above the config form.

### Task 3: Verify

**Files:**
- Modify: `docs/plans/2026-03-18-admin-user-dashboard-implementation.md`

**Step 1: Run lint**

Run: `npm run lint`

Expected: lint completes without errors for the new admin dashboard files.

**Step 2: Spot-check assumptions**

Confirm the metrics reflect the existing business rules:
- purchases come from `billing_payments.status = 'completed'`
- spent tokens come from negative `token_transactions` with `reason IN ('generation', 'variation')`
- image output comes from `generated_images`
