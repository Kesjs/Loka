import { NextRequest, NextResponse } from "next/server"
import { ReportService } from "@/lib/services/ReportService"
import { withErrorHandler, requireAuth } from "@/lib/api/errorHandler"

const handler = async (request: NextRequest) => {
  const user = await requireAuth(request)

  const reportService = new ReportService()
  const report = await reportService.getOccupancyReport(user.id)

  return NextResponse.json(report)
}

export const GET = withErrorHandler(handler)
