# Claude Code Handoff — Fix `kb.insightprofit.live` Build Crash

**Paste this entire file into Claude Code as your opening prompt. Then attach `KB_CRASH_SOP_PRD.md` as context.**

---

## 0. Mission

Restore production deploys to `kb.insightprofit.live`. The Vercel build fails at static prerender of `/_not-found` with React Server Components error `digest: 2150316170`. Root cause is a confirmed Nextra 4 + Next.js 15.4+ incompatibility — [shuding/nextra#4742](https://github.com/shuding/nextra/issues/4742). Try fixes in the order below. Stop as soon as one works.

Acceptance: `npm run build` completes locally with zero errors, AND a Vercel deploy from the chosen branch goes green, AND the live site renders `/`, an MDX page, `/kb`, `/keystatic`, and an unknown URL (404) without crashing.

---

## 1. Environment Setup (one-time)

```bash
# 1a. Clone if not present
git clone https://github.com/rtmendes/knowledge-base-nextra.git
cd knowledge-base-nextra

# 1b. Confirm you're on main at the broken HEAD
git fetch origin
git checkout main
git pull
git log -1 --oneline   # expect: ff3871b (broken — custom Sidebar w/o Nextra Layout)

# 1c. Match Vercel's Node — the project setting is 24.x, Vercel runtime falls back to 22.x
node --version          # want v22.x. If different: nvm install 22 && nvm use 22

# 1d. Restore the original Nextra Layout BEFORE applying any fix.
# The current HEAD has the failed Attempt #10 (Sidebar w/o Layout). Roll those changes back.
git checkout 612f553e -- app/layout.tsx
# If the .bak file exists and is newer-correct, alternative:
#   cp app/layout.tsx.bak app/layout.tsx
# Verify Nextra <Layout> is back in app/layout.tsx
grep -n "from 'nextra-theme-docs'" app/layout.tsx

# 1e. Install at the current pinned versions to reproduce the baseline crash
rm -rf node_modules package-lock.json .next
npm install
npm run build   # should fail with digest 2150316170 at /_not-found

# Lock in baseline reproduction. If this build SUCCEEDS, stop — the bug doesn't reproduce locally and
# you need to investigate Vercel-specific factors (Node version, env vars, cache) before continuing.
```

---

## 2. Fix H (TRY FIRST) — Upgrade Nextra to 4.6.1

Nextra 4.6.1 (Dec 4, 2025) [release notes](https://github.com/shuding/nextra/releases) explicitly say *"fix compatibility with Next.js 16"*. The prerender path was reworked. Lowest risk, smallest diff.

```bash
git checkout -b fix/nextra-4.6.1

# Pin exact versions (no caret — prevents future auto-upgrade surprises)
npm install nextra@4.6.1 nextra-theme-docs@4.6.1 --save-exact

# Optional but recommended: also pin Next.js to the version it resolves to now,
# so this build is reproducible. Check what resolved:
npm ls next
# Then pin that exact version:
# npm install next@<resolved-version> --save-exact

# Clean rebuild
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

**If `npm run build` succeeds:**
```bash
npm start &
sleep 5
curl -sf http://localhost:3000/ >/dev/null && echo "OK /"
curl -sf http://localhost:3000/ai-research/manus >/dev/null && echo "OK MDX"
curl -sf http://localhost:3000/kb >/dev/null && echo "OK kb"
curl -sf http://localhost:3000/keystatic >/dev/null && echo "OK keystatic"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/this-does-not-exist  # want 404, not 500
kill %1

git add package.json package-lock.json
git commit -m "fix(build): upgrade nextra to 4.6.1 to fix Next 15.5 /_not-found prerender (shuding/nextra#4742)"
git push -u origin fix/nextra-4.6.1
```
Then jump to **Section 6 (Deploy)**.

**If `npm run build` still fails** with the same `/_not-found` prerender error, continue to Fix A.

---

## 3. Fix A — Pin Next.js to 15.3.3 Exact

The `^15.3.3` caret allowed auto-resolution to 15.5.18, which is where the Nextra incompatibility lives. Pin back to the version that worked. [Next.js 15.5 release notes](https://nextjs.org/blog/next-15-5) | [15.4 release notes](https://nextjs.org/blog/next-15-4).

```bash
# From Fix H branch (keep the Nextra upgrade) — Fix A stacks on top
# OR start fresh from main:
#   git checkout main && git checkout -b fix/pin-next-15.3.3

# Pin exact, no caret
npm install next@15.3.3 --save-exact

# Belt-and-suspenders: lock Node in package.json so Vercel doesn't drift
node -e "const p=require('./package.json'); p.engines=p.engines||{}; p.engines.node='22.x'; require('fs').writeFileSync('./package.json', JSON.stringify(p,null,2)+'\n')"

# Also create .nvmrc for local consistency
echo "22" > .nvmrc

rm -rf node_modules package-lock.json .next
npm install
npm run build
```

Run the same `curl` smoke tests from Fix H. If green:
```bash
git add package.json package-lock.json .nvmrc
git commit -m "fix(build): pin next@15.3.3 + lock node 22.x to restore /_not-found prerender"
git push -u origin <current-branch>
```
Then **Section 6 (Deploy)**.

If still failing, continue to Fix I.

---

## 4. Fix I — `experimental.globalNotFound` + standalone 404

Bypass Nextra's `<Layout>` entirely for the 404 page using Next.js's official escape hatch. [Vercel maintainer huozhi recommends this exact workaround](https://github.com/vercel/next.js/issues/71623#issuecomment-from-huozhi) | [global-not-found docs](https://nextjs.org/docs/app/api-reference/file-conventions/not-found).

### 4a. Enable the flag

Edit `next.config.mjs`:
```js
// next.config.mjs
import nextra from "nextra";

const withNextra = nextra({ latex: false, defaultShowCopyCode: true });

const nextConfig = {
  // ...existing config...
  experimental: {
    globalNotFound: true,
  },
};

export default withNextra(nextConfig);
```

### 4b. Create `app/global-not-found.tsx`

```tsx
// app/global-not-found.tsx
// NOTE: keep imports MINIMAL — Next 16.2.x has an infinite-loop bug with imports here
// (vercel/next.js#92256). You're on 15.x so it's safer, but still keep it lean.

export const metadata = {
  title: '404 — Page Not Found',
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '4rem 2rem',
        textAlign: 'center',
        background: '#fafafa',
        color: '#111',
        margin: 0,
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>404</h1>
        <p style={{ marginBottom: '1.5rem' }}>The page you're looking for doesn't exist.</p>
        <a href="/" style={{ color: '#0070f3', textDecoration: 'underline' }}>Go home</a>
      </body>
    </html>
  );
}
```

### 4c. Delete the per-route `app/not-found.tsx`

Per the Next.js docs, `global-not-found` REPLACES `not-found`. Having both causes confusion.
```bash
rm -f app/not-found.tsx
```

### 4d. Rebuild

```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

Run the smoke tests. If green:
```bash
git add next.config.mjs app/global-not-found.tsx
git rm app/not-found.tsx 2>/dev/null || true
git commit -m "fix(build): use experimental.globalNotFound to bypass Nextra Layout in 404 prerender"
git push -u origin <current-branch>
```
Then **Section 6 (Deploy)**.

Known caveat: Tailwind doesn't auto-wire to global-not-found ([#82379](https://github.com/vercel/next.js/issues/82379)). The inline styles above sidestep that.

If still failing, continue to Fix G.

---

## 5. Fix G (LAST RESORT) — Route Groups

Most invasive. Restructure so MDX pages live inside a `(nextra)` group with the Nextra Layout, and everything else (404, Supabase KB, Keystatic admin) lives in a plain `(app)` group. Root layout becomes a minimal HTML shell.

### 5a. Target structure
```
app/
├── layout.tsx                  ← root: minimal <html><body>{children}</body></html>
├── (nextra)/
│   ├── layout.tsx              ← Nextra <Layout> wrapper (moved from old root)
│   ├── page.tsx                ← home (if MDX-rendered)
│   ├── [[...slug]]/page.tsx
│   ├── ai-research/page.mdx
│   ├── ai-research/manus/page.mdx
│   └── genspark/page.mdx
└── (app)/
    ├── layout.tsx              ← plain layout: NO Nextra
    ├── not-found.tsx           ← styled 404 in plain layout — safe to prerender
    ├── kb/page.tsx
    ├── kb/[category]/page.tsx
    ├── kb/item/[id]/page.tsx
    ├── keystatic/...
    ├── import/page.tsx
    └── api/keystatic/...
```

### 5b. New root `app/layout.tsx`
```tsx
import type { Metadata } from 'next';
import './globals.css'; // keep your existing global CSS import path

export const metadata: Metadata = {
  title: 'InsightProfit Knowledge Base',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 5c. New `app/(nextra)/layout.tsx`
Move the ENTIRE current `app/layout.tsx` body (with `getNavTree()`, Nextra `<Layout>`, Navbar, footer, AppShell, etc.) here. Remove the `<html>` and `<body>` tags — they belong to the root layout now.

### 5d. New `app/(app)/layout.tsx`
```tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### 5e. Move files
```bash
mkdir -p "app/(nextra)" "app/(app)"

# MDX-served routes → (nextra)
git mv "app/[[...slug]]" "app/(nextra)/[[...slug]]"
git mv app/ai-research "app/(nextra)/ai-research"
git mv app/genspark "app/(nextra)/genspark"
# If app/page.tsx is the MDX-rendered home, move it too:
# git mv app/page.tsx "app/(nextra)/page.tsx"

# Non-MDX routes → (app)
git mv app/kb "app/(app)/kb"
git mv app/keystatic "app/(app)/keystatic"
git mv app/import "app/(app)/import"
git mv app/api "app/(app)/api"
# Move (and keep) the styled 404 here:
[ -f app/not-found.tsx ] && git mv app/not-found.tsx "app/(app)/not-found.tsx"
```

### 5f. Rebuild
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

Run smoke tests. If green:
```bash
git add -A
git commit -m "fix(build): split app/ into (nextra) and (app) route groups to isolate Nextra Layout from /_not-found prerender"
git push -u origin <current-branch>
```

---

## 6. Deploy

The PRD warns direct `git push` may hit Vercel's `COMMIT_AUTHOR_REQUIRED`. Two paths:

### 6a. PR-based (recommended)
```bash
# Open a PR from your fix branch into main
gh pr create --base main --head <fix-branch> --title "Fix /_not-found prerender crash" --body "See KB_CRASH_SOP_PRD.md + CLAUDE_CODE_HANDOFF.md"
```
Merge in the GitHub UI (gives a proper merge commit with valid author). Vercel will deploy `main` automatically.

### 6b. Vercel API trigger (if PR merge auto-deploy fails)
```bash
# Requires VERCEL_TOKEN. The PRD references a Pipedream proxy if direct API is blocked.
curl -X POST "https://api.vercel.com/v13/deployments?teamId=team_RDc9rfG2nyUydjZvco8L06C9" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "knowledge-base-nextra",
    "project": "prj_kmVj9XsYQykbBzXCrMnMDNWvmvI1",
    "target": "production",
    "gitSource": {
      "type": "github",
      "repoId": 1208092790,
      "ref": "main",
      "org": "rtmendes",
      "repo": "knowledge-base-nextra"
    }
  }'
```

### 6c. Watch the deploy
```bash
# Tail logs via Vercel CLI
vercel logs --token=$VERCEL_TOKEN <deployment-url>
```

---

## 7. Production Verification

Once Vercel reports READY:
```bash
curl -sf https://kb.insightprofit.live/ >/dev/null && echo "PROD OK /"
curl -sf https://kb.insightprofit.live/ai-research/manus >/dev/null && echo "PROD OK MDX"
curl -sf https://kb.insightprofit.live/kb >/dev/null && echo "PROD OK kb"
curl -sf https://kb.insightprofit.live/keystatic >/dev/null && echo "PROD OK keystatic"
curl -s -o /dev/null -w "404 page status: %{http_code}\n" https://kb.insightprofit.live/this-does-not-exist
```

Plus manual:
- Sidebar nav renders on `/`
- An MDX page renders with full Nextra styling
- Keystatic admin loads
- Pagefind search box returns results
- No auth wall on any public page
- CSP headers still allow Command Center iframe embedding:
  ```bash
  curl -sI https://kb.insightprofit.live/ | grep -i content-security-policy
  ```

---

## 8. Rollback

If production breaks worse than the current state:
```bash
# Identify last green deploy and revert main to it
git revert <merge-commit-sha> --no-edit
git push origin main
# Or via Vercel UI: "Promote to Production" on dpl_3tyB64Rx5QnaisQnshptAhdR2U (commit 612f553e)
```

---

## 9. Post-Fix Cleanup

Once green and verified:
```bash
git rm -f app/layout.tsx.bak app/layout.tsx.bak2 2>/dev/null || true
# If Fix H or A worked, the custom Sidebar from Attempt #10 is unused:
[ -f components/Sidebar.tsx ] && git rm components/Sidebar.tsx
git commit -m "chore: remove unused debug artifacts from build-crash investigation"
git push
```

---

## 10. What to Report Back

After each fix attempt, report:
1. Which fix you applied (H / A / I / G)
2. Local `npm run build` exit code and last 30 lines of output
3. If you pushed: the commit SHA + branch name + PR URL
4. If you deployed: the Vercel deployment URL and final state
5. Production smoke test results from Section 7
6. Anything in the PRD that turned out to be wrong

---

## 11. Reference Index

- PRD with full file architecture and all 10 prior attempts: `KB_CRASH_SOP_PRD.md` (attach to Claude Code context)
- [Nextra issue #4742 — exact bug reproduction](https://github.com/shuding/nextra/issues/4742)
- [Nextra issue #4271 — Missing ConfigContext.Provider](https://github.com/shuding/nextra/issues/4271)
- [Next.js issue #71623 — global-not-found workaround](https://github.com/vercel/next.js/issues/71623)
- [Nextra 4.6.1 release notes](https://github.com/shuding/nextra/releases)
- [Next.js 15.5 release notes](https://nextjs.org/blog/next-15-5)
- [Next.js 15.4 release notes](https://nextjs.org/blog/next-15-4)
- [Next.js not-found.js + globalNotFound docs](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [Next.js prerender-error reference](https://nextjs.org/docs/messages/prerender-error)
- [Nextra App Router root layout example](https://nextra.site/docs/docs-theme/start#create-the-root-layout)
- Vercel project: `prj_kmVj9XsYQykbBzXCrMnMDNWvmvI1` | Team: `team_RDc9rfG2nyUydjZvco8L06C9`
- GitHub: [rtmendes/knowledge-base-nextra](https://github.com/rtmendes/knowledge-base-nextra)
- Live URL: [kb.insightprofit.live](https://kb.insightprofit.live)
- Last green deploy: `dpl_3tyB64Rx5QnaisQnshptAhdR2U` @ commit `612f553e`
- Current broken HEAD: `ff3871b`

---

## 12. Hard Rules

- **Do not** use `|| true` in the build command (PRD's Solution E). It ships broken pages.
- **Do not** downgrade to Nextra 3.x (PRD's Solution D). Multi-day refactor.
- **Do not** set `output: 'standalone'` (PRD's Solution F). Doesn't change the prerender phase.
- **Do not** delete content under `content/docs/` to "fix" the build. Content volume isn't the cause.
- **Do** commit each fix on its own branch. Don't stack experimental fixes on `main`.
- **Do** run `npm run build` locally to green before pushing. Stop wasting Vercel build minutes.
- **Do** keep both `package.json` and `package-lock.json` in the same commit when changing deps.
