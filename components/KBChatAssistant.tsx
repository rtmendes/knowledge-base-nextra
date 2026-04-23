'use client'

import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────

interface Source {
  id: string
  title: string
  item_type: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

// ── Markdown-lite renderer ────────────────────────────────────────────────

function renderMessageContent(content: string) {
  // Convert markdown links [text](/path) to clickable links
  // Convert **bold** and *italic*
  // Convert bullet lists
  // Convert code blocks
  const lines = content.split('\n')
  const elements: JSX.Element[] = []
  let inCodeBlock = false
  let codeLines: string[] = []
  let codeKey = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${codeKey++}`} className="kb-chat-code-block">
            <code>{codeLines.join('\n')}</code>
          </pre>
        )
        codeLines = []
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (line.trim() === '') {
      elements.push(<br key={`br-${i}`} />)
      continue
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(<strong key={`h3-${i}`} className="block mt-2 mb-1">{processInline(line.slice(4))}</strong>)
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(<strong key={`h2-${i}`} className="block mt-2 mb-1 text-base">{processInline(line.slice(3))}</strong>)
      continue
    }

    // Bullet points
    if (line.match(/^[-*•]\s/)) {
      elements.push(
        <div key={`li-${i}`} className="flex gap-1.5 ml-1">
          <span className="text-amber-500 shrink-0">•</span>
          <span>{processInline(line.replace(/^[-*•]\s/, ''))}</span>
        </div>
      )
      continue
    }

    // Numbered lists
    if (line.match(/^\d+\.\s/)) {
      const num = line.match(/^(\d+)\.\s/)![1]
      elements.push(
        <div key={`ol-${i}`} className="flex gap-1.5 ml-1">
          <span className="text-amber-500 shrink-0 font-medium">{num}.</span>
          <span>{processInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
      continue
    }

    elements.push(<p key={`p-${i}`} className="mb-0.5">{processInline(line)}</p>)
  }

  return <>{elements}</>
}

function processInline(text: string): (string | JSX.Element)[] {
  const result: (string | JSX.Element)[] = []
  // Process markdown links, bold, italic, and inline code
  const regex = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index))
    }

    if (match[1] && match[2]) {
      // Link
      result.push(
        <a
          key={`link-${key++}`}
          href={match[2]}
          className="text-amber-600 dark:text-amber-400 underline hover:text-amber-700 dark:hover:text-amber-300"
          target={match[2].startsWith('http') ? '_blank' : undefined}
          rel={match[2].startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {match[1]}
        </a>
      )
    } else if (match[3]) {
      // Bold
      result.push(<strong key={`b-${key++}`}>{match[3]}</strong>)
    } else if (match[4]) {
      // Italic
      result.push(<em key={`i-${key++}`}>{match[4]}</em>)
    } else if (match[5]) {
      // Inline code
      result.push(
        <code key={`c-${key++}`} className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-xs">
          {match[5]}
        </code>
      )
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return result.length > 0 ? result : [text]
}

// ── Chat Component ────────────────────────────────────────────────────────

export function KBChatAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingSources, setStreamingSources] = useState<Source[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent, loading])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    const userMessage: ChatMessage = { role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setLoading(true)
    setStreamingContent('')
    setStreamingSources([])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/kb/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let sources: Source[] = []
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'sources') {
              sources = parsed.sources || []
              setStreamingSources(sources)
            } else if (parsed.type === 'content' && parsed.content) {
              accumulated += parsed.content
              setStreamingContent(accumulated)
            }
          } catch {
            // skip
          }
        }
      }

      // Finalize the assistant message
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: accumulated || 'No response received.', sources },
      ])
      setStreamingContent('')
      setStreamingSources([])
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, I encountered an error: ${err.message}. Please try again.` },
      ])
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [input, loading, messages])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const sendSuggestion = useCallback(async (text: string) => {
    if (loading) return
    setInput('')
    const userMessage: ChatMessage = { role: 'user', content: text }
    const updatedMessages = [userMessage]
    setMessages(updatedMessages)
    setLoading(true)
    setStreamingContent('')
    setStreamingSources([])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/kb/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''
      let sources: Source[] = []
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue
          const data = trimmed.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'sources') {
              sources = parsed.sources || []
              setStreamingSources(sources)
            } else if (parsed.type === 'content' && parsed.content) {
              accumulated += parsed.content
              setStreamingContent(accumulated)
            }
          } catch { /* skip */ }
        }
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: accumulated || 'No response received.', sources },
      ])
      setStreamingContent('')
      setStreamingSources([])
    } catch (err: any) {
      if (err.name === 'AbortError') return
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Sorry, I encountered an error: ${err.message}. Please try again.` },
      ])
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }, [loading])

  const clearChat = () => {
    setMessages([])
    setStreamingContent('')
    setStreamingSources([])
    if (abortRef.current) abortRef.current.abort()
    setLoading(false)
  }

  // ── Floating button (closed state) ──────────────────────────────────────

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="kb-chat-fab"
        aria-label="Open KB Assistant"
        title="Ask the Knowledge Base"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <circle cx="9" cy="10" r="0.5" fill="currentColor" />
          <circle cx="12" cy="10" r="0.5" fill="currentColor" />
          <circle cx="15" cy="10" r="0.5" fill="currentColor" />
        </svg>
      </button>
    )
  }

  // ── Chat panel (open state) ─────────────────────────────────────────────

  return (
    <div className="kb-chat-panel">
      {/* Header */}
      <div className="kb-chat-header">
        <div className="flex items-center gap-2.5">
          <div className="kb-chat-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z" />
            </svg>
          </div>
          <div>
            <div className="font-semibold text-sm text-white leading-tight">KB Assistant</div>
            <div className="text-[11px] text-amber-100/70 leading-tight">Ask anything about the knowledge base</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clearChat}
            className="kb-chat-header-btn"
            title="Clear conversation"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
          </button>
          <button
            onClick={() => setOpen(false)}
            className="kb-chat-header-btn"
            title="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="kb-chat-messages">
        {messages.length === 0 && !loading && (
          <div className="kb-chat-welcome">
            <div className="kb-chat-welcome-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">How can I help?</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[220px]">
              Ask me about SOPs, product docs, research notes, or anything in the knowledge base.
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
              {['What SOPs do we have?', 'Product launch plans', 'Marketing strategies'].map(q => (
                <button
                  key={q}
                  onClick={() => sendSuggestion(q)}
                  className="kb-chat-suggestion"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`kb-chat-msg ${msg.role === 'user' ? 'kb-chat-msg-user' : 'kb-chat-msg-assistant'}`}>
            {msg.role === 'assistant' && (
              <div className="kb-chat-bot-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                  <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z" />
                </svg>
              </div>
            )}
            <div className={`kb-chat-bubble ${msg.role === 'user' ? 'kb-chat-bubble-user' : 'kb-chat-bubble-assistant'}`}>
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="kb-chat-content">
                  {renderMessageContent(msg.content)}
                </div>
              )}
            </div>
            {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
              <div className="kb-chat-sources">
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sources</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {msg.sources.map((s, si) => (
                    <a
                      key={si}
                      href={`/kb/item/${s.id}`}
                      className="kb-chat-source-tag"
                      title={s.title}
                    >
                      {s.title.length > 35 ? s.title.slice(0, 35) + '…' : s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {loading && (
          <div className="kb-chat-msg kb-chat-msg-assistant">
            <div className="kb-chat-bot-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z" />
              </svg>
            </div>
            <div className="kb-chat-bubble kb-chat-bubble-assistant">
              {streamingContent ? (
                <div className="kb-chat-content">
                  {renderMessageContent(streamingContent)}
                  <span className="kb-chat-cursor" />
                </div>
              ) : (
                <div className="kb-chat-thinking">
                  <div className="kb-chat-dot" />
                  <div className="kb-chat-dot" style={{ animationDelay: '0.15s' }} />
                  <div className="kb-chat-dot" style={{ animationDelay: '0.3s' }} />
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="kb-chat-input-area">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="kb-chat-input"
          placeholder="Ask about the knowledge base…"
          disabled={loading}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="kb-chat-send-btn"
          title="Send"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
    </div>
  )
}
