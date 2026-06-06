# Knowledge Base Nextra

InsightProfit Knowledge Base — Nextra v4

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Nextra

## Project Structure

```
├── app/
│   ├── [[...slug]]
│   ├── ai-research
│   ├── api
│   ├── genspark
│   ├── globals.css
│   ├── import
│   └── ... (3 more)
├── chrome-extension/
├── components/
│   ├── ChatWidget.tsx
│   ├── DocRenderer.tsx
│   ├── IframeApp.tsx
│   ├── ShareBar.tsx
│   └── blocks
├── content/
├── lib/
│   ├── keystatic.ts
│   ├── page-map.ts
│   └── supabase.ts
├── public/
└── scripts/
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18

### Installation

```bash
git clone https://github.com/rtmendes/knowledge-base-nextra.git
cd knowledge-base-nextra
npm install
```

Copy the example environment file and fill in the required values:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com).

Live URL: **https://kb.insightprofit.live**

---

## Editing the Knowledge Base (Keystatic CMS)

The KB has a browser-based content editor powered by [Keystatic](https://keystatic.com).
Once the GitHub App is wired up (one-time setup below), you can edit from any browser or device.

### How to edit

1. Open **https://kb.insightprofit.live/keystatic** in any browser
2. Log in with GitHub (must have write access to this repo)
3. Pick a collection → pick a page → edit → click **Save**
4. Vercel redeploys automatically (~60 seconds). The live site updates.

### One-time GitHub App setup

Run the dev server locally and open http://localhost:3000/keystatic. Keystatic will walk you through
creating a GitHub App called `insightprofit-kb-editor`. After the wizard, you will have four secrets.

Add all four to **Vercel → Project Settings → Environment Variables** (Production + Preview + Development):

| Variable | Scope | Notes |
|---|---|---|
| `KEYSTATIC_GITHUB_CLIENT_ID` | Server only | From GitHub App wizard |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | Server only | From GitHub App wizard |
| `KEYSTATIC_SECRET` | Server only | Generate with: `openssl rand -hex 32` |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Public | Slug of your GitHub App (e.g. `insightprofit-kb-editor`) |

For local dev, add the same four vars to `.env.local` (already gitignored).

**Security:** only `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` is exposed in the client bundle.
Never prefix the other three with `NEXT_PUBLIC_`.

### Full SOP

See `docs/keystatic-SOP.md` for the complete install runbook, troubleshooting guide, and
monthly security review checklist.
