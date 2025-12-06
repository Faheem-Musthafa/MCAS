
-- =============================================
-- SCORES TABLE (Added for manual scoring/approval workflow)
-- =============================================

CREATE TYPE score_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL DEFAULT 0,
  status score_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scores_event ON scores(event_id);
CREATE INDEX idx_scores_team ON scores(team_id);
CREATE INDEX idx_scores_status ON scores(status);

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert scores" ON scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update scores" ON scores FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete scores" ON scores FOR DELETE USING (auth.role() = 'authenticated');
