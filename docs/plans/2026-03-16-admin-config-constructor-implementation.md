# Admin Config Constructor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace JSON-heavy admin configuration editing with a simpler preset constructor for scenes, prompts, formats, and variation chips.

**Architecture:** Keep the existing admin config API and storage format unchanged so runtime logic stays stable, but transform the admin UI into structured form sections with repeatable cards. Parse the server payload into typed form state on load, let the admin edit human-readable inputs, and serialize back into the existing JSON sections on save.

**Tech Stack:** Next.js App Router, React client components, existing `/api/admin/config` route, TypeScript, current UI primitives.

---

### Task 1: Define typed editable admin form helpers

**Files:**
- Modify: `app/nextjs_space/app/admin/_components/admin-config-client.tsx`

**Steps:**
1. Replace raw JSON text state with typed arrays/objects for runtime settings, scenes, chips, formats, use cases, impressions, and portrait prompts.
2. Add small helper functions for list editing, string array parsing, and safe defaults.
3. Preserve backward-compatible payload shape for the API.

### Task 2: Build constructor-style admin sections

**Files:**
- Modify: `app/nextjs_space/app/admin/_components/admin-config-client.tsx`

**Steps:**
1. Keep API key inputs at the top.
2. Turn runtime settings into normal fields.
3. Turn scene definitions into repeatable cards with separate prompt textareas and metadata inputs.
4. Turn variation chips and format presets into repeatable cards instead of JSON blocks.
5. Turn portrait prompt config into separate textareas for base prompt, quality prompt, and edit prompt templates.

### Task 3: Keep the save/load contract stable

**Files:**
- Modify: `app/nextjs_space/app/admin/_components/admin-config-client.tsx`
- Modify only if needed: `app/nextjs_space/app/api/admin/config/route.ts`

**Steps:**
1. Load current API payload into the new constructor state.
2. Serialize constructor state back to the existing API JSON structure.
3. Avoid backend schema changes in this slice.

### Task 4: Verify admin flow

**Files:**
- No new files unless needed for notes

**Steps:**
1. Run `npx tsc --noEmit`.
2. Check for type regressions in admin UI and config parsing.
3. Summarize the next step for AI-powered scene suggestion integration without implementing new SDKs yet.
