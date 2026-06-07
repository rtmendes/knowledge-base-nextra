'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────

interface Source {
  id: string
  title: string
  item_type: string
  /** Typed destination URL per source type — KB → /kb/item/{id}, app → live subdomain,
   *  tool → login_page, task → ClickUp URL, etc. Falls back to '#' only if absent. */
  url?: string
  /** True for external destinations (open in new tab). */
  external?: boolean
}
interface ChatMessage { role: 'user' | 'assistant'; content: string; sources?: Source[] }
interface PageContext { title: string; url: string; itemId?: string }

// ── Inline markdown renderer ──────────────────────────────────────────────

function processInline(text: string): (string | JSX.Element)[] {
  // Use matchAll to avoid exec() calls
  const segments: Array<{ index: number; end: number; node: JSX.Element | string }> = []
  let key = 0

  for (const m of text.matchAll(/\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g)) {
    if (m[1] && m[2]) {
      segments.push({ index: m.index!, end: m.index! + m[0].length,
        node: <a key={`l${key++}`} href={m[2]}
          className="text-amber-600 dark:text-amber-400 underline hover:text-amber-700"
          target={m[2].startsWith('http') ? '_blank' : undefined}
          rel={m[2].startsWith('http') ? 'noopener noreferrer' : undefined}
        >{m[1]}</a> })
    } else if (m[3]) {
      segments.push({ index: m.index!, end: m.index! + m[0].length, node: <strong key={`b${key++}`}>{m[3]}</strong> })
    } else if (m[4]) {
      segments.push({ index: m.index!, end: m.index! + m[0].length, node: <em key={`i${key++}`}>{m[4]}</em> })
    } else if (m[5]) {
      segments.push({ index: m.index!, end: m.index! + m[0].length,
        node: <code key={`c${key++}`} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">{m[5]}</code> })
    }
  }

  if (segments.length === 0) return [text]
  const result: (string | JSX.Element)[] = []
  let cursor = 0
  for (const seg of segments) {
    if (seg.index > cursor) result.push(text.slice(cursor, seg.index))
    result.push(seg.node)
    cursor = seg.end
  }
  if (cursor < text.length) result.push(text.slice(cursor))
  return result
}

function renderMessageContent(content: string) {
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let inCode = false; let codeLines: string[] = []; let ck = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('```')) {
      if (inCode) { elements.push(<pre key={`code${ck++}`} className="kb-chat-code-block"><code>{codeLines.join('\n')}</code></pre>); codeLines = []; inCode = false }
      else { inCode = true }; continue
    }
    if (inCode) { codeLines.push(line); continue }
    if (line.trim() === '') { elements.push(<br key={`br${i}`} />); continue }
    if (line.startsWith('### ')) { elements.push(<strong key={`h3${i}`} className="block mt-2 mb-1">{processInline(line.slice(4))}</strong>); continue }
    if (line.startsWith('## '))  { elements.push(<strong key={`h2${i}`} className="block mt-2 mb-1 text-base">{processInline(line.slice(3))}</strong>); continue }
    if (line.match(/^[-*•]\s/)) {
      elements.push(<div key={`li${i}`} className="flex gap-1.5 ml-1"><span className="text-purple-400 shrink-0">•</span><span>{processInline(line.replace(/^[-*•]\s/, ''))}</span></div>); continue
    }
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)![1]
      elements.push(<div key={`ol${i}`} className="flex gap-1.5 ml-1"><span className="text-purple-400 shrink-0 font-medium">{num}.</span><span>{processInline(line.replace(/^\d+\.\s/, ''))}</span></div>); continue
    }
    elements.push(<p key={`p${i}`} className="mb-0.5">{processInline(line)}</p>)
  }
  return <>{elements}</>
}

// ── Chief of Staff ────────────────────────────────────────────────────────

// Generate a UUID v4 (no external dep — crypto.randomUUID exists in modern browsers)
function newSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  // RFC4122-ish fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const SESSION_STORAGE_KEY = 'kb-cos-session-id'

export function KBChatAssistant() {
  const [open, setOpen]                         = useState(false)
  const [messages, setMessages]                 = useState<ChatMessage[]>([])
  const [input, setInput]                       = useState('')
  const [loading, setLoading]                   = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingSources, setStreamingSources] = useState<Source[]>([])
  const [pageContext, setPageContext]            = useState<PageContext | null>(null)
  const [sessionId, setSessionId]                = useState<string>('')
  // Per-message action state (saved/sent indicator after click)
  const [msgActionState, setMsgActionState]      = useState<Record<number, string>>({})

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  // Hydrate sessionId from localStorage (or mint a new one)
  useEffect(() => {
    if (typeof window === 'undefined') return
    let id = ''
    try { id = window.localStorage.getItem(SESSION_STORAGE_KEY) || '' } catch { /* private mode */ }
    if (!id) {
      id = newSessionId()
      try { window.localStorage.setItem(SESSION_STORAGE_KEY, id) } catch { /* ignore */ }
    }
    setSessionId(id)
  }, [])

  // Read current page from browser
  useEffect(() => {
    const read = () => {
      const raw = document.title.replace(/\s*[—–-]\s*InsightProfit Knowledge Base\s*$/i, '').trim()
      const url = window.location.href
      const idMatch = window.location.pathname.match(/\/kb\/item\/([a-f0-9-]{8,})/)
      setPageContext({ title: raw || 'Knowledge Base', url, itemId: idMatch?.[1] })
    }
    read()
    window.addEventListener('popstate', read)
    return () => window.removeEventListener('popstate', read)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, streamingContent, loading])
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 150) }, [open])

  // ── Send message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || loading) return
    if (!overrideText) setInput('')

    const userMsg: ChatMessage = { role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setLoading(true)
    setStreamingContent('')
    setStreamingSources([])

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch('/api/kb/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(m => ({ role: m.role, content: m.content })),
          pageContext,
          sessionId: sessionId || undefined,
        }),
        signal: ctrl.signal,
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({ error: 'error' }))).error || `HTTP ${res.status}`)

      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let accumulated = ''; let sources: Source[] = []; let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split('\n'); buf = lines.pop() || ''
        for (const line of lines) {
          const t = line.trim()
          if (!t.startsWith('data: ')) continue
          const data = t.slice(6)
          if (data === '[DONE]') continue
          try {
            const p = JSON.parse(data)
            if (p.type === 'sources') { sources = p.sources || []; setStreamingSources(sources) }
            else if (p.type === 'session' && p.sessionId) {
              // Server confirms (or replaces) our sessionId; persist whatever it returns
              if (p.sessionId !== sessionId) {
                setSessionId(p.sessionId)
                try { window.localStorage.setItem(SESSION_STORAGE_KEY, p.sessionId) } catch {}
              }
            }
            else if (p.type === 'content' && p.content) { accumulated += p.content; setStreamingContent(accumulated) }
          } catch { /* skip */ }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: accumulated || 'No response received.', sources }])
      setStreamingContent(''); setStreamingSources([])
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}. Please try again.` }])
    } finally { setLoading(false); abortRef.current = null }
  }, [input, loading, messages, pageContext, sessionId])

  // ── New chat: rotate sessionId so the next message starts fresh ────────
  const newChat = useCallback(() => {
    const id = newSessionId()
    setSessionId(id)
    try { window.localStorage.setItem(SESSION_STORAGE_KEY, id) } catch {}
    setMessages([]); setStreamingContent(''); setStreamingSources([]); setMsgActionState({})
    if (abortRef.current) abortRef.current.abort(); setLoading(false)
  }, [])

  // ── Save current conversation as a KB note ─────────────────────────────
  const saveAsNote = useCallback(async (msgIdx: number) => {
    if (!sessionId) return
    setMsgActionState(s => ({ ...s, [msgIdx]: 'saving…' }))
    try {
      const res = await fetch('/api/kb/chat/save-as-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setMsgActionState(s => ({ ...s, [msgIdx]: `saved → /kb/item/${data.kbItemId}` }))
    } catch (err: any) {
      setMsgActionState(s => ({ ...s, [msgIdx]: `save failed: ${err.message}` }))
    }
  }, [sessionId])

  // ── Turn a specific assistant message into a ClickUp task ──────────────
  const makeTask = useCallback(async (msgIdx: number, content: string) => {
    setMsgActionState(s => ({ ...s, [msgIdx]: 'creating task…' }))
    try {
      const res = await fetch('/api/kb/chat/create-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, messageContent: content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      const routeLabel: Record<string, string> = {
        blocked: '⏸️ Blocked', dispatch: '🔴 Needs Action',
        prd: '📋 PRD Needed', digest: '📋 Digest Items',
        override: '↳ overridden', forced: '↳ forced',
      }
      const tag = routeLabel[data.routedAs] || data.routedAs || ''
      setMsgActionState(s => ({ ...s, [msgIdx]: `task|${data.taskUrl}|${tag}` }))
    } catch (err: any) {
      setMsgActionState(s => ({ ...s, [msgIdx]: `task failed: ${err.message}` }))
    }
  }, [sessionId])

  // ── Quick tool handlers ───────────────────────────────────────────────
  const handleTool = useCallback((tool: string) => {
    switch (tool) {
      case 'create':
        setInput('Create a new KB page about: ')
        setTimeout(() => inputRef.current?.focus(), 50); break
      case 'search':
        setInput('Search KB for: ')
        setTimeout(() => inputRef.current?.focus(), 50); break
      case 'edit':
        if (pageContext?.itemId) {
          sendMessage(`I'm viewing "${pageContext.title}" (KB item ${pageContext.itemId}). Analyze this page and suggest specific improvements: missing sections, clearer formatting, related topics to add.`)
        } else { setInput('Help me improve KB page: '); setTimeout(() => inputRef.current?.focus(), 50) }
        break
      case 'summarize':
        sendMessage(pageContext?.itemId
          ? `Summarize the KB page "${pageContext.title}" and suggest 3–5 related KB items that should be linked to it.`
          : 'Summarize the top knowledge base content and suggest key items to link together.')
        break
    }
  }, [pageContext, sendMessage])

  const clearChat = () => {
    setMessages([]); setStreamingContent(''); setStreamingSources([])
    if (abortRef.current) abortRef.current.abort(); setLoading(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Persistent right-edge vertical tab */}
      <button onClick={() => setOpen(o => !o)} className="kb-chief-tab"
        aria-label="Chief of Staff" title="Chief of Staff · KB Orchestrator">
        <span style={{ fontSize: '1.1rem' }}>🤖</span>
        <span className="kb-chief-tab-label">Chief of Staff</span>
        {messages.length > 0 && (
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399',
            boxShadow: '0 0 6px rgba(52,211,153,0.8)', flexShrink: 0 }} />
        )}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div className="fixed inset-0 z-[99996] lg:hidden"
          style={{ background: 'rgba(0,0,0,0.35)' }}
          onClick={() => setOpen(false)} />
      )}

      {/* Side panel */}
      <div className={`kb-chief-panel${open ? ' open' : ''}`}>

        {/* Header */}
        <div className="kb-chief-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kb-chief-avatar">🤖</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1.2 }}>Chief of Staff</div>
              <div style={{ fontSize: 10, color: 'rgba(216,180,254,0.8)', lineHeight: 1.3 }}>Enterprise Orchestrator · InsightProfit</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <a href="/chief-of-staff/history" className="kb-chief-header-btn" title="View chat history"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </a>
            <button onClick={newChat} className="kb-chief-header-btn" title="Start a new chat (saves current)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button onClick={clearChat} className="kb-chief-header-btn" title="Clear messages (keeps session)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
            <button onClick={() => setOpen(false)} className="kb-chief-header-btn" title="Close">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Page context */}
        {pageContext && (
          <div className="kb-chief-context">
            <span style={{ fontSize: 11 }}>📄</span>
            <span className="kb-chief-context-title">{pageContext.title}</span>
            {pageContext.itemId && (
              <a href={`/kb/item/${pageContext.itemId}`} className="kb-chief-context-link">View →</a>
            )}
          </div>
        )}

        {/* Quick tools */}
        <div className="kb-chief-tools">
          <div className="kb-chief-tools-label">Quick Tools</div>
          <div className="kb-chief-tools-grid">
            {([
              { id: 'create', icon: '🆕', label: 'Create Page' },
              { id: 'search', icon: '🔍', label: 'Search KB' },
              { id: 'edit',   icon: '✏️',  label: 'Edit This Page' },
              { id: 'summarize', icon: '📊', label: 'Summarize & Link' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => handleTool(t.id)} className="kb-chief-tool-btn">
                <span>{t.icon}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
          <div className="kb-chief-apps">
            {[
              { label: '🏢 Command',  url: 'https://command.insightprofit.live' },
              { label: '📋 ClickUp',  url: 'https://app.clickup.com' },
              { label: '🔬 Research', url: 'https://research.insightprofit.live' },
              { label: '📧 Email',    url: 'https://email.insightprofit.live' },
            ].map(l => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="kb-chief-app-link">
                {l.label}
              </a>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="kb-chat-messages" style={{ flex: 1, overflowY: 'auto' }}>
          {messages.length === 0 && !loading && (
            <div className="kb-chat-welcome">
              <div style={{ fontSize: '2rem' }}>🤖</div>
              <p style={{ fontWeight: 600, fontSize: 13 }}>Chief of Staff Ready</p>
              <p style={{ fontSize: 11, color: '#6b7280', maxWidth: 240, textAlign: 'center' }}>
                {"I have full visibility into the InsightProfit enterprise — KB, apps, agents, tools, offers, tasks, credentials. Ask me anything."}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, justifyContent: 'center' }}>
                {['Where are the design docs for Family Gift Studio?', 'List active AI agents', 'What offers are in the pipeline?'].map(q => (
                  <button key={q} onClick={() => sendMessage(q)} className="kb-chat-suggestion">{q}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`kb-chat-msg ${msg.role === 'user' ? 'kb-chat-msg-user' : 'kb-chat-msg-assistant'}`}>
              {msg.role === 'assistant' && <div className="kb-chief-bot-icon">🤖</div>}
              <div className={`kb-chat-bubble ${msg.role === 'user' ? 'kb-chat-bubble-user' : 'kb-chat-bubble-assistant'}`}>
                {msg.role === 'user'
                  ? <p>{msg.content}</p>
                  : <div className="kb-chat-content">{renderMessageContent(msg.content)}</div>}
              </div>
              {msg.role === 'assistant' && (
                <div className="kb-chat-actions">
                  <button
                    onClick={() => saveAsNote(i)}
                    className="kb-chat-action-btn"
                    title="Save this entire conversation as a KB note"
                    disabled={msgActionState[i] === 'saving…'}>
                    💾 Save as KB note
                  </button>
                  <button
                    onClick={() => makeTask(i, msg.content)}
                    className="kb-chat-action-btn"
                    title="Create a ClickUp task from this reply (auto-routed)"
                    disabled={msgActionState[i] === 'creating task…'}>
                    ✅ Make this a task
                  </button>
                  {msgActionState[i] && (
                    <span className="kb-chat-action-status">
                      {msgActionState[i].startsWith('saved → ') ? (
                        <a href={msgActionState[i].replace('saved → ', '')}
                           className="text-amber-600 dark:text-amber-400 underline">
                          ✓ Saved as KB note
                        </a>
                      ) : msgActionState[i].startsWith('task|') ? (() => {
                        const [, url, tag] = msgActionState[i].split('|')
                        return (
                          <>
                            <a href={url} target="_blank" rel="noopener noreferrer"
                               className="text-amber-600 dark:text-amber-400 underline">
                              ✓ Task created — open in ClickUp
                            </a>
                            {tag && <span style={{ marginLeft: 6, color: '#6b7280' }}>· {tag}</span>}
                          </>
                        )
                      })() : msgActionState[i]}
                    </span>
                  )}
                </div>
              )}
              {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="kb-chat-sources">
                  <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af' }}>Sources</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                    {msg.sources.map((s, si) => {
                      // Prefer the typed url from the API; fall back to legacy KB-item route
                      // only when the source clearly IS a KB item (raw UUID-ish id, no prefix).
                      const href = s.url
                        || (s.item_type === 'kb_item' || !s.id.includes(':')
                          ? `/kb/item/${s.id}`
                          : '#')
                      const isExternal = s.external ?? href.startsWith('http')
                      const typeLabel: Record<string, string> = {
                        app: '🌐', tool: '🔧', agent: '🤖', offer: '💰',
                        task: '✅', credential: '🔑',
                      }
                      const icon = typeLabel[s.item_type] || '📄'
                      return (
                        <a
                          key={si}
                          href={href}
                          target={isExternal ? '_blank' : undefined}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="kb-chat-source-tag"
                          title={`${s.item_type}: ${s.title}${isExternal ? ' (opens in new tab)' : ''}`}
                        >
                          <span style={{ marginRight: 4 }}>{icon}</span>
                          {s.title.length > 35 ? s.title.slice(0, 35) + '…' : s.title}
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="kb-chat-msg kb-chat-msg-assistant">
              <div className="kb-chief-bot-icon">🤖</div>
              <div className="kb-chat-bubble kb-chat-bubble-assistant">
                {streamingContent
                  ? <div className="kb-chat-content">{renderMessageContent(streamingContent)}<span className="kb-chat-cursor" /></div>
                  : <div className="kb-chat-thinking"><div className="kb-chat-dot" /><div className="kb-chat-dot" style={{ animationDelay: '0.15s' }} /><div className="kb-chat-dot" style={{ animationDelay: '0.3s' }} /></div>}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); sendMessage() }} className="kb-chat-input-area">
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            className="kb-chat-input" placeholder="Ask Chief of Staff anything…"
            disabled={loading} autoComplete="off" />
          <button type="submit" disabled={loading || !input.trim()} className="kb-chat-send-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}
