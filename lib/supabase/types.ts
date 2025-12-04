// Database types for Supabase
// MCAS - Malabar College of Advanced Studies Arts & Sports Fest Management System

export type CategoryType = "ART" | "SPORTS"
export type ScoreStatus = "pending" | "approved" | "rejected"
export type EventStatus = "upcoming" | "ongoing" | "completed"
export type EventType = "individual" | "group" | "team"
export type StageType = "on-stage" | "off-stage"
export type ResultPosition = "1st" | "2nd" | "3rd" | "participation"

// Points awarded for each position
export const POSITION_POINTS: Record<ResultPosition, number> = {
  "1st": 10,
  "2nd": 7,
  "3rd": 5,
  "participation": 1,
}

// Database table types
export interface DbEvent {
  id: string
  title: string
  venue: string
  date: string
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

export interface DbJudge {
  id: string
  name: string
  expertise: string
  image: string | null
  access_code: string
  user_id: string | null
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

export interface DbJudgeScore {
  id: string
  score_id: string
  judge_id: string
  score: number
  criteria: string
  created_at: string
}

export interface DbGalleryItem {
  id: string
  src: string
  title: string
  event_id: string | null
  day: number | null
  span: string
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
  judge_scores: DbJudgeScore[]
  event?: DbEvent
  team?: DbTeam
}

export interface DbTeamStanding extends DbTeam {
  rank?: number
}

// Insert types (without auto-generated fields)
export type InsertEvent = {
  title: string
  venue: string
  date: string
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

export type InsertJudge = {
  name: string
  expertise: string
  access_code: string
  image?: string | null
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

export type InsertJudgeScore = {
  score_id: string
  judge_id: string
  score: number
  criteria: string
}

export type InsertGalleryItem = {
  src: string
  title: string
  event_id?: string | null
  day?: number | null
  span?: string
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
export type UpdateJudge = Partial<InsertJudge>
export type UpdateResult = Partial<InsertResult>
export type UpdateScore = Partial<InsertScore>
export type UpdateGalleryItem = Partial<InsertGalleryItem>
export type UpdateAnnouncement = Partial<InsertAnnouncement>

// Helper function to calculate points from position
export function getPointsForPosition(position: ResultPosition): number {
  return POSITION_POINTS[position] || 0
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
  days: 6,
  startDate: new Date("2025-12-15"),
  endDate: new Date("2025-12-20"),
}
