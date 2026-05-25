# Genspark KB Extractor — CLI v1.3.0

Command-line companion to the **Genspark KB Extractor Chrome extension**.
Bulk-extracts public share links from your entire Genspark chat history and
sends them to `kb.insightprofit.live`.

---

## How it differs from the Chrome extension

| | Chrome Extension | This script |
|---|---|---|
| **Trigger** | Every page you visit | Run on demand |
| **Scope** | One chat at a time | Entire history in one run |
| **Login** | Your browser session | Persistent Playwright profile |
| **Config** | Fetched from server | Same server, fetched at startup |
| **Progress** | `chrome.storage.local` | `.progress.json` checkpoint |
| **Export** | KB API only | KB API + CSV + Google Sheets |

---

## Quick start

```bash
# 1. Install dependencies
pip install -r requirements.txt
playwright install chromium

# 2. Run (visible browser window, CSV + KB send)
python extract.py

# 3. Or run silently
python extract.py --headless --fast
```

The first time you run, a Chromium window opens. Log in to `genspark.ai` and press
Enter in the terminal. Your session is saved to `~/.playwright-genspark/` so you
only need to log in once.

---

## All flags

```
--headless          Run browser in background (no visible window)
--fast              Remove slow-motion delays
--dry-run           Discover URLs only — skip share dialog (safe test mode)
--csv-only          Export CSV only, skip KB API send
--resume            Continue from .progress.json checkpoint
--keep-progress     Do not delete .progress.json after a successful run
--limit N           Process at most N chats (default: unlimited)
--skip N            Skip first N chats (useful for batching)
--output PATH       CSV output file path (default: genspark_share_links.csv)
--sheet-id ID       Google Sheets spreadsheet ID
--credentials PATH  Path to Google service-account credentials JSON
```

---

## Common workflows

### Export everything to CSV
```bash
python extract.py --csv-only
```

### Batch processing (500 chats in groups of 100)
```bash
python extract.py --skip 0   --limit 100 --resume
python extract.py --skip 100 --limit 100 --resume
# … etc.
```

### Safe discovery run first, then full run
```bash
# See how many chats exist without touching any share dialogs
python extract.py --dry-run

# Then do the real run
python extract.py
```

### Export to Google Sheets
```bash
python extract.py \
  --sheet-id "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" \
  --credentials ~/secrets/genspark-sheets-creds.json
```

### Resume after a crash or Ctrl+C
```bash
python extract.py --resume
```
Progress is saved after every successful chat to `.progress.json`.

---

## How selectors stay current

At startup the script calls `kb.insightprofit.live/api/extension-config` —
the **same endpoint** the Chrome extension's `background.js` polls every 5 minutes.
If Genspark changes their DOM and you update the server config, both the extension
and this script pick up the fix automatically. No reinstall required.

---

## Google Sheets setup (optional)

1. [Create a Google Cloud project](https://console.cloud.google.com/) and enable the **Sheets API**
2. Create a **Service Account** → download the credentials JSON
3. Share your target spreadsheet with the service account email (`...@...iam.gserviceaccount.com`)
4. Pass `--sheet-id` and `--credentials` flags

---

## Output CSV columns

| Column | Description |
|---|---|
| `index` | Sequential position in history |
| `chatId` | UUID from the URL `?id=` parameter |
| `chatName` | Page `<h1>` title |
| `shareLink` | The chat URL (public once share is enabled) |
| `type` | `agent` or `spark` |
| `publicAccessEnabled` | `True` if share dialog succeeded |
| `capturedAt` | ISO 8601 UTC timestamp |

---

## Troubleshooting

### "No chat URLs found"
- Run without `--headless` to see the browser
- Open DevTools → inspect the history sidebar element
- Update `historyItem` selectors in `app/api/extension-config/route.ts` and redeploy —
  the script will pick them up on next run without any code change

### Share dialog not closing
The script uses a 3-layer close strategy (close button → backdrop click → Escape).
If none work, the script continues to the next chat anyway.

### Rate limiting
For 500+ chats, add `--limit 100` and run in batches with `--skip`.
