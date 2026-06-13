# KB Site Upgrade Plan
## Branch: `ip/kb-site-upgrade`

---

## What Already Exists (don't touch)

| Feature | Where |
|---|---|
| Premium hero + category cards | `app/(app)/kb/page.tsx` |
| "New Page" button (toolbar) | `components/kb/KBWorkspaceLayout.tsx` → `CreateItemModal` |
| ⌘K global search palette | `CommandPalette.tsx` → `/api/kb/items?q=` |
| AI-powered semantic search | `SemanticSearchBar.tsx` → `/api/kb/search` |
| Type filter | `TypeFilter.tsx` |
| Chat widget (CoS) | `KBChatAssistant.tsx` → `/api/kb/chat` |
| Sidebar with category nav | `KBSidebar.tsx` |
| Bulk select + bulk actions | `BulkOperationsBar.tsx` |
| Tags panel | `TagsPanel.tsx` |
| Item CRUD routes | `/api/kb/items/create`, `/api/kb/items/[id]/update`, `update-meta` |
| Resizable panel layout | `ResizablePanels.tsx` |

---

## What Will Be Added

### F1 — URL Ingest tab in CreateItemModal
- Add a "Ingest URL" tab alongside "Create Page" in `CreateItemModal.tsx`
- "Create Page" tab: add optional `tags` input field
- "Ingest URL" tab: URL + category + tags → POST `/api/kb/ingest`

### F2 — `/api/kb/ingest` route
- New file: `app/api/kb/ingest/route.ts`
- Calls Firecrawl API with the URL → extracts markdown content
- Saves to `knowledge_items` with `item_type: 'imported'`
- Returns created item `{id, title, slug}`

### F3 — CSV Export
- New file: `app/api/kb/export/route.ts`
- GET with optional `?category_id=&item_type=&q=`
- Streams CSV: `id, title, item_type, category, tags, word_count, status, created_at, source_url`
- Export button added to `KBWorkspaceLayout` toolbar

### F4 — Bulk URL Import
- New file: `components/kb/BulkImportModal.tsx`
- Textarea paste (one URL per line), category dropdown, start button
- Calls `/api/kb/ingest` for each URL sequentially with progress counter
- "Import URLs" button added to `KBWorkspaceLayout` toolbar

### F5 — Chat `kb_add` / `kb_update` tools
- Modified file: `app/api/kb/chat/route.ts`
- Add two OpenRouter function definitions: `kb_add` and `kb_update`
- Parse `tool_calls` chunks from the OpenRouter stream
- Execute tool server-side, send tool result, continue conversation

---

## File Map

| Status | File | Change |
|---|---|---|
| NEW | `docs/UPGRADE-PLAN.md` | This file |
| NEW | `app/api/kb/ingest/route.ts` | Firecrawl ingest endpoint |
| NEW | `app/api/kb/export/route.ts` | CSV export endpoint |
| NEW | `components/kb/BulkImportModal.tsx` | Bulk URL import UI |
| MODIFIED | `components/kb/CreateItemModal.tsx` | Add Ingest URL tab + tags field |
| MODIFIED | `components/kb/KBWorkspaceLayout.tsx` | Add Export + Import buttons to toolbar |
| MODIFIED | `app/api/kb/chat/route.ts` | Add kb_add / kb_update tool calling |
| MODIFIED | `.env.example` | Add OPENROUTER_API_KEY + FIRECRAWL_API_KEY |
| MODIFIED | `.env.local` | Add OPENROUTER_API_KEY + FIRECRAWL_API_KEY (manual step) |

---

## Environment Variables Required

```bash
OPENROUTER_API_KEY=sk-or-...        # Free-tier models for chat
FIRECRAWL_API_KEY=fc-...            # URL scraping for ingest
```

---

## Verify Checklist

- [ ] `npm run build` — zero errors
- [ ] New Page modal opens → can create item → redirects to item page
- [ ] Ingest URL tab → paste URL → item appears in KB
- [ ] Export button → downloads CSV with real data
- [ ] Bulk Import → paste 3 URLs → all 3 items created
- [ ] Chat: "Add a KB page about X" → item created with link in response
