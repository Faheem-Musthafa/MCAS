// Data access functions for Supabase
// Server-side functions using the server client

import { createClient } from "./server"
import type {
  DbEvent,
  DbTeam,
  DbScore,
  DbGalleryItem,
  DbScoringCriteria,
  CategoryType,
  ScoreStatus,
} from "./types"

// =============================================
// EVENTS
// =============================================

export async function getEvents(): Promise<DbEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as DbEvent[]) || []
}

export async function getEvent(id: string): Promise<DbEvent | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as DbEvent
}

export async function getEventsByCategory(category: CategoryType): Promise<DbEvent[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as DbEvent[]) || []
}

export async function createEvent(event: {
  title: string
  venue: string
  date: string
  category: CategoryType
  image?: string | null
}): Promise<DbEvent> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .insert(event as any)
    .select()
    .single()

  if (error) throw error
  return data as DbEvent
}

export async function updateEvent(
  id: string,
  event: Partial<{
    title: string
    venue: string
    date: string
    category: CategoryType
    image: string | null
  }>
): Promise<DbEvent> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("events")
    .update(event as any)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as DbEvent
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) throw error
}

// =============================================
// TEAMS
// =============================================

export async function getTeams(): Promise<DbTeam[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("wins", { ascending: false })

  if (error) throw error
  return (data as DbTeam[]) || []
}

export async function getTeam(id: string): Promise<DbTeam | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") return null
    throw error
  }
  return data as DbTeam
}

export async function getTeamsByCategory(category: CategoryType): Promise<DbTeam[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("category", category)
    .order("wins", { ascending: false })

  if (error) throw error
  return (data as DbTeam[]) || []
}

export async function createTeam(team: {
  name: string
  category: CategoryType
  department: string
  color: string
  logo?: string | null
  wins?: number
  podiums?: number
}): Promise<DbTeam> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teams")
    .insert(team as any)
    .select()
    .single()

  if (error) throw error
  return data as DbTeam
}

export async function updateTeam(
  id: string,
  team: Partial<{
    name: string
    category: CategoryType
    department: string
    color: string
    logo: string | null
    wins: number
    podiums: number
  }>
): Promise<DbTeam> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("teams")
    .update(team as any)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as DbTeam
}

export async function deleteTeam(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("teams").delete().eq("id", id)

  if (error) throw error
}

// =============================================
// SCORES
// =============================================

export interface ScoreWithDetails extends DbScore {
  event?: DbEvent
  team?: DbTeam
}

export async function getScores(): Promise<ScoreWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scores")
    .select(`
      *,
      event:events (*),
      team:teams (*)
    `)
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return (data as ScoreWithDetails[]) || []
}

export async function getScoresByStatus(status: ScoreStatus): Promise<ScoreWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scores")
    .select(`
      *,
      event:events (*),
      team:teams (*)
    `)
    .eq("status", status)
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return (data as ScoreWithDetails[]) || []
}

export async function getScoresByEvent(eventId: string): Promise<ScoreWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scores")
    .select(`
      *,
      team:teams (*)
    `)
    .eq("event_id", eventId)
    .order("total_score", { ascending: false })

  if (error) throw error
  return (data as ScoreWithDetails[]) || []
}

export async function getScoresByTeam(teamId: string): Promise<ScoreWithDetails[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scores")
    .select(`
      *,
      event:events (*)
    `)
    .eq("team_id", teamId)
    .order("submitted_at", { ascending: false })

  if (error) throw error
  return (data as ScoreWithDetails[]) || []
}

export async function createScore(
  eventId: string,
  teamId: string,
  totalScore: number,
  submittedBy?: string
): Promise<DbScore> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("scores")
    .insert({
      event_id: eventId,
      team_id: teamId,
      total_score: totalScore,
      status: "pending",
      submitted_by: submittedBy,
    } as any)
    .select()
    .single()

  if (error) throw error
  return data as DbScore
}

export async function updateScoreStatus(id: string, status: ScoreStatus): Promise<DbScore> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scores")
    .update({ status } as any)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as DbScore
}

export async function updateScore(
  id: string,
  score: Partial<{
    event_id: string
    team_id: string
    total_score: number
    status: ScoreStatus
    submitted_by: string | null
  }>
): Promise<DbScore> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scores")
    .update(score as any)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as DbScore
}

export async function deleteScore(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("scores").delete().eq("id", id)

  if (error) throw error
}

// =============================================
// GALLERY
// =============================================

export async function getGallery(): Promise<DbGalleryItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as DbGalleryItem[]) || []
}

export async function createGalleryItem(item: {
  src: string
  title: string
  span?: string
}): Promise<DbGalleryItem> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("gallery")
    .insert(item as any)
    .select()
    .single()

  if (error) throw error
  return data as DbGalleryItem
}

export async function updateGalleryItem(
  id: string,
  item: Partial<{
    src: string
    title: string
    span: string
  }>
): Promise<DbGalleryItem> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("gallery")
    .update(item as any)
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data as DbGalleryItem
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from("gallery").delete().eq("id", id)

  if (error) throw error
}

// =============================================
// SCORING CRITERIA
// =============================================

export async function getScoringCriteria(): Promise<DbScoringCriteria[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scoring_criteria")
    .select("*")
    .order("name", { ascending: true })

  if (error) throw error
  return (data as DbScoringCriteria[]) || []
}

export async function getScoringCriteriaByCategory(category: CategoryType): Promise<DbScoringCriteria[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("scoring_criteria")
    .select("*")
    .eq("category", category)
    .order("name", { ascending: true })

  if (error) throw error
  return (data as DbScoringCriteria[]) || []
}

// =============================================
// DASHBOARD STATS
// =============================================

export interface DashboardStats {
  totalEvents: number
  totalTeams: number
  pendingScores: number
  approvedScores: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  const [eventsRes, teamsRes, pendingRes, approvedRes] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("teams").select("id", { count: "exact", head: true }),
    supabase.from("scores").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("scores").select("id", { count: "exact", head: true }).eq("status", "approved"),
  ])

  return {
    totalEvents: eventsRes.count || 0,
    totalTeams: teamsRes.count || 0,
    pendingScores: pendingRes.count || 0,
    approvedScores: approvedRes.count || 0,
  }
}
