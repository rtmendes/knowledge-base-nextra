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
  tags: string[]
  word_count: number
}

interface AppResult       { subdomain: string; name: string; hosting?: string; description?: string }
interface AgentResult     { name: string; status?: string; platform?: string; metadata?: string }
interface ToolResult      { tool_name: string; function_description?: string; login_page?: string }
interface OfferResult     { name?: string; description?: string; price_point?: string; offer_type?: string }
interface TaskResult      { id?: string; name?: string; text_content?: string; status?: string; url?: string }
interface CredentialResult{ service: string; deployed_locations?: string[] }

interface FederatedContext {
  kbItems:      KBSearchResult[]
  apps:         AppResult[]
  agents:       AgentResult[]
  tools:        ToolResult[]
  offers:       OfferResult[]
  tasks:        TaskResult[]
  credentials:  CredentialResult[]
}

// ── Helpers ───────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
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

function extractKeywords(message: string): string[] {
  return message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
    .slice(0, 8)
}

/** Sanitize keyword for PostgREST ILIKE expressions (escape % and commas) */
function safeKw(kw: string): string {
  return kw.replace(/[%,()]/g, ' ').trim()
}

/** Build PostgREST `.or()` condition string for given columns + keywords */
function buildOr(columns: string[], keywords: string[]): string {
  return keywords
    .flatMap(kw => columns.map(col => `${col}.ilike.%${safeKw(kw)}%`))
    .join(',')
}

// ── Individual Table Searches ─────────────────────────────────────────────

async function searchKBItems(keywords: string[], limit = 5): Promise<KBSearchResult[]> {
  if (!supabaseAdmin || keywords.length === 0) return []

  const conditions = buildOr(['title', 'content_plain'], keywords)
  const { data, error } = await supabaseAdmin
    .from('knowledge_items')
    .select('id, title, item_type, content_plain, tags, word_count')
    .or(conditions)
    .gt('word_count', 10)
    .order('word_count', { ascending: false })
    .limit(limit * 3)

  if (error || !data) { if (error) console.error('[kb-chat] kb search:', error.message); return [] }

  // Re-rank by keyword density
  const ranked = data.map(item => {
    const t = (item.title || '').toLowerCase()
    const c = (item.content_plain || '').toLowerCase()
    let score = 0
    for (const kw of keywords) {
      const re = new RegExp(kw, 'g')
      score += (t.match(re) || []).length * 3
      score += Math.min((c.match(re) || []).length, 20)
    }
    if (item.word_count > 500) score += 1
    if (item.word_count > 2000) score += 1
    return { ...item, score }
  })
  ranked.sort((a, b) => b.score - a.score)

  return ranked.slice(0, limit).map(item => ({
    id: item.id,
    title: item.title,
    item_type: item.item_type,
    content_plain: (item.content_plain || '').slice(0, 4000),
    tags: item.tags || [],
    word_count: item.word_count,
  }))
}

async function searchAppCatalog(keywords: string[]): Promise<AppResult[]> {
  if (!supabaseAdmin || keywords.length === 0) return []
  try {
    const { data, error } = await supabaseAdmin
      .from('app_catalog')
      .select('*')
      .or(buildOr(['name', 'subdomain'], keywords))
      .limit(6)
    if (error || !data) return []
    return data.map((r: any) => ({
      subdomain: r.subdomain,
      name: r.name,
      hosting: r.hosting,
      description: r.description || r.purpose || r.notes,
    }))
  } catch { return [] }
}

async function searchAiAgents(keywords: string[]): Promise<AgentResult[]> {
  if (!supabaseAdmin || keywords.length === 0) return []
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_agents')
      .select('name, status, platform, metadata')
      .or(buildOr(['name', 'metadata', 'platform'], keywords))
      .limit(6)
    if (error || !data) return []
    return data.map((r: any) => ({
      name: r.name,
      status: r.status,
      platform: r.platform,
      metadata: typeof r.metadata === 'string' ? r.metadata.slice(0, 400) : JSON.stringify(r.metadata || {}).slice(0, 400),
    }))
  } catch { return [] }
}

async function searchTechTools(keywords: string[]): Promise<ToolResult[]> {
  if (!supabaseAdmin || keywords.length === 0) return []
  try {
    const { data, error } = await supabaseAdmin
      .from('tech_tools')
      .select('tool_name, function_description, login_page')
      .or(buildOr(['tool_name', 'function_description'], keywords))
      .limit(6)
    if (error || !data) return []
    return data as ToolResult[]
  } catch { return [] }
}

async function searchOfferPipeline(keywords: string[]): Promise<OfferResult[]> {
  if (!supabaseAdmin || keywords.length === 0) return []
  try {
    // Try common columns; PostgREST will error if any column is missing in the OR.
    // Wrap two attempts: with description, then without.
    const tryQueries = [
      ['name', 'description', 'offer_type'],
      ['name'],
    ]
    for (const cols of tryQueries) {
      const { data, error } = await supabaseAdmin
        .from('offer_pipeline')
        .select('*')
        .or(buildOr(cols, keywords))
        .limit(6)
      if (!error && data) {
        return data.map((r: any) => ({
          name: r.name,
          description: r.description || r.notes,
          price_point: r.price_point,
          offer_type: r.offer_type,
        }))
      }
    }
    return []
  } catch { return [] }
}

async function searchClickupTasks(keywords: string[]): Promise<TaskResult[]> {
  if (!supabaseAdmin || keywords.length === 0) return []
  try {
    const tryQueries = [
      ['name', 'text_content'],
      ['name'],
    ]
    for (const cols of tryQueries) {
      const { data, error } = await supabaseAdmin
        .from('clickup_tasks')
        .select('*')
        .or(buildOr(cols, keywords))
        .limit(6)
      if (!error && data) {
        return data.map((r: any) => ({
          id: r.id || r.task_id,
          name: r.name,
          text_content: (r.text_content || r.description || '').slice(0, 400),
          status: r.status,
          url: r.url,
        }))
      }
    }
    return []
  } catch { return [] }
}

async function searchCredentials(keywords: string[]): Promise<CredentialResult[]> {
  if (!supabaseAdmin || keywords.length === 0) return []
  try {
    const { data, error } = await supabaseAdmin
      .from('credential_registry')
      .select('service, deployed_locations')
      .or(buildOr(['service'], keywords))
      .limit(6)
    if (error || !data) return []
    return data as CredentialResult[]
  } catch { return [] }
}

/** Federated search across the enterprise platform */
async function federatedSearch(query: string): Promise<FederatedContext> {
  const keywords = extractKeywords(query)
  if (keywords.length === 0) {
    return { kbItems: [], apps: [], agents: [], tools: [], offers: [], tasks: [], credentials: [] }
  }

  const [kbItems, apps, agents, tools, offers, tasks, credentials] = await Promise.all([
    searchKBItems(keywords),
    searchAppCatalog(keywords),
    searchAiAgents(keywords),
    searchTechTools(keywords),
    searchOfferPipeline(keywords),
    searchClickupTasks(keywords),
    searchCredentials(keywords),
  ])

  return { kbItems, apps, agents, tools, offers, tasks, credentials }
}

// ── Prompt Builder ────────────────────────────────────────────────────────

interface PageContext {
  title?: string
  url?: string
  itemId?: string
}

function buildSystemPrompt(ctx: FederatedContext, pageContext?: PageContext): string {
  const blocks: string[] = []

  if (ctx.kbItems.length > 0) {
    let b = '\n## Relevant Knowledge Base Items\n\n'
    for (const item of ctx.kbItems) {
      b += `### [${item.title}](/kb/item/${item.id})\n`
      b += `Type: ${item.item_type} | Tags: ${item.tags.join(', ') || 'none'}\n`
      b += `Content:\n${item.content_plain}\n\n---\n\n`
    }
    blocks.push(b)
  }

  if (ctx.apps.length > 0) {
    let b = '\n## Enterprise Apps (app_catalog)\n\n'
    for (const a of ctx.apps) {
      const url = a.subdomain ? `https://${a.subdomain}.insightprofit.live` : ''
      b += `- **${a.name}** — ${url}${a.hosting ? ` · hosted on ${a.hosting}` : ''}${a.description ? `\n  ${a.description}` : ''}\n`
    }
    blocks.push(b)
  }

  if (ctx.agents.length > 0) {
    let b = '\n## AI Agents (ai_agents)\n\n'
    for (const a of ctx.agents) {
      b += `- **${a.name}**${a.status ? ` (${a.status})` : ''}${a.platform ? ` · platform: ${a.platform}` : ''}\n`
      if (a.metadata) b += `  metadata: ${a.metadata}\n`
    }
    blocks.push(b)
  }

  if (ctx.tools.length > 0) {
    let b = '\n## Tech Stack Tools (tech_tools)\n\n'
    for (const t of ctx.tools) {
      b += `- **${t.tool_name}**${t.login_page ? ` — [login](${t.login_page})` : ''}\n`
      if (t.function_description) b += `  ${t.function_description}\n`
    }
    blocks.push(b)
  }

  if (ctx.offers.length > 0) {
    let b = '\n## Offers (offer_pipeline)\n\n'
    for (const o of ctx.offers) {
      b += `- **${o.name || 'Untitled offer'}**${o.price_point ? ` — ${o.price_point}` : ''}${o.offer_type ? ` · ${o.offer_type}` : ''}\n`
      if (o.description) b += `  ${o.description}\n`
    }
    blocks.push(b)
  }

  if (ctx.tasks.length > 0) {
    let b = '\n## ClickUp Tasks (clickup_tasks)\n\n'
    for (const t of ctx.tasks) {
      b += `- **${t.name || 'Untitled'}**${t.status ? ` [${t.status}]` : ''}${t.url ? ` — [open](${t.url})` : ''}\n`
      if (t.text_content) b += `  ${t.text_content}\n`
    }
    blocks.push(b)
  }

  if (ctx.credentials.length > 0) {
    let b = '\n## Credentials Registry (credential_registry)\n\n'
    for (const c of ctx.credentials) {
      b += `- **${c.service}**${c.deployed_locations?.length ? ` — deployed in: ${c.deployed_locations.join(', ')}` : ''}\n`
    }
    blocks.push(b)
  }

  const contextBlock = blocks.length > 0
    ? blocks.join('\n')
    : '\n## No direct matches in enterprise data\n\nThe keyword search did not surface specific records. Acknowledge this, suggest related searches, or ask the user to refine.\n'

  const pageBlock = pageContext?.title ? `
## Current Page Context
The user is currently viewing: "${pageContext.title}"
${pageContext.url ? `URL: ${pageContext.url}` : ''}
${pageContext.itemId ? `KB Item ID: ${pageContext.itemId}` : ''}
When asked to summarize, edit, or improve "this page", refer to the above context.
` : ''

  return `You are **Chief of Staff** — the AI orchestrator for the InsightProfit enterprise platform.

## Your Role
- Senior operations Chief of Staff with full visibility into the entire InsightProfit enterprise — the Knowledge Base AND every connected database table (apps, agents, tools, offers, tasks, credentials).
- You answer "where is X" / "what is X" / "who owns X" / "how do we do X" by drawing on ALL the data sources surfaced below.
- You bridge KB knowledge to the broader InsightProfit tool suite and live apps.
- You are proactive: suggest next steps, identify gaps, and connect related information across data sources.

## Enterprise Data Sources Available (this turn)
The blocks below are the result of a federated keyword search across the live Supabase enterprise data. Treat them as the authoritative current state.
${pageBlock}${contextBlock}

## Response Format
- Use clear markdown: headers, bullet points, bold for key terms.
- Cite KB items as [Title](/kb/item/ID) — always link, never just mention.
- When referencing an app, link its live subdomain (e.g. https://family-gift-studio.insightprofit.live if found in app_catalog).
- When referencing a tool, link its login_page when known.
- End with a concrete "Next Steps" or suggested action when appropriate.

## Instructions
- Prioritize the enterprise data blocks above when answering — they are this turn's ground truth.
- If the user asks "where are the design documents for X", check: KB items → app catalog → offer pipeline → tasks, in that order, and report what you find in each.
- If NO blocks contain matches, say so honestly and suggest: (a) different search terms, (b) which database tables likely hold the answer, (c) a Command Center / ClickUp action to capture the gap.
- For cross-app actions (ClickUp tasks, Command Center items), format them as copy-pasteable bullets the user can act on.
- Never fabricate — if a data source is empty, say so.`
}

// ── Route Handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, pageContext } = body as { messages: ChatMessage[]; pageContext?: PageContext }

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

    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: 'No user message found' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Federated enterprise search
    const ctx = await federatedSearch(lastUserMessage.content)

    const systemPrompt = buildSystemPrompt(ctx, pageContext)
    const fullMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-10),
    ]

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://kb.insightprofit.live',
        'X-Title': 'InsightProfit Chief of Staff',
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

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    // Build a unified `sources` array for the UI from all federated hits
    const sourcesPayload: Array<{ id: string; title: string; item_type: string }> = [
      ...ctx.kbItems.map(r => ({ id: r.id, title: r.title, item_type: r.item_type })),
      ...ctx.apps.map(a => ({
        id: `app:${a.subdomain}`,
        title: `${a.name} (${a.subdomain}.insightprofit.live)`,
        item_type: 'app',
      })),
      ...ctx.agents.map(a => ({ id: `agent:${a.name}`, title: a.name, item_type: 'agent' })),
      ...ctx.tools.map(t => ({ id: `tool:${t.tool_name}`, title: t.tool_name, item_type: 'tool' })),
      ...ctx.offers.map(o => ({ id: `offer:${o.name || 'unknown'}`, title: o.name || 'Offer', item_type: 'offer' })),
      ...ctx.tasks.map(t => ({ id: `task:${t.id || t.name}`, title: t.name || 'Task', item_type: 'task' })),
      ...ctx.credentials.map(c => ({ id: `cred:${c.service}`, title: c.service, item_type: 'credential' })),
    ]

    const stream = new ReadableStream({
      async start(controller) {
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
            buffer = lines.pop() || ''

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
                // skip
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
