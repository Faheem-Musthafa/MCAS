import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("teams")
      .select("*")
      .order("total_points", { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 })
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
    
    // Generate short_name from department if not provided
    const shortName = body.short_name || body.department
      .split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 4)

    const { data, error } = await supabase
      .from("teams")
      .insert({
        name: body.name,
        short_name: shortName,
        department: body.department,
        logo: body.logo || null,
        color: body.color || "#3b82f6",
        total_points: body.total_points || 0,
        gold: body.gold || 0,
        silver: body.silver || 0,
        bronze: body.bronze || 0,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating team:", error)
    return NextResponse.json({ error: "Failed to create team" }, { status: 500 })
  }
}
