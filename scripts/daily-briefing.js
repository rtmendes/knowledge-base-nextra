// daily-briefing.js
// Runs at 7am EST via GitHub Actions.
// 1. Reads ClickUp tasks due today or overdue (workspace 14233858)
// 2. Reads Neon command_center.projects + command_center.products
// 3. Composes a markdown briefing
// 4. Posts as a new Notion page under the daily-log parent
// 5. Posts as a comment on the "Daily Briefing" ClickUp task

import { Client } from '@notionhq/client';
import { neon } from '@neondatabase/serverless';

const {
  CLICKUP_API_KEY,
  NOTION_API_KEY,
  NEON_DATABASE_URL,
  CLICKUP_WORKSPACE_ID = '14233858',
  NOTION_DAILY_LOG_PARENT_ID,
  CLICKUP_BRIEFING_TASK_ID,
} = process.env;

if (!CLICKUP_API_KEY || !NOTION_API_KEY || !NEON_DATABASE_URL) {
  console.error('Missing required env vars: CLICKUP_API_KEY, NOTION_API_KEY, NEON_DATABASE_URL');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });
const sql = neon(NEON_DATABASE_URL);

// ── ClickUp helpers ───────────────────────────────────────────────────────────

async function clickupGet(path) {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    headers: { Authorization: CLICKUP_API_KEY, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`ClickUp GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function clickupPost(path, body) {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    method: 'POST',
    headers: { Authorization: CLICKUP_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ClickUp POST ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function getOverdueTasks() {
  const now = Date.now();
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Fetch tasks from workspace with due_date filter (due today or overdue)
  const data = await clickupGet(
    `/team/${CLICKUP_WORKSPACE_ID}/task?due_date_lt=${todayEnd.getTime()}&statuses[]=open&statuses[]=in progress&statuses[]=to do&order_by=due_date&reverse=false&page=0`
  );
  return data.tasks || [];
}

// ── Neon helpers ──────────────────────────────────────────────────────────────

async function getProjects() {
  try {
    return await sql`SELECT name, status, health, updated_at FROM command_center.projects ORDER BY updated_at DESC`;
  } catch {
    return [];
  }
}

async function getProducts() {
  try {
    return await sql`SELECT name, status, url FROM command_center.products WHERE status = 'live' ORDER BY name`;
  } catch {
    return [];
  }
}

// ── Briefing composer ─────────────────────────────────────────────────────────

function formatDate(ts) {
  return new Date(parseInt(ts, 10)).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function composeBriefing(tasks, projects, products) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const overdue = tasks.filter(t => t.due_date && parseInt(t.due_date) < Date.now());
  const dueToday = tasks.filter(t => {
    if (!t.due_date) return false;
    const d = new Date(parseInt(t.due_date));
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  let md = `# 🌅 Morning Briefing — ${today}\n\n`;

  // Overdue section
  md += `## 🔴 Overdue Tasks (${overdue.length})\n`;
  if (overdue.length === 0) {
    md += '_Nothing overdue — great!_\n';
  } else {
    overdue.forEach(t => {
      md += `- **${t.name}** — due ${formatDate(t.due_date)} · [Open](${t.url})\n`;
    });
  }
  md += '\n';

  // Due today section
  md += `## 📅 Due Today (${dueToday.length})\n`;
  if (dueToday.length === 0) {
    md += '_Nothing due today._\n';
  } else {
    dueToday.forEach(t => {
      md += `- **${t.name}** · [Open](${t.url})\n`;
    });
  }
  md += '\n';

  // Projects section
  md += `## 🏗️ Project Health\n`;
  if (projects.length === 0) {
    md += '_No projects data available._\n';
  } else {
    projects.forEach(p => {
      const icon = p.health === 'green' ? '🟢' : p.health === 'yellow' ? '🟡' : p.health === 'red' ? '🔴' : '⚪';
      md += `- ${icon} **${p.name}** — ${p.status}\n`;
    });
  }
  md += '\n';

  // Live products section
  md += `## 🚀 Live Products (${products.length})\n`;
  if (products.length === 0) {
    md += '_No live products yet._\n';
  } else {
    products.forEach(p => {
      md += `- **${p.name}**${p.url ? ` — [${p.url}](${p.url})` : ''}\n`;
    });
  }

  return md;
}

// ── Notion: post as new page ──────────────────────────────────────────────────

function mdToNotionBlocks(markdown) {
  const blocks = [];
  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) {
      blocks.push({ object: 'block', type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: line.slice(3) } }] } });
    } else if (line.startsWith('# ')) {
      blocks.push({ object: 'block', type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] } });
    } else if (line.startsWith('- ')) {
      blocks.push({ object: 'block', type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] } });
    } else if (line.trim() === '') {
      blocks.push({ object: 'block', type: 'paragraph',
        paragraph: { rich_text: [] } });
    } else {
      blocks.push({ object: 'block', type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: line } }] } });
    }
  }
  return blocks;
}

async function postToNotion(title, markdown) {
  if (!NOTION_DAILY_LOG_PARENT_ID) {
    console.log('NOTION_DAILY_LOG_PARENT_ID not set — skipping Notion post');
    return null;
  }
  const blocks = mdToNotionBlocks(markdown);
  // Notion API max 100 blocks per request — chunk if needed
  const page = await notion.pages.create({
    parent: { page_id: NOTION_DAILY_LOG_PARENT_ID },
    properties: { title: { title: [{ text: { content: title } }] } },
    children: blocks.slice(0, 100),
  });
  console.log(`✅ Notion page created: ${page.url}`);
  return page.id;
}

// ── ClickUp: post as comment ──────────────────────────────────────────────────

async function postToClickUp(markdown) {
  if (!CLICKUP_BRIEFING_TASK_ID) {
    console.log('CLICKUP_BRIEFING_TASK_ID not set — skipping ClickUp comment');
    return;
  }
  await clickupPost(`/task/${CLICKUP_BRIEFING_TASK_ID}/comment`, {
    comment_text: markdown,
    notify_all: false,
  });
  console.log('✅ ClickUp comment posted');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌅 Starting daily briefing…');

  const [tasks, projects, products] = await Promise.all([
    getOverdueTasks().catch(e => { console.error('ClickUp error:', e.message); return []; }),
    getProjects().catch(e => { console.error('Neon projects error:', e.message); return []; }),
    getProducts().catch(e => { console.error('Neon products error:', e.message); return []; }),
  ]);

  console.log(`Tasks: ${tasks.length} due/overdue | Projects: ${projects.length} | Products: ${products.length}`);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const title = `Daily Briefing — ${today}`;
  const markdown = composeBriefing(tasks, projects, products);

  console.log('\n--- Briefing Preview ---\n' + markdown.slice(0, 500) + '...\n');

  await Promise.all([
    postToNotion(title, markdown),
    postToClickUp(markdown),
  ]);

  console.log('✅ Daily briefing complete');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
