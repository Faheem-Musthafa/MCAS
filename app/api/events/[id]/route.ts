import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("events")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    // 1. Get all results for this event to revert points
    const { data: results } = await supabase
      .from("results")
      .select("*")
      .eq("event_id", id)

    if (results && results.length > 0) {
      // Group points by team to minimize updates
      const teamUpdates: Record<string, { points: number, gold: number, silver: number, bronze: number }> = {}

      for (const result of results) {
        if (!teamUpdates[result.team_id]) {
          teamUpdates[result.team_id] = { points: 0, gold: 0, silver: 0, bronze: 0 }
        }
        
        teamUpdates[result.team_id].points += result.points
        if (result.position === "1st") teamUpdates[result.team_id].gold += 1
        else if (result.position === "2nd") teamUpdates[result.team_id].silver += 1
        else if (result.position === "3rd") teamUpdates[result.team_id].bronze += 1
      }

      // Apply updates to teams
      for (const [teamId, updates] of Object.entries(teamUpdates)) {
        const { data: team } = await supabase
          .from("teams")
          .select("total_points, gold, silver, bronze")
          .eq("id", teamId)
          .single()

        if (team) {
          await supabase
            .from("teams")
            .update({
              total_points: Math.max(0, (team.total_points || 0) - updates.points),
              gold: Math.max(0, (team.gold || 0) - updates.gold),
              silver: Math.max(0, (team.silver || 0) - updates.silver),
              bronze: Math.max(0, (team.bronze || 0) - updates.bronze),
            })
            .eq("id", teamId)
        }
      }
    }

    // 2. Get all scores for this event to revert points (if any approved scores exist)
    // Note: We need to check if 'scores' table exists first, but assuming it does based on types
    const { data: scores } = await supabase
      .from("scores")
      .select("*")
      .eq("event_id", id)
      .eq("status", "approved")

    if (scores && scores.length > 0) {
      for (const score of scores) {
        const { data: team } = await supabase
          .from("teams")
          .select("total_points")
          .eq("id", score.team_id)
          .single()

        if (team) {
          await supabase
            .from("teams")
            .update({
              total_points: Math.max(0, (team.total_points || 0) - score.total_score)
            })
            .eq("id", score.team_id)
        }
      }
    }

    // 3. Delete the event (cascade will handle results and scores deletion)
    const { error } = await supabase.from("events").delete().eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
