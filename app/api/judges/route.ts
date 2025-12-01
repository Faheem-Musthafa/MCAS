import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("judges")
      .select("*")
      .order("name", { ascending: true })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching judges:", error)
    return NextResponse.json({ error: "Failed to fetch judges" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from("judges")
      .insert({
        name: body.name,
        expertise: body.expertise,
        access_code: body.access_code || `JUDGE${Date.now().toString().slice(-6)}`,
        image: body.image || null,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating judge:", error)
    return NextResponse.json({ error: "Failed to create judge" }, { status: 500 })
  }
}
