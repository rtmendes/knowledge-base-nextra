// health-check.js
// Runs every 15 minutes via GitHub Actions.
// Pings configured URLs. If any return non-200, creates a ClickUp task
// in the "Blocked" list with failure details.

const {
  CLICKUP_API_KEY,
  CLICKUP_WORKSPACE_ID = '14233858',
  CLICKUP_BLOCKED_LIST_ID,
  HEALTH_CHECK_URLS = 'https://polsia-production.up.railway.app',
} = process.env;

if (!CLICKUP_API_KEY) {
  console.error('Missing required env var: CLICKUP_API_KEY');
  process.exit(1);
}

const URLS = HEALTH_CHECK_URLS.split(',').map(u => u.trim()).filter(Boolean);
const TIMEOUT_MS = 15_000;

// ── HTTP helpers ──────────────────────────────────────────────────────────────

async function checkUrl(url) {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': 'InsightProfit-HealthCheck/1.0' },
    });
    clearTimeout(timer);
    const latency = Date.now() - start;
    return { url, ok: res.ok, status: res.status, latency, error: null };
  } catch (err) {
    const latency = Date.now() - start;
    return { url, ok: false, status: 0, latency, error: err.message };
  }
}

// ── ClickUp helpers ───────────────────────────────────────────────────────────

async function clickupPost(path, body) {
  const res = await fetch(`https://api.clickup.com/api/v2${path}`, {
    method: 'POST',
    headers: { Authorization: CLICKUP_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`ClickUp POST ${path} → ${res.status} ${await res.text()}`);
    return null;
  }
  return res.json();
}

async function findBlockedList() {
  if (CLICKUP_BLOCKED_LIST_ID) return CLICKUP_BLOCKED_LIST_ID;
  // Fallback: search workspace for a list named "Blocked"
  const res = await fetch(
    `https://api.clickup.com/api/v2/team/${CLICKUP_WORKSPACE_ID}/task?statuses[]=blocked&page=0`,
    { headers: { Authorization: CLICKUP_API_KEY } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.tasks?.[0]?.list?.id || null;
}

async function createFailureTask(failures) {
  const listId = await findBlockedList();
  if (!listId) {
    console.warn('⚠️  No Blocked list found — logging failures to console only');
    failures.forEach(f => console.error(`  FAIL: ${f.url} → ${f.status || f.error}`));
    return;
  }

  const now = new Date().toISOString();
  const lines = failures.map(f =>
    `• ${f.url}\n  Status: ${f.status || 'timeout/error'}\n  Error: ${f.error || 'HTTP ' + f.status}\n  Latency: ${f.latency}ms`
  ).join('\n\n');

  const taskName = `🚨 Health Check Failure — ${failures.length} URL(s) down — ${now.slice(0, 16)}Z`;
  const description = `**Automated health check failed at ${now}**\n\nFailing endpoints:\n\n${lines}\n\n_Created by GitHub Actions health-check workflow._`;

  const task = await clickupPost(`/list/${listId}/task`, {
    name: taskName,
    description,
    priority: 1, // urgent
    tags: ['health-check', 'automated'],
  });

  if (task) {
    console.log(`🚨 ClickUp task created: ${task.url}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🏥 Health check starting — checking ${URLS.length} URL(s)…`);
  console.log('  URLs:', URLS.join(', '));

  const results = await Promise.all(URLS.map(checkUrl));

  results.forEach(r => {
    const icon = r.ok ? '✅' : '❌';
    console.log(`  ${icon} ${r.url} → ${r.status} (${r.latency}ms)${r.error ? ' | ' + r.error : ''}`);
  });

  const failures = results.filter(r => !r.ok);

  if (failures.length === 0) {
    console.log('\n✅ All endpoints healthy');
    return;
  }

  console.log(`\n🚨 ${failures.length} endpoint(s) failing — creating ClickUp task…`);
  await createFailureTask(failures);
  // Exit 0 so the workflow doesn't fail loudly (the ClickUp task IS the alert)
  // Change to process.exit(1) if you want GitHub to mark the run as failed too
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
