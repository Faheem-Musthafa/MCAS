// Re-export everything from supabase module
export { createClient } from "./client"
export { createClient as createServerClient } from "./server"
export type {
  CategoryType,
  ScoreStatus,
  DbEvent,
  DbTeam,
  DbScore,
  DbGalleryItem,
  DbScoringCriteria,
} from "./types"
export * from "./queries"
