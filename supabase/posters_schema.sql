-- =============================================
-- POSTERS TABLE SCHEMA
-- Store result posters separately from gallery
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Posters Table (for result posters)
CREATE TABLE IF NOT EXISTS posters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  src TEXT NOT NULL, -- Base64 or URL of the poster image
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id) -- One poster per event
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_posters_event ON posters(event_id);
CREATE INDEX IF NOT EXISTS idx_posters_created ON posters(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_posters_updated_at BEFORE UPDATE ON posters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for posters" ON posters FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert posters" ON posters FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update posters" ON posters FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete posters" ON posters FOR DELETE USING (auth.role() = 'authenticated');
