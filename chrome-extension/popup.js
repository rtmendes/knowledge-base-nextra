/**
 * Genspark KB Extractor — popup.js
 *
 * Renders the extension popup with:
 *  - Live stats from background service worker
 *  - Remote config version badge (refresh on click)
 *  - Server-pushed announcement banner
 *  - Prompt templates loaded from remote config
 *  - Auto-submit toggle + custom prompt textarea
 *  - CSV download, captured-chat preview, clear
 *
 * Security: zero innerHTML usage — all dynamic DOM built via createElement/textContent.
 */

document.addEventListener('DOMContentLoaded', () => {
  loadStats()
  loadConfig()
  loadPromptSettings()
  loadPauseState()
  setInterval(loadStats, 2500)

  document.getElementById('downloadBtn').addEventListener('click', downloadCSV)
  document.getElementById('viewBtn').addEventListener('click', togglePreview)
  document.getElementById('clearBtn').addEventListener('click', clearData)
  document.getElementById('configBadge').addEventListener('click', refreshConfig)
  document.getElementById('pauseBtn').addEventListener('click', togglePause)

  document.getElementById('autoSubmitToggle').addEventListener('change', savePromptSettings)
  let promptTimeout
  document.getElementById('promptText').addEventListener('input', () => {
    clearTimeout(promptTimeout)
    promptTimeout = setTimeout(savePromptSettings, 1000)
  })

  setupCollapsible('templatesHeader', 'templatesBody')
  setupCollapsible('autoSubmitHeader', 'autoSubmitBody')
})

// ── Pause / Resume ────────────────────────────────────────────

function loadPauseState () {
  chrome.runtime.sendMessage({ action: 'getPaused' }, (res) => {
    applyPauseState(res?.paused || false)
  })
}

function togglePause () {
  const btn = document.getElementById('pauseBtn')
  const isPaused = btn.classList.contains('btn-resume')  // if btn says Resume, currently paused
  chrome.runtime.sendMessage({ action: 'togglePaused', paused: !isPaused }, (res) => {
    applyPauseState(res?.paused || false)
    showStatus(res?.paused ? '⏸ Extension paused — no new captures' : '▶ Extension resumed', res?.paused ? 'info' : 'success')
  })
}

function applyPauseState (paused) {
  const bar = document.getElementById('pauseBar')
  const btn = document.getElementById('pauseBtn')
  const label = document.getElementById('pauseLabel')

  if (paused) {
    bar.className = 'pause-bar paused'
    btn.className = 'pause-btn btn-resume'
    btn.textContent = '▶ Resume'
    label.textContent = 'Paused — not capturing'
  } else {
    bar.className = 'pause-bar active'
    btn.className = 'pause-btn btn-pause'
    btn.textContent = '⏸ Pause'
    label.textContent = 'Active — capturing chats'
  }
}

// ── Stats ─────────────────────────────────────────────────────

function loadStats () {
  chrome.runtime.sendMessage({ action: 'getChats' }, (res) => {
    if (!res?.chats) return
    const chats = res.chats
    const total = chats.length

    document.getElementById('totalChats').textContent = total
    document.getElementById('kbStatus').textContent   = total > 0 ? total + ' sent' : 'none yet'

    if (total > 0) {
      const name = chats[chats.length - 1].chatName || ''
      document.getElementById('lastCaptured').textContent =
        name.length > 38 ? name.substring(0, 38) + '\u2026' : name || '\u2014'
    }

    document.getElementById('downloadBtn').disabled = total === 0
    document.getElementById('viewBtn').disabled     = total === 0
    document.getElementById('clearBtn').disabled   = total === 0
  })
}

// ── Remote config ─────────────────────────────────────────────

function loadConfig () {
  chrome.runtime.sendMessage({ action: 'getConfig' }, (res) => {
    applyConfig(res?.config, false)
  })
}

function refreshConfig () {
  const badge = document.getElementById('configBadge')
  badge.textContent = '\u21bb refreshing\u2026'
  badge.className = 'config-badge'

  chrome.runtime.sendMessage({ action: 'refreshConfig' }, (res) => {
    applyConfig(res?.config, true)
  })
}

function applyConfig (cfg, showToast) {
  const badge = document.getElementById('configBadge')

  if (!cfg) {
    badge.textContent = '\u26a0 offline'
    badge.className = 'config-badge stale'
    return
  }

  badge.textContent = 'v' + (cfg.configVersion || '?')
  badge.className = 'config-badge'
  badge.title = 'Config version ' + cfg.configVersion + ' \u2022 Click to refresh'

  // Announcement banner — textContent only
  const ann = cfg.announcement
  if (ann?.show && ann.message) {
    const el = document.getElementById('announcement')
    el.textContent = ann.message
    el.className = ann.type || 'info'
    el.style.display = 'block'
  }

  renderTemplates(cfg.promptTemplates || [])

  if (showToast) showStatus('\u2705 Config refreshed from server', 'success')
}

// ── Prompt templates ──────────────────────────────────────────

function renderTemplates (templates) {
  const container = document.getElementById('templatesList')
  clearChildren(container)

  if (!templates.length) {
    const hint = document.createElement('div')
    hint.className = 'hint'
    hint.style.padding = '4px 0'
    hint.textContent = 'No templates — check server config.'
    container.appendChild(hint)
    return
  }

  templates.forEach(tpl => {
    const btn = document.createElement('button')
    btn.className = 'template-btn'
    btn.textContent = tpl.label
    btn.title = tpl.text.substring(0, 120) + (tpl.text.length > 120 ? '\u2026' : '')

    btn.addEventListener('click', () => {
      document.getElementById('promptText').value = tpl.text
      savePromptSettings()
      document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      showStatus('\ud83d\udccb Template loaded: ' + tpl.label, 'info')
    })

    container.appendChild(btn)
  })
}

// ── CSV download ──────────────────────────────────────────────

function downloadCSV () {
  chrome.runtime.sendMessage({ action: 'getChats' }, (res) => {
    const chats = res?.chats
    if (!chats?.length) {
      showStatus('\u274c No chats captured yet!', 'error')
      return
    }

    const header = 'Index,Chat ID,Chat Name,Share Link,Type,Public Access,Captured At'
    const rows = chats.map(c =>
      [
        c.index,
        csvCell(c.chatId),
        csvCell(c.chatName),
        csvCell(c.shareLink || c.url),
        csvCell(c.type || 'agent'),
        c.publicAccessEnabled ? 'YES' : 'UNKNOWN',
        csvCell(c.capturedAt),
      ].join(',')
    )
    const csv = [header, ...rows].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'genspark_chats_' + chats.length + '_' + new Date().toISOString().slice(0, 10) + '.csv'
    a.click()
    URL.revokeObjectURL(url)

    showStatus('\u2705 Downloaded ' + chats.length + ' chats as CSV', 'success')
  })
}

function csvCell (value) {
  const s = String(value || '').replace(/"/g, '""')
  return '"' + s + '"'
}

// ── Preview ───────────────────────────────────────────────────

let previewOpen = false

function togglePreview () {
  const card = document.getElementById('previewCard')

  if (previewOpen) {
    card.style.display = 'none'
    previewOpen = false
    document.getElementById('viewBtn').textContent = '\ud83d\udc40 Preview'
    return
  }

  chrome.runtime.sendMessage({ action: 'getChats' }, (res) => {
    const chats  = res?.chats || []
    const recent = chats.slice(-20).reverse()
    const list   = document.getElementById('preview')
    clearChildren(list)

    recent.forEach(chat => {
      const item = document.createElement('div')
      item.className = 'preview-item'

      const label = document.createElement('strong')
      label.textContent = '#' + chat.index

      const nameNode = document.createTextNode(': ' + truncate(chat.chatName || '', 50))

      const br = document.createElement('br')

      const small = document.createElement('small')
      small.style.color = '#888'
      small.textContent = chat.shareLink || chat.url || ''

      item.appendChild(label)
      item.appendChild(nameNode)
      item.appendChild(br)
      item.appendChild(small)
      list.appendChild(item)
    })

    card.style.display = 'block'
    previewOpen = true
    document.getElementById('viewBtn').textContent = '\ud83d\ude48 Hide'
  })
}

// ── Clear ─────────────────────────────────────────────────────

function clearData () {
  if (!confirm('Clear all captured chats? This cannot be undone.')) return
  chrome.runtime.sendMessage({ action: 'clearChats' }, (res) => {
    if (res?.success) {
      showStatus('\u2705 All data cleared', 'success')
      loadStats()
      document.getElementById('previewCard').style.display = 'none'
      previewOpen = false
      document.getElementById('viewBtn').textContent = '\ud83d\udc40 Preview'
    }
  })
}

// ── Auto-submit settings ──────────────────────────────────────

function loadPromptSettings () {
  chrome.storage.local.get(['autoSubmitEnabled', 'promptText'], (stored) => {
    document.getElementById('autoSubmitToggle').checked = stored.autoSubmitEnabled || false
    document.getElementById('promptText').value         = stored.promptText || ''
  })
}

function savePromptSettings () {
  const enabled = document.getElementById('autoSubmitToggle').checked
  const text    = document.getElementById('promptText').value
  chrome.storage.local.set({ autoSubmitEnabled: enabled, promptText: text }, () => {
    if (enabled && text.trim()) showStatus('\u2705 Auto-submit enabled', 'success')
  })
}

// ── Utility helpers ───────────────────────────────────────────

/** Remove all child nodes from an element — the safe alternative to el.innerHTML = '' */
function clearChildren (el) {
  while (el.firstChild) el.removeChild(el.firstChild)
}

function truncate (str, max) {
  return str.length > max ? str.substring(0, max) + '\u2026' : str
}

function showStatus (msg, type) {
  const el = document.getElementById('status')
  el.textContent = msg
  el.className   = type
  el.style.display = 'block'
  clearTimeout(el._timer)
  el._timer = setTimeout(() => {
    el.style.display = 'none'
    el.className = ''
  }, 3000)
}

function setupCollapsible (headerId, bodyId) {
  const header = document.getElementById(headerId)
  const body   = document.getElementById(bodyId)
  if (!header || !body) return
  header.addEventListener('click', () => {
    const open = body.classList.toggle('open')
    header.classList.toggle('open', open)
  })
}
