/**
 * Missing Payments Route
 * GET: Fetch overdue/missing payments
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
import { apiErrorResponse } from "@/lib/api/errorHandler"

/**
 * GET /api/paiements/missing?proprietaire_id=xxx&month=2024-08
 * Fetch missing payments for a specific month
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const proprietaireId = searchParams.get("proprietaire_id") || user.id
    const monthStr = searchParams.get("month") // Format: YYYY-MM

    // Verify ownership
    if (proprietaireId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Invalid proprietaire_id" },
        { status: 403 }
      )
    }

    // Parse month if provided
    let month: Date | undefined
    if (monthStr) {
      const [year, monthNum] = monthStr.split("-")
      month = new Date(parseInt(year), parseInt(monthNum) - 1, 1)
    }

    // Get missing payments
    const paymentRepo = new PaymentRepository()
    const missing = await paymentRepo.getMissingForMonth(proprietaireId, month)

    return NextResponse.json(missing, { status: 200 })
  } catch (error) {
    return apiErrorResponse(error, "Failed to fetch missing payments")
  }
}
