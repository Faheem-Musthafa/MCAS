-- =============================================
-- MCAS (Marian College Arts & Sports) Database Schema
-- College Fest Management System
-- Run this SQL in your Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE category_type AS ENUM ('ART', 'SPORTS');
CREATE TYPE event_status AS ENUM ('upcoming', 'ongoing', 'completed');
CREATE TYPE event_type AS ENUM ('individual', 'group', 'team');
CREATE TYPE stage_type AS ENUM ('on-stage', 'off-stage');
CREATE TYPE result_position AS ENUM ('1st', '2nd', '3rd', 'participation');

-- =============================================
-- TABLES
-- =============================================

-- Events Table (Enhanced for fest management)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  date TEXT NOT NULL,
  day INTEGER NOT NULL DEFAULT 1 CHECK (day >= 1 AND day <= 6),
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

-- Teams Table (Department-based for college fest)
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

-- Results Table (Position-based scoring)
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

CREATE TYPE gallery_type AS ENUM ('photo', 'poster');

-- Gallery Items Table
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

-- Announcements Table (for live updates)
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, warning, success, urgent
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
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
CREATE INDEX idx_announcements_active ON announcements(is_active);

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

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (for the public website)
CREATE POLICY "Public read access for events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read access for teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read access for results" ON results FOR SELECT USING (true);
CREATE POLICY "Public read access for gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read access for announcements" ON announcements FOR SELECT USING (true);

-- Admin write access (using service role key bypasses RLS)
-- These policies are for authenticated users if not using service role
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

CREATE POLICY "Authenticated users can insert announcements" ON announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update announcements" ON announcements FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete announcements" ON announcements FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- SEED DATA - Departments (Teams)
-- =============================================

INSERT INTO teams (name, short_name, department, color, total_points, gold, silver, bronze) VALUES
  ('Computer Science Dept.', 'CS', 'Computer Science', '#3b82f6', 0, 0, 0, 0),
  ('Electronics & Communication', 'EC', 'Electronics', '#8b5cf6', 0, 0, 0, 0),
  ('Mechanical Engineering', 'ME', 'Mechanical', '#ef4444', 0, 0, 0, 0),
  ('Civil Engineering', 'CE', 'Civil', '#22c55e', 0, 0, 0, 0),
  ('Electrical Engineering', 'EE', 'Electrical', '#f59e0b', 0, 0, 0, 0),
  ('Information Technology', 'IT', 'Information Technology', '#ec4899', 0, 0, 0, 0);

-- =============================================
-- SEED DATA - Sample Events (6-day fest)
-- =============================================

INSERT INTO events (title, description, venue, date, day, time_slot, category, stage_type, status, event_type, participant_limit, rules) VALUES
  -- Day 1: Inauguration & Arts
  ('Solo Singing', 'Individual singing competition - any language', 'Main Auditorium', 'DEC 15', 1, '10:00 AM', 'ART', 'on-stage', 'upcoming', 'individual', 30, 'Time limit: 5 minutes. No karaoke allowed.'),
  ('Painting Competition', 'Theme will be announced on spot', 'Art Gallery Hall', 'DEC 15', 1, '11:00 AM', 'ART', 'off-stage', 'upcoming', 'individual', 40, 'Materials provided. Time: 2 hours.'),
  ('Chess Championship', 'Standard chess rules apply', 'Seminar Hall A', 'DEC 15', 1, '2:00 PM', 'SPORTS', 'off-stage', 'upcoming', 'individual', 32, 'Swiss system tournament.'),
  
  -- Day 2: Group performances & Sports
  ('Group Dance', 'Minimum 6, Maximum 15 members', 'Open Air Theatre', 'DEC 16', 2, '10:00 AM', 'ART', 'on-stage', 'upcoming', 'group', 15, 'Time limit: 8 minutes. Theme: Fusion'),
  ('Table Tennis', 'Singles and doubles events', 'Indoor Stadium', 'DEC 16', 2, '9:00 AM', 'SPORTS', 'off-stage', 'upcoming', 'individual', 40, 'Best of 5 games for finals.'),
  ('Mime Act', 'Silent drama performance', 'Main Auditorium', 'DEC 16', 2, '2:00 PM', 'ART', 'on-stage', 'upcoming', 'group', 10, 'Time limit: 10 minutes.'),
  
  -- Day 3: Sports Day
  ('Football', '7-a-side tournament', 'Main Ground', 'DEC 17', 3, '8:00 AM', 'SPORTS', 'off-stage', 'upcoming', 'team', 60, '25 minutes each half. Rolling substitution.'),
  ('Badminton', 'Singles championship', 'Indoor Courts', 'DEC 17', 3, '9:00 AM', 'SPORTS', 'off-stage', 'upcoming', 'individual', 32, 'Knockout rounds.'),
  ('Classical Dance', 'Bharatanatyam, Kathak, Odissi accepted', 'Main Auditorium', 'DEC 17', 3, '3:00 PM', 'ART', 'on-stage', 'upcoming', 'individual', 20, 'Time limit: 7 minutes.'),
  
  -- Day 4: Cultural Day
  ('Street Play', 'Social awareness theme', 'Open Air Theatre', 'DEC 18', 4, '10:00 AM', 'ART', 'on-stage', 'upcoming', 'group', 15, 'Time limit: 15 minutes. No vulgarity.'),
  ('Photography Contest', 'Theme: Campus Life', 'Submission Online', 'DEC 18', 4, '12:00 PM', 'ART', 'off-stage', 'upcoming', 'individual', 50, 'Submit 3 photos. No heavy editing.'),
  ('Cricket', 'T10 format tournament', 'Cricket Ground', 'DEC 18', 4, '8:00 AM', 'SPORTS', 'off-stage', 'upcoming', 'team', 80, '10 overs each. Department teams.'),
  
  -- Day 5: Finals Day
  ('Basketball', '5-a-side finals', 'Basketball Court', 'DEC 19', 5, '9:00 AM', 'SPORTS', 'off-stage', 'upcoming', 'team', 50, 'FIBA rules. 4 quarters of 8 minutes.'),
  ('Band Performance', 'Original compositions preferred', 'Main Auditorium', 'DEC 19', 5, '5:00 PM', 'ART', 'on-stage', 'upcoming', 'group', 8, 'Time limit: 15 minutes. Must have live instruments.'),
  ('Quiz Competition', 'General knowledge and tech', 'Seminar Hall B', 'DEC 19', 5, '2:00 PM', 'ART', 'off-stage', 'upcoming', 'group', 30, 'Team of 3 members.'),
  
  -- Day 6: Grand Finale
  ('Fashion Show', 'Theme: Sustainable Fashion', 'Open Air Theatre', 'DEC 20', 6, '4:00 PM', 'ART', 'on-stage', 'upcoming', 'group', 12, 'Minimum 8 members. Choreography included.'),
  ('Volleyball Finals', 'Championship match', 'Volleyball Court', 'DEC 20', 6, '10:00 AM', 'SPORTS', 'off-stage', 'upcoming', 'team', 24, 'Best of 5 sets.'),
  ('DJ Night', 'Student DJs battle', 'Open Air Theatre', 'DEC 20', 6, '7:00 PM', 'ART', 'on-stage', 'upcoming', 'individual', 10, '15 minutes set per DJ.');

-- =============================================
-- SEED DATA - Sample Gallery
-- =============================================

INSERT INTO gallery (src, title, span, day) VALUES
  ('/inauguration-ceremony.jpg', 'MCAS 2025 Inauguration', 'col-span-2 row-span-2', 1),
  ('/dance-performance.jpg', 'Group Dance Finals', 'col-span-1 row-span-1', 2),
  ('/football-action.jpg', 'Football Semi-Finals', 'col-span-1 row-span-1', 3),
  ('/painting-exhibition.jpg', 'Art Exhibition', 'col-span-1 row-span-1', 1),
  ('/basketball-finals.jpg', 'Basketball Championship', 'col-span-2 row-span-1', 5),
  ('/fashion-show.jpg', 'Fashion Show Finale', 'col-span-1 row-span-1', 6);

-- =============================================
-- SEED DATA - Sample Announcements
-- =============================================

INSERT INTO announcements (title, message, type, is_active, priority) VALUES
  ('Welcome to MCAS 2025!', 'The biggest Arts & Sports fest of Marian College begins today. Check the schedule and participate!', 'success', true, 10),
  ('Registration Open', 'Event registrations are now open. Register through your department coordinator.', 'info', true, 5),
  ('Venue Change Notice', 'Group Dance event moved to Indoor Auditorium due to weather conditions.', 'warning', true, 8);

-- =============================================
-- MIGRATION NOTES
-- =============================================
-- If you have existing data and want to add new columns, use ALTER TABLE:
--
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS day INTEGER DEFAULT 1;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS time_slot TEXT DEFAULT '10:00 AM';
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS status event_status DEFAULT 'upcoming';
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS event_type event_type DEFAULT 'individual';
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS stage_type stage_type DEFAULT 'off-stage';
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS participant_limit INTEGER DEFAULT 50;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_open BOOLEAN DEFAULT true;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS rules TEXT;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT;
--
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS short_name TEXT;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS gold INTEGER DEFAULT 0;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS silver INTEGER DEFAULT 0;
-- ALTER TABLE teams ADD COLUMN IF NOT EXISTS bronze INTEGER DEFAULT 0;
-- ALTER TABLE teams DROP COLUMN IF EXISTS category;
-- ALTER TABLE teams DROP COLUMN IF EXISTS wins;
-- ALTER TABLE teams DROP COLUMN IF EXISTS podiums;

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

