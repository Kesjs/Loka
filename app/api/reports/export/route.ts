import { NextRequest, NextResponse } from "next/server"
import { ReportService } from "@/lib/services/ReportService"
import { ExportService } from "@/lib/services/ExportService"
import { withErrorHandler, requireAuth, ValidationError } from "@/lib/api/errorHandler"

const handler = async (request: NextRequest) => {
  const user = await requireAuth(request)

  const searchParams = request.nextUrl.searchParams
  const format = searchParams.get("format") || "pdf"
  const startDate = new Date(searchParams.get("startDate") || "")
  const endDate = new Date(searchParams.get("endDate") || "")

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new ValidationError("Invalid date parameters", {
      reason: "startDate and endDate must be valid ISO dates",
    })
  }

  const reportService = new ReportService()
  const exportService = new ExportService()

  // Fetch both reports
  const financialReport = await reportService.getFinancialReport(
    user.id,
    startDate,
    endDate
  )
  const occupancyReport = await reportService.getOccupancyReport(user.id)

  if (format === "csv") {
    // Combine both reports in CSV
    let csv = ""
    csv += exportService.exportFinancialReportCSV(financialReport, startDate, endDate)
    csv += "\n\n---\n\n"
    csv += exportService.exportOccupancyReportCSV(occupancyReport)

    const filename = `rapports-${new Date().toISOString().split("T")[0]}.csv`
    
    const response = new NextResponse(csv)
    response.headers.set("Content-Type", "text/csv; charset=utf-8")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    )
    return response
  } else {
    // Return financial PDF
    const financialPDF = exportService.exportFinancialReportPDF(
      financialReport,
      startDate,
      endDate
    )
    const filename = `rapports-${new Date().toISOString().split("T")[0]}.pdf`

    const response = new NextResponse(Buffer.from(financialPDF))
    response.headers.set("Content-Type", "application/pdf")
    response.headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    )
    return response
  }
}

export const GET = withErrorHandler(handler)
