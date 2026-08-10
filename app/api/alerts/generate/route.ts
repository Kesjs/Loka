/**
 * POST /api/alerts/generate - Generate daily alerts for user
 * This can be called manually or by a cron job
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { AlertService } from "@/lib/services/AlertService"
import { AlertRepository } from "@/lib/db/repositories/AlertRepository"
import { ContractRepository } from "@/lib/db/repositories/ContractRepository"
import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
import { handleApiError } from "@/lib/errors/ApplicationError"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Initialize service with repositories
    const alertService = new AlertService(
      new AlertRepository(),
      new ContractRepository(),
      new PaymentRepository()
    )

    // Generate alerts for the user
    await alertService.generateDailyAlerts(user.id)

    return NextResponse.json({
      success: true,
      message: "Alertes générées avec succès",
    })
  } catch (error) {
    console.error("Error generating alerts:", error)
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}
