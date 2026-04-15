/**
 * Genspark KB Extractor — background.js (service worker)
 *
 * Fetches live config from kb.insightprofit.live on every startup.
 * DOM selectors, features, timing — all remotely controlled.
 * Update the server config and every extension instance picks it up
 * within 5 minutes, with zero reinstall required.
 */

const CONFIG_URL = 'https://kb.insightprofit.live/api/extension-config'
const CONFIG_TTL_MS = 5 * 60 * 1000  // re-fetch config every 5 minutes

let capturedChats = []
let remoteConfig = null

// ── Boot: load stored data + fresh remote config ───────────────────────────
async function boot () {
  const stored = await chrome.storage.local.get(['capturedChats', 'remoteConfig', 'configFetchedAt'])
  capturedChats = stored.capturedChats || []

  const cacheAge = Date.now() - (stored.configFetchedAt || 0)
  if (stored.remoteConfig && cacheAge < CONFIG_TTL_MS) {
    remoteConfig = stored.remoteConfig
    console.log('[KB Ext] Cached config v' + remoteConfig.configVersion)
  } else {
    await fetchRemoteConfig()
  }

  updateBadge()
}

async function fetchRemoteConfig () {
  try {
    const res = await fetch(CONFIG_URL, { cache: 'no-store' })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    remoteConfig = await res.json()
    await chrome.storage.local.set({ remoteConfig, configFetchedAt: Date.now() })
    console.log('[KB Ext] Remote config loaded v' + remoteConfig.configVersion)

    if (remoteConfig.announcement?.show) {
      chrome.action.setBadgeText({ text: '!' })
      chrome.action.setBadgeBackgroundColor({ color: '#FF5722' })
    }
  } catch (err) {
    console.warn('[KB Ext] Config fetch failed, using defaults:', err.message)
    remoteConfig = getDefaultConfig()
  }
}

function getDefaultConfig () {
  return {
    configVersion: 'fallback',
    urlPatterns: { agent: '/agents?id=', spark: '/spark?id=' },
    selectors: {
      shareButton: ['button[aria-label*="share" i]', '.share-button'],
      publicToggle: ['input[type="checkbox"]', 'button[role="switch"]'],
      chatTitle: ['h1'],
      chatInput: ['textarea[placeholder*="Ask" i]', 'textarea'],
      submitButton: ['button[type="submit"]'],
    },
    timing: {
      pageLoadWait: 2000, shareDialogWait: 1500,
      afterShareClick: 1500, afterToggleClick: 1000,
      afterPromptPaste: 500, notificationDuration: 2000,
    },
    features: {
      autoCapture: true, autoShare: true, autoSubmit: false,
      captureSparkPages: true, sendToKB: true, showNotifications: true,
      batchHistoryExport: true,
    },
    kb: { importEndpoint: 'https://kb.insightprofit.live/api/import/genspark', enabled: true },
    promptTemplates: [],
  }
}

// ── Refresh config on alarm (every 5 min) ────────────────────────────────
chrome.alarms.create('refreshConfig', { periodInMinutes: 5 })
chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'refreshConfig') fetchRemoteConfig()
})

// ── Message hub ────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  handleMessage(request)
    .then(sendResponse)
    .catch(err => sendResponse({ success: false, error: err.message }))
  return true  // keep channel open for async
})

async function handleMessage (req) {
  switch (req.action) {

    // Popup/content script asks for current config
    case 'getConfig':
      if (!remoteConfig) await fetchRemoteConfig()
      return { config: remoteConfig }

    // Popup manually triggers a config refresh
    case 'refreshConfig':
      await fetchRemoteConfig()
      return { config: remoteConfig, version: remoteConfig?.configVersion }

    // Content script reports a newly visited chat page
    case 'captureChat': {
      const chat = req.data
      if (capturedChats.some(c => c.chatId === chat.chatId)) {
        return { success: false, message: 'Already captured', total: capturedChats.length }
      }
      chat.index = capturedChats.length + 1
      capturedChats.push(chat)
      await chrome.storage.local.set({ capturedChats })
      updateBadge()

      const kb = remoteConfig?.kb ?? getDefaultConfig().kb
      if (kb.enabled) sendToKB(chat, kb).catch(console.warn)

      return { success: true, total: capturedChats.length }
    }

    case 'getChats':
      return { chats: capturedChats }

    case 'clearChats':
      capturedChats = []
      await chrome.storage.local.set({ capturedChats: [] })
      chrome.action.setBadgeText({ text: '' })
      return { success: true }

    // Bulk export from history page
    case 'exportBatch': {
      const incoming = req.chats || []
      const existing = new Set(capturedChats.map(c => c.chatId))
      const newOnes = incoming.filter(c => !existing.has(c.chatId))
        .map((c, i) => ({ ...c, index: capturedChats.length + i + 1 }))
      capturedChats.push(...newOnes)
      await chrome.storage.local.set({ capturedChats })
      updateBadge()
      return { success: true, added: newOnes.length, total: capturedChats.length }
    }

    default:
      return { success: false, error: 'Unknown action: ' + req.action }
  }
}

// ── Send captured chat to KB import API ───────────────────────────────────
async function sendToKB (chat, kb) {
  const res = await fetch(kb.importEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chats: [{
        chatId: chat.chatId,
        chatName: chat.chatName,
        shareLink: chat.shareLink || chat.url,
        url: chat.url,
        type: chat.type || 'agent',
        capturedAt: chat.capturedAt,
      }],
    }),
  })
  if (!res.ok) console.warn('[KB Ext] KB import failed:', res.status, await res.text())
  else console.log('[KB Ext] Sent to KB:', chat.chatName)
}

function updateBadge () {
  const n = capturedChats.length
  chrome.action.setBadgeText({ text: n > 0 ? String(n) : '' })
  chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' })
}

// ── Startup ────────────────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(boot)
chrome.runtime.onStartup.addListener(boot)
boot()
