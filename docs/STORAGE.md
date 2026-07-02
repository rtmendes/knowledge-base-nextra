# KB Object Storage — Cloudflare R2

## Target

- **Bucket:** `elite-writer-media` (existing, created 2026-06-11) — REUSED, no new paid bucket minted.
- **Key prefix:** `kb/` — keeps KB assets separate from EliteWriter media in the same bucket.
- **Endpoint:** `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com` (S3-compatible).
- A dedicated `kb-assets` bucket is a founder decision (new paid infra) — not created.

## Config (references only — no secrets in repo)

Set in Vercel project `knowledge-base-nextra` (all environments) and `.env.local` for local dev:

| Var | Value |
|-----|-------|
| `R2_ACCOUNT_ID` | Cloudflare account id (dashboard → R2 → right sidebar) |
| `R2_ACCESS_KEY_ID` | From an R2 API token (Object Read & Write, scoped to `elite-writer-media`) |
| `R2_SECRET_ACCESS_KEY` | Same token's secret |
| `R2_BUCKET` | `elite-writer-media` (default if unset) |
| `R2_KB_PREFIX` | `kb/` (default if unset) |
| `R2_PUBLIC_BASE_URL` | Optional — only if the bucket gets a public custom domain |

Code entry point: [lib/r2.ts](../lib/r2.ts) — `getR2Config()` returns `null` until the three
required vars are set, so nothing breaks while credentials are pending.
`/api/health` exposes `hasR2Config: boolean` for outside verification.

## Creating the R2 API token (click-by-click, one-time)

1. Open https://dash.cloudflare.com in your browser and log in.
2. In the left sidebar, click **R2 Object Storage**.
3. On the right side of the R2 page, click **Manage R2 API Tokens** (blue link).
4. Click the blue **Create API Token** button.
5. Token name: type `kb-assets`.
6. Under Permissions, choose **Object Read & Write**.
7. Under "Specify bucket(s)", choose **Apply to specific buckets only** and tick `elite-writer-media`.
8. Click **Create API Token**.
9. The next screen shows **Access Key ID** and **Secret Access Key** ONCE. Copy both into a note temporarily.
10. Go to https://vercel.com → team `rashida-mendes-projects` → project `knowledge-base-nextra` → **Settings** tab → **Environment Variables** (left menu).
11. Add three variables, each with all three environments (Production, Preview, Development) ticked:
    - Name `R2_ACCOUNT_ID`, value = the Account ID shown on the R2 overview page right sidebar.
    - Name `R2_ACCESS_KEY_ID`, value = the Access Key ID you copied.
    - Name `R2_SECRET_ACCESS_KEY`, value = the Secret Access Key you copied.
12. Click **Save** after each. Delete the temporary note.
