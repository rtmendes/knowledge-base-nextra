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

// ── Diagnostics ───────────────────────────────────────────────────────────────

function checkEnv() {
  const required = { NOTION_API_KEY, NEON_DATABASE_URL };
  const optional = { NOTION_WEEKLY_REPORT_PARENT_ID, CLICKUP_API_KEY };

  console.log('🔍 Environment check:');
  for (const [k, v] of Object.entries(required)) {
    const status = v ? `✅ set (${v.slice(0, 6)}…${v.slice(-4)})` : '❌ MISSING';
    console.log(`  ${k}: ${status}`);
  }
  for (const [k, v] of Object.entries(optional)) {
    const status = v ? `✅ set (${v.slice(0, 6)}…${v.slice(-4)})` : '⚠️ not set (optional)';
    console.log(`  ${k}: ${status}`);
  }

  const missing = Object.entries(required).filter(([, v]) => !v).map(([k]) => k);
  if (missing.length) {
    console.error(`\n❌ Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

let sql;
try {
  sql = neon(NEON_DATABASE_URL || '');
} catch (err) {
  console.error('❌ Failed to initialize Neon client:', err.message);
  sql = null;
}

async function getProjectSummary() {
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT name, status, health, task_count, open_count, overdue_count, updated_at
      FROM command_center.projects
      ORDER BY health DESC, name ASC
    `;
    console.log(`  📂 Projects: ${rows.length} rows`);
    return rows;
  } catch (err) {
    console.warn(`  ⚠️ Projects query failed: ${err.message}`);
    return [];
  }
}

async function getLiveProducts() {
  if (!sql) return [];
  try {
    const rows = await sql`
      SELECT name, status, url, notes
      FROM command_center.products
      ORDER BY status DESC, name ASC
    `;
    console.log(`  🚀 Products: ${rows.length} rows`);
    return rows;
  } catch (err) {
    console.warn(`  ⚠️ Products query failed: ${err.message}`);
    return [];
  }
}

async function getTaskStats() {
  if (!sql) return { total: 0, open_total: 0, overdue_total: 0, completed_total: 0 };
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
    const stats = rows[0] || { total: 0, open_total: 0, overdue_total: 0, completed_total: 0 };
    console.log(`  📋 Tasks: ${stats.total} total, ${stats.open_total} open, ${stats.overdue_total} overdue`);
    return stats;
  } catch (err) {
    console.warn(`  ⚠️ Tasks query failed: ${err.message}`);
    return { total: 0, open_total: 0, overdue_total: 0, completed_total: 0 };
  }
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
    console.log('⚠️ NOTION_WEEKLY_REPORT_PARENT_ID not set — printing report to console\n');
    console.log(markdown);
    return { fallback: 'console' };
  }

  console.log(`📝 Creating Notion page under parent: ${NOTION_WEEKLY_REPORT_PARENT_ID.slice(0, 8)}…`);
  const notion = new Client({ auth: NOTION_API_KEY });
  const blocks = mdToNotionBlocks(markdown);

  try {
    const page = await notion.pages.create({
      parent: { page_id: NOTION_WEEKLY_REPORT_PARENT_ID },
      properties: { title: { title: [{ text: { content: title } }] } },
      children: blocks,
    });
    console.log(`✅ Notion weekly report created: ${page.url}`);
    return page;
  } catch (err) {
    console.error(`❌ Notion API error: ${err.status || 'unknown'} — ${err.message}`);
    if (err.body) console.error(`   Body: ${JSON.stringify(err.body)}`);
    if (err.code) console.error(`   Code: ${err.code}`);

    // Fall back to console output so the report is still visible in logs
    console.log('\n📋 === REPORT (fallback — Notion failed) ===\n');
    console.log(markdown);
    console.log('\n=== END REPORT ===');

    // Don't crash — the report was generated; only the Notion push failed
    return { fallback: 'console', error: err.message };
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📊 Starting weekly report…');
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   Node: ${process.version}\n`);

  checkEnv();

  console.log('\n🔌 Fetching data from Neon…');
  const [projects, products, stats] = await Promise.all([
    getProjectSummary(),
    getLiveProducts(),
    getTaskStats(),
  ]);

  console.log(`\n📊 Summary: ${projects.length} projects | ${products.length} products | ${stats.total || 0} tasks`);

  const weekOf = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const title = `Weekly Report — Week of ${weekOf}`;
  const markdown = composeReport(projects, products, stats);

  console.log('\n📤 Posting to Notion…');
  const result = await postToNotion(title, markdown);

  if (result?.fallback) {
    console.warn('\n⚠️ Report completed with fallback (Notion push failed). Check logs above for details.');
    // Exit 0 — the report itself was generated successfully
  } else {
    console.log('\n✅ Weekly report complete');
  }
}

main().catch(err => {
  console.error('\n💀 Fatal unhandled error:', err);
  console.error('Stack:', err.stack);
  process.exit(1);
});
