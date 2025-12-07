import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { cookies } from "next/headers"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from("posters")
      .select(`
        *,
        event:events(id, title, category)
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: "Poster not found" }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching poster:", error)
    return NextResponse.json({ error: "Failed to fetch poster" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")
    
    if (!session?.value) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from("posters")
      .delete()
      .eq("id", id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting poster:", error)
    return NextResponse.json({ error: "Failed to delete poster" }, { status: 500 })
  }
}
