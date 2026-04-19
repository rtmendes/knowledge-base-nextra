#!/usr/bin/env python3
"""
Chief of Staff Agent
AGENT_ID: chief_of_staff_agent
ROLE: Chief of Staff — Operations Orchestrator
Notion spec: https://www.notion.so/308f57485e07804fb1dcd54136e6d14f
Genspark hub: https://www.genspark.ai/hub?id=915cf785-f050-4dcc-99c3-1a9130bcbd8b

AUTO_TRIGGERS: [weekly_ops_review, launch_countdown, blocker_detected, vendor_sla_breach]
RETURNS: {action_plan, briefs, status_report, blockers, escalations}
"""

import os
import json
import sys
import requests
from datetime import datetime, date, timezone

# ── Config ───────────────────────────────────────────────────────────────────
GROQ_API_KEY          = os.environ["GROQ_API_KEY"]
CLICKUP_TOKEN         = os.environ["CLICKUP_API_TOKEN"]
NOTION_TOKEN          = os.environ.get("NOTION_API_TOKEN", "")
NOTION_DAILY_LOG_ID   = os.environ.get("NOTION_DAILY_LOG_PAGE_ID", "")
VERCEL_TOKEN          = os.environ.get("VERCEL_TOKEN", "")
NEON_API_KEY          = os.environ.get("NEON_API_KEY", "")
GITHUB_TOKEN          = os.environ.get("GITHUB_TOKEN", "")
GITHUB_REPO           = os.environ.get("GITHUB_REPOSITORY", "rtmendes/knowledge-base-nextra")

# ClickUp lists (from PRD)
CLICKUP_LISTS = {
    "Revenue Critical": "901712867629",
    "Active Build":     "901712867634",
    "PRD Needed":       "901712867636",
    "Blocked":          "901712867639",
}

TODAY        = date.today()
NOW_UTC      = datetime.now(timezone.utc)
IS_MONDAY    = TODAY.weekday() == 0
BRIEFING_TYPE = os.environ.get("BRIEFING_TYPE", "weekly" if IS_MONDAY else "daily")

PROJECTS = [
    "Family Gift Studio / Shopify e-commerce",
    "Polsia AI platform",
    "PopeBot",
    "Aviation / Pilot Career",
    "Digital Offers",
    "Publication Writing Pipeline",
    "Second Spring",
    "Delta Jobs CRM",
]

# ── ClickUp ──────────────────────────────────────────────────────────────────
def get_clickup_tasks(list_id, list_name):
    url = f"https://api.clickup.com/api/v2/list/{list_id}/task"
    headers = {"Authorization": CLICKUP_TOKEN}
    params  = {"include_closed": "false", "page": 0, "subtasks": "true"}
    try:
        r = requests.get(url, headers=headers, params=params, timeout=15)
        r.raise_for_status()
        tasks = r.json().get("tasks", [])
    except Exception as e:
        print(f"  WARNING ClickUp error ({list_name}): {e}")
        return []
    result = []
    for t in tasks:
        due_ts = t.get("due_date")
        is_overdue = False
        if due_ts:
            try:
                is_overdue = int(due_ts) / 1000 < NOW_UTC.timestamp()
            except Exception:
                pass
        result.append({
            "list": list_name, "id": t["id"], "name": t["name"],
            "status": t["status"]["status"],
            "priority": (t.get("priority") or {}).get("priority", "none"),
            "due_date": due_ts, "is_overdue": is_overdue,
            "assignees": [a.get("username", "") for a in t.get("assignees", [])],
            "url": t.get("url", ""),
        })
    return result


def get_all_clickup_tasks():
    all_tasks = []
    for name, lid in CLICKUP_LISTS.items():
        tasks = get_clickup_tasks(lid, name)
        all_tasks.extend(tasks)
        print(f"  ClickUp [{name}]: {len(tasks)} tasks")
    return all_tasks

# ── GitHub Actions ────────────────────────────────────────────────────────────
def get_github_workflow_runs():
    if not GITHUB_TOKEN:
        return []
    url = f"https://api.github.com/repos/{GITHUB_REPO}/actions/runs"
    headers = {"Authorization": f"Bearer {GITHUB_TOKEN}",
               "Accept": "application/vnd.github+json",
               "X-GitHub-Api-Version": "2022-11-28"}
    try:
        r = requests.get(url, headers=headers, params={"per_page": 15}, timeout=15)
        r.raise_for_status()
        runs = r.json().get("workflow_runs", [])
    except Exception as e:
        print(f"  WARNING GitHub runs error: {e}")
        return []
    return [{"workflow": run["name"], "status": run["status"],
             "conclusion": run["conclusion"], "branch": run.get("head_branch",""),
             "created_at": run["created_at"], "url": run["html_url"]} for run in runs[:10]]

# ── Vercel ────────────────────────────────────────────────────────────────────
def get_vercel_deployments():
    if not VERCEL_TOKEN:
        return []
    url = "https://api.vercel.com/v6/deployments"
    headers = {"Authorization": f"Bearer {VERCEL_TOKEN}"}
    try:
        r = requests.get(url, headers=headers, params={"limit": 10}, timeout=15)
        r.raise_for_status()
        deployments = r.json().get("deployments", [])
    except Exception as e:
        print(f"  WARNING Vercel error: {e}")
        return []
    return [{"name": d.get("name"), "state": d.get("state"),
             "url": d.get("url"), "created": d.get("createdAt")} for d in deployments]

# ── Extension status (Genspark KB Extractor) ─────────────────────────────────
def get_extension_status():
    """
    Fetches live extension metrics from kb.insightprofit.live:
      - Current remote config version (indicates if config was recently updated)
      - Capture count from the import endpoint summary (if available)
    Falls back gracefully if endpoints are unavailable.
    """
    status = {
        "config_version": "unknown",
        "config_updated_at": "unknown",
        "capture_endpoint": "https://kb.insightprofit.live/api/import/genspark",
        "config_endpoint": "https://kb.insightprofit.live/api/extension-config",
        "note": "",
    }
    try:
        r = requests.get(
            "https://kb.insightprofit.live/api/extension-config",
            timeout=10,
        )
        if r.ok:
            cfg = r.json()
            status["config_version"] = cfg.get("configVersion", "unknown")
            status["config_updated_at"] = cfg.get("updatedAt", "unknown")
            features = cfg.get("features", {})
            status["auto_share_enabled"] = features.get("autoShare", False)
            status["skip_already_captured"] = features.get("skipAlreadyCaptured", False)
            status["timing_page_load_ms"] = cfg.get("timing", {}).get("pageLoadWait", "?")
    except Exception as e:
        status["note"] = f"Config fetch failed: {e}"

    # Optional: fetch capture summary from KB API
    try:
        r2 = requests.get(
            "https://kb.insightprofit.live/api/import/genspark",
            timeout=10,
        )
        if r2.ok:
            data = r2.json()
            status["total_captured"] = data.get("total", data.get("count", "unknown"))
    except Exception:
        pass  # summary endpoint may not be implemented yet

    return status

# ── Neon ──────────────────────────────────────────────────────────────────────
def get_neon_projects():
    if not NEON_API_KEY:
        return []
    url = "https://console.neon.tech/api/v2/projects"
    headers = {"Authorization": f"Bearer {NEON_API_KEY}"}
    try:
        r = requests.get(url, headers=headers, timeout=15)
        r.raise_for_status()
        projects = r.json().get("projects", [])
    except Exception as e:
        print(f"  WARNING Neon error: {e}")
        return []
    return [{"id": p["id"], "name": p["name"], "region": p.get("region_id",""),
             "created_at": p.get("created_at","")} for p in projects]

# ── Analysis ─────────────────────────────────────────────────────────────────
def detect_blockers(tasks):
    blockers = []
    for t in tasks:
        if t["list"] == "Blocked":
            blockers.append(dict(t, blocker_reason="In Blocked list"))
        elif t["is_overdue"]:
            blockers.append(dict(t, blocker_reason="OVERDUE"))
    return blockers

def detect_stalled(tasks):
    stalled_statuses = {"to do", "open", "not started", "backlog"}
    return [t for t in tasks if t["list"] == "Active Build"
            and t["status"].lower() in stalled_statuses]

def detect_paused_without_tracking(tasks):
    return [t for t in tasks if t["list"] == "Revenue Critical"
            and t["status"].lower() in {"to do", "open", "not started", "on hold", "paused"}]

# ── Groq synthesis ────────────────────────────────────────────────────────────
def synthesize_briefing(tasks, gh_runs, vercel, neon, blockers, stalled, paused, ext_status=None):
    payload = {
        "date": str(TODAY), "day_of_week": TODAY.strftime("%A"),
        "briefing_type": BRIEFING_TYPE, "goal": "$250,000 profit",
        "projects": PROJECTS,
        "clickup": {
            "total_tasks": len(tasks),
            "by_list": {k: len([t for t in tasks if t["list"] == k]) for k in CLICKUP_LISTS},
            "blockers": blockers[:10], "stalled": stalled[:8],
            "paused_no_tracking": paused[:8],
            "revenue_critical": [t for t in tasks if t["list"] == "Revenue Critical"][:10],
            "active_builds": [t for t in tasks if t["list"] == "Active Build"][:10],
        },
        "github_runs": gh_runs[:8], "vercel": vercel[:8], "neon_projects": neon,
        "extension_status": ext_status or {},
    }

    system_prompt = (
        "You are the Chief of Staff agent for Rashida Mendes, a solopreneur running 50+ projects "
        "across multiple businesses targeting $250k profit this year.\n\n"
        "AGENT_ID: chief_of_staff_agent\n"
        "ROLE: Chief of Staff - Operations Orchestrator\n"
        "MANDATE: Turn CEO priorities into an operating system that produces $1M+ outcomes.\n\n"
        "OUTPUT FORMAT (use these exact headers):\n"
        "## DAILY FOCUS\n(Top 3 specific priorities. Name the project and exact next action.)\n\n"
        "## BLOCKERS & ESCALATIONS\n(Anything needing immediate CEO attention.)\n\n"
        "## PROJECT STATUS\n(One line per project: On Track / At Risk / Blocked + reason.)\n\n"
        "## REVENUE PIPELINE\n(Status toward $250k goal. Flag anything off-track.)\n\n"
        "## SYSTEM HEALTH\n(GitHub Actions pass/fail, Vercel deployments, Neon DB.)\n\n"
        "## EXTENSION STATUS\n"
        "(Genspark KB Extractor: config version, auto-share state, capture count if available. "
        "Flag if config is stale (>3 days old) or if auto-share is disabled unexpectedly.)\n\n"
        "## ACTION ITEMS FOR CLICKUP\n(Tasks to create or move. Format: [LIST] Task name)\n\n"
        + ("## WEEKLY PLAN\n(Cross-project next steps for all 8 projects this week.)\n\n"
           if BRIEFING_TYPE == "weekly" else "")
        + "Be ruthlessly specific. No fluff. Name actual projects and tasks. "
          "Call out any project that has gone silent without a tracking task."
    )

    resp = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
        json={
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content":
                    f"Generate the {BRIEFING_TYPE} briefing for "
                    f"{TODAY.strftime('%A, %B %d, %Y')}.\n\n"
                    f"Data:\n{json.dumps(payload, indent=2, default=str)}"}
            ],
            "max_tokens": 2500, "temperature": 0.3,
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]

# ── Notion ────────────────────────────────────────────────────────────────────
def post_to_notion(briefing_text):
    if not NOTION_TOKEN or not NOTION_DAILY_LOG_ID:
        print("  WARNING NOTION_API_TOKEN or NOTION_DAILY_LOG_PAGE_ID not set - skipping")
        return None
    headers = {"Authorization": f"Bearer {NOTION_TOKEN}",
               "Notion-Version": "2022-06-28", "Content-Type": "application/json"}
    title = (f"{'Daily' if BRIEFING_TYPE == 'daily' else 'Weekly'} Briefing - "
             f"{TODAY.strftime('%A, %B %d, %Y')}")
    chunks = [briefing_text[i:i+1900] for i in range(0, len(briefing_text), 1900)]
    body = {
        "parent": {"page_id": NOTION_DAILY_LOG_ID},
        "properties": {"title": {"title": [{"text": {"content": title}}]}},
        "children": [
            {"object": "block", "type": "callout", "callout": {
                "icon": {"type": "emoji", "emoji": "🤖"},
                "rich_text": [{"type": "text", "text": {"content":
                    f"Chief of Staff Agent | {NOW_UTC.strftime('%H:%M UTC')} | Groq llama-3.3-70b"}}],
                "color": "blue_background"}},
            {"object": "block", "type": "divider", "divider": {}},
        ] + [{"object": "block", "type": "paragraph",
              "paragraph": {"rich_text": [{"type": "text", "text": {"content": c}}]}}
             for c in chunks],
    }
    try:
        r = requests.post("https://api.notion.com/v1/pages",
                          headers=headers, json=body, timeout=20)
        r.raise_for_status()
        page_url = r.json().get("url", "")
        print(f"  Notion page created: {page_url}")
        return page_url
    except Exception as e:
        print(f"  WARNING Notion post failed: {e}")
        return None

# ── ClickUp task creation ─────────────────────────────────────────────────────
def create_clickup_task(list_id, name, description, priority=2):
    url = f"https://api.clickup.com/api/v2/list/{list_id}/task"
    headers = {"Authorization": CLICKUP_TOKEN, "Content-Type": "application/json"}
    body = {"name": name[:255], "description": description, "priority": priority}
    try:
        r = requests.post(url, headers=headers, json=body, timeout=15)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"  WARNING ClickUp task create error: {e}")
        return {}

def create_blocker_tasks(blockers):
    for b in blockers[:5]:
        task = create_clickup_task(
            CLICKUP_LISTS["Blocked"],
            f"BLOCKER: {b['name'][:80]}",
            f"Auto-detected by Chief of Staff agent on {TODAY}.\n"
            f"Original task: {b['name']}\nList: {b['list']}\n"
            f"Reason: {b.get('blocker_reason','In Blocked list')}\nURL: {b.get('url','N/A')}",
            priority=1)
        print(f"  Blocker task created [{task.get('id','?')}]: {b['name'][:60]}")

def create_weekly_plan_task(briefing_text):
    task = create_clickup_task(
        CLICKUP_LISTS["Active Build"],
        f"Weekly Plan - {TODAY.strftime('%B %d, %Y')}",
        f"Chief of Staff Weekly Briefing\nGenerated: {NOW_UTC.isoformat()}\n\n{briefing_text[:4000]}",
        priority=1)
    print(f"  Weekly plan task created [{task.get('id','?')}]")

def create_paused_tracking_tasks(paused):
    for p in paused[:3]:
        task = create_clickup_task(
            CLICKUP_LISTS["Blocked"],
            f"PAUSED WITHOUT TRACKING: {p['name'][:80]}",
            f"Auto-flagged by Chief of Staff agent on {TODAY}.\n"
            f"Revenue Critical task appears paused with no active tracking.\n"
            f"Task: {p['name']}\nStatus: {p['status']}\nURL: {p.get('url','N/A')}\n\n"
            f"ACTION REQUIRED: Either restart this task or explicitly close it.",
            priority=2)
        print(f"  Paused-tracking task [{task.get('id','?')}]: {p['name'][:60]}")

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"\n{'='*60}")
    print(f"CHIEF OF STAFF AGENT")
    print(f"  Date: {TODAY.strftime('%A, %B %d, %Y')}")
    print(f"  Type: {BRIEFING_TYPE.upper()} briefing")
    print(f"  Goal: $250,000 profit")
    print(f"{'='*60}\n")

    print("Collecting data...")
    tasks      = get_all_clickup_tasks()
    gh_runs    = get_github_workflow_runs()
    vercel     = get_vercel_deployments()
    neon       = get_neon_projects()
    ext_status = get_extension_status()
    print(f"  Total ClickUp tasks: {len(tasks)} | GH runs: {len(gh_runs)} | Vercel: {len(vercel)} | Neon: {len(neon)}")
    print(f"  Extension config: v{ext_status.get('config_version','?')} (updated {ext_status.get('config_updated_at','?')})")

    print("\nAnalyzing...")
    blockers = detect_blockers(tasks)
    stalled  = detect_stalled(tasks)
    paused   = detect_paused_without_tracking(tasks)
    print(f"  Blockers: {len(blockers)} | Stalled: {len(stalled)} | Paused no-track: {len(paused)}")

    print("\nSynthesizing with Groq llama-3.3-70b-versatile...")
    briefing = synthesize_briefing(tasks, gh_runs, vercel, neon, blockers, stalled, paused, ext_status)
    print("\n" + "="*60)
    print(briefing)
    print("="*60 + "\n")

    print("Posting to Notion...")
    notion_url = post_to_notion(briefing)

    print("\nCreating ClickUp tasks...")
    if blockers:
        print(f"  Creating {min(len(blockers),5)} blocker tasks...")
        create_blocker_tasks(blockers)
    if paused:
        print(f"  Creating {min(len(paused),3)} paused-tracking tasks...")
        create_paused_tracking_tasks(paused)
    if IS_MONDAY or BRIEFING_TYPE == "weekly":
        print("  Creating weekly plan task...")
        create_weekly_plan_task(briefing)

    print(f"\n{'='*60}")
    print(f"COMPLETE: {len(tasks)} tasks reviewed, {len(blockers)} blockers flagged")
    if notion_url:
        print(f"Notion: {notion_url}")
    print(f"{'='*60}\n")
    sys.exit(0)

if __name__ == "__main__":
    main()
