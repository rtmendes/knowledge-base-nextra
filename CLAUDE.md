# CLAUDE.md — Instructions for Codex, Cursor, Claude Code, and ALL AI coding agents

## ⚠️ CRITICAL: DEPLOYMENT MAP — READ BEFORE ANY COMMIT

**This repo:** `knowledge-base-nextra`
**Vercel project:** `knowledge-base-nextra`
**Live URL:** https://kb.insightprofit.live
**Framework:** Next.js
**Deploy:** Push to `main` → Vercel auto-deploys to kb.insightprofit.live

### Full Deployment Map (which repo deploys where)
| Repo | Vercel Project | Live Subdomain |
|------|---------------|----------------|
| apex-deploy | apex-deploy | apex.insightprofit.live |
| closeflow | closeflow | closeflow.insightprofit.live |
| customer-intelligence-engine | insightprofit-intel | intel.insightprofit.live |
| delta-jobs-crm | delta-jobs-crm | jobs.insightprofit.live |
| design-inspiration-curator | design-inspiration-deploy | design.insightprofit.live |
| digest-hq | digest-hq | digest.insightprofit.live |
| elite-writer-app | elite-writer-app | elite-writer-app.insightprofit.live |
| fgs-product-suite | fgs-product-suite | fgs.insightprofit.live |
| insightprofit-academy | insightprofit-academy | academy.insightprofit.live |
| insightprofit-command-v2 | insightprofit-command-v2 | command.insightprofit.live |
| insightprofit-creative | insightprofit-creative | creative.insightprofit.live |
| insightprofit-ecom | insightprofit-ecom | ecom.insightprofit.live |
| insightprofit-emailops | insightprofit-emailops | email.insightprofit.live |
| insightprofit-growth | insightprofit-growth | strategy.insightprofit.live |
| insightprofit-hub | insightprofit-hub | hub.insightprofit.live |
| insightprofit-offers | insightprofit-offers | offers.insightprofit.live |
| insightprofit-services | insightprofit-services | services.insightprofit.live |
| knowledge-base-nextra | knowledge-base-nextra | kb.insightprofit.live ← THIS REPO |
| offer-stack-engine | offer-stack-engine | offers.fundedfirst.com |
| product-board | product-board | products.insightprofit.live |
| research-platform | research-platform | research.insightprofit.live |
| revenue-engine | revenue-engine | revenue.insightprofit.live |
| second-spring-platform | second-spring-platform | secondspring.insightprofit.live |
| social-intelligence-engine | insightprofit-social | social.insightprofit.live |
| sparky-studio | sparky-studio | sparky.insightprofit.live |
| tyber-sync | tyber-sync | tyber.insightprofit.live |
| vidrevamp | vidrevamp | vidrevamp.insightprofit.live |


## ⛔ DEAD REPOS — NEVER COMMIT CODE TO THESE
| Dead Repo | Why | Correct Repo Instead |
|-----------|-----|---------------------|
| insightprofit-command | OLD v1 Command Center | insightprofit-command-v2 |
| insightprofit-kb | OLD KB | knowledge-base-nextra |
| offer-engine | NOT linked to Vercel | insightprofit-offers OR offer-stack-engine |
| insightprofit-command-center | Abandoned | insightprofit-command-v2 |
| insightprofit-mission-control | Abandoned | insightprofit-command-v2 |
| insight-profit-kb | Abandoned | knowledge-base-nextra |


---

## Rules (Non-Negotiable)

1. **NEVER create placeholder/shell pages** — Every view must render REAL data from Supabase
2. **Use EXACT Supabase column names** — PostgREST silently returns 0 rows on wrong names (see schemas below)
3. **Build must pass** — Run `npm run build` or `bun run build` before committing. Zero errors.
4. **Enterprise-grade tables** — Sort, filter, multi-select, pagination, mobile card layout
5. **No auth walls** — Apps must be accessible without signup/login
6. **Real logos** — Use Clearbit (`https://logo.clearbit.com/{domain}`) not emoji placeholders
7. **Clickable hyperlinks** — All URLs, domains, subdomains must be clickable
8. **Mobile responsive** — Card layout below 768px, sidebar overlay, touch targets ≥44px
9. **Loading/error states** — Skeleton loaders, error boundaries with retry, descriptive empty states
10. **Dark theme** — bg:#0a0a0f, accent:#6366f1, text:#f8fafc (Quiet Command design system)


## Supabase Schemas (EXACT column names — wrong names = empty pages)

Connection: `https://supabase.insightprofit.live`
Anon Key: `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2ODcxMjQ0LCJleHAiOjIwODIyMzEyNDR9.qtJF1pWQQr-SGHVYLv0wP4hMiamqfjrNsfsnBm-c2hI`

### ai_agents: use `name`, `status`, `platform`, `metadata` (TEXT with entry_type inside). NO `entry_type`, `department`, `type` columns.
### tech_tools: use `tool_name`, `function_description`, `login_page`. NO `name`, `description`, `url`, `cost_monthly`.
### credential_registry: use `service`, `deployed_locations` (text[] ARRAY). NO `service_name`, `credential_type`.
### ai_expense_log: `total_tokens` is GENERATED — cannot INSERT. Use `provider`, `cost_usd`, `model`.
### clickup_tasks: use `status` not `status_name`. NO `created_at`.
### app_catalog: use `subdomain`, `name`, `hosting`. NO `department`.
### offer_pipeline: `price_point` is TEXT not numeric. NO `created_at`, `revenue`, `status`.
### knowledge_items: use `title`, `content`. NO `source`, `category`, `content_type`, `url`.


## Supabase Connection Pattern
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://supabase.insightprofit.live',
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzY2ODcxMjQ0LCJleHAiOjIwODIyMzEyNDR9.qtJF1pWQQr-SGHVYLv0wP4hMiamqfjrNsfsnBm-c2hI'
);
```

## Quality Checklist (before every commit)
- [ ] `build` passes with zero errors
- [ ] Page shows real data (not empty/mock)
- [ ] Column names match schemas above exactly
- [ ] Pushing to `knowledge-base-nextra` (this repo) which deploys to kb.insightprofit.live
- [ ] Tables have sort + filter + pagination + mobile layout
- [ ] No signup/login walls blocking access

## Secrets & automation (evergreen Infisical — org standard)

- All secrets live in Infisical: project `75ce45d4-9209-45b0-a24d-a2078132f2f8`,
  env `prod`. Never ask the user to paste a secret that exists there.
- Sessions self-provision: the SessionStart hook exports secrets to `.env.local`
  (gitignored), `.mcp.json` provides Infisical MCP tools, `scripts/with-env.sh`
  injects secrets at runtime, and `scripts/secrets.mjs` is a zero-dep Node loader
  (`await loadSecrets()`).
- If a needed secret NAME is missing but an equivalent exists under another name,
  create an alias yourself: `scripts/infisical-ensure-secret.mjs NAME --ref EXISTING`
  (create-if-missing only; allowlisted). Updating/deleting secrets requires asking.
- Automation-first: never ask the user to do manually what can be done
  programmatically from this environment. Only hand over a step when genuinely
  impossible (auth-gated UI), and then as an exact copy-paste.

## Project-Management Mode (standing rule)

This repo tracks its work in `TASKS.md`. That file — not the chat history — is
the source of truth for the goal and the to-do list. Context can compress; the
file cannot. Treat it as the project's memory.

**At the START of every session, before doing anything else:**
1. Read `TASKS.md`.
2. Restate the **Goal** in one line.
3. Show the **To-do**: what is done `[x]`, in progress `[~]`, and pending `[ ]`.
4. State the **Next step** and any **Blocked on** item.
5. Ask the user to confirm the next step (or say "continuing with <X>") before
   starting substantive work.

If `TASKS.md` does not exist, create it from `project-mode/TASKS.template.md`
(or the same template in the design-research repo) by inferring the goal and
current state from the repo, then confirm it with the user.

**As work progresses:** keep `TASKS.md` current — check off finished items,
mark what's in progress, update the **Next step** and **Last updated** lines.

**Before ENDING a session:** update `TASKS.md` so the next session (yours or a
parallel one) can pick up cleanly. The last thing you write is the state, not a
summary that only lives in this thread.

**Credentials never block work here:** secrets load automatically from the vault
on session start (see the Secrets section / `docs/INFISICAL_EVERGREEN.md`). Never
stall a task waiting on a credential — if a needed secret name is missing, create
it with `scripts/infisical-ensure-secret.mjs` and continue.
