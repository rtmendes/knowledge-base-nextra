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
