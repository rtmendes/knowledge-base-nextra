import { NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabase'

// ── Types ─────────────────────────────────────────────────────────────────
interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface KBSearchResult {
  id: string
  title: string
  item_type: string
  content_plain: string
  category_name?: string
  tags: string[]
  word_count: number
}

// ── Helpers ───────────────────────────────────────────────────────────────

/** Extract meaningful search keywords from a user message */
function extractKeywords(message: string): string[] {
  const stopWords = new Set([
    'a','an','the','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','could','should','may','might','shall','can',
    'i','me','my','we','us','our','you','your','he','him','his','she','her','it',
    'its','they','them','their','what','which','who','whom','this','that','these',
    'those','am','in','on','at','to','for','of','with','by','from','as','into',
    'through','during','before','after','above','below','between','out','off',
    'over','under','again','further','then','once','here','there','when','where',
    'why','how','all','both','each','few','more','most','other','some','such',
    'no','nor','not','only','own','same','so','than','too','very','just','about',
    'tell','know','find','get','give','go','help','look','make','need','say',
    'show','think','want','work','use','try','come','let','put','take','talk',
    'question','answer','information','please','thanks','thank','anything','everything',
  ])

  return message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .slice(0, 8)
}

/** Search Supabase for relevant KB items */
async function searchKBItems(query: string, limit = 5): Promise<KBSearchResult[]> {
  if (!supabaseAdmin) return []

  const keywords = extractKeywords(query)
  if (keywords.length === 0) return []

  // Build OR condition: match any keyword in title or content_plain
  const conditions = keywords
    .flatMap(kw => [
      `title.ilike.%${kw}%`,
      `content_plain.ilike.%${kw}%`,
    ])
    .join(',')

  const { data, error } = await supabaseAdmin
    .from('knowledge_items')
    .select('id, title, item_type, content_plain, tags, word_count, category_id')
    .or(conditions)
    .gt('word_count', 10) // skip near-empty items
    .order('word_count', { ascending: false })
    .limit(limit * 3) // over-fetch for re-ranking

  if (error) {
    console.error('[kb-chat] Search error:', error)
    return []
  }

  if (!data || data.length === 0) return []

  // Re-rank by keyword hit density
  const ranked = data.map(item => {
    const titleLower = (item.title || '').toLowerCase()
    const contentLower = (item.content_plain || '').toLowerCase().slice(0, 5000)
    let score = 0
    for (const kw of keywords) {
      if (titleLower.includes(kw)) score += 3 // title match worth more
      if (contentLower.includes(kw)) score += 1
    }
    // Boost items with actual content
    if (item.word_count > 500) score += 1
    if (item.word_count > 2000) score += 1
    return { ...item, score }
  })

  ranked.sort((a, b) => b.score - a.score)

  return ranked.slice(0, limit).map(item => ({
    id: item.id,
    title: item.title,
    item_type: item.item_type,
    content_plain: (item.content_plain || '').slice(0, 3000), // cap per-item context
    tags: item.tags || [],
    word_count: item.word_count,
  }))
}

/** Build the system prompt with KB context */
function buildSystemPrompt(kbResults: KBSearchResult[]): string {
  let contextBlock = ''

  if (kbResults.length > 0) {
    contextBlock = '\n\n## Relevant Knowledge Base Items\n\n'
    for (const item of kbResults) {
      contextBlock += `### [${item.title}](/kb/item/${item.id})\n`
      contextBlock += `Type: ${item.item_type} | Tags: ${item.tags.join(', ') || 'none'}\n`
      contextBlock += `Content:\n${item.content_plain}\n\n---\n\n`
    }
  }

  return `You are the InsightProfit Knowledge Base AI Assistant. You help users find information, answer questions, and navigate the knowledge base.

## Your Behavior
- Answer questions using ONLY the knowledge base content provided below as context
- When you reference information from a specific KB item, cite it with a link: [Item Title](/kb/item/ITEM_ID)
- If the context doesn't contain enough information to fully answer, say so honestly and suggest what the user might search for
- Be concise but thorough. Use bullet points and structured formatting when helpful
- Always be professional and helpful
- If asked about topics completely outside the KB content, let the user know this isn't covered in the knowledge base
- Format your responses in clean markdown
${contextBlock}
## Instructions
- Base your answers on the KB items above
- Always cite your sources using the link format shown
- If multiple items are relevant, synthesize the information
- Keep answers focused and actionable`
}

// ── Route Handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages } = body as { messages: ChatMessage[] }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages array required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get the latest user message for search
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Search KB for relevant items
    const kbResults = await searchKBItems(lastUserMessage.content)

    // Build the full message array with system prompt
    const systemPrompt = buildSystemPrompt(kbResults)
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10), // keep last 10 messages for context window management
    ]

    // Call OpenRouter (OpenAI-compatible API)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://knowledge-base-nextra.vercel.app',
        'X-Title': 'InsightProfit KB Assistant',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: fullMessages,
        stream: true,
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[kb-chat] OpenRouter error:', response.status, errText)
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Stream the response back to the client
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Include sources metadata in the first chunk
    const sourcesPayload = kbResults.map(r => ({
      id: r.id,
      title: r.title,
      item_type: r.item_type,
    }))

    const stream = new ReadableStream({
      async start(controller) {
        // Send sources as first event
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: 'sources', sources: sourcesPayload })}\n\n`)
        )

        const reader = response.body!.getReader()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || '' // keep incomplete line in buffer

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data: ')) continue
              const data = trimmed.slice(6)
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`)
                  )
                }
              } catch {
                // skip unparseable chunks
              }
            }
          }
        } catch (err) {
          console.error('[kb-chat] Stream error:', err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('[kb-chat] Unhandled error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
