import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    
    let query = supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false })

    // Filter by type if provided
    if (type) {
      query = query.eq("type", type)
    }

    const { data, error } = await query

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching gallery:", error)
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
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
      .from("gallery")
      .insert({
        src: body.src,
        title: body.title,
        event_id: body.event_id || null,
        day: body.day || null,
        span: body.span || "1x1",
        type: body.type || "photo",
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating gallery item:", error)
    return NextResponse.json({ error: "Failed to create gallery item" }, { status: 500 })
  }
}
