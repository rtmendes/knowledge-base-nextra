import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Vercel → ClickUp Auto-Triage Webhook
// Receives deployment.error events, diagnoses with Groq,
// creates a ClickUp task in the Blocked list automatically.
// ============================================================

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY!;
const GROQ_API_KEY =
  process.env.GROQ_API_KEY ?? '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';
const DATABASE_URL =
  process.env.DATABASE_URL ??
  'postgresql://neondb_owner:npg_b6laEvxfrUn5@ep-sweet-mountain-andfhxyb-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const CLICKUP_BLOCKED_LIST_ID = '901712867639';
const REVENUE_CRITICAL_PROJECTS = ['polsia', 'command-center', 'command_center'];

// ── Groq diagnosis ────────────────────────────────────────────
async function diagnoseWithGroq(errorContext: string): Promise<string> {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'You are a CI/CD build error expert. Given a Vercel deployment failure, provide exactly 1-2 sentences: the root cause and the most likely fix. Be specific and technical.',
          },
          {
            role: 'user',
            content: `Diagnose this Vercel deployment failure:\n\n${errorContext}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.1,
      }),
    });
    if (!res.ok) throw new Error(`Groq HTTP ${res.status}`);
    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    return data.choices[0]?.message?.content?.trim() ?? 'Could not diagnose automatically.';
  } catch (err) {
    console.error('[vercel-webhook] Groq diagnosis failed:', err);
    return 'Could not diagnose automatically — Groq API unavailable.';
  }
}

// ── ClickUp task creation ─────────────────────────────────────
async function createClickUpTask(opts: {
  projectName: string;
  diagnosis: string;
  errorSummary: string;
  deploymentLink: string;
}): Promise<string | null> {
  try {
    const { projectName, diagnosis, errorSummary, deploymentLink } = opts;
    const isRevenueCritical = REVENUE_CRITICAL_PROJECTS.some((p) =>
      projectName.toLowerCase().includes(p)
    );

    const description =
      `## 🤖 AI Diagnosis\n${diagnosis}\n\n` +
      `## Build Context\n\`\`\`\n${errorSummary.slice(0, 2000)}\n\`\`\`\n\n` +
      `## Links\n- [View Failed Deployment on Vercel](${deploymentLink})\n\n` +
      `*Auto-triaged at ${new Date().toISOString()} — no human review required*`;

    const res = await fetch(
      `https://api.clickup.com/api/v2/list/${CLICKUP_BLOCKED_LIST_ID}/task`,
      {
        method: 'POST',
        headers: {
          Authorization: CLICKUP_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `🚨 Vercel build failed: ${projectName}`,
          description,
          priority: isRevenueCritical ? 1 : 3, // 1=urgent, 3=normal
          tags: ['vercel', 'build-failure', 'auto-triaged'],
          due_date_time: true,
          due_date: Date.now() + (isRevenueCritical ? 2 * 3_600_000 : 24 * 3_600_000),
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`ClickUp ${res.status}: ${text}`);
    }
    const task = (await res.json()) as { id: string; url: string };
    console.log(`[vercel-webhook] ClickUp task created: ${task.id} (${task.url})`);
    return task.id;
  } catch (err) {
    console.error('[vercel-webhook] ClickUp task creation failed:', err);
    return null;
  }
}

// ── Neon DB logging ───────────────────────────────────────────
// Requires: npm install pg @types/pg
// Auto-creates the table if it doesn't exist.
async function logToNeon(opts: {
  eventType: string;
  projectName: string;
  deploymentId: string;
  diagnosis: string;
  clickupTaskId: string | null;
  rawPayload: unknown;
}): Promise<void> {
  try {
    // Dynamic import — gracefully skipped if pg is not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Pool } = require('pg') as typeof import('pg');
    const pool = new Pool({ connectionString: DATABASE_URL });

    // Ensure table exists (idempotent)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS command_center.agent_runs (
        id           BIGSERIAL PRIMARY KEY,
        event_type   TEXT,
        project_name TEXT,
        deployment_id TEXT,
        diagnosis    TEXT,
        clickup_task_id TEXT,
        raw_payload  JSONB,
        created_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await pool.query(
      `INSERT INTO command_center.agent_runs
         (event_type, project_name, deployment_id, diagnosis, clickup_task_id, raw_payload, created_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, NOW())`,
      [
        opts.eventType,
        opts.projectName,
        opts.deploymentId,
        opts.diagnosis,
        opts.clickupTaskId,
        JSON.stringify(opts.rawPayload),
      ]
    );
    await pool.end();
    console.log('[vercel-webhook] Logged to Neon ✓');
  } catch (err) {
    // Non-fatal — Groq + ClickUp work without DB logging
    console.warn('[vercel-webhook] Neon logging skipped:', (err as Error).message);
  }
}

// ── Main POST handler ─────────────────────────────────────────
export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const payload = body as Record<string, unknown>;
  const eventType = (payload.type ?? payload.event_type ?? '') as string;

  // Only handle deployment failure events
  if (!['deployment.error', 'deployment.canceled'].includes(eventType)) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: 'not a deployment failure event',
    });
  }

  const deployment = ((payload.payload as Record<string, unknown>)?.deployment ??
    payload.deployment ??
    {}) as Record<string, unknown>;
  const project = ((payload.payload as Record<string, unknown>)?.project ??
    payload.project ??
    {}) as Record<string, unknown>;

  const projectName =
    (project.name as string) ??
    (deployment.name as string) ??
    ((deployment.url as string)?.split('.')[0]) ??
    'unknown-project';

  const deploymentId = (deployment.id as string) ?? 'unknown';

  const deploymentLink =
    ((payload.payload as Record<string, unknown>)?.links as Record<string, string>)?.deployment ??
    `https://vercel.com/deployments/${deploymentId}`;

  const meta = (deployment.meta ?? {}) as Record<string, string>;

  const errorSummary = [
    `Project: ${projectName}`,
    `Deployment ID: ${deploymentId}`,
    `State: ${deployment.state ?? 'ERROR'}`,
    `URL: ${deployment.url ?? ''}`,
    `Git ref: ${meta.githubCommitRef ?? meta.gitlabCommitRef ?? 'unknown'}`,
    `Commit: ${meta.githubCommitMessage ?? meta.gitlabCommitMessage ?? 'unknown'}`,
    `Error code: ${deployment.errorCode ?? 'none'}`,
    `Error message: ${deployment.errorMessage ?? 'none'}`,
    `Target: ${((payload.payload as Record<string, unknown>)?.target) ?? 'unknown'}`,
  ].join('\n');

  // Diagnose first (Groq), self-healing fallback if unavailable
  const diagnosis = await diagnoseWithGroq(errorSummary);

  // Create ClickUp task
  const clickupTaskId = await createClickUpTask({
    projectName,
    diagnosis,
    errorSummary,
    deploymentLink,
  });

  // Log to Neon — fire-and-forget, non-fatal
  void logToNeon({
    eventType,
    projectName,
    deploymentId,
    diagnosis,
    clickupTaskId,
    rawPayload: body,
  });

  console.log(
    `[vercel-webhook] ${eventType} for "${projectName}" → ClickUp task ${clickupTaskId ?? 'FAILED'}`
  );

  return NextResponse.json({
    ok: true,
    project: projectName,
    deploymentId,
    clickupTaskId,
    diagnosis,
  });
}

// ── Health check GET ──────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/webhooks/vercel',
    description: 'Vercel deployment.error → Groq AI diagnosis → ClickUp Blocked list task',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
