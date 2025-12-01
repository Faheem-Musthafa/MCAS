import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { data, error } = await supabase
      .from("judges")
      .select("*")
      .eq("access_code", body.access_code.toUpperCase())
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Invalid access code" }, { status: 401 })
      }
      throw error
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error authenticating judge:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
