// Database types for Supabase
// MCAS - Malabar College of Advanced Studies Arts & Sports Fest Management System

export type CategoryType = "ART" | "SPORTS"
export type ScoreStatus = "pending" | "approved" | "rejected"
export type EventStatus = "upcoming" | "ongoing" | "completed"
export type EventType = "individual" | "group" | "team"
export type StageType = "on-stage" | "off-stage"
export type ResultPosition = "1st" | "2nd" | "3rd" | "participation"

// Database table types
export interface DbEvent {
  id: string
  title: string
  venue: string
  date: string | null // Made nullable for compatibility
  day: number // Day 1, Day 2, etc.
  time_slot: string // e.g., "10:00 AM - 12:00 PM"
  category: CategoryType
  stage_type: StageType // on-stage or off-stage
  event_type: EventType
  participant_limit: number | null
  registration_open: boolean
  status: EventStatus
  rules: string | null
  image: string | null
  created_at: string
  updated_at: string
}

export interface DbTeam {
  id: string
  name: string
  short_name: string // e.g., "CS", "EC", "ME"
  department: string
  logo: string | null
  color: string
  total_points: number // Overall points from all events
  gold: number // 1st places
  silver: number // 2nd places
  bronze: number // 3rd places
  created_at: string
  updated_at: string
}

// Results table - stores final positions for each event
export interface DbResult {
  id: string
  event_id: string
  team_id: string
  position: ResultPosition
  points: number
  participant_name: string | null // For individual events
  notes: string | null
  created_at: string
}

export interface DbScore {
  id: string
  event_id: string
  team_id: string
  total_score: number
  status: ScoreStatus
  submitted_at: string
  submitted_by: string | null
  created_at: string
  updated_at: string
}

export type GalleryType = "photo" | "poster"

export interface DbGalleryItem {
  id: string
  src: string
  title: string
  event_id: string | null
  day: number | null
  span: string
  type: GalleryType
  created_at: string
  updated_at: string
}

export interface DbScoringCriteria {
  id: string
  name: string
  max_score: number
  category: CategoryType
  created_at: string
}

// Poster for result announcements
export interface DbPoster {
  id: string
  event_id: string
  src: string
  title: string
  created_at: string
  updated_at: string
}

export interface DbPosterWithEvent extends DbPoster {
  event?: DbEvent
}

// Announcement for live updates
export interface DbAnnouncement {
  id: string
  title: string
  message: string
  type: "info" | "result" | "schedule" | "urgent"
  is_active: boolean
  created_at: string
}

// Extended types with relations
export interface DbEventWithResults extends DbEvent {
  results?: DbResultWithTeam[]
}

export interface DbResultWithTeam extends DbResult {
  team?: DbTeam
  event?: DbEvent
}

export interface DbScoreWithDetails extends DbScore {
  event?: DbEvent
  team?: DbTeam
}

export interface DbTeamStanding extends DbTeam {
  rank?: number
}

// Insert types (without auto-generated fields)
export interface InsertEvent {
  title: string
  venue: string
  date?: string | null // Made optional and nullable
  day?: number
  time_slot?: string
  category: CategoryType
  stage_type?: StageType
  event_type?: EventType
  participant_limit?: number | null
  registration_open?: boolean
  status?: EventStatus
  rules?: string | null
  image?: string | null
}

export type InsertTeam = {
  name: string
  short_name?: string
  department: string
  color: string
  logo?: string | null
  total_points?: number
  gold?: number
  silver?: number
  bronze?: number
}

export type InsertResult = {
  event_id: string
  team_id: string
  position: ResultPosition
  points?: number
  participant_name?: string | null
  remarks?: string | null
}

export type InsertScore = {
  event_id: string
  team_id: string
  total_score?: number
  status?: ScoreStatus
  submitted_by?: string | null
}

export type InsertGalleryItem = {
  src: string
  title: string
  event_id?: string | null
  day?: number | null
  span?: string
  type?: GalleryType
}

export type InsertAnnouncement = {
  title: string
  message: string
  type?: "info" | "result" | "schedule" | "urgent"
  is_active?: boolean
}

// Update types (all fields optional)
export type UpdateEvent = Partial<InsertEvent>
export type UpdateTeam = Partial<InsertTeam>
export type UpdateResult = Partial<InsertResult>
export type UpdateScore = Partial<InsertScore>
export type UpdateGalleryItem = Partial<InsertGalleryItem>
export type UpdateAnnouncement = Partial<InsertAnnouncement>

// Helper functions to calculate points from position
export function getPointsForPosition(
  position: ResultPosition, 
  category: CategoryType, 
  eventType: EventType = "individual"
): number {
  const type = (eventType === "group" || eventType === "team") ? "group" : "individual"
  const scoringConfig = FEST_CONFIG.scoring[category][type]
  return scoringConfig[position as keyof typeof scoringConfig] || 0
}

// Backward compatibility - uses default ART individual scoring
export function getLegacyPointsForPosition(position: ResultPosition): number {
  return getPointsForPosition(position, "ART", "individual")
}

// Festival config
export const FEST_CONFIG = {
  name: "MCAS 2025",
  fullName: "Malabar College of Advanced Studies Arts & Sports Fest",
  tagline: "Art moves the mind, sport moves the body",
  college: "Malabar College of Advanced Studies",
  department: "Department of Computer Science",
  studentUnion: "11th Student Union",
  location: "Main Campus",
  Created : "Faheem Musthafa",
  // College departments for team registration
  departments: [
    "BCA",
    "Electronics",
    "BBA",
    "Psychology",
    "Bcom CA",
    "Bcom TT",
    "Multimedia",
    "Economics",
    "BA Engilsh"
  ],
  // Scoring system - Different points for Arts vs Sports
  scoring: {
    ART: {
      group: { "1st": 15, "2nd": 10, "3rd": 5, "participation": 2 },      // Higher for group arts (performances, etc.)
      individual: { "1st": 8, "2nd": 5, "3rd": 3, "participation": 1 },   // Moderate for individual arts
    },
    SPORTS: {
      group: { "1st": 20, "2nd": 15, "3rd": 10, "participation": 3 },     // Highest for group sports (team events)
      individual: { "1st": 12, "2nd": 8, "3rd": 5, "participation": 2 },  // High for individual sports
    },
  },
  // Auto-refresh interval in milliseconds (30 seconds)
  refreshInterval: 30000,
}
