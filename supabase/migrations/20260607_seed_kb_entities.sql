-- ─────────────────────────────────────────────────────────────────────────
-- Seed kb_entities — InsightProfit canonical names + aliases
-- ─────────────────────────────────────────────────────────────────────────
-- Idempotent via ON CONFLICT (canonical). Re-running updates aliases.
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO kb_entities (canonical, aliases, entity_type, related_subdomain, authority_score, description) VALUES
  -- ── Production apps (28) ─────────────────────────────────────────────
  ('Apex',
    ARRAY['apex','apex-deploy','apex platform'],
    'app', 'apex', 90,
    'Flagship growth platform at apex.insightprofit.live.'),

  ('CloseFlow',
    ARRAY['close flow','closeflow','close-flow'],
    'app', 'closeflow', 85,
    'Sales close + ops workflow at closeflow.insightprofit.live.'),

  ('Customer Intelligence Engine',
    ARRAY['intel','customer intelligence','cie','insightprofit-intel','customer-intelligence-engine'],
    'app', 'intel', 80,
    'Customer Intelligence dashboard at intel.insightprofit.live.'),

  ('Delta Jobs CRM',
    ARRAY['delta','jobs','jobs crm','delta-jobs','delta-jobs-crm'],
    'app', 'jobs', 80,
    'Recruiting + job pipeline CRM at jobs.insightprofit.live.'),

  ('Design Inspiration Curator',
    ARRAY['design inspiration','design curator','design-inspiration','design-inspiration-curator','design boards'],
    'app', 'design', 80,
    'Design inspiration boards + curation at design.insightprofit.live.'),

  ('Digest HQ',
    ARRAY['digest','digest-hq','daily digest','digest hq'],
    'app', 'digest', 80,
    'Daily content digest engine at digest.insightprofit.live.'),

  ('EliteWriter',
    ARRAY['elite writer','elite-writer','elite writer app','elite-writer-app','elite'],
    'app', 'elite-writer-app', 90,
    'Long-form AI writing SaaS at elite-writer-app.insightprofit.live.'),

  ('Family Gift Studio',
    ARRAY['fgs','family gift','fgs-product-suite','family-gift-studio','family gift studio','gift studio','familygiftstudio'],
    'app', 'fgs', 95,
    'Print-on-demand gifting brand. Product line includes jewelry bundles, lifestyle imagery, hero photography. Live at fgs.insightprofit.live, repo: fgs-product-suite.'),

  ('InsightProfit Academy',
    ARRAY['academy','ip academy','insightprofit-academy','training'],
    'app', 'academy', 80,
    'Training + courseware at academy.insightprofit.live.'),

  ('Command Center v2',
    ARRAY['command','command center','command-v2','insightprofit-command-v2','command-center','mission control','cc','ops hub'],
    'app', 'command', 95,
    'Central ops hub at command.insightprofit.live. ALWAYS reference v2, never v1 (which is DEAD).'),

  ('Creative',
    ARRAY['creative','insightprofit-creative','creative workspace'],
    'app', 'creative', 75,
    'Creative asset workspace at creative.insightprofit.live.'),

  ('Ecom',
    ARRAY['ecom','ecommerce','insightprofit-ecom','ecommerce engine'],
    'app', 'ecom', 80,
    'Ecommerce engine at ecom.insightprofit.live.'),

  ('Email Ops',
    ARRAY['email','emailops','email-ops','insightprofit-emailops','email marketing','dunning','lifecycle email'],
    'app', 'email', 85,
    'Email marketing, dunning, lifecycle automation at email.insightprofit.live.'),

  ('InsightProfit Growth',
    ARRAY['growth','strategy','insightprofit-growth','growth platform','strategy docs'],
    'app', 'strategy', 80,
    'Strategy docs + dashboards at strategy.insightprofit.live.'),

  ('Hub',
    ARRAY['hub','insightprofit-hub','internal directory'],
    'app', 'hub', 70,
    'Internal directory at hub.insightprofit.live.'),

  ('InsightProfit Offers',
    ARRAY['offers','insightprofit-offers','offer marketplace'],
    'app', 'offers', 80,
    'Offer marketplace at offers.insightprofit.live.'),

  ('InsightProfit Services',
    ARRAY['services','insightprofit-services','service catalog'],
    'app', 'services', 75,
    'Service catalog at services.insightprofit.live.'),

  ('Knowledge Base',
    ARRAY['kb','knowledge-base-nextra','knowledge base','docs','wiki','nextra'],
    'app', 'kb', 95,
    'This Nextra docs property at kb.insightprofit.live. Hosts Chief of Staff (you).'),

  ('Offer Stack Engine',
    ARRAY['offer stack','offer-stack-engine','fundedfirst offers'],
    'app', 'offers', 80,
    'FundedFirst-branded offer stack at offers.fundedfirst.com, repo: offer-stack-engine.'),

  ('Product Board',
    ARRAY['products','product-board','product roadmap','roadmap'],
    'app', 'products', 80,
    'Product roadmap at products.insightprofit.live.'),

  ('Research Platform',
    ARRAY['research','research-platform','research workspace'],
    'app', 'research', 85,
    'Research workspace at research.insightprofit.live.'),

  ('Revenue Engine',
    ARRAY['revenue','revenue-engine','revenue analytics'],
    'app', 'revenue', 85,
    'Revenue analytics at revenue.insightprofit.live.'),

  ('Second Spring',
    ARRAY['second spring','secondspring','second-spring-platform','life transition'],
    'app', 'secondspring', 80,
    'Second Spring product at secondspring.insightprofit.live.'),

  ('Social Intelligence Engine',
    ARRAY['social','social intel','insightprofit-social','social-intelligence-engine','social listening'],
    'app', 'social', 80,
    'Social listening + intelligence at social.insightprofit.live.'),

  ('Sparky Studio',
    ARRAY['sparky','sparky-studio'],
    'app', 'sparky', 75,
    'Creative tooling at sparky.insightprofit.live.'),

  ('Tyber Sync',
    ARRAY['tyber','tyber-sync'],
    'app', 'tyber', 75,
    'Tyber integration at tyber.insightprofit.live.'),

  ('VidRevamp',
    ARRAY['vid revamp','vidrevamp','video repurpose','video repurposing'],
    'app', 'vidrevamp', 90,
    'Video repurposing SaaS at vidrevamp.insightprofit.live.'),

  -- ── Brands / product lines (cut across multiple apps) ────────────────
  ('FundedFirst',
    ARRAY['funded first','fundedfirst','funded-first'],
    'brand', NULL, 85,
    'FundedFirst brand. Lives at offers.fundedfirst.com via offer-stack-engine repo.'),

  ('SKYWARD OS',
    ARRAY['skyward','skyward os','skyward-os'],
    'brand', NULL, 70,
    'Personal command OS — Rashida''s top-level ops layer.'),

  -- ── Key shared resources / concepts ─────────────────────────────────
  ('Supabase',
    ARRAY['supabase','db','database','self-hosted db'],
    'service', NULL, 80,
    'Self-hosted Supabase at supabase.insightprofit.live. Backing store for all apps.'),

  ('Vercel',
    ARRAY['vercel','vercel deploy','vercel project'],
    'service', NULL, 70,
    'Deployment platform. Team: rashida-mendes-projects. Auto-deploys from main on every push.'),

  ('ClickUp',
    ARRAY['clickup','click up','clickup tasks','task tracker'],
    'service', NULL, 75,
    'Task tracker — mirrored into clickup_tasks Supabase table.'),

  ('Cloudflare',
    ARRAY['cloudflare','cf','cloudflare dns'],
    'service', NULL, 65,
    'DNS + edge for *.insightprofit.live domains.')

ON CONFLICT (lower(canonical)) DO UPDATE
  SET aliases     = EXCLUDED.aliases,
      entity_type = EXCLUDED.entity_type,
      related_subdomain = EXCLUDED.related_subdomain,
      authority_score = EXCLUDED.authority_score,
      description = EXCLUDED.description,
      updated_at  = now();
