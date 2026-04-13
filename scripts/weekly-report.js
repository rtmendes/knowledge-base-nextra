// weekly-report.js
// Runs every Monday 9am EST via GitHub Actions.
// 1. Aggregates all project statuses from Neon command_center.projects
// 2. Lists all live products + buy URLs from command_center.products
// 3. Pulls open/overdue task counts from command_center.tasks
// 4. Posts a formatted summary page to Notion

import { Client } from '@notionhq/client';
import { neon } from '@neondatabase/serverless';

const {
  NOTION_API_KEY,
  NEON_DATABASE_URL,
  CLICKUP_API_KEY,
  CLICKUP_WORKSPACE_ID = '14233858',
  NOTION_WEEKLY_REPORT_PARENT_ID,
} = process.env;

if (!NOTION_API_KEY || !NEON_DATABASE_URL) {
  console.error('Missing required env vars: NOTION_API_KEY, NEON_DATABASE_URL');
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });
const sql = neon(NEON_DATABASE_URL);

// ── Data fetchers ─────────────────────────────────────────────────────────────

async function getProjectSummary() {
  try {
    return await sql`
      SELECT name, status, health, task_count, open_count, overdue_count, updated_at
      FROM command_center.projects
      ORDER BY health DESC, name ASC
    `;
  } catch { return []; }
}

async function getLiveProducts() {
  try {
    return await sql`
      SELECT name, status, url, notes
      FROM command_center.products
      ORDER BY status DESC, name ASC
    `;
  } catch { return []; }
}

async function getTaskStats() {
  try {
    const rows = await sql`
      SELECT
        COUNT(*)::int                                                         AS total,
        COUNT(*) FILTER (WHERE status NOT IN ('complete','closed'))::int      AS open_total,
        COUNT(*) FILTER (
          WHERE due_date < now() AND status NOT IN ('complete','closed')
        )::int                                                                 AS overdue_total,
        COUNT(*) FILTER (WHERE status IN ('complete','closed'))::int           AS completed_total
      FROM command_center.tasks
    `;
    return rows[0] || { total: 0, open_total: 0, overdue_total: 0, completed_total: 0 };
  } catch { return { total: 0, open_total: 0, overdue_total: 0, completed_total: 0 }; }
}

// ── Report composer ───────────────────────────────────────────────────────────

function composeReport(projects, products, stats) {
  const weekOf = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  let md = `# 📊 Weekly Status Report — Week of ${weekOf}\n\n`;

  // Task overview
  md += `## 📋 Task Overview\n`;
  md += `| Metric | Count |\n|--------|-------|\n`;
  md += `| Total Tasks | ${stats.total} |\n`;
  md += `| Open | ${stats.open_total} |\n`;
  md += `| Overdue | ${stats.overdue_total} |\n`;
  md += `| Completed | ${stats.completed_total} |\n\n`;

  // Projects health
  md += `## 🏗️ Projects (${projects.length})\n`;
  if (projects.length === 0) {
    md += '_No project data in Neon yet._\n\n';
  } else {
    const red = projects.filter(p => p.health === 'red');
    const yellow = projects.filter(p => p.health === 'yellow');
    const green = projects.filter(p => p.health === 'green' || !p.health);

    if (red.length) {
      md += `### 🔴 Needs Attention\n`;
      red.forEach(p => md += `- **${p.name}** — ${p.overdue_count} overdue, ${p.open_count} open\n`);
      md += '\n';
    }
    if (yellow.length) {
      md += `### 🟡 Watch\n`;
      yellow.forEach(p => md += `- **${p.name}** — ${p.overdue_count} overdue, ${p.open_count} open\n`);
      md += '\n';
    }
    if (green.length) {
      md += `### 🟢 On Track\n`;
      green.forEach(p => md += `- **${p.name}** — ${p.open_count} open tasks\n`);
      md += '\n';
    }
  }

  // Products
  md += `## 🚀 Products\n`;
  if (products.length === 0) {
    md += '_No products in Neon yet._\n\n';
  } else {
    const live = products.filter(p => p.status === 'live');
    const building = products.filter(p => p.status !== 'live');
    if (live.length) {
      md += `**Live (${live.length}):**\n`;
      live.forEach(p => md += `- **${p.name}**${p.url ? ` — [${p.url}](${p.url})` : ''}${p.notes ? ` — ${p.notes}` : ''}\n`);
      md += '\n';
    }
    if (building.length) {
      md += `**Building (${building.length}):**\n`;
      building.forEach(p => md += `- **${p.name}** (${p.status})\n`);
      md += '\n';
    }
  }

  md += `\n_Report generated automatically on ${new Date().toISOString()} by GitHub Actions._\n`;
  return md;
}

// ── Notion: post as page ──────────────────────────────────────────────────────

function mdToNotionBlocks(markdown) {
  const blocks = [];
  for (const line of markdown.split('\n')) {
    if (line.startsWith('### ')) {
      blocks.push({ object: 'block', type: 'heading_3',
        heading_3: { rich_text: [{ type: 'text', text: { content: line.slice(4) } }] } });
    } else if (line.startsWith('## ')) {
      blocks.push({ object: 'block', type: 'heading_2',
        heading_2: { rich_text: [{ type: 'text', text: { content: line.slice(3) } }] } });
    } else if (line.startsWith('# ')) {
      blocks.push({ object: 'block', type: 'heading_1',
        heading_1: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] } });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      blocks.push({ object: 'block', type: 'bulleted_list_item',
        bulleted_list_item: { rich_text: [{ type: 'text', text: { content: line.slice(2) } }] } });
    } else if (line.startsWith('**') && line.endsWith('**')) {
      blocks.push({ object: 'block', type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: line.replace(/\*\*/g, '') },
          annotations: { bold: true } }] } });
    } else if (line.trim() === '' || line.startsWith('|')) {
      // skip markdown tables (Notion doesn't render them from API easily) & blank lines
      blocks.push({ object: 'block', type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: line } }] } });
    } else {
      blocks.push({ object: 'block', type: 'paragraph',
        paragraph: { rich_text: [{ type: 'text', text: { content: line } }] } });
    }
  }
  return blocks.slice(0, 100); // Notion API cap
}

async function postToNotion(title, markdown) {
  if (!NOTION_WEEKLY_REPORT_PARENT_ID) {
    console.log('NOTION_WEEKLY_REPORT_PARENT_ID not set — printing report to console\n');
    console.log(markdown);
    return;
  }
  const blocks = mdToNotionBlocks(markdown);
  const page = await notion.pages.create({
    parent: { page_id: NOTION_WEEKLY_REPORT_PARENT_ID },
    properties: { title: { title: [{ text: { content: title } }] } },
    children: blocks,
  });
  console.log(`✅ Notion weekly report created: ${page.url}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📊 Starting weekly report…');

  const [projects, products, stats] = await Promise.all([
    getProjectSummary().catch(e => { console.error('Projects error:', e.message); return []; }),
    getLiveProducts().catch(e => { console.error('Products error:', e.message); return []; }),
    getTaskStats().catch(e => { console.error('Stats error:', e.message); return {}; }),
  ]);

  console.log(`Projects: ${projects.length} | Products: ${products.length} | Tasks: ${stats.total || 0}`);

  const weekOf = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const title = `Weekly Report — Week of ${weekOf}`;
  const markdown = composeReport(projects, products, stats);

  await postToNotion(title, markdown);
  console.log('✅ Weekly report complete');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
