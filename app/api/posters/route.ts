import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("posters")
      .select(`
        *,
        event:events(id, title, category)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching posters:", error)
    return NextResponse.json({ error: "Failed to fetch posters" }, { status: 500 })
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
    
    // Check if poster already exists for this event
    const { data: existing } = await supabase
      .from("posters")
      .select("id")
      .eq("event_id", body.event_id)
      .single()

    if (existing) {
      // Update existing poster
      const { data, error } = await supabase
        .from("posters")
        .update({
          src: body.src,
          title: body.title,
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) throw error
      return NextResponse.json(data)
    }

    // Create new poster
    const { data, error } = await supabase
      .from("posters")
      .insert({
        event_id: body.event_id,
        src: body.src,
        title: body.title,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating poster:", error)
    return NextResponse.json({ error: "Failed to create poster" }, { status: 500 })
  }
}
