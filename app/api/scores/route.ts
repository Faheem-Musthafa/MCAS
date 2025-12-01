import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ScoreStatus } from "@/lib/supabase/types"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as ScoreStatus | null
    const eventId = searchParams.get("event_id")

    let query = supabase
      .from("scores")
      .select(`
        *,
        judge_scores (*),
        event:events (*),
        team:teams (*)
      `)
      .order("submitted_at", { ascending: false })

    if (status) {
      query = query.eq("status", status)
    }
    if (eventId) {
      query = query.eq("event_id", eventId)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching scores:", error)
    return NextResponse.json({ error: "Failed to fetch scores" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Calculate total score from judge scores
    const totalScore = body.judge_scores?.reduce(
      (sum: number, js: { score: number }) => sum + js.score,
      0
    ) || 0

    // Insert the score
    const { data: scoreData, error: scoreError } = await supabase
      .from("scores")
      .insert({
        event_id: body.event_id,
        team_id: body.team_id,
        total_score: totalScore,
        status: "pending" as ScoreStatus,
        submitted_by: body.submitted_by,
      })
      .select()
      .single()

    if (scoreError) throw scoreError

    // Insert judge scores if provided
    if (body.judge_scores && body.judge_scores.length > 0) {
      const judgeScoreInserts = body.judge_scores.map(
        (js: { judge_id: string; score: number; criteria: string }) => ({
          score_id: scoreData.id,
          judge_id: js.judge_id,
          score: js.score,
          criteria: js.criteria,
        })
      )

      const { error: judgeScoreError } = await supabase
        .from("judge_scores")
        .insert(judgeScoreInserts)

      if (judgeScoreError) throw judgeScoreError
    }

    // Fetch the complete score with relations
    const { data: completeScore, error: fetchError } = await supabase
      .from("scores")
      .select(`
        *,
        judge_scores (*),
        event:events (*),
        team:teams (*)
      `)
      .eq("id", scoreData.id)
      .single()

    if (fetchError) throw fetchError

    return NextResponse.json(completeScore)
  } catch (error) {
    console.error("Error creating score:", error)
    return NextResponse.json({ error: "Failed to create score" }, { status: 500 })
  }
}
