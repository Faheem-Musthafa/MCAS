-- =============================================
-- MCAS (Marian College Arts & Sports) Database Schema
-- College Fest Management System
-- Run this SQL FIRST in your new Supabase SQL Editor
-- Then run: team.sql, event.sql, result.sql
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP EXISTING TABLES AND TYPES (Clean Start)
-- =============================================

DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS posters CASCADE;
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS gallery CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS teams CASCADE;

DROP TYPE IF EXISTS category_type CASCADE;
DROP TYPE IF EXISTS event_status CASCADE;
DROP TYPE IF EXISTS event_type CASCADE;
DROP TYPE IF EXISTS stage_type CASCADE;
DROP TYPE IF EXISTS result_position CASCADE;
DROP TYPE IF EXISTS gallery_type CASCADE;
DROP TYPE IF EXISTS score_status CASCADE;

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE category_type AS ENUM ('ART', 'SPORTS');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed');
CREATE TYPE event_type AS ENUM ('individual', 'group', 'team');
CREATE TYPE stage_type AS ENUM ('on-stage', 'off-stage');
CREATE TYPE result_position AS ENUM ('1st', '2nd', '3rd', 'participation');
CREATE TYPE gallery_type AS ENUM ('photo', 'poster');
CREATE TYPE score_status AS ENUM ('pending', 'approved', 'rejected');

-- =============================================
-- TABLES
-- =============================================

-- Events Table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  date TEXT,
  day INTEGER DEFAULT 1,
  time_slot TEXT DEFAULT '10:00 AM',
  category category_type NOT NULL,
  stage_type stage_type NOT NULL DEFAULT 'off-stage',
  status event_status NOT NULL DEFAULT 'upcoming',
  event_type event_type NOT NULL DEFAULT 'individual',
  image TEXT,
  participant_limit INTEGER DEFAULT 50,
  registration_open BOOLEAN DEFAULT true,
  rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  department TEXT NOT NULL UNIQUE,
  logo TEXT,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  total_points INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  silver INTEGER DEFAULT 0,
  bronze INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Results Table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  position result_position NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  participant_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, team_id, position)
);

-- Gallery Table
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  src TEXT NOT NULL,
  title TEXT NOT NULL,
  span TEXT NOT NULL DEFAULT '1x1',
  type gallery_type NOT NULL DEFAULT 'photo',
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  day INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posters Table
CREATE TABLE posters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  src TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id)
);

-- Announcements Table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Scores Table
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

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_stage_type ON events(stage_type);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_day ON events(day);
CREATE INDEX idx_teams_department ON teams(department);
CREATE INDEX idx_teams_total_points ON teams(total_points DESC);
CREATE INDEX idx_results_event ON results(event_id);
CREATE INDEX idx_results_team ON results(team_id);
CREATE INDEX idx_results_position ON results(position);
CREATE INDEX idx_gallery_event ON gallery(event_id);
CREATE INDEX idx_gallery_type ON gallery(type);
CREATE INDEX idx_posters_event ON posters(event_id);
CREATE INDEX idx_posters_created ON posters(created_at DESC);
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_scores_event ON scores(event_id);
CREATE INDEX idx_scores_team ON scores(team_id);
CREATE INDEX idx_scores_status ON scores(status);

-- =============================================
-- TRIGGERS FOR updated_at
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at BEFORE UPDATE ON gallery
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posters_updated_at BEFORE UPDATE ON posters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scores_updated_at BEFORE UPDATE ON scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access for events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read access for teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read access for results" ON results FOR SELECT USING (true);
CREATE POLICY "Public read access for gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read access for posters" ON posters FOR SELECT USING (true);
CREATE POLICY "Public read access for announcements" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read access for scores" ON scores FOR SELECT USING (true);

-- Authenticated users write access
CREATE POLICY "Authenticated users can insert events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update events" ON events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete events" ON events FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert teams" ON teams FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update teams" ON teams FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete teams" ON teams FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert results" ON results FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update results" ON results FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete results" ON results FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert gallery" ON gallery FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update gallery" ON gallery FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete gallery" ON gallery FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert posters" ON posters FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update posters" ON posters FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete posters" ON posters FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert announcements" ON announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update announcements" ON announcements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete announcements" ON announcements FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert scores" ON scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update scores" ON scores FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete scores" ON scores FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- DONE! Now run these files in order:
-- 1. team.sql
-- 2. event.sql  
-- 3. result.sql
-- =============================================
