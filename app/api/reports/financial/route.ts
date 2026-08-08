import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ReportService } from "@/lib/services/ReportService"
import { withErrorHandler, requireAuth, ValidationError } from "@/lib/api/errorHandler"

const handler = async (request: NextRequest) => {
  const user = await requireAuth(request)

  const searchParams = request.nextUrl.searchParams
  const startDate = new Date(searchParams.get("startDate") || "")
  const endDate = new Date(searchParams.get("endDate") || "")

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ValidationError("Invalid date parameters", {
      reason: "startDate and endDate must be valid ISO dates",
    })
  }

  const reportService = new ReportService()
  const report = await reportService.getFinancialReport(
    user.id,
    startDate,
    endDate
  )

  return NextResponse.json(report)
}

export const GET = withErrorHandler(handler)
