# CRITICAL FIX: kb.insightprofit.live Runtime SSR Crash (Digest 2150316170)

## Problem
kb.insightprofit.live returns HTTP 200 but shows "Application error: a server-side exception has occurred" — the error boundary catches an unhandled exception during React Server Component rendering. The page partially renders (~52KB HTML) before crashing.

## What WORKS (verified)
- Supabase connection: 12,376 items, all content intact ✅
- Vercel env vars: All 71 set correctly ✅
- Build: Succeeds, deployment is READY ✅

## Root Cause Candidates (investigate in order)

### 1. Keystatic reader crash on Vercel serverless
`lib/keystatic.ts` creates a reader with `storage: { kind: 'local' }` using `process.cwd()`. On Vercel serverless:
- The `content/docs/` directory may not be accessible
- `reader.collections.docs.all()` and `reader.collections.docs.list()` may throw
- The catch-all route `app/[[...slug]]/page.tsx` calls these in `generateStaticParams`

### 2. CategoryCard Image component crash
`components/kb/CategoryCard.tsx` references `<Image src="/images/categories/xxx.webp">` — if ANY referenced image doesn't exist in `public/images/categories/`, the Image component throws during SSR.

### 3. Route conflict
`app/[[...slug]]/page.tsx` is an optional catch-all that matches ALL routes. It can conflict with `app/page.tsx` and `app/kb/page.tsx` when the Keystatic reader fails.

## Fix Instructions

### Step 1: Add global error boundaries
Create these files:

**`app/error.tsx`** (client component):
```tsx
'use client'
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

**`app/kb/error.tsx`** (client component):
```tsx
'use client'
export default function KBError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Knowledge Base temporarily unavailable</h2>
      <p>Please try again in a moment.</p>
      <button onClick={() => reset()}>Retry</button>
    </div>
  )
}
```

### Step 2: Make Keystatic reader completely safe
In `lib/keystatic.ts`, the reader creation itself may throw. Wrap it:

```typescript
import { createReader } from '@keystatic/core/reader'
import keystaticConfig from '../keystatic.config'

let _reader: ReturnType<typeof createReader> | null = null

function getReader() {
  if (!_reader) {
    try {
      _reader = createReader(process.cwd(), {
        ...keystaticConfig,
        storage: { kind: 'local' },
      } as Parameters<typeof createReader>[1])
    } catch (e) {
      console.error('[keystatic] Failed to create reader:', e)
      return null
    }
  }
  return _reader
}

export const reader = new Proxy({} as ReturnType<typeof createReader>, {
  get(_, prop) {
    const r = getReader()
    if (!r) throw new Error('Keystatic reader not available')
    return (r as any)[prop]
  }
})
```

### Step 3: Fix catch-all route `app/[[...slug]]/page.tsx`
The `generateStaticParams` and page component MUST be safe:
- Wrap `reader.collections.docs.list()` in try/catch, return `[]` on failure
- Wrap `reader.collections.docs.read()` in try/catch, call `notFound()` on failure
- Same for `generateMetadata`

### Step 4: Fix homepage `app/page.tsx`
The `getNavTree()` call is already wrapped in try/catch — verify it catches ALL errors.
Also verify `getCategories()` and `getTotalStats()` return safe defaults if Supabase fails.

### Step 5: Fix CategoryCard image handling
In `components/kb/CategoryCard.tsx`:
- Remove or conditionally render the `<Image>` component
- Use `<img>` with `onError` fallback, or just use emoji icons instead of cover images
- The CATEGORY_COVERS map references images that likely don't exist in the deployed bundle

### Step 6: Verify supabase-kb.ts error handling
Check all exported functions in `lib/supabase-kb.ts` — each should handle the case where `supabaseAdmin` is null AND handle Supabase query errors gracefully.

## Files to Modify
- `app/error.tsx` — CREATE (global error boundary)
- `app/kb/error.tsx` — CREATE (KB error boundary)  
- `lib/keystatic.ts` — Make reader creation safe
- `app/[[...slug]]/page.tsx` — Wrap all reader calls in try/catch
- `app/page.tsx` — Verify error handling completeness
- `app/kb/page.tsx` — Add error handling
- `app/kb/[category]/page.tsx` — Add error handling if not present
- `app/kb/item/[id]/page.tsx` — Add error handling if not present
- `components/kb/CategoryCard.tsx` — Handle missing images
- `lib/supabase-kb.ts` — Verify all functions have error handling

## Constraints
- Do NOT modify Supabase data or schema
- Do NOT change env var names
- Keep `export const dynamic = 'force-dynamic'` on all KB pages
- Keep `ignoreBuildErrors: true` in next.config.mjs
- Fix MUST work on Vercel serverless (not just local dev)
- Do NOT add new dependencies

## Done Criteria
- [ ] `app/error.tsx` and `app/kb/error.tsx` exist as client components
- [ ] Homepage (/) renders without error
- [ ] /kb renders and shows categories  
- [ ] /kb/item/[any-valid-id] renders with content
- [ ] /kb/[category-slug] renders
- [ ] No unhandled exceptions in server console
- [ ] Build succeeds (`npm run build`)
- [ ] Write report to `.agents/last_report.md`
