import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { FEST_CONFIG, type ResultPosition, type CategoryType } from "@/lib/supabase/types"
import { cookies } from "next/headers"

// Calculate points based on position, event category, and event type
function calculatePoints(position: ResultPosition, category: CategoryType, eventType: string): number {
  const type = (eventType === "group" || eventType === "team") ? "group" : "individual"
  const scoringConfig = FEST_CONFIG.scoring[category][type]
  return scoringConfig[position as keyof typeof scoringConfig] || 0
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("event_id")
    const teamId = searchParams.get("team_id")

    let query = supabase
      .from("results")
      .select(`
        *,
        event:events (*),
        team:teams (*)
      `)
      .order("created_at", { ascending: false })

    if (eventId) query = query.eq("event_id", eventId)
    if (teamId) query = query.eq("team_id", teamId)

    const { data, error } = await query

    if (error) throw error
    
    // Cache response for 1 minute, stale-while-revalidate for 10 minutes
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error("Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")
    
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createAdminClient()
    const body = await request.json()

    const position = body.position as ResultPosition
    
    // Get event information to determine category and type
    const { data: event } = await supabase
      .from("events")
      .select("category, event_type")
      .eq("id", body.event_id)
      .single()

    // Calculate points based on event category and type
    let points = body.points
    if (event && points === undefined) {
      points = calculatePoints(position, event.category, event.event_type)
    } else if (points === undefined) {
      points = 0 // fallback
    }

    // Insert the result
    const { data: result, error: resultError } = await supabase
      .from("results")
      .insert({
        event_id: body.event_id,
        team_id: body.team_id,
        position: position,
        points: points,
        participant_name: body.participant_name || null,
        notes: body.notes || null,
      })
      .select()
      .single()

    if (resultError) throw resultError

    // Update team stats based on position
    const updateFields: Record<string, number> = {}
    if (position === "1st") updateFields.gold = 1
    else if (position === "2nd") updateFields.silver = 1
    else if (position === "3rd") updateFields.bronze = 1

    // Fetch current team data
    const { data: team } = await supabase
      .from("teams")
      .select("total_points, gold, silver, bronze")
      .eq("id", body.team_id)
      .single()

    if (team) {
      const { error: teamError } = await supabase
        .from("teams")
        .update({
          total_points: (team.total_points || 0) + points,
          gold: (team.gold || 0) + (updateFields.gold || 0),
          silver: (team.silver || 0) + (updateFields.silver || 0),
          bronze: (team.bronze || 0) + (updateFields.bronze || 0),
        })
        .eq("id", body.team_id)

      if (teamError) console.error("Error updating team stats:", teamError)
    }

    // Update event status to completed
    await supabase
      .from("events")
      .update({ status: "completed" })
      .eq("id", body.event_id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating result:", error)
    return NextResponse.json({ error: "Failed to create result" }, { status: 500 })
  }
}
