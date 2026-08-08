import { ExportService } from "@/lib/services/ExportService"
import { FinancialSummary, OccupancyReport, MonthlyData } from "@/lib/services/ReportService"

describe("ExportService", () => {
  let exportService: ExportService

  beforeEach(() => {
    exportService = new ExportService()
  })

  describe("exportFinancialReportCSV", () => {
    it("should export financial report to CSV format", () => {
      const data: FinancialSummary & { monthlyData: MonthlyData[] } = {
        totalRevenue: 3500,
        totalExpenses: 500,
        netProfit: 3000,
        profitMargin: 85.71,
        averageMonthlyRevenue: 1750,
        paymentMethods: { virement: 2, cash: 1 },
        monthlyData: [
          { month: "2024-01", revenue: 2000, expenses: 300, profit: 1700 },
          { month: "2024-02", revenue: 1500, expenses: 200, profit: 1300 },
        ],
      }

      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-02-28")

      const csv = exportService.exportFinancialReportCSV(data, startDate, endDate)

      expect(csv).toContain("Rapport Financier")
      expect(csv).toContain("Revenu Total,3500")
      expect(csv).toContain("Dépenses,500")
      expect(csv).toContain("Bénéfice Net,3000")
      expect(csv).toContain("2024-01,2000,300,1700")
      expect(csv).toContain("2024-02,1500,200,1300")
    })

    it("should handle zero revenue", () => {
      const data: FinancialSummary & { monthlyData: MonthlyData[] } = {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        averageMonthlyRevenue: 0,
        paymentMethods: {},
        monthlyData: [],
      }

      const csv = exportService.exportFinancialReportCSV(data, new Date(), new Date())

      expect(csv).toContain("Revenu Total,0")
      expect(csv).toContain("Bénéfice Net,0")
    })
  })

  describe("exportOccupancyReportCSV", () => {
    it("should export occupancy report to CSV format", () => {
      const data: OccupancyReport = {
        totalProperties: 10,
        occupied: 8,
        vacant: 2,
        occupancyRate: 80,
        propertyBreakdown: [
          {
            immeubleNom: "Immeuble A",
            total: 5,
            occupied: 4,
            vacant: 1,
          },
          {
            immeubleNom: "Immeuble B",
            total: 5,
            occupied: 4,
            vacant: 1,
          },
        ],
      }

      const csv = exportService.exportOccupancyReportCSV(data)

      expect(csv).toContain("Rapport d'Occupation")
      expect(csv).toContain("Total Logements,10")
      expect(csv).toContain("Occupés,8")
      expect(csv).toContain("Vacants,2")
      expect(csv).toContain("Immeuble A,5,4,1,80.0%")
      expect(csv).toContain("Immeuble B,5,4,1,80.0%")
    })
  })
})
