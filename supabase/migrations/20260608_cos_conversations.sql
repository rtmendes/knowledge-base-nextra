-- ─────────────────────────────────────────────────────────────────────────
-- Chief of Staff conversations — persistence + browsable history
-- ─────────────────────────────────────────────────────────────────────────
-- Stores every Chief of Staff chat so:
--   1. Past conversations are referenceable from /chief-of-staff/history
--   2. Saved chats can become knowledge_items (compounding learning)
--   3. Replies can be promoted to ClickUp tasks
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS cos_conversations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      text NOT NULL UNIQUE,
  user_id         uuid,
  title           text,
  summary         text,
  message_count   int NOT NULL DEFAULT 0,
  pinned          boolean NOT NULL DEFAULT false,
  archived        boolean NOT NULL DEFAULT false,
  saved_as_kb_item_id uuid,
  metadata        jsonb DEFAULT '{}'::jsonb,
  started_at      timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cos_conversations_session_idx
  ON cos_conversations (session_id);
CREATE INDEX IF NOT EXISTS cos_conversations_last_idx
  ON cos_conversations (last_message_at DESC) WHERE archived = false;
CREATE INDEX IF NOT EXISTS cos_conversations_pinned_idx
  ON cos_conversations (pinned, last_message_at DESC) WHERE pinned = true;

COMMENT ON TABLE cos_conversations IS
  'Chief of Staff chat sessions. One row per distinct session_id (client-generated uuid).';

-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cos_messages (
  id              bigserial PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES cos_conversations(id) ON DELETE CASCADE,
  role            text NOT NULL,  -- 'user' | 'assistant' | 'system'
  content         text NOT NULL,
  sources         jsonb DEFAULT '[]'::jsonb,
  matched_entities jsonb DEFAULT '[]'::jsonb,
  tokens_in       int,
  tokens_out      int,
  model           text,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cos_messages_conv_idx
  ON cos_messages (conversation_id, created_at);

COMMENT ON TABLE cos_messages IS
  'Individual messages within a Chief of Staff conversation. Sources captured per assistant turn.';

-- ─────────────────────────────────────────────────────────────────────────
-- FTS over conversation titles+summaries so history is searchable
ALTER TABLE cos_conversations
  ADD COLUMN IF NOT EXISTS search_doc tsvector;

CREATE OR REPLACE FUNCTION cos_conversations_update_search_doc() RETURNS trigger AS $$
BEGIN
  NEW.search_doc :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.summary, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cos_conversations_search_doc_trigger ON cos_conversations;
CREATE TRIGGER cos_conversations_search_doc_trigger
  BEFORE INSERT OR UPDATE OF title, summary ON cos_conversations
  FOR EACH ROW EXECUTE FUNCTION cos_conversations_update_search_doc();

CREATE INDEX IF NOT EXISTS cos_conversations_search_doc_idx
  ON cos_conversations USING GIN (search_doc);

-- ─────────────────────────────────────────────────────────────────────────
-- Grants — anon needed because the widget calls API routes which sometimes
-- fall back to anon key. Service role is used server-side for writes.
GRANT SELECT, INSERT, UPDATE ON cos_conversations TO anon, authenticated;
GRANT SELECT, INSERT ON cos_messages TO anon, authenticated;
GRANT USAGE ON SEQUENCE cos_messages_id_seq TO anon, authenticated;
