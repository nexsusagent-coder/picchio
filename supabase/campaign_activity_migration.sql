-- Campaign enhancements migration
-- Adds scheduling and performance tracking to campaigns

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS start_date TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Activity log table for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_name TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
