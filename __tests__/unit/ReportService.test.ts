import { ReportService, MonthlyData } from "@/lib/services/ReportService"

// Mock Supabase
jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}))

import { createClient } from "@/lib/supabase/server"

describe("ReportService", () => {
  let reportService: ReportService
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      filter: jest.fn().mockReturnThis(),
      single: jest.fn(),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    reportService = new ReportService()
  })

  describe("getFinancialReport", () => {
    it("should calculate total revenue from payments", async () => {
      const mockPayments = [
        { montant: 1000, date_paiement: "2024-01-15", mode: "virement" },
        { montant: 1000, date_paiement: "2024-02-15", mode: "cash" },
        { montant: 500, date_paiement: "2024-02-20", mode: "mobile_money" },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValueOnce({ data: mockPayments, error: null }),
      })

      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-02-28")

      const report = await reportService.getFinancialReport(
        "user-1",
        startDate,
        endDate
      )

      expect(report.totalRevenue).toBe(2500)
      expect(report.monthlyData).toHaveLength(2)
    })

    it("should calculate profit margin correctly", async () => {
      const mockPayments = [
        { montant: 1000, date_paiement: "2024-01-15", mode: "virement" },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValueOnce({ data: mockPayments, error: null }),
      })

      const report = await reportService.getFinancialReport(
        "user-1",
        new Date("2024-01-01"),
        new Date("2024-01-31")
      )

      // With 0 expenses, margin should be 100%
      expect(report.profitMargin).toBe(100)
    })

    it("should track payment methods", async () => {
      const mockPayments = [
        { montant: 1000, date_paiement: "2024-01-15", mode: "virement" },
        { montant: 500, date_paiement: "2024-01-20", mode: "cash" },
        { montant: 800, date_paiement: "2024-01-25", mode: "virement" },
      ]

      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValueOnce({ data: mockPayments, error: null }),
      })

      const report = await reportService.getFinancialReport(
        "user-1",
        new Date("2024-01-01"),
        new Date("2024-01-31")
      )

      expect(report.paymentMethods["virement"]).toBe(2)
      expect(report.paymentMethods["cash"]).toBe(1)
    })

    it("should handle empty payments", async () => {
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
      })

      const report = await reportService.getFinancialReport(
        "user-1",
        new Date("2024-01-01"),
        new Date("2024-01-31")
      )

      expect(report.totalRevenue).toBe(0)
      expect(report.netProfit).toBe(0)
      expect(report.monthlyData).toHaveLength(0)
    })
  })

  describe("getOccupancyReport", () => {
    it("should calculate occupancy rate correctly", async () => {
      const mockImmeubles = [
        { id: "immeuble-1", nom: "Immeuble A" },
      ]

      const mockLogements = [
        { id: "log-1", immeuble_id: "immeuble-1", statut: "occupe" },
        { id: "log-2", immeuble_id: "immeuble-1", statut: "occupe" },
        { id: "log-3", immeuble_id: "immeuble-1", statut: "vacant" },
      ]

      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValueOnce({ data: mockImmeubles, error: null }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          in: jest.fn().mockResolvedValueOnce({ data: mockLogements, error: null }),
        })

      const report = await reportService.getOccupancyReport("user-1")

      expect(report.totalProperties).toBe(3)
      expect(report.occupied).toBe(2)
      expect(report.vacant).toBe(1)
      expect(report.occupancyRate).toBeCloseTo(66.67, 1)
    })

    it("should handle no properties", async () => {
      mockSupabase.from
        .mockReturnValueOnce({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValueOnce({ data: [], error: null }),
        })

      const report = await reportService.getOccupancyReport("user-1")

      expect(report.totalProperties).toBe(0)
      expect(report.occupied).toBe(0)
      expect(report.occupancyRate).toBe(0)
      expect(report.propertyBreakdown).toHaveLength(0)
    })
  })

  describe("formatMonthlyChartData", () => {
    it("should format monthly data for charts", () => {
      const monthlyData: MonthlyData[] = [
        {
          month: "2024-01",
          revenue: 3000,
          expenses: 500,
          profit: 2500,
        },
        {
          month: "2024-02",
          revenue: 3000,
          expenses: 600,
          profit: 2400,
        },
      ]

      const formatted = reportService.formatMonthlyChartData(monthlyData)

      expect(formatted).toHaveLength(2)
      expect(formatted[0].revenue).toBe(3000)
      expect(formatted[0].expenses).toBe(500)
    })
  })

  describe("formatOccupancyChartData", () => {
    it("should format occupancy data for pie chart", () => {
      const occupancyReport = {
        totalProperties: 3,
        occupied: 2,
        vacant: 1,
        occupancyRate: 66.67,
        propertyBreakdown: [],
      }

      const formatted = reportService.formatOccupancyChartData(occupancyReport)

      expect(formatted).toHaveLength(2)
      expect(formatted[0]).toEqual({ name: "Occupées", value: 2 })
      expect(formatted[1]).toEqual({ name: "Vacantes", value: 1 })
    })
  })
})
