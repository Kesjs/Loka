/**
 * GET /api/alerts/critical-count - Get count of critical unread alerts
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AlertRepository } from "@/lib/db/repositories/AlertRepository"
import { handleApiError } from "@/lib/errors/ApplicationError"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const repo = new AlertRepository()
    const count = await repo.getCriticalCount(user.id)

    return NextResponse.json({ count })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
