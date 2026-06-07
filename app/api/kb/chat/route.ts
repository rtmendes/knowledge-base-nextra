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

/**
 * Extract both PHRASES (multi-word entities like "Family Gift Studio") and
 * single TERMS from the query. Phrases are runs of consecutive non-stopword
 * tokens — these are the high-signal entity matches we want to prioritize.
 */
function extractQuery(message: string): { phrases: string[]; terms: string[] } {
  const raw = message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  // Find runs of consecutive non-stopword, length>2 tokens
  const runs: string[][] = []
  let run: string[] = []
  for (const w of raw) {
    if (STOP_WORDS.has(w) || w.length <= 2) {
      if (run.length >= 2) runs.push(run)
      run = []
    } else {
      run.push(w)
    }
  }
  if (run.length >= 2) runs.push(run)

  // Keep phrases <= 4 words. For longer runs, break into 3-grams.
  const phrases: string[] = []
  for (const r of runs) {
    if (r.length <= 4) {
      phrases.push(r.join(' '))
    } else {
      for (let i = 0; i <= r.length - 3; i++) {
        phrases.push(r.slice(i, i + 3).join(' '))
      }
    }
  }

  const terms = raw.filter(w => w.length > 2 && !STOP_WORDS.has(w)).slice(0, 8)

  // Cap phrases — prefer longest first (more specific entities)
  phrases.sort((a, b) => b.split(' ').length - a.split(' ').length)
  return { phrases: phrases.slice(0, 5), terms }
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

/**
 * Score an item by phrase hits (weighted heavily) and term hits.
 * Phrase matches are the strong signal — a doc that contains "family gift studio"
 * as a phrase is orders of magnitude more relevant than one that just mentions
 * "family" and "studio" somewhere independently.
 */
function scoreItem(
  text: string,
  title: string,
  phrases: string[],
  terms: string[]
): { score: number; phraseHits: number } {
  const t = title.toLowerCase()
  const c = text.toLowerCase()
  let score = 0
  let phraseHits = 0

  for (const p of phrases) {
    const pre = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    const titleHits = (t.match(pre) || []).length
    const contentHits = Math.min((c.match(pre) || []).length, 5)
    if (titleHits > 0 || contentHits > 0) phraseHits++
    score += titleHits * 100
    score += contentHits * 25
  }
  for (const kw of terms) {
    const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    score += (t.match(re) || []).length * 3
    score += Math.min((c.match(re) || []).length, 10)
  }
  return { score, phraseHits }
}

// ── Individual Table Searches ─────────────────────────────────────────────
//
// Search strategy per table:
//   1. PHRASE PASS — try the longest phrases as ILIKE substring matches first.
//      These are high-signal entity matches ("family gift studio").
//   2. TERM FALLBACK — only if phrase pass returns nothing, fall back to
//      single-keyword OR.
//   3. SCORE + THRESHOLD — re-rank with phrase-weighted scoring, then drop
//      anything below a minimum score so the model never sees noise.

const KB_MIN_SCORE     = 30   // KB item must have at least one phrase hit OR many term hits
const APP_MIN_SCORE    = 25
const GENERIC_MIN_SCORE = 25

async function searchKBItems(
  phrases: string[],
  terms: string[],
  limit = 5
): Promise<KBSearchResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []

  // Phrase pass — ILIKE the full phrase against title + content_plain
  let data: any[] = []
  if (phrases.length > 0) {
    const phraseConditions = buildOr(['title', 'content_plain'], phrases)
    const res = await supabaseAdmin
      .from('knowledge_items')
      .select('id, title, item_type, content_plain, tags, word_count')
      .or(phraseConditions)
      .gt('word_count', 10)
      .order('word_count', { ascending: false })
      .limit(limit * 3)
    if (!res.error && res.data) data = res.data
  }

  // Fallback term pass only if no phrase hits
  if (data.length === 0 && terms.length > 0) {
    const termConditions = buildOr(['title', 'content_plain'], terms)
    const res = await supabaseAdmin
      .from('knowledge_items')
      .select('id, title, item_type, content_plain, tags, word_count')
      .or(termConditions)
      .gt('word_count', 10)
      .order('word_count', { ascending: false })
      .limit(limit * 3)
    if (!res.error && res.data) data = res.data
  }

  if (data.length === 0) return []

  // Score with phrase + term weighting
  const ranked = data.map(item => {
    const { score, phraseHits } = scoreItem(
      item.content_plain || '',
      item.title || '',
      phrases,
      terms,
    )
    let finalScore = score
    if (item.word_count > 500) finalScore += 1
    if (item.word_count > 2000) finalScore += 1
    return { ...item, score: finalScore, phraseHits }
  })

  // Threshold: must score above KB_MIN_SCORE.
  // If we have phrases, also require at least 1 phrase hit unless score is very high on terms alone.
  const filtered = ranked.filter(r => {
    if (r.score < KB_MIN_SCORE) return false
    if (phrases.length > 0 && r.phraseHits === 0 && r.score < KB_MIN_SCORE * 2) return false
    return true
  })

  filtered.sort((a, b) => b.score - a.score)

  return filtered.slice(0, limit).map(item => ({
    id: item.id,
    title: item.title,
    item_type: item.item_type,
    content_plain: (item.content_plain || '').slice(0, 4000),
    tags: item.tags || [],
    word_count: item.word_count,
  }))
}

async function searchAppCatalog(phrases: string[], terms: string[]): Promise<AppResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    // Phrase pass first
    let data: any[] = []
    if (phrases.length > 0) {
      const res = await supabaseAdmin
        .from('app_catalog')
        .select('*')
        .or(buildOr(['name', 'subdomain'], phrases))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0 && terms.length > 0) {
      const res = await supabaseAdmin
        .from('app_catalog')
        .select('*')
        .or(buildOr(['name', 'subdomain'], terms))
        .limit(8)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0) return []

    // Re-score and threshold — keep only relevant apps
    const ranked = data.map((r: any) => {
      const haystack = `${r.name || ''} ${r.subdomain || ''} ${r.description || r.purpose || r.notes || ''}`
      const { score, phraseHits } = scoreItem(haystack, r.name || '', phrases, terms)
      return { row: r, score, phraseHits }
    })
    const filtered = ranked.filter(x =>
      x.score >= APP_MIN_SCORE || x.phraseHits > 0
    )
    filtered.sort((a, b) => b.score - a.score)
    return filtered.slice(0, 5).map(({ row: r }) => ({
      subdomain: r.subdomain,
      name: r.name,
      hosting: r.hosting,
      description: r.description || r.purpose || r.notes,
    }))
  } catch { return [] }
}

async function searchAiAgents(phrases: string[], terms: string[]): Promise<AgentResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    let data: any[] = []
    if (phrases.length > 0) {
      const res = await supabaseAdmin
        .from('ai_agents')
        .select('name, status, platform, metadata')
        .or(buildOr(['name', 'metadata', 'platform'], phrases))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0 && terms.length > 0) {
      const res = await supabaseAdmin
        .from('ai_agents')
        .select('name, status, platform, metadata')
        .or(buildOr(['name', 'metadata', 'platform'], terms))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const meta = typeof r.metadata === 'string' ? r.metadata : JSON.stringify(r.metadata || {})
      const haystack = `${r.name || ''} ${r.platform || ''} ${meta}`
      const { score, phraseHits } = scoreItem(haystack, r.name || '', phrases, terms)
      return { row: r, score, phraseHits, meta }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0)
    filtered.sort((a, b) => b.score - a.score)
    return filtered.slice(0, 5).map(({ row: r, meta }) => ({
      name: r.name,
      status: r.status,
      platform: r.platform,
      metadata: meta.slice(0, 400),
    }))
  } catch { return [] }
}

async function searchTechTools(phrases: string[], terms: string[]): Promise<ToolResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    let data: any[] = []
    if (phrases.length > 0) {
      const res = await supabaseAdmin
        .from('tech_tools')
        .select('tool_name, function_description, login_page')
        .or(buildOr(['tool_name', 'function_description'], phrases))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0 && terms.length > 0) {
      const res = await supabaseAdmin
        .from('tech_tools')
        .select('tool_name, function_description, login_page')
        .or(buildOr(['tool_name', 'function_description'], terms))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const haystack = `${r.tool_name || ''} ${r.function_description || ''}`
      const { score, phraseHits } = scoreItem(haystack, r.tool_name || '', phrases, terms)
      return { row: r, score, phraseHits }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0)
    filtered.sort((a, b) => b.score - a.score)
    return filtered.slice(0, 5).map(({ row: r }) => ({
      tool_name: r.tool_name,
      function_description: r.function_description,
      login_page: r.login_page,
    }))
  } catch { return [] }
}

async function searchOfferPipeline(phrases: string[], terms: string[]): Promise<OfferResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    const colSets = [['name', 'description', 'offer_type'], ['name']]
    let data: any[] = []

    // Try phrase pass across column sets
    for (const cols of colSets) {
      if (data.length > 0 || phrases.length === 0) break
      const res = await supabaseAdmin
        .from('offer_pipeline')
        .select('*')
        .or(buildOr(cols, phrases))
        .limit(6)
      if (!res.error && res.data && res.data.length > 0) { data = res.data; break }
    }
    // Term fallback only if phrase pass came up dry
    if (data.length === 0 && terms.length > 0) {
      for (const cols of colSets) {
        const res = await supabaseAdmin
          .from('offer_pipeline')
          .select('*')
          .or(buildOr(cols, terms))
          .limit(8)
        if (!res.error && res.data) { data = res.data; break }
      }
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const haystack = `${r.name || ''} ${r.description || r.notes || ''} ${r.offer_type || ''}`
      const { score, phraseHits } = scoreItem(haystack, r.name || '', phrases, terms)
      return { row: r, score, phraseHits }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0)
    filtered.sort((a, b) => b.score - a.score)
    return filtered.slice(0, 5).map(({ row: r }) => ({
      name: r.name,
      description: r.description || r.notes,
      price_point: r.price_point,
      offer_type: r.offer_type,
    }))
  } catch { return [] }
}

async function searchClickupTasks(phrases: string[], terms: string[]): Promise<TaskResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    const colSets = [['name', 'text_content'], ['name']]
    let data: any[] = []

    for (const cols of colSets) {
      if (data.length > 0 || phrases.length === 0) break
      const res = await supabaseAdmin
        .from('clickup_tasks')
        .select('*')
        .or(buildOr(cols, phrases))
        .limit(6)
      if (!res.error && res.data && res.data.length > 0) { data = res.data; break }
    }
    if (data.length === 0 && terms.length > 0) {
      for (const cols of colSets) {
        const res = await supabaseAdmin
          .from('clickup_tasks')
          .select('*')
          .or(buildOr(cols, terms))
          .limit(8)
        if (!res.error && res.data) { data = res.data; break }
      }
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const haystack = `${r.name || ''} ${r.text_content || r.description || ''}`
      const { score, phraseHits } = scoreItem(haystack, r.name || '', phrases, terms)
      return { row: r, score, phraseHits }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0)
    filtered.sort((a, b) => b.score - a.score)
    return filtered.slice(0, 5).map(({ row: r }) => ({
      id: r.id || r.task_id,
      name: r.name,
      text_content: (r.text_content || r.description || '').slice(0, 400),
      status: r.status,
      url: r.url,
    }))
  } catch { return [] }
}

async function searchCredentials(phrases: string[], terms: string[]): Promise<CredentialResult[]> {
  if (!supabaseAdmin) return []
  if (phrases.length === 0 && terms.length === 0) return []
  try {
    // Credentials: phrase pass then term pass
    let data: any[] = []
    if (phrases.length > 0) {
      const res = await supabaseAdmin
        .from('credential_registry')
        .select('service, deployed_locations')
        .or(buildOr(['service'], phrases))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0 && terms.length > 0) {
      const res = await supabaseAdmin
        .from('credential_registry')
        .select('service, deployed_locations')
        .or(buildOr(['service'], terms))
        .limit(6)
      if (!res.error && res.data) data = res.data
    }
    if (data.length === 0) return []

    const ranked = data.map((r: any) => {
      const { score, phraseHits } = scoreItem(r.service || '', r.service || '', phrases, terms)
      return { row: r, score, phraseHits }
    })
    const filtered = ranked.filter(x => x.score >= GENERIC_MIN_SCORE || x.phraseHits > 0)
    filtered.sort((a, b) => b.score - a.score)
    return filtered.slice(0, 5).map(({ row: r }) => r as CredentialResult)
  } catch { return [] }
}

/** Federated search across the enterprise platform */
async function federatedSearch(query: string): Promise<{
  context: FederatedContext
  phrases: string[]
  terms: string[]
}> {
  const { phrases, terms } = extractQuery(query)
  if (phrases.length === 0 && terms.length === 0) {
    return {
      context: { kbItems: [], apps: [], agents: [], tools: [], offers: [], tasks: [], credentials: [] },
      phrases, terms,
    }
  }

  const [kbItems, apps, agents, tools, offers, tasks, credentials] = await Promise.all([
    searchKBItems(phrases, terms),
    searchAppCatalog(phrases, terms),
    searchAiAgents(phrases, terms),
    searchTechTools(phrases, terms),
    searchOfferPipeline(phrases, terms),
    searchClickupTasks(phrases, terms),
    searchCredentials(phrases, terms),
  ])

  return {
    context: { kbItems, apps, agents, tools, offers, tasks, credentials },
    phrases, terms,
  }
}

// ── Prompt Builder ────────────────────────────────────────────────────────

interface PageContext {
  title?: string
  url?: string
  itemId?: string
}

function buildSystemPrompt(
  ctx: FederatedContext,
  phrases: string[],
  terms: string[],
  pageContext?: PageContext,
): string {
  const blocks: string[] = []
  const totalHits =
    ctx.kbItems.length + ctx.apps.length + ctx.agents.length +
    ctx.tools.length + ctx.offers.length + ctx.tasks.length + ctx.credentials.length

  const queryDebug = `\n## Query Analysis\n- Detected phrases: ${phrases.length ? phrases.map(p => `"${p}"`).join(', ') : '(none)'}\n- Single terms: ${terms.length ? terms.join(', ') : '(none)'}\n- Total qualified matches across enterprise tables: ${totalHits}\n`

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
    ? queryDebug + '\n' + blocks.join('\n')
    : queryDebug + `\n## No qualified matches in enterprise data

The federated search across knowledge_items, app_catalog, ai_agents, tech_tools, offer_pipeline, clickup_tasks, and credential_registry did NOT find any records that passed the relevance threshold for the detected phrases/terms.

CRITICAL: Do NOT fabricate sources or pretend you found something. Tell the user honestly:
1. You searched all 7 enterprise tables and found no qualifying matches.
2. Echo back the phrases you searched for so they can refine.
3. Suggest more specific entity names or a different table to look in.
4. Optionally offer to create a ClickUp task or a KB stub for the missing knowledge.
`

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

    // Federated enterprise search (phrase-first, threshold-filtered)
    const { context: ctx, phrases, terms } = await federatedSearch(lastUserMessage.content)

    const systemPrompt = buildSystemPrompt(ctx, phrases, terms, pageContext)
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
