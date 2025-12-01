import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = supabase
      .from("scoring_criteria")
      .select("*")
      .order("name", { ascending: true })

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching scoring criteria:", error)
    return NextResponse.json({ error: "Failed to fetch scoring criteria" }, { status: 500 })
  }
}
