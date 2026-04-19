import { NextResponse } from 'next/server'

// Never cache — extension fetches this on every startup to get latest config
export const dynamic = 'force-dynamic'

/**
 * GET /api/extension-config
 *
 * Returns the live configuration for the Genspark KB Extractor Chrome extension.
 * Update this file and deploy to Vercel — all running extension instances pick
 * up the new config immediately without any reinstall or version bump.
 *
 * Versioned sections:
 *   - selectors: CSS selectors for Genspark DOM elements (most likely to break)
 *   - urlPatterns: URL path patterns for identifying page types
 *   - features: Feature flags to enable/disable capabilities
 *   - timing: Wait/delay values in milliseconds
 *   - kb: Knowledge base API endpoint config
 *   - prompts: Pre-built prompt templates
 */
export async function GET() {
  const config = {
    // ── Meta ────────────────────────────────────────────────────────────────
    configVersion: '1.3.0',
    updatedAt: '2026-04-19',
    extensionMinVersion: '1.0.0',

    // ── URL patterns that trigger the extension ─────────────────────────────
    urlPatterns: {
      agent: '/agents?id=',
      spark: '/spark?id=',
      autopilotagent: '/agents?id=',   // same URL pattern, different chat type
      me: '/me',
    },

    // ── DOM Selectors (update here when Genspark changes their UI) ────────────
    selectors: {
      // Share button in the top toolbar
      shareButton: [
        'button[aria-label*="share" i]',
        'button[aria-label*="Share"]',
        '[data-testid*="share"]',
        '.share-button',
        'button:has(svg[data-icon*="share"])',
      ],

      // "Anyone with the link" / public access toggle in share dialog
      publicToggle: [
        'input[type="checkbox"]',
        'button[role="switch"]',
        '[data-testid*="public"]',
        '[aria-label*="anyone" i]',
        'button:has-text("Anyone")',
      ],

      // Chat title heading
      chatTitle: [
        'h1',
        '[data-testid="chat-title"]',
        '.chat-title',
        '.agent-title',
      ],

      // Chat input textarea
      chatInput: [
        'textarea[placeholder*="Ask" i]',
        'textarea[placeholder*="Type" i]',
        'textarea[placeholder*="Message" i]',
        'textarea[placeholder*="Continue" i]',
        '[contenteditable="true"][data-placeholder]',
        'textarea',
      ],

      // Send/submit button
      submitButton: [
        'button[type="submit"]',
        'button[aria-label*="send" i]',
        'button[aria-label*="submit" i]',
        'button[data-testid*="send"]',
        'button[data-testid*="submit"]',
      ],

      // Close/dismiss button inside the share dialog
      shareCloseButton: [
        'button[aria-label*="close" i]',
        'button[aria-label*="dismiss" i]',
        '[data-testid*="close"]',
        'button[aria-label*="done" i]',
        '.modal-close',
        '[role="dialog"] button:last-child',
      ],

      // History sidebar chat list items
      historyItem: [
        '[data-chat-item]',
        '.chat-item',
        '.history-item',
        'a[href*="/agents?id="]',
        'a[href*="/spark?id="]',
      ],
    },

    // ── Timing (milliseconds) ─────────────────────────────────────────────
    timing: {
      pageLoadWait: 1500,         // Wait after page load before capturing
      shareDialogWait: 1000,      // Wait for share button to appear
      afterShareClick: 1000,      // Wait after clicking share for dialog to open
      afterToggleClick: 800,      // Wait after enabling public access
      afterPromptPaste: 500,      // Wait after pasting prompt text
      notificationDuration: 2000, // How long notification stays visible
    },

    // ── Feature flags ─────────────────────────────────────────────────────
    features: {
      autoCapture: true,          // Auto-capture every chat page visited
      autoShare: true,            // Try to enable public sharing
      autoSubmit: false,          // Auto-submit prompts (user opt-in)
      captureSparkPages: true,    // Also capture /spark?id= pages
      captureHubPages: false,     // Capture /hub?id= pages (off by default)
      sendToKB: true,             // Send captured chats to the KB API
      showNotifications: true,    // Show in-page toast notifications
      batchHistoryExport: true,   // Enable bulk history export from /me page
      contentExtraction: true,    // Extract page content (not just IDs)
      skipAlreadyCaptured: true,  // Skip share dialog on already-captured chats
    },

    // ── Knowledge Base Integration ────────────────────────────────────────
    kb: {
      importEndpoint: 'https://kb.insightprofit.live/api/import/genspark',
      deployEndpoint: 'https://kb.insightprofit.live/api/deploy',
      siteUrl: 'https://kb.insightprofit.live',
      enabled: true,
    },

    // ── Built-in prompt templates ─────────────────────────────────────────
    promptTemplates: [
      {
        id: 'extract-summary',
        label: '📋 Extract Summary',
        text: 'Please provide a comprehensive summary of everything we discussed in this chat, including: main topics covered, key decisions made, outputs created, next steps identified, and any important links or resources referenced.',
      },
      {
        id: 'extract-action-items',
        label: '✅ Extract Action Items',
        text: 'List all action items, tasks, and next steps from this conversation. Format as a numbered list with priority (High/Medium/Low) and estimated effort.',
      },
      {
        id: 'extract-code',
        label: '💻 Extract All Code',
        text: 'Please extract and list all code snippets, scripts, and technical artifacts created in this conversation. Include the language, purpose, and filename for each.',
      },
      {
        id: 'create-kb-entry',
        label: '📚 Create KB Entry',
        text: 'Create a structured knowledge base entry from this conversation with sections: Overview, Key Concepts, Implementation Details, Resources & Links, and Lessons Learned.',
      },
    ],

    // ── Announcement banner (set message + show:true to display in popup) ──
    announcement: {
      show: false,
      type: 'info', // info | warning | success
      message: '',
    },
  }

  return NextResponse.json(config, {
    headers: {
      // Allow the extension to fetch this (CORS for chrome-extension:// origin)
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
