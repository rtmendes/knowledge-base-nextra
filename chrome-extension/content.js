/**
 * Genspark KB Extractor — content.js
 *
 * Runs on every genspark.ai page. Fetches live config from the background
 * service worker (which in turn fetches from kb.insightprofit.live).
 * All DOM selectors and feature flags are config-driven — update the
 * remote config to fix broken selectors or enable new features instantly.
 */
;(async function () {
  // ── 1. Get config from background worker ─────────────────────────────────
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
        chatTitle: ['h1'],
        chatInput: ['textarea[placeholder*="Ask" i]', 'textarea'],
        submitButton: ['button[type="submit"]'],
      },
      timing: { pageLoadWait: 2000, shareDialogWait: 1500, afterShareClick: 1500, afterToggleClick: 1000, afterPromptPaste: 500, notificationDuration: 2000 },
      features: { autoCapture: true, autoShare: true, autoSubmit: false, captureSparkPages: true, showNotifications: true },
    }
  }

  const { selectors, timing, features, urlPatterns } = cfg

  // ── 2. Determine page type ────────────────────────────────────────────────
  const url = window.location.href
  const isAgentPage = url.includes(urlPatterns.agent)
  const isSparkPage = url.includes(urlPatterns.spark) && features.captureSparkPages
  if (!isAgentPage && !isSparkPage) return

  const idMatch = url.match(/id=([a-f0-9-]+)/i)
  if (!idMatch) return

  const chatId = idMatch[1]
  const chatType = isSparkPage ? 'spark' : 'agent'

  // ── 3. Wait for page render ───────────────────────────────────────────────
  await wait(timing.pageLoadWait)
  const chatName = getChatTitle(selectors.chatTitle)

  // ── 4. Enable public sharing ──────────────────────────────────────────────
  let publicAccessEnabled = false
  if (features.autoShare) {
    try {
      publicAccessEnabled = await enablePublicSharing(selectors, timing)
    } catch (err) {
      console.warn('[KB Ext] Could not enable public sharing:', err.message)
    }
  }

  // ── 5. Capture ────────────────────────────────────────────────────────────
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
      const el = document.querySelector(sel)
      if (el?.textContent?.trim()) return el.textContent.trim()
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

  async function enablePublicSharing (sels, t) {
    await wait(t.shareDialogWait)
    let btn = findElement(sels.shareButton) || findByText(['share'], ['button', 'div[role="button"]'])
    if (!btn) throw new Error('Share button not found')
    click(btn)
    await wait(t.afterShareClick)
    const toggle = findElement(sels.publicToggle) || findByText(['anyone with', 'public'], ['button', 'div', 'input'])
    if (toggle) { click(toggle); await wait(t.afterToggleClick) }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }))
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
