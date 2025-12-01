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
      .from("results")
      .select(`
        *,
        event:events (*),
        team:teams (*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching result:", error)
    return NextResponse.json({ error: "Failed to fetch result" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createAdminClient()
    
    // Get the result first to update team stats
    const { data: result } = await supabase
      .from("results")
      .select("*")
      .eq("id", id)
      .single()

    if (result) {
      // Revert team stats
      const { data: team } = await supabase
        .from("teams")
        .select("total_points, gold, silver, bronze")
        .eq("id", result.team_id)
        .single()

      if (team) {
        const updateFields: Record<string, number> = {
          total_points: Math.max(0, (team.total_points || 0) - result.points),
        }
        if (result.position === "1st") updateFields.gold = Math.max(0, (team.gold || 0) - 1)
        else if (result.position === "2nd") updateFields.silver = Math.max(0, (team.silver || 0) - 1)
        else if (result.position === "3rd") updateFields.bronze = Math.max(0, (team.bronze || 0) - 1)

        await supabase.from("teams").update(updateFields).eq("id", result.team_id)
      }
    }

    const { error } = await supabase.from("results").delete().eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting result:", error)
    return NextResponse.json({ error: "Failed to delete result" }, { status: 500 })
  }
}
