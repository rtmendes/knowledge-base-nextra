import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// Vercel → ClickUp Auto-Triage Webhook
// Endpoint: POST /api/webhooks/vercel
//
// Receives deployment.error events from Vercel, diagnoses
// the root cause with Groq (llama-3.1-8b-instant), then
// auto-creates a ClickUp task in the Blocked list.
// Logs every run to command_center.agent_runs in Neon.
//
// Self-healing: if Groq fails, ClickUp task is still created
// with "could not diagnose automatically" in the description.
// ============================================================

const CLICKUP_API_KEY   = process.env.CLICKUP_API_KEY!;
const GROQ_API_KEY      = process.env.GROQ_API_KEY
  ?? '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';
const DATABASE_URL      = process.env.DATABASE_URL
  ?? 'postgresql://neondb_owner:npg_b6laEvxfrUn5@ep-sweet-mountain-andfhxyb-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

// ClickUp list IDs
const BLOCKED_LIST_ID         = '901712867639';

const REVENUE_CRITICAL_PROJECTS = ['polsia', 'command-center', 'command_center'];

// ── Groq AI Diagnosis ─────────────────────────────────────────
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
              'You are a CI/CD expert. Given a Vercel deployment failure, respond with exactly ' +
              '1-2 sentences: the root cause and the most likely fix. Be specific and technical.',
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
    return (
      data.choices[0]?.message?.content?.trim() ??
      'Could not diagnose automatically.'
    );
  } catch (err) {
    console.error('[vercel-webhook] Groq diagnosis failed:', err);
    return 'Could not diagnose automatically — Groq API unavailable.';
  }
}

// ── ClickUp Task Creation ─────────────────────────────────────
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
      `*Auto-triaged at ${new Date().toISOString()} — no manual review required*`;

    const res = await fetch(
      `https://api.clickup.com/api/v2/list/${BLOCKED_LIST_ID}/task`,
      {
        method: 'POST',
        headers: {
          Authorization: CLICKUP_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `🚨 Vercel build failed: ${projectName}`,
          description,
          priority: isRevenueCritical ? 1 : 3,
          tags: ['vercel', 'build-failure', 'auto-triaged'],
          due_date_time: true,
          due_date:
            Date.now() + (isRevenueCritical ? 2 * 3_600_000 : 24 * 3_600_000),
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

// ── Neon DB Logging ───────────────────────────────────────────
// Uses fetch-based SQL (Neon HTTP driver) instead of pg module.
// This avoids the "Module not found: pg" build error entirely.
async function logToNeon(opts: {
  eventType: string;
  projectName: string;
  deploymentId: string;
  diagnosis: string;
  clickupTaskId: string | null;
  rawPayload: unknown;
}): Promise<void> {
  try {
    if (!DATABASE_URL) return;

    // Use Neon serverless HTTP endpoint for logging
    // Parse connection string to build the Neon HTTP URL
    const url = new URL(DATABASE_URL);
    const host = url.hostname;
    const httpUrl = `https://${host}/sql`;

    const res = await fetch(httpUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': DATABASE_URL,
      },
      body: JSON.stringify({
        query: `INSERT INTO command_center.agent_runs
          (event_type, project_name, deployment_id, diagnosis, clickup_task_id, raw_payload)
          VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
        params: [
          opts.eventType,
          opts.projectName,
          opts.deploymentId,
          opts.diagnosis,
          opts.clickupTaskId,
          JSON.stringify(opts.rawPayload),
        ],
      }),
    });

    if (res.ok) {
      console.log('[vercel-webhook] Logged to Neon ✓');
    } else {
      console.warn('[vercel-webhook] Neon logging failed:', res.status);
    }
  } catch (err) {
    // Non-fatal — Groq + ClickUp work fine without DB logging
    console.warn('[vercel-webhook] Neon logging skipped:', (err as Error).message);
  }
}

// ── Main POST Handler ─────────────────────────────────────────
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

  const inner      = (payload.payload ?? {}) as Record<string, unknown>;
  const deployment = (inner.deployment ?? payload.deployment ?? {}) as Record<string, unknown>;
  const project    = (inner.project    ?? payload.project    ?? {}) as Record<string, unknown>;

  const projectName: string =
    (project.name as string) ??
    (deployment.name as string) ??
    ((deployment.url as string | undefined)?.split('.')[0]) ??
    'unknown-project';

  const deploymentId: string = (deployment.id as string) ?? 'unknown';

  const deploymentLink: string =
    ((inner.links as Record<string, string> | undefined)?.deployment) ??
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
    `Target: ${inner.target ?? 'unknown'}`,
  ].join('\n');

  // 1. Diagnose with Groq (self-healing fallback built-in)
  const diagnosis = await diagnoseWithGroq(errorSummary);

  // 2. Create ClickUp task in Blocked list
  const clickupTaskId = await createClickUpTask({
    projectName,
    diagnosis,
    errorSummary,
    deploymentLink,
  });

  // 3. Log to Neon — fire-and-forget, never throws
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

// ── Health Check GET ──────────────────────────────────────────
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    endpoint: '/api/webhooks/vercel',
    description: 'Vercel deployment.error → Groq AI diagnosis → ClickUp Blocked list task',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
