/**
 * Genspark KB Extractor — content.js
 *
 * Runs on every genspark.ai page. Fetches live config from the background
 * service worker (which in turn fetches from kb.insightprofit.live).
 * All DOM selectors and feature flags are config-driven — update the
 * remote config to fix broken selectors or enable new features instantly.
 *
 * Guard rails (in order):
 *  1. Synchronous URL check — bail immediately if this isn't a chat page
 *  2. Paused state check — bail if user has paused the extension
 *  3. isCaptured check — skip expensive share automation for known chats
 *  4. Share dialog cleanup — always closes the dialog even if toggle fails
 */
;(async function () {

  // ── 1. SYNCHRONOUS URL GUARD — fast exit on landing / non-chat pages ──────
  //  Do this before any async work so we never delay or block other pages.
  const url = window.location.href
  const hasId = url.includes('?id=') || url.includes('&id=')
  if (!hasId) return   // not a chat page — exit immediately, zero overhead

  // ── 2. Paused-state guard — read from storage before any network call ─────
  //  chrome.storage.local.get is the only async call we permit before bailing.
  const pausedStore = await new Promise(resolve => {
    chrome.storage.local.get(['extensionPaused'], resolve)
  })
  if (pausedStore.extensionPaused) return  // user paused — silent exit

  // ── 3. Get config from background worker ─────────────────────────────────
  let cfg
  try {
    const res = await chrome.runtime.sendMessage({ action: 'getConfig' })
    cfg = res?.config
  } catch (_) { /* extension context not ready */ }

  if (!cfg) {
    cfg = {
      urlPatterns: { agent: '/agents?id=', spark: '/spark?id=' },
      selectors: {
        shareButton: ['button[aria-label*="share" i]', '.share-button'],
        publicToggle: ['input[type="checkbox"]', 'button[role="switch"]'],
        shareCloseButton: ['button[aria-label*="close" i]', 'button[aria-label*="dismiss" i]', '[data-testid*="close"]'],
        chatTitle: ['h1'],
        chatInput: ['textarea[placeholder*="Ask" i]', 'textarea'],
        submitButton: ['button[type="submit"]'],
      },
      timing: { pageLoadWait: 1500, shareDialogWait: 1000, afterShareClick: 1000, afterToggleClick: 800, afterPromptPaste: 500, notificationDuration: 2000 },
      features: { autoCapture: true, autoShare: true, autoSubmit: false, captureSparkPages: true, showNotifications: true, skipAlreadyCaptured: true },
    }
  }

  const { selectors, timing, features, urlPatterns } = cfg

  // ── 4. Determine page type ────────────────────────────────────────────────
  const isAgentPage = url.includes(urlPatterns.agent)
  const isSparkPage = url.includes(urlPatterns.spark) && features.captureSparkPages
  if (!isAgentPage && !isSparkPage) return

  const idMatch = url.match(/[?&]id=([a-f0-9-]+)/i)
  if (!idMatch) return

  const chatId = idMatch[1]
  const chatType = isSparkPage ? 'spark' : 'agent'

  // ── 5. isCaptured pre-check — skip share automation for known chats ────────
  //  This prevents the extension from re-opening the share dialog on pages
  //  the user is actively revisiting.
  let alreadyCaptured = false
  if (features.skipAlreadyCaptured !== false) {
    try {
      const checkRes = await chrome.runtime.sendMessage({ action: 'isCaptured', chatId })
      alreadyCaptured = checkRes?.captured === true
    } catch (_) { /* ignore */ }
  }

  // ── 6. Wait for page render ───────────────────────────────────────────────
  await wait(timing.pageLoadWait)
  const chatName = getChatTitle(selectors.chatTitle)

  // ── 7. Enable public sharing (only on NEW chats) ──────────────────────────
  let publicAccessEnabled = false
  if (features.autoShare && !alreadyCaptured) {
    try {
      publicAccessEnabled = await enablePublicSharing(selectors, timing)
    } catch (err) {
      console.warn('[KB Ext] Could not enable public sharing:', err.message)
      // Ensure any open share dialog is closed even on failure
      await closeShareDialog(selectors, timing)
    }
  }

  // ── 8. Capture ────────────────────────────────────────────────────────────
  chrome.runtime.sendMessage({
    action: 'captureChat',
    data: { chatId, chatName, type: chatType, shareLink: url, url, publicAccessEnabled, capturedAt: new Date().toISOString() },
  }, (res) => {
    if (!res?.success) return
    if (features.showNotifications) showToast(res.total, chatName, publicAccessEnabled, timing.notificationDuration)
    if (features.autoSubmit) {
      chrome.storage.local.get(['autoSubmitEnabled', 'promptText'], async (stored) => {
        if (stored.autoSubmitEnabled && stored.promptText?.trim()) {
          await submitPrompt(stored.promptText, selectors, timing).catch(console.error)
        }
      })
    }
  })

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getChatTitle (titleSelectors) {
    for (const sel of titleSelectors) {
      try {
        const el = document.querySelector(sel)
        if (el?.textContent?.trim()) return el.textContent.trim()
      } catch (_) {}
    }
    return document.title || 'Genspark Chat'
  }

  function findElement (selectorList) {
    for (const sel of selectorList) {
      try {
        const els = document.querySelectorAll(sel)
        for (const el of els) {
          if (el.offsetParent !== null) return el
        }
      } catch (_) { /* skip invalid selectors */ }
    }
    return null
  }

  function findByText (keywords, tagNames) {
    const all = document.querySelectorAll(tagNames.join(','))
    for (const el of all) {
      if (el.offsetParent === null) continue
      const text = (el.textContent || '').toLowerCase()
      const aria = (el.getAttribute('aria-label') || '').toLowerCase()
      if (keywords.some(k => text.includes(k) || aria.includes(k))) return el
    }
    return null
  }

  /** Close any open share dialog via three escalating strategies */
  async function closeShareDialog (sels, t) {
    // 1. Try a dedicated close/dismiss button inside the dialog
    const closeBtn = sels.shareCloseButton
      ? (findElement(sels.shareCloseButton) || findByText(['close', 'dismiss', 'done'], ['button']))
      : null
    if (closeBtn) {
      click(closeBtn)
      await wait(300)
      return
    }
    // 2. Click the backdrop (outside any modal)
    const backdrop = document.querySelector('[role="dialog"]')
    if (backdrop) {
      const rect = backdrop.getBoundingClientRect()
      // Click 20px outside the top-left corner
      document.dispatchEvent(new MouseEvent('click', {
        bubbles: true, clientX: Math.max(0, rect.left - 20), clientY: Math.max(0, rect.top - 20),
      }))
      await wait(300)
    }
    // 3. Escape key as final fallback
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }))
    await wait(200)
  }

  async function enablePublicSharing (sels, t) {
    await wait(t.shareDialogWait)
    let btn = findElement(sels.shareButton) || findByText(['share'], ['button', 'div[role="button"]'])
    if (!btn) throw new Error('Share button not found')
    click(btn)
    await wait(t.afterShareClick)

    const toggle = findElement(sels.publicToggle) || findByText(['anyone with', 'public'], ['button', 'div', 'input'])
    if (toggle) {
      click(toggle)
      await wait(t.afterToggleClick)
    }

    // Always close the dialog cleanly after toggling
    await closeShareDialog(sels, t)
    return true
  }

  async function submitPrompt (text, sels, t) {
    await wait(2000)
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    await wait(500)
    const input = findElement(sels.chatInput)
    if (!input) throw new Error('Chat input not found')
    input.focus()
    await wait(300)
    if (input.tagName === 'TEXTAREA' || input.tagName === 'INPUT') {
      input.value = text
      input.dispatchEvent(new Event('input', { bubbles: true }))
      input.dispatchEvent(new Event('change', { bubbles: true }))
    } else {
      input.textContent = text
      input.dispatchEvent(new InputEvent('input', { bubbles: true }))
    }
    await wait(t.afterPromptPaste)
    const submitBtn = findElement(sels.submitButton) || findByText(['send', 'submit'], ['button'])
    if (submitBtn) {
      click(submitBtn)
    } else {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true }))
    }
    showPromptToast(text, t.notificationDuration)
  }

  function click (el) {
    const o = { bubbles: true, cancelable: true }
    el.dispatchEvent(new PointerEvent('pointerdown', { ...o, pointerId: 1 }))
    el.dispatchEvent(new MouseEvent('mousedown', { ...o, buttons: 1 }))
    el.dispatchEvent(new MouseEvent('mouseup', { ...o, buttons: 1 }))
    el.dispatchEvent(new MouseEvent('click', { ...o, buttons: 1 }))
    el.dispatchEvent(new PointerEvent('pointerup', { ...o, pointerId: 1 }))
  }

  function wait (ms) { return new Promise(r => setTimeout(r, ms)) }

  /** Safe DOM toast — never uses innerHTML with untrusted content */
  function showToast (count, name, ok, duration) {
    const wrap = document.createElement('div')
    wrap.style.cssText = [
      'position:fixed', 'top:20px', 'right:20px',
      `background:${ok ? '#4CAF50' : '#FF9800'}`, 'color:white',
      'padding:14px 18px', 'border-radius:8px',
      'box-shadow:0 4px 12px rgba(0,0,0,.2)',
      'z-index:2147483647', 'font:14px/1.4 system-ui', 'max-width:300px',
      'transition:opacity .3s',
    ].join(';')

    const strong = document.createElement('strong')
    strong.textContent = `${ok ? '✅' : '⚠️'} Captured #${count}`
    const small = document.createElement('small')
    small.textContent = name.length > 55 ? name.substring(0, 55) + '…' : name

    wrap.appendChild(strong)
    wrap.appendChild(document.createElement('br'))
    wrap.appendChild(small)
    document.body.appendChild(wrap)
    setTimeout(() => { wrap.style.opacity = '0'; setTimeout(() => wrap.remove(), 300) }, duration)
  }

  function showPromptToast (text, duration) {
    const wrap = document.createElement('div')
    wrap.style.cssText = [
      'position:fixed', 'bottom:20px', 'right:20px',
      'background:#2196F3', 'color:white',
      'padding:14px 18px', 'border-radius:8px',
      'box-shadow:0 4px 12px rgba(0,0,0,.2)',
      'z-index:2147483647', 'font:14px/1.4 system-ui', 'max-width:300px',
      'transition:opacity .3s',
    ].join(';')

    const strong = document.createElement('strong')
    strong.textContent = '🤖 Prompt Submitted'
    const small = document.createElement('small')
    small.textContent = text.length > 60 ? text.substring(0, 60) + '…' : text

    wrap.appendChild(strong)
    wrap.appendChild(document.createElement('br'))
    wrap.appendChild(small)
    document.body.appendChild(wrap)
    setTimeout(() => { wrap.style.opacity = '0'; setTimeout(() => wrap.remove(), 300) }, duration)
  }
})()
