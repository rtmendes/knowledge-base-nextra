# Agent Dispatch Task

## Metadata
- **Dispatched by:** Viktor AI
- **Timestamp:** 2026-05-21T16:36:01.496413+00:00
- **Agent:** Codex
- **Priority:** high
- **Source branch:** main
- **Dispatch branch:** agent/codex-20260521-163558

## Task

URGENT KB FRONTEND RESTORATION: The Knowledge Base frontend at kb.insightprofit.live shows 0 items despite 12,376 items in Supabase. Root cause: API routes return 401 (auth gate in middleware.ts), and recent commits (auto-login, enterprise shell) broke item rendering. FIX: 1) Remove or fix auth gate on /api/kb/* read endpoints so content loads. 2) Fix /kb listing pages to query Supabase knowledge_items and display by category. 3) Fix /kb/item/[id] to render items using KBContentRenderer. 4) Verify BlockNote editor works. 5) Verify AI chat widget works. 6) Make next build pass without ignoreBuildErrors. RULES: Never delete Supabase data. Keep WYSIWYG as default. Render HTML natively with DOMPurify, no iframes. Create PR to main.

## Instructions for Codex

1. Read this task carefully
2. Explore the codebase to understand the current state
3. Implement the changes described above
4. Run any available tests (`npm test`, `bun run tsc --noEmit`, etc.)
5. Commit your changes to this branch
6. Create a PR back to `main` with a clear description of what was changed

## Acceptance Criteria
- All existing tests pass
- No TypeScript errors
- Changes are scoped to the task description
- PR description clearly explains what was done
