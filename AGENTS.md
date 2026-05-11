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
