# FIX: kb.insightprofit.live Runtime Error (Digest 2150316170)

## Problem

The Knowledge Base site at `kb.insightprofit.live` shows:
```
Application error: a server-side exception has occurred while loading kb.insightprofit.live
(see the server logs for more information).
Digest: 2150316170
```

The Vercel deployment is `READY` (build succeeded). The error is a **runtime** server-side rendering crash — the page returns HTTP 200 but the RSC payload contains an error alongside partial content.

## Diagnostic Findings

### What Works
- **Supabase connection**: Health endpoint returns `{"ok":true}` ✅
- **`kb_categories` table**: Returns data correctly ✅
- **`knowledge_items` table**: Returns data correctly ✅
- **All env vars set**: 71 env vars confirmed on Vercel, including `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_SERVICE_KEY` ✅
- **Build**: No build errors, deployment is READY ✅
- **HTTP**: Homepage, `/kb`, and `/kb/item/[id]` all return HTTP 200 ✅

### What Fails
- The RSC payload contains error digest `2150316170` alongside rendered content
- This means a **specific React component** is crashing during server-side rendering
- The error boundary catches it, showing the generic "Application error" message
- The HTML payload is 52KB (suggesting the page partially renders before the crash)

### Architecture
- **Framework**: Next.js (App Router) with Nextra
- **Pages**: All use `export const dynamic = 'force-dynamic'` for SSR
- **Data**: Fetched from Supabase via `lib/supabase-kb.ts` using `supabaseAdmin` (service role)
- **Key pages**: 
  - `app/page.tsx` — Homepage (calls `getCategories`, `getTotalStats`)
  - `app/kb/page.tsx` — KB listing (calls `getCategories`, `getTotalStats`, `getItemTypeCounts`, `getItems`)
  - `app/kb/item/[id]/page.tsx` — Individual item view (calls `getItemById`, `getCategoryById`)
  - `app/kb/[slug]/page.tsx` — Category view

### Likely Causes (investigate these)
1. **Component type error**: A component receives `null`/`undefined` where it expects an object. The data fetching functions return null/empty on error, but components may not handle null gracefully.
2. **RSC serialization issue**: Known issue documented in SKILL: "Page payload MUST be <500KB — NEVER pass full item content as a React Server Component prop." Check if any page passes large content in props.
3. **Nextra conflict**: The `withNextra` wrapper in `next.config.mjs` may conflict with dynamic routes under `app/kb/` or `app/[[...slug]]/page.tsx`.
4. **Image component**: `app/kb/page.tsx` uses `<Image src="/images/kb-hero.webp">` — verify this image exists in `public/images/`.
5. **Async params pattern**: Item pages use `const { id } = await params` — verify this pattern works with the current Next.js version.

## Task

1. **Reproduce the error** locally with `npm run dev` or `npm run build && npm start`
2. **Find the crashing component** by checking:
   - Server console output for the specific error message
   - Which page/route triggers the error
   - Whether it's a null reference, serialization issue, or component crash
3. **Fix the root cause** — not just error suppression
4. **Add error boundaries** around key sections so a single component crash doesn't take down the whole page
5. **Verify the fix** — ensure all routes work: `/`, `/kb`, `/kb/[category-slug]`, `/kb/item/[id]`
6. **Test with this specific item**: `/kb/item/401eeb55-7a4c-457e-b852-a78136b24a32` (PRD just added)

## Files to Investigate First
- `app/page.tsx` — Homepage
- `app/kb/page.tsx` — KB listing
- `app/kb/item/[id]/page.tsx` — Item detail
- `app/kb/[slug]/page.tsx` — Category view
- `app/[[...slug]]/page.tsx` — Catch-all (may conflict with kb routes)
- `lib/supabase-kb.ts` — Data fetching
- `lib/supabase.ts` — Client setup
- `components/kb/` — All KB components
- `next.config.mjs` — Nextra wrapper config

## Env Vars Available
The following are set on Vercel (do not change):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_KEY`

## Constraints
- Do NOT delete or modify Supabase data
- Do NOT change env var names (both `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_SERVICE_KEY` must continue to work)
- Maintain `export const dynamic = 'force-dynamic'` on all KB pages
- Keep `ignoreBuildErrors: true` in next.config for now (pre-existing TS errors)
- The fix must work on Vercel serverless (not just local dev)
