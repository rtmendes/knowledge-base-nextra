# Supabase Schema — https://supabase.insightprofit.live

> **Generated:** 2026-05-23T14:32:24.471Z
> **Discovery method:** PostgREST OpenAPI /rest/v1/ (tables only, rpc/ paths excluded)
> **Total tables:** 324
> **Schemas covered:** public
> **Total rows (all tables):** 76,345

---

## Summary

| Metric | Value |
|---|---|
| Total tables | 324 |
| Schemas | public |
| Total rows | 76,345 |
| KB CONTENT tables | 61 |
| OPERATIONAL tables | 67 |
| AI / RAG tables | 3 |
| AUTH / USER tables | 10 |
| OTHER tables | 183 |

### Top 5 tables by row count

| Rank | Table | Rows | Group |
|---|---|---|---|
| 1 | `public.infra_health_log` | 13,986 | OPERATIONAL |
| 2 | `public.app_health_checks` | 13,056 | OTHER |
| 3 | `public.knowledge_items` | 12,376 | KB_CONTENT |
| 4 | `public.n8n_event_log` | 8,704 | OPERATIONAL |
| 5 | `public.manus_tasks` | 5,072 | KB_CONTENT |

### KB CONTENT candidates (61 tables, 20,323 estimated rows)

| Table | Rows | Purpose |
|---|---|---|
| `public.knowledge_items` | 12,376 | KB content (name match) |
| `public.manus_tasks` | 5,072 | KB content (title + body/content columns) |
| `public.kb_item_tags` | 1,152 | KB content (name match) |
| `public.genspark_history` | 608 | KB content (title + body/content columns) |
| `public.kb_projects` | 181 | KB content (name match) |
| `public.kb_documents` | 165 | KB content (name match) |
| `public.app_documents` | 150 | KB content (name match) |
| `public.knowledge_base` | 100 | KB content (name match) |
| `public.audit_items` | 95 | KB content (name match) |
| `public.launch_assets` | 77 | KB content (title + body/content columns) |
| `public.launch_asset_summary` | 77 | KB content (title + body/content columns) |
| `public.kb_business_units` | 75 | KB content (name match) |
| `public.kb_tags` | 71 | KB content (name match) |
| `public.sl_posts` | 39 | KB content (name match) |
| `public.kb_categories` | 29 | KB content (name match) |
| `public.kb_analytics` | 20 | KB content (name match) |
| `public.decision_hub_items` | 17 | KB content (name match) |
| `public.knowledge_bus` | 4 | KB content (name match) |
| `public.pipeline_items` | 3 | KB content (name match) |
| `public.items` | 3 | KB content (name match) |
| `public.rp_documents` | 1 | KB content (name match) |
| `public.lifelegacy_articles` | 1 | KB content (name match) |
| `public.kb_automations` | 1 | KB content (name match) |
| `public.kb_workflows` | 1 | KB content (name match) |
| `public.v_kb_coverage` | 1 | KB content (name match) |
| `public.research_notes` | 1 | KB content (title + body/content columns) |
| `public.documents` | 1 | KB content (name match) |
| `public.kb_page_views` | 1 | KB content (name match) |
| `public.article_ideas` | 1 | KB content (name match) |
| `public.item_tags` | 0 | KB content (name match) |
| `public.publication_example_articles` | 0 | KB content (name match) |
| `public.kb_versions` | 0 | KB content (name match) |
| `public.ai_documents` | 0 | KB content (name match) |
| `public.kb_database_relations` | 0 | KB content (name match) |
| `public.knowledge_entries` | 0 | KB content (name match) |
| `public.content_blocks` | 0 | KB content (name match) |
| `public.kb_shared_links` | 0 | KB content (name match) |
| `public.kb_database_rows` | 0 | KB content (name match) |
| `public.vault_items` | 0 | KB content (name match) |
| `public.content_improvement_suggestions` | 0 | KB content (name match) |
| `public.rp_canvas_items` | 0 | KB content (name match) |
| `public.kb_workflow_runs` | 0 | KB content (name match) |
| `public.knowledge_item_versions` | 0 | KB content (name match) |
| `public.content_templates` | 0 | KB content (name match) |
| `public.brand_content` | 0 | KB content (name match) |
| `public.nav_item_placements` | 0 | KB content (name match) |
| `public.content_workflows` | 0 | KB content (name match) |
| `public.rp_references` | 0 | KB content (title + body/content columns) |
| `public.article_payments` | 0 | KB content (name match) |
| `public.articles` | 0 | KB content (name match) |
| `public.article_submissions` | 0 | KB content (name match) |
| `public.claude_code_sessions` | 0 | KB content (title + body/content columns) |
| `public.research_item_ai_extractions` | 0 | KB content (name match) |
| `public.ai_content_briefs` | 0 | KB content (name match) |
| `public.research_items` | 0 | KB content (name match) |
| `public.document_versions` | 0 | KB content (name match) |
| `public.kb_databases` | 0 | KB content (name match) |
| `public.social_posts` | 0 | KB content (name match) |
| `public.article_versions` | 0 | KB content (name match) |
| `public.kb_attachments` | 0 | KB content (name match) |
| `public.rp_versions` | 0 | KB content (title + body/content columns) |

---

## 🎯 PROBABLE KB CONTENT TABLES

### `public.knowledge_items` — 12,376 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (25) | `id` (uuid, not null), `user_id` (uuid, not null), `category_id` (uuid), `title` (text, not null), `slug` (text), `item_type` (text, not null), `content` (text), `content_plain` (text), `summary` (text), `tags` (jsonb), `use_cases` (jsonb), `bound_features` (jsonb), `bound_publications` (jsonb), `bound_brands` (jsonb), `auto_inject` (boolean), `injection_priority` (int32), `is_pinned` (boolean), `status` (text), `word_count` (int32), `current_version` (int32), `metadata` (jsonb), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null), `embedding` (public.vector(384)), `parent_id` (uuid) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "43cfe7f8-8cda-42cb-af6b-982b040e61eb",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "category_id": "9414366e-9dfd-419f-8168-c0f7492ec299",
  "title": "Aprilynne Alter",
  "slug": "aprilynne-alter-s2-108",
  "item_type": "inspiration",
  "content": "Source Sheet: YouTube Playlists & Subscriptions\nTab: Sheet10\nA Stronger Faith: Aprilynne Alter\nhttps://www.youtube.com/@AStrongerFaith: https://www.youtube.com/@AprilynneAlter\n@AStrongerFaith: @AprilynneAlter\nA podcast revealing the active presence of God in the lives of everyday people.: Your home for deep-dive YouTube breakdowns 🎬. Keep creating :)",
  "content_plain": "Source Sheet: YouTube Playlists & Subscriptions\nTab: Sheet10\nA Stronger Faith: Aprilynne Alter\nhttps://www.youtube.com/@AStrongerFaith: https://www.youtube.com/@AprilynneAlter\n@AStrongerFaith: @AprilynneAlter\nA podcast revealing the active presence of God in the lives of everyday people.: Your home for deep-dive YouTube breakdowns 🎬. Keep creating :)",
  "summary": "Source Sheet: YouTube Playlists & Subscriptions\nTab: Sheet10\nA Stronger Faith: Aprilynne Alter\nhttps://www.youtube.com/@AStrongerFaith: https://www.youtube.com/@AprilynneAlter\n@AStrongerFaith: @AprilynneAlter\nA podcast revealing the active presence...",
  "tags": [
    "youtube",
    "playlist",
    "fgs",
    "pod-inspiration",
    "subscription"
  ],
  "use_cases": [],
  "bound_features": [],
  "bound_publications": [],
  "bound_brands": [],
  "auto_inject": false,
  "injection_priority": 50,
  "is_pinned": false,
  "status": "active",
  "word_count": 41,
  "current_version": 1,
  "metadata": {
    "tab_name": "Sheet10",
    "row_index": 108,
    "source_sheet": "YouTube Playlists & Subscriptions"
  },
  "created_at": "2026-04-18T17:40:05.256242+00:00",
  "updated_at": "2026-04-23T16:41:28.550838+00:00",
  "embedding": "[-0.047076736,-0.056007452,0.045715783,-0.0441524,0.11321497,0.07437153,0.015120396,-0.0020580525,0.039985556,-0.03231439,-0.10201178,0.039216354,-0.01864112,-0.02289489,-0.0030365037,0.020392157,0.008808921,0.10304211,0.019969864,-0.062450845,-0.07567569,0.036001366,-0.01323994,0.07214609,0.04645979,-0.008933217,-0.0036673713,0.03313267,0.0132340295,-0.12891422,0.00070430426,-0.008704274,-0.020760452,-0.08406026,-0.09195248,0.029440625,0.015295558,0.057432182,-0.044251394,-0.02974929,0.055958137,0.017188463,0.040012572,-0.07249119,-0.03036113,-0.053715385,-0.12963574,-0.11325162,0.03649684,0.06720206,-0.12773813,-0.04293154,-0.008181085,-0.026241489,-0.04584343,-0.017859517,0.010931195,0.02072235,0.048336137,-0.06819189,0.12687851,-0.04562052,-0.011863229,0.02628611,0.00961346,0.01371387,0.031801634,0.067854196,-0.048685573,-0.03914532,-0.06425034,0.010676676,-0.05476586,0.023783404,0.019496137,-0.07776432,-0.036171064,-0.061373148,-0.027041504,-0.011145551,0.0007126478,-0.0063454485,-0.020084118,-0.010331932,-0.018467495,-0.0022567532,0.012917266,-0.039831307,0.025988659,0.01955982,-0.030685995,0.121877864,0.04371922,-0.016929658,0.021086762,0.024099914,-0.050000265,-0.11204422,-0.013181738,0.07729203,-0.0260146,0.090021044,-0.03905319,0.024039539,-0.007104924,-0.04419249,-0.05322264,-0.021825269,-0.010545075,-0.016672464,0.05649631,-0.012675721,-0.036800046,-0.123798355,0.073605165,0.062624484,-0.0018060224,-0.0015370495,-0.05315127,0.062164634,0.041983366,0.012718217,0.025795912,0.025494717,-0.0119229155,-0.022293184,-0.011868781,3.985132e-33,0.05434561,0.0015862447,0.084603034,0.09070399,0.13302466,-0.020068552,0.0037513454,0.021068167,-0.04925423,-0.091527045,0.015809337,0.107449286,0.0064638834,0.016345287,-0.08743583,-0.06837182,-0.080527365,-0.008310672,0.018484171,0.0219897,-0.022718182,0.041019596,-0.028167253,0.006585202,0.033188157,-0.034821216,0.035361595,-0.008652151,0.04304111,0.025564088,-0.03760295,-0.036896996,-0.009151725,-0.047678106,0.000368194,0.038983922,-0.09440018,-0.06382645,0.07554533,-0.03771472,-0.008971154,0.05974089,0.06690977,-0.036976587,-0.06530058,0.027264694,0.036458775,0.024356281,0.08725329,-0.025122833,0.0067757065,0.042851437,-0.08755726,-0.05593928,-0.055840317,-0.0005277365,-0.02825959,0.042286504,0.084917806,0.0013352952,-0.008172853,0.036537893,0.04413421,-0.02683495,-0.0045152395,-0.016319098,0.054962963,-0.018556993,0.030677821,0.022174353,-0.09101711,-0.003029809,0.03916825,-0.0073809996,-0.04078752,-0.062633775,-0.068667494,-0.11004266,-0.029708426,-0.007991183,0.03430227,0.013960688,0.03862806,0.0702062,0.0032923135,-0.08203546,0.012991473,-0.020061914,-0.052331433,-0.032695267,0.06839843,0.03452617,0.09609762,-0.061042037,-0.016253091,-3.0765044e-33,0.012745115,0.035700116,-0.03346056,0.03296859,0.08160378,0.009832174,-0.022430006,0.092826985,0.10438586,0.050004352,-0.007733116,-0.040095042,-0.01979679,-0.009114445,-0.11085367,-0.09986747,-0.024151228,0.03902276,-0.048698314,-0.079337575,-0.006472739,0.03364965,0.0066701407,-0.02121409,0.06308528,0.02360312,-0.027037203,0.09254096,0.0636671,-0.025194488,-0.0056418977,0.028369283,-0.093887284,-0.010178895,-0.0018869841,0.070851885,0.03744822,0.038062524,-0.032806806,-0.08762119,0.022487447,0.037451386,0.032344222,-0.027167525,0.000747646,0.039471343,-0.01024107,0.114720926,-0.10477836,-0.019968068,0.00689853,-0.02063111,0.016179057,0.0040735602,0.011921573,-0.00032601305,0.04383609,0.02375132,0.08468649,0.015884658,-0.053837914,0.016562702,0.028769884,0.013485699,-0.018685896,-0.062484574,0.039231632,0.11331746,-0.061030913,0.014751477,-0.027647784,-0.038714394,0.014063946,-0.0039348076,-0.040136214,0.066361435,0.056655325,-0.04828785,-0.01242437,-0.00066660595,-0.007326296,-0.02077762,-0.04509767,-0.010831488,0.092694044,0.090130836,0.0100122085,0.07555029,0.018980173,0.09475906,-0.0066262283,0.018154152,-0.05625607,0.024637194,0.024291897,-4.1122227e-08,-0.007941993,-0.03460898,-0.011158881,0.0076226937,0.013572632,0.002313288,0.1269259,-0.0566696,-0.044339646,0.004732515,0.032173146,-0.007761115,0.0188316,0.06495617,0.01890623,0.00050515565,0.01819048,0.044363085,-0.03407731,-0.024030294,-0.015691837,0.110893376,0.051296804,-0.16223823,0.006544483,0.030749435,-0.008826366,0.031186976,-0.009832159,-0.023600979,-0.015134273,0.06309704,-0.055415314,-0.06434286,-0.044679403,0.024839787,-0.026317375,0.039832357,-0.05293684,0.028490838,0.008986936,0.018093068,0.10763898,-0.0138198985,-0.089282036,-0.016811471,0.04958966,-0.09552571,0.023635944,-0.017567031,-0.057340823,-0.057703435,0.08298584,-0.042829502,-0.016985778,0.09453651,-0.067670785,0.06786592,0.009696433,-0.047584407,0.048879895,0.027449414,-0.007871378,0.079529755]",
  "parent_id": null
}
```

---

### `public.manus_tasks` — 5,072 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (title + body/content columns) |
| **Primary key** | `id` |
| **Columns** (13) | `id` (text, not null), `project_id` (text), `title` (text), `prompt` (text), `status` (text), `stop_reason` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `synced_at` (timestamp with time zone), `metadata` (jsonb), `output` (jsonb), `content_text` (text), `task_url` (text) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "8h3vaHcvxa7ZDq9Kxm4Crw",
  "project_id": null,
  "title": "How to Activate ThePopeBot for Use on YouTube?",
  "prompt": null,
  "status": "stopped",
  "stop_reason": "empty_subtask_no_output",
  "created_at": "2026-03-13T00:47:01+00:00",
  "updated_at": "2026-04-07T19:00:49+00:00",
  "synced_at": "2026-04-25T16:19:14.405094+00:00",
  "metadata": "{\"credit_usage\": 2516, \"task_type\": \"standard\", \"share_visibility\": \"private\"}",
  "output": [
    {
      "id": "VGysXnXCNS2o8Y7Mog2XUx",
      "role": "user",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "https://github.com/rtmendes/thepopebot can you make this a active app I can use here https://youtu.be/Kqk_i1rkWgg?si=sNbaEB2hVGDXGXtu",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "prb6SsXL6u7pJk5ErLRZqi",
      "role": "assistant",
      "type": "message",
      "status": "completed"
    },
    {
      "id": "ocWXgENYSgogXGA1CIJhx9",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "I've received your request to set up \"thepopebot\" for you. I'll examine the repository and the video to get it running as an active app.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "ViGeMD4EdNOUqWKzi8JcFY",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "I've analyzed the GitHub repository and the YouTube video. The Pope Bot is a powerful AI agent platform that can manage multiple agent roles (CTO, Developer, etc.) and integrate with GitHub and Telegram.\n\nTo get this running for you, I'll need to set up the environment, install dependencies, and configure the application. Since it requires API keys (Anthropic is mandatory), I'll set up the base application first and then guide you on how to provide your keys securely.\n\nStarting the setup now!",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "zhfe9gHmOJ0J991s7CEVZ4",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "Manus has encountered an unrecoverable error that it cannot recover from. Please try again.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "LU2qwkGvWmhmt2VqSljD89",
      "role": "user",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "continue",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "H70JvJUZ7faKSQwrcKv44z",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "I'm troubleshooting a minor database initialization issue. It looks like a configuration path isn't being picked up correctly during the server startup. I'm applying a fix now to ensure the app can create its local database and start up properly.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "Epe5EYO5MRbsswrVRszHOh",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "I have successfully deployed \"thepopebot\" for you! \n\nYou can access your active AI agent dashboard here:\nhttps://3000-ie72a9n0cjz9tlzgoc07s-f96371eb.us2.manus.computer\n\n**Initial Setup Steps:**\n1.  **Create Admin Account:** I've prepared the login page for you. Please visit the link and create your first admin account.\n2.  **Configure API Keys:** Once logged in, navigate to the **Settings** or **Admin** section to input your **Anthropic API Key** (required) and any other keys (OpenAI, Brave, etc.) you wish to use.\n3.  **GitHub Integration:** To enable the full agent capabilities (like the ones shown in the video), you'll need to provide a **GitHub Personal Access Token** in the settings.\n\nI've also attached a `.zip` file containing the full source code and configuration for your records or if you wish to self-host it elsewhere in the future.\n\nEnjoy your new autonomous AI agent platform!",
          "type": "output_text"
        },
        {
          "type": "output_file",
          "fileUrl": "https://private-us-east-1.manuscdn.com/sessionFile/8h3vaHcvxa7ZDq9Kxm4Crw/sandbox/8Y8WtZk6tk5nlUWiYAahq5_1773852017828_na1fn_L2hvbWUvdWJ1bnR1L3RoZXBvcGVib3RfYXBw.zip?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvOGgzdmFIY3Z4YTdaRHE5S3htNENydy9zYW5kYm94LzhZOFd0Wms2dGs1bmxVV2lZQWFocTVfMTc3Mzg1MjAxNzgyOF9uYTFmbl9MMmh2YldVdmRXSjFiblIxTDNSb1pYQnZjR1ZpYjNSZllYQncuemlwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=sW4oJy0-b7xRXC93ODxjrlGqVntJ4EsgWwKH1vAi6RlvdN7kQkhWeJHTIhMegDnGdn4IbdUIaiMQiAWsWSqduDb7PKYEXuHLeqJPFSUGyIwILpdZ~9lrYJ6tyG94BOKfwXwFQzGMFfC3Gu3TAiMnbMlQRxxhtkTT48guqXw8tVY4os79tb5r0klWbuoNGhzf77CuVDHOz4ldDXcnQJHD9881PmeLQq00clBXi5TSRM1TfBGJUEEbPXlX5zztM-329PpQT5gZdRFOc~A8m4jhx1WFHVgcO3CaoRrwqAF9IeACn4l5JBotHBH-bEUPIP5iFzjc6iZB4FasiFTyb1APYw__",
          "fileName": "thepopebot_app.zip",
          "mimeType": "application/zip"
        }
      ]
    },
    {
      "id": "QWpW6noAqrR2z9VloMNCjQ",
      "role": "user",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "Turn it into a permanent website.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "eIKW4VpElZbfU6jMcfJlN9",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "I'll get started on making this a permanent website for you. I'll need to set up a more robust deployment and ensure all configurations are properly handled for a permanent environment. I'll update you as I progress.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "VkRxRbsapJQMtTxV4349uB",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "I'm now building ThePopeBot as a full production web application. This will be a comprehensive AI agent management platform with:\n\n- Admin dashboard with sidebar navigation\n- Chat interface with LLM streaming\n- Agent cluster management\n- Cron job scheduler\n- GitHub integration settings\n- Webhook trigger management\n- Notifications system\n- Code workspace\n\nI'll start by designing the database schema and architecture, then build out all the features. This is a substantial application so it will take some time to build properly.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "xBOjrHnqbaVPhQ8YMPkDwM",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "I've analyzed the full project scaffold. Now I'll build the complete application. Starting with the database schema, then backend routers, and finally the full frontend. This is a large build - I'll work through it systematically.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "mZAFcNWteukqfSQT7CpVFd",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "Backend and dashboard layout are complete. Now building all the frontend pages - Dashboard, Agents, Clusters, Chat, Cron Jobs, Webhooks, API Keys, GitHub, Users, Notifications, Code Workspace, and Settings. This is the largest phase of the build.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "h6epZvSKRGFklp4yyPVyVc",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "All TypeScript errors are resolved. All 12 pages are built and compiling cleanly. Now I'll update the todo, check the app status, and move on to writing tests.",
          "type": "output_text"
        }
      ]
    },
    {
      "id": "ozFiUQHZKMzEzsFwXwJC6S",
      "role": "assistant",
      "type": "message",
      "status": "completed",
      "content": [
        {
          "text": "Manus has encountered an unrecoverable error that it cannot recover from. Please try again.",
          "type": "output_text"
        }
      ]
    }
  ],
  "content_text": "I've received your request to set up \"thepopebot\" for you. I'll examine the repository and the video to get it running as an active app.\n\nI've analyzed the GitHub repository and the YouTube video. The Pope Bot is a powerful AI agent platform that can manage multiple agent roles (CTO, Developer, etc.) and integrate with GitHub and Telegram.\n\nTo get this running for you, I'll need to set up the environment, install dependencies, and configure the application. Since it requires API keys (Anthropic is mandatory), I'll set up the base application first and then guide you on how to provide your keys securely.\n\nStarting the setup now!\n\nManus has encountered an unrecoverable error that it cannot recover from. Please try again.\n\nI'm troubleshooting a minor database initialization issue. It looks like a configuration path isn't being picked up correctly during the server startup. I'm applying a fix now to ensure the app can create its local database and start up properly.\n\nI have successfully deployed \"thepopebot\" for you! \n\nYou can access your active AI agent dashboard here:\nhttps://3000-ie72a9n0cjz9tlzgoc07s-f96371eb.us2.manus.computer\n\n**Initial Setup Steps:**\n1.  **Create Admin Account:** I've prepared the login page for you. Please visit the link and create your first admin account.\n2.  **Configure API Keys:** Once logged in, navigate to the **Settings** or **Admin** section to input your **Anthropic API Key** (required) and any other keys (OpenAI, Brave, etc.) you wish to use.\n3.  **GitHub Integration:** To enable the full agent capabilities (like the ones shown in the video), you'll need to provide a **GitHub Personal Access Token** in the settings.\n\nI've also attached a `.zip` file containing the full source code and configuration for your records or if you wish to self-host it elsewhere in the future.\n\nEnjoy your new autonomous AI agent platform!\n\nI'll get started on making this a permanent website for you. I'll need to set up a more robust deployment and ensure all configurations are properly handled for a permanent environment. I'll update you as I progress.\n\nI'm now building ThePopeBot as a full production web application. This will be a comprehensive AI agent management platform with:\n\n- Admin dashboard with sidebar navigation\n- Chat interface with LLM streaming\n- Agent cluster management\n- Cron job scheduler\n- GitHub integration settings\n- Webhook trigger management\n- Notifications system\n- Code workspace\n\nI'll start by designing the database schema and architecture, then build out all the features. This is a substantial application so it will take some time to build properly.\n\nI've analyzed the full project scaffold. Now I'll build the complete application. Starting with the database schema, then backend routers, and finally the full frontend. This is a large build - I'll work through it systematically.\n\nBackend and dashboard layout are complete. Now building all the frontend pages - Dashboard, Agents, Clusters, Chat, Cron Jobs, Webhooks, API Keys, GitHub, Users, Notifications, Code Workspace, and Settings. This is the largest phase of the build.\n\nAll TypeScript errors are resolved. All 12 pages are built and compiling cleanly. Now I'll update the todo, check the app status, and move on to writing tests.\n\nManus has encountered an unrecoverable error that it cannot recover from. Please try again.",
  "task_url": "https://manus.im/app/8h3vaHcvxa7ZDq9Kxm4Crw"
}
```

---

### `public.kb_item_tags` — 1,152 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `item_id` (text, not null), `item_source` (text, not null), `tag_id` (uuid, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "39156780-18a0-429a-879c-7c576f18bce0",
  "item_id": "03232cc7-3ed0-42f5-9627-37f95f6468b9",
  "item_source": "genspark",
  "tag_id": "21c27d72-4241-47c2-9e47-c14d18f39718",
  "created_at": "2026-03-21T09:58:03.462901+00:00"
}
```

---

### `public.genspark_history` — 608 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (title + body/content columns) |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `title` (text), `type` (text), `ctime` (timestamp with time zone), `raw_url` (text), `key` (text), `agent_type` (text), `synced_at` (timestamp with time zone), `content` (text), `content_scraped_at` (timestamp with time zone), `notes` (text), `notes_updated_at` (timestamp with time zone), `archived_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "03232cc7-3ed0-42f5-9627-37f95f6468b9",
  "title": "Addition and Mathematical Operations Workspace",
  "type": "agent",
  "ctime": "2026-03-11T22:02:38.418575+00:00",
  "raw_url": "https://www.genspark.ai/agents?id=fae90c6a-d508-4bdd-985f-56817859b0fc",
  "key": "[REDACTED]",
  "agent_type": "super_agent",
  "synced_at": "2026-03-20T01:27:17.594647+00:00",
  "content": "New Super AgentHomeInboxWorkflowsTeamsHubAI Drive14%Addition and Mathematical Operations WorkspaceShare\n```\n+\n```\n\nUsing Tool|ThinkThe user just typed \"+\" which is very minimal input. This could mean they want to continue from a previous conversation, or they're testing something, or they want me to add something. Since there's no previous context in this conversation, I should ask for clarification about what they need. However, looking at the user profile, they are a SaaS founder, digital marketer, ecommerce product developer, copywriter, journalist, author, digital offer course creator, and YouTuber. \n\nThe \"+\" could mean \"more\" or \"continue\" or \"add to\" something. Since this is a new chat, I should welcome them and ask what they'd like to work on today, while also initializing their knowledge base document as per their instructions (\"for each new chat create a knowledge base document to update and store all the additional pages and output as we iterate and produce new documents in that chat thread\").\n# 👋 Welcome Back — New Session Initialized\n\n\nIt looks like you started a new chat with just a **\"+\"** — which I'm reading as *\"I'm ready, let's go.\"*\n\n\n---\n\n\n## 🗂️ Session Knowledge Base — Initialized\n\n\n**Chat KB ID:** `KB-2026-03-11` | Status: 🟢 Active\n\n\n| Section | Status | Description |\n| --- | --- | --- |\n| Session Log | 🟡 Pending | Will auto-populate as we work |\n| Deliverables | 🟡 Pending | All outputs catalogued here |\n| Resources & Citations | 🟡 Pending | Fact-checked sources logged |\n| SOPs Generated | 🟡 Pending | Step-by-step tables stored |\n| Assets Created | 🟡 Pending | Images, charts, infographics |\n\n\n---\n\n\n## 🎯 What Are We Building Today?\n\n\nBased on your profile, here are the **most common high-leverage starting points** — just pick a number or describe your mission:\n\n\n| # | Focus Area | What We Can Build |\n| --- | --- | --- |\n| 1 | 🚀 SaaS Growth | Funnel, pricing page copy, onboarding flow, email sequences |\n| 2 | 📢 Digital Marketing | Campaign strategy, ad copy, content calendar, landing page |\n| 3 | 🛒 Ecommerce | Product listing optimization, offer stack, conversion flow |\n| 4 | ✍️ Copywriting / Content | Sales page, VSL script, email, article, or lead magnet |\n| 5 | 🎓 Course / Digital Offer | Course outline, launch plan, sales funnel, pricing strategy |\n| 6 | 🎥 YouTube | Video strategy, script, thumbnail brief, channel growth plan |\n| 7 | 📰 Journalism / Research | Deep research article, fact-checked report, content brief |\n| 8 | 💡 Custom | Just tell me what you're working on |\n\n\n---\n\n\n**What's the mission?** Drop your idea, project, or problem and I'll get to work immediately. 🔥\n\n\nHelp me write a professional business proposalCreate a social media content calendar for my brandI need a step-by-step guide for learning a new skillSearch for the latest trends in AI and technologySuper AgentGenspark Claw50% off![Tool Icon](https://cdn1.genspark.ai/user-upload-image/manual/icons/custom_tools/gmail_icon.svg)![Tool Icon](https://cdn1.genspark.ai/user-upload-image/manual/icons/custom_tools/google_drive_icon.svg)+13\n\n---\n## 🖼 Embedded Iframes\n\n- https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6LfYyWcsAAAAAK8DUr6Oo1wHl2CJ5kKbO0AK3LIM&co=aHR0cHM6Ly93d3cuZ2Vuc3BhcmsuYWk6NDQz&hl=en&v=qm3PSRIx10pekcnS9DjGnjPW&size=invisible&anchor-ms=20000&execute-ms=30000&cb=celha5tn2qst",
  "content_scraped_at": "2026-03-20T20:15:54.916+00:00",
  "notes": null,
  "notes_updated_at": null,
  "archived_at": null
}
```

---

### `public.kb_projects` — 181 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `user_id` (uuid, not null), `name` (text, not null), `slug` (text, not null), `description` (text), `platform` (text, not null), `category` (text, not null), `status` (text, not null), `source_url` (text), `credits_used` (int32), `last_updated` (text), `tags` (jsonb), `metadata` (jsonb), `page_id` (uuid), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "bc238243-70be-4fe0-85f2-bf5a6fe787b7",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "name": "Genspark project 1",
  "slug": "genspark-demo-mo37d45u-1",
  "description": "Demo genspark project 1 (seed)",
  "platform": "genspark",
  "category": "ops",
  "status": "completed",
  "source_url": null,
  "credits_used": 13,
  "last_updated": "2026-04-17",
  "tags": [
    "genspark",
    "demo"
  ],
  "metadata": {
    "seed": true,
    "index": 1
  },
  "page_id": null,
  "created_at": "2026-04-17T17:49:14.327144+00:00"
}
```

---

### `public.kb_documents` — 165 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `title` (text, not null), `doc_type` (text, not null), `content` (text, not null), `source_item_id` (text), `source_type` (text), `tag_names` (text[], not null), `extracted_by` (text, not null), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "caef23c9-9ff4-4c85-8bee-34878911707d",
  "title": "Creating High-Converting Advertorials and VSLs for Delete Me",
  "doc_type": "marketing_brief",
  "content": "Got it! I'll create a top 1% converting advertorial and VSL script for Delete Me's privacy platform. Let me first research the platform, analyze the top 20 demographic and psychographic customer avatars, and then craft mentalist-level copy using the problem-solution-awareness matrix for maximum conversion.\n\nI've created a comprehensive, top 1% converting affiliate marketing package for DeleteMe. The deliverables include:\n\n**1. Complete Marketing Package** - A master document combining all assets with implementation guidance.\n\n**2. Top 20 Customer Avatars** - Detailed demographic and psychographic profiles ranked by conversion potential, from Safety-Critical (stalking/DV survivors) to Proactive Protection (tech-savvy millennials, remote workers).\n\n**3. Problem-Solution-Awareness Matrix** - A mentalist-level copywriting framework using Eugene Schwartz's awareness levels combined with the \"Invisible Threat\" psychological technique that demonstrates omniscience, creates cognitive dissonance, and provides the escape route.\n\n**4. High-Converting Advertorial** - \"The Invisible Threat: How A Single Google Search Could Destroy Your Life\" - A narrative-driven advertorial in the Chris Haddad/Alen Sultanic style with emotional hooks, social proof cascade, and urgency drivers.\n\n**5. VSL Script** - A 2:20 minute video sales letter script in the Jason Fladlien/Frank Kern style with precise timing, visual directions, and audio cues. Structured using the 10-part VSL formula (shocking statement → problem → agitate → push over the line → solution → credibility → proof → what you get → urgency → close).\n\n**Key Conversion Psychology Applied:**\n- Loss aversion (emphasizing what they'll lose, not just gain)\n- Future pacing (painting the peaceful, invisible future)\n- Social proof cascade (NYT, CNET, 100M+ removals)\n- Cognitive dissonance (\"You lock your doors but leave your data unlocked\")\n- Urgency amplification (\"Your data is being sold right now\")\n\nThe materials are ready for native advertising, landing pages, email marketing, and video production.",
  "source_item_id": "SM2jcnoMuohTuummhNmBrR",
  "source_type": "manus",
  "tag_names": [],
  "extracted_by": "auto-sync",
  "created_at": "2026-03-23T16:51:18.434634+00:00",
  "updated_at": "2026-03-23T16:51:18.434634+00:00"
}
```

---

### `public.app_documents` — 150 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `app_id` (uuid), `app_name` (text, not null), `doc_type` (text, not null), `title` (text, not null), `content` (text, not null), `version` (text), `status` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "bb2ae01a-214e-4d71-8f67-586cf2a1a542",
  "app_id": "9ea3d308-0b1a-4074-b249-faf961ddf165",
  "app_name": "Revenue Intelligence Engine",
  "doc_type": "kb",
  "title": "KB: Revenue Intelligence Engine",
  "content": "# KB: Revenue Intelligence Engine\n## Domain Intelligence & Reference v2.0\n\n### Sales Methodology Quick Reference\n**MEDDIC:** Metrics | Economic Buyer | Decision Criteria | Decision Process | Identify Pain | Champion\n**SPICED:** Situation | Pain | Impact | Critical Event | Explore | Decision\n**BANT:** Budget | Authority | Need | Timeline\n\n### Industry Benchmarks\n| Metric | B2B SaaS | E-commerce | Agency |\n|--------|----------|------------|--------|\n| Deal size | $15-50K | $500-5K | $3-15K |\n| Sales cycle | 30-90 days | 1-7 days | 14-45 days |\n| Win rate | 20-30% | 2-5% CVR | 25-40% |\n\n### Objection Handling\n| Objection | Framework |\n|-----------|-----------|\n| Too expensive | Value stack: quantify ROI vs cost of inaction |\n| Not the right time | Identify critical event, calculate delay cost |\n| Have a solution | Competitive positioning, identify gaps |\n| Need to think | Isolate real objection, risk reversal |\n\n### Forecasting Models\n- Weighted Pipeline: Stage probability × deal value\n- Historical Pattern: Similar deal characteristics\n- Rep-Adjusted: Individual accuracy calibration\n- Ensemble: Weighted average of all three\n\n---\n*Viktor AI · InsightProfit · v2.0*",
  "version": "2.0",
  "status": "enriched",
  "created_at": "2026-05-12T01:06:40.801592+00:00",
  "updated_at": "2026-05-12T01:06:40.801592+00:00"
}
```

---

### `public.knowledge_base` — 100 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `project_name` (text, not null), `category` (text, not null), `original_url` (text, not null), `page_title` (text), `cloned_html` (text), `markdown_summary` (text), `word_count` (int32), `created_at` (timestamp with time zone), `notion_page_id` (text), `source` (text), `last_synced_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "586939b5-5c0d-4d39-b91c-994c5718fe7b",
  "project_name": "Test",
  "category": "AI News",
  "original_url": "https://www.reuters.com/technology/artificial-intelligence/",
  "page_title": "AI News | Latest Headlines and Developments | Reuters",
  "cloned_html": "<div id=\"readability-page-1\" class=\"page\"><div data-testid=\"SiteFooter\" lang=\"en\" dir=\"ltr\"><section><h3 data-testid=\"SiteIndexHeading\">Site Index</h3><div><section data-testid=\"LinkGroup\"><h3 data-testid=\"Heading\">Latest</h3><ul><li><a data-testid=\"Link\" ui_element_category=\"Latest\" target=\"_self\" href=\"https://www.reuters.com/\"><span data-testid=\"LinkGroupItem\">Home</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Latest\" target=\"_self\" href=\"https://www.reuters.com/sitemap/authors/\"><span data-testid=\"LinkGroupItem\">Authors</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Latest\" target=\"_self\" href=\"https://www.reuters.com/sitemap/topics/\"><span data-testid=\"LinkGroupItem\">Topic Sitemap</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Latest\" target=\"_self\" href=\"https://www.reuters.com/archive/\"><span data-testid=\"LinkGroupItem\">Archive</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Latest\" target=\"_self\" href=\"https://www.reuters.com/sitemap/\"><span data-testid=\"LinkGroupItem\">Article Sitemap</span></a></li></ul></section><section data-testid=\"LinkGroup\"><h3 data-testid=\"Heading\">Browse</h3><ul><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/world/\"><span data-testid=\"LinkGroupItem\">World</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/business/\"><span data-testid=\"LinkGroupItem\">Business</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/markets/\"><span data-testid=\"LinkGroupItem\">Markets</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/sustainability/\"><span data-testid=\"LinkGroupItem\">Sustainability</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/legal/\"><span data-testid=\"LinkGroupItem\">Legal</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/breakingviews/\"><span data-testid=\"LinkGroupItem\">Breakingviews</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/technology/\"><span data-testid=\"LinkGroupItem\">Technology</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/investigations/\"><span data-testid=\"LinkGroupItem\">Investigations</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/sports/\"><span data-testid=\"LinkGroupItem\">Sports</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/science/\"><span data-testid=\"LinkGroupItem\">Science</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Browse\" target=\"_self\" href=\"https://www.reuters.com/lifestyle/\"><span data-testid=\"LinkGroupItem\">Lifestyle</span></a></li></ul></section><section data-testid=\"LinkGroup\"><h3 data-testid=\"Heading\">Media</h3><ul><li><a data-testid=\"Link\" ui_element_category=\"Media\" target=\"_self\" href=\"https://www.reuters.com/video/\"><span data-testid=\"LinkGroupItem\">Videos</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Media\" target=\"_self\" href=\"https://www.reuters.com/pictures/\"><span data-testid=\"LinkGroupItem\">Pictures</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Media\" target=\"_self\" href=\"https://www.reuters.com/graphics/\"><span data-testid=\"LinkGroupItem\">Graphics</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Media\" target=\"_self\" href=\"https://www.reuters.com/podcasts/\"><span data-testid=\"LinkGroupItem\">Podcasts</span></a></li></ul></section><div><section data-testid=\"LinkGroup\"><h3 data-testid=\"Heading\">About Reuters</h3><ul><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://reutersagency.com/about/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">About Reuters</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://www.reuters.com/media-center/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Media Center</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://www.reutersprofessional.com/advertise-with-us/p/1\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Advertise with Us</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/careers\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Careers</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://reutersagency.com/?utm_source=website&amp;utm_medium=reuters&amp;utm_campaign=site-referral&amp;utm_content=us&amp;utm_term=0\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Reuters News Agency</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://reutersagency.com/brand-attribution-guidelines/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Brand Attribution Guidelines</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://www.reuters.com/info-pages/reuters-and-ai/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Reuters and AI</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://reutersagency.com/about/leadership-team/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Reuters Leadership</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_self\" href=\"https://www.reuters.com/fact-check/\"><span data-testid=\"LinkGroupItem\">Reuters Fact Check</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://www.reuters.com/graphics/DIVERSITY-REPORT/2024/xmpjbgdrapr/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Reuters Diversity Report</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"About Reuters\" target=\"_blank\" href=\"https://www.reuters.com/info-pages/commercial-disclosure/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Commercial Disclosure (Japan)</span><span>, opens new tab</span></a></li></ul></section><section data-testid=\"LinkGroup\"><h3 data-testid=\"Heading\">Stay Informed</h3><ul><li><a data-testid=\"Link\" ui_element_category=\"Stay Informed\" target=\"_blank\" href=\"https://apps.apple.com/app/reuters-news/id602660809\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Download the App (iOS)</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Stay Informed\" target=\"_blank\" href=\"https://play.google.com/store/apps/details?id=com.thomsonreuters.reuters\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Download the App (Android)</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Stay Informed\" target=\"_self\" href=\"https://www.reuters.com/newsletters/\"><span data-testid=\"LinkGroupItem\">Newsletters</span></a></li><li><a data-testid=\"Link\" ui_element_category=\"Stay Informed\" target=\"_self\" href=\"https://www.reuters.com/subscribe/offer/?journeyStart=Footer\"><span data-testid=\"LinkGroupItem\">Subscribe</span></a></li></ul></section></div></div></section><div><h3 data-testid=\"Heading\">Information you can trust</h3><p data-testid=\"Body\">Reuters, the news and media division of Thomson Reuters, is the world’s largest multimedia news provider, reaching billions of people worldwide every day. Reuters provides business, financial, national and international news to professionals via desktop terminals, the world's media organizations, industry events and directly to consumers.</p></div><div data-testid=\"ProductCards\"><h3 data-testid=\"Heading\">LSEG Products</h3><ul><li><h4 data-testid=\"ProductCardItem\"><div><p><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.lseg.com/en/data-analytics/products/workspace?utm_source=reuters.com&amp;utm_medium=footer&amp;utm_campaign=Reuters_ProductPage_Links\" rel=\"noopener\"><span><span> Workspace</span><span>, opens new tab</span></span></a></p><p data-testid=\"Body\">Access unmatched financial data, news and content in a highly-customised workflow experience on desktop, web and mobile.</p></div></h4></li><li><h4 data-testid=\"ProductCardItem\"><div><p><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.lseg.com/en/data-analytics/financial-data/?utm_source=reuters.com&amp;utm_medium=footer&amp;utm_campaign=Reuters_DataCatalogPage_Links\" rel=\"noopener\">Data<span><span> Catalogue</span><span>, opens new tab</span></span></a></p><p data-testid=\"Body\"> Browse an unrivalled portfolio of real-time and historical market data and insights from worldwide sources and experts.</p></div></h4></li><li><h4 data-testid=\"ProductCardItem\"><div><p><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.lseg.com/en/risk-intelligence/screening-solutions/world-check-kyc-screening?utm_source=reuters.com&amp;utm_medium=footer&amp;utm_campaign=Reuters_ProductPage_Links\" rel=\"noopener\"><span><span> World-Check</span><span>, opens new tab</span></span></a></p><p data-testid=\"Body\">Screen for heightened risk individual and entities globally to help uncover hidden risks in business relationships and human networks.</p></div></h4></li></ul></div><div><section data-testid=\"LinkGroup\"><ul><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.reutersprofessional.com/advertising-solutions/p/1\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Advertise With Us</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_self\" href=\"https://www.reuters.com/info-pages/advertising-guidelines/\"><span data-testid=\"LinkGroupItem\">Advertising Guidelines</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.reutersagency.com/en/licensereuterscontent/?utm_medium=rcom-footer&amp;utm_campaign=rcom-rcp-lead\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Purchase Licensing Rights</span><span>, opens new tab</span></a></li></ul></section><section data-testid=\"LinkGroup\"><ul><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/privacy-statement.html#cookies\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Cookies</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_self\" href=\"https://www.reuters.com/info-pages/terms-of-use/\"><span data-testid=\"LinkGroupItem\">Terms &amp; Conditions</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/privacy-statement.html\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Privacy</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/policies/copyright\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Copyright</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/policies/digital-accessibility-policy.html\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Digital Accessibility</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_self\" href=\"https://www.reuters.com/info-pages/contact-us/\"><span data-testid=\"LinkGroupItem\">Corrections</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.reuters.com/info-pages/data-disclosure-and-sources/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Data Disclosure and Sources</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://trdigital.iad1.qualtrics.com/jfe/form/SV_8kte8gArGyCGVhz\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Site Feedback</span><span>, opens new tab</span></a></li></ul></section><p data-testid=\"DisclaimerLink\">All quotes delayed a minimum of 15 minutes. <a data-testid=\"Link\" href=\"https://www.reuters.com/info-pages/disclaimer/\">See here for a list of exchanges and delays.</a></p><section data-testid=\"LinkGroup\"><ul><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/privacy-statement.html#cookies\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Cookies</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_self\" href=\"https://www.reuters.com/info-pages/terms-of-use/\"><span data-testid=\"LinkGroupItem\">Terms &amp; Conditions</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/privacy-statement.html\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Privacy</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/policies/copyright\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Copyright</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.thomsonreuters.com/en/policies/digital-accessibility-policy.html\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Digital Accessibility</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_self\" href=\"https://www.reuters.com/info-pages/contact-us/\"><span data-testid=\"LinkGroupItem\">Corrections</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://www.reuters.com/info-pages/data-disclosure-and-sources/\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Data Disclosure and Sources</span><span>, opens new tab</span></a></li><li><a data-testid=\"Link\" target=\"_blank\" href=\"https://trdigital.iad1.qualtrics.com/jfe/form/SV_8kte8gArGyCGVhz\" rel=\"noopener\"><span data-testid=\"LinkGroupItem\">Site Feedback</span><span>, opens new tab</span></a></li></ul></section><p data-testid=\"Body\">© 2026 Reuters. <a data-testid=\"Link\" href=\"https://www.thomsonreuters.com/en/policies/copyright.html\">All rights reserved</a></p></div></div></div>",
  "markdown_summary": "### Site Index\n\n### Latest\n\n-   [Home](https://www.reuters.com/)\n-   [Authors](https://www.reuters.com/sitemap/authors/)\n-   [Topic Sitemap](https://www.reuters.com/sitemap/topics/)\n-   [Archive](https://www.reuters.com/archive/)\n-   [Article Sitemap](https://www.reuters.com/sitemap/)\n\n### Browse\n\n-   [World](https://www.reuters.com/world/)\n-   [Business](https://www.reuters.com/business/)\n-   [Markets](https://www.reuters.com/markets/)\n-   [Sustainability](https://www.reuters.com/sustainability/)\n-   [Legal](https://www.reuters.com/legal/)\n-   [Breakingviews](https://www.reuters.com/breakingviews/)\n-   [Technology](https://www.reuters.com/technology/)\n-   [Investigations](https://www.reuters.com/investigations/)\n-   [Sports](https://www.reuters.com/sports/)\n-   [Science](https://www.reuters.com/science/)\n-   [Lifestyle](https://www.reuters.com/lifestyle/)\n\n### Media\n\n-   [Videos](https://www.reuters.com/video/)\n-   [Pictures](https://www.reuters.com/pictures/)\n-   [Graphics](https://www.reuters.com/graphics/)\n-   [Podcasts](https://www.reuters.com/podcasts/)\n\n### About Reuters\n\n-   [About Reuters, opens new tab](https://reutersagency.com/about/)\n-   [Media Center, opens new tab](https://www.reuters.com/media-center/)\n-   [Advertise with Us, opens new tab](https://www.reutersprofessional.com/advertise-with-us/p/1)\n-   [Careers, opens new tab](https://www.thomsonreuters.com/en/careers)\n-   [Reuters News Agency, opens new tab](https://reutersagency.com/?utm_source=website&utm_medium=reuters&utm_campaign=site-referral&utm_content=us&utm_term=0)\n-   [Brand Attribution Guidelines, opens new tab](https://reutersagency.com/brand-attribution-guidelines/)\n-   [Reuters and AI, opens new tab](https://www.reuters.com/info-pages/reuters-and-ai/)\n-   [Reuters Leadership, opens new tab](https://reutersagency.com/about/leadership-team/)\n-   [Reuters Fact Check](https://www.reuters.com/fact-check/)\n-   [Reuters Diversity Report, opens new tab](https://www.reuters.com/graphics/DIVERSITY-REPORT/2024/xmpjbgdrapr/)\n-   [Commercial Disclosure (Japan), opens new tab](https://www.reuters.com/info-pages/commercial-disclosure/)\n\n### Stay Informed\n\n-   [Download the App (iOS), opens new tab](https://apps.apple.com/app/reuters-news/id602660809)\n-   [Download the App (Android), opens new tab](https://play.google.com/store/apps/details?id=com.thomsonreuters.reuters)\n-   [Newsletters](https://www.reuters.com/newsletters/)\n-   [Subscribe](https://www.reuters.com/subscribe/offer/?journeyStart=Footer)\n\n### Information you can trust\n\nReuters, the news and media division of Thomson Reuters, is the world’s largest multimedia news provider, reaching billions of people worldwide every day. Reuters provides business, financial, national and international news to professionals via desktop terminals, the world's media organizations, industry events and directly to consumers.\n\n### LSEG Products\n\n-   #### \n    \n    [Workspace, opens new tab](https://www.lseg.com/en/data-analytics/products/workspace?utm_source=reuters.com&utm_medium=footer&utm_campaign=Reuters_ProductPage_Links)\n    \n    Access unmatched financial data, news and content in a highly-customised workflow experience on desktop, web and mobile.\n    \n-   #### \n    \n    [Data Catalogue, opens new tab](https://www.lseg.com/en/data-analytics/financial-data/?utm_source=reuters.com&utm_medium=footer&utm_campaign=Reuters_DataCatalogPage_Links)\n    \n    Browse an unrivalled portfolio of real-time and historical market data and insights from worldwide sources and experts.\n    \n-   #### \n    \n    [World-Check, opens new tab](https://www.lseg.com/en/risk-intelligence/screening-solutions/world-check-kyc-screening?utm_source=reuters.com&utm_medium=footer&utm_campaign=Reuters_ProductPage_Links)\n    \n    Screen for heightened risk individual and entities globally to help uncover hidden risks in business relationships and human networks.\n    \n\n-   [Advertise With Us, opens new tab](https://www.reutersprofessional.com/advertising-solutions/p/1)\n-   [Advertising Guidelines](https://www.reuters.com/info-pages/advertising-guidelines/)\n-   [Purchase Licensing Rights, opens new tab](https://www.reutersagency.com/en/licensereuterscontent/?utm_medium=rcom-footer&utm_campaign=rcom-rcp-lead)\n\n-   [Cookies, opens new tab](https://www.thomsonreuters.com/en/privacy-statement.html#cookies)\n-   [Terms & Conditions](https://www.reuters.com/info-pages/terms-of-use/)\n-   [Privacy, opens new tab](https://www.thomsonreuters.com/en/privacy-statement.html)\n-   [Copyright, opens new tab](https://www.thomsonreuters.com/en/policies/copyright)\n-   [Digital Accessibility, opens new tab](https://www.thomsonreuters.com/en/policies/digital-accessibility-policy.html)\n-   [Corrections](https://www.reuters.com/info-pages/contact-us/)\n-   [Data Disclosure and Sources, opens new tab](https://www.reuters.com/info-pages/data-disclosure-and-sources/)\n-   [Site Feedback, opens new tab](https://trdigital.iad1.qualtrics.com/jfe/form/SV_8kte8gArGyCGVhz)\n\nAll quotes delayed a minimum of 15 minutes. [See here for a list of exchanges and delays.](https://www.reuters.com/info-pages/disclaimer/)\n\n-   [Cookies, opens new tab](https://www.thomsonreuters.com/en/privacy-statement.html#cookies)\n-   [Terms & Conditions](https://www.reuters.com/info-pages/terms-of-use/)\n-   [Privacy, opens new tab](https://www.thomsonreuters.com/en/privacy-statement.html)\n-   [Copyright, opens new tab](https://www.thomsonreuters.com/en/policies/copyright)\n-   [Digital Accessibility, opens new tab](https://www.thomsonreuters.com/en/policies/digital-accessibility-policy.html)\n-   [Corrections](https://www.reuters.com/info-pages/contact-us/)\n-   [Data Disclosure and Sources, opens new tab](https://www.reuters.com/info-pages/data-disclosure-and-sources/)\n-   [Site Feedback, opens new tab](https://trdigital.iad1.qualtrics.com/jfe/form/SV_8kte8gArGyCGVhz)\n\n© 2026 Reuters. [All rights reserved](https://www.thomsonreuters.com/en/policies/copyright.html)",
  "word_count": 394,
  "created_at": "2026-03-25T17:37:44.530003+00:00",
  "notion_page_id": null,
  "source": "manual",
  "last_synced_at": null
}
```

---

### `public.audit_items` — 95 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (17) | `id` (uuid, not null), `name` (text, not null), `category` (text, not null), `priority` (text, not null), `status` (text, not null), `description` (text, not null), `findings` (text, not null), `recommendation` (text, not null), `url` (text), `stack` (text), `health_score` (real), `clickup_task_id` (text), `notes` (text), `approved_by` (text), `approved_at` (timestamp with time zone), `updated_at` (timestamp with time zone, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "031b5e77-970d-426b-bd18-1de0f64fa422",
  "name": "Command Center",
  "category": "Production Apps",
  "priority": "urgent",
  "status": "pending_review",
  "description": "Enterprise command center — 17 views, single-file 10K+ lines",
  "findings": "29 Math.random() instances generating fake data in production. Single-file architecture makes maintenance difficult.",
  "recommendation": "Replace all Math.random() with real API data sources. Refactor into modular components.",
  "url": "command.insightprofit.live",
  "stack": "React 18 + Babel, Vercel",
  "health_score": null,
  "clickup_task_id": null,
  "notes": null,
  "approved_by": null,
  "approved_at": null,
  "updated_at": "2026-04-25T00:15:35.172164+00:00",
  "created_at": "2026-04-25T00:15:35.172164+00:00"
}
```

---

### `public.launch_assets` — 77 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (title + body/content columns) |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `launch_id` (uuid, not null), `asset_type` (public.asset_type, not null), `title` (text, not null), `content` (text), `file_url` (text), `version` (int32, not null), `is_current` (boolean, not null), `metadata` (jsonb), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "64bcf419-c0e2-43e4-ba49-4463d2fba303",
  "launch_id": "f50650ab-35be-4071-b1a4-3161c56ed849",
  "asset_type": "misc",
  "title": "SOP: Test Process",
  "content": "# SOP: Test\n\n## Purpose\nTest SOP",
  "file_url": null,
  "version": 1,
  "is_current": true,
  "metadata": {
    "ki_id": "11d6ed70-ca95-4b21-94e8-fadb2e307ecb",
    "source": "knowledge_items",
    "item_type": "sop"
  },
  "created_at": "2026-04-17T17:16:21.591438+00:00",
  "updated_at": "2026-04-17T17:16:21.591438+00:00"
}
```

---

### `public.launch_asset_summary` — 77 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (title + body/content columns) |
| **Primary key** | `id` |
| **Columns** (19) | `id` (uuid), `title` (text), `slug` (text), `status` (public.launch_status), `launch_date` (date), `tags` (text[]), `total_assets` (int64), `strategy_count` (int64), `avatar_count` (int64), `positioning_count` (int64), `keywords_count` (int64), `seo_content_count` (int64), `ad_concepts_count` (int64), `competitor_count` (int64), `email_count` (int64), `design_count` (int64), `data_viz_count` (int64), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "025955a6-2cfb-45e6-9165-c1840d8b0406",
  "title": "PRD: Test Product",
  "slug": "prd-test-product-1107",
  "status": "draft",
  "launch_date": null,
  "tags": [
    "prd",
    "product"
  ],
  "total_assets": 1,
  "strategy_count": 1,
  "avatar_count": 0,
  "positioning_count": 0,
  "keywords_count": "[REDACTED]",
  "seo_content_count": 0,
  "ad_concepts_count": 0,
  "competitor_count": 0,
  "email_count": "[REDACTED]",
  "design_count": 0,
  "data_viz_count": 0,
  "created_at": "2026-04-17T17:18:31.187706+00:00",
  "updated_at": "2026-04-17T17:18:31.187706+00:00"
}
```

---

### `public.kb_business_units` — 75 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `user_id` (uuid, not null), `name` (text, not null), `slug` (text, not null), `description` (text), `industry` (text), `stage` (text, not null), `revenue_target` (text), `status` (text, not null), `teable_base_id` (text), `teable_table_id` (text), `clickup_space_id` (text), `metadata` (jsonb), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "93b7f16a-5903-4f7b-9e6a-92b9619882fc",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "name": "Business unit 2",
  "slug": "bu-demo-mo37d45u-2",
  "description": "Seeded BU 2 for enterprise screens",
  "industry": "Software",
  "stage": "growth",
  "revenue_target": "$300K",
  "status": "active",
  "teable_base_id": null,
  "teable_table_id": null,
  "clickup_space_id": null,
  "metadata": {
    "seed": true
  },
  "created_at": "2026-04-17T17:49:14.509253+00:00",
  "updated_at": "2026-04-17T17:49:14.509253+00:00"
}
```

---

### `public.kb_tags` — 71 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `name` (text, not null), `color` (text, not null), `hub_name` (text, not null), `created_at` (timestamp with time zone, not null), `project_stage` (text), `priority_score` (int32), `scoring_data` (jsonb), `scored_at` (timestamp with time zone), `stage_updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "21c27d72-4241-47c2-9e47-c14d18f39718",
  "name": "super_agent",
  "color": "#6366f1",
  "hub_name": "genspark-agent-type",
  "created_at": "2026-03-21T09:58:03.462901+00:00",
  "project_stage": "idea",
  "priority_score": null,
  "scoring_data": null,
  "scored_at": null,
  "stage_updated_at": null
}
```

---

### `public.sl_posts` — 39 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (23) | `id` (uuid, not null), `platform_id` (uuid), `collection_id` (uuid), `external_id` (text), `author` (text), `caption` (text), `video_url` (text), `thumbnail_url` (text), `post_url` (text), `post_date` (text), `views` (int64), `total_reactions` (int64), `likes` (int64), `loves` (int64), `hahas` (int64), `wows` (int64), `cares` (int64), `comments_count` (int64), `shares` (int64), `top_comments` (jsonb), `raw_data` (jsonb), `scraped_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "22aed491-df25-4c94-9bd8-ad5aececf8e6",
  "platform_id": "3426e135-4a76-4822-8727-b372e1afbcee",
  "collection_id": "e0a70de8-f4b7-4d21-aade-52ffb17d653f",
  "external_id": null,
  "author": "MrPhotographyWest",
  "caption": "Riding around in the station wagon, no seatbelts, just vibes. What do you remember most about being a 70s kid?",
  "video_url": null,
  "thumbnail_url": null,
  "post_url": null,
  "post_date": "March 11, 2025",
  "views": 0,
  "total_reactions": 1464,
  "likes": 1300,
  "loves": 134,
  "hahas": 0,
  "wows": 0,
  "cares": 0,
  "comments_count": 4000,
  "shares": 253,
  "top_comments": [
    {
      "text": "The smell of Coppertone sunscreen and AM radio blasting all summer!",
      "author": "Linda G",
      "reactions": 89
    },
    {
      "text": "Freedom! We played outside until the street lights came on.",
      "author": "Bobby T",
      "reactions": 76
    },
    {
      "text": "Drive-in movies on a Friday night was the highlight of the week.",
      "author": "Carol M",
      "reactions": 63
    }
  ],
  "raw_data": {},
  "scraped_at": "2026-04-05T00:13:39.752559+00:00",
  "created_at": "2026-04-05T00:13:39.752559+00:00"
}
```

---

### `public.kb_categories` — 29 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `slug` (text), `icon` (text), `color` (text), `use_cases` (jsonb), `is_system` (boolean), `sort_order` (int32), `created_at` (timestamp with time zone, not null), `description` (text), `item_count` (int32), `parent_category_id` (uuid) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "082e9543-de51-4cb0-ae91-15cc452381d1",
  "user_id": null,
  "name": "Genspark Projects",
  "slug": "genspark-projects",
  "icon": "fas fa-folder",
  "color": "#6366f1",
  "use_cases": [],
  "is_system": true,
  "sort_order": 0,
  "created_at": "2026-04-17T16:47:54.938105+00:00",
  "description": "Core Genspark research conversations covering multi-city comparisons, health platforms, Human Design strategies, SugarSpring catalogs, and imported webhook content.",
  "item_count": 354,
  "parent_category_id": null
}
```

---

### `public.kb_analytics` — 20 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (12) | `id` (int32, not null), `snapshot_date` (date, not null), `total_items` (int32), `active_items` (int32), `items_by_type` (jsonb), `items_by_source` (jsonb), `coverage_by_department` (jsonb), `growth_rate_7d` (numeric), `stale_items_count` (int32), `avg_item_age_days` (int32), `tag_distribution` (jsonb), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "snapshot_date": "2026-04-22",
  "total_items": 11591,
  "active_items": 11544,
  "items_by_type": {
    "prd": 25,
    "sop": 37,
    "agent": 509,
    "spark": 58,
    "document": 5,
    "imported": 89,
    "checklist": 3,
    "manus_doc": 30,
    "manus_file": 276,
    "manus_task": 79,
    "brand-guide": 2,
    "fgs_product": 22,
    "inspiration": 8742,
    "interactive": 2,
    "launch_plan": 16,
    "manus_share": 1,
    "spreadsheet": 7,
    "chatgpt_chat": 816,
    "manus_output": 81,
    "genspark_chat": 598,
    "manus_session": 81,
    "agent_workflow": 34,
    "autopilotagent": 5,
    "department_sop": 10,
    "product-catalog": 56,
    "design_reference": 5,
    "fgs_brand_guidelines": 2
  },
  "items_by_source": {},
  "coverage_by_department": {},
  "growth_rate_7d": 96.26,
  "stale_items_count": 0,
  "avg_item_age_days": 7,
  "tag_distribution": {
    "SEO": 173,
    "SOP": 292,
    "fgs": 8879,
    "ftk": 362,
    "agent": 468,
    "manus": 469,
    "Shopify": 256,
    "Workout": 552,
    "chatgpt": 816,
    "youtube": 8279,
    "AI Tools": 308,
    "Research": 951,
    "Wellness": 179,
    "genspark": 638,
    "llm_chat": 816,
    "playlist": 8268,
    "Ecommerce": 419,
    "Marketing": 470,
    "Parenting": 310,
    "Automation": 285,
    "manus_file": 276,
    "Monetization": 270,
    "ai-resources": 747,
    "subscription": 7174,
    "Video Tutorial": 501,
    "Print-on-Demand": 328,
    "YouTube Channel": 1623,
    "pod-inspiration": 8620,
    "Personal Finance": 195,
    "funded-first-brand": 245
  },
  "updated_at": "2026-04-22T16:18:52+00:00"
}
```

---

### `public.decision_hub_items` — 17 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (21) | `id` (uuid, not null), `title` (text, not null), `description` (text), `category` (text, not null), `priority` (text, not null), `status` (text, not null), `source` (text), `source_url` (text), `clickup_task_id` (text), `clickup_url` (text), `slack_channel` (text), `slack_thread_ts` (text), `slack_url` (text), `deadline` (timestamp with time zone), `brand` (text), `department` (text), `assigned_agent` (text), `metadata` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `resolved_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "a855a1a0-750f-41bb-b26c-efbdf9ff359b",
  "title": "Pilot Mastery Q2 content calendar",
  "description": "Content calendar for Pilot Mastery Q2 is 5 days overdue. 14 articles + 8 videos planned but not started.",
  "category": "overdue",
  "priority": "urgent",
  "status": "approved",
  "source": "clickup",
  "source_url": null,
  "clickup_task_id": null,
  "clickup_url": "https://app.clickup.com/t/86e0wzzy5",
  "slack_channel": null,
  "slack_thread_ts": null,
  "slack_url": null,
  "deadline": "2026-04-20T11:45:17.074128+00:00",
  "brand": "pilot-mastery",
  "department": "Content",
  "assigned_agent": "Scribe",
  "metadata": {},
  "created_at": "2026-04-25T11:45:17.074128+00:00",
  "updated_at": "2026-05-07T12:12:16.088+00:00",
  "resolved_at": "2026-05-07T12:12:16.088+00:00"
}
```

---

### `public.knowledge_bus` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `topic` (text, not null), `content` (jsonb, not null), `source_agent` (text, not null), `target_agents` (text[]), `priority` (int32), `ttl_hours` (int32), `is_active` (boolean), `tags` (text[]), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `expires_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "7c5164e7-ae76-41fd-84b6-66dafda7f8f9",
  "topic": "infrastructure_map",
  "content": {
    "n8n": "n8n.insightprofit.live",
    "wiki": "wiki.insightprofit.live",
    "teable": "teable.insightprofit.live",
    "supabase": "supabase.insightprofit.live",
    "growthbook": "growthbook.insightprofit.live",
    "oracle_vps": "129.213.162.114",
    "command_center": "command.insightprofit.live"
  },
  "source_agent": "viktor",
  "target_agents": [],
  "priority": 10,
  "ttl_hours": 24,
  "is_active": true,
  "tags": [
    "infrastructure",
    "dns",
    "services"
  ],
  "created_at": "2026-04-21T23:18:23.179147+00:00",
  "updated_at": "2026-04-21T23:18:23.179147+00:00",
  "expires_at": "2026-04-22T23:18:23.179147+00:00"
}
```

---

### `public.pipeline_items` — 3 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `title` (text, not null), `stage` (text, not null), `priority` (text, not null), `brand` (text), `source_app` (text), `assigned_to` (text), `metadata` (jsonb), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "fb921ce6-d62a-4514-ac03-6e55f5a06c10",
  "title": "The AI Energy Apocalypse: How Silicon Valley's Race for Intelligence Could Crash the Grid",
  "stage": "review",
  "priority": "high",
  "brand": null,
  "source_app": "elite-writer",
  "assigned_to": null,
  "metadata": {
    "score": 8,
    "source_url": "https://elitewriter.insightprofit.live",
    "word_count": 1773,
    "elite_writer_id": 1,
    "target_publication": "Bloomberg Businessweek"
  },
  "created_at": "2026-05-17T20:09:51.951193+00:00",
  "updated_at": "2026-05-17T20:09:51.951193+00:00"
}
```

---

### `public.items` — 3 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `source_url` (text, not null), `source_host` (text, not null), `source_type` (text, not null), `title` (text, not null), `body_text` (text, not null), `media_urls` (text[], not null), `price_text` (text), `parser_version` (text, not null), `captured_at` (timestamp with time zone, not null), `raw_snippet` (text), `summary` (text, not null), `tags` (text[], not null), `content_hash` (text, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "4a4b6888-017d-45f4-89b3-f6e3518499be",
  "source_url": "https://www.temu.com/",
  "source_host": "temu.com",
  "source_type": "product",
  "title": "Temu | Explore the Latest Clothing, Beauty, Home, Jewelry & More",
  "body_text": "​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\nSkip to\nMain content\nAccessibility\nTo move between items, use your keyboard's up or down arrows.\n3\nSubtotal\n$\n0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n.\n0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n0\n1\n2\n3\n4\n5\n6\n7\n8\n9\nCheckout (0)\nGo to cart\nSelect all (3)\nShips from this seller\nALMOST SOLD OUT\n$17.11\n Free shipping from this seller\nALMOST SOLD OUT\n$49.37\n Free shipping from this seller\nALMOST SOLD OUT\n$35.61\nFree shipping\nExcludes local items\nDelivery guarantee\nRefund for any issues\nFree returns\nUp to 90 days*\nPrice adjustment\nWithin 30 days\nSecure privacy\nSafe payments\nDelivery guarantee\nRefund for any issues\nGet the Temu App\nSell on Temu\nJoin Now\nBest-Selling Items\n5-Star Rated\nLocal Warehouse\nCategories\npersonalized playing cards\nHello, \nRashida M\nOrders & Account\nSupport\nEnglish\n3\nFree shipping excludes local items\nNever overpay with our Price Match Guarantee\nLIGHTNING DEALS\nLimited time offer\n4 Pack White Folding Chairs with Enhanced Iron Frame, Stackable Plastic Folding Chairs for Outside, Indoor, Party, Wedding, Meeting Room, Patio And Garden, Weight Capacity 300 Lbs, Chairs Foldable, Portable Folding Chair, Outdoor Folding Chair, Folding Chairs Indoor, Stackable Chair, Party Chairs, Garden Furniture, Lightweight Chairs, Compact Design, Weatherresistant Material, Durable Plastic, Collapsible Chairs\n$50.61\n$50.61\nOriginal price $175.92\n$175.92\n-71% last 3 days\nNatural Sports Warm Casual Business Knitted Cardigan Suit, Stylish Leisure Business Chunky Spliced Solid Color Men'S Retro Thick Fiber Clothing from Pear\nAD\nLAST 4 AT PROMO PRICE\n$23.05\n$23.05\nOriginal price $65.09\n$65.09\n-64% limited time\n15pcs Custom Temporary Tattoos for Parties - Personalized \"LOVE\" Bride and Groom Face Tattoo Stickers, Fun Gift for Party Bride and Groom, Wedding and Birthday Party Gift - Suitable for All Occasions and Seasons - for Adults and Teens, Party Tattoos\n$4.64\n$4.64\nOriginal price $6.42\n$6.42\n-27% limited time\nCLEARANCE DEALS\nLimited stock\n[Heavy Duty Folding Cart] Heavy Duty All Terrain Folding Cart 350LBS/ 520LBS/ 780LBS | Large Capacity Camper Utility Cart for Yard Shopping, Sports, Outdoor, Gardening Equipment - Black Multifunctional\n$14.75\n$14.75\nOriginal price $32.40\n$32.40\n-54%\n4.5 out of five stars\n1,142 reviews\n1,142\nCustom Deck of Playing Cards – Photo Gift, Wedding Guestbook Alternative, Family Party Favor, Personalized Poker Cards\n$9.38\n$9.38\nOriginal price $15.30\n$15.30\n-38%\n5 out of five stars\n2 reviews\n2\n40W USB-C Fast Charging Adapter | Type-C Power Charger with 3 Wall-Mounted Interfaces, PD+QC 3.0, Compatible with iPhone 17/16/15/14/SE/X/XS/8 Plus, Xiaomi, Samsung S22/S21/S20, Compact and Stylish\n$2.21\n$2.21\nOriginal price $3.94\n$3.94\n-43%\n4.7 out of five stars\n26 reviews\n26\nBanner\nShop now, pay later with\nEXPLORE YOUR INTERESTS\nRecommended\nRecommended\nWomen's Lingerie\n& Lounge\nWomen's Lingerie\n& Lounge\nSmart\nHome\nSmart\nHome\nKids'\nShoes\nKids'\nShoes\nBeachwear\nBeachwear\nWomen's\nShoes\nWomen's\nShoes\nFurniture\nFurniture\nAppliances\nAppliances\nBeauty &\nHealth\nBeauty &\nHealth\nMen's\nShoes\nMen's\nShoes\nFood &\nGrocery\nFood &\nGrocery\nHealth &\nHousehold\nHealth &\nHousehold\nElectronics\nElectronics\nPet\nSupplies\nPet\nSupplies\nTools & Home\nImprovement\nTools & Home\nImprovement\nToys &\nGames\nToys &\nGames\nPatio, Lawn\n& Garden\nPatio, Lawn\n& Garden\nMusical\nInstruments\nMusical\nInstruments\nWomen's Curve\nClothing\nWomen's Curve\nClothing\nBaby &\nMaternity\nBaby &\nMaternity\nMen's Underwear\n& Sleepwear\nMen's Underwear\n& Sleepwear\nBusiness,\nIndustry & Science\nBusiness,\nIndustry & Science\nSports &\nOutdoors\nSports &\nOutdoors\nAutomotive\nAutomotive\nWomen's\nClothing\nWomen's\nClothing\nOffice & School\nSupplies\nOffice & School\nSupplies\nKids'\nFashion\nKids'\nFashion\nJewelry &\nAccessories\nJewelry &\nAccessories\nArts, Crafts\n& Sewing\nArts, Crafts\n& Sewing\nBags &\nLuggage\nBags &\nLuggage\nCell Phones &\nAccessories\nCell Phones &\nAccessories\nHome &\nKitchen\nHome &\nKitchen\nMen's\nClothing\nMen's\nClothing\nMen's Big\n& Tall\nMen's Big\n& Tall\nBooks &\nMedia\nBooks &\nMedia\nTop pick\nLocal\n220LBS/ 450LBS/ 680LBS All Terrain Heavy Duty Folding Cart, Large Capacity Camper Suitable for Yard Shopping/ Sports/ Outdoor/ Gardening Equipment Handling, Black Multifunctional Utility Cart\nOpen in new tab.\n$13.53\n$13.53\nOriginal price $31.28\n$31.28\n300K+\nsold\n300K+sold\n#1 BEST-SELLING ITEM | Last 6 months in Outdoor Carts & Picnic\n#1 BEST-SELLING ITEM | Last 6 months\nin Outdoor Carts & Picnic\n4.5 out of five stars\n34,067 reviews\n34,067\nArrives in 2+ business days\nArrives in 2+ business days\nAD\nTop pick\nLocal\n2/6/8pcs Set Of Folding Chairs, Conference Room Chairs, Reception Room Chairs, Sturdy Metal Frame, Soft Cushion, PU Leather - Suitable for Use In Conference Rooms, Gatherings, And As Dining Chairs\nOpen in new tab.\n$31.09\n$31.09\nOriginal price $141.54\n$141.54\n449\nsold\n449sold\nBought 1 time\nBought 1 time\n4.8 out of five stars\n62 reviews\n62\nSTAR STORE\nBRAND: OLIXIS\nArrives in 1+ business days\nArrives in 1+ business days\nMen'S Casual High Neck Fleece Jacket, Color Block Knit Polyester Cardigan, Mid Stretch Zip-Up Fall/Winter Outerwear, Regular Fit with Placket Closure, Thick\nOpen in new tab.\n$19.02\n$19.02\nOriginal price $103.26\n$103.26\n49K+\nsold\n49K+sold\nTOP RATED in Men's Sweaters\nTOP RATED\nin Men's Sweaters\nDetails\n$0.77 cheaper than viewed\n$0.77 cheaper than viewed\n\n\nTOP RATED\nin Men's Sweaters\nDetails\n$0.77 cheaper than viewed\n4.8 out of five stars\n658 reviews\n658\nSTAR STORE\nTop pick\n1 roll of weather protection self-adhesive window sealing strip - plastic waterproof, windproof and windproof strip, sound insulation tape, used for windproof, dustproof, rainproof and noise reduction, 472 inches\nOpen in new tab.\n$6.40\n$6.40\nOriginal price $12.78\n$12.78\n56K+\nsold\n56K+sold\n#3 BEST-SELLING ITEM | Last 6 months ",
  "media_urls": [
    "https://aimg.kwcdn.com/material-put/212a0ccbb8/e7dff723-e3f0-4d7f-8117-3cdd4d01dd95.png?imageView2/2/w/300/q/70/format/avif"
  ],
  "price_text": null,
  "parser_version": "1",
  "captured_at": "2026-02-20T02:58:39.676+00:00",
  "raw_snippet": null,
  "summary": "Temu offers a wide range of products including clothing, beauty items, home goods, and jewelry, often at discounted prices with free shipping options. The platform features best-selling items, personalized products, and numerous categories catering to various interests.",
  "tags": [
    "shopping",
    "clothing",
    "beauty",
    "home",
    "discounts"
  ],
  "content_hash": "[REDACTED]",
  "created_at": "2026-02-20T02:58:42.790429+00:00"
}
```

---

### `public.rp_documents` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `project_id` (uuid), `user_id` (uuid), `folder_id` (uuid), `title` (text, not null), `content` (text), `doc_type` (text, not null), `tags` (text[]), `sort_order` (int32), `word_count` (int32), `is_pinned` (boolean), `due_date` (timestamp with time zone), `assigned_to` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "ee2b3578-2d82-4ed0-bc9c-5efa4bf17db8",
  "project_id": "26b023c9-eb05-4d84-8ace-31d5cea2752e",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "folder_id": null,
  "title": "New Canvas",
  "content": "",
  "doc_type": "canvas",
  "tags": [],
  "sort_order": 0,
  "word_count": 0,
  "is_pinned": false,
  "due_date": null,
  "assigned_to": null,
  "created_at": "2026-04-26T18:19:11.533+00:00",
  "updated_at": "2026-04-26T18:19:11.533+00:00"
}
```

---

### `public.lifelegacy_articles` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `title` (text, not null), `content` (text), `status` (text), `tags` (text[]), `scheduled_date` (date), `word_count` (int32), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "72fa0e5e-fc2f-4336-b18a-350cbfdb1727",
  "title": "The Complete Estate Planning Guide for Families",
  "content": "Article brief: estate planning guide\nPillar: Estate Planning\nAvatar: PP\nType: Guide\nTarget word count: 4500",
  "status": "scheduled",
  "tags": [
    "estate-planning",
    "pp",
    "guide"
  ],
  "scheduled_date": null,
  "word_count": 4500,
  "created_at": "2026-04-18T03:47:16.064197+00:00",
  "updated_at": "2026-04-18T03:47:16.064197+00:00"
}
```

---

### `public.kb_automations` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `user_id` (uuid, not null), `name` (text, not null), `description` (text), `trigger_event` (text, not null), `conditions` (jsonb), `actions` (jsonb), `is_active` (boolean, not null), `last_triggered_at` (timestamp with time zone), `trigger_count` (int32, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "d8d7d93f-fcc6-4e09-86c5-5bd46a5c2e0a",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "name": "Demo automation",
  "description": "Fires on page.created (inactive demo)",
  "trigger_event": "page.created",
  "conditions": {},
  "actions": [
    {
      "type": "notify",
      "config": {
        "channel": "demo"
      }
    }
  ],
  "is_active": false,
  "last_triggered_at": null,
  "trigger_count": 0,
  "created_at": "2026-04-17T17:49:14.601655+00:00"
}
```

---

### `public.kb_workflows` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `user_id` (uuid, not null), `business_unit_id` (uuid), `name` (text, not null), `slug` (text, not null), `description` (text), `trigger_type` (text, not null), `trigger_config` (jsonb), `steps` (jsonb), `status` (text, not null), `last_run_at` (timestamp with time zone), `run_count` (int32, not null), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "bcb245c2-a342-4d6d-b160-8a2788c9cf29",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "business_unit_id": null,
  "name": "Demo workflow",
  "slug": "demo-workflow-mo37d4l1",
  "description": "Seeded manual workflow",
  "trigger_type": "manual",
  "trigger_config": {},
  "steps": [
    {
      "id": "s1",
      "name": "Ping",
      "type": "notify",
      "config": {
        "channel": "demo"
      }
    }
  ],
  "status": "draft",
  "last_run_at": null,
  "run_count": 0,
  "created_at": "2026-04-17T17:49:14.574771+00:00",
  "updated_at": "2026-04-17T17:49:14.574771+00:00"
}
```

---

### `public.v_kb_coverage` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | _unknown_ |
| **Columns** (10) | `snapshot_date` (date), `total_items` (int32), `active_items` (int32), `items_by_type` (jsonb), `items_by_source` (jsonb), `coverage_by_department` (jsonb), `stale_items_count` (int32), `growth_rate_7d` (numeric), `tag_distribution` (jsonb), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "snapshot_date": "2026-05-23",
  "total_items": 0,
  "active_items": 0,
  "items_by_type": {},
  "items_by_source": {},
  "coverage_by_department": {
    "Operations": 0,
    "Revenue & Sales": 0,
    "Strategy & Brand": 0,
    "Technology & Infra": 0,
    "Marketing & Content": 0,
    "Product & Engineering": 0
  },
  "stale_items_count": 0,
  "growth_rate_7d": 0,
  "tag_distribution": {
    "CMO": 10,
    "IBYOK": 3,
    "Career": 2,
    "PopeBot": 2,
    "Shopify": 1,
    "ai_chat": 27,
    "moa_chat": 139,
    "AgentZero": 1,
    "Home Hacks": 1,
    "docs_agent": 4,
    "EOL Planner": 1,
    "super_agent": 761,
    "code_sandbox": 16,
    "sheets_agent": 11,
    "slides_agent": 12,
    "Second Spring": 18,
    "App Development": 2,
    "Digital Product": 1,
    "FamilyGiftStudio": 2,
    "Personal Finance": 1,
    "YouTube Analytics": 3,
    "moa_generate_image": 10,
    "moa_generate_video": 8,
    "Software Comparison": 2,
    "agent_deep_research": 16,
    "agentic_deep_research": 40,
    "Dev Tools & Code Services": 3,
    "Faith-Based Wellness Apps": 3,
    "Parenting Wisdom Publishing": 6,
    "Journalist Research Services": 6,
    "Specialized Product Ventures": 5,
    "Nonprofit Fundraising Consulting": 2,
    "SEO & Website Intelligence Suite": 3,
    "Teen Financial Literacy Platform": 1,
    "AI Workflow & Automation Platform": 5,
    "Educational Video-to-Ebook Studio": 7,
    "LinkedIn Business Growth Platform": 4,
    "Marketing Agency Tools & Templates": 8,
    "Connector Testing & Integration Lab": 3,
    "Interactive Learning Platform Builder": 2
  },
  "updated_at": "2026-05-23T06:00:04.379+00:00"
}
```

---

### `public.research_notes` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (title + body/content columns) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `user_id` (uuid), `article_idea_id` (uuid), `folder_id` (uuid), `title` (text, not null), `content` (text, not null), `category` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `viral_score` (int32) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "412518d9-5ef3-4abb-b9bb-04dfd055f972",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "article_idea_id": null,
  "folder_id": null,
  "title": "7 Growth Strategies Executive Leaders use Increase Online Cash Flow within 30 days — Research Brief",
  "content": "{\n  \"key_trends\": [\n    \"Shift towards revenue-based financing for faster cash flow optimization\",\n    \"Integration of AI-powered cash flow forecasting tools\",\n    \"Rise of dynamic pricing strategies in SaaS and e-commerce\",\n    \"Adoption of automated accounts receivable acceleration\",\n    \"Implementation of real-time financial dashboards for decision-making\"\n  ],\n  \"data_points\": [\n    {\n      \"point\": \"Companies using automated AR systems reduce DSO by 30% on average\",\n      \"suggested_source\": \"Gartner Financial Operations Research\"\n    },\n    {\n      \"point\": \"78% of businesses improved cash flow within 30 days using dynamic pricing\",\n      \"suggested_source\": \"McKinsey Digital Commerce Report\"\n    },\n    {\n      \"point\": \"AI-powered forecasting reduces cash flow prediction errors by 50%\",\n      \"suggested_source\": \"Deloitte CFO Insights\"\n    },\n    {\n      \"point\": \"Real-time financial dashboards increase working capital efficiency by 25%\",\n      \"suggested_source\": \"PwC Working Capital Report\"\n    },\n    {\n      \"point\": \"Revenue-based financing grows 61% faster than traditional funding\",\n      \"suggested_source\": \"CB Insights Alternative Lending Report\"\n    }\n  ],\n  \"expert_sources\": [\n    {\n      \"name\": \"Sarah Chen\",\n      \"title\": \"Managing Partner at Beyond Capital Ventures\",\n      \"why_them\": \"Specializes in revenue-based financing and growth-stage investments\"\n    },\n    {\n      \"name\": \"David Sacks\",\n      \"title\": \"Founding COO of PayPal, Founder of Craft Ventures\",\n      \"why_them\": \"Pioneer in fintech and scaling operations\"\n    },\n    {\n      \"name\": \"Amy Vetter\",\n      \"title\": \"CEO of The B3 Method Institute\",\n      \"why_them\": \"Expert in business technology integration and financial automation\"\n    },\n    {\n      \"name\": \"Raj Koneru\",\n      \"title\": \"CEO of Kore.ai\",\n      \"why_them\": \"Leader in AI-powered business process automation\"\n    },\n    {\n      \"name\": \"Melissa Harward\",\n      \"title\": \"Director of Financial Operations at Square\",\n      \"why_them\": \"Authority on digital payment optimization and cash flow management\"\n    }\n  ],\n  \"counterintuitive_angles\": [\n    \"Why slower payment terms can sometimes increase cash flow\",\n    \"How reducing prices strategically can boost immediate revenue\",\n    \"When turning down funding actually improves cash position\",\n    \"Why some successful companies choose to decrease their customer base\",\n    \"How increasing expenses can lead to better cash flow\"\n  ],\n  \"recommended_angle\": {\n    \"headline\": \"7 Unconventional Cash Flow Strategies That Generated $2M+ in 30 Days\",\n    \"angle\": \"Analysis of 500+ high-growth companies reveals counterintuitive approaches to rapid cash flow optimization\",\n    \"why_now\": \"Post-pandemic shift in digital commerce creates unique opportunity for immediate revenue acceleration\"\n  },\n  \"outline\": [\n    \"The New Cash Flow Paradigm: Why Traditional Methods Fall Short\",\n    \"Strategy 1: Dynamic Pricing Optimization\",\n    \"Strategy 2: Automated Accounts Receivable Acceleration\",\n    \"Strategy 3: AI-Powered Revenue Forecasting\",\n    \"Strategy 4: Strategic Payment Term Engineering\",\n    \"Strategy 5: Customer Segmentation for Cash Flow\",\n    \"Strategy 6: Digital Payment Optimization\",\n    \"Strategy 7: Real-Time Financial Dashboard Implementation\",\n    \"Implementation Framework: 30-Day Action Plan\",\n    \"Case Study: $5M Company's Cash Flow Transformation\",\n    \"Risk Mitigation Strategies\",\n    \"Next Steps and Resources\"\n  ],\n  \"sources\": [\n    {\n      \"title\": \"Full Year Results and Notice of AGM\",\n      \"url\": \"https://www.globenewswire.com/news-release/2025/12/19/3208296/0/en/Full-Year-Results-and-Notice-of-AGM.html\"\n    }\n  ]\n}",
  "category": "Forbes",
  "created_at": "2025-12-30T10:42:41.070085+00:00",
  "updated_at": "2025-12-30T10:42:41.070085+00:00",
  "viral_score": null
}
```

---

### `public.documents` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `user_id` (uuid, not null), `title` (text, not null), `content` (jsonb, not null), `content_html` (text), `content_markdown` (text), `status` (text), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null), `metadata` (jsonb, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "410f79b7-d28c-49d7-986b-a6e455ad5916",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "title": "Untitled Document",
  "content": [],
  "content_html": null,
  "content_markdown": null,
  "status": "draft",
  "created_at": "2025-12-30T13:23:10.046182+00:00",
  "updated_at": "2025-12-30T13:23:10.046182+00:00",
  "metadata": {}
}
```

---

### `public.kb_page_views` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `knowledge_item_id` (uuid), `project_id` (uuid), `user_id_legacy` (int32), `viewed_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "461c6df1-c736-4a71-9c9d-bbd5a9c00c95",
  "knowledge_item_id": "5a83c49f-abb0-5c32-9307-064176407954",
  "project_id": null,
  "user_id_legacy": 0,
  "viewed_at": "2026-04-18T03:59:54.098636+00:00"
}
```

---

### `public.article_ideas` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (40) | `id` (uuid, not null), `user_id` (uuid), `title` (text, not null), `angle` (text), `news_peg` (text), `news_peg_date` (timestamp with time zone), `urgency_score` (int32), `target_publications` (text), `expected_pay` (numeric), `priority_score` (numeric), `word_count_target` (int32), `status` (text), `category` (text), `keywords` (text), `research_notes` (text), `assigned_date` (timestamp with time zone), `deadline` (timestamp with time zone), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `folder_id` (uuid), `status_stage` (text), `quality_score` (double precision), `target_publication_id` (uuid), `income_potential` (numeric), `is_hot_idea` (boolean), `is_high_pay` (boolean), `media_assets` (jsonb), `markdown_content` (text), `agent_workflow_state` (jsonb), `workflow_log` (jsonb), `kanban_stage` (text), `workflow_id` (uuid), `current_stage` (text), `stage_history` (jsonb), `quality_gates_passed` (jsonb), `collaboration_enabled` (boolean), `html_content` (text), `structured_content` (jsonb), `data_points` (jsonb), `expert_sources` (jsonb) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "36283d75-6a77-427d-9e65-3762d150377f",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "title": "7 Growth Strategies Executive Leaders use Increase Online Cash Flow within 30 days",
  "angle": "creating a personal connection with their ideal customer can go beyond blindly promoting the features and benefits of their offer but tap into the demographic and psychographic of their ideal customer and what they are going through to need or want the offer right now",
  "news_peg": "",
  "news_peg_date": "2025-12-29T20:24:20.903+00:00",
  "urgency_score": 7,
  "target_publications": "",
  "expected_pay": 0,
  "priority_score": 0,
  "word_count_target": 1000,
  "status": "idea",
  "category": "Business",
  "keywords": "[REDACTED]",
  "research_notes": "",
  "assigned_date": "2025-12-29T20:24:20.904+00:00",
  "deadline": null,
  "created_at": "2025-12-29T20:24:21.099783+00:00",
  "updated_at": "2026-02-26T20:21:45.994129+00:00",
  "folder_id": null,
  "status_stage": "brainstorm",
  "quality_score": null,
  "target_publication_id": null,
  "income_potential": null,
  "is_hot_idea": false,
  "is_high_pay": false,
  "media_assets": {},
  "markdown_content": null,
  "agent_workflow_state": {},
  "workflow_log": [],
  "kanban_stage": "brainstorm",
  "workflow_id": null,
  "current_stage": "ideation",
  "stage_history": [],
  "quality_gates_passed": {},
  "collaboration_enabled": false,
  "html_content": null,
  "structured_content": null,
  "data_points": [],
  "expert_sources": []
}
```

---

### `public.item_tags` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `tag_id` (uuid), `item_id` (uuid, not null), `item_type` (text, not null), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.publication_example_articles` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `publication_id` (uuid), `title` (text, not null), `url` (text), `author` (text), `published_date` (date), `content` (text, not null), `word_count` (int32), `import_method` (text), `imported_at` (timestamp with time zone), `imported_by` (uuid), `analysis_status` (text), `analysis_error` (text), `content_hash` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.kb_versions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `user_id` (uuid), `knowledge_item_id` (uuid, not null), `version_number` (int32, not null), `title` (text), `content` (text), `summary` (text), `change_description` (text), `tags` (jsonb), `use_cases` (jsonb), `metadata` (jsonb), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ai_documents` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (18) | `id` (uuid, not null), `user_id` (uuid), `title` (text, not null), `content` (text), `doc_type` (text, not null), `tags` (text[]), `source_type` (text, not null), `source_id` (uuid), `status` (text, not null), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null), `target_publication` (text), `description` (text), `auto_inject` (boolean), `injection_priority` (int32), `bound_features` (text[]), `max_inject_tokens` (int32), `bound_publications` (text[]) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.kb_database_relations` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `source_row_id` (uuid, not null), `target_row_id` (uuid, not null), `column_id` (text, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.knowledge_entries` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `user_id` (uuid, not null), `title` (text, not null), `content` (text), `type` (text), `use_case` (text), `source_url` (text), `status` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.content_blocks` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (21) | `id` (uuid, not null), `article_id` (uuid), `user_id` (uuid), `block_type` (text, not null), `block_subtype` (text), `content` (jsonb, not null), `plain_text` (text), `sort_order` (int32, not null), `parent_block_id` (uuid), `indent_level` (int32), `ai_generated` (boolean), `ai_model` (text), `ai_score` (numeric), `ai_suggestions` (jsonb), `word_count` (int32), `reading_time_seconds` (int32), `source_url` (text), `source_title` (text), `source_date` (date), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.kb_shared_links` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `user_id` (uuid, not null), `knowledge_item_id` (uuid, not null), `token` (text, not null), `is_public` (boolean, not null), `password` (text), `allow_embed` (boolean, not null), `expires_at` (timestamp with time zone), `view_count` (int32, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.kb_database_rows` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `database_id` (uuid, not null), `linked_item_id` (uuid), `values` (jsonb, not null), `sort_order` (int32, not null), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.vault_items` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `user_id` (uuid), `type` (text, not null), `content` (text, not null), `tags` (text[]), `source_video_id` (text), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.content_improvement_suggestions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (23) | `id` (uuid, not null), `article_idea_id` (uuid), `score_history_id` (uuid), `user_id` (uuid), `category` (text, not null), `dimension` (text, not null), `title` (text, not null), `description` (text, not null), `impact_score` (numeric), `time_estimate_minutes` (int32), `difficulty` (text), `action_type` (text), `action_details` (jsonb), `example_text` (text), `status` (text), `completed_at` (timestamp with time zone), `dismissed_at` (timestamp with time zone), `dismiss_reason` (text), `score_before` (numeric), `score_after` (numeric), `was_effective` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.rp_canvas_items` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `document_id` (uuid), `user_id` (uuid), `item_type` (text, not null), `content` (text), `x` (real), `y` (real), `width` (real), `height` (real), `color` (text), `connections` (text[]), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.kb_workflow_runs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `workflow_id` (uuid, not null), `status` (text, not null), `input` (jsonb), `output` (jsonb), `step_results` (jsonb), `error` (text), `started_at` (timestamp with time zone, not null), `completed_at` (timestamp with time zone), `duration_ms` (int32) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.knowledge_item_versions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `item_id` (uuid, not null), `content` (text), `content_plain` (text), `word_count` (int32), `edited_by` (text), `version_number` (int32, not null), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.content_templates` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `description` (text), `template_type` (text), `structure` (jsonb, not null), `times_used` (int32), `last_used_at` (timestamp with time zone), `ai_prompts` (jsonb), `publication_target` (text), `article_type` (text), `is_public` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.brand_content` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `brand_slug` (text, not null), `title` (text, not null), `type` (text), `status` (text), `platform` (text), `scheduled_at` (timestamp with time zone), `published_at` (timestamp with time zone), `engagement` (jsonb), `url` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.nav_item_placements` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | _unknown_ |
| **Columns** (4) | `user_id` (uuid, not null), `item_id` (text, not null), `folder_id` (uuid), `sort_order` (int32, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.content_workflows` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `description` (text), `workflow_type` (text), `stages` (jsonb), `quality_gates` (jsonb), `automation_rules` (jsonb), `is_default` (boolean), `is_active` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.rp_references` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (title + body/content columns) |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `project_id` (uuid), `user_id` (uuid), `document_id` (uuid), `ref_type` (text, not null), `title` (text, not null), `url` (text), `content` (text), `file_path` (text), `source` (text), `tags` (text[]), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.article_payments` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `submission_id` (uuid), `article_id` (int32, not null), `publication` (text, not null), `amount` (numeric, not null), `currency` (text, not null), `payment_method` (text), `payment_date` (timestamp with time zone, not null), `notes` (text), `metadata` (jsonb), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.articles` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (31) | `id` (uuid, not null), `user_id` (uuid), `article_idea_id` (uuid), `publication_id` (uuid), `title` (text, not null), `subtitle` (text), `word_count` (int32), `content` (text), `status` (text), `draft_date` (timestamp with time zone), `submission_date` (timestamp with time zone), `publication_date` (timestamp with time zone), `payment_amount` (numeric), `payment_date` (timestamp with time zone), `article_url` (text), `editor_feedback` (text), `performance_views` (int32), `performance_shares` (int32), `lessons_learned` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `folder_id` (uuid), `published_date` (date), `has_image` (boolean), `has_video` (boolean), `voice_type` (text), `tone` (text), `sources_count` (int32), `turnaround_hours` (numeric), `kanban_stage` (text), `research_notes` (text) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.article_submissions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `article_id` (int32, not null), `article_title` (text, not null), `publication` (text, not null), `status` (text, not null), `submitted_at` (timestamp with time zone, not null), `responded_at` (timestamp with time zone), `source_app` (text, not null), `metadata` (jsonb), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.claude_code_sessions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (title + body/content columns) |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `project_path` (text, not null), `session_file` (text, not null), `title` (text), `content_text` (text), `message_count` (int32), `hub_tag_id` (uuid), `synced_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.research_item_ai_extractions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (18) | `id` (uuid, not null), `research_note_id` (uuid), `article_idea_id` (uuid), `user_id` (uuid), `extraction_type` (text, not null), `extracted_text` (text, not null), `context` (text), `source_name` (text), `source_url` (text), `source_date` (date), `source_credibility` (text), `times_used` (int32), `last_used_at` (timestamp with time zone), `ai_confidence` (numeric), `ai_model` (text), `keywords` (jsonb), `topics` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ai_content_briefs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `document_id` (uuid, not null), `topic` (text, not null), `keywords` (text[]), `target_audience` (text), `tone` (text), `target_length` (int32), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.research_items` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `user_id` (uuid), `article_idea_id` (uuid), `type` (text), `content` (text), `source_name` (text), `source_title` (text), `source_url` (text), `relevance_score` (int32), `verified` (boolean), `date_collected` (timestamp with time zone), `notes` (text), `used_in_article` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.document_versions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `document_id` (uuid, not null), `content` (jsonb, not null), `version_number` (int32, not null), `created_by` (uuid), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.kb_databases` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `name` (text, not null), `description` (text), `parent_item_id` (uuid), `columns` (jsonb, not null), `view_type` (text, not null), `sort_config` (jsonb), `filter_config` (jsonb), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.social_posts` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `brand_slug` (text, not null), `platform` (text, not null), `content` (text), `media_urls` (text[]), `status` (text), `scheduled_at` (timestamp with time zone), `published_at` (timestamp with time zone), `engagement` (jsonb), `post_url` (text), `campaign` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.article_versions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (21) | `id` (uuid, not null), `article_idea_id` (uuid), `user_id` (uuid), `version_number` (int32, not null), `version_type` (text), `title` (text), `content` (text, not null), `word_count` (int32), `ai_generated` (boolean), `ai_action` (text), `ai_model_used` (text), `ai_prompt_used` (text), `readability_score` (numeric), `ai_detection_score` (numeric), `originality_score` (numeric), `seo_score` (numeric), `improvements_made` (jsonb), `ai_suggestions` (jsonb), `notes` (text), `is_current_version` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.kb_attachments` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (name match) |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `user_id` (uuid), `knowledge_item_id` (uuid, not null), `file_name` (text, not null), `file_type` (text), `file_size` (int32), `file_url` (text), `storage_path` (text), `metadata` (jsonb), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.rp_versions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | KB content (title + body/content columns) |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `document_id` (uuid), `user_id` (uuid), `title` (text), `content` (text), `word_count` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_



---

## ⚙️ OPERATIONAL TABLES

### `public.infra_health_log` — 13,986 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `service` (text, not null), `status` (text, not null), `response_time_ms` (int32), `message` (text), `checked_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "70a8b030-dde5-43f9-82a8-30ac6d328f20",
  "service": "supabase",
  "status": "healthy",
  "response_time_ms": 148,
  "message": "HTTP 401",
  "checked_at": "2026-04-19T00:35:04.858503+00:00"
}
```

---

### `public.n8n_event_log` — 8,704 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (10) | `id` (int32, not null), `workflow` (text), `event` (text), `severity` (text), `agent_id` (text), `task_id` (text), `department` (text), `matched_by` (text), `details` (jsonb), `timestamp` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "workflow": "health-monitor",
  "event": "critical_alert",
  "severity": "critical",
  "agent_id": null,
  "task_id": null,
  "department": null,
  "matched_by": null,
  "details": {
    "total": 11,
    "healthy": 0,
    "critical_down": 5,
    "critical_list": "agents-gateway (fetch is not defined), supabase-kong (fetch is not defined), supabase-auth (fetch is not defined), laina-cos (fetch is not defined), token-tracker (fetch is not defined)",
    "unhealthy_list": "agents-gateway (fetch is not defined), supabase-kong (fetch is not defined), supabase-auth (fetch is not defined), supabase-storage (fetch is not defined), laina-cos (fetch is not defined), thepopebot-backend (fetch is not defined), token-tracker (fetch is not defined), flowise (fetch is not defined), growthbook (fetch is not defined), elite-writer (fetch is not defined), polsio (fetch is not defined)"
  },
  "timestamp": "2026-04-22T15:05:43.034+00:00"
}
```

---

### `public.clickup_tasks` — 4,131 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (10) | `id` (int64, not null), `clickup_id` (text), `name` (text), `status` (text), `assignee` (text), `priority` (text), `due_date` (timestamp with time zone), `updated_at` (timestamp with time zone), `list_name` (text), `space_name` (text) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "clickup_id": "86dyyv3ux",
  "name": "Social Media",
  "status": "Open",
  "assignee": "Rashida Mendes",
  "priority": "none",
  "due_date": null,
  "updated_at": "2026-04-22T16:13:57+00:00",
  "list_name": "List",
  "space_name": "Funded First"
}
```

---

### `public.ai_agents` — 1,191 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (19) | `id` (text, not null), `name` (text, not null), `source` (text, not null), `role_type` (text, not null), `category` (text), `capabilities` (jsonb), `system_prompt` (text), `status` (text), `assigned_projects` (jsonb), `tags` (jsonb), `platform` (text), `source_row` (int32), `clickup_id` (text), `clickup_list` (text), `teable_id` (text), `teable_slug` (text), `metadata` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "fdd13bf9d258",
  "name": "Funnel Workflow Automation",
  "source": "google_sheets",
  "role_type": "workflow",
  "category": "workflow",
  "capabilities": "[\"automation\"]",
  "system_prompt": "I.C.E. Method Workflow\n\nMessage and Offer Positioning\n\n  * Market research\n  * Niche selection or narrowing\n  * Offer structure and creation\n  * Message positioning\n  * Polarizing point of view content piece\n\n\n\n##### Product Creation\n\n  * Course or coaching product outline\n  * Video creation\n  * Membership area design\n  * Video upload\n\n\n\n##### Front of Funnel - Lead Generation\n\n  * Quiz Creation\n\n\n  * Quiz title\n  * Quiz tagline\n  * Quiz archetypes\n  * Quiz questions\n  * Quiz answers\n  * Quiz video script x 4\n  * Quiz results page x 4\n\n\n\n##### Quiz Report\n\n  * Copy\n  * Design\n  * Integration\n\n\n\n##### Quiz Email Sequence\n\n  * Welcome email per archetype x 4\n\n\n  * Copy\n  * Integration\n\n\n  * Quiz report magnet delivery\n\n\n\n##### Marketing Automation\n\n  * Tagging structure strategy\n  * Tagging implementation\n\n\n\n##### Middle of Funnel\n\n  * Nurture Email\n\n\n  * Value content matrix\n  * 21 x Emails + call to action\n\n\n\n##### Launch Trigger\n\nAutomated Webinar Funnel\n\n  * Webinar registration page\n  * Webinar Thank You Page\n\n\n\n##### Webinar Presentation Script\n\n  * 130 x webinar presentation slides ( 90 min presentation)\n  * Webinar presentation design\n\n\n  * Webinar emails\n\n\n  * `Confirmation email\n  * Reminder emails\n\n\n  * Webinar replay page\n\n\n  * Page design\n\n\n\n##### Webinar Follow Up\n\n  * Day 1 email\n  * Day 2 email\n  * Day 3 email\n  * Day 4 email\n  * Day 5 - Cart close x 3 emails\n\n\n\n##### Deadline Funnel For Urgency\n\n  * Implementation\n  * Integration\n  * Testing\n\n\n\n##### Post Webinar Sales Page\n\n  * Sales page copy\n  * Sales page design\n  * Chat tool integration\n\n\n  * Abandoned cart\n\n\n  * Abandoned cart email sequence x 3\n  * Retargeting\n\n\n\n##### Checkout Experience\n\n  * Offer\n\n\n  * I.C.E. Method check offer\n  * Checkout optimization\n  * Order bump\n\n\n  * Buyers Confirmation Thank You Page\n  * Purchase confirmation email\n\n\n\n##### Customer Success Experience\n\n  * Offer Onboarding email\n\n\n  * Welcome video\n  * Housekeeping video\n  * Client request for feed back form\n\n\n\n##### Customer Fulfillment Milestones\n\n  * Step 1 x 3 emails\n  * Step 2 x 3 emails\n  * Step 3 x 3 emails\n  * Step 4 x 3 emails\n  * Step 5 x 3 emails\n  * Reward badges\n\n\n\n##### Customer Offboarding\n\n  * Testimonial request form\n  * Exit and feedback survey\n\n\n",
  "status": "defined",
  "assigned_projects": "[\"GHL / Marketing\"]",
  "tags": "[\"AI\", \"workflow\", \"automation\"]",
  "platform": "",
  "source_row": 92,
  "clickup_id": "",
  "clickup_list": "",
  "teable_id": "",
  "teable_slug": "",
  "metadata": "{\"entry_type\": \"workflow\", \"proper_name\": \"Funnel Workflow Automation\", \"original_name\": \"Funnel Workflow Automation\", \"source_url\": \"\", \"audit_date\": \"2026-04-25\", \"audit_version\": \"v1\"}",
  "created_at": "2026-04-22T14:55:58.997264+00:00",
  "updated_at": "2026-04-25T12:00:00+00:00"
}
```

---

### `public.gateway_metrics` — 739 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (9) | `id` (int64, not null), `agent_id` (text), `agent_route` (text, not null), `request_count` (int32), `error_count` (int32), `avg_response_ms` (real), `period_start` (timestamp with time zone, not null), `period_end` (timestamp with time zone, not null), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "agent_id": "Flowise",
  "agent_route": "/flowise/",
  "request_count": 5,
  "error_count": 2,
  "avg_response_ms": 223.17,
  "period_start": "2026-04-20T08:00:00+00:00",
  "period_end": "2026-04-20T09:00:00+00:00",
  "created_at": "2026-04-20T20:00:52.428289+00:00"
}
```

---

### `public.cost_events` — 496 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `tool` (text, not null), `agent` (text), `model` (text), `input_tokens` (int64), `output_tokens` (int64), `cost_usd` (numeric), `event_type` (text), `metadata` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "18bc5a37-661a-423d-b689-50e485812166",
  "tool": "openrouter",
  "agent": null,
  "model": null,
  "input_tokens": "[REDACTED]",
  "output_tokens": "[REDACTED]",
  "cost_usd": 0,
  "event_type": "balance_snapshot",
  "metadata": "{\"balance\": 0.0, \"snapshot_at\": \"2026-04-23T20:23:20.033607+00:00\", \"usage_credits\": 0.16914645, \"limit_credits\": null, \"balance_credits\": null, \"rate_limit\": {\"requests\": -1, \"interval\": \"10s\", \"note\": \"This field is deprecated and safe to ignore.\"}}",
  "created_at": "2026-04-23T20:23:20.149139+00:00"
}
```

---

### `public.ai_expense_log` — 475 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `created_at` (timestamp with time zone, not null), `provider` (text, not null), `workspace` (text), `agent` (text, not null), `department` (text, not null), `model` (text), `task_type` (text), `goal` (text), `input_tokens` (int32), `output_tokens` (int32), `total_tokens` (int32), `cost_usd` (numeric, not null), `source` (text), `session_id` (text), `metadata` (jsonb) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "5151719a-f12c-43e4-a33a-c4535e83a69a",
  "created_at": "2026-05-01T00:00:00+00:00",
  "provider": "viktor",
  "workspace": "insightprofit",
  "agent": "platform",
  "department": "engineering",
  "model": "coworker",
  "task_type": "subscription",
  "goal": "Viktor AI Coworker monthly subscription",
  "input_tokens": "[REDACTED]",
  "output_tokens": "[REDACTED]",
  "total_tokens": "[REDACTED]",
  "cost_usd": 99,
  "source": "subscription_tracking",
  "session_id": null,
  "metadata": "{\"type\": \"monthly_subscription\", \"billing_period\": \"2026-05\"}"
}
```

---

### `public.ai_expense_daily` — 345 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (14) | `day` (date), `provider` (text), `workspace` (text), `agent` (text), `department` (text), `model` (text), `task_type` (text), `goal` (text), `request_count` (int64), `total_input_tokens` (int64), `total_output_tokens` (int64), `total_tokens` (int64), `total_cost_usd` (numeric), `avg_cost_per_request` (numeric) |

**Sample row (sensitive fields redacted):**
```json
{
  "day": "2026-04-01",
  "provider": "anthropic",
  "workspace": "insightprofit",
  "agent": "platform",
  "department": "engineering",
  "model": "claude-api",
  "task_type": "subscription",
  "goal": "Anthropic Claude API credits",
  "request_count": 1,
  "total_input_tokens": "[REDACTED]",
  "total_output_tokens": "[REDACTED]",
  "total_tokens": "[REDACTED]",
  "total_cost_usd": 20,
  "avg_cost_per_request": 20
}
```

---

### `public.umdm_metrics_daily` — 194 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (29) | `id` (uuid, not null), `brand_id` (uuid), `channel_id` (uuid), `campaign_id` (uuid), `ad_set_id` (uuid), `ad_id` (uuid), `metric_date` (date, not null), `spend` (numeric), `impressions` (int64), `clicks` (int64), `ctr` (numeric), `cpc` (numeric), `conversions` (int32), `cpa` (numeric), `revenue` (numeric), `roas` (numeric), `reach` (int64), `frequency` (numeric), `orders` (int32), `aov` (numeric), `sessions` (int32), `video_views` (int64), `video_completions` (int64), `engagements` (int64), `seo_clicks` (int64), `seo_impressions` (int64), `avg_position` (numeric), `raw_data` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "6d0d4dfb-bbdb-492f-b788-30734983dd86",
  "brand_id": "7ba2cd08-9a83-4e71-8fe6-6832ed1d8f84",
  "channel_id": "de36fbe4-9afd-4d3b-9821-094be787834d",
  "campaign_id": "adf3e343-8141-494c-b524-0ad88d2a2b9f",
  "ad_set_id": null,
  "ad_id": null,
  "metric_date": "2024-10-03",
  "spend": 2.91,
  "impressions": 236,
  "clicks": 43,
  "ctr": 18.2203,
  "cpc": 0.0677,
  "conversions": 0,
  "cpa": 0,
  "revenue": 0,
  "roas": 0,
  "reach": 214,
  "frequency": 1.1,
  "orders": 0,
  "aov": 0,
  "sessions": 0,
  "video_views": 0,
  "video_completions": 0,
  "engagements": 94,
  "seo_clicks": 0,
  "seo_impressions": 0,
  "avg_position": 0,
  "raw_data": {
    "cpc": "0.067674",
    "ctr": "18.220339",
    "reach": "214",
    "spend": "2.91",
    "clicks": "43",
    "actions": [
      {
        "value": "4",
        "action_type": "link_click"
      },
      {
        "value": "66",
        "action_type": "page_engagement"
      },
      {
        "value": "28",
        "action_type": "post_engagement"
      },
      {
        "value": "38",
        "action_type": "like"
      },
      {
        "value": "24",
        "action_type": "post_interaction_gross"
      },
      {
        "value": "1",
        "action_type": "comment"
      },
      {
        "value": "24",
        "action_type": "post_interaction_net"
      },
      {
        "value": "4",
        "action_type": "post"
      },
      {
        "value": "1",
        "action_type": "onsite_conversion.post_net_comment"
      },
      {
        "value": "19",
        "action_type": "onsite_conversion.post_net_like"
      },
      {
        "value": "19",
        "action_type": "post_reaction"
      }
    ],
    "date_stop": "2024-10-03",
    "frequency": "1.102804",
    "date_start": "2024-10-03",
    "campaign_id": "120211073323560141",
    "impressions": "236",
    "campaign_name": "Page LIkes - Oct 3 2024",
    "cost_per_action_type": [
      {
        "value": "0.7275",
        "action_type": "link_click"
      },
      {
        "value": "0.076579",
        "action_type": "like"
      },
      {
        "value": "0.12125",
        "action_type": "post_interaction_gross"
      },
      {
        "value": "0.103929",
        "action_type": "post_engagement"
      },
      {
        "value": "0.044091",
        "action_type": "page_engagement"
      }
    ]
  },
  "created_at": "2026-05-16T07:18:02.61179+00:00"
}
```

---

### `public.v_agent_performance` — 175 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (11) | `agent_name` (character varying), `agent_status` (character varying), `description` (text), `today_executions` (int32), `today_tokens` (int32), `today_cost` (numeric), `today_success` (int32), `today_failed` (int32), `success_rate` (numeric), `models_used` (jsonb), `last_activity` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "agent_name": "IntelBot — Competitive Intelligence",
  "agent_status": "planned",
  "description": "Research & Intelligence · Deep analysis of competitor positioning, pricing, messaging, and market trends",
  "today_executions": 0,
  "today_tokens": "[REDACTED]",
  "today_cost": 0,
  "today_success": 0,
  "today_failed": 0,
  "success_rate": 100,
  "models_used": null,
  "last_activity": null
}
```

---

### `public.agents` — 175 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `name` (character varying, not null), `description` (text), `status` (character varying), `created_at` (timestamp without time zone), `updated_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "a71a67e0-c8ab-4e23-998c-d8653250123b",
  "name": "IntelBot — Competitive Intelligence",
  "description": "Research & Intelligence · Deep analysis of competitor positioning, pricing, messaging, and market trends",
  "status": "planned",
  "created_at": "2026-04-21T22:07:20.196285",
  "updated_at": "2026-04-26T18:52:27.62789"
}
```

---

### `public.umdm_etl_sync_log` — 174 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `channel_id` (uuid), `brand_id` (uuid), `sync_type` (character varying, not null), `sync_started_at` (timestamp with time zone, not null), `sync_completed_at` (timestamp with time zone), `status` (character varying), `records_extracted` (int32), `records_loaded` (int32), `records_failed` (int32), `error_message` (text), `duration_seconds` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "c2682f6a-b9f9-49f0-ace3-47c970faccd3",
  "channel_id": "de36fbe4-9afd-4d3b-9821-094be787834d",
  "brand_id": "7ba2cd08-9a83-4e71-8fe6-6832ed1d8f84",
  "sync_type": "backfill",
  "sync_started_at": "2026-05-16T07:15:08.131499+00:00",
  "sync_completed_at": "2026-05-16T07:15:49.253793+00:00",
  "status": "failed",
  "records_extracted": 252,
  "records_loaded": 252,
  "records_failed": 0,
  "error_message": "Meta API error (400): (#3018) The start date of the time range cannot be beyond 37 months from the current date",
  "duration_seconds": 41,
  "created_at": "2026-05-16T07:15:08.15493+00:00"
}
```

---

### `public.ai_agents_summary` — 131 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (4) | `role_type` (text), `status` (text), `source` (text), `agent_count` (int64) |

**Sample row (sensitive fields redacted):**
```json
{
  "role_type": "content",
  "status": "archived",
  "source": "teable_kb",
  "agent_count": 177
}
```

---

### `public.agent_cost_summary_mv` — 110 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (6) | `agent_id` (text), `day` (date), `call_count` (int64), `total_tokens` (int64), `total_cost` (numeric), `models_used` (text[]) |

**Sample row (sensitive fields redacted):**
```json
{
  "agent_id": "Claude Dispatch",
  "day": "2026-04-14",
  "call_count": 4,
  "total_tokens": "[REDACTED]",
  "total_cost": 0.1178,
  "models_used": [
    "claude-3-haiku",
    "claude-3.5-sonnet",
    "gpt-4o"
  ]
}
```

---

### `public.ai_expense_monthly` — 102 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (11) | `month` (date), `provider` (text), `workspace` (text), `agent` (text), `department` (text), `model` (text), `task_type` (text), `goal` (text), `request_count` (int64), `total_tokens` (int64), `total_cost_usd` (numeric) |

**Sample row (sensitive fields redacted):**
```json
{
  "month": "2026-04-01",
  "provider": "anthropic",
  "workspace": "insightprofit",
  "agent": "platform",
  "department": "engineering",
  "model": "claude-api",
  "task_type": "subscription",
  "goal": "Anthropic Claude API credits",
  "request_count": 1,
  "total_tokens": "[REDACTED]",
  "total_cost_usd": 20
}
```

---

### `public.etl_runs` — 80 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (8) | `id` (int32, not null), `pipeline` (text, not null), `status` (text, not null), `records_processed` (int32), `error_message` (text), `started_at` (timestamp with time zone), `completed_at` (timestamp with time zone), `duration_ms` (int32) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "pipeline": "clickup_sync_initial",
  "status": "completed",
  "records_processed": 3521,
  "error_message": null,
  "started_at": "2026-04-22T16:17:47+00:00",
  "completed_at": "2026-04-22T16:17:47+00:00",
  "duration_ms": null
}
```

---

### `public.app_catalog` — 69 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (11) | `id` (int32, not null), `subdomain` (text, not null), `name` (text, not null), `url` (text, not null), `category` (text, not null), `hosting` (text), `framework` (text), `status` (text), `description` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "subdomain": "apex",
  "name": "Apex — Enterprise Dashboard",
  "url": "https://apex.insightprofit.live",
  "category": "Platform",
  "hosting": "Vercel",
  "framework": "Vite",
  "status": "Active",
  "description": "Main entry point & enterprise landing page",
  "created_at": "2026-04-30T11:13:30.499936+00:00",
  "updated_at": "2026-04-30T11:13:30.499936+00:00"
}
```

---

### `public.projects` — 47 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (20) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `color` (text, not null), `status` (text, not null), `priority` (text, not null), `brand` (text), `tags` (text[]), `script_count` (int32), `video_count` (int32), `avatar_count` (int32), `performance` (int32), `created_at` (timestamp with time zone, not null), `description` (text), `notes` (text), `github_repo` (text), `vercel_url` (text), `ghl_link` (text), `revenue_target` (numeric), `knowledge_base_url` (text) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "6b51f6d0-af72-4fc5-822c-1504177cc5e5",
  "user_id": null,
  "name": "ShineOn 5 Jewelry Products",
  "color": "#6366f1",
  "status": "review",
  "priority": "high",
  "brand": "family-gift-studio",
  "tags": [
    "shineon",
    "products",
    "mother-day"
  ],
  "script_count": 0,
  "video_count": 0,
  "avatar_count": 0,
  "performance": 0,
  "created_at": "2026-04-11T01:34:28.754224+00:00",
  "description": "5 ShineOn jewelry products ready for Mother's Day launch.",
  "notes": null,
  "github_repo": null,
  "vercel_url": null,
  "ghl_link": null,
  "revenue_target": null,
  "knowledge_base_url": null
}
```

---

### `public.revenue_analytics` — 40 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (12) | `id` (int32, not null), `source` (text, not null), `business_unit` (text), `period_date` (date, not null), `revenue_amount` (numeric), `transaction_count` (int32), `avg_deal_size` (numeric), `pipeline_value` (numeric), `pipeline_count` (int32), `conversion_rate` (numeric), `metadata` (jsonb), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "source": "clickup",
  "business_unit": "Sales Pipeline",
  "period_date": "2026-05-04",
  "revenue_amount": 170418,
  "transaction_count": 64,
  "avg_deal_size": 2662.78,
  "pipeline_value": 1457230,
  "pipeline_count": 97,
  "conversion_rate": 65.98,
  "metadata": {
    "won_deals": 64,
    "total_deals": 97
  },
  "updated_at": "2026-05-04T18:00:47.017+00:00"
}
```

---

### `public.ops_projects` — 36 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (22) | `id` (int32, not null), `source_sheet_id` (text, not null), `project_name` (text, not null), `category` (text), `description` (text), `tech_stack` (text), `platform` (text), `custom_domain` (text), `default_url` (text), `github_repo` (text), `vercel_project` (text), `self_hosted` (text), `cf_tunnel` (text), `deployment_status` (text), `hosting_port` (text), `visibility` (text), `supabase_linked` (text), `last_updated` (text), `notes` (text), `ai_agent_owner` (text), `raw_data` (jsonb), `synced_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 12,
  "source_sheet_id": "1UBTyPFzj6SdL48XZ3YsVB7xgDx95l1ZA",
  "project_name": "buzz",
  "category": "App",
  "description": "Buzz / notification app",
  "tech_stack": "Unknown",
  "platform": null,
  "custom_domain": "(No deployment yet)",
  "default_url": null,
  "github_repo": "—",
  "vercel_project": "buzz",
  "self_hosted": "—",
  "cf_tunnel": "—",
  "deployment_status": "No Deploy",
  "hosting_port": "—",
  "visibility": null,
  "supabase_linked": null,
  "last_updated": null,
  "notes": "",
  "ai_agent_owner": "SocialBot",
  "raw_data": "{\"#\": \"12\", \"Project Name\": \"buzz\", \"Description\": \"Buzz / notification app\", \"Category\": \"App\", \"Language / Framework\": \"Unknown\", \"GitHub Repo\": \"\\u2014\", \"Vercel Project\": \"buzz\", \"Self-Hosted\": \"\\u2014\", \"CF Tunnel\": \"\\u2014\", \"Primary URL / Subdomain\": \"(No deployment yet)\", \"\\u2705 Fixed Port\": \"\\u2014\", \"CF Tunnel Map\": \"\\u2014\", \"Status\": \"No Deploy\", \"Notes\": \"\"}",
  "synced_at": "2026-04-20T23:03:02.292146+00:00"
}
```

---

### `public.cost_budgets` — 29 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `tool` (text, not null), `daily_limit` (numeric), `monthly_limit` (numeric), `alert_threshold` (numeric), `is_active` (boolean), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "76c7a915-6e86-40c1-9f31-ba36e39c38d1",
  "tool": "vercel",
  "daily_limit": 1,
  "monthly_limit": 20,
  "alert_threshold": 0.8,
  "is_active": true,
  "updated_at": "2026-04-23T20:21:43.353534+00:00"
}
```

---

### `public.manus_projects` — 23 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (6) | `id` (text, not null), `name` (text, not null), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `synced_at` (timestamp with time zone), `metadata` (jsonb) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "4PEwNyEeYkA8YCh2gRo9tb",
  "name": "Bible Faith Promises",
  "created_at": "2025-12-13T16:27:25+00:00",
  "updated_at": "2026-03-18T16:19:57.269838+00:00",
  "synced_at": "2026-04-25T16:19:09.346942+00:00",
  "metadata": "{\"source\": \"manus_api_v2\"}"
}
```

---

### `public.infra_metrics` — 21 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (11) | `id` (int32, not null), `metric_date` (date, not null), `total_services` (int32), `healthy_services` (int32), `degraded_services` (int32), `down_services` (int32), `uptime_pct` (numeric), `avg_response_time_ms` (int32), `critical_incidents` (int32), `services_detail` (jsonb), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "metric_date": "2026-04-22",
  "total_services": 6,
  "healthy_services": 6,
  "degraded_services": 0,
  "down_services": 0,
  "uptime_pct": 100,
  "avg_response_time_ms": 677,
  "critical_incidents": 0,
  "services_detail": {
    "supabase": {
      "status": "healthy",
      "response_time_ms": 154
    },
    "growthbook": {
      "status": "healthy",
      "response_time_ms": 200
    },
    "command-hub": {
      "status": "healthy",
      "response_time_ms": 52
    },
    "knowledge-bus": {
      "status": "healthy",
      "response_time_ms": 50
    },
    "growthbook-api": {
      "status": "healthy",
      "response_time_ms": 100
    },
    "supabase-proxy": {
      "status": "healthy",
      "response_time_ms": 3507
    }
  },
  "updated_at": "2026-04-22T16:17:48+00:00"
}
```

---

### `public.project_velocity` — 18 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (13) | `id` (int32, not null), `space_name` (text, not null), `list_name` (text), `snapshot_date` (date, not null), `total_tasks` (int32), `open_tasks` (int32), `in_progress_tasks` (int32), `completed_tasks` (int32), `overdue_tasks` (int32), `completion_rate` (numeric), `avg_time_to_complete_days` (numeric), `velocity_7d` (int32), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "space_name": "Funded First",
  "list_name": "all",
  "snapshot_date": "2026-04-22",
  "total_tasks": 407,
  "open_tasks": 240,
  "in_progress_tasks": 14,
  "completed_tasks": 153,
  "overdue_tasks": 31,
  "completion_rate": 37.6,
  "avg_time_to_complete_days": null,
  "velocity_7d": 153,
  "updated_at": "2026-04-22T16:17:46+00:00"
}
```

---

### `public.agent_metrics` — 18 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (12) | `id` (int32, not null), `agent_name` (text, not null), `metric_date` (date, not null), `total_executions` (int32), `successful_executions` (int32), `failed_executions` (int32), `total_tokens` (int32), `total_cost_usd` (numeric), `avg_response_time_ms` (int32), `avg_tokens_per_call` (int32), `models_used` (jsonb), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "agent_name": "crm-agent",
  "metric_date": "2026-04-22",
  "total_executions": 4,
  "successful_executions": 4,
  "failed_executions": 0,
  "total_tokens": "[REDACTED]",
  "total_cost_usd": 1.86,
  "avg_response_time_ms": 0,
  "avg_tokens_per_call": "[REDACTED]",
  "models_used": "[\"claude-sonnet-4-20250514\"]",
  "updated_at": "2026-04-22T16:17:47+00:00"
}
```

---

### `public.agent_capabilities` — 16 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `agent_name` (text, not null), `capability` (text, not null), `description` (text), `input_schema` (jsonb), `output_schema` (jsonb), `is_available` (boolean), `avg_response_ms` (int32), `success_rate` (numeric), `last_used_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "d31cbcfd-13c2-4418-aa4f-e92886df6629",
  "agent_name": "viktor",
  "capability": "slack_ops",
  "description": "Slack workspace management, messaging, channel operations",
  "input_schema": {},
  "output_schema": {},
  "is_available": true,
  "avg_response_ms": null,
  "success_rate": 100,
  "last_used_at": null,
  "created_at": "2026-04-21T23:18:23.176166+00:00"
}
```

---

### `public.manus_task_files` — 16 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `task_id` (text, not null), `file_url` (text, not null), `filename` (text, not null), `mime_type` (text), `content` (text), `size_bytes` (int32), `downloaded_at` (timestamp with time zone, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "8aa050f4-5e49-4309-ac70-71eab33d0327",
  "task_id": "xOSSx4YrEtWqrw3PSqzfnA",
  "file_url": "https://private-us-east-1.manuscdn.com/sessionFile/xOSSx4YrEtWqrw3PSqzfnA/sandbox/zV4z9LLoe1yEzuyv4x0MSG_1752017037528_na1fn_L2hvbWUvdWJ1bnR1L3RvaWdvX2VucmljaGVkX2RhdGFiYXNlX2V4cGFuZGVk.csv?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUveE9TU3g0WXJFdFdxcnczUFNxemZuQS9zYW5kYm94L3pWNHo5TExvZTF5RXp1eXY0eDBNU0dfMTc1MjAxNzAzNzUyOF9uYTFmbl9MMmh2YldVdmRXSjFiblIxTDNSdmFXZHZYMlZ1Y21samFHVmtYMlJoZEdGaVlYTmxYMlY0Y0dGdVpHVmsuY3N2IiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=flQ50SiFEEmE06K0pyTBIAeaOAsG4sGTTbMhU-7mNRNbar38-FRAJwRke2EYW7yYjY1xs-XYtLPaXSpoeDVBrJRl9D9Yb6UKDJEVtoVeZ4aOfLZgt78BRCKBkNQDfYlCpj6jqpdxLW7H0Nz7kXESTKMKxyEWZkHRdDcm6HjQcTWwp~9eFuw6Z1YOhmU2f-3E3RfAa5JUBKKByWboi2gXebujF5myQyrOZZRjVl4lbCWlwtHIgj1~ZactgLgCkV5-~3vqMqBz7pIXBMwclE~oxR7MWN0-Z3lm66xFupDvtSvBvO08RNxS71IMut~VQ2q36ozLVrdhrtUVEgYhEGK0zg__",
  "filename": "toigo_enriched_database_expanded.csv",
  "mime_type": "application/octet-stream",
  "content": null,
  "size_bytes": 26029,
  "downloaded_at": "2026-03-22T21:28:41.044+00:00",
  "created_at": "2026-03-22T21:28:41.047531+00:00"
}
```

---

### `public.agent_responsibility_matrix` — 12 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (13) | `id` (int64, not null), `agent_name` (text, not null), `agent_type` (text, not null), `domain` (text, not null), `responsibilities` (text[], not null), `tools_access` (text[]), `data_sources` (text[]), `escalation_target` (text), `status` (text), `priority_level` (int32), `notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "agent_name": "Viktor",
  "agent_type": "ai_agent",
  "domain": "Infrastructure & DevOps",
  "responsibilities": [
    "Server monitoring & optimization",
    "Docker container management",
    "K3s cluster management",
    "CI/CD pipeline management",
    "Terraform IaC deployments",
    "Backup automation oversight"
  ],
  "tools_access": [
    "SSH",
    "Docker",
    "K3s kubectl",
    "Terraform",
    "GitHub",
    "Cloudflare",
    "Vercel"
  ],
  "data_sources": [
    "VPS metrics",
    "Container logs",
    "K3s cluster state",
    "Deployment history"
  ],
  "escalation_target": "Rashida (CEO)",
  "status": "active",
  "priority_level": 10,
  "notes": "Primary infrastructure agent. Handles all server, deployment, and DevOps tasks.",
  "created_at": "2026-04-21T23:29:58.888329+00:00",
  "updated_at": "2026-04-21T23:29:58.888329+00:00"
}
```

---

### `public.process_audit_log` — 10 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `workspace_id` (uuid), `entity_type` (text, not null), `entity_id` (uuid), `action` (text, not null), `user_id` (text), `user_name` (text), `changes` (jsonb), `metadata` (jsonb), `timestamp` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "183494b1-bddc-41fe-867a-e47b6903ac3b",
  "workspace_id": "a0000001-0000-0000-0000-000000000001",
  "entity_type": "record",
  "entity_id": null,
  "action": "create",
  "user_id": "system",
  "user_name": "Viktor",
  "changes": {
    "title": "API v3 endpoint redesign"
  },
  "metadata": {},
  "timestamp": "2026-05-01T11:11:53.053048+00:00"
}
```

---

### `public.mission_tasks` — 9 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `title` (text, not null), `prompt` (text, not null), `agent_id` (text), `priority` (int32), `status` (text), `cron_expression` (text), `next_run` (timestamp with time zone), `last_run` (timestamp with time zone), `last_result` (text), `error` (text), `chat_id` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "66b70240-8f89-4650-90e1-7748e23ef736",
  "title": "Daily Knowledge Sync",
  "prompt": "Sync new ChatGPT, Genspark, and Manus outputs to knowledge_items",
  "agent_id": "claude-dispatch",
  "priority": 1,
  "status": "active",
  "cron_expression": "0 6 * * *",
  "next_run": null,
  "last_run": null,
  "last_result": null,
  "error": null,
  "chat_id": null,
  "created_at": "2026-04-20T22:50:25.396205+00:00",
  "updated_at": "2026-04-20T22:50:25.396205+00:00"
}
```

---

### `public.token_logs` — 6 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `created_at` (timestamp with time zone), `provider` (text, not null), `model` (text, not null), `task_type` (text, not null), `complexity_tier` (text, not null), `prompt_tokens` (int32, not null), `completion_tokens` (int32, not null), `total_tokens` (int32, not null), `cost_usd` (numeric, not null), `latency_ms` (int32), `routing_reason` (text), `source` (text), `session_id` (text), `success` (boolean), `error_message` (text) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "9dc4c981-af39-4a2c-aeeb-728404a3be8d",
  "created_at": "2026-05-01T12:58:13.288632+00:00",
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "task_type": "summarization",
  "complexity_tier": "LOW",
  "prompt_tokens": "[REDACTED]",
  "completion_tokens": "[REDACTED]",
  "total_tokens": "[REDACTED]",
  "cost_usd": 0,
  "latency_ms": 676,
  "routing_reason": "Fallback from gemini → groq",
  "source": "ecg_audit_live_test",
  "session_id": null,
  "success": true,
  "error_message": null
}
```

---

### `public.agent_events` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `agent_name` (text, not null), `event_type` (text, not null), `event_category` (text), `payload` (jsonb), `correlation_id` (uuid), `parent_event_id` (uuid), `severity` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "4a1af813-916a-4807-b85e-a1bb3e743747",
  "agent_name": "viktor",
  "event_type": "knowledge_bus_created",
  "event_category": "infrastructure",
  "payload": {
    "tables_created": 4,
    "indexes_created": 16,
    "policies_created": 4,
    "triggers_created": 2
  },
  "correlation_id": null,
  "parent_event_id": null,
  "severity": "info",
  "created_at": "2026-04-21T23:18:23.181145+00:00"
}
```

---

### `public.agent_logs` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `agent_name` (text, not null), `action` (text, not null), `status` (text), `input_summary` (text), `output_summary` (text), `tokens_used` (int64), `cost_usd` (numeric), `duration_ms` (int32), `error_message` (text), `metadata` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "df85f6e1-4921-4482-a2f0-7e84ecd821e9",
  "agent_name": "viktor",
  "action": "enterprise_rebuild_dispatch",
  "status": "success",
  "input_summary": "Dispatched tasks to Codex, Cursor, Claude Code",
  "output_summary": "4 GitHub issues created, TECH_BUILD_SPEC.md pushed",
  "tokens_used": "[REDACTED]",
  "cost_usd": 0.15,
  "duration_ms": 120000,
  "error_message": null,
  "metadata": {},
  "created_at": "2026-05-18T23:49:34.889857+00:00"
}
```

---

### `public.viktor_tasks` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (18) | `id` (uuid, not null), `title` (text, not null), `description` (text), `status` (text, not null), `progress` (int32, not null), `steps` (jsonb), `current_step` (int32), `total_steps` (int32), `started_at` (timestamp with time zone), `estimated_duration_seconds` (int32), `completed_at` (timestamp with time zone), `slack_channel` (text), `slack_thread_ts` (text), `slack_progress_ts` (text), `tags` (text[]), `metadata` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "6a2b4d50-b3d9-414d-b7f2-88e1ec5cecbd",
  "title": "Fortune 100 Infrastructure Hardening",
  "description": "Deploy enterprise-grade security, monitoring, and observability across the full stack",
  "status": "completed",
  "progress": 100,
  "steps": [
    {
      "name": "Fix broken backups",
      "status": "completed"
    },
    {
      "name": "Lock database ports",
      "status": "completed"
    },
    {
      "name": "Install fail2ban",
      "status": "completed"
    },
    {
      "name": "Deploy Uptime Kuma",
      "status": "completed"
    },
    {
      "name": "Deploy Grafana + Loki",
      "status": "completed"
    },
    {
      "name": "CI dependency audit",
      "status": "completed"
    },
    {
      "name": "Wire Sentry SDK",
      "status": "completed"
    },
    {
      "name": "Deploy LiteLLM proxy",
      "status": "completed"
    }
  ],
  "current_step": 8,
  "total_steps": 8,
  "started_at": "2026-04-29T18:50:56.423402+00:00",
  "estimated_duration_seconds": 7200,
  "completed_at": "2026-04-29T20:50:56.423402+00:00",
  "slack_channel": null,
  "slack_thread_ts": null,
  "slack_progress_ts": null,
  "tags": [
    "infra",
    "security",
    "monitoring"
  ],
  "metadata": {},
  "created_at": "2026-04-29T20:50:56.423402+00:00",
  "updated_at": "2026-04-29T20:50:56.423402+00:00"
}
```

---

### `public.v_revenue_overview` — 2 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (8) | `business_unit` (text), `revenue_7d` (numeric), `revenue_30d` (numeric), `transactions_30d` (int64), `avg_deal_30d` (numeric), `current_pipeline` (numeric), `source` (text), `last_updated` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "business_unit": "Sales Pipeline",
  "revenue_7d": 1363344,
  "revenue_30d": 3408360,
  "transactions_30d": 1280,
  "avg_deal_30d": 2662.78,
  "current_pipeline": 1457230,
  "source": "clickup",
  "last_updated": "2026-05-23T00:01:11.504+00:00"
}
```

---

### `public.rp_activity_log` — 2 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `user_id` (uuid), `project_id` (uuid), `entity_type` (text, not null), `entity_id` (uuid, not null), `action` (text, not null), `details` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "10eecbc1-623d-48d1-8025-b109a1b889c4",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "project_id": "26b023c9-eb05-4d84-8ace-31d5cea2752e",
  "entity_type": "project",
  "entity_id": "26b023c9-eb05-4d84-8ace-31d5cea2752e",
  "action": "created",
  "details": {
    "name": "Pilot Training"
  },
  "created_at": "2026-04-26T18:18:55.293777+00:00"
}
```

---

### `public.kpi_snapshots` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `snapshot_date` (date, not null), `total_revenue` (numeric), `total_orders` (int32), `active_brands` (int32), `active_agents` (int32), `tasks_completed` (int32), `content_published` (int32), `automation_runs` (int32), `infra_uptime` (numeric), `data` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "6ed00c22-dcff-4acb-85eb-e07b4d2e5d31",
  "snapshot_date": "2026-05-17",
  "total_revenue": 0,
  "total_orders": 0,
  "active_brands": 5,
  "active_agents": 43,
  "tasks_completed": 0,
  "content_published": 39,
  "automation_runs": 86,
  "infra_uptime": 94.5,
  "data": {},
  "created_at": "2026-05-17T07:37:19.379958+00:00"
}
```

---

### `public.rp_projects` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `description` (text), `stage` (text, not null), `tags` (text[]), `color` (text), `icon` (text), `is_archived` (boolean), `due_date` (timestamp with time zone), `assigned_to` (text), `priority` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "26b023c9-eb05-4d84-8ace-31d5cea2752e",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "name": "Pilot Training",
  "description": "",
  "stage": "research",
  "tags": [
    "delta",
    "cfi"
  ],
  "color": "#B8977E",
  "icon": "📁",
  "is_archived": false,
  "due_date": null,
  "assigned_to": null,
  "priority": "medium",
  "created_at": "2026-04-26T18:18:55.176+00:00",
  "updated_at": "2026-04-26T18:18:55.176+00:00"
}
```

---

### `public.quality_metrics` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (34) | `id` (uuid, not null), `article_id` (uuid), `user_id` (uuid), `measured_at` (timestamp with time zone), `clarity_structure` (numeric), `hook_engagement` (numeric), `voice_tone` (numeric), `data_evidence` (numeric), `originality_angle` (numeric), `publication_fit` (numeric), `timeliness` (numeric), `actionability` (numeric), `expertise_depth` (numeric), `readability` (numeric), `conclusion_cta` (numeric), `overall_score` (numeric), `ai_detection_score` (numeric), `originality_score` (numeric), `flesch_reading_ease` (numeric), `flesch_kincaid_grade` (numeric), `gunning_fog_index` (numeric), `word_count` (int32), `sentence_count` (int32), `paragraph_count` (int32), `avg_sentence_length` (numeric), `avg_paragraph_length` (numeric), `has_introduction` (boolean), `has_conclusion` (boolean), `subheading_count` (int32), `quote_count` (int32), `statistic_count` (int32), `source_count` (int32), `ai_feedback` (jsonb), `improvement_suggestions` (jsonb) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.health_logs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (6) | `id` (int32, not null), `service` (text, not null), `status` (text, not null), `response_time_ms` (int32), `message` (text), `checked_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.aaoe_activity_log` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (28) | `id` (uuid, not null), `action_id` (character varying, not null), `cycle_id` (character varying), `timestamp` (timestamp with time zone, not null), `platform` (character varying, not null), `action_type` (character varying, not null), `entity_type` (character varying, not null), `entity_id` (character varying, not null), `entity_name` (character varying), `brand_code` (character varying, not null), `before_state` (jsonb), `after_state` (jsonb), `reasoning` (text, not null), `confidence` (numeric, not null), `expected_impact` (text), `priority` (character varying, not null), `execution_status` (character varying, not null), `auto_executed` (boolean), `rollback_available` (boolean), `rolled_back_at` (timestamp with time zone), `approved_by` (character varying), `approved_at` (timestamp with time zone), `rejected_by` (character varying), `rejected_at` (timestamp with time zone), `actual_impact` (text), `impact_measured_at` (timestamp with time zone), `slack_message_ts` (character varying), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.aeo_cost_log` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `audit_id` (uuid), `brand_slug` (text, not null), `queries_count` (int32), `estimated_cost_usd` (numeric), `provider` (text), `model` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.v_project_health` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (11) | `space_name` (text), `list_name` (text), `total_tasks` (int32), `open_tasks` (int32), `in_progress_tasks` (int32), `completed_tasks` (int32), `overdue_tasks` (int32), `completion_rate` (numeric), `velocity_7d` (int32), `health_status` (text), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.tool_call_log` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `server_name` (text, not null), `tool_name` (text, not null), `params` (text), `result_summary` (text), `status` (text), `duration_ms` (int32), `caller` (text), `error` (text), `called_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.revenue` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone), `business_unit` (text, not null), `source` (text), `amount` (numeric, not null), `currency` (text, not null), `type` (text, not null), `description` (text), `payment_method` (text), `customer_email` (text), `status` (text), `date` (date), `metadata` (jsonb) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.api_usage_logs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `workspace_id` (uuid, not null), `agent_or_user_id` (uuid, not null), `model_provider` (character varying, not null), `model_name` (character varying, not null), `endpoint` (character varying), `prompt_tokens` (int32), `completion_tokens` (int32), `total_cost` (numeric), `metadata` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ai_activity_log` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `user_id` (uuid), `action_type` (text, not null), `item_id` (uuid), `item_type` (text), `ai_provider` (text), `ai_model` (text), `prompt_used` (text), `tokens_used` (int32), `cost_estimate` (numeric), `success` (boolean), `error_message` (text), `output_preview` (text), `user_rating` (int32), `user_feedback` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ops_sync_log` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (10) | `id` (int32, not null), `sheet_id` (text), `sheet_name` (text), `rows_synced` (int32), `rows_skipped` (int32), `status` (text), `error_message` (text), `sync_source` (text), `started_at` (timestamp with time zone), `completed_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.brand_tasks` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `brand_slug` (text, not null), `title` (text, not null), `status` (text), `priority` (text), `assignee` (text), `due_date` (date), `clickup_id` (text), `clickup_url` (text), `tags` (text[]), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.audit_log` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (7) | `id` (int64, not null), `action` (text, not null), `agent_id` (text), `chat_id` (text), `user_id` (text), `metadata` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.cost_alerts` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `tool` (text, not null), `alert_type` (text, not null), `severity` (text), `message` (text), `acknowledged` (boolean), `acknowledged_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sparky_tasks` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (33) | `id` (int64, not null), `task_id` (uuid, not null), `prompt` (text, not null), `enriched_image_prompt` (text), `enriched_motion_prompt` (text), `aspect_ratio` (character varying), `duration_seconds` (int32), `camera_movement` (text), `audio_prompt` (text), `priority` (int32), `callback_url` (text), `metadata` (jsonb), `pathway` (character varying, not null), `media_format` (character varying, not null), `routing_confidence` (double precision), `routing_reasoning` (text), `status` (character varying, not null), `celery_task_id` (character varying), `seedance_task_id` (character varying), `retry_count` (int32), `error_message` (text), `output_url` (text), `thumbnail_url` (text), `intermediate_image_url` (text), `revised_prompt` (text), `model_used` (character varying), `design_profile_id` (uuid), `cost_tokens_input` (int32), `cost_tokens_output` (int32), `cost_estimate_usd` (numeric), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null), `completed_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.code_agent_requests` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `view_context` (text, not null), `source_files` (text[], not null), `instruction` (text, not null), `status` (text), `agent` (text), `diff` (text), `pr_url` (text), `pr_number` (int32), `deploy_url` (text), `error_message` (text), `screenshot_url` (text), `parent_id` (uuid), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `completed_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.workflow_runs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `workflow_id` (text, not null), `workflow_name` (text, not null), `app_id` (text, not null), `status` (text), `current_stage` (text), `stages` (jsonb), `params` (jsonb), `result` (jsonb), `error` (text), `started_at` (timestamp with time zone), `completed_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.agent_clusters` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `name` (character varying, not null), `agent_ids` (uuid[]), `created_at` (timestamp without time zone), `updated_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.daily_billing_metrics` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (8) | `workspace_id` (uuid), `usage_date` (date), `model_provider` (character varying), `model_name` (character varying), `total_prompt_tokens` (int64), `total_completion_tokens` (int64), `total_daily_cost` (numeric), `total_api_calls` (int64) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.cron_job_executions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `cron_job_id` (uuid), `status` (character varying), `output` (text), `error` (text), `duration_ms` (int32), `started_at` (timestamp without time zone), `completed_at` (timestamp without time zone), `created_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.manus_automation_logs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `rule_id` (uuid), `event_id` (uuid), `status` (text, not null), `result` (jsonb), `error` (text), `executed_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sl_workflow_runs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `workflow_id` (uuid), `status` (text), `log` (text), `posts_processed` (int32), `content_generated` (int32), `started_at` (timestamp with time zone), `completed_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.integration_sync_logs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `integration_id` (uuid, not null), `sync_status` (character varying, not null), `error_message` (text), `error_code` (character varying), `records_synced` (int32), `sync_duration_ms` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.backup_logs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (5) | `id` (int64, not null), `backup_date` (text), `tasks` (jsonb), `status` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.agent_sessions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (6) | `id` (text, not null), `chat_id` (text, not null), `agent_id` (text, not null), `claude_session_id` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.project_updates` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `project_id` (uuid), `update_text` (text), `update_type` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.brand_metrics` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `brand_slug` (text, not null), `metric_date` (date, not null), `revenue` (numeric), `orders` (int32), `roas` (numeric), `sessions` (int32), `conversion_rate` (numeric), `avg_order_value` (numeric), `ad_spend` (numeric), `source` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sparky_daily_costs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | _unknown_ |
| **Columns** (7) | `day` (date), `provider` (character varying), `api_calls` (int64), `total_input_tokens` (int64), `total_output_tokens` (int64), `total_bytes_stored` (numeric), `total_cost_usd` (numeric) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.agent_handoffs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `from_agent` (text, not null), `to_agent` (text, not null), `task_type` (text, not null), `task_description` (text), `context` (jsonb), `status` (text), `priority` (int32), `due_at` (timestamp with time zone), `accepted_at` (timestamp with time zone), `completed_at` (timestamp with time zone), `result` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.agent_workflow_runs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Operational / business data |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `user_id` (uuid), `article_idea_id` (uuid), `stage_from` (text), `stage_to` (text), `agent_type` (text), `input_data` (jsonb), `output_data` (jsonb), `status` (text), `error_message` (text), `tokens_used` (int32), `started_at` (timestamp with time zone), `completed_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_



---

## 🤖 AI / RAG TABLES

### `public.agent_memory` — 1,595 rows
| Field | Value |
|---|---|
| **Purpose** | AI embeddings / vector search |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `agent_id` (text, not null), `memory_type` (text, not null), `content` (text, not null), `embedding` (public.vector(768)), `metadata` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "7ac88295-123f-42a3-93cb-7c26c9fb4f80",
  "agent_id": "7e4c0a57-b723-4467-8f54-f4a06dfd8cdb",
  "memory_type": "stall_report",
  "content": "Phase 1 stall fix by Viktor: HR Bot stalled at 38 pct after 7.5h idle, status set to stalled, needs re-dispatch. CRM Agent completed but cost overrun 2.3x (1.86 vs 0.80 est), flagged needs-review.",
  "embedding": null,
  "metadata": {
    "fixed_by": "viktor-phase1",
    "cost_alerts": [
      {
        "ratio": 2.3,
        "actual": 1.86,
        "session": "crm-agent-ghl-sequences",
        "estimated": 0.8
      }
    ],
    "detected_at": "2026-04-20T19:50:00Z",
    "stalled_sessions": [
      "hr-bot-delta-pipeline"
    ]
  },
  "created_at": "2026-04-20T19:52:14.499876+00:00",
  "updated_at": "2026-04-20T19:52:14.499876+00:00"
}
```

---

### `public.user_memory` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | AI embeddings / vector search |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `user_id` (uuid, not null), `category` (character varying, not null), `key` (text, not null), `value` (text, not null), `embedding` (public.vector(1536)), `is_active` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.memories` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | AI embeddings / vector search |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `chat_id` (text), `agent_id` (text, not null), `summary` (text, not null), `raw_text` (text), `entities` (jsonb), `topics` (jsonb), `importance` (real, not null), `salience` (real, not null), `pinned` (boolean, not null), `superseded_by` (uuid), `consolidated` (boolean), `embedding` (public.vector(768)), `search_vector` (tsvector), `created_at` (timestamp with time zone), `last_accessed` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_



---

## 👤 AUTH / USER TABLES

### `public.team_members` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `name` (text, not null), `email` (text), `role` (text), `department` (text), `type` (text), `status` (text), `avatar_url` (text), `slack_id` (text), `brands` (text[]), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "e48204ef-0388-499f-b11d-4003c2dc5ad8",
  "name": "Rashida Mendes",
  "email": "[REDACTED]",
  "role": "CEO & Founder",
  "department": "Executive",
  "type": "human",
  "status": "active",
  "avatar_url": null,
  "slack_id": "U5BD61R8C",
  "brands": [],
  "created_at": "2026-05-17T07:37:19.279909+00:00"
}
```

---

### `public.user_settings` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `master_password` (text), `created_at` (timestamp with time zone), `user_id` (uuid), `groq_api_key` (text), `save_history` (boolean), `default_mode` (character varying), `hotkey` (character varying), `language` (character varying), `formatting_enabled` (boolean) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "7609979d-4784-4bb5-b493-767695e1ab25",
  "master_password": "[REDACTED]",
  "created_at": "2026-04-26T17:06:23.321589+00:00",
  "user_id": "b2f8c01a-e417-4f0c-a0b5-24cf8fdbd8df",
  "groq_api_key": "[REDACTED]",
  "save_history": true,
  "default_mode": "push_to_talk",
  "hotkey": "[REDACTED]",
  "language": "en",
  "formatting_enabled": true
}
```

---

### `public.user_preferences` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (22) | `id` (uuid, not null), `user_id` (uuid), `preferred_ai_provider` (text), `default_tone` (text), `default_reading_level` (int32), `default_article_length` (int32), `innovation_level` (text), `include_citations` (boolean), `news_pegged` (boolean), `data_driven` (boolean), `writing_style` (text), `expertise_areas` (jsonb), `avoid_topics` (jsonb), `sidebar_collapsed` (boolean), `default_view` (text), `items_per_page` (int32), `email_on_acceptance` (boolean), `email_on_payment` (boolean), `daily_digest` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `api_keys_encrypted` (jsonb) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "cb2ca985-ffa0-48fa-9e88-eba73be0cc0c",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "preferred_ai_provider": null,
  "default_tone": "professional",
  "default_reading_level": 12,
  "default_article_length": 1000,
  "innovation_level": "moderate",
  "include_citations": true,
  "news_pegged": true,
  "data_driven": true,
  "writing_style": null,
  "expertise_areas": null,
  "avoid_topics": null,
  "sidebar_collapsed": false,
  "default_view": null,
  "items_per_page": 20,
  "email_on_acceptance": "[REDACTED]",
  "email_on_payment": "[REDACTED]",
  "daily_digest": false,
  "created_at": "2026-03-02T00:41:55.381044+00:00",
  "updated_at": "2026-03-06T15:18:55.441813+00:00",
  "api_keys_encrypted": "[REDACTED]"
}
```

---

### `public.aviation_profiles` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `full_name` (text), `email` (text), `career_goal` (text), `training_phase` (text), `theme` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sparky_design_profiles` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `name` (character varying, not null), `version` (character varying, not null), `raw_markdown` (text), `color_count` (int32), `typography_count` (int32), `checksum` (character varying), `is_active` (boolean), `loaded_at` (timestamp with time zone, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.user_cost_overrides` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `user_id` (uuid, not null), `node_key` (text, not null), `field_name` (text, not null), `original_value` (text), `override_value` (text, not null), `notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.user_profiles` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (18) | `id` (uuid, not null), `age` (int32, not null), `gender` (text), `race_ethnicity` (text), `current_hours` (numeric), `certifications` (text[]), `target_airline` (text), `target_pathway` (text), `education_level` (text), `university` (text), `has_aviation_degree` (boolean), `demographic_tags` (text[]), `memberships` (text[]), `preferred_training_path` (text), `budget_range_low` (numeric), `budget_range_high` (numeric), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.rp_profiles` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `email` (text), `display_name` (text), `avatar_url` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.user_node_progress` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | _unknown_ |
| **Columns** (9) | `user_id` (uuid, not null), `node_id` (uuid, not null), `status` (text), `started_at` (timestamp with time zone), `completed_at` (timestamp with time zone), `actual_cost` (numeric), `notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.user_sessions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Auth / user management |
| **Primary key** | `id` |
| **Columns** (11) | `id` (int64, not null), `user_id` (text, not null), `session_id` (text, not null), `app_name` (text), `session_start` (timestamp with time zone, not null), `session_end` (timestamp with time zone), `page_views` (int32), `device_type` (text), `browser` (text), `country` (text), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_



---

## 📦 OTHER TABLES

### `public.app_health_checks` — 13,056 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (int64, not null), `app_id` (int32, not null), `status` (text, not null), `http_code` (int32), `response_ms` (int32), `error` (text), `checked_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "app_id": 1,
  "status": "healthy",
  "http_code": 200,
  "response_ms": 158,
  "error": null,
  "checked_at": "2026-05-07T18:55:59.238367+00:00"
}
```

---

### `public.subscribr_daily_snapshots` — 4,608 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (int64, not null), `subscribr_channel_id` (int32, not null), `channel_name` (text, not null), `youtube_handle` (text), `subscriber_count` (int32), `video_count` (int32), `view_count` (int64), `scripts_count` (int32), `snapshot_date` (date, not null), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "subscribr_channel_id": 18950,
  "channel_name": "Danielle .S (Danielle)",
  "youtube_handle": "danielles",
  "subscriber_count": 1570,
  "video_count": 31,
  "view_count": 67992,
  "scripts_count": 0,
  "snapshot_date": "2026-05-05",
  "created_at": "2026-05-05T08:33:26.910646+00:00"
}
```

---

### `public.perell_videos` — 594 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (30) | `id` (int32, not null), `video_id` (text, not null), `title` (text, not null), `writer_name` (text, not null), `writer_slug` (text, not null), `published_at` (text), `description` (text), `thumbnail_url` (text), `view_count` (int64), `like_count` (int64), `comment_count` (int64), `duration` (text), `tags` (text[]), `niche` (text), `key_methods` (text), `writing_process_details` (text), `inspiration_sources` (text), `notable_quotes` (text), `writing_philosophy` (text), `technical_techniques` (text), `style_characteristics` (text), `ai_style_guide` (text), `references_mentioned` (text), `recommended_books` (text), `career_journey` (text), `unique_insights` (text), `actionable_advice` (text), `publications` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "video_id": "NRGg8988dfE",
  "title": "Brainstorming Sessions Are Ridiculous — Wright Thompson",
  "writer_name": "Wright Thompson",
  "writer_slug": "wright-thompson",
  "published_at": "2026-05-03",
  "description": "*About the host*\nHey! I’m David Perell and I’m a writer, teacher, and podcaster. I believe writing online is one of the biggest opportunities in the world today. For the first time in human history, everybody can freely share their ideas with a global audience. I seek to help as many people publish their writing online as possible.\n\n*Follow me*\nApple: https://podcasts.apple.com/us/podcast/how-i-write/id1700171470\nYouTube: https://www.youtube.com/@DavidPerellChannel\nSpotify: https://open.spotify.com/show/2DjMSboniFAeGA8v9NpoPv\nX: https://x.com/david_perell",
  "thumbnail_url": "https://i.ytimg.com/vi/NRGg8988dfE/maxresdefault.jpg",
  "view_count": 1746,
  "like_count": 59,
  "comment_count": 1,
  "duration": "PT35S",
  "tags": [
    "writing advice",
    "how to write",
    "writing guide",
    "writing",
    "advice",
    "writing lessons",
    "writing books",
    "writing online",
    "writing essays",
    "writing articles"
  ],
  "niche": "Long-form narrative non-fiction, sports journalism, Southern cultural history.",
  "key_methods": "[REDACTED]",
  "writing_process_details": "Thompson is famous for 'The Board'—a massive physical wall in his office where he pins index cards representing scenes. He color-codes these cards to track different narrative threads. He writes in a dedicated 'shed' or office, often starting early in the morning, and refuses to begin the actual writing process until he has 'over-reported' the subject to the point of saturation.",
  "inspiration_sources": "Southern Gothic literature, the history of the Mississippi Delta, the reporting of David Halberstam, the prose of Barry Hannah and William Faulkner, and the craftsmanship of high-end bourbon making.",
  "notable_quotes": "'Writing is just manual labor for people who don't want to lift heavy things.'\n'The story isn't what happened; the story is the ghost that haunts the person it happened to.'",
  "writing_philosophy": "Writing is an act of endurance and reporting. Thompson believes that if you report deeply enough, the story will eventually tell you how it needs to be written. He views the writer as a craftsman, akin to a carpenter or a distiller, where the quality of the 'raw materials' (facts/observations) determines the final product.",
  "technical_techniques": "Use of index cards for scene-shuffling, color-coding themes on a physical wall, 'staying in the chair' (brute force word counts), and the 'Deep Hang' (spending weeks with a subject without an interview script).",
  "style_characteristics": "Atmospheric, rhythmic, melancholic, sensory-rich, Southern Gothic influence, deeply researched.",
  "ai_style_guide": "To mimic Wright Thompson's writing style:\n1. Root every narrative in a specific sense of 'Place,' treating the geography as a character with its own history and ghosts.\n2. Use rhythmic, almost liturgical sentence structures, often employing polysyndeton (repeating conjunctions like 'and') to create a sense of momentum.\n3. Focus on the 'internal weather' of your subjects, looking for the melancholy or the 'haunting' behind their public success.\n4. Incorporate heavy sensory details—specifically the smells of tobacco, old wood, rain, or sweat—to create an atmospheric, Southern Gothic tone.\n5. Use 'The Board' method for structure: organize the piece into distinct, cinematic scenes rather than a linear list of facts.\n6. Employ a 'High-Low' vocabulary, mixing elevated, literary prose with the grit and vernacular of the people you are covering.",
  "references_mentioned": "William Faulkner, Barry Hannah, David Halberstam, Michael Lewis, Gabriel García Márquez.",
  "recommended_books": "The Barn by Wright Thompson, Pappyland by Wright Thompson, Dispatches by Michael Herr, The Best and the Brightest by David Halberstam.",
  "career_journey": "Raised in Clarksdale, Mississippi, Thompson attended the University of Missouri's journalism school. He rose to prominence as a Senior Writer for ESPN.com and ESPN The Magazine, becoming the preeminent voice in long-form sports profiles. He has since transitioned into a best-selling author focusing on Southern heritage, lineage, and history.",
  "unique_insights": "1. Brainstorming is a corporate myth; true narrative structure is discovered through the 'manual labor' of reporting. 2. Every great profile is actually a story about a person's relationship with their father or their home. 3. The physical layout of a story (on a wall) reveals structural flaws that a digital screen hides.",
  "actionable_advice": "1. Stop 'brainstorming' and start reporting; the structure of a piece should emerge from the facts gathered, not a whiteboard session. 2. Identify the 'Ghost' of your subject—the internal trauma or historical weight that drives their current actions. 3. Use a physical 'Board' to map your story; seeing the physical weight of scenes helps identify where the narrative sags. 4. Write the 'smell' of the room before the dialogue; sensory grounding makes the reader trust the reporter.",
  "publications": "Pappyland, The Cost of These Dreams, The Barn: The Secret History of a Murder in Mississippi, ESPN The Magazine.",
  "created_at": "2026-05-04T02:38:00.755199+00:00",
  "updated_at": "2026-05-04T02:38:00.755199+00:00"
}
```

---

### `public.tech_tools` — 527 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (26) | `id` (uuid, not null), `tool_name` (text, not null), `tool_name_normalized` (text), `deal_page` (text), `function_description` (text), `benefits` (text), `login_page` (text), `features` (text), `codes_budget` (text), `installation_instructions` (text), `category` (text), `department` (text), `status` (text), `is_active` (boolean), `is_dead` (boolean), `is_lifetime_deal` (boolean), `credential_registry_id` (uuid), `cost_tracking_id` (text), `viability_score` (int32), `evaluator_notes` (text), `last_evaluated_at` (timestamp with time zone), `source_sheet` (text), `source_row` (int32), `metadata` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "03afe77b-88cc-4543-8a29-db10a5bd75de",
  "tool_name": "Waybook",
  "tool_name_normalized": "waybook",
  "deal_page": "https://appsumo.com/products/waybook/",
  "function_description": "Waybook is a powerful tool to turn your documents, processes, and know-how into effective and organized onboarding, training, and reference materials.",
  "benefits": "Waybook lets you quantify your team’s knowledge with multiple choice quizzes and tests to make sure your employees have read and understood the content.  You can create simple quizzes and complex tests with a minimum percentage employees have to score to certify excellence and ensure compliance.",
  "login_page": "https://secure.waybook.com/login?next=%2Foauth%2Fauthorize%3Fresponse_type%3Dcode%26client_id%3Dwaybook_web%26code_challenge%3DkP5Sco2Bnn3_BtVU-KmJyYBj4utxqDCp_845kt_IAFE%26code_challenge_method%3DS256%26redirect_uri%3Dhttps%253A%252F%252Fapp.waybook.com%252Foauth-callback%26state%3D%252Fglobal%252Fteams%26domain%3Dapp.waybook.com&domain=app.waybook.com",
  "features": "Lifetime access to Waybook Core Plan   You must redeem your code(s) within 60 days of purchase   All future Core Plan updates   Stack up to 5 codes   GDPR Compliant   Only for new Waybook users who do not have existing accounts   60-day money-back guarantee, no matter the reason",
  "codes_budget": "$49.00",
  "installation_instructions": null,
  "category": "ai_ml",
  "department": "AI & Engineering",
  "status": "unreviewed",
  "is_active": false,
  "is_dead": false,
  "is_lifetime_deal": true,
  "credential_registry_id": null,
  "cost_tracking_id": null,
  "viability_score": null,
  "evaluator_notes": null,
  "last_evaluated_at": null,
  "source_sheet": "Tech Tools/ LTDs - ZM LTD Tech Tools",
  "source_row": 342,
  "metadata": "{\"viability_score\": 58, \"viability_tier\": \"A\", \"viability_flags\": [\"high_value_category\"], \"evaluated_at\": \"2026-04-25T18:34:25.491049+00:00\"}",
  "created_at": "2026-04-25T17:56:38.990438+00:00",
  "updated_at": "2026-04-25T17:56:38.990438+00:00"
}
```

---

### `public.token_usage` — 401 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (int64, not null), `agent_id` (text, not null), `model` (text), `input_tokens` (int32), `output_tokens` (int32), `estimated_cost_usd` (real), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "agent_id": "crm-agent",
  "model": "claude-sonnet-4-20250514",
  "input_tokens": "[REDACTED]",
  "output_tokens": "[REDACTED]",
  "estimated_cost_usd": 0.42,
  "created_at": "2026-04-20T06:15:00+00:00"
}
```

---

### `public.fgs_products` — 372 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (26) | `id` (uuid, not null), `product_id` (text, not null), `product_line` (text, not null), `title` (text, not null), `collection` (text), `sub_type` (text), `recipient` (text), `theme` (text), `message_text` (text), `scent_profile` (text), `design_style` (text), `graphic_design_spec` (text), `colors` (text), `retail_price` (numeric), `cost` (numeric), `profit` (numeric), `margin_pct` (numeric), `platform` (text), `graphic_url` (text), `approval_status` (text), `shopify_url` (text), `shopify_product_id` (text), `teable_record_id` (text), `notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "ea34db21-81e1-4185-afab-e3e90d790541",
  "product_id": "FGS-0001",
  "product_line": "jewelry",
  "title": "\"A praying woman is the most...\" — Love Knot Necklace for Wife",
  "collection": null,
  "sub_type": "Love Knot Necklace",
  "recipient": "Wife",
  "theme": "Faith & Prayer",
  "message_text": "A praying woman is the most powerful force in any family - you are that woman",
  "scent_profile": null,
  "design_style": null,
  "graphic_design_spec": "Type: Message Card (4×6 inch)\nLayout: Letter-style, handwritten-feel typography\nBorder: Decorative floral/geometric frame\nHero Text: The message card text\nMood: Faith & Prayer — emotional, gift-worthy\nRecipient Feel: Speaks to wife",
  "colors": "Cream: #F5F0EB\nRose Gold: #B76E79\nBlack: #1A1A1A\nGold: #C4A35A\nDusty Rose: #D4A0A0\nSage Green: #8FAE8B",
  "retail_price": 89,
  "cost": 14.5,
  "profit": 74.5,
  "margin_pct": 83.7,
  "platform": "ShineOn",
  "graphic_url": null,
  "approval_status": "pending",
  "shopify_url": null,
  "shopify_product_id": null,
  "teable_record_id": null,
  "notes": null,
  "created_at": "2026-05-13T15:58:53.027367+00:00",
  "updated_at": "2026-05-13T15:58:53.027367+00:00"
}
```

---

### `public.pipeline_queue` — 332 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `stage` (text, not null), `status` (text), `payload` (jsonb), `result` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "a2170df7-b119-4b63-aedf-73795b958d71",
  "stage": "disk_alert",
  "status": "pending",
  "payload": {
    "timestamp": "2026-04-20 06:00:02",
    "data_usage": 5,
    "root_usage": 92
  },
  "result": null,
  "created_at": "2026-04-20T06:00:02.472541+00:00",
  "updated_at": "2026-04-20T06:00:02.472541+00:00"
}
```

---

### `public.credit_balances` — 292 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `provider` (text, not null), `workspace` (text), `total_credits` (numeric), `used_credits` (numeric), `remaining_credits` (numeric), `currency` (text), `plan_name` (text), `raw_response` (jsonb), `polled_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "8baa364a-4fb6-45c9-ad0c-38e3e5127af3",
  "provider": "openrouter",
  "workspace": "viktor_agent",
  "total_credits": 123.55,
  "used_credits": 103.047447892,
  "remaining_credits": 20.502552108000003,
  "currency": "USD",
  "plan_name": "Pay-as-you-go",
  "raw_response": {
    "total_usage": 103.047447892,
    "total_credits": 123.55
  },
  "polled_at": "2026-05-16T23:07:12.953423+00:00",
  "created_at": "2026-05-16T23:07:13.00862+00:00"
}
```

---

### `public.umdm_governance_violations` — 238 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `rule_id` (uuid), `brand_id` (uuid), `campaign_id` (uuid), `ad_set_id` (uuid), `ad_id` (uuid), `violation_date` (timestamp with time zone), `details` (text, not null), `severity` (character varying, not null), `status` (character varying), `resolved_at` (timestamp with time zone), `resolved_by` (character varying), `clickup_task_id` (character varying), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "0920a922-51a1-40c6-9dc4-4e6eaafbf377",
  "rule_id": "74afcc7d-48df-4ce6-a471-13d36af90f25",
  "brand_id": "a781c104-aa8b-43f3-a131-214f687cd438",
  "campaign_id": "8dccd1d3-84da-4cc0-9f1b-fb0a9fd145d3",
  "ad_set_id": null,
  "ad_id": null,
  "violation_date": "2026-05-21T11:00:38.428394+00:00",
  "details": "Name 'Traffic: Ad to Manychat to Live Webinar Registration' doesn't match pattern brand_channel_objective_audience_type_date",
  "severity": "critical",
  "status": "resolved",
  "resolved_at": "2026-05-21T12:21:40.655567+00:00",
  "resolved_by": "viktor_bulk_rename",
  "clickup_task_id": null,
  "created_at": "2026-05-21T11:00:38.428394+00:00"
}
```

---

### `public.clickup_sync` — 210 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `clickup_task_id` (text, not null), `clickup_task_name` (text), `clickup_list_id` (text), `clickup_list_name` (text), `clickup_folder` (text), `clickup_status` (text), `clickup_priority` (text), `clickup_url` (text), `clickup_tags` (jsonb), `dispatch_session_id` (text), `sync_status` (text), `last_synced_at` (timestamp with time zone), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "361f88f9-cd79-43de-9138-da213cd98932",
  "clickup_task_id": "86e0zm0ev",
  "clickup_task_name": "Oracle log rotation: sudo systemctl restart docker",
  "clickup_list_id": "901712900200",
  "clickup_list_name": "Needs Action",
  "clickup_folder": "dispatch",
  "clickup_status": "Closed",
  "clickup_priority": "urgent",
  "clickup_url": "https://app.clickup.com/t/86e0zm0ev",
  "clickup_tags": [],
  "dispatch_session_id": "oracle-browserless",
  "sync_status": "synced",
  "last_synced_at": "2026-04-20T20:00:12.81755+00:00",
  "created_at": "2026-04-20T20:00:12.81755+00:00",
  "updated_at": "2026-04-20T20:00:12.81755+00:00"
}
```

---

### `public.umdm_ads` — 207 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `ad_set_id` (uuid), `external_id` (character varying, not null), `ad_name` (character varying, not null), `creative_type` (character varying), `headline` (character varying), `body_text` (text), `creative_url` (character varying), `landing_page_url` (character varying), `status` (character varying), `raw_data` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "36faf0aa-bc3e-4d97-b066-30a452cc505f",
  "ad_set_id": "4b81a103-b05e-4aa7-960b-3e5b61772ccd",
  "external_id": "23847878851260140",
  "ad_name": "AD 3 _SHOP NOW _PDP _HDL 1 _COPY 1",
  "creative_type": "image",
  "headline": "",
  "body_text": "",
  "creative_url": "",
  "landing_page_url": "",
  "status": "paused",
  "raw_data": {
    "id": "23847878851260140",
    "name": "AD 3 _SHOP NOW _PDP _HDL 1 _COPY 1",
    "status": "PAUSED",
    "adset_id": "23847878851310140",
    "creative": {
      "id": "23847879256190140"
    }
  },
  "created_at": "2026-05-16T07:15:14.41966+00:00",
  "updated_at": "2026-05-16T07:15:14.41966+00:00"
}
```

---

### `public.umdm_v_cross_channel_daily` — 194 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (16) | `brand_code` (character varying), `brand_name` (character varying), `channel_code` (character varying), `channel_name` (character varying), `metric_date` (date), `total_spend` (numeric), `total_impressions` (numeric), `total_clicks` (numeric), `blended_ctr` (numeric), `blended_cpc` (numeric), `total_conversions` (int64), `blended_cpa` (numeric), `total_revenue` (numeric), `blended_roas` (numeric), `total_orders` (int64), `blended_aov` (numeric) |

**Sample row (sensitive fields redacted):**
```json
{
  "brand_code": "ip",
  "brand_name": "InsightProfit",
  "channel_code": "meta",
  "channel_name": "Meta Ads",
  "metric_date": "2025-04-14",
  "total_spend": 3.06,
  "total_impressions": 359,
  "total_clicks": 35,
  "blended_ctr": 9.749303621169917,
  "blended_cpc": 0.08742857142857142,
  "total_conversions": 0,
  "blended_cpa": 0,
  "total_revenue": 0,
  "blended_roas": 0,
  "total_orders": 0,
  "blended_aov": 0
}
```

---

### `public.umdm_v_portfolio_daily` — 194 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (10) | `metric_date` (date), `total_spend` (numeric), `total_impressions` (numeric), `total_clicks` (numeric), `total_conversions` (int64), `total_revenue` (numeric), `portfolio_roas` (numeric), `portfolio_cpa` (numeric), `brands_active` (int64), `channels_active` (int64) |

**Sample row (sensitive fields redacted):**
```json
{
  "metric_date": "2025-04-14",
  "total_spend": 3.06,
  "total_impressions": 359,
  "total_clicks": 35,
  "total_conversions": 0,
  "total_revenue": 0,
  "portfolio_roas": 0,
  "portfolio_cpa": 0,
  "brands_active": 1,
  "channels_active": 1
}
```

---

### `public.publications` — 182 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (24) | `id` (uuid, not null), `name` (text, not null), `category` (text), `traffic_monthly` (text), `submission_url` (text), `topics` (text), `editors` (jsonb), `pay_min` (numeric), `pay_max` (numeric), `pay_video_min` (numeric), `pay_video_max` (numeric), `acceptance_rate` (numeric), `avg_response_days` (numeric), `article_styles` (text), `notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `slug` (text, not null), `source_tags` (text[]), `application_form_urls` (jsonb), `call_for_pitches` (jsonb), `column_opportunities` (jsonb), `pay_structure` (text), `metadata` (jsonb) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "37f9c6e5-b645-4a84-b50f-b5fbe9a9e1b2",
  "name": "Entrepreneur",
  "category": "Business",
  "traffic_monthly": null,
  "submission_url": null,
  "topics": null,
  "editors": [],
  "pay_min": null,
  "pay_max": null,
  "pay_video_min": null,
  "pay_video_max": null,
  "acceptance_rate": null,
  "avg_response_days": null,
  "article_styles": null,
  "notes": "Skeleton record (needs verified editor contact + pay range).",
  "created_at": "2025-12-30T00:43:48.57325+00:00",
  "updated_at": "2025-12-30T00:43:48.57325+00:00",
  "slug": "entrepreneur",
  "source_tags": [],
  "application_form_urls": [],
  "call_for_pitches": [],
  "column_opportunities": [],
  "pay_structure": null,
  "metadata": {}
}
```

---

### `public.perell_writers` — 114 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (17) | `id` (int32, not null), `name` (text, not null), `slug` (text, not null), `video_count` (int32), `total_views` (int64), `total_likes` (int64), `thumbnail_url` (text), `niche` (text), `publications` (text), `key_methods` (text), `writing_philosophy` (text), `style_characteristics` (text), `ai_style_guide` (text), `career_journey` (text), `recommended_books` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "name": "David Perell",
  "slug": "david-perell",
  "video_count": 377,
  "total_views": 5099957,
  "total_likes": 145418,
  "thumbnail_url": "https://i.ytimg.com/vi/DvMl5Wvx0KM/maxresdefault.jpg",
  "niche": "Writing online, content creation, social media",
  "publications": "Why This Band Has Gone So Viral on TikTok (YouTube video)",
  "key_methods": "[REDACTED]",
  "writing_philosophy": "Helping viewers improve their writing",
  "style_characteristics": "Analytical, focuses on providing insights",
  "ai_style_guide": "To mimic David Perell's writing style, focus on an analytical approach, explore reasons behind a topic's success, and provide insights in a clear and accessible manner. Create content that helps viewers improve their skills or understanding of a subject.",
  "career_journey": "Writer, teacher, and podcaster",
  "recommended_books": "",
  "created_at": "2026-05-04T02:38:00.725896+00:00",
  "updated_at": "2026-05-04T02:38:00.725896+00:00"
}
```

---

### `public.ops_clients` — 108 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (22) | `id` (int32, not null), `source_sheet_id` (text, not null), `client_name` (text, not null), `project_type` (text), `industry` (text), `budget_tier` (text), `status` (text), `research_links` (text), `brand_notes` (text), `automation_status` (text), `asset_links` (text), `website_url` (text), `brand_assets_folder` (text), `gamma_link` (text), `canva_whiteboard` (text), `primary_color` (text), `secondary_color` (text), `accent_color` (text), `neutral_color` (text), `typeset_link` (text), `raw_data` (jsonb), `synced_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "source_sheet_id": "1dAaIzYLrjgUzDLAV7iWygrAhud7NG47mzyf1O85XQJE",
  "client_name": "Family Gift Studio",
  "project_type": "E-commerce Only",
  "industry": "Relationships",
  "budget_tier": "Enterprise",
  "status": "",
  "research_links": "https://mobbin.com/sites/sweetgreen-3a8c73ae-df68-440d-a410-4fc42c123a91/3b97e56e-20b8-4dcb-a4b6-1eb428b125b1/preview",
  "brand_notes": "https://docs.google.com/document/d/1tebSFcgny2XJbWhWUXMAO2Wc005tZ0a38wlDds4tSok/edit?usp=sharing\nhttps://docs.google.com/document/d/1BVFZAtfLdOQ8yZUfd-7sGsvHyiTe3tak1n2pFiH8z68/edit?usp=sharing",
  "automation_status": "",
  "asset_links": "",
  "website_url": "",
  "brand_assets_folder": "",
  "gamma_link": "",
  "canva_whiteboard": "",
  "primary_color": "",
  "secondary_color": "",
  "accent_color": "",
  "neutral_color": "",
  "typeset_link": "",
  "raw_data": "{\"Client Name\": \"Family Gift Studio\", \"Project Type\": \"E-commerce Only\", \"Industry\": \"Relationships\", \"Budget Tier\": \"Enterprise\", \"Status\": \"\", \"Research Links\": \"https://mobbin.com/sites/sweetgreen-3a8c73ae-df68-440d-a410-4fc42c123a91/3b97e56e-20b8-4dcb-a4b6-1eb428b125b1/preview\", \"Brand Notes\": \"https://docs.google.com/document/d/1tebSFcgny2XJbWhWUXMAO2Wc005tZ0a38wlDds4tSok/edit?usp=sharing\\nhttps://docs.google.com/document/d/1BVFZAtfLdOQ8yZUfd-7sGsvHyiTe3tak1n2pFiH8z68/edit?usp=sharing\", \"Automation Status\": \"\", \"Asset Links (NEW)\": \"\", \"Website URL (NEW)\": \"\", \"Brand Assets Folder (NEW)\": \"\", \"Gamma Link\": \"\", \"Canva Whiteboard\": \"\", \"Primary Color\": \"\", \"Secondary Color\": \"\", \"Accent Color 1\": \"\", \"Accent Color 2\": \"\", \"Neutral Color\": \"\", \"Typeset Link\": \"\"}",
  "synced_at": "2026-04-20T23:03:42.731558+00:00"
}
```

---

### `public.dispatch_sessions` — 89 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (17) | `id` (text, not null), `title` (text, not null), `status` (text, not null), `outcome` (text), `department` (text), `started_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `progress_pct` (int32), `estimated_cost_usd` (real), `actual_cost_usd` (real), `agent_id` (text), `stall_detected_at` (timestamp with time zone), `last_heartbeat` (timestamp with time zone), `clickup_task_id` (text), `clickup_url` (text), `priority` (text), `tags` (jsonb) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "fgs-sentiment-mining",
  "title": "FGS Sentiment Mining — 122 KB records",
  "status": "completed",
  "outcome": "122 items ingested (120 sentiments + 2 competitor docs)",
  "department": "Brand & Creative",
  "started_at": "2026-04-19T03:45:50.029438+00:00",
  "updated_at": "2026-04-19T03:45:50.029438+00:00",
  "progress_pct": 100,
  "estimated_cost_usd": 0,
  "actual_cost_usd": 0,
  "agent_id": null,
  "stall_detected_at": null,
  "last_heartbeat": "2026-04-19T03:45:50.029438+00:00",
  "clickup_task_id": null,
  "clickup_url": null,
  "priority": null,
  "tags": []
}
```

---

### `public.publication_templates` — 88 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (36) | `id` (uuid, not null), `publication_id` (uuid), `publication_name` (text, not null), `reading_level` (int32), `word_count_min` (int32), `word_count_max` (int32), `tone` (text), `voice` (text), `tense` (text), `headline_style` (text), `opening_style` (text), `subheading_frequency` (int32), `paragraph_length` (text), `conclusion_style` (text), `citations_required` (boolean), `citation_style` (text), `expert_quotes_required` (boolean), `min_sources` (int32), `data_driven` (boolean), `news_pegged_preferred` (boolean), `preferred_angles` (jsonb), `avoid_topics` (jsonb), `seasonal_preferences` (jsonb), `pitch_format` (text), `pitch_length_words` (int32), `pitch_requirements` (text), `follow_up_policy` (text), `example_headlines` (jsonb), `example_ledes` (jsonb), `successful_article_urls` (jsonb), `seo_keywords_required` (boolean), `social_media_hooks` (boolean), `multimedia_preferred` (boolean), `full_style_guide` (text), `last_updated` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "2421a486-10f8-4e7d-bf5c-87aeea9678ad",
  "publication_id": null,
  "publication_name": "AARP",
  "reading_level": null,
  "word_count_min": null,
  "word_count_max": null,
  "tone": null,
  "voice": null,
  "tense": null,
  "headline_style": null,
  "opening_style": null,
  "subheading_frequency": 250,
  "paragraph_length": "short",
  "conclusion_style": "summary + CTA",
  "citations_required": true,
  "citation_style": "in-text",
  "expert_quotes_required": true,
  "min_sources": 2,
  "data_driven": true,
  "news_pegged_preferred": false,
  "preferred_angles": [
    "contrarian",
    "trend-analysis",
    "how-to"
  ],
  "avoid_topics": [],
  "seasonal_preferences": null,
  "pitch_format": "email",
  "pitch_length_words": 180,
  "pitch_requirements": "Use subject template: [Publication] Pitch: [Data Point or Contrarian Hook]. Include angle, why-now, 2-3 bullets (why it works), 4-bullet outline, delivery timeline, samples, CTA question.",
  "follow_up_policy": "Follow up once after 7-10 business days.",
  "example_headlines": [],
  "example_ledes": [],
  "successful_article_urls": [],
  "seo_keywords_required": "[REDACTED]",
  "social_media_hooks": false,
  "multimedia_preferred": false,
  "full_style_guide": "Starter template. Replace with verified publication-specific style and pitch guidelines.",
  "last_updated": "2025-12-30T00:43:48.65104+00:00",
  "created_at": "2025-12-30T00:43:48.65104+00:00"
}
```

---

### `public.offer_pipeline` — 83 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (23) | `id` (text, not null), `name` (text, not null), `category` (text), `business_line` (text), `description` (text), `price_point` (text), `website_url` (text), `repo` (text), `vercel_status` (text), `readiness_score` (int32), `items_ready` (int32), `items_total` (int32), `items_missing` (jsonb), `items_complete` (jsonb), `checklist` (jsonb), `updated_at` (timestamp with time zone), `hormozi_score` (jsonb), `unicorn_score` (jsonb), `fladlien_webinar` (jsonb), `data_model` (jsonb), `buyer_avatar` (jsonb), `social_pipeline` (jsonb), `monetization_strategy` (jsonb) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "course-supplements",
  "name": "Second Spring Supplement Empire",
  "category": "Course",
  "business_line": "Second Spring",
  "description": "Course #10 — Supliful supplement brand empire",
  "price_point": "$497",
  "website_url": "https://sites.insightprofit.live/premium/second-spring-supplement-empire",
  "repo": "rtmendes/second-spring-supplements",
  "vercel_status": "deployed",
  "readiness_score": 82,
  "items_ready": 18,
  "items_total": 22,
  "items_missing": [
    "Stripe/Payment Link",
    "Blog/Authority Articles",
    "Product Images/Graphics",
    "SEO/Topical Authority",
    "AI Customer Service Chatbot",
    "Acquisition-Ready Documentation",
    "Voice AI Agent"
  ],
  "items_complete": [
    "Website Live",
    "Landing Page",
    "Product/Fulfillment",
    "Google Sheet",
    "ClickUp Tasks",
    "Workbook PDF",
    "Email Sequences (Welcome + Nurture)",
    "Social Media Posts (10+)",
    "VSL (Video Sales Letter)",
    "Social Media Ads + Hooks",
    "Copywriting / Sales Copy",
    "SLO (Self-Liquidating Offer)",
    "Lead Magnet / Tripwire",
    "Affiliate Offers Embedded",
    "Audience Avatar Defined",
    "Marketing Assets Pack",
    "Advertorials",
    "Email Sequence",
    "Social Media Posts",
    "Video Sales Letter (VSL)",
    "Marketing Ads",
    "Sales Copywriting",
    "Self-Liquidating Offer (SLO)",
    "Affiliate Offers",
    "Audience/Avatar",
    "Advertorial",
    "email_sequence",
    "social_media_posts",
    "video_sales_letter",
    "marketing_ads",
    "copywriting",
    "slo_offer",
    "advertorial",
    "affiliate_offers",
    "audience_avatar",
    "product_images",
    "blog_articles",
    "seo_authority"
  ],
  "checklist": {
    "slo_offer": true,
    "advertorial": true,
    "copywriting": true,
    "stripe_link": false,
    "google_sheet": true,
    "landing_page": true,
    "website_live": true,
    "workbook_pdf": true,
    "blog_articles": true,
    "clickup_tasks": true,
    "marketing_ads": true,
    "seo_authority": true,
    "Voice AI Agent": false,
    "email_sequence": true,
    "product_images": true,
    "audience_avatar": true,
    "affiliate_offers": true,
    "social_media_posts": true,
    "video_sales_letter": true,
    "product_fulfillment": true,
    "AI Customer Service Chatbot": false,
    "Acquisition-Ready Documentation": false
  },
  "updated_at": "2026-05-01T19:45:43.91041+00:00",
  "hormozi_score": {
    "grade": "C",
    "raw_score": 1.68,
    "time_delay": 5,
    "dream_outcome": 6,
    "effort_required": 5,
    "normalized_score": 3.4,
    "perceived_likelihood": 7
  },
  "unicorn_score": {
    "tier": "📈 Solid",
    "data_moat": 4,
    "tam_score": 5,
    "scalability": 9,
    "margin_score": 9,
    "composite_score": 5.8,
    "recurring_revenue": 3,
    "acquisition_attractiveness": 6
  },
  "fladlien_webinar": {
    "hook": {
      "promise": "By the end of this session, you'll have a clear, actionable framework you can implement THIS WEEK — whether you buy anything or not.",
      "credibility": "This isn't theory. Second Spring Supplement Empire was built from real data, real failures, and real breakthroughs. I'll share all of it — including what didn't work.",
      "opening_line": "In the next 45 minutes, I'm going to show you the exact system behind Second Spring Supplement Empire — and why everything you've been told about course is costing you time, money, and sanity."
    },
    "pain": {
      "core_problem": "Most people in course are stuck in one of three traps: they're overwhelmed by options, undercut by competitors, or burning out doing everything manually.",
      "emotional_cost": "And the worst part? Every week you stay stuck, the gap between where you are and where you could be gets wider. That's not just a business problem — it's a life problem.",
      "why_existing_fails": "Traditional course approaches were designed for a different era. They require too much time, too much guesswork, and produce inconsistent results."
    },
    "close": {
      "urgency": "The bonuses are available this week only — after that, Second Spring Supplement Empire goes to regular pricing without the extras.",
      "final_cta": "Click below to get instant access to Second Spring Supplement Empire. You'll be inside the system within 2 minutes.",
      "guarantee": "Try Second Spring Supplement Empire for 30 days. If you don't see results, email us for a full refund. No hoops, no hassle, no hard feelings.",
      "objection_handling": [
        {
          "response": "That's exactly WHY you need Second Spring Supplement Empire. It's built to save you 10+ hours per week by systemizing what you're doing manually.",
          "objection": "I don't have time"
        },
        {
          "response": "If Second Spring Supplement Empire helps you generate even one additional sale, the ROI is 5-10x. This isn't an expense — it's an investment with a 30-day guarantee.",
          "objection": "It's too expensive"
        },
        {
          "response": "If you're in course and you want better results with less effort, yes. The system adapts to your specific situation — that's what makes it different.",
          "objection": "Will this work for me?"
        }
      ]
    },
    "title": "The Second Spring Supplement Empire Method: How Smart Course Practitioners Are Getting 10x Results Without the Usual Headaches",
    "excite": {
      "vision": "Imagine having a complete course system that handles the complexity for you — so you can focus on the parts of your business that actually energize you.",
      "proof_point": "The framework inside Second Spring Supplement Empire is based on Course #10 — Supliful supplement brand empire. It's not about working harder — it's about working with a system that's already been stress-tested.",
      "social_proof": "[Insert 2-3 case studies of people who got results using the Second Spring Supplement Empire approach]"
    },
    "position": {
      "authority": "This system synthesizes Fortune 100 methodologies, AI-powered automation, and proven course frameworks into one integrated approach.",
      "why_different": "Most solutions give you ONE piece of the puzzle. We give you the complete picture AND the step-by-step execution plan.",
      "unique_mechanism": "Second Spring Supplement Empire works differently because it approaches course as a system, not a series of random tactics. Every piece connects — from the first touchpoint to the final result."
    },
    "transition": {
      "bridge": "Everything I've taught you today is 100% actionable on its own. But if you want the complete Second Spring Supplement Empire system — with all the templates, automations, and support built in — here's what that looks like...",
      "value_stack": [
        "The complete Second Spring Supplement Empire framework ($497 value)",
        "Implementation templates & swipe files ($497 value)",
        "AI-powered automation toolkit ($997 value)",
        "Priority support community ($297 value)",
        "Quarterly strategy updates ($197/yr value)"
      ],
      "price_reveal": "Total value: $2,000+ → Your investment today: $497"
    },
    "style_notes": "Education-first. Teach real frameworks they can use today. No countdown timers, no fake scarcity, no 'but wait there's more.' Respect the audience's intelligence. Let the value speak for itself."
  },
  "data_model": {
    "kpis": [
      "Opt-in rate (target: 25%+)",
      "SLO conversion (target: 8-15%)",
      "Core offer conversion (target: 3-8%)",
      "Premium upsell rate (target: 5-15%)",
      "Subscription retention (target: 85%+ monthly)",
      "Affiliate revenue per customer",
      "30-day customer value",
      "90-day customer value"
    ],
    "revenue_model": {
      "slo": {
        "name": "Second Spring Supplement Empire Quick-Start",
        "price": 35,
        "purpose": "Self-liquidating to cover ad spend"
      },
      "core": {
        "name": "Second Spring Supplement Empire",
        "price": 497,
        "purpose": "Primary offer — main revenue driver"
      },
      "premium": {
        "name": "Second Spring Supplement Empire Premium",
        "price": 1491,
        "purpose": "High-ticket upsell — VIP/done-for-you"
      },
      "subscription": {
        "name": "Second Spring Supplement Empire Insider",
        "purpose": "Recurring backend revenue",
        "price_monthly": 50
      },
      "affiliate_cross_sell": {
        "purpose": "Cross-sell ecosystem offers",
        "commission_rate": "30-50%"
      }
    },
    "unit_economics": {
      "cac_target": 28,
      "ltv_estimate": 1056,
      "ltv_to_cac_ratio": "Target: 5:1+",
      "target_monthly_customers": 168
    },
    "data_collection": [
      "UTM tracking on all traffic sources",
      "Pixel/CAPI for attribution",
      "Email engagement metrics",
      "Webinar attendance & replay rates",
      "Cart abandonment tracking",
      "Post-purchase survey (NPS)",
      "Refund rate & reasons",
      "Support ticket volume & resolution"
    ]
  },
  "buyer_avatar": {
    "primary_buyer": {
      "mindset": "Someone actively looking to solve a problem that Second Spring Supplement Empire addresses — not someone browsing for free tips",
      "buying_signals": [
        "how much is this",
        "where do I sign up",
        "does this work for",
        "I've been looking for exactly this",
        "DM me the link"
      ],
      "impulse_triggers": [
        "transformation urgency",
        "fear of missing trend",
        "competitive advantage anxiety",
        "skill gap pain"
      ],
      "qualification_question": "Are you currently spending money or time trying to solve [Course #10 — Supliful supplement brand empire]? If yes, you're our person.",
      "disqualification_signals": [
        "Asks 'is there a free version?' repeatedly",
        "Wants all info before committing to anything",
        "Compares to free alternatives without valuing time savings",
        "Engages with content but never clicks links",
        "Asks questions answered in the first paragraph"
      ]
    },
    "content_consumption": {
      "attention_span": "3-7 seconds to hook, 30-60 seconds to convert interest, <3 min to purchase decision",
      "trust_builders": [
        "real results",
        "behind-the-scenes",
        "user testimonials",
        "founder story (authentic, not polished)"
      ],
      "preferred_formats": [
        "short-form video (Reels/TikTok)",
        "carousel posts",
        "before/after stories",
        "screenshot proof"
      ]
    },
    "psychographic_profile": {
      "values": "Results over information. Time over money. Systems over guesswork.",
      "pain_state": "Currently frustrated with course — has tried free solutions and they didn't work",
      "price_sensitivity": "Comfortable with $497 if value is clear. Not looking for cheapest — looking for most effective.",
      "purchase_psychology": "Impulse-buy friendly when they see: social proof + clear outcome + low perceived risk (guarantee)",
      "readiness_indicator": "Already spending money in this space (competitor products, courses, tools)"
    },
    "freebie_filter_strategy": "Courses attract info-hoarders. Lead with OUTCOME not curriculum. Never list all modules publicly. Show transformation + price early to repel tire-kickers."
  },
  "social_pipeline": {
    "intent_capture": [
      {
        "cta": "Comment 'READY' and I'll DM you the link",
        "body": "Genuine resource that solves ONE specific problem. Gate it behind a comment + follow + DM. This is your lead magnet entry into the Second Spring Supplement Empire funnel.",
        "hook": "I built a [$X value] course cheat sheet. First 50 people who [action] get it free.",
        "type": "resource_gate",
        "platform": "IG/FB/LinkedIn",
        "funnel_step": "Comment → Auto-DM → Lead magnet → Email sequence → SLO → Core offer",
        "boost_signal": "Comment-to-DM ratio > 60% = high-quality audience. Boost to similar."
      },
      {
        "cta": "Drop your #1 question in chat",
        "body": "30-min live. Answer real questions. When someone asks a complex question, say 'great question — I actually built a whole system for this. Link in bio if you want the deep dive.'",
        "hook": "Ask me anything about course — I'll answer honestly (even the stuff people charge $500 to teach)",
        "type": "live_q_and_a",
        "platform": "IG Live/YouTube",
        "funnel_step": "Live → Replay → Clips → Retarget viewers with SLO",
        "boost_signal": "Replay views > live views = strong content. Clip best moments for Reels/Shorts."
      },
      {
        "cta": "Bookmark this thread + follow for more",
        "body": "7-10 tweet thread. Real story, real steps, real results. Last tweet: 'If you want the full system + templates, I put everything in one place.'",
        "hook": "I helped someone go from [problem] to [result] in course. Here's the exact playbook (thread):",
        "type": "case_study_thread",
        "platform": "Twitter/LinkedIn",
        "funnel_step": "Thread → Profile click → Link in bio → SLO",
        "boost_signal": "Bookmark rate > 5% = promote thread as ad. High bookmark = high purchase intent."
      }
    ],
    "comment_scripts": [
      {
        "intent": "Move to DM for private qualification + close",
        "response": "Great question! I'll DM you the details — it's not for everyone but if it's a fit, I think you'll love it 🤝",
        "scenario": "Someone asks 'how much is this?'"
      },
      {
        "intent": "Overcome objection with proof, not pressure",
        "response": "I totally get that — I was skeptical too before I saw the results. Want me to send you a case study?",
        "scenario": "Someone says 'this looks too good to be true'"
      },
      {
        "intent": "Acknowledge without apologizing. Freebie seekers self-select out.",
        "response": "I share tons of free value in my posts! The paid version is for people who want the complete system + support. Both paths are valid 👊",
        "scenario": "Someone asks 'is there a free version?'"
      },
      {
        "intent": "Encourage viral loop without being pushy",
        "response": "Yes! Bring them along — this is way more fun with an accountability partner 🔥",
        "scenario": "Someone tags a friend"
      },
      {
        "intent": "Empathy → DM → qualify → offer if fit",
        "response": "I hear you — that's exactly why I created this. DM me and I'll share what specifically helped people in your situation.",
        "scenario": "Someone shares a personal struggle related to the offer"
      }
    ],
    "awareness_organic": [
      {
        "cta": "Comment 'same' if you've experienced this 👇",
        "body": "Share a genuine frustration → the moment of clarity → what changed. Mention the OUTCOME not the product. End with a question to drive comments.",
        "hook": "Nobody told me this about course until I figured it out the hard way.",
        "type": "story_post",
        "platform": "IG/FB/TikTok",
        "boost_signal": "50+ comments OR 200+ saves = boost to lookalike audience",
        "looks_like_ad": false
      },
      {
        "cta": "Agree or disagree? (Reply with your take)",
        "body": "Contrarian perspective that challenges conventional wisdom. Back with ONE specific data point or personal result. Don't mention any product.",
        "hook": "Unpopular opinion: The course industry is lying to you about what actually works.",
        "type": "hot_take",
        "platform": "Twitter/LinkedIn",
        "boost_signal": "100+ replies OR 50+ quote tweets = turn into ad with 'see what people are saying' angle",
        "looks_like_ad": false
      },
      {
        "cta": "Save this for later ⚡️",
        "body": "15-30 sec video. Show the transformation. Use trending audio if available. Text overlay with the key insight. No branding.",
        "hook": "POV: You finally stopped doing [common mistake] and everything changed",
        "type": "micro_story",
        "platform": "IG Reel/TikTok",
        "boost_signal": "10K+ views OR 500+ saves = boost with link-in-bio CTA added",
        "looks_like_ad": false
      }
    ],
    "boost_to_ad_rules": {
      "never_boost": [
        "Posts with < average engagement (don't force what's not working)",
        "Posts where most comments are negative or confused",
        "Posts older than 7 days (organic window passed)"
      ],
      "ad_creative_rules": [
        "Use the EXACT organic post — don't reformat it. Native look = higher CTR.",
        "Add only: CTA button + link. Don't add ad copy on top.",
        "Target: lookalike of engagers on that specific post",
        "Budget: start $10/day for 3 days. If CPA < target, scale to $50/day",
        "Kill if: CPA > 2x target after $50 spend"
      ],
      "organic_to_paid_criteria": [
        "Post reaches 2x your average engagement within 24 hours → boost for 3 days at $10/day",
        "Save rate > 5% → boost to lookalike of savers (highest purchase intent signal)",
        "DM rate > 2% of reach → boost and add automated DM follow-up",
        "Comment length avg > 10 words → boost to lookalike of commenters (research-phase buyers)",
        "Share rate > 3% → boost as social proof ad ('see what people are saying')"
      ]
    },
    "conversion_organic": [
      {
        "cta": "Swipe up to see it before anyone else",
        "body": "Behind-the-scenes peek at Second Spring Supplement Empire. Show the work, the late nights, the real product. Make it feel like they're getting early access, not being sold to.",
        "hook": "Something I've been quietly working on for months...",
        "type": "soft_launch",
        "platform": "IG Stories/FB Stories",
        "funnel_step": "Story → Landing page → SLO or direct purchase",
        "boost_signal": "Swipe-up rate > 3% = promote story as ad. This is direct purchase intent."
      },
      {
        "cta": "If you want results like [name], the link is in my bio",
        "body": "Screenshot of real customer DM/email showing results. Add context: what they were struggling with, what they did, what happened. Let the customer sell for you.",
        "hook": "Got this DM today and it made my whole week...",
        "type": "testimonial_native",
        "platform": "All",
        "funnel_step": "Testimonial → Retarget engaged users → Direct offer",
        "boost_signal": "ANY engagement on testimonial posts = retarget with direct offer. Testimonial posts have highest conversion rates."
      },
      {
        "cta": "Comment 'IN' or DM me to grab a spot",
        "body": "Real scarcity (genuinely limit it). Show what's included without being a laundry list. Focus on THE ONE result they'll get.",
        "hook": "Opening up 20 spots for Second Spring Supplement Empire this week — then closing enrollment",
        "type": "limited_access",
        "platform": "All",
        "funnel_step": "Post → Comment/DM → Payment link → Onboarding",
        "boost_signal": "'IN' comments = immediate DM with payment link. 20+ comments = boost to lookalike."
      }
    ],
    "engagement_qualifier": [
      {
        "cta": "DM me which number you picked",
        "body": "Carousel with 4-5 pain points as slides. Each slide = one specific problem. Last slide = 'If you picked 3+, you need a system (not more tips).'",
        "hook": "Which course struggle keeps you up at night?",
        "type": "poll_carousel",
        "platform": "IG/FB",
        "boost_signal": "DMs = highest-intent signal. Anyone who DMs gets manual or automated follow-up with SLO offer.",
        "qualification": "DM responders are 10x more likely to buy than commenters"
      },
      {
        "cta": "Want the breakdown? Drop a 🔥 and I'll send it",
        "body": "Show real or projected results from using Second Spring Supplement Empire's approach. Numbers, screenshots, tangible proof. No fluff.",
        "hook": "Month 1 vs Month 3 — here's what actually happened",
        "type": "before_after",
        "platform": "IG/FB/LinkedIn",
        "boost_signal": "Fire emoji reactions = buyer intent. Auto-DM with SLO link.",
        "qualification": "People who engage with PROOF content (not inspirational content) are 5x more likely to purchase"
      },
      {
        "cta": "Which myth surprised you most? Comment below",
        "body": "Debunk 3 common myths. Be genuinely helpful. Position yourself as the honest voice. Build trust by being anti-guru.",
        "hook": "3 things the course 'gurus' won't tell you (because they're selling you courses)",
        "type": "myth_buster",
        "platform": "All",
        "boost_signal": "Long comments (4+ words) = engagement quality. Boost to lookalike of long-commenters.",
        "qualification": "Long-form commenters are researching → closer to purchase decision"
      }
    ]
  },
  "monetization_strategy": {
    "streams": {
      "affiliate": {
        "stream": "AFFILIATE OFFERS",
        "eligible": true,
        "fulfillment": {
          "wired": false,
          "action_needed": "Sign up for top 3 aligned affiliate programs per offer",
          "checklist_toggle": "AFFILIATE_ELIGIBLE"
        },
        "setup_steps": [
          "1. Sign up for affiliate programs aligned with Second Spring Supplement Empire's audience",
          "2. Get unique affiliate links + tracking pixels for each program",
          "3. Create content assets (banners, review articles, email copy) per affiliate",
          "4. Embed in landing page, email sequences, and content articles",
          "5. Set up conversion tracking (postback URLs to our analytics)",
          "6. A/B test placements monthly — kill underperformers, scale winners"
        ],
        "monthly_target": "$300-$1,000/mo from affiliate commissions",
        "aligned_categories": [
          {
            "category": "Learning Tools",
            "examples": [
              "Teachable",
              "Kajabi",
              "Thinkific"
            ],
            "commission": "20-40%",
            "integration": "banner + email"
          },
          {
            "category": "Coaching Platforms",
            "examples": [
              "Calendly",
              "Zoom Pro",
              "Practice.do"
            ],
            "commission": "15-30%",
            "integration": "tool recommendation in curriculum"
          },
          {
            "category": "Productivity Tools",
            "examples": [
              "Notion",
              "ClickUp",
              "Asana"
            ],
            "commission": "10-25%",
            "integration": "resource list in course modules"
          },
          {
            "category": "Books/Programs",
            "examples": [
              "Amazon Associates",
              "Audible"
            ],
            "commission": "4-8%",
            "integration": "recommended reading list"
          }
        ],
        "integration_methods": {
          "banner_links": {
            "toggle": true,
            "tracking": "UTM parameters + affiliate pixel/postback URL",
            "placement": "Above fold sidebar, post-purchase thank-you page, blog articles",
            "description": "Display banners on offer landing page sidebar/footer"
          },
          "article_content": {
            "toggle": true,
            "tracking": "Link click tracking + conversion pixel",
            "placement": "Resource guides, tool reviews, comparison posts, tutorials",
            "description": "Blog articles with affiliate links naturally embedded"
          },
          "email_sequences": {
            "toggle": true,
            "tracking": "Email click → affiliate link → conversion tracking",
            "placement": "Day 3, 7, 14 of post-purchase sequence; weekly newsletter",
            "description": "Affiliate offers in nurture/post-purchase email sequences"
          },
          "quiz_survey_funnel": {
            "toggle": true,
            "tracking": "Quiz answer → recommendation → click → conversion",
            "placement": "After lead magnet quiz, personalized recommendations",
            "description": "Quiz results page recommends affiliate products based on answers"
          }
        }
      },
      "direct_sales": {
        "funnel": "Traffic → Lead Magnet → Email Sequence → SLO → Core Offer → Premium Upsell → Subscription Backend",
        "status": "active",
        "stream": "DIRECT SALES",
        "eligible": true,
        "tracking": {
          "metrics": [
            "conversion_rate",
            "avg_order_value",
            "ltv_30_day",
            "ltv_90_day",
            "refund_rate"
          ],
          "platform": "Stripe + GHL",
          "dashboard": "Command Center → Offer Pipeline"
        },
        "revenue_model": {
          "slo": {
            "price": 35,
            "purpose": "Self-liquidating offer to cover acquisition cost"
          },
          "core": {
            "price": 497,
            "purpose": "Main revenue driver"
          },
          "premium": {
            "price": 1491,
            "purpose": "High-ticket upsell / done-for-you / VIP"
          },
          "subscription": {
            "purpose": "Recurring backend revenue",
            "price_monthly": 50
          }
        },
        "monthly_target": "$2500/mo",
        "customers_needed": "5 core sales/mo"
      },
      "pay_per_lead_call": {
        "stream": "PAY-PER-LEAD / PAY-PER-CALL",
        "strategy": "Quiz funnel captures email + interest level. Hot leads (scored 7+) routed to partner coaching/consulting offers. Warm leads nurtured internally.",
        "ppc_value": null,
        "ppl_value": "$5-$25/lead",
        "ppl_buyers": [
          "coaching platforms",
          "masterclass sellers",
          "certification programs",
          "SaaS tools in the niche"
        ],
        "fulfillment": {
          "wired": false,
          "action_needed": "Sign up with PPL networks + negotiate rates with 3 aligned partners",
          "checklist_toggle": "PPL_ELIGIBLE"
        },
        "integration": {
          "payment": "Monthly invoice to lead buyers OR automated platform (LeadByte, Phonexa)",
          "tracking": "GHL pipeline with PPL/PPC stage, revenue tagged per partner",
          "call_routing": "N/A",
          "lead_capture": "Quiz/survey on landing page → GHL contact created → scored → routed"
        },
        "setup_steps": [
          "1. Create a lead capture form/quiz specific to Second Spring Supplement Empire's audience",
          "2. Define lead scoring criteria (demographics + intent signals)",
          "3. Identify 3-5 businesses who want these exact leads",
          "4. Set up lead routing: Hot leads → PPL partners, Warm leads → our nurture",
          "5. Configure GHL pipeline stage: 'PPL Qualified' with auto-webhook to partner",
          "6. Track: leads generated, leads sold, revenue per lead, partner satisfaction"
        ],
        "ppc_eligible": false,
        "ppl_eligible": true,
        "monthly_target": "$500-$1,500/mo from qualified leads"
      }
    },
    "category": "Course",
    "offer_name": "Second Spring Supplement Empire",
    "tracking_template": {
      "kpis": [
        "Revenue per stream (direct / PPL / affiliate)",
        "Cost per acquisition per stream",
        "Conversion rate per stream",
        "Customer lifetime value (all streams)",
        "Revenue per visitor (blended)"
      ],
      "ghl_pipeline_stages": [
        "New Lead",
        "Qualified (Direct)",
        "Qualified (PPL)",
        "Affiliate Click",
        "SLO Purchased",
        "Core Purchased",
        "Premium Upsell",
        "Subscription Active",
        "PPL Sold",
        "Affiliate Converted"
      ]
    },
    "revenue_projection": {
      "monthly": {
        "ppl_ppc": "$500-$1500",
        "affiliate": "$300-$1000",
        "direct_sales": "$1250-$3750",
        "total_per_offer": "$2050-$5250/mo"
      },
      "path_to_21m": "Need avg $21,084/mo per offer across all streams = $21084 which is stretch — focus on top performers",
      "annual_per_offer": "$24,600-$63,000",
      "portfolio_annual_83_offers": "$2,041,800-$5,229,000"
    },
    "monetization_readiness": {
      "ppl_wired": false,
      "next_action": "Wire Stripe for direct sales, sign up for top 3 affiliate programs, identify 3 PPL partner prospects",
      "streams_wired": 0,
      "affiliate_wired": false,
      "direct_sales_wired": false,
      "total_streams_eligible": 3
    }
  }
}
```

---

### `public.product_launches` — 77 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `title` (text, not null), `slug` (text, not null), `status` (public.launch_status, not null), `description` (text), `cover_image_url` (text), `tags` (text[]), `owner_email` (text), `launch_date` (date), `revenue_target` (numeric), `metadata` (jsonb), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "f50650ab-35be-4071-b1a4-3161c56ed849",
  "title": "SOP: Test Process",
  "slug": "sop-test-process",
  "status": "draft",
  "description": "Knowledge item: SOP: Test Process",
  "cover_image_url": null,
  "tags": [
    "sop",
    "test"
  ],
  "owner_email": "[REDACTED]",
  "launch_date": null,
  "revenue_target": null,
  "metadata": {
    "ki_id": "11d6ed70-ca95-4b21-94e8-fadb2e307ecb",
    "source": "knowledge_items",
    "item_type": "sop"
  },
  "created_at": "2026-04-17T17:16:21.591438+00:00",
  "updated_at": "2026-04-17T17:16:21.591438+00:00"
}
```

---

### `public.umdm_ad_sets` — 64 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `campaign_id` (uuid), `external_id` (character varying, not null), `ad_set_name` (character varying, not null), `status` (character varying), `targeting_summary` (text), `audience_type` (character varying), `daily_budget` (numeric), `bid_strategy` (character varying), `raw_data` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "149988f3-16d7-4809-9d58-81f0ca202f97",
  "campaign_id": "8d5ccd69-8ce9-43c6-b618-7b2773a5c699",
  "external_id": "23847879304440140",
  "ad_set_name": "07.08 _1%,3%,10% LLA _9.7M",
  "status": "paused",
  "targeting_summary": "{\"age_max\": 65, \"age_min\": 35, \"genders\": [2], \"geo_locations\": {\"countries\": [\"US\"], \"location_types\": [\"home\", \"recent\"]}, \"brand_safety_content_filter_levels\": [\"FACEBOOK_STANDARD\", \"AN_STANDARD\"], \"targeting_relaxation_types\": {\"lookalike\": 0, \"custom_audience\": 0}}",
  "audience_type": "broad",
  "daily_budget": null,
  "bid_strategy": "OFFSITE_CONVERSIONS",
  "raw_data": {
    "id": "23847879304440140",
    "name": "07.08 _1%,3%,10% LLA _9.7M",
    "status": "PAUSED",
    "targeting": {
      "age_max": 65,
      "age_min": 35,
      "genders": [
        2
      ],
      "geo_locations": {
        "countries": [
          "US"
        ],
        "location_types": [
          "home",
          "recent"
        ]
      },
      "targeting_relaxation_types": {
        "lookalike": 0,
        "custom_audience": 0
      },
      "brand_safety_content_filter_levels": [
        "FACEBOOK_STANDARD",
        "AN_STANDARD"
      ]
    },
    "campaign_id": "23847879304450140",
    "optimization_goal": "OFFSITE_CONVERSIONS"
  },
  "created_at": "2026-05-16T07:15:10.264673+00:00",
  "updated_at": "2026-05-16T07:15:10.264673+00:00"
}
```

---

### `public.workspace_integrations` — 61 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `workspace_id` (uuid, not null), `app_name` (character varying, not null), `app_domain` (character varying), `category` (character varying), `status` (public.integration_status), `connection_type` (character varying), `credentials_vault_id` (uuid), `config` (jsonb), `last_sync_at` (timestamp with time zone), `error_message` (text), `sort_order` (int32), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "80cf7b06-8581-4f0a-81b8-d8e04ecb7b79",
  "workspace_id": "00000000-0000-0000-0000-000000000001",
  "app_name": "Supabase",
  "app_domain": "supabase.com",
  "category": "Data",
  "status": "active",
  "connection_type": "api_key",
  "credentials_vault_id": null,
  "config": {
    "tables": 167,
    "kb_items": 11590
  },
  "last_sync_at": "2026-05-05T00:09:16.594134+00:00",
  "error_message": null,
  "sort_order": 0,
  "created_at": "2026-05-05T00:09:16.594134+00:00",
  "updated_at": "2026-05-05T00:09:16.594134+00:00"
}
```

---

### `public.app_info_bubbles` — 50 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (31) | `id` (uuid, not null), `app_name` (text, not null), `subdomain` (text), `icon` (text), `short_description` (text), `detailed_description` (text), `profit_potential` (text), `target_audience` (text), `stage` (text), `stage_label` (text), `inspiration_app` (text), `inspiration_url` (text), `our_cost` (text), `their_cost` (text), `annual_savings` (text), `ui_gap` (text), `category` (text), `tier` (text), `command_center_section` (text), `features` (jsonb), `intelligence_notes` (text), `sop_status` (text), `prd_status` (text), `kb_status` (text), `display_order` (int32), `is_visible` (boolean), `bubble_position` (text), `custom_fields` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `slug` (text) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "2f7b5644-39ba-4d7f-9c00-389c5b2642bf",
  "app_name": "Agent Orchestration",
  "subdomain": "command",
  "icon": "🤖",
  "short_description": "AI agent workforce management & orchestration",
  "detailed_description": "Agent registry, task routing, execution monitoring, cross-tool coordination. Manages the entire AI workforce.",
  "profit_potential": "Enables autonomous AI operations across the platform.",
  "target_audience": "AI ops teams, developers",
  "stage": "active",
  "stage_label": "Active",
  "inspiration_app": "CrewAI + LangGraph",
  "inspiration_url": "https://www.crewai.com",
  "our_cost": "$0",
  "their_cost": "Dev tools (free)",
  "annual_savings": "N/A",
  "ui_gap": "medium",
  "category": "Infrastructure",
  "tier": "Tier 8: Infrastructure",
  "command_center_section": "Agent Orchestration",
  "features": "[\"Agent Registry\", \"Task Routing\", \"Execution Monitoring\", \"Cross-Tool Coordination\"]",
  "intelligence_notes": null,
  "sop_status": "draft",
  "prd_status": "draft",
  "kb_status": "draft",
  "display_order": 34,
  "is_visible": true,
  "bubble_position": "bottom-right",
  "custom_fields": {},
  "created_at": "2026-05-12T00:55:58.937484+00:00",
  "updated_at": "2026-05-12T01:06:46.302815+00:00",
  "slug": "agent-orchestration"
}
```

---

### `public.design_inspirations` — 50 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `title` (text, not null), `source_platform` (text), `source_url` (text), `image_url` (text), `category` (text), `best_use_cases` (text[]), `tags` (text[]), `color_palette` (text[]), `style` (text), `notes` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "3419bd96-08cf-49e3-b83b-8d2ec8b51499",
  "title": "Linear App Dashboard",
  "source_platform": "Dribbble",
  "source_url": "https://dribbble.com/shots/17650745-Linear-App",
  "image_url": "https://picsum.photos/seed/linear-dash/800/600",
  "category": "SaaS Dashboard",
  "best_use_cases": [
    "issue tracker layout",
    "dark mode sidebar navigation",
    "minimal data-dense UI",
    "keyboard-first workflow"
  ],
  "tags": [
    "dark",
    "minimal",
    "productivity",
    "b2b",
    "monochrome"
  ],
  "color_palette": [
    "#0A0A0A",
    "#1A1A1A",
    "#5E6AD2",
    "#F2F2F2"
  ],
  "style": "Dark Mode",
  "notes": "Linear dashboard is the gold standard for dark-mode B2B apps. The sidebar hierarchy uses subtle borders instead of backgrounds. Single accent color for interactive elements makes navigation effortless.",
  "created_at": "2026-04-18T04:22:58.2736+00:00"
}
```

---

### `public.offer_overrides` — 43 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (11) | `slug` (text, not null), `stage` (text), `scores` (jsonb), `composite` (numeric), `sop_content` (jsonb), `prd_content` (jsonb), `notes` (text), `sheet_url` (text), `sheet_id` (text), `updated_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "slug": "test-offer",
  "stage": "planning",
  "scores": {},
  "composite": 0,
  "sop_content": null,
  "prd_content": null,
  "notes": "API test",
  "sheet_url": "",
  "sheet_id": "",
  "updated_at": "2026-04-26T11:11:00.881052+00:00",
  "created_at": "2026-04-26T11:11:00.881052+00:00"
}
```

---

### `public.credential_registry` — 40 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `service` (text, not null), `key_name` (text, not null), `key_prefix` (text), `deployed_locations` (jsonb), `has_free_tier` (boolean), `free_tier_limit` (text), `monthly_cost_estimate` (numeric), `expires_at` (timestamp with time zone), `last_rotated_at` (timestamp with time zone), `last_verified_at` (timestamp with time zone), `notes` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "22881b3b-6b51-446f-b46d-d3fd226a3753",
  "service": "Groq",
  "key_name": "[REDACTED]",
  "key_prefix": "[REDACTED]",
  "deployed_locations": [],
  "has_free_tier": true,
  "free_tier_limit": "1M tokens/day",
  "monthly_cost_estimate": 0,
  "expires_at": null,
  "last_rotated_at": null,
  "last_verified_at": null,
  "notes": "Fast LLM inference.",
  "created_at": "2026-04-25T15:53:29.666685+00:00"
}
```

---

### `public.aeo_audit_queries` — 35 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `convex_id` (text), `audit_id` (uuid), `brand_id` (uuid), `engine` (text, not null), `prompt_text` (text, not null), `prompt_intent` (text), `raw_response` (text), `client_mentioned` (boolean), `client_position` (int32), `competitors_mentioned` (jsonb), `response_time_ms` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "9db7b059-fa20-4385-a182-795bb1f7edc6",
  "convex_id": "k178tn3cs30w5rv8jg99sgv111873y6m",
  "audit_id": "1c86427f-9ef0-462d-86e8-a047a91c11eb",
  "brand_id": "44f899b6-6bf1-4c0b-a675-5835b60d159d",
  "engine": "perplexity",
  "prompt_text": "What is AI SaaS & consulting? Explain the key concepts and leading companies.",
  "prompt_intent": "informational",
  "raw_response": "1. AI Consulting Companies for SaaS: The Complete Guide to ...\nURL: https://www.hashmeta.ai/en/blog/ai-consulting-companies-for-saas-the-complete-guide-to-choosing-the-right-partner\nDate: 2026-03-21\nSnippet: This is where AI consulting companies come in.\nThese specialized partners help SaaS businesses leverage artificial intelligence to automate marketing operations, generate qualified leads, optimize content for search engines, and nurture customer relationships at scale.\nFor many SaaS companies, working with an AI consulting firm means gaining capabilities that would otherwise require building an entire department from scratch.\n...\n## What Is AI Consulting for SaaS Companies?\nAI consulting for SaaS companies involves partnering with specialized firms that integrate artificial intelligence technologies into your business operations, particularly in marketing, sales, and customer success functions.\nUnlike generic business consultants, AI consultants bring both strategic expertise and technical implementation capabilities to deploy AI-powered systems that drive measurable growth.\nThese consulting relationships typically combine human strategic oversight with AI automation tools.\nThe consultant analyzes your current operations, identifies opportunities for AI integration, implements the appropriate technologies, and continuously optimizes performance based on data insights.\nFor SaaS companies specifically, AI consulting often focuses on scalable growth strategies that improve customer acquisition costs while increasing lifetime value.\nThe most effective AI consulting companies don't just provide technology.\nThey deliver complete solutions that include strategy development, system implementation, team training, and ongoing optimization.\nThis comprehensive approach ensures that AI capabilities become embedded in your organization rather than remaining isolated tools that underperform.\n\n2. AI SaaS (Software as a Service) - SymphonyAI\nURL: https://www.symphonyai.com/glossary/ai/ai-saas-software-as-a-service/\nDate: 2026-05-08\nSnippet: AI SaaS (Software as a Service) is the delivery of artificial intelligence capabilities through cloud-based software subscriptions.\nRather than building and maintaining AI infrastructure in-house, organizations access AI-powered tools, models, and workflows through a vendor-managed platform, paying on a subscription or consumption basis.\nAI SaaS combines two established delivery models: the scalability and accessibility of SaaS with the analytical power of artificial intelligence.\nThe result is AI that enterprise teams can deploy without large upfront infrastructure investment, specialist model development, or dedicated AI engineering teams to maintain the underlying systems.\n...\nAI SaaS inverts that model.\nThe vendor builds, trains, hosts, and maintains the AI models.\nThe organization connects its data to the platform, configures the workflows it needs, and accesses AI capabilities through a browser interface or API.\nUpdates, model improvements, and infrastructure maintenance are handled by the vendor.\nThe organization’s team focuses on using the AI rather than building it.\nMost enterprise AI SaaS platforms include several layers working together: a data ingestion and preparation layer that connects to the organization’s source systems, a model layer that runs inference on that data, an application layer that presents results to end users in the context of their workflows, and an administration layer for governance, access control, and monitoring.\n...\n**AI SaaS vs. traditional SaaS.** Traditional SaaS delivers software functionality through the cloud — CRM, project management, collaboration tools.\nAI SaaS does the same but adds a layer of intelligence: the software not only stores and organizes data but analyzes it, identifies patterns, makes predictions, and recommends or takes actions.\nThe AI layer is what distinguishes AI SaaS from conventional cloud software.\n...\nAI SaaS provides complete, workflow-ready applications built on top of models, designed for specific business use cases rather than for developers to assemble into solutions.\n...\n**Subscription-based pricing.** AI SaaS is typically priced on a subscription basis — per user, per seat, or per volume of data processed — converting AI from a capital expenditure into a predictable operating expense.\nThis makes AI accessible to organizations that cannot justify large upfront infrastructure investment.\n**Vendor-managed infrastructure.** The AI platform, model hosting, compute infrastructure, and security patching are managed by the vendor.\nEnterprise IT teams do not need to provision GPU clusters or manage model deployment pipelines.\n**Continuous model improvement.** AI SaaS vendors continuously update their underlying models as new data becomes available and as the state of the art in AI advances.\nOrganizations benefit from model improvements without re-engineering their implementation.\n**Integrations with existing systems.**",
  "client_mentioned": false,
  "client_position": null,
  "competitors_mentioned": [
    {
      "name": "Copy.ai",
      "position": 1
    }
  ],
  "response_time_ms": null,
  "created_at": "2026-05-20T22:01:42.154622+00:00"
}
```

---

### `public.umdm_campaigns` — 34 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (17) | `id` (uuid, not null), `brand_id` (uuid), `channel_id` (uuid), `external_id` (character varying, not null), `campaign_name` (character varying, not null), `campaign_type` (character varying), `objective` (character varying), `status` (character varying), `daily_budget` (numeric), `lifetime_budget` (numeric), `currency` (character varying), `start_date` (date), `end_date` (date), `naming_valid` (boolean), `raw_data` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "4e5ed75a-a9d9-42a1-9de1-2e88876086a5",
  "brand_id": "7ba2cd08-9a83-4e71-8fe6-6832ed1d8f84",
  "channel_id": "de36fbe4-9afd-4d3b-9821-094be787834d",
  "external_id": "23847612976000140",
  "campaign_name": "ip_meta_conv_interest_image_20210601",
  "campaign_type": "AUCTION",
  "objective": "CONVERSIONS",
  "status": "paused",
  "daily_budget": 30,
  "lifetime_budget": null,
  "currency": "USD",
  "start_date": "2021-06-01",
  "end_date": null,
  "naming_valid": true,
  "raw_data": {
    "id": "23847612976000140",
    "name": "ip_meta_conv_interest_image_20210601",
    "status": "PAUSED",
    "objective": "CONVERSIONS",
    "start_time": "2021-06-01T06:34:20-0700",
    "buying_type": "AUCTION",
    "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
    "daily_budget": "3000"
  },
  "created_at": "2026-05-16T07:15:09.060035+00:00",
  "updated_at": "2026-05-21T12:21:49.718869+00:00"
}
```

---

### `public.trend_archive` — 29 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (21) | `id` (uuid, not null), `user_id` (uuid), `external_id` (text), `topic` (text, not null), `summary` (text), `source` (text), `source_url` (text), `source_name` (text), `category` (text), `detected_date` (timestamp with time zone), `trend_score` (int32), `flame_score` (int32), `flame_reasoning` (text), `status` (text), `thumbnail_url` (text), `media_type` (text), `tags` (jsonb), `brief_cache` (jsonb), `metadata` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "d98862a1-8468-4e9f-b151-2bc42bb310f4",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "external_id": "na_aHR0cHM6Ly9lY2xpcH",
  "topic": "Jonas, Maximilian and Philip: AI Voice and Interaction Agents in Production: 6 Lessons from the Field",
  "summary": "If you know EclipseSource, you probably know us for developer tools, IDEs, and technical AI topics. What you might not know is that we’ve been building AI voice agents for production use since before …The post AI Voice and Interaction Agents in Production: 6 …",
  "source": "newsapi",
  "source_url": "https://eclipsesource.com/blogs/2026/02/26/interaction-agents-in-production-6-lessons/",
  "source_name": "Eclipsesource.com",
  "category": "Technology",
  "detected_date": "2026-02-26T00:00:00+00:00",
  "trend_score": 100,
  "flame_score": 1,
  "flame_reasoning": "Niche technical AI implementation story",
  "status": "active",
  "thumbnail_url": "",
  "media_type": "article",
  "tags": [],
  "brief_cache": null,
  "metadata": {
    "author": "EclipseSource",
    "videoId": "",
    "audioUrl": "",
    "duration": ""
  },
  "created_at": "2026-02-27T02:22:14.660391+00:00",
  "updated_at": "2026-02-27T02:22:20.479+00:00"
}
```

---

### `public.process_records` — 27 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `workspace_id` (uuid, not null), `title` (text, not null), `description` (text), `status` (text), `priority` (text), `assignee` (text), `due_date` (timestamp with time zone), `tags` (text[]), `custom_fields` (jsonb), `sort_order` (real), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "b7c98353-0369-4ed0-8826-e8aa0bcb1294",
  "workspace_id": "a0000001-0000-0000-0000-000000000001",
  "title": "API v3 endpoint redesign",
  "description": "",
  "status": "in_progress",
  "priority": "high",
  "assignee": "Viktor",
  "due_date": null,
  "tags": [
    "api",
    "backend"
  ],
  "custom_fields": {},
  "sort_order": 0,
  "created_at": "2026-05-01T11:11:53.053048+00:00",
  "updated_at": "2026-05-01T11:11:53.053048+00:00"
}
```

---

### `public.aeo_competitors` — 25 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `convex_id` (text), `brand_id` (uuid), `name` (text, not null), `domain` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "11b84da3-8378-4008-b0a4-b563bde5f2e2",
  "convex_id": null,
  "brand_id": "44f899b6-6bf1-4c0b-a675-5835b60d159d",
  "name": "Deloitte AI",
  "domain": "deloitteai.com",
  "created_at": "2026-05-20T21:30:01.518044+00:00"
}
```

---

### `public.manus_upgrade_tracker` — 24 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (17) | `id` (uuid, not null), `app_id` (text, not null), `app_name` (text, not null), `supabase_connected` (boolean), `enterprise_events_wired` (boolean), `sync_bridge_deployed` (boolean), `env_vars_set` (boolean), `health_endpoint` (boolean), `ci_cd_active` (boolean), `monitoring_active` (boolean), `command_center_integrated` (boolean), `stage_gates_enforced` (boolean), `agentic_workflows_live` (boolean), `upgrade_score` (int32), `notes` (text), `updated_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "b7c932dd-5400-4d1f-bfe3-3bea5af7bbdd",
  "app_id": "elite-writer",
  "app_name": "Elite Writer v5",
  "supabase_connected": true,
  "enterprise_events_wired": true,
  "sync_bridge_deployed": true,
  "env_vars_set": true,
  "health_endpoint": true,
  "ci_cd_active": true,
  "monitoring_active": true,
  "command_center_integrated": true,
  "stage_gates_enforced": true,
  "agentic_workflows_live": true,
  "upgrade_score": 100,
  "notes": "Manus gold standard — Phase 2 complete May 7, 2026",
  "updated_at": "2026-05-08T03:33:50.191472+00:00",
  "created_at": "2026-05-08T03:33:50.191472+00:00"
}
```

---

### `public.manus_upgrade_dashboard` — 24 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (16) | `app_id` (text), `app_name` (text), `upgrade_score` (int32), `tier` (text), `supabase_connected` (boolean), `enterprise_events_wired` (boolean), `sync_bridge_deployed` (boolean), `env_vars_set` (boolean), `health_endpoint` (boolean), `ci_cd_active` (boolean), `monitoring_active` (boolean), `command_center_integrated` (boolean), `stage_gates_enforced` (boolean), `agentic_workflows_live` (boolean), `notes` (text), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "app_id": "elite-writer",
  "app_name": "Elite Writer v5",
  "upgrade_score": 100,
  "tier": "✦ Gold Standard",
  "supabase_connected": true,
  "enterprise_events_wired": true,
  "sync_bridge_deployed": true,
  "env_vars_set": true,
  "health_endpoint": true,
  "ci_cd_active": true,
  "monitoring_active": true,
  "command_center_integrated": true,
  "stage_gates_enforced": true,
  "agentic_workflows_live": true,
  "notes": "Manus gold standard — Phase 2 complete May 7, 2026",
  "updated_at": "2026-05-08T03:33:50.191472+00:00"
}
```

---

### `public.career_nodes` — 24 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (18) | `id` (uuid, not null), `node_key` (text, not null), `title` (text, not null), `description` (text), `category` (text, not null), `pathway` (text), `sequence_order` (int32, not null), `prerequisites` (text[]), `estimated_cost` (numeric), `estimated_duration_days` (int32), `recurring_cost` (boolean), `cost_notes` (text), `recommended_providers` (jsonb), `condition_rules` (jsonb), `min_hours_required` (numeric), `hours_gained` (numeric), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "712c6e66-e2fd-4b42-942d-3665a00c4e8c",
  "node_key": "[REDACTED]",
  "title": "Student Pilot Certificate",
  "description": "Apply via IACRA. Free, but required before solo.",
  "category": "certification",
  "pathway": "both",
  "sequence_order": 2,
  "prerequisites": [],
  "estimated_cost": 0,
  "estimated_duration_days": 14,
  "recurring_cost": false,
  "cost_notes": null,
  "recommended_providers": [],
  "condition_rules": {},
  "min_hours_required": 0,
  "hours_gained": 0,
  "created_at": "2026-04-15T16:20:26.037453+00:00",
  "updated_at": "2026-04-15T16:20:26.037453+00:00"
}
```

---

### `public.umdm_governance_rules` — 20 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `rule_code` (character varying, not null), `category` (character varying, not null), `rule_name` (character varying, not null), `rule_description` (text, not null), `severity` (character varying, not null), `check_query` (text), `auto_action` (character varying), `active` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "74afcc7d-48df-4ce6-a471-13d36af90f25",
  "rule_code": "GOV-001",
  "category": "naming",
  "rule_name": "Campaign naming convention",
  "rule_description": "Campaign name must follow {brand}_{channel}_{objective}_{audience}_{type}_{date} format",
  "severity": "critical",
  "check_query": null,
  "auto_action": "alert_only",
  "active": true,
  "created_at": "2026-05-16T02:04:50.258826+00:00"
}
```

---

### `public.umdm_v_governance_health` — 20 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (7) | `category` (character varying), `severity` (character varying), `rule_name` (character varying), `open_violations` (int64), `resolved_violations` (int64), `total_violations` (int64), `latest_violation` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "category": "budget",
  "severity": "critical",
  "rule_name": "Max daily budget",
  "open_violations": 0,
  "resolved_violations": 0,
  "total_violations": 0,
  "latest_violation": null
}
```

---

### `public.delta_jobs` — 19 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (21) | `id` (uuid, not null), `title` (text, not null), `url` (text, not null), `company` (text), `location` (text), `status` (text), `score` (int32), `reasoning` (text), `jd_text` (text), `notes` (text), `source_query` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `resume` (text), `cover_letter` (text), `pay_rate` (text), `job_type` (text), `ai_income` (text), `ai_flight_hours` (text), `ai_seniority` (text), `ai_fo_credentials` (text) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "27ebe415-bfce-4443-9631-76adf4b9f3cf",
  "title": "Engineering Manager – Cloud Infrastructure",
  "url": "https://careers.delta.com/job/EM-CLOUD-004",
  "company": "Delta Air Lines",
  "location": "Atlanta, GA",
  "status": "new",
  "score": 71,
  "reasoning": "Management track — less hands-on coding but 60-person org has real impact. Delta is mid-AWS migration, estimated $200M cloud spend. Budget authority is significant. Downside: leaving IC work.",
  "jd_text": "Lead cloud infrastructure org of 4 teams (60 engineers). AWS, multi-cloud strategy. Drive FinOps initiatives. 3+ years engineering management required.",
  "notes": "",
  "source_query": "delta engineering manager cloud infrastructure AWS",
  "created_at": "2026-04-11T16:05:01.768606+00:00",
  "updated_at": "2026-04-11T16:05:01.768606+00:00",
  "resume": null,
  "cover_letter": null,
  "pay_rate": null,
  "job_type": null,
  "ai_income": null,
  "ai_flight_hours": null,
  "ai_seniority": null,
  "ai_fo_credentials": null
}
```

---

### `public.watchlists` — 16 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (4) | `id` (uuid, not null), `user_id` (uuid, not null), `name` (text, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "4b3de875-ffd7-4f98-b698-63b55887e8b9",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Top Creators",
  "created_at": "2026-03-25T21:32:37.738728+00:00"
}
```

---

### `public.tracked_channels` — 16 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `platform` (public.platform_type, not null), `handle` (text, not null), `display_name` (text), `avatar_url` (text), `average_views` (int32, not null), `subscriber_count` (int32), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "88648063-d049-4987-8056-8cb4583a2cc5",
  "platform": "YOUTUBE",
  "handle": "@doctorramani",
  "display_name": "DoctorRamani",
  "avatar_url": "https://yt3.ggpht.com/LjHt1nSix0Sk6NnreJS83czJPzWglIkeIkqFvRzXCcQfs2RV_rCOaVg4eV76PGcfHOw_n6snfL0=s88-c-k-c0x00ffffff-no-rj",
  "average_views": 0,
  "subscriber_count": 2070000,
  "created_at": "2026-03-25T21:48:02.318456+00:00"
}
```

---

### `public.watchlist_channels` — 15 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (3) | `watchlist_id` (uuid, not null), `channel_id` (uuid, not null), `added_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "watchlist_id": "79899e3a-bd87-4d7e-b329-e46357e35258",
  "channel_id": "88648063-d049-4987-8056-8cb4583a2cc5",
  "added_at": "2026-03-25T21:48:02.35493+00:00"
}
```

---

### `public.notion_sync` — 13 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `notion_page_id` (text, not null), `notion_page_title` (text), `notion_database_id` (text), `notion_database_name` (text), `notion_url` (text), `notion_last_edited` (timestamp with time zone), `knowledge_base_id` (uuid), `sync_status` (text), `last_synced_at` (timestamp with time zone), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "d491931a-2f09-4576-a662-7ab384bda8fb",
  "notion_page_id": "3a86d329-c0ca-49a2-9137-fd0c269fecb0",
  "notion_page_title": "AI Knowledge Base Index",
  "notion_database_id": "3a86d329-c0ca-49a2-9137-fd0c269fecb0",
  "notion_database_name": "AI Knowledge Base Index",
  "notion_url": "https://www.notion.so/3a86d329c0ca49a29137fd0c269fecb0",
  "notion_last_edited": null,
  "knowledge_base_id": null,
  "sync_status": "synced",
  "last_synced_at": "2026-04-20T23:01:04.502348+00:00",
  "created_at": "2026-04-20T23:01:04.502348+00:00",
  "updated_at": "2026-04-20T23:01:04.502348+00:00"
}
```

---

### `public.credit_balances_latest` — 12 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid), `provider` (text), `workspace` (text), `total_credits` (numeric), `used_credits` (numeric), `remaining_credits` (numeric), `currency` (text), `plan_name` (text), `raw_response` (jsonb), `polled_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "4dc7bcb5-2b26-4d31-be9f-d1f3151f188e",
  "provider": "anthropic",
  "workspace": "default",
  "total_credits": 0,
  "used_credits": 0,
  "remaining_credits": 0,
  "currency": "USD",
  "plan_name": "API key active — has credits",
  "raw_response": {
    "status": "active",
    "has_credits": true
  },
  "polled_at": "2026-05-22T12:00:59.183785+00:00"
}
```

---

### `public.verified_data_sources` — 10 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `name` (text, not null), `category` (text, not null), `base_url` (text, not null), `api_endpoint` (text), `api_key_required` (boolean), `data_types` (text[]), `recency_threshold_days` (int32), `bias_rating` (text), `description` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "2dfc9fa9-2e16-4b43-a48f-564384831388",
  "name": "World Bank Open Data",
  "category": "global_macro",
  "base_url": "https://data.worldbank.org",
  "api_endpoint": "https://api.worldbank.org/v2",
  "api_key_required": "[REDACTED]",
  "data_types": [
    "gdp",
    "development",
    "health",
    "poverty"
  ],
  "recency_threshold_days": 365,
  "bias_rating": "minimal",
  "description": "Gold standard for global development metrics — 7,000+ indicators across 217 economies",
  "created_at": "2026-02-26T20:21:45.994129+00:00"
}
```

---

### `public.os_settings` — 10 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `key` (text, not null), `value` (jsonb, not null), `updated_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "835d51b9-2c75-4381-8276-3ca01e65d53b",
  "key": "[REDACTED]",
  "value": {
    "name": "Rashida Mendes",
    "role": "Founder & CEO",
    "email": "rashida@insightprofit.live",
    "handle": "@rmreal",
    "timezone": "America/New_York",
    "avatar_initials": "RM"
  },
  "updated_at": "2026-04-21T21:46:23.979125+00:00",
  "created_at": "2026-04-21T21:46:23.979125+00:00"
}
```

---

### `public.enterprise_events` — 10 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `event_type` (text, not null), `source_app` (text, not null), `payload` (jsonb, not null), `target_app` (text), `user_id` (text), `status` (text, not null), `processed_by` (text[]), `error_message` (text), `created_at` (timestamp with time zone, not null), `processed_at` (timestamp with time zone), `expires_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "e3769047-ab15-47d8-9e65-48ecf507a6cf",
  "event_type": "health_check_complete",
  "source_app": "command-center",
  "payload": {
    "down": 0,
    "total": 24,
    "healthy": 23,
    "degraded": 1,
    "avgLatency": 166
  },
  "target_app": null,
  "user_id": null,
  "status": "processed",
  "processed_by": null,
  "error_message": null,
  "created_at": "2026-05-08T03:42:16.198164+00:00",
  "processed_at": null,
  "expires_at": "2026-06-07T03:42:16.198164+00:00"
}
```

---

### `public.market_data` — 10 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (21) | `id` (uuid, not null), `airline_name` (text, not null), `airline_type` (text), `fo_hourly_pay` (numeric), `fo_annual_estimate` (numeric), `sign_on_bonus` (numeric), `retention_bonus` (numeric), `min_total_time` (int32), `min_multi_engine` (int32), `min_pic_time` (int32), `min_instrument_time` (int32), `min_turbine_time` (int32), `pathway_program` (text), `pathway_details` (jsonb), `flow_through_airline` (text), `hiring_status` (text), `cadet_program_active` (boolean), `source_url` (text), `last_scraped_at` (timestamp with time zone), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "68881204-c4ec-453b-86b7-75ade2f35bf1",
  "airline_name": "Delta Air Lines",
  "airline_type": "mainline",
  "fo_hourly_pay": 110,
  "fo_annual_estimate": 92000,
  "sign_on_bonus": 0,
  "retention_bonus": null,
  "min_total_time": 1500,
  "min_multi_engine": 500,
  "min_pic_time": null,
  "min_instrument_time": null,
  "min_turbine_time": null,
  "pathway_program": "Delta Propel",
  "pathway_details": {},
  "flow_through_airline": null,
  "hiring_status": "actively_hiring",
  "cadet_program_active": true,
  "source_url": null,
  "last_scraped_at": null,
  "created_at": "2026-04-15T16:20:26.175509+00:00",
  "updated_at": "2026-04-15T16:20:26.175509+00:00"
}
```

---

### `public.ops_sheet_registry` — 8 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (int32, not null), `sheet_id` (text, not null), `sheet_name` (text, not null), `category` (text, not null), `description` (text), `tab_name` (text), `last_synced_at` (timestamp with time zone), `row_count` (int32), `col_count` (int32), `is_active` (boolean), `notion_db_id` (text), `clickup_list_id` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "sheet_id": "1x5MwL8_l4iOpbfos2x0ZKm9gN_amhqsB",
  "sheet_name": "Master Project Inventory",
  "category": "Infrastructure",
  "description": "Master deployment registry for all projects",
  "tab_name": "Master Inventory",
  "last_synced_at": null,
  "row_count": 0,
  "col_count": 0,
  "is_active": true,
  "notion_db_id": null,
  "clickup_list_id": null,
  "created_at": "2026-04-18T15:01:44.557702+00:00"
}
```

---

### `public.aviation_events` — 7 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (20) | `id` (uuid, not null), `event_name` (text, not null), `event_type` (text, not null), `org_name` (text, not null), `description` (text), `amount_low` (numeric), `amount_high` (numeric), `application_open` (date), `application_close` (date), `deadline` (date), `event_date` (date), `eligibility_criteria` (jsonb), `requirements` (text), `application_url` (text), `priority_weight` (int32), `is_active` (boolean), `source_url` (text), `last_scraped_at` (timestamp with time zone), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "8f7532a4-160e-4d90-ae02-d770e7a79bee",
  "event_name": "Women in Aviation International Scholarships",
  "event_type": "scholarship",
  "org_name": "WAI",
  "description": null,
  "amount_low": 2000,
  "amount_high": 25000,
  "application_open": "2026-10-01",
  "application_close": "2026-11-15",
  "deadline": "2026-11-15",
  "event_date": null,
  "eligibility_criteria": {
    "gender": [
      "woman"
    ],
    "essay_required": true,
    "required_memberships": [
      "WAI"
    ]
  },
  "requirements": "Must be WAI member. Multiple types available.",
  "application_url": "https://www.wai.org/scholarships",
  "priority_weight": 10,
  "is_active": true,
  "source_url": null,
  "last_scraped_at": null,
  "created_at": "2026-04-15T16:20:26.126866+00:00",
  "updated_at": "2026-04-15T16:20:26.126866+00:00"
}
```

---

### `public.umdm_channels` — 7 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `channel_code` (character varying, not null), `channel_name` (character varying, not null), `channel_type` (character varying, not null), `api_source` (character varying), `sync_frequency_hours` (int32), `active` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "de36fbe4-9afd-4d3b-9821-094be787834d",
  "channel_code": "meta",
  "channel_name": "Meta Ads",
  "channel_type": "paid",
  "api_source": "meta_marketing_api",
  "sync_frequency_hours": 6,
  "active": true,
  "created_at": "2026-05-16T02:04:50.222408+00:00"
}
```

---

### `public.infra_current_status` — 6 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (5) | `service` (text), `status` (text), `response_time_ms` (int32), `message` (text), `checked_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "service": "command-hub",
  "status": "healthy",
  "response_time_ms": 83,
  "message": "HTTP 200",
  "checked_at": "2026-05-12T02:45:35.404869+00:00"
}
```

---

### `public.v_infra_health` — 6 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (8) | `service` (text), `status` (text), `response_time_ms` (int32), `message` (text), `checked_at` (timestamp with time zone), `uptime_30d` (numeric), `incidents_today` (int32), `severity` (text) |

**Sample row (sensitive fields redacted):**
```json
{
  "service": "supabase-proxy",
  "status": "down",
  "response_time_ms": 10002,
  "message": "Timeout >10s",
  "checked_at": "2026-05-12T02:45:35.404869+00:00",
  "uptime_30d": 100,
  "incidents_today": 0,
  "severity": "critical"
}
```

---

### `public.routing_decisions` — 6 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `created_at` (timestamp with time zone), `prompt_hash` (text), `prompt_preview` (text), `classified_tier` (text, not null), `selected_provider` (text, not null), `selected_model` (text, not null), `was_fallback` (boolean), `fallback_reason` (text), `alternative_cost_usd` (numeric), `actual_cost_usd` (numeric), `savings_usd` (numeric) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "34362923-daf9-4fce-abcb-0a752897e170",
  "created_at": "2026-05-01T12:58:13.285581+00:00",
  "prompt_hash": "[REDACTED]",
  "prompt_preview": "What are the top 3 benefits of serverless architecture?",
  "classified_tier": "LOW",
  "selected_provider": "groq",
  "selected_model": "llama-3.3-70b-versatile",
  "was_fallback": true,
  "fallback_reason": "Fallback from gemini → groq",
  "alternative_cost_usd": null,
  "actual_cost_usd": 0,
  "savings_usd": 0.002676
}
```

---

### `public.monetization_audits` — 6 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (15) | `id` (int32, not null), `audit_date` (date, not null), `overall_score` (int32, not null), `days_to_target` (int32, not null), `current_revenue` (numeric, not null), `target_revenue` (numeric, not null), `systems` (jsonb, not null), `brands` (jsonb, not null), `blockers` (jsonb, not null), `sprint_phases` (jsonb, not null), `projections` (jsonb, not null), `revenue_estimate` (text), `realistic_target_date` (text), `notes` (text), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "audit_date": "2026-05-16",
  "overall_score": 20,
  "days_to_target": 45,
  "current_revenue": 0,
  "target_revenue": 1000000,
  "systems": {
    "ghl_funnels": {
      "delta": 5,
      "label": "GHL Funnels & Workflows",
      "score": 30,
      "status": "partial"
    },
    "ad_campaigns": {
      "delta": 2,
      "label": "Ad Campaigns",
      "score": 7,
      "status": "blocked"
    },
    "slo_products": {
      "delta": 8,
      "label": "Self-Liquidating Offers",
      "score": 38,
      "status": "partial"
    },
    "payment_stripe": {
      "delta": 0,
      "label": "Payment Collection (Stripe)",
      "score": 0,
      "status": "blocked"
    },
    "tracking_stack": {
      "delta": 3,
      "label": "Tracking Stack",
      "score": 13,
      "status": "partial"
    },
    "email_sequences": {
      "delta": 0,
      "label": "Email Sequences",
      "score": 5,
      "status": "blocked"
    },
    "store_readiness": {
      "delta": 10,
      "label": "Product/Store Readiness",
      "score": 35,
      "status": "partial"
    },
    "content_authority": {
      "delta": 2,
      "label": "Content & Authority",
      "score": 72,
      "status": "healthy"
    }
  },
  "brands": [
    {
      "gap": -370000,
      "name": "Family Gift Studio",
      "slug": "fgs",
      "emoji": "🎁",
      "target": 375000,
      "current": 0,
      "readiness": 20
    },
    {
      "gap": -300000,
      "name": "Second Spring",
      "slug": "ss",
      "emoji": "🌿",
      "target": 300000,
      "current": 0,
      "readiness": 15
    },
    {
      "gap": -150000,
      "name": "InsightProfit",
      "slug": "ip",
      "emoji": "📊",
      "target": 150000,
      "current": 0,
      "readiness": 25
    },
    {
      "gap": -100000,
      "name": "Digital Products",
      "slug": "dp",
      "emoji": "📦",
      "target": 100000,
      "current": 0,
      "readiness": 30
    },
    {
      "gap": -75000,
      "name": "Webinar Funnels",
      "slug": "wf",
      "emoji": "🎬",
      "target": 75000,
      "current": 0,
      "readiness": 20
    }
  ],
  "blockers": [
    {
      "item": "Stripe keys not configured",
      "owner": "Rashida",
      "impact": "Zero revenue collection possible",
      "severity": "critical"
    },
    {
      "item": "FGS Shopify access token missing",
      "owner": "Rashida",
      "impact": "No order processing",
      "severity": "critical"
    },
    {
      "item": "Email credentials not provided (Instantly, Encharge)",
      "owner": "Rashida",
      "impact": "Zero nurture flows",
      "severity": "critical"
    },
    {
      "item": "No tracking installed on any store",
      "owner": "Viktor",
      "impact": "Cannot measure/optimize",
      "severity": "high"
    },
    {
      "item": "Second Spring Supliful not launched",
      "owner": "Rashida",
      "impact": "$300K/mo brand delayed",
      "severity": "high"
    },
    {
      "item": "Ad creatives (need 20-50, have 8)",
      "owner": "Viktor",
      "impact": "Cannot launch paid acquisition",
      "severity": "medium"
    },
    {
      "item": "Webinar content not recorded",
      "owner": "Rashida",
      "impact": "6 high-ticket funnels blocked",
      "severity": "medium"
    }
  ],
  "sprint_phases": [],
  "projections": [],
  "revenue_estimate": "3K-33K/mo",
  "realistic_target_date": "November 2026",
  "notes": "First baseline run. Scoring begins.",
  "created_at": "2026-05-16T23:46:06.059111+00:00"
}
```

---

### `public.nav_folders` — 6 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `user_id` (uuid, not null), `name` (text, not null), `parent_id` (uuid), `sort_order` (int32, not null), `is_open` (boolean, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "85174d13-c1fd-4335-8b9d-44ec166d0f10",
  "user_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Funded First",
  "parent_id": null,
  "sort_order": 0,
  "is_open": true,
  "created_at": "2026-03-25T21:51:44.298496+00:00"
}
```

---

### `public.sl_collections` — 6 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `platform_id` (uuid), `name` (text, not null), `canonical_topic` (text), `color` (text), `scrape_url` (text), `apify_actor` (text), `apify_input` (jsonb), `last_scraped_at` (timestamp with time zone), `post_count` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "e0a70de8-f4b7-4d21-aade-52ffb17d653f",
  "platform_id": "3426e135-4a76-4822-8727-b372e1afbcee",
  "name": "70s",
  "canonical_topic": null,
  "color": "#f59e0b",
  "scrape_url": null,
  "apify_actor": null,
  "apify_input": {},
  "last_scraped_at": null,
  "post_count": 0,
  "created_at": "2026-04-05T00:13:39.212365+00:00"
}
```

---

### `public.umdm_brands` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `brand_code` (character varying, not null), `brand_name` (character varying, not null), `domain` (character varying), `shopify_store` (character varying), `ghl_location_id` (character varying), `active` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "fe15d9bc-9085-457b-966f-2261f7d0cce1",
  "brand_code": "fgs",
  "brand_name": "Family Gift Studio",
  "domain": "familygiftstudio.com",
  "shopify_store": null,
  "ghl_location_id": null,
  "active": true,
  "created_at": "2026-05-16T02:04:59.874615+00:00",
  "updated_at": "2026-05-16T02:04:59.874615+00:00"
}
```

---

### `public.aeo_sov_snapshots` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `convex_id` (text), `brand_id` (uuid), `engine` (text, not null), `sov_pct` (numeric, not null), `total_queries` (int32), `mentions` (int32), `snapshot_date` (date, not null), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "209214a0-f66f-4db4-a0b5-ed516207a213",
  "convex_id": null,
  "brand_id": "44f899b6-6bf1-4c0b-a675-5835b60d159d",
  "engine": "perplexity",
  "sov_pct": 0,
  "total_queries": 7,
  "mentions": 0,
  "snapshot_date": "2026-05-20",
  "created_at": "2026-05-20T22:01:42.205656+00:00"
}
```

---

### `public.aeo_audits` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `convex_id` (text), `brand_id` (uuid), `status` (text, not null), `sov_pct` (numeric), `total_queries` (int32), `total_mentions` (int32), `engine_breakdown` (jsonb), `started_at` (timestamp with time zone), `completed_at` (timestamp with time zone), `cost_usd` (numeric), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "1c86427f-9ef0-462d-86e8-a047a91c11eb",
  "convex_id": "k575d1nhcq1hqftkpgweqfmses872bpy",
  "brand_id": "44f899b6-6bf1-4c0b-a675-5835b60d159d",
  "status": "complete",
  "sov_pct": 0,
  "total_queries": 7,
  "total_mentions": 0,
  "engine_breakdown": {
    "perplexity": {
      "total": 7,
      "mentions": 0
    }
  },
  "started_at": "2026-05-20T22:01:42.120847+00:00",
  "completed_at": "2026-05-20T22:01:42.097+00:00",
  "cost_usd": 0.035,
  "created_at": "2026-05-20T22:01:42.120847+00:00"
}
```

---

### `public.aeo_v_brand_health` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid), `name` (text), `slug` (text), `domain` (text), `color` (text), `vertical` (text), `last_sov_pct` (numeric), `last_audit_at` (timestamp with time zone), `total_audits` (int64), `total_prompts` (int64), `total_competitors` (int64), `total_cost_usd` (numeric) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "08cfb375-a9a0-4ecc-9a3a-e81bbdb8eb40",
  "name": "Faith Promises",
  "slug": "faith-promises",
  "domain": "faithpromises.com",
  "color": "#8B5CF6",
  "vertical": "Faith Community",
  "last_sov_pct": 14.3,
  "last_audit_at": "2026-05-20T22:02:35.852+00:00",
  "total_audits": 1,
  "total_prompts": 0,
  "total_competitors": 5,
  "total_cost_usd": 0
}
```

---

### `public.aeo_brands` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `convex_id` (text), `name` (text, not null), `slug` (text, not null), `domain` (text), `color` (text), `vertical` (text), `is_active` (boolean), `last_sov_pct` (numeric), `last_audit_at` (timestamp with time zone), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "44f899b6-6bf1-4c0b-a675-5835b60d159d",
  "convex_id": null,
  "name": "InsightProfit",
  "slug": "insightprofit",
  "domain": "insightprofit.live",
  "color": "#6366F1",
  "vertical": "AI Consulting",
  "is_active": true,
  "last_sov_pct": 0,
  "last_audit_at": "2026-05-20T22:01:42.169+00:00",
  "created_at": "2026-05-20T21:30:01.486016+00:00",
  "updated_at": "2026-05-20T21:30:01.486016+00:00"
}
```

---

### `public.aeo_v_sov_trends` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (8) | `brand_name` (text), `brand_slug` (text), `color` (text), `engine` (text), `sov_pct` (numeric), `total_queries` (int32), `mentions` (int32), `snapshot_date` (date) |

**Sample row (sensitive fields redacted):**
```json
{
  "brand_name": "Faith Promises",
  "brand_slug": "faith-promises",
  "color": "#8B5CF6",
  "engine": "perplexity",
  "sov_pct": 0,
  "total_queries": 7,
  "mentions": 0,
  "snapshot_date": "2026-05-20"
}
```

---

### `public.brand_kits` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `brand_slug` (text, not null), `name` (text, not null), `colors` (jsonb), `fonts` (jsonb), `logos` (jsonb), `guidelines` (text), `tone_of_voice` (text), `audience` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "deb32685-dfb9-4776-af2f-fcad6b3d8d28",
  "brand_slug": "insightprofit",
  "name": "InsightProfit",
  "colors": "[{\"name\": \"Primary\", \"hex\": \"#00d4aa\", \"role\": \"primary\"}, {\"name\": \"Dark\", \"hex\": \"#0f172a\", \"role\": \"background\"}, {\"name\": \"Accent\", \"hex\": \"#7c3aed\", \"role\": \"accent\"}]",
  "fonts": "[{\"name\": \"Inter\", \"role\": \"body\"}, {\"name\": \"Cal Sans\", \"role\": \"heading\"}]",
  "logos": [],
  "guidelines": null,
  "tone_of_voice": "Professional, tech-forward, precise",
  "audience": "Entrepreneurs, digital business owners",
  "created_at": "2026-05-17T07:37:19.146742+00:00",
  "updated_at": "2026-05-17T07:37:19.146742+00:00"
}
```

---

### `public.instruction_routing` — 5 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (19) | `id` (uuid, not null), `instruction` (text, not null), `instruction_type` (character varying), `department` (character varying), `priority` (character varying), `matched_agents` (jsonb), `primary_agent_id` (character varying), `primary_agent_name` (character varying), `routing_confidence` (numeric), `status` (character varying), `source` (character varying), `clickup_task_id` (character varying), `clickup_url` (text), `n8n_execution_id` (character varying), `dispatch_result` (jsonb), `error_message` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `completed_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "1eb25e9e-f404-487a-b6d4-280b9b740e55",
  "instruction": "Build a landing page for FGS Mother's Day campaign with compelling hero section",
  "instruction_type": "design",
  "department": "Brand & Creative",
  "priority": "high",
  "matched_agents": [
    {
      "id": "cb7df371fd38",
      "name": "Make a detailed analysis in a detailed table of all the topics and resources in this interview. Incl",
      "score": 30,
      "category": "agent",
      "platform": "",
      "role_type": "creative",
      "confidence": 0.3
    },
    {
      "id": "7df30f664709",
      "name": "Creating a Comfortable Interview Experience",
      "score": 30,
      "category": "agent",
      "platform": "",
      "role_type": "content",
      "confidence": 0.3
    },
    {
      "id": "af3b88dde864",
      "name": "Accessing and Optimizing External Content",
      "score": 30,
      "category": "agent",
      "platform": "",
      "role_type": "content",
      "confidence": 0.3
    },
    {
      "id": "fd8a5a1cbd10",
      "name": "Bowl of Simple Grits Image Generation Task",
      "score": 30,
      "category": "agent",
      "platform": "",
      "role_type": "creative",
      "confidence": 0.3
    },
    {
      "id": "341f3e22169b",
      "name": "Generación de imagen para portada de diario de salud",
      "score": 30,
      "category": "agent",
      "platform": "",
      "role_type": "creative",
      "confidence": 0.3
    }
  ],
  "primary_agent_id": "cb7df371fd38",
  "primary_agent_name": "Make a detailed analysis in a detailed table of all the topics and resources in this interview. Incl",
  "routing_confidence": 0.3,
  "status": "dispatched",
  "source": "api_test",
  "clickup_task_id": null,
  "clickup_url": null,
  "n8n_execution_id": null,
  "dispatch_result": {},
  "error_message": null,
  "created_at": "2026-04-22T16:19:33.594455+00:00",
  "updated_at": "2026-04-22T16:19:33.772+00:00",
  "completed_at": null
}
```

---

### `public.schema_version` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (2) | `version` (text, not null), `applied_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "version": "2.0.0-ai-enhanced",
  "applied_at": "2025-12-30T00:35:05.531783+00:00"
}
```

---

### `public.seen_comments` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (3) | `comment_id` (text, not null), `task_id` (text), `processed_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "comment_id": "90170202504744",
  "task_id": "86e0xd8uq",
  "processed_at": "2026-04-17T20:10:29.885212+00:00"
}
```

---

### `public.daily_token_spend` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (7) | `spend_date` (date), `provider` (text), `request_count` (int64), `total_tokens` (int64), `total_cost_usd` (numeric), `avg_latency_ms` (numeric), `success_rate` (double precision) |

**Sample row (sensitive fields redacted):**
```json
{
  "spend_date": "2026-05-01",
  "provider": "anthropic",
  "request_count": 1,
  "total_tokens": "[REDACTED]",
  "total_cost_usd": 0.007575,
  "avg_latency_ms": 7974,
  "success_rate": 1
}
```

---

### `public.canvas_boards` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `board_id` (character varying, not null), `nodes` (jsonb, not null), `connections` (jsonb, not null), `metadata` (jsonb, not null), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "fe0b67a4-3c37-4c9f-9490-d806a32f568e",
  "board_id": "fgs",
  "nodes": [],
  "connections": [],
  "metadata": {
    "color": "#E91E63",
    "label": "Family Gift Studio"
  },
  "created_at": "2026-05-05T00:15:09.1372+00:00",
  "updated_at": "2026-05-05T00:15:09.1372+00:00"
}
```

---

### `public.sl_platforms` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `name` (text, not null), `display_name` (text, not null), `icon` (text), `color` (text), `is_active` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "3426e135-4a76-4822-8727-b372e1afbcee",
  "name": "facebook",
  "display_name": "Facebook",
  "icon": "🔵",
  "color": "#1877F2",
  "is_active": true,
  "created_at": "2026-04-05T00:11:56.627711+00:00"
}
```

---

### `public.monthly_token_spend` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (6) | `spend_month` (timestamp without time zone), `provider` (text), `request_count` (int64), `total_tokens` (int64), `total_cost_usd` (numeric), `avg_latency_ms` (numeric) |

**Sample row (sensitive fields redacted):**
```json
{
  "spend_month": "2026-05-01T00:00:00",
  "provider": "anthropic",
  "request_count": 1,
  "total_tokens": "[REDACTED]",
  "total_cost_usd": 0.007575,
  "avg_latency_ms": 7974
}
```

---

### `public.aaoe_configs` — 4 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (18) | `id` (uuid, not null), `brand_code` (character varying, not null), `platform` (character varying, not null), `is_active` (boolean), `max_daily_spend` (numeric), `max_budget_change_pct` (numeric), `max_bid_change_pct` (numeric), `min_roas` (numeric), `max_cpa` (numeric), `learning_phase_hours` (int32), `auto_execute_threshold` (int32), `target_roas` (numeric), `target_cpa` (numeric), `target_daily_spend` (numeric), `slack_channel` (character varying), `digest_frequency` (character varying), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "0524e23c-9f52-4da9-8358-f6fbfdbb7083",
  "brand_code": "fgs",
  "platform": "meta_ads",
  "is_active": true,
  "max_daily_spend": 200,
  "max_budget_change_pct": 0.2,
  "max_bid_change_pct": 0.15,
  "min_roas": 1,
  "max_cpa": 50,
  "learning_phase_hours": 72,
  "auto_execute_threshold": 90,
  "target_roas": 2,
  "target_cpa": 25,
  "target_daily_spend": 50,
  "slack_channel": "#adsmanagement",
  "digest_frequency": "daily",
  "created_at": "2026-05-20T18:50:28.094522+00:00",
  "updated_at": "2026-05-20T18:50:28.094522+00:00"
}
```

---

### `public.cos_briefings` — 3 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `date` (date), `briefing_type` (text), `department` (text), `status_json` (jsonb), `blockers` (jsonb), `wins` (jsonb), `decisions_needed` (jsonb), `revenue_snapshot` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "89aa876e-91cd-4f0a-b1b6-206bfa9ae29d",
  "date": "2026-04-18",
  "briefing_type": "daily",
  "department": "all",
  "status_json": {
    "ads": {
      "label": "Ads / ROAS",
      "detail": "No live ad data connected — GHL integration pending",
      "status": "yellow"
    },
    "tech": {
      "label": "Tech",
      "detail": "mission-control last deploy Apr 12 — 6 days idle; supabase-proxy updated today; no open PRs detected",
      "status": "yellow"
    },
    "sales": {
      "label": "Sales / GHL",
      "detail": "20 opportunities tracked; 4 closed-won; 3 in negotiation",
      "status": "green"
    },
    "product": {
      "label": "Product",
      "detail": "vidrevamp has 2 open issues; polsia + mission-control active; claudeclaw-dashboard updated Apr 15",
      "status": "yellow"
    },
    "marketing": {
      "label": "Marketing/Content",
      "detail": "5 content items in queue; next publish: Holiday DIY Projects (In Progress)",
      "status": "green"
    }
  },
  "blockers": [
    {
      "id": "b1",
      "title": "GHL Revenue Data Not Flowing",
      "detail": "GoHighLevel API not connected to CoS hub. Revenue snapshot showing $0. Action: Connect GHL API key or authorize MCP to pull funnel/pipeline data.",
      "status": "open",
      "priority": 1,
      "department": "Sales/Revenue"
    },
    {
      "id": "b2",
      "title": "Vercel Deployment Gap — mission-control",
      "detail": "mission-control repo last pushed Apr 12 (6 days ago). No Vercel deploy confirmed post-Sentry integration. Verify live deployment health.",
      "status": "open",
      "priority": 2,
      "department": "Tech"
    },
    {
      "id": "b3",
      "title": "Content Queue Has Stale Items",
      "detail": "3 of 5 content items past scheduled date (May 2025). Assign new dates or archive. Holiday DIY Projects is in-progress — needs publish date set.",
      "status": "open",
      "priority": 3,
      "department": "Marketing"
    }
  ],
  "wins": [
    {
      "title": "supabase-proxy updated today (Apr 18)",
      "department": "Tech"
    },
    {
      "title": "music-prompt-generator shipped (TypeScript, Apr 18)",
      "department": "Product"
    },
    {
      "title": "design-inspiration-curator launched (Apr 18)",
      "department": "Product"
    },
    {
      "title": "4 closed-won deals in Sales CRM pipeline",
      "department": "Sales"
    },
    {
      "title": "CoS Command Hub now live — briefings auto-generating",
      "department": "Operations"
    }
  ],
  "decisions_needed": [
    {
      "id": "d1",
      "type": "approval",
      "title": "Approve GHL API Connection",
      "detail": "To pull live revenue/funnel data into the CoS hub, authorize the GHL API key for the Operations Monitor integration.",
      "status": "pending",
      "department": "Sales"
    },
    {
      "id": "d2",
      "type": "decision",
      "title": "Prioritize vidrevamp open issues (#1, #2)",
      "detail": "vidrevamp has 2 open GitHub issues. Decide: assign to sprint this week, or push to backlog. Repo: rtmendes/vidrevamp.",
      "status": "pending",
      "department": "Product"
    },
    {
      "id": "d3",
      "type": "approval",
      "title": "Archive or reschedule stale content (3 items)",
      "detail": "Content Planning base shows 3 items with May 2025 publication dates. Approve archiving or reschedule to this month.",
      "status": "pending",
      "department": "Marketing"
    }
  ],
  "revenue_snapshot": {
    "note": "Data from Airtable Sales CRM — GHL live revenue pending connection",
    "ghl_connected": false,
    "closed_won_count": 4,
    "closed_won_value": 77994,
    "proposals_active": 4,
    "in_negotiation_count": 3,
    "in_negotiation_value": 44916,
    "pipeline_value_total": 324519,
    "pipeline_opportunities": 20
  },
  "created_at": "2026-04-18T13:49:24.507103+00:00"
}
```

---

### `public.process_workspaces` — 3 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `name` (text, not null), `description` (text), `color` (text), `icon` (text), `owner_id` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "a0000001-0000-0000-0000-000000000001",
  "name": "Product Development",
  "description": "Core product roadmap and sprint management",
  "color": "#6366f1",
  "icon": "🚀",
  "owner_id": "system",
  "created_at": "2026-05-01T11:11:53.053048+00:00",
  "updated_at": "2026-05-01T11:11:53.053048+00:00"
}
```

---

### `public.sparky_rate_limits` — 3 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (int64, not null), `provider` (character varying, not null), `requests_per_minute` (int32, not null), `current_count` (int32), `window_start` (timestamp with time zone, not null), `last_429_at` (timestamp with time zone), `backoff_until` (timestamp with time zone), `created_at` (timestamp with time zone, not null), `updated_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 1,
  "provider": "openai",
  "requests_per_minute": 15,
  "current_count": 0,
  "window_start": "2026-04-23T12:24:27.50824+00:00",
  "last_429_at": null,
  "backoff_until": null,
  "created_at": "2026-04-23T12:24:27.50824+00:00",
  "updated_at": "2026-04-23T12:24:27.50824+00:00"
}
```

---

### `public.routing_efficiency` — 3 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (6) | `route_date` (date), `classified_tier` (text), `decisions` (int64), `total_savings_usd` (numeric), `avg_savings_usd` (numeric), `fallback_count` (int64) |

**Sample row (sensitive fields redacted):**
```json
{
  "route_date": "2026-05-01",
  "classified_tier": "HIGH",
  "decisions": 1,
  "total_savings_usd": 0,
  "avg_savings_usd": 0,
  "fallback_count": 0
}
```

---

### `public.workspaces` — 2 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `name` (character varying, not null), `slug` (character varying), `stripe_customer_id` (character varying), `industry` (character varying), `team_size` (character varying), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "7c3d850d-d74f-48ae-8717-e37bd039d64e",
  "name": "InsightProfit OS",
  "slug": "insightprofit",
  "stripe_customer_id": null,
  "industry": "Digital Media / Commerce",
  "team_size": "10-25",
  "created_at": "2026-05-05T00:09:09.253998+00:00",
  "updated_at": "2026-05-05T00:09:09.253998+00:00"
}
```

---

### `public.rp_tags` — 2 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `color` (text), `usage_count` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "b7019725-5ce9-4ac7-b9c3-61b8bbe7acb2",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "name": "cfi",
  "color": "#B8977E",
  "usage_count": 0,
  "created_at": "2026-04-27T01:48:45.515179+00:00"
}
```

---

### `public.voice_conversations` — 2 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `conversation_id` (text), `offer_id` (text), `started_at` (timestamp with time zone), `ended_at` (timestamp with time zone), `messages` (jsonb), `intent` (text), `customer_info` (jsonb), `channel` (text), `crm_synced` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "46ffddfc-21c5-4879-9d7c-eae2093f6fc0",
  "conversation_id": "voice_20260501220535",
  "offer_id": "voice",
  "started_at": "2026-05-01T22:05:35.878556+00:00",
  "ended_at": "2026-05-01T22:05:40.899757+00:00",
  "messages": [],
  "intent": "unknown",
  "customer_info": {},
  "channel": "chatbot",
  "crm_synced": false,
  "created_at": "2026-05-01T22:05:41.165423+00:00"
}
```

---

### `public.manus_sync_state` — 2 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (3) | `key` (text, not null), `value` (text), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "key": "[REDACTED]",
  "value": "hXVxorsIFX79lXa4G6hM6K",
  "updated_at": "2026-03-18T17:13:32.946457+00:00"
}
```

---

### `public.manus_events` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `event_id` (text), `event_type` (text, not null), `task_id` (text), `project_id` (text), `payload` (jsonb, not null), `received_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "898bd9fe-7311-4734-b34f-c0561451cd98",
  "event_id": "test-003",
  "event_type": "task_stopped",
  "task_id": "task-test-003",
  "project_id": "byCsCwtgQG5jX6k5Q7gKrh",
  "payload": {
    "title": "Test Task",
    "task_id": "task-test-003",
    "event_id": "test-003",
    "event_type": "task_stopped",
    "project_id": "byCsCwtgQG5jX6k5Q7gKrh",
    "stop_reason": "finish"
  },
  "received_at": "2026-03-18T16:44:52.320086+00:00"
}
```

---

### `public.process_custom_roles` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `workspace_id` (uuid, not null), `name` (text, not null), `description` (text), `capabilities` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "3d80b906-6e47-4012-ad0a-132a4fac8ac2",
  "workspace_id": "a0000001-0000-0000-0000-000000000001",
  "name": "Developer",
  "description": "Read and edit records",
  "capabilities": {
    "read": true,
    "write": true,
    "delete": false
  },
  "created_at": "2026-05-01T11:11:53.053048+00:00"
}
```

---

### `public.pitches` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (24) | `id` (uuid, not null), `user_id` (uuid), `article_idea_id` (uuid), `publication_id` (uuid), `editor_name` (text), `editor_email` (text), `subject_line` (text), `pitch_body` (text), `sent_date` (timestamp with time zone), `follow_up_date` (timestamp with time zone), `response_date` (timestamp with time zone), `status` (text), `response_text` (text), `contract_value` (numeric), `notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `folder_id` (uuid), `publication` (text), `outcome` (text), `payment_amount` (numeric), `pitch_content` (text), `follow_up_subject` (text), `follow_up_body` (text) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "06982d92-5cc1-4474-8754-18b4c430fa7d",
  "user_id": "12f7e0ff-247a-4240-8d2d-e037173bb2c0",
  "article_idea_id": null,
  "publication_id": null,
  "editor_name": "Sarah Chen",
  "editor_email": "[REDACTED]",
  "subject_line": "AI-Powered Financial Literacy: How Technology is Democratizing Wealth Building",
  "pitch_body": null,
  "sent_date": null,
  "follow_up_date": null,
  "response_date": null,
  "status": "draft",
  "response_text": null,
  "contract_value": null,
  "notes": null,
  "created_at": "2026-04-20T16:49:11.742016+00:00",
  "updated_at": "2026-04-20T16:49:11.742016+00:00",
  "folder_id": null,
  "publication": "Forbes",
  "outcome": null,
  "payment_amount": null,
  "pitch_content": "",
  "follow_up_subject": null,
  "follow_up_body": null
}
```

---

### `public.sl_workflows` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `name` (text, not null), `description` (text), `yaml_config` (text), `is_active` (boolean), `trigger_event` (text), `last_run_at` (timestamp with time zone), `run_count` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "999a9970-773b-45c3-a825-009f22fa3d22",
  "name": "New Post → Generate + Log",
  "description": "When a post is scraped, generate FB ad + Reel script for all active brands",
  "yaml_config": "",
  "is_active": true,
  "trigger_event": "post.inserted",
  "last_run_at": null,
  "run_count": 0,
  "created_at": "2026-04-05T00:11:56.627711+00:00"
}
```

---

### `public.ai_synthesis_reports` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `report_type` (text, not null), `content` (text, not null), `metadata` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "f2c6d8c7-aaf7-4826-ad37-074b1c46de6b",
  "report_type": "weekly",
  "content": "# Weekly Portfolio Synthesis — Tuesday, March 24, 2026\n\n## Executive Summary\nYour portfolio is in excellent health with **100% scoring coverage across all 28 projects**, indicating strong documentation discipline. However, the portfolio is heavily weighted toward early-stage projects (17 in idea stage vs. 10 in build), and this week's document creation activity (50 new docs) suggests significant operational momentum that should be channeled strategically toward your top-scoring build-stage projects.\n\n## This Week's Highlights\n- **Complete scoring coverage**: All 28 projects have priority scores assigned\n- **High documentation velocity**: 50 new documents created this week across SOPs, marketing briefs, and PRDs\n- **Manus task activity**: 5,070 tasks logged, indicating substantial execution-level work\n- **Top performer momentum**: Marketing Agency Tools & Templates (71/100) continues to dominate priority ranking\n- **Document diversity**: Strong focus on marketing briefs, SOPs, and operational playbooks\n\n## Portfolio Health\n**Stage Distribution Imbalance**: Your portfolio skews heavily toward ideation (61% in idea stage) with only 36% in active build. This suggests either a strong pipeline of emerging concepts or an opportunity to accelerate existing projects to completion. The single planned-stage project (Journalist Research Services) should be transitioned to build or deprioritized soon.\n\n**Scoring Strength**: Perfect coverage means all projects have clear priority rankings—this is excellent for resource allocation decisions.\n\n## Top Opportunities\n1. **Marketing Agency Tools & Templates** (71/100, in_build) — Your highest-priority active project; should receive primary resource allocation this week\n2. **AI Workflow & Automation Platform** (62/100, in_build) — Strong secondary priority; appears well-positioned for rapid scaling\n3. **Parenting Wisdom Publishing** (61/100, in_build) — Tied for third; publishing timelines are critical; needs launch-readiness assessment\n4. **Teen Financial Literacy Platform** (61/100, in_build) — Co-priority with Parenting; market demand likely high; check for go-to-market readiness\n5. **LinkedIn Business Growth Platform** (58/100, idea → build) — Highest-priority ideation project; consider promoting to build phase if resource permits\n\n## Action Items for This Week\n1. **Consolidate and tag this week's 50 documents** — Map them to specific projects; identify which build-stage projects received the most documentation support and why\n2. **Conduct a build-stage readiness review** — Meet with leads on your top 3 projects (Marketing Agency Tools, AI Workflow, Parenting Wisdom) to assess blockers and resource gaps\n3. **Transition decision on Journalist Research Services** — Decide: build, defer, or sunset the planned-stage project; don't leave it in limbo\n4. **Prioritize the ideation pipeline** — Review the 17 idea-stage projects; identify 2-3 for promotion to planned/build based on market fit and founder energy\n5. **Audit Manus task distribution** — Of the 5,070 tasks logged, determine what % align with your top 5 projects vs. lower-priority work; reallocate if needed\n6. **Document the Marketing Agency Tools playbook** — Your top project deserves a detailed go-to-market roadmap; draft this week\n7. **Schedule cross-project sync** — Identify dependencies between your build-stage projects (especially the two 61/100 projects) to prevent resource conflicts\n\n## Projects Needing Attention\n- **Journalist Research Services** (54/100, planned stage) — This project is stuck in planning limbo. Either commit resources to move it to build this quarter or deprioritize it formally.\n- **Build-stage bottlenecks** — While all 10 projects in build are scored, no specific blockers are flagged. Conduct rapid health checks to surface hidden delays.\n- **Idea-stage conversion rate** — With 17 projects in ideation, clarify which are genuinely viable vs. exploratory; establish clear promotion criteria.\n\n---\n\n**Next Report Focus**: Track which of this week's 50 documents drove measurable progress on your top 5 projects. Measure task allocation alignment with priority scores.",
  "metadata": {
    "tag_count": 28,
    "recent_docs": 50,
    "scored_count": 28,
    "stage_counts": {
      "idea": 17,
      "planned": 1,
      "in_build": 10
    }
  },
  "created_at": "2026-03-24T00:58:52.244806+00:00"
}
```

---

### `public.ideas_with_metadata` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (24) | `id` (uuid), `user_id` (uuid), `title` (text), `angle` (text), `news_peg` (text), `news_peg_date` (timestamp with time zone), `urgency_score` (int32), `target_publications` (text), `expected_pay` (numeric), `priority_score` (numeric), `word_count_target` (int32), `status` (text), `category` (text), `keywords` (text), `research_notes` (text), `assigned_date` (timestamp with time zone), `deadline` (timestamp with time zone), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone), `folder_id` (uuid), `folder_name` (text), `folder_path` (text), `folder_color` (text), `tags` (json) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "36283d75-6a77-427d-9e65-3762d150377f",
  "user_id": "893ac9b3-d3f8-4809-ab8e-0e2ad12bc0d0",
  "title": "7 Growth Strategies Executive Leaders use Increase Online Cash Flow within 30 days",
  "angle": "creating a personal connection with their ideal customer can go beyond blindly promoting the features and benefits of their offer but tap into the demographic and psychographic of their ideal customer and what they are going through to need or want the offer right now",
  "news_peg": "",
  "news_peg_date": "2025-12-29T20:24:20.903+00:00",
  "urgency_score": 7,
  "target_publications": "",
  "expected_pay": 0,
  "priority_score": 0,
  "word_count_target": 1000,
  "status": "idea",
  "category": "Business",
  "keywords": "[REDACTED]",
  "research_notes": "",
  "assigned_date": "2025-12-29T20:24:20.904+00:00",
  "deadline": null,
  "created_at": "2025-12-29T20:24:21.099783+00:00",
  "updated_at": "2026-02-26T20:21:45.994129+00:00",
  "folder_id": null,
  "folder_name": null,
  "folder_path": null,
  "folder_color": null,
  "tags": []
}
```

---

### `public.decision_hub_actions` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `item_id` (uuid), `action_type` (text, not null), `notes` (text), `actor` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "7e70dcff-3402-45ec-b5da-31667334db41",
  "item_id": "a855a1a0-750f-41bb-b26c-efbdf9ff359b",
  "action_type": "approve",
  "notes": "",
  "actor": "rashida",
  "created_at": "2026-05-07T12:12:16.089619+00:00"
}
```

---

### `public.process_sync_rules` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `source_workspace_id` (uuid, not null), `target_workspace_id` (uuid, not null), `field_mapping` (jsonb), `sync_on_create` (boolean), `sync_on_update` (boolean), `active` (boolean), `last_synced_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": "59bf2075-efa9-4625-add9-4cc2a04efdfb",
  "source_workspace_id": "a0000001-0000-0000-0000-000000000001",
  "target_workspace_id": "a0000001-0000-0000-0000-000000000003",
  "field_mapping": {
    "tags": true,
    "title": true,
    "status": true,
    "priority": true,
    "description": true
  },
  "sync_on_create": true,
  "sync_on_update": true,
  "active": true,
  "last_synced_at": null,
  "created_at": "2026-05-01T11:11:53.053048+00:00"
}
```

---

### `public.system_errors` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (int64, not null), `source` (text, not null), `severity` (text, not null), `message` (text, not null), `stack` (text), `metadata` (jsonb), `resolved` (boolean, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
```json
{
  "id": 2,
  "source": "migration-test",
  "severity": "info",
  "message": "Migration v1 deployed successfully",
  "stack": null,
  "metadata": {
    "version": "v1",
    "timestamp": "2026-05-07T18:45:00Z"
  },
  "resolved": false,
  "created_at": "2026-05-07T18:42:43.440277+00:00"
}
```

---

### `public.v_daily_ops_summary` — 1 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (10) | `report_date` (date), `active_agents` (int64), `sessions_today` (int64), `active_sessions` (int64), `tokens_today` (int64), `cost_today` (real), `healthy_services` (int64), `unhealthy_services` (int64), `kb_total_items` (int32), `open_tasks` (int64) |

**Sample row (sensitive fields redacted):**
```json
{
  "report_date": "2026-05-23",
  "active_agents": 10,
  "sessions_today": 0,
  "active_sessions": 7,
  "tokens_today": "[REDACTED]",
  "cost_today": 0,
  "healthy_services": 5,
  "unhealthy_services": 1,
  "kb_total_items": 0,
  "open_tasks": 3577
}
```

---

### `public.quality_trends` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (8) | `article_id` (uuid), `user_id` (uuid), `measurement_date` (date), `overall_score` (numeric), `ai_detection_score` (numeric), `word_count` (int32), `prev_score` (numeric), `score_change` (numeric) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sites_tokens` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `domain_url` (text, not null), `persistent_cookies` (jsonb), `auth_headers` (jsonb), `notes` (text), `is_active` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.brand_assets` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `brand_slug` (text, not null), `name` (text, not null), `type` (text), `url` (text), `file_size` (int32), `dimensions` (text), `tags` (text[]), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.push_subscriptions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `user_id` (uuid, not null), `endpoint` (text, not null), `p256dh_key` (text, not null), `auth_key` (text, not null), `is_active` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.growthbook_events` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (int64, not null), `user_id` (text, not null), `event_name` (text, not null), `value` (numeric), `properties` (jsonb), `app_name` (text), `timestamp` (timestamp with time zone, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.idea_active_suggestions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (7) | `article_idea_id` (uuid), `total_suggestions` (int64), `critical_count` (int64), `recommended_count` (int64), `optional_count` (int64), `total_potential_improvement` (numeric), `suggestions` (json) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.folders` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `parent_folder_id` (uuid), `path` (text), `color` (text), `icon` (text), `sort_order` (int32), `is_archived` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.process_record_permissions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `record_id` (uuid, not null), `user_id` (text, not null), `permission_level` (text), `granted_by` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.hive_mind` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (int64, not null), `agent_id` (text, not null), `action_type` (text, not null), `summary` (text, not null), `metadata` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.umdm_v_budget_pacing` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (12) | `brand_code` (character varying), `channel_code` (character varying), `period_type` (character varying), `period_start` (date), `period_end` (date), `target_spend` (numeric), `target_roas` (numeric), `target_cpa` (numeric), `actual_spend` (numeric), `remaining_budget` (numeric), `pacing_pct` (numeric), `days_remaining` (int32) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.usage_events` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `user_id` (uuid), `ts` (timestamp with time zone, not null), `integration` (text, not null), `use_case` (text, not null), `brand_id` (text), `project_id` (text), `model` (text), `input_tokens` (int32), `output_tokens` (int32), `total_tokens` (int32), `cost_usd` (numeric), `duration_ms` (int32), `status` (text), `metadata` (jsonb) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.workspace_members` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `workspace_id` (uuid, not null), `user_id` (uuid, not null), `display_name` (character varying), `email` (character varying), `role` (public.system_role, not null), `invited_by` (uuid), `is_active` (boolean), `last_seen_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.aeo_prompts` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `convex_id` (text), `brand_id` (uuid), `text` (text, not null), `intent` (text, not null), `is_active` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.workspace_invitations` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `workspace_id` (uuid, not null), `email` (character varying, not null), `role` (public.system_role, not null), `invited_by` (uuid, not null), `token` (character varying, not null), `status` (character varying), `expires_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sl_brands` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `name` (text, not null), `icon` (text), `yaml_config` (text), `is_active` (boolean), `sort_order` (int32), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.growthbook_exposures` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (int64, not null), `user_id` (text, not null), `experiment_id` (text, not null), `variation_id` (text, not null), `timestamp` (timestamp with time zone, not null), `browser` (text), `device_type` (text), `app_name` (text), `session_id` (text), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.chat_messages` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `user_id` (uuid, not null), `role` (text, not null), `content` (text, not null), `metadata` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.process_report_snapshots` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (4) | `id` (uuid, not null), `config_id` (uuid, not null), `data` (jsonb, not null), `generated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.rp_folders` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `project_id` (uuid), `user_id` (uuid), `parent_id` (uuid), `name` (text, not null), `sort_order` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.strategic_goals` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `title` (text, not null), `type` (text), `status` (text), `progress` (int32), `brand_slug` (text), `due_date` (date), `description` (text), `parent_id` (uuid), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.daily_production` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `user_id` (uuid), `date` (date, not null), `target_articles` (int32), `articles_drafted` (int32), `pitches_sent` (int32), `responses_received` (int32), `articles_accepted` (int32), `revenue_earned` (numeric), `notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.product_sales` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `article_id` (int32), `product_id` (text, not null), `product_type` (text, not null), `product_title` (text, not null), `amount` (numeric, not null), `currency` (text, not null), `platform` (text), `sale_date` (timestamp with time zone, not null), `metadata` (jsonb), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.writing_productivity` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (8) | `user_id` (uuid), `writing_date` (date), `sessions` (int64), `total_minutes` (int64), `total_words_written` (int64), `net_words` (int64), `avg_ai_acceptance` (numeric), `ai_words_generated` (int64) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ops_n8n_templates` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (int32, not null), `source_sheet_id` (text, not null), `template_id` (text), `name` (text), `title` (text), `description` (text), `creator` (text), `youtube_url` (text), `template_url` (text), `resource_url` (text), `date_posted` (text), `raw_data` (jsonb), `synced_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.process_report_configs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `name` (text, not null), `description` (text), `workspace_ids` (uuid[]), `metrics` (text[]), `schedule` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.aaoe_anomalies` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `brand_id` (uuid), `entity_type` (character varying, not null), `entity_id` (character varying, not null), `entity_name` (character varying), `metric` (character varying, not null), `current_value` (numeric), `baseline_value` (numeric), `deviation_pct` (numeric), `z_score` (numeric), `severity` (character varying, not null), `status` (character varying), `detected_at` (timestamp with time zone), `resolved_at` (timestamp with time zone), `notes` (text), `raw_data` (jsonb) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.nav_section_states` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (3) | `user_id` (uuid, not null), `section_key` (text, not null), `is_open` (boolean, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.trends` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (17) | `id` (uuid, not null), `user_id` (uuid), `topic` (text, not null), `source` (text), `trend_score` (int32), `detected_date` (timestamp with time zone), `peak_date` (timestamp with time zone), `category` (text), `related_people` (text), `related_companies` (text), `article_ideas_generated` (int32), `potential_publications` (text), `summary` (text), `source_urls` (jsonb), `status` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.temu_inspiration` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `store_url` (text), `store_name` (text), `product_name` (text, not null), `product_image_url` (text), `product_description` (text), `price` (numeric), `units_sold` (text), `review_count` (int32), `review_rating` (numeric), `product_type` (text), `fgs_workflow` (text), `ai_prompt` (text), `midjourney_prompt` (text), `created_at` (timestamp with time zone), `scraped_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.digests` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `type` (text), `digest_date` (date, not null), `content` (jsonb), `summary` (text), `status` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.hook_results` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `user_id` (uuid), `hook_text` (text, not null), `analysis` (jsonb, not null), `score` (int32), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.offers` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (16) | `id` (uuid, not null), `name` (text, not null), `brand_slug` (text, not null), `type` (text), `price` (numeric), `status` (text), `description` (text), `landing_url` (text), `checkout_url` (text), `funnel_id` (uuid), `ghl_pipeline_id` (text), `conversion_rate` (numeric), `total_sales` (int32), `total_revenue` (numeric), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.webhook_events` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `webhook_id` (uuid), `event_type` (character varying, not null), `payload` (jsonb), `status` (character varying), `attempts` (int32), `last_attempt` (timestamp without time zone), `created_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.fact_checks` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `article_id` (uuid), `block_id` (uuid), `user_id` (uuid), `claim_text` (text, not null), `verification_status` (text), `verification_source` (text), `verification_url` (text), `verification_date` (timestamp with time zone), `ai_verified` (boolean), `ai_confidence` (numeric), `ai_sources` (jsonb), `notes` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.reports` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `title` (text, not null), `type` (text, not null), `brand_slug` (text), `status` (text), `data` (jsonb), `summary` (text), `generated_by` (text), `file_url` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sparky_api_usage` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (int64, not null), `task_id` (uuid), `provider` (character varying, not null), `endpoint` (character varying), `model` (character varying), `tokens_input` (int32), `tokens_output` (int32), `bytes_stored` (int64), `cost_usd` (numeric), `response_time_ms` (int32), `status_code` (int32), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.health_checks` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (4) | `id` (int64, not null), `checked_at` (timestamp with time zone), `all_healthy` (boolean), `details` (jsonb) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.code_workspaces` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `name` (character varying, not null), `description` (text), `agent_id` (uuid), `code` (text), `status` (character varying), `created_at` (timestamp without time zone), `updated_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sparky_events` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (5) | `id` (int64, not null), `task_id` (uuid, not null), `event_type` (character varying, not null), `details` (jsonb), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ai_usage_stats` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (9) | `user_id` (uuid), `action_type` (text), `ai_provider` (text), `action_count` (int64), `total_tokens` (int64), `total_cost` (numeric), `avg_rating` (numeric), `success_count` (int64), `failure_count` (int64) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.products` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `user_id` (uuid, not null), `name` (text, not null), `product_type` (text), `funnel_type` (text), `description` (text), `audience` (text), `price` (text), `goals` (text), `stages` (jsonb), `ai_result` (jsonb), `score` (numeric), `status` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.publication_aggregated_styles` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (29) | `id` (uuid, not null), `publication_id` (uuid), `examples_analyzed` (int32), `last_aggregated_at` (timestamp with time zone), `opening_type_distribution` (jsonb), `avg_opening_length` (int32), `recommended_opening` (text), `structure_distribution` (jsonb), `avg_word_count` (int32), `word_count_range` (jsonb), `avg_paragraphs` (int32), `avg_subheadings` (int32), `avg_formality` (numeric), `common_personality_traits` (jsonb), `dominant_pov` (text), `avg_stats_per_article` (numeric), `common_source_types` (jsonb), `citation_preferences` (text), `avg_reading_level` (numeric), `avg_sentence_length` (numeric), `avg_passive_voice` (numeric), `key_patterns` (jsonb), `top_dos` (jsonb), `top_donts` (jsonb), `required_elements` (jsonb), `optional_elements` (jsonb), `prohibited_elements` (jsonb), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.brand_products` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `brand_slug` (text, not null), `name` (text, not null), `sku` (text), `price` (numeric), `status` (text), `category` (text), `image_url` (text), `platform` (text), `platform_id` (text), `inventory_count` (int32), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.writing_sessions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (19) | `id` (uuid, not null), `user_id` (uuid), `article_id` (uuid), `started_at` (timestamp with time zone), `ended_at` (timestamp with time zone), `duration_minutes` (int32), `words_written` (int32), `words_deleted` (int32), `net_words` (int32), `edits_count` (int32), `ai_calls` (int32), `ai_words_generated` (int32), `ai_words_accepted` (int32), `ai_acceptance_rate` (numeric), `longest_uninterrupted_minutes` (int32), `distraction_count` (int32), `device_type` (text), `browser` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.fgs_variants` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `product_id` (text), `variant_name` (text, not null), `material` (text), `size` (text), `color` (text), `sku` (text), `additional_cost` (numeric), `retail_price` (numeric), `inventory_count` (int32), `shopify_variant_id` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.expert_sources` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (20) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `title` (text), `organization` (text), `expertise_areas` (jsonb), `email` (text), `linkedin_url` (text), `twitter_handle` (text), `phone` (text), `relationship_type` (text), `last_contacted_at` (timestamp with time zone), `contact_notes` (text), `times_quoted` (int32), `articles_used_in` (jsonb), `response_time` (text), `preferred_contact_method` (text), `availability_notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.launch_connections` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `launch_id` (uuid, not null), `from_asset_id` (uuid, not null), `to_asset_id` (uuid, not null), `relationship_type` (public.relationship_type, not null), `weight` (int32, not null), `label` (text), `metadata` (jsonb), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.process_saved_views` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `workspace_id` (uuid, not null), `name` (text, not null), `view_type` (text), `filters` (jsonb), `sort_config` (jsonb), `created_by` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.video_insights` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (17) | `id` (uuid, not null), `channel_id` (uuid, not null), `url` (text, not null), `title` (text), `thumbnail_url` (text), `views` (int32, not null), `likes` (int32), `comments` (int32), `duration_seconds` (int32), `hook` (text), `outlier_score` (double precision, not null), `transcript` (jsonb), `visual_analysis` (jsonb), `tags` (text[]), `published_at` (timestamp with time zone), `analyzed_at` (timestamp with time zone), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.message_queue` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (int64, not null), `chat_id` (text, not null), `agent_id` (text, not null), `message` (text, not null), `comment_id` (text), `user_id` (text), `status` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ai_chats` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `user_id` (uuid, not null), `conversation_id` (uuid, not null), `role` (text, not null), `content` (text, not null), `context` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.notification_preferences` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `workspace_id` (uuid, not null), `user_id` (uuid, not null), `event_type` (character varying, not null), `email_enabled` (boolean), `slack_enabled` (boolean), `in_app_enabled` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.idea_publication_score_history` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (27) | `id` (uuid, not null), `article_idea_id` (uuid), `publication_id` (uuid), `user_id` (uuid), `scored_at` (timestamp with time zone), `version_number` (int32), `word_count` (int32), `content_hash` (text), `overall_score` (numeric), `clarity_structure_score` (numeric), `hook_engagement_score` (numeric), `voice_tone_score` (numeric), `data_evidence_score` (numeric), `originality_angle_score` (numeric), `publication_fit_score` (numeric), `timeliness_score` (numeric), `actionability_score` (numeric), `expertise_depth_score` (numeric), `readability_score` (numeric), `conclusion_cta_score` (numeric), `ai_model` (text), `ai_reasoning` (jsonb), `estimated_pay_min` (numeric), `estimated_pay_max` (numeric), `overall_trend` (text), `dimension_trends` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sl_topic_maps` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `topic_name` (text, not null), `topic_icon` (text), `collection_ids` (uuid[]), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.publication_style_analyses` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (43) | `id` (uuid, not null), `example_article_id` (uuid), `publication_id` (uuid), `ai_model` (text, not null), `analysis_version` (text), `analyzed_at` (timestamp with time zone), `tokens_used` (int32), `opening_type` (text), `opening_length_words` (int32), `hook_style` (text), `structure_template` (text), `avg_paragraph_length` (int32), `avg_sentence_length` (numeric), `subheading_frequency` (int32), `uses_bullet_points` (boolean), `uses_pull_quotes` (boolean), `formality_level` (numeric), `personality_traits` (jsonb), `point_of_view` (text), `emotional_register` (text), `stats_count` (int32), `source_types` (jsonb), `citation_style` (text), `uses_original_research` (boolean), `avg_words_per_sentence` (numeric), `passive_voice_percentage` (numeric), `complex_sentence_ratio` (numeric), `question_frequency` (numeric), `reading_level_grade` (numeric), `jargon_level` (text), `buzzword_usage` (jsonb), `vocabulary_sophistication` (numeric), `uses_direct_address` (boolean), `uses_rhetorical_questions` (boolean), `uses_humor` (boolean), `uses_metaphors` (boolean), `call_to_action_style` (text), `conclusion_type` (text), `conclusion_length_words` (int32), `full_style_profile` (jsonb), `style_dos` (jsonb), `style_donts` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.research_feeds` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `user_id` (uuid, not null), `name` (text, not null), `url` (text, not null), `category` (text), `is_active` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.daily_briefings` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (int64, not null), `date` (text), `infrastructure_status` (text), `token_status` (text), `summary` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.audit_comments` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `audit_item_id` (uuid, not null), `author` (text, not null), `content` (text, not null), `type` (text, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ops_ai_integrations` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (int32, not null), `source_sheet_id` (text, not null), `mcp_url` (text, not null), `is_enabled` (boolean), `agenticflow_available` (boolean), `claude_available` (boolean), `cursor_available` (boolean), `windsurf_available` (boolean), `vscode_cline_available` (boolean), `raw_data` (jsonb), `synced_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.export_jobs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `workspace_id` (uuid, not null), `initiated_by` (uuid, not null), `export_type` (character varying, not null), `destination` (character varying, not null), `status` (character varying), `file_url` (text), `file_size_bytes` (int64), `error_message` (text), `started_at` (timestamp with time zone), `completed_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.aaoe_cycles` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (17) | `id` (uuid, not null), `cycle_id` (character varying, not null), `started_at` (timestamp with time zone, not null), `completed_at` (timestamp with time zone), `status` (character varying), `brands_scanned` (text[]), `campaigns_analyzed` (int32), `anomalies_detected` (int32), `recommendations_generated` (int32), `auto_executed` (int32), `pending_approval` (int32), `observations` (int32), `total_spend_24h` (numeric), `total_revenue_24h` (numeric), `blended_roas` (numeric), `errors` (text[]), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.generated_scripts` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (12) | `id` (uuid, not null), `user_id` (uuid), `subject` (text, not null), `angle` (text, not null), `blueprint` (jsonb, not null), `language` (text, not null), `scenario_type` (text), `hook_formula` (text), `platform` (text), `duration` (text), `vault_items_used` (text[]), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.job_applications` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `company` (text, not null), `position` (text, not null), `status` (text), `applied_date` (date), `notes` (text), `url` (text), `contact` (text), `salary_range` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.consolidations` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `agent_id` (text, not null), `insights` (text, not null), `patterns` (jsonb), `contradictions` (jsonb), `memory_ids` (jsonb), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.automation_workflows` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `name` (text, not null), `platform` (text), `status` (text), `n8n_workflow_id` (text), `trigger_type` (text), `last_run_at` (timestamp with time zone), `run_count` (int32), `error_count` (int32), `description` (text), `brand_slug` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.webhooks` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `name` (character varying, not null), `url` (character varying, not null), `agent_id` (uuid), `events` (character varying[]), `status` (character varying), `created_at` (timestamp without time zone), `updated_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.files` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (17) | `id` (uuid, not null), `user_id` (uuid), `folder_id` (uuid), `name` (text, not null), `original_name` (text), `file_type` (text), `mime_type` (text), `size_bytes` (int64), `storage_path` (text), `url` (text), `thumbnail_url` (text), `description` (text), `tags` (text[]), `metadata` (jsonb), `is_archived` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.brand_funnels` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `brand_slug` (text, not null), `name` (text, not null), `type` (text), `status` (text), `steps` (jsonb), `conversion_rate` (numeric), `total_leads` (int32), `total_revenue` (numeric), `url` (text), `platform` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.publishing_channels` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (11) | `id` (uuid, not null), `user_id` (uuid), `channel_type` (text, not null), `channel_name` (text, not null), `config` (jsonb), `formatting_rules` (jsonb), `preferred_posting_times` (jsonb), `timezone` (text), `is_active` (boolean), `last_used_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.rp_ai_conversations` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `user_id` (uuid), `project_id` (uuid), `document_id` (uuid), `messages` (jsonb), `model` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.ai_generations` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `document_id` (uuid, not null), `generation_type` (text, not null), `prompt` (text, not null), `response` (text, not null), `metadata` (jsonb, not null), `created_at` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sl_budget` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (7) | `id` (uuid, not null), `service` (text, not null), `description` (text), `tokens_used` (int32), `cost_usd` (numeric), `entry_date` (date), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.transcripts` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `user_id` (uuid, not null), `raw_text` (text, not null), `formatted_text` (text), `source_url` (text), `source_title` (text), `recording_duration_ms` (int32), `language` (character varying), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.manus_automation_rules` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `name` (text, not null), `enabled` (boolean), `trigger_event` (text, not null), `trigger_condition` (jsonb), `action_type` (text, not null), `action_config` (jsonb, not null), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.umdm_budgets` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `brand_id` (uuid), `channel_id` (uuid), `period_type` (character varying, not null), `period_start` (date, not null), `period_end` (date, not null), `target_spend` (numeric, not null), `target_roas` (numeric), `target_cpa` (numeric), `max_daily_spend` (numeric), `notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.link_packs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `user_id` (uuid, not null), `anchor_text` (text, not null), `target_url` (text, not null), `is_active` (boolean), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.process_synced_records` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (5) | `id` (uuid, not null), `rule_id` (uuid, not null), `source_record_id` (uuid, not null), `target_record_id` (uuid, not null), `last_synced_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.publication_custom_scoring_weights` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (19) | `id` (uuid, not null), `user_id` (uuid), `publication_id` (uuid), `clarity_structure_weight` (int32), `hook_engagement_weight` (int32), `voice_tone_weight` (int32), `data_evidence_weight` (int32), `originality_angle_weight` (int32), `publication_fit_weight` (int32), `timeliness_weight` (int32), `actionability_weight` (int32), `expertise_depth_weight` (int32), `readability_weight` (int32), `conclusion_cta_weight` (int32), `minimum_acceptable_score` (numeric), `target_score` (numeric), `custom_notes` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.scoring_outcome_tracking` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (19) | `id` (uuid, not null), `article_idea_id` (uuid), `pitch_id` (uuid), `article_id` (uuid), `user_id` (uuid), `publication_id` (uuid), `predicted_overall_score` (numeric), `predicted_acceptance_probability` (numeric), `predicted_pay_min` (numeric), `predicted_pay_max` (numeric), `actual_outcome` (text), `actual_pay` (numeric), `response_days` (int32), `editor_feedback` (text), `revision_required` (boolean), `prediction_accuracy` (numeric), `submitted_at` (timestamp with time zone), `outcome_recorded_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.fgs_media` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `product_id` (text), `media_type` (text, not null), `url` (text, not null), `alt_text` (text), `is_primary` (boolean), `generation_prompt` (text), `generation_model` (text), `approval_status` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.platform_integrations` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (10) | `id` (uuid, not null), `name` (text, not null), `platform` (text, not null), `status` (text), `config` (jsonb), `last_sync_at` (timestamp with time zone), `error_message` (text), `brand_slug` (text), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.sl_generated` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `post_id` (uuid), `brand_id` (uuid), `output_type` (text, not null), `content` (text, not null), `prompt_used` (text), `model` (text), `tokens_used` (int32), `cost_usd` (numeric), `status` (text), `notion_page_id` (text), `clickup_task_id` (text), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.brand_voices` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `description` (text), `tone` (text), `style` (text), `vocabulary` (jsonb), `examples` (jsonb), `guidelines` (text), `target_audience` (text), `is_default` (boolean), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.rate_tracker` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (5) | `id` (int64, not null), `agent_id` (text, not null), `bucket` (text, not null), `count` (int32), `bucket_start` (timestamp with time zone, not null) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.tags` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `user_id` (uuid), `name` (text, not null), `color` (text), `icon` (text), `description` (text), `usage_count` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.active_sessions` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `user_id` (uuid, not null), `workspace_id` (uuid), `device_info` (jsonb), `ip_address` (inet), `user_agent` (text), `last_active_at` (timestamp with time zone), `created_at` (timestamp with time zone), `expires_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.aaoe_recommendations` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (25) | `id` (uuid, not null), `recommendation_id` (character varying, not null), `cycle_id` (character varying), `brand_code` (character varying, not null), `platform` (character varying, not null), `action_type` (character varying, not null), `entity_type` (character varying, not null), `entity_id` (character varying, not null), `entity_name` (character varying), `priority` (character varying, not null), `confidence` (numeric, not null), `reasoning` (text, not null), `expected_impact` (text), `before_state` (jsonb), `after_state` (jsonb), `status` (character varying), `slack_message_ts` (character varying), `digest_date` (date), `approved_by` (character varying), `approved_at` (timestamp with time zone), `rejected_by` (character varying), `rejected_at` (timestamp with time zone), `executed_at` (timestamp with time zone), `created_at` (timestamp with time zone), `expires_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.api_keys` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (8) | `id` (uuid, not null), `key` (character varying, not null), `name` (character varying, not null), `agent_id` (uuid), `last_used` (timestamp without time zone), `status` (character varying), `created_at` (timestamp without time zone), `updated_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.cron_jobs` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (9) | `id` (uuid, not null), `name` (character varying, not null), `schedule` (character varying, not null), `agent_id` (uuid), `status` (character varying), `last_run` (timestamp without time zone), `next_run` (timestamp without time zone), `created_at` (timestamp without time zone), `updated_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.launch_graph_edges` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | _unknown_ |
| **Columns** (11) | `launch_id` (uuid), `edge_id` (uuid), `from_asset_id` (uuid), `from_title` (text), `from_type` (public.asset_type), `to_asset_id` (uuid), `to_title` (text), `to_type` (public.asset_type), `relationship_type` (public.relationship_type), `weight` (int32), `label` (text) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.scenarios` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (14) | `id` (uuid, not null), `user_id` (uuid, not null), `name` (text, not null), `description` (text), `is_active` (boolean), `pathway_type` (text), `target_airline` (text), `target_pathway` (text), `total_estimated_cost` (numeric), `total_estimated_months` (int32), `node_overrides` (jsonb), `excluded_nodes` (text[]), `created_at` (timestamp with time zone), `updated_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.fgs_orders` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (13) | `id` (uuid, not null), `order_source` (text, not null), `source_order_id` (text, not null), `product_id` (text), `customer_email` (text), `customer_name` (text), `quantity` (int32), `unit_price` (numeric), `total_price` (numeric), `status` (text), `ordered_at` (timestamp with time zone), `fulfilled_at` (timestamp with time zone), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.publishing_queue` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (15) | `id` (uuid, not null), `article_id` (uuid), `channel_id` (uuid), `user_id` (uuid), `scheduled_for` (timestamp with time zone), `status` (text), `adapted_content` (text), `adaptation_notes` (text), `published_at` (timestamp with time zone), `published_url` (text), `error_message` (text), `views` (int32), `engagements` (int32), `shares` (int32), `created_at` (timestamp with time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.idea_latest_scores` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (28) | `id` (uuid), `article_idea_id` (uuid), `publication_id` (uuid), `user_id` (uuid), `scored_at` (timestamp with time zone), `version_number` (int32), `word_count` (int32), `content_hash` (text), `overall_score` (numeric), `clarity_structure_score` (numeric), `hook_engagement_score` (numeric), `voice_tone_score` (numeric), `data_evidence_score` (numeric), `originality_angle_score` (numeric), `publication_fit_score` (numeric), `timeliness_score` (numeric), `actionability_score` (numeric), `expertise_depth_score` (numeric), `readability_score` (numeric), `conclusion_cta_score` (numeric), `ai_model` (text), `ai_reasoning` (jsonb), `estimated_pay_min` (numeric), `estimated_pay_max` (numeric), `overall_trend` (text), `dimension_trends` (jsonb), `created_at` (timestamp with time zone), `current_trend` (text) |

**Sample row (sensitive fields redacted):**
_no sample available_

---

### `public.notifications` — 0 rows
| Field | Value |
|---|---|
| **Purpose** | Uncategorised |
| **Primary key** | `id` |
| **Columns** (6) | `id` (uuid, not null), `agent_id` (uuid), `type` (character varying, not null), `message` (text, not null), `read` (boolean), `created_at` (timestamp without time zone) |

**Sample row (sensitive fields redacted):**
_no sample available_



---

## Foreign key relationships

_FK metadata requires a direct SQL query. Run this in the Supabase dashboard SQL editor:_

```sql
SELECT
  tc.table_schema,
  tc.table_name         AS from_table,
  kcu.column_name       AS from_col,
  ccu.table_name        AS to_table,
  ccu.column_name       AS to_col
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema NOT IN ('pg_catalog','information_schema','auth','storage')
ORDER BY tc.table_name;
```

---

## All tables — flat list

| # | Table | Rows | Group |
|---|---|---|---|
| 1 | `public.infra_health_log` | 13,986 | OPERATIONAL |
| 2 | `public.app_health_checks` | 13,056 | OTHER |
| 3 | `public.knowledge_items` | 12,376 | KB_CONTENT |
| 4 | `public.n8n_event_log` | 8,704 | OPERATIONAL |
| 5 | `public.manus_tasks` | 5,072 | KB_CONTENT |
| 6 | `public.subscribr_daily_snapshots` | 4,608 | OTHER |
| 7 | `public.clickup_tasks` | 4,131 | OPERATIONAL |
| 8 | `public.agent_memory` | 1,595 | AI_RAG |
| 9 | `public.ai_agents` | 1,191 | OPERATIONAL |
| 10 | `public.kb_item_tags` | 1,152 | KB_CONTENT |
| 11 | `public.gateway_metrics` | 739 | OPERATIONAL |
| 12 | `public.genspark_history` | 608 | KB_CONTENT |
| 13 | `public.perell_videos` | 594 | OTHER |
| 14 | `public.tech_tools` | 527 | OTHER |
| 15 | `public.cost_events` | 496 | OPERATIONAL |
| 16 | `public.ai_expense_log` | 475 | OPERATIONAL |
| 17 | `public.token_usage` | 401 | OTHER |
| 18 | `public.fgs_products` | 372 | OTHER |
| 19 | `public.ai_expense_daily` | 345 | OPERATIONAL |
| 20 | `public.pipeline_queue` | 332 | OTHER |
| 21 | `public.credit_balances` | 292 | OTHER |
| 22 | `public.umdm_governance_violations` | 238 | OTHER |
| 23 | `public.clickup_sync` | 210 | OTHER |
| 24 | `public.umdm_ads` | 207 | OTHER |
| 25 | `public.umdm_metrics_daily` | 194 | OPERATIONAL |
| 26 | `public.umdm_v_cross_channel_daily` | 194 | OTHER |
| 27 | `public.umdm_v_portfolio_daily` | 194 | OTHER |
| 28 | `public.publications` | 182 | OTHER |
| 29 | `public.kb_projects` | 181 | KB_CONTENT |
| 30 | `public.v_agent_performance` | 175 | OPERATIONAL |
| 31 | `public.agents` | 175 | OPERATIONAL |
| 32 | `public.umdm_etl_sync_log` | 174 | OPERATIONAL |
| 33 | `public.kb_documents` | 165 | KB_CONTENT |
| 34 | `public.app_documents` | 150 | KB_CONTENT |
| 35 | `public.ai_agents_summary` | 131 | OPERATIONAL |
| 36 | `public.perell_writers` | 114 | OTHER |
| 37 | `public.agent_cost_summary_mv` | 110 | OPERATIONAL |
| 38 | `public.ops_clients` | 108 | OTHER |
| 39 | `public.ai_expense_monthly` | 102 | OPERATIONAL |
| 40 | `public.knowledge_base` | 100 | KB_CONTENT |
| 41 | `public.audit_items` | 95 | KB_CONTENT |
| 42 | `public.dispatch_sessions` | 89 | OTHER |
| 43 | `public.publication_templates` | 88 | OTHER |
| 44 | `public.offer_pipeline` | 83 | OTHER |
| 45 | `public.etl_runs` | 80 | OPERATIONAL |
| 46 | `public.product_launches` | 77 | OTHER |
| 47 | `public.launch_assets` | 77 | KB_CONTENT |
| 48 | `public.launch_asset_summary` | 77 | KB_CONTENT |
| 49 | `public.kb_business_units` | 75 | KB_CONTENT |
| 50 | `public.kb_tags` | 71 | KB_CONTENT |
| 51 | `public.app_catalog` | 69 | OPERATIONAL |
| 52 | `public.umdm_ad_sets` | 64 | OTHER |
| 53 | `public.workspace_integrations` | 61 | OTHER |
| 54 | `public.app_info_bubbles` | 50 | OTHER |
| 55 | `public.design_inspirations` | 50 | OTHER |
| 56 | `public.projects` | 47 | OPERATIONAL |
| 57 | `public.offer_overrides` | 43 | OTHER |
| 58 | `public.credential_registry` | 40 | OTHER |
| 59 | `public.revenue_analytics` | 40 | OPERATIONAL |
| 60 | `public.sl_posts` | 39 | KB_CONTENT |
| 61 | `public.ops_projects` | 36 | OPERATIONAL |
| 62 | `public.aeo_audit_queries` | 35 | OTHER |
| 63 | `public.umdm_campaigns` | 34 | OTHER |
| 64 | `public.cost_budgets` | 29 | OPERATIONAL |
| 65 | `public.kb_categories` | 29 | KB_CONTENT |
| 66 | `public.trend_archive` | 29 | OTHER |
| 67 | `public.process_records` | 27 | OTHER |
| 68 | `public.aeo_competitors` | 25 | OTHER |
| 69 | `public.manus_upgrade_tracker` | 24 | OTHER |
| 70 | `public.manus_upgrade_dashboard` | 24 | OTHER |
| 71 | `public.career_nodes` | 24 | OTHER |
| 72 | `public.manus_projects` | 23 | OPERATIONAL |
| 73 | `public.infra_metrics` | 21 | OPERATIONAL |
| 74 | `public.umdm_governance_rules` | 20 | OTHER |
| 75 | `public.kb_analytics` | 20 | KB_CONTENT |
| 76 | `public.umdm_v_governance_health` | 20 | OTHER |
| 77 | `public.delta_jobs` | 19 | OTHER |
| 78 | `public.project_velocity` | 18 | OPERATIONAL |
| 79 | `public.agent_metrics` | 18 | OPERATIONAL |
| 80 | `public.decision_hub_items` | 17 | KB_CONTENT |
| 81 | `public.agent_capabilities` | 16 | OPERATIONAL |
| 82 | `public.watchlists` | 16 | OTHER |
| 83 | `public.manus_task_files` | 16 | OPERATIONAL |
| 84 | `public.tracked_channels` | 16 | OTHER |
| 85 | `public.watchlist_channels` | 15 | OTHER |
| 86 | `public.notion_sync` | 13 | OTHER |
| 87 | `public.credit_balances_latest` | 12 | OTHER |
| 88 | `public.agent_responsibility_matrix` | 12 | OPERATIONAL |
| 89 | `public.verified_data_sources` | 10 | OTHER |
| 90 | `public.os_settings` | 10 | OTHER |
| 91 | `public.process_audit_log` | 10 | OPERATIONAL |
| 92 | `public.enterprise_events` | 10 | OTHER |
| 93 | `public.market_data` | 10 | OTHER |
| 94 | `public.mission_tasks` | 9 | OPERATIONAL |
| 95 | `public.ops_sheet_registry` | 8 | OTHER |
| 96 | `public.aviation_events` | 7 | OTHER |
| 97 | `public.umdm_channels` | 7 | OTHER |
| 98 | `public.infra_current_status` | 6 | OTHER |
| 99 | `public.v_infra_health` | 6 | OTHER |
| 100 | `public.routing_decisions` | 6 | OTHER |
| 101 | `public.token_logs` | 6 | OPERATIONAL |
| 102 | `public.monetization_audits` | 6 | OTHER |
| 103 | `public.nav_folders` | 6 | OTHER |
| 104 | `public.sl_collections` | 6 | OTHER |
| 105 | `public.umdm_brands` | 5 | OTHER |
| 106 | `public.agent_events` | 5 | OPERATIONAL |
| 107 | `public.aeo_sov_snapshots` | 5 | OTHER |
| 108 | `public.aeo_audits` | 5 | OTHER |
| 109 | `public.agent_logs` | 5 | OPERATIONAL |
| 110 | `public.aeo_v_brand_health` | 5 | OTHER |
| 111 | `public.aeo_brands` | 5 | OTHER |
| 112 | `public.aeo_v_sov_trends` | 5 | OTHER |
| 113 | `public.brand_kits` | 5 | OTHER |
| 114 | `public.instruction_routing` | 5 | OTHER |
| 115 | `public.schema_version` | 4 | OTHER |
| 116 | `public.seen_comments` | 4 | OTHER |
| 117 | `public.daily_token_spend` | 4 | OTHER |
| 118 | `public.knowledge_bus` | 4 | KB_CONTENT |
| 119 | `public.viktor_tasks` | 4 | OPERATIONAL |
| 120 | `public.canvas_boards` | 4 | OTHER |
| 121 | `public.sl_platforms` | 4 | OTHER |
| 122 | `public.monthly_token_spend` | 4 | OTHER |
| 123 | `public.aaoe_configs` | 4 | OTHER |
| 124 | `public.team_members` | 4 | AUTH_USER |
| 125 | `public.cos_briefings` | 3 | OTHER |
| 126 | `public.process_workspaces` | 3 | OTHER |
| 127 | `public.pipeline_items` | 3 | KB_CONTENT |
| 128 | `public.sparky_rate_limits` | 3 | OTHER |
| 129 | `public.routing_efficiency` | 3 | OTHER |
| 130 | `public.items` | 3 | KB_CONTENT |
| 131 | `public.workspaces` | 2 | OTHER |
| 132 | `public.v_revenue_overview` | 2 | OPERATIONAL |
| 133 | `public.rp_tags` | 2 | OTHER |
| 134 | `public.rp_activity_log` | 2 | OPERATIONAL |
| 135 | `public.voice_conversations` | 2 | OTHER |
| 136 | `public.manus_sync_state` | 2 | OTHER |
| 137 | `public.user_settings` | 1 | AUTH_USER |
| 138 | `public.rp_documents` | 1 | KB_CONTENT |
| 139 | `public.lifelegacy_articles` | 1 | KB_CONTENT |
| 140 | `public.kpi_snapshots` | 1 | OPERATIONAL |
| 141 | `public.manus_events` | 1 | OTHER |
| 142 | `public.process_custom_roles` | 1 | OTHER |
| 143 | `public.user_preferences` | 1 | AUTH_USER |
| 144 | `public.pitches` | 1 | OTHER |
| 145 | `public.kb_automations` | 1 | KB_CONTENT |
| 146 | `public.sl_workflows` | 1 | OTHER |
| 147 | `public.kb_workflows` | 1 | KB_CONTENT |
| 148 | `public.v_kb_coverage` | 1 | KB_CONTENT |
| 149 | `public.ai_synthesis_reports` | 1 | OTHER |
| 150 | `public.research_notes` | 1 | KB_CONTENT |
| 151 | `public.ideas_with_metadata` | 1 | OTHER |
| 152 | `public.decision_hub_actions` | 1 | OTHER |
| 153 | `public.rp_projects` | 1 | OPERATIONAL |
| 154 | `public.process_sync_rules` | 1 | OTHER |
| 155 | `public.documents` | 1 | KB_CONTENT |
| 156 | `public.kb_page_views` | 1 | KB_CONTENT |
| 157 | `public.system_errors` | 1 | OTHER |
| 158 | `public.article_ideas` | 1 | KB_CONTENT |
| 159 | `public.v_daily_ops_summary` | 1 | OTHER |
| 160 | `public.quality_metrics` | 0 | OPERATIONAL |
| 161 | `public.quality_trends` | 0 | OTHER |
| 162 | `public.item_tags` | 0 | KB_CONTENT |
| 163 | `public.sites_tokens` | 0 | OTHER |
| 164 | `public.aviation_profiles` | 0 | AUTH_USER |
| 165 | `public.brand_assets` | 0 | OTHER |
| 166 | `public.publication_example_articles` | 0 | KB_CONTENT |
| 167 | `public.push_subscriptions` | 0 | OTHER |
| 168 | `public.growthbook_events` | 0 | OTHER |
| 169 | `public.health_logs` | 0 | OPERATIONAL |
| 170 | `public.idea_active_suggestions` | 0 | OTHER |
| 171 | `public.aaoe_activity_log` | 0 | OPERATIONAL |
| 172 | `public.folders` | 0 | OTHER |
| 173 | `public.process_record_permissions` | 0 | OTHER |
| 174 | `public.hive_mind` | 0 | OTHER |
| 175 | `public.umdm_v_budget_pacing` | 0 | OTHER |
| 176 | `public.usage_events` | 0 | OTHER |
| 177 | `public.aeo_cost_log` | 0 | OPERATIONAL |
| 178 | `public.kb_versions` | 0 | KB_CONTENT |
| 179 | `public.workspace_members` | 0 | OTHER |
| 180 | `public.aeo_prompts` | 0 | OTHER |
| 181 | `public.sparky_design_profiles` | 0 | AUTH_USER |
| 182 | `public.workspace_invitations` | 0 | OTHER |
| 183 | `public.sl_brands` | 0 | OTHER |
| 184 | `public.v_project_health` | 0 | OPERATIONAL |
| 185 | `public.growthbook_exposures` | 0 | OTHER |
| 186 | `public.tool_call_log` | 0 | OPERATIONAL |
| 187 | `public.revenue` | 0 | OPERATIONAL |
| 188 | `public.ai_documents` | 0 | KB_CONTENT |
| 189 | `public.chat_messages` | 0 | OTHER |
| 190 | `public.process_report_snapshots` | 0 | OTHER |
| 191 | `public.rp_folders` | 0 | OTHER |
| 192 | `public.strategic_goals` | 0 | OTHER |
| 193 | `public.daily_production` | 0 | OTHER |
| 194 | `public.product_sales` | 0 | OTHER |
| 195 | `public.writing_productivity` | 0 | OTHER |
| 196 | `public.kb_database_relations` | 0 | KB_CONTENT |
| 197 | `public.api_usage_logs` | 0 | OPERATIONAL |
| 198 | `public.ai_activity_log` | 0 | OPERATIONAL |
| 199 | `public.ops_sync_log` | 0 | OPERATIONAL |
| 200 | `public.brand_tasks` | 0 | OPERATIONAL |
| 201 | `public.audit_log` | 0 | OPERATIONAL |
| 202 | `public.ops_n8n_templates` | 0 | OTHER |
| 203 | `public.knowledge_entries` | 0 | KB_CONTENT |
| 204 | `public.cost_alerts` | 0 | OPERATIONAL |
| 205 | `public.process_report_configs` | 0 | OTHER |
| 206 | `public.aaoe_anomalies` | 0 | OTHER |
| 207 | `public.nav_section_states` | 0 | OTHER |
| 208 | `public.trends` | 0 | OTHER |
| 209 | `public.temu_inspiration` | 0 | OTHER |
| 210 | `public.content_blocks` | 0 | KB_CONTENT |
| 211 | `public.digests` | 0 | OTHER |
| 212 | `public.hook_results` | 0 | OTHER |
| 213 | `public.kb_shared_links` | 0 | KB_CONTENT |
| 214 | `public.sparky_tasks` | 0 | OPERATIONAL |
| 215 | `public.code_agent_requests` | 0 | OPERATIONAL |
| 216 | `public.offers` | 0 | OTHER |
| 217 | `public.webhook_events` | 0 | OTHER |
| 218 | `public.fact_checks` | 0 | OTHER |
| 219 | `public.workflow_runs` | 0 | OPERATIONAL |
| 220 | `public.kb_database_rows` | 0 | KB_CONTENT |
| 221 | `public.reports` | 0 | OTHER |
| 222 | `public.vault_items` | 0 | KB_CONTENT |
| 223 | `public.sparky_api_usage` | 0 | OTHER |
| 224 | `public.health_checks` | 0 | OTHER |
| 225 | `public.content_improvement_suggestions` | 0 | KB_CONTENT |
| 226 | `public.rp_canvas_items` | 0 | KB_CONTENT |
| 227 | `public.agent_clusters` | 0 | OPERATIONAL |
| 228 | `public.code_workspaces` | 0 | OTHER |
| 229 | `public.daily_billing_metrics` | 0 | OPERATIONAL |
| 230 | `public.kb_workflow_runs` | 0 | KB_CONTENT |
| 231 | `public.cron_job_executions` | 0 | OPERATIONAL |
| 232 | `public.manus_automation_logs` | 0 | OPERATIONAL |
| 233 | `public.knowledge_item_versions` | 0 | KB_CONTENT |
| 234 | `public.sparky_events` | 0 | OTHER |
| 235 | `public.ai_usage_stats` | 0 | OTHER |
| 236 | `public.sl_workflow_runs` | 0 | OPERATIONAL |
| 237 | `public.content_templates` | 0 | KB_CONTENT |
| 238 | `public.products` | 0 | OTHER |
| 239 | `public.user_memory` | 0 | AI_RAG |
| 240 | `public.publication_aggregated_styles` | 0 | OTHER |
| 241 | `public.user_cost_overrides` | 0 | AUTH_USER |
| 242 | `public.brand_products` | 0 | OTHER |
| 243 | `public.writing_sessions` | 0 | OTHER |
| 244 | `public.fgs_variants` | 0 | OTHER |
| 245 | `public.expert_sources` | 0 | OTHER |
| 246 | `public.integration_sync_logs` | 0 | OPERATIONAL |
| 247 | `public.launch_connections` | 0 | OTHER |
| 248 | `public.process_saved_views` | 0 | OTHER |
| 249 | `public.backup_logs` | 0 | OPERATIONAL |
| 250 | `public.video_insights` | 0 | OTHER |
| 251 | `public.message_queue` | 0 | OTHER |
| 252 | `public.ai_chats` | 0 | OTHER |
| 253 | `public.notification_preferences` | 0 | OTHER |
| 254 | `public.idea_publication_score_history` | 0 | OTHER |
| 255 | `public.sl_topic_maps` | 0 | OTHER |
| 256 | `public.brand_content` | 0 | KB_CONTENT |
| 257 | `public.publication_style_analyses` | 0 | OTHER |
| 258 | `public.research_feeds` | 0 | OTHER |
| 259 | `public.nav_item_placements` | 0 | KB_CONTENT |
| 260 | `public.agent_sessions` | 0 | OPERATIONAL |
| 261 | `public.content_workflows` | 0 | KB_CONTENT |
| 262 | `public.rp_references` | 0 | KB_CONTENT |
| 263 | `public.daily_briefings` | 0 | OTHER |
| 264 | `public.article_payments` | 0 | KB_CONTENT |
| 265 | `public.audit_comments` | 0 | OTHER |
| 266 | `public.ops_ai_integrations` | 0 | OTHER |
| 267 | `public.export_jobs` | 0 | OTHER |
| 268 | `public.aaoe_cycles` | 0 | OTHER |
| 269 | `public.project_updates` | 0 | OPERATIONAL |
| 270 | `public.user_profiles` | 0 | AUTH_USER |
| 271 | `public.articles` | 0 | KB_CONTENT |
| 272 | `public.generated_scripts` | 0 | OTHER |
| 273 | `public.job_applications` | 0 | OTHER |
| 274 | `public.article_submissions` | 0 | KB_CONTENT |
| 275 | `public.consolidations` | 0 | OTHER |
| 276 | `public.automation_workflows` | 0 | OTHER |
| 277 | `public.brand_metrics` | 0 | OPERATIONAL |
| 278 | `public.webhooks` | 0 | OTHER |
| 279 | `public.files` | 0 | OTHER |
| 280 | `public.brand_funnels` | 0 | OTHER |
| 281 | `public.rp_profiles` | 0 | AUTH_USER |
| 282 | `public.claude_code_sessions` | 0 | KB_CONTENT |
| 283 | `public.sparky_daily_costs` | 0 | OPERATIONAL |
| 284 | `public.publishing_channels` | 0 | OTHER |
| 285 | `public.research_item_ai_extractions` | 0 | KB_CONTENT |
| 286 | `public.ai_content_briefs` | 0 | KB_CONTENT |
| 287 | `public.rp_ai_conversations` | 0 | OTHER |
| 288 | `public.ai_generations` | 0 | OTHER |
| 289 | `public.sl_budget` | 0 | OTHER |
| 290 | `public.transcripts` | 0 | OTHER |
| 291 | `public.manus_automation_rules` | 0 | OTHER |
| 292 | `public.user_node_progress` | 0 | AUTH_USER |
| 293 | `public.umdm_budgets` | 0 | OTHER |
| 294 | `public.research_items` | 0 | KB_CONTENT |
| 295 | `public.agent_handoffs` | 0 | OPERATIONAL |
| 296 | `public.link_packs` | 0 | OTHER |
| 297 | `public.process_synced_records` | 0 | OTHER |
| 298 | `public.document_versions` | 0 | KB_CONTENT |
| 299 | `public.publication_custom_scoring_weights` | 0 | OTHER |
| 300 | `public.scoring_outcome_tracking` | 0 | OTHER |
| 301 | `public.fgs_media` | 0 | OTHER |
| 302 | `public.platform_integrations` | 0 | OTHER |
| 303 | `public.sl_generated` | 0 | OTHER |
| 304 | `public.agent_workflow_runs` | 0 | OPERATIONAL |
| 305 | `public.brand_voices` | 0 | OTHER |
| 306 | `public.rate_tracker` | 0 | OTHER |
| 307 | `public.tags` | 0 | OTHER |
| 308 | `public.active_sessions` | 0 | OTHER |
| 309 | `public.aaoe_recommendations` | 0 | OTHER |
| 310 | `public.api_keys` | 0 | OTHER |
| 311 | `public.user_sessions` | 0 | AUTH_USER |
| 312 | `public.kb_databases` | 0 | KB_CONTENT |
| 313 | `public.cron_jobs` | 0 | OTHER |
| 314 | `public.social_posts` | 0 | KB_CONTENT |
| 315 | `public.memories` | 0 | AI_RAG |
| 316 | `public.launch_graph_edges` | 0 | OTHER |
| 317 | `public.scenarios` | 0 | OTHER |
| 318 | `public.article_versions` | 0 | KB_CONTENT |
| 319 | `public.fgs_orders` | 0 | OTHER |
| 320 | `public.kb_attachments` | 0 | KB_CONTENT |
| 321 | `public.publishing_queue` | 0 | OTHER |
| 322 | `public.idea_latest_scores` | 0 | OTHER |
| 323 | `public.notifications` | 0 | OTHER |
| 324 | `public.rp_versions` | 0 | KB_CONTENT |

---

> _This file contains schema metadata only — no raw data. Safe to commit._
> _Sensitive column values were redacted during sampling (regex: `/key|token|secret|password|email|phone|hash|jwt/i`)._
