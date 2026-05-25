#!/usr/bin/env python3
"""
Genspark KB Extractor — extract.py  (v1.3.0)
=============================================
Production-grade Playwright script that mirrors what the Chrome extension does,
but runs from the command line against your full chat history.

Key improvements over the original skill script:
  • Fetches live config from kb.insightprofit.live/api/extension-config first,
    so selectors stay in sync with the Chrome extension automatically.
  • TWO-PASS architecture: collect all chat URLs in one scroll pass, then
    visit each URL directly — O(n) instead of O(n²).
  • Progress checkpoint (.progress.json): crash and resume from where you left off.
  • Skip-already-captured: checks the KB API before opening the share dialog.
  • 3-layer close-dialog: close button → backdrop click → Escape key.
  • Sends captured chats to kb.insightprofit.live/api/import/genspark (same as extension).
  • CSV and Google Sheets export.
  • --limit, --skip, --dry-run, --paused flags for safe operation.

Usage:
  python extract.py                          # export to CSV + send to KB
  python extract.py --csv-only              # CSV only, skip KB send
  python extract.py --headless --fast       # background mode, no delays
  python extract.py --limit 50             # process at most 50 chats
  python extract.py --skip 10              # skip first 10 (already done)
  python extract.py --dry-run              # discover only, no share dialog
  python extract.py --sheet-id XYZ --credentials creds.json  # Google Sheets
  python extract.py --resume               # continue from .progress.json
"""

import asyncio
import argparse
import csv
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ── Optional Google Sheets import ────────────────────────────────────────────
try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    SHEETS_AVAILABLE = True
except ImportError:
    SHEETS_AVAILABLE = False

try:
    import requests as req_lib
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

# ── Constants ─────────────────────────────────────────────────────────────────
REMOTE_CONFIG_URL   = 'https://kb.insightprofit.live/api/extension-config'
KB_IMPORT_URL       = 'https://kb.insightprofit.live/api/import/genspark'
PROGRESS_FILE       = Path('.progress.json')
OUTPUT_CSV          = 'genspark_share_links.csv'

# Default config — used when the server is unreachable
DEFAULT_CONFIG = {
    'configVersion': 'fallback',
    'urlPatterns': {'agent': '/agents?id=', 'spark': '/spark?id='},
    'selectors': {
        'shareButton': [
            'button[aria-label*="share" i]',
            '.share-button',
            'button:has-text("Share")',
            '[data-testid*="share"]',
        ],
        'publicToggle': [
            'input[type="checkbox"]',
            'button[role="switch"]',
            'button:has-text("Anyone")',
        ],
        'shareCloseButton': [
            'button[aria-label*="close" i]',
            'button[aria-label*="dismiss" i]',
            '[data-testid*="close"]',
            'button[aria-label*="done" i]',
            '.modal-close',
        ],
        'chatTitle': ['h1', '.chat-title', 'title'],
        'historyItem': [
            '.conversation-item a',
            'a[href*="/agents?id="]',
            'a[href*="/spark?id="]',
            '.chat-history-item a',
            'li a[href*="id="]',
        ],
    },
    'timing': {
        'pageLoadWait':    1500,
        'shareDialogWait': 1000,
        'afterShareClick': 1000,
        'afterToggleClick': 800,
        'scrollPauseMs':   800,
        'chatOpenWait':    1500,
    },
    'features': {
        'autoShare':            True,
        'captureSparkPages':    True,
        'sendToKB':             True,
        'skipAlreadyCaptured':  True,
    },
}


# ── Remote config ─────────────────────────────────────────────────────────────

def fetch_remote_config() -> dict:
    """
    Fetch live config from the KB server.
    Falls back to DEFAULT_CONFIG if the server is unreachable.
    Mirrors the logic in background.js → fetchRemoteConfig().
    """
    if not REQUESTS_AVAILABLE:
        print('⚠  requests not installed — using default config')
        return DEFAULT_CONFIG
    try:
        r = req_lib.get(REMOTE_CONFIG_URL, timeout=10)
        r.raise_for_status()
        cfg = r.json()
        print(f'✅ Remote config loaded  v{cfg.get("configVersion", "?")}')
        return cfg
    except Exception as e:
        print(f'⚠  Config fetch failed ({e}) — using defaults')
        return DEFAULT_CONFIG


# ── Progress checkpoint ───────────────────────────────────────────────────────

def load_progress() -> dict:
    if PROGRESS_FILE.exists():
        try:
            return json.loads(PROGRESS_FILE.read_text())
        except Exception:
            pass
    return {'captured': [], 'chat_urls': [], 'cursor': 0}


def save_progress(state: dict) -> None:
    PROGRESS_FILE.write_text(json.dumps(state, indent=2, default=str))


# ── KB API helper ─────────────────────────────────────────────────────────────

def send_to_kb(chat: dict) -> bool:
    if not REQUESTS_AVAILABLE:
        return False
    try:
        r = req_lib.post(
            KB_IMPORT_URL,
            json={'chats': [{
                'chatId':     chat['chatId'],
                'chatName':   chat['chatName'],
                'shareLink':  chat.get('shareLink') or chat.get('url', ''),
                'url':        chat.get('url', ''),
                'type':       chat.get('type', 'agent'),
                'capturedAt': chat.get('capturedAt', ''),
            }]},
            timeout=15,
        )
        return r.ok
    except Exception as e:
        print(f'     ⚠  KB send failed: {e}')
        return False


def already_in_kb(chat_id: str) -> bool:
    """Check KB to avoid re-running the share dialog on known chats."""
    if not REQUESTS_AVAILABLE:
        return False
    try:
        r = req_lib.get(
            KB_IMPORT_URL,
            params={'chatId': chat_id},
            timeout=8,
        )
        if r.ok:
            data = r.json()
            return data.get('exists', False) or data.get('captured', False)
    except Exception:
        pass
    return False


# ── CSV / Sheets export ───────────────────────────────────────────────────────

def export_csv(chats: list, path: str = OUTPUT_CSV) -> str:
    with open(path, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=[
            'index', 'chatId', 'chatName', 'shareLink', 'type',
            'publicAccessEnabled', 'capturedAt',
        ])
        w.writeheader()
        w.writerows(chats)
    print(f'💾 CSV saved → {path}  ({len(chats)} rows)')
    return path


def export_sheets(chats: list, spreadsheet_id: str, credentials_path: str) -> bool:
    if not SHEETS_AVAILABLE:
        print('❌ google-api-python-client not installed — skipping Sheets export')
        return False
    if not os.path.exists(credentials_path):
        print(f'❌ Credentials file not found: {credentials_path}')
        return False
    try:
        creds = service_account.Credentials.from_service_account_file(
            credentials_path,
            scopes=['https://www.googleapis.com/auth/spreadsheets'],
        )
        svc = build('sheets', 'v4', credentials=creds)
        headers = [['Index', 'Chat ID', 'Chat Name', 'Share Link',
                     'Type', 'Public Access', 'Captured At']]
        rows = [[
            c['index'], c['chatId'], c['chatName'],
            c.get('shareLink', ''), c.get('type', 'agent'),
            'YES' if c.get('publicAccessEnabled') else 'NO',
            c.get('capturedAt', ''),
        ] for c in chats]
        svc.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range='Sheet1!A1',
            valueInputOption='RAW',
            body={'values': headers + rows},
        ).execute()
        print(f'📊 Google Sheets updated — {len(rows)} rows')
        return True
    except HttpError as e:
        print(f'❌ Sheets API error: {e}')
        return False


# ── Main extractor class ──────────────────────────────────────────────────────

class GensparkExtractor:
    """
    Two-pass extractor:
      Pass 1 — scroll genspark.ai/me, collect every chat URL into a list.
      Pass 2 — visit each URL directly, enable sharing, record the link.

    This avoids the O(n²) re-scroll-and-rediscover problem of the original.
    """

    def __init__(self, cfg: dict, args: argparse.Namespace):
        self.cfg        = cfg
        self.args       = args
        self.sels       = cfg.get('selectors', DEFAULT_CONFIG['selectors'])
        self.timing     = cfg.get('timing',    DEFAULT_CONFIG['timing'])
        self.features   = cfg.get('features',  DEFAULT_CONFIG['features'])
        self.captured   = []          # list of chat dicts we've processed

    # ── Public entry point ────────────────────────────────────────────────────

    async def run(self) -> list:
        state = load_progress() if self.args.resume else {'captured': [], 'chat_urls': [], 'cursor': 0}
        self.captured = state['captured']

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=self.args.headless,
                slow_mo=0 if self.args.fast else 300,
            )

            # Persistent user-data-dir keeps the genspark.ai login session alive
            user_data = str(Path.home() / '.playwright-genspark')
            context   = await p.chromium.launch_persistent_context(
                user_data,
                headless=self.args.headless,
                slow_mo=0 if self.args.fast else 300,
            )
            await browser.close()   # we only use the persistent context
            page = context.pages[0] if context.pages else await context.new_page()

            # ── Pass 1: collect all chat URLs ─────────────────────────────────
            if state['chat_urls']:
                print(f'↩  Resuming — {len(state["chat_urls"])} URLs already discovered, cursor={state["cursor"]}')
                all_urls = state['chat_urls']
            else:
                all_urls = await self._collect_all_chat_urls(page)
                state['chat_urls'] = all_urls
                save_progress(state)

            if not all_urls:
                print('⚠  No chat URLs found. Check selectors or log in manually.')
                await context.close()
                return self.captured

            # Apply --skip and --limit
            start   = max(self.args.skip, state['cursor'])
            end     = start + self.args.limit if self.args.limit else len(all_urls)
            targets = all_urls[start:end]
            print(f'\n🎯 Will process {len(targets)} chats (indices {start}–{start+len(targets)-1} of {len(all_urls)} total)')

            # ── Pass 2: visit each chat URL and capture ────────────────────────
            for offset, url in enumerate(targets):
                global_idx = start + offset + 1
                print(f'\n[{global_idx}/{len(all_urls)}] {url}')

                chat = await self._capture_chat(page, url, global_idx)
                if chat:
                    self.captured.append(chat)
                    state['cursor'] = global_idx
                    state['captured'] = self.captured
                    save_progress(state)

                    if self.features.get('sendToKB') and not self.args.csv_only:
                        ok = send_to_kb(chat)
                        print(f'     KB: {"✅ sent" if ok else "⚠  skipped"}')

            await context.close()

        # Clean up progress file on successful completion
        if PROGRESS_FILE.exists() and not self.args.keep_progress:
            PROGRESS_FILE.unlink()
            print('\n🧹 Progress file removed (run complete)')

        print(f'\n✅ Done — {len(self.captured)} chats captured')
        return self.captured

    # ── Pass 1: collect URLs ──────────────────────────────────────────────────

    async def _collect_all_chat_urls(self, page) -> list:
        print('\n📋 Pass 1 — navigating to genspark.ai/me to collect all chat URLs…')
        await page.goto('https://www.genspark.ai/me', wait_until='domcontentloaded')
        await self._wait(self.timing.get('pageLoadWait', 1500))

        # Ensure user is logged in
        await self._ensure_logged_in(page)

        # Scroll to load the full history (infinite scroll)
        await self._scroll_to_bottom(page)

        # Harvest all chat URLs
        urls = await self._harvest_chat_urls(page)
        print(f'✅ Found {len(urls)} chat URLs')
        return urls

    async def _scroll_to_bottom(self, page) -> None:
        pause = self.timing.get('scrollPauseMs', 800)
        print('📜 Scrolling to load all chats…')
        prev_h = -1
        passes = 0
        while passes < 40:   # safety cap — 40 scrolls × ~20 chats = 800 chats
            cur_h = await page.evaluate('document.body.scrollHeight')
            if cur_h == prev_h:
                break
            prev_h = cur_h
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
            await self._wait(pause)
            passes += 1
            if passes % 5 == 0:
                print(f'   … scroll pass {passes}')
        print(f'   Done scrolling ({passes} passes)')

    async def _harvest_chat_urls(self, page) -> list:
        """
        Try every selector from the remote config's historyItem list.
        Returns a deduplicated list of absolute chat-page URLs.
        """
        url_patterns = self.cfg.get('urlPatterns', DEFAULT_CONFIG['urlPatterns'])
        agent_pat    = url_patterns.get('agent', '/agents?id=')
        spark_pat    = url_patterns.get('spark', '/spark?id=')

        all_hrefs = set()
        for sel in self.sels.get('historyItem', DEFAULT_CONFIG['selectors']['historyItem']):
            try:
                elements = await page.query_selector_all(sel)
                for el in elements:
                    href = await el.get_attribute('href')
                    if href and (agent_pat in href or spark_pat in href):
                        # Resolve relative URLs
                        if href.startswith('/'):
                            href = 'https://www.genspark.ai' + href
                        all_hrefs.add(href)
            except Exception:
                pass

        # Preserve approximate history order (agents first, then sparks)
        ordered = sorted(all_hrefs, key=lambda u: (
            0 if agent_pat in u else 1,
            u,
        ))
        return ordered

    # ── Pass 2: capture one chat ──────────────────────────────────────────────

    async def _capture_chat(self, page, url: str, index: int) -> dict | None:
        # Determine type and extract chatId
        url_patterns = self.cfg.get('urlPatterns', DEFAULT_CONFIG['urlPatterns'])
        chat_type = 'spark' if url_patterns.get('spark', '/spark?id=') in url else 'agent'

        import re
        m = re.search(r'[?&]id=([a-f0-9-]+)', url, re.IGNORECASE)
        if not m:
            print(f'   ⚠  Cannot parse chatId from URL — skipping')
            return None
        chat_id = m.group(1)

        # Skip check against captured list and KB
        already_local = any(c['chatId'] == chat_id for c in self.captured)
        if already_local:
            print(f'   ↩  Already captured locally — skipping')
            return None

        if self.features.get('skipAlreadyCaptured') and not self.args.dry_run:
            if already_in_kb(chat_id):
                print(f'   ↩  Already in KB — skipping share dialog')
                return None

        # Navigate to the chat page
        try:
            await page.goto(url, wait_until='domcontentloaded')
        except Exception as e:
            print(f'   ❌ Navigation failed: {e}')
            return None
        await self._wait(self.timing.get('chatOpenWait', 1500))

        chat_name = await self._get_chat_title(page)
        print(f'   📄 {chat_name}')

        # Enable public sharing (unless --dry-run)
        public_ok = False
        if self.features.get('autoShare') and not self.args.dry_run:
            try:
                public_ok = await self._enable_sharing(page)
            except Exception as e:
                print(f'   ⚠  Share dialog error: {e}')
                await self._close_share_dialog(page)   # always clean up

        return {
            'index':               index,
            'chatId':              chat_id,
            'chatName':            chat_name,
            'shareLink':           url,
            'url':                 url,
            'type':                chat_type,
            'publicAccessEnabled': public_ok,
            'capturedAt':          datetime.now(timezone.utc).isoformat(),
        }

    # ── Share dialog helpers ──────────────────────────────────────────────────

    async def _enable_sharing(self, page) -> bool:
        """
        Open the share dialog, enable public access, close cleanly.
        Mirrors the enablePublicSharing() logic in content.js.
        """
        await self._wait(self.timing.get('shareDialogWait', 1000))

        # Find and click the share button
        share_btn = await self._find_element(page, self.sels.get('shareButton', []))
        if not share_btn:
            share_btn = await self._find_by_text(page, ['share'], ['button'])
        if not share_btn:
            raise RuntimeError('Share button not found')

        await share_btn.click()
        await self._wait(self.timing.get('afterShareClick', 1000))

        # Find and click the public access toggle
        toggle = await self._find_element(page, self.sels.get('publicToggle', []))
        if not toggle:
            toggle = await self._find_by_text(page, ['anyone with', 'public'], ['button', 'div', 'input'])
        if toggle:
            await toggle.click()
            await self._wait(self.timing.get('afterToggleClick', 800))

        # Always close the dialog
        await self._close_share_dialog(page)
        return True

    async def _close_share_dialog(self, page) -> None:
        """
        3-layer close strategy — mirrors closeShareDialog() in content.js:
          1. Dedicated close/dismiss button inside the dialog
          2. Click backdrop outside the modal rect
          3. Escape key
        """
        # Layer 1: close button
        close_btn = await self._find_element(page, self.sels.get('shareCloseButton', []))
        if not close_btn:
            close_btn = await self._find_by_text(page, ['close', 'dismiss', 'done'], ['button'])
        if close_btn:
            try:
                await close_btn.click()
                await self._wait(300)
                return
            except Exception:
                pass

        # Layer 2: click backdrop
        dialog = await page.query_selector('[role="dialog"]')
        if dialog:
            box = await dialog.bounding_box()
            if box:
                # Click 20px to the left of the dialog
                x = max(0, box['x'] - 20)
                y = box['y'] + box['height'] // 2
                await page.mouse.click(x, y)
                await self._wait(300)
                return

        # Layer 3: Escape
        await page.keyboard.press('Escape')
        await self._wait(200)

    # ── DOM helpers ───────────────────────────────────────────────────────────

    async def _find_element(self, page, selector_list: list):
        for sel in selector_list:
            try:
                el = await page.query_selector(sel)
                if el and await el.is_visible():
                    return el
            except Exception:
                pass
        return None

    async def _find_by_text(self, page, keywords: list, tag_names: list):
        for tag in tag_names:
            try:
                elements = await page.query_selector_all(tag)
                for el in elements:
                    if not await el.is_visible():
                        continue
                    text = (await el.inner_text()).lower()
                    aria = (await el.get_attribute('aria-label') or '').lower()
                    if any(k in text or k in aria for k in keywords):
                        return el
            except Exception:
                pass
        return None

    async def _get_chat_title(self, page) -> str:
        for sel in self.sels.get('chatTitle', ['h1']):
            try:
                el = await page.query_selector(sel)
                if el:
                    text = (await el.inner_text()).strip()
                    if text:
                        return text
            except Exception:
                pass
        title = await page.title()
        return title or 'Genspark Chat'

    async def _ensure_logged_in(self, page) -> None:
        """If not logged in, wait for the user to do so manually."""
        try:
            await page.wait_for_selector(
                'text=History, .chat-history, [href*="/me"]',
                timeout=6000,
            )
        except PlaywrightTimeout:
            print('\n⚠  Not logged in. Please log in to genspark.ai in the browser window.')
            print('   Press Enter once you are logged in…')
            input()

    @staticmethod
    async def _wait(ms: int | float) -> None:
        await asyncio.sleep(ms / 1000)


# ── CLI ───────────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description='Genspark KB Extractor v1.3.0 — bulk share-link extractor',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    p.add_argument('--headless',       action='store_true', help='Run browser in background')
    p.add_argument('--fast',           action='store_true', help='Remove slow-mo delays')
    p.add_argument('--dry-run',        action='store_true', help='Discover URLs only, no share dialog')
    p.add_argument('--csv-only',       action='store_true', help='Skip KB API send, export CSV only')
    p.add_argument('--resume',         action='store_true', help='Resume from .progress.json checkpoint')
    p.add_argument('--keep-progress',  action='store_true', help='Do not delete .progress.json after run')
    p.add_argument('--limit',          type=int, default=0,  help='Max chats to process (0 = unlimited)')
    p.add_argument('--skip',           type=int, default=0,  help='Skip first N chats in history')
    p.add_argument('--output',         type=str, default=OUTPUT_CSV, help='CSV output path')
    p.add_argument('--sheet-id',       type=str, help='Google Sheets spreadsheet ID')
    p.add_argument('--credentials',    type=str, help='Path to Google service-account credentials JSON')
    return p


async def main() -> None:
    args = build_parser().parse_args()

    print('=' * 60)
    print('  Genspark KB Extractor  v1.3.0')
    print(f'  {datetime.now().strftime("%Y-%m-%d %H:%M")}')
    print('=' * 60)

    # Step 1: fetch live config
    print('\n🌐 Fetching remote config…')
    cfg = fetch_remote_config()

    # Step 2: run extraction
    extractor = GensparkExtractor(cfg, args)
    captured  = await extractor.run()

    if not captured:
        print('\n⚠  Nothing to export.')
        sys.exit(0)

    # Step 3: export
    print(f'\n📦 Exporting {len(captured)} chats…')
    export_csv(captured, args.output)

    if args.sheet_id and args.credentials:
        export_sheets(captured, args.sheet_id, args.credentials)
    elif args.sheet_id:
        print('⚠  --sheet-id requires --credentials')

    print(f'\n🎉 All done!  {len(captured)} chats processed.')
    print(f'   CSV: {args.output}')
    print(f'   KB:  {KB_IMPORT_URL}')


if __name__ == '__main__':
    asyncio.run(main())
