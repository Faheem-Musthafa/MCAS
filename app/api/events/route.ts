import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { CategoryType, EventType, EventStatus, StageType } from "@/lib/supabase/types"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const day = searchParams.get("day")
    const status = searchParams.get("status") as EventStatus | null
    const category = searchParams.get("category") as CategoryType | null
    const stageType = searchParams.get("stage_type") as StageType | null

    let query = supabase
      .from("events")
      .select("*")
      .order("day", { ascending: true })
      .order("time_slot", { ascending: true })

    if (day) query = query.eq("day", parseInt(day))
    if (status) query = query.eq("status", status)
    if (category) query = query.eq("category", category)
    if (stageType) query = query.eq("stage_type", stageType)

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
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
    
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: body.title,
        venue: body.venue,
        date: body.date,
        day: body.day || 1,
        time_slot: body.time_slot || "TBD",
        category: body.category as CategoryType,
        stage_type: (body.stage_type || "off-stage") as StageType,
        event_type: (body.event_type || "individual") as EventType,
        participant_limit: body.participant_limit || null,
        registration_open: body.registration_open ?? true,
        status: (body.status || "upcoming") as EventStatus,
        rules: body.rules || null,
        image: body.image || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
