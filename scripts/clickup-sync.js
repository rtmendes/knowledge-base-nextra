// clickup-sync.js
// Runs every 30 minutes via GitHub Actions.
// 1. Fetches all tasks from ClickUp workspace 14233858
// 2. Upserts them into command_center.tasks in Neon
// 3. Updates command_center.projects health based on task counts

import { neon } from '@neondatabase/serverless';

const {
  CLICKUP_API_KEY,
  NEON_DATABASE_URL,
  CLICKUP_WORKSPACE_ID = '14233858',
} = process.env;

if (!CLICKUP_API_KEY || !NEON_DATABASE_URL) {
  console.error('Missing required env vars: CLICKUP_API_KEY, NEON_DATABASE_URL');
  process.exit(1);
}

const sql = neon(NEON_DATABASE_URL);

// ── ClickUp helpers ───────────────────────────────────────────────────────────

async function clickupGet(path) {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    headers: { Authorization: CLICKUP_API_KEY, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`ClickUp GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function getAllSpaces() {
  const data = await clickupGet(`/team/${CLICKUP_WORKSPACE_ID}/space?archived=false`);
  return data.spaces || [];
}

async function getListsInSpace(spaceId) {
  const [folderless, foldersData] = await Promise.all([
    clickupGet(`/space/${spaceId}/list?archived=false`),
    clickupGet(`/space/${spaceId}/folder?archived=false`),
  ]);
  const lists = [...(folderless.lists || [])];
  for (const folder of foldersData.folders || []) {
    const folderLists = await clickupGet(`/folder/${folder.id}/list?archived=false`);
    lists.push(...(folderLists.lists || []));
  }
  return lists;
}

async function getTasksFromList(listId) {
  const tasks = [];
  let page = 0;
  while (true) {
    const data = await clickupGet(
      `/list/${listId}/task?archived=false&include_closed=true&page=${page}&order_by=updated&reverse=true`
    );
    tasks.push(...(data.tasks || []));
    if (!data.last_page) { page++; } else { break; }
    if (page > 20) break; // safety cap
  }
  return tasks;
}

// ── Neon: ensure tables exist ─────────────────────────────────────────────────

async function ensureTables() {
  await sql`CREATE SCHEMA IF NOT EXISTS command_center`;

  await sql`
    CREATE TABLE IF NOT EXISTS command_center.tasks (
      id            TEXT PRIMARY KEY,
      name          TEXT,
      status        TEXT,
      priority      TEXT,
      due_date      TIMESTAMPTZ,
      list_id       TEXT,
      list_name     TEXT,
      space_id      TEXT,
      space_name    TEXT,
      url           TEXT,
      assignees     JSONB DEFAULT '[]',
      tags          JSONB DEFAULT '[]',
      date_created  TIMESTAMPTZ,
      date_updated  TIMESTAMPTZ,
      synced_at     TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS command_center.projects (
      id            TEXT PRIMARY KEY,
      name          TEXT,
      status        TEXT DEFAULT 'active',
      health        TEXT DEFAULT 'green',
      task_count    INT DEFAULT 0,
      open_count    INT DEFAULT 0,
      overdue_count INT DEFAULT 0,
      updated_at    TIMESTAMPTZ DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS command_center.products (
      id     TEXT PRIMARY KEY,
      name   TEXT,
      status TEXT DEFAULT 'live',
      url    TEXT,
      notes  TEXT
    )
  `;
}

// ── Neon: upsert tasks ────────────────────────────────────────────────────────

async function upsertTasks(tasks) {
  if (tasks.length === 0) return;

  // Process in batches of 50
  for (let i = 0; i < tasks.length; i += 50) {
    const batch = tasks.slice(i, i + 50);
    for (const t of batch) {
      const dueDate = t.due_date ? new Date(parseInt(t.due_date, 10)) : null;
      const dateCreated = t.date_created ? new Date(parseInt(t.date_created, 10)) : null;
      const dateUpdated = t.date_updated ? new Date(parseInt(t.date_updated, 10)) : null;

      await sql`
        INSERT INTO command_center.tasks
          (id, name, status, priority, due_date, list_id, list_name,
           space_id, space_name, url, assignees, tags, date_created, date_updated, synced_at)
        VALUES (
          ${t.id}, ${t.name}, ${t.status?.status || null},
          ${t.priority?.priority || null},
          ${dueDate}, ${t.list?.id || null}, ${t.list?.name || null},
          ${t.space?.id || null}, ${t.space?.name || null},
          ${t.url || null},
          ${JSON.stringify((t.assignees || []).map(a => ({ id: a.id, username: a.username })))},
          ${JSON.stringify((t.tags || []).map(tg => tg.name))},
          ${dateCreated}, ${dateUpdated}, now()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name, status = EXCLUDED.status,
          priority = EXCLUDED.priority, due_date = EXCLUDED.due_date,
          list_id = EXCLUDED.list_id, list_name = EXCLUDED.list_name,
          assignees = EXCLUDED.assignees, tags = EXCLUDED.tags,
          date_updated = EXCLUDED.date_updated, synced_at = now()
      `;
    }
    console.log(`  Upserted tasks ${i + 1}–${Math.min(i + 50, tasks.length)}`);
  }
}

// ── Neon: update project health ───────────────────────────────────────────────

async function updateProjectHealth(spaces) {
  const now = Date.now();

  for (const space of spaces) {
    const rows = await sql`
      SELECT
        COUNT(*)::int                                              AS total,
        COUNT(*) FILTER (WHERE status NOT IN ('complete','closed'))::int AS open_count,
        COUNT(*) FILTER (
          WHERE due_date < now() AND status NOT IN ('complete','closed')
        )::int                                                     AS overdue_count
      FROM command_center.tasks
      WHERE space_id = ${space.id}
    `;
    const { total, open_count, overdue_count } = rows[0];
    const health = overdue_count > 3 ? 'red' : overdue_count > 0 ? 'yellow' : 'green';

    await sql`
      INSERT INTO command_center.projects (id, name, status, health, task_count, open_count, overdue_count, updated_at)
      VALUES (${space.id}, ${space.name}, 'active', ${health}, ${total}, ${open_count}, ${overdue_count}, now())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name, health = EXCLUDED.health,
        task_count = EXCLUDED.task_count, open_count = EXCLUDED.open_count,
        overdue_count = EXCLUDED.overdue_count, updated_at = now()
    `;
    console.log(`  Project "${space.name}": ${total} tasks, ${overdue_count} overdue → health=${health}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🔄 Starting ClickUp → Neon sync…');

  await ensureTables();
  console.log('✅ Tables ensured');

  const spaces = await getAllSpaces();
  console.log(`Found ${spaces.length} spaces`);

  let totalTasks = 0;
  for (const space of spaces) {
    const lists = await getListsInSpace(space.id);
    console.log(`Space "${space.name}": ${lists.length} lists`);

    const allTasks = [];
    for (const list of lists) {
      const tasks = await getTasksFromList(list.id);
      // Enrich with space info since nested calls may omit it
      tasks.forEach(t => { t.space = { id: space.id, name: space.name }; });
      allTasks.push(...tasks);
    }

    await upsertTasks(allTasks);
    totalTasks += allTasks.length;
  }

  console.log(`\n📋 Total tasks synced: ${totalTasks}`);

  await updateProjectHealth(spaces);
  console.log('✅ ClickUp → Neon sync complete');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
