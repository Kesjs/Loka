/**
 * PATCH /api/alerts/[id] - Mark single alert as read
 * DELETE /api/alerts/[id] - Delete alert
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AlertRepository } from "@/lib/db/repositories/AlertRepository"
import { handleApiError } from "@/lib/errors/ApplicationError"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { is_read } = body

    const repo = new AlertRepository()

    if (is_read) {
      await repo.markAsRead(id, user.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const repo = new AlertRepository()

    await repo.delete(id, user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
