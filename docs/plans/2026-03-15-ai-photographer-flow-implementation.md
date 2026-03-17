# AI Photographer Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the legacy preset quiz flow with the new AI Photographer MVP flow driven by admin-configured use cases, impressions, and scenes.

**Architecture:** Keep the existing full-screen sidebar + canvas layout, but swap the sidebar internals from a style quiz to a creative brief flow. Reuse the existing `quizAnswers` JSON field as the storage envelope for the new brief in MVP, and update generation prompt-building to derive prompts from admin scene definitions and portrait prompt config.

**Tech Stack:** Next.js App Router, React client components, Prisma, NextAuth, Sonner, existing admin config runtime layer.

---

### Task 1: Define the new creative brief contract

**Files:**
- Modify: `app/nextjs_space/lib/admin-config.ts`
- Create: `app/nextjs_space/lib/photoshoot-brief.ts`

**Steps:**
1. Add a small helper module with the typed creative-brief shape and label helpers for use case, impression, and selected scene.
2. Expose filtered helper functions for enabled admin-config sections if needed by the UI.
3. Keep the shape backward-compatible with the existing `quizAnswers` JSON column.

### Task 2: Rebuild the new photoshoot setup UI

**Files:**
- Modify: `app/nextjs_space/app/photoshoots/new/page.tsx`
- Modify: `app/nextjs_space/app/photoshoots/new/_components/wizard-client.tsx`
- Replace: `app/nextjs_space/app/photoshoots/new/_components/step-quiz.tsx`

**Steps:**
1. Pass admin-configured use cases, impressions, and scenes into the wizard page.
2. Replace the old style/background/lighting/expression quiz with a compact conversational creative-brief component.
3. Preserve the current upload-first flow, uploaded thumbnails block, and right-side placeholder contact sheet.
4. Keep generation as the final step, with no extra success screen.

### Task 3: Update persistence and generation logic

**Files:**
- Modify: `app/nextjs_space/app/api/photoshoots/[id]/quiz/route.ts`
- Modify: `app/nextjs_space/app/api/photoshoots/[id]/generate/route.ts`
- Modify: `app/nextjs_space/app/photoshoots/new/_components/step-generation.tsx`

**Steps:**
1. Save the new creative brief structure into `photoshoot.quizAnswers`.
2. Build generation prompts from selected use case, impression, scene definition, and portrait prompt config instead of legacy preset placeholders.
3. Continue streaming placeholder progress to the canvas using the same slot-based SSE approach.

### Task 4: Update the ready-state photoshoot detail view

**Files:**
- Modify: `app/nextjs_space/app/photoshoots/[id]/_components/detail-client.tsx`

**Steps:**
1. Replace legacy quiz labels with creative-brief summary cards.
2. Show selected scene, use case, and impression in human-readable form.
3. Keep the current visual layout and delete flow unchanged.

### Task 5: Verify the end-to-end slice

**Files:**
- No new files unless needed for follow-up notes

**Steps:**
1. Run `npx tsc --noEmit`.
2. Fix any type regressions from the new brief shape.
3. Summarize the implemented slice and note the next logical phase: shot-level variation chips from generated images.
