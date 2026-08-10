/**
 * GET /api/alerts - Get alerts
 * GET /api/alerts?unread=true - Get unread alerts only
 * PATCH /api/alerts/:id - Mark alert as read
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AlertService } from "@/lib/services/AlertService"
import { AlertRepository } from "@/lib/db/repositories/AlertRepository"
import { ContractRepository } from "@/lib/db/repositories/ContractRepository"
import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
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

    const { searchParams } = new URL(request.url)
    const unread = searchParams.get("unread") === "true"

    const repo = new AlertRepository()

    if (unread) {
      const alerts = await repo.getUnread(user.id)
      return NextResponse.json(alerts)
    } else {
      const alerts = await repo.getAll(user.id)
      return NextResponse.json(alerts)
    }
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { alertId, is_read } = body

    const repo = new AlertRepository()

    if (is_read) {
      await repo.markAsRead(alertId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
