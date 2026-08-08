/**
 * GET /api/payments - Get paginated payments
 * POST /api/payments - Create new payment
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PaymentService } from "@/lib/services/PaymentService"
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

    // Get pagination params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    // Get paginated payments
    const repo = new PaymentRepository()
    const result = await repo.getPaginated(user.id, page, pageSize)

    return NextResponse.json({
      data: result.data,
      total: result.total,
      page,
      pageSize,
      pages: Math.ceil(result.total / pageSize),
    })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Record payment
    const repo = new PaymentRepository()
    const service = new PaymentService(repo)
    const payment = await service.recordPayment(body, user.id)

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
