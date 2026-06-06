'use client';
import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === 'string' && error.trim()) return error;
  }
  return fallback;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: Message[] = [...messages, { role: 'user', content: text }];
    setInput('');
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/kb/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        let payload: unknown = null;
        try {
          payload = await res.json();
        } catch {
          payload = null;
        }
        throw new Error(extractErrorMessage(payload, `Knowledge Base chat failed with HTTP ${res.status}`));
      }

      if (!res.body) throw new Error('Knowledge Base chat returned an empty response stream.');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let botReply = '';
      let sourceTitles: string[] = [];
      let buffer = '';

      function handleEvent(raw: string) {
        const trimmed = raw.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) return;
        const payload = trimmed.slice(6);
        if (payload === '[DONE]') return;
        try {
          const data = JSON.parse(payload);
          if (data.type === 'content' && typeof data.content === 'string') {
            botReply += data.content;
          }
          if (data.type === 'sources' && Array.isArray(data.sources)) {
            sourceTitles = data.sources
              .map((source: { title?: unknown }) => (typeof source.title === 'string' ? source.title : ''))
              .filter(Boolean)
              .slice(0, 3);
          }
        } catch {
          // Ignore malformed SSE chunks without failing the user's chat session.
        }
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';
        events.forEach(handleEvent);
      }
      if (buffer) handleEvent(buffer);

      const sources = sourceTitles.length > 0 ? `\n\nSources: ${sourceTitles.join(', ')}` : '';
      setMessages(m => [...m, { role: 'assistant', content: `${botReply.trim() || 'I could not find enough configured knowledge-base context to answer that yet.'}${sources}` }]);
    } catch (err: any) {
      setMessages(m => [...m, { role: 'assistant', content: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-50 transition-colors"
        aria-label="Open AI Chat"
      >
        🤖
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
      <div className="px-4 py-3 bg-amber-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <div className="text-white font-semibold text-sm">Ask PopeBot</div>
            <div className="text-amber-100 text-xs">InsightProfit AI</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-white hover:text-amber-200 text-xl leading-none">×</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[400px]">
        {messages.length === 0 && (
          <div className="text-gray-400 dark:text-gray-500 text-sm text-center mt-8">
            Ask me anything about your projects, tasks, or research.
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-amber-500 text-white rounded-br-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl rounded-bl-sm text-sm text-gray-500">
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          className="flex-1 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-gray-400"
          placeholder="Ask about your projects…"
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
