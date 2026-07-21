# InsightProfit Knowledge Base

Enterprise knowledge base consolidating 6 platforms into one Supabase-backed, Nextra-fronted system. Keystatic CMS for content management, Pagefind for search.

## Setup
```bash
npm install
npm run dev    # local dev server (Next.js)
npm run build  # production build
```

## Tech Stack
- **Framework:** Next.js + Nextra (documentation theme)
- **CMS:** Keystatic (Git-based CMS)
- **Database:** Supabase + Firebase
- **Search:** Pagefind (static search)
- **Monitoring:** Sentry
- **Deploy:** Vercel → `kb.insightprofit.live`

## Key Conventions
- Documentation pages are MDX files in `pages/`
- Keystatic config is in `keystatic.config.tsx`
- Supabase is used for dynamic data; Firebase for auth
- Auto-deploy cron runs every 30 minutes via Vercel cron

## Important Rules
- Follow Nextra documentation conventions for MDX pages
- Keep MDX frontmatter consistent (title, description, date)
- Run `npm run build` locally to catch SSG errors before pushing
- Pagefind index rebuilds on every deploy

## Cursor Cloud specific instructions
Services: a single Next.js app (App Router + Nextra docs). Standard scripts live in `package.json` (`dev`, `build`, `start`, `lint`). Dev runs on `http://localhost:3000`.

- **Do NOT create a local `.env` from `.env.example` for read-only dev.** `lib/supabase.ts` ships working *public* fallbacks (anon key) so the KB is fully readable with no env vars. The `.env.example` placeholders (e.g. `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`, `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`) **override** those fallbacks and make every Supabase query fail with `Unauthorized`, so the KB renders 0 items / 0 categories. Run with no `.env` (or fill in real keys). Supabase backend: `https://supabase.insightprofit.live`.
- **`npm run lint` is not configured** — there is no ESLint config committed, so `next lint` drops into an interactive setup prompt and will hang in non-interactive sessions. Treat lint as unavailable unless a config is added.
- **Never run `npm run build` while `npm run dev` is running** — `build` overwrites `.next`, which makes the running dev server serve 500s for stale chunks. Restart `npm run dev` (and clear `.next`) after building.
- KB item detail pages (`/kb/item/[id]`) render a client-side BlockNote WYSIWYG editor; very large items (90k+ words) take several seconds to hydrate but still render. The page has its own error boundary that shows a "⚠️ This item couldn't be displayed" card on a real client error.
- Node 22 is required (`engines.node: 22.x`). The `.nvmrc`/`.node-version` files say `20` but the build targets 22; use Node 22.
