/**
 * ReportService
 * Business logic for generating reports and analytics
 */

import { createClient } from "@/lib/supabase/server"

export interface FinancialSummary {
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
  averageMonthlyRevenue: number
  paymentMethods: Record<string, number>
}

export interface OccupancyReport {
  totalProperties: number
  occupied: number
  vacant: number
  occupancyRate: number
  propertyBreakdown: Array<{
    immeubleNom: string
    total: number
    occupied: number
    vacant: number
  }>
}

export interface MonthlyData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

export interface TenantPerformance {
  tenantId: string
  tenantName: string
  totalPaid: number
  totalDue: number
  paymentRate: number
  lastPaymentDate?: string
}

export interface TaxReport {
  year: number
  grossRevenue: number
  deductibleExpenses: number
  taxableIncome: number
  guaranteeHeld: number
  guaranteeReturned: number
}

export class ReportService {
  /**
   * Get comprehensive financial report for period
   */
  async getFinancialReport(
    proprietaireId: string,
    startDate: Date,
    endDate: Date
  ): Promise<FinancialSummary & { monthlyData: MonthlyData[] }> {
    const supabase = await createClient()

    // Get all payments in period
    const { data: payments, error: paymentsError } = await supabase
      .from("paiements")
      .select("*")
      .eq("proprietaire_id", proprietaireId)
      .gte("date_paiement", startDate.toISOString())
      .lte("date_paiement", endDate.toISOString())

    if (paymentsError) throw paymentsError

    // Calculate monthly aggregates
    const monthlyMap = new Map<string, { revenue: number; expenses: number }>(
    )
    const paymentMethodMap = new Map<string, number>()

    const totalRevenue = (payments || []).reduce((sum, p) => {
      sum += Number(p.montant) || 0

      // Track payment methods
      const method = p.mode || "unknown"
      paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + 1)

      // Track monthly
      const monthKey = new Date(p.date_paiement).toISOString().slice(0, 7)
      const monthData = monthlyMap.get(monthKey) || { revenue: 0, expenses: 0 }
      monthData.revenue += Number(p.montant) || 0
      monthlyMap.set(monthKey, monthData)

      return sum
    }, 0)

    // TODO: Get expenses from future expenses table
    const totalExpenses = 0

    const netProfit = totalRevenue - totalExpenses
    const profitMargin =
      totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    const monthCount = monthlyMap.size || 1
    const averageMonthlyRevenue = totalRevenue / monthCount

    // Convert monthlyMap to sorted array
    const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))

    // Convert paymentMethods map to object
    const paymentMethods: Record<string, number> = {}
    paymentMethodMap.forEach((count, method) => {
      paymentMethods[method] = count
    })

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      averageMonthlyRevenue,
      paymentMethods,
      monthlyData,
    }
  }

  /**
   * Get occupancy report with property breakdown
   */
  async getOccupancyReport(proprietaireId: string): Promise<OccupancyReport> {
    const supabase = await createClient()

    // Get all immeubles for this owner
    const { data: immeubles, error: immeubleError } = await supabase
      .from("immeubles")
      .select("id, nom")
      .eq("proprietaire_id", proprietaireId)

    if (immeubleError) throw immeubleError

    const immeubleIds = (immeubles || []).map((i) => i.id)

    if (immeubleIds.length === 0) {
      return {
        totalProperties: 0,
        occupied: 0,
        vacant: 0,
        occupancyRate: 0,
        propertyBreakdown: [],
      }
    }

    // Get all logements
    const { data: logements, error: logementError } = await supabase
      .from("logements")
      .select("id, immeuble_id, statut")
      .in("immeuble_id", immeubleIds)

    if (logementError) throw logementError

    const totalProperties = (logements || []).length
    const occupied = (logements || []).filter(
      (l) => l.statut === "occupe"
    ).length
    const vacant = totalProperties - occupied
    const occupancyRate =
      totalProperties > 0 ? (occupied / totalProperties) * 100 : 0

    // Build property breakdown
    const propertyBreakdown = (immeubles || []).map((immeuble) => {
      const immeubleLogements = (logements || []).filter(
        (l) => l.immeuble_id === immeuble.id
      )
      const total = immeubleLogements.length
      const occupiedCount = immeubleLogements.filter(
        (l) => l.statut === "occupe"
      ).length

      return {
        immeubleNom: immeuble.nom,
        total,
        occupied: occupiedCount,
        vacant: total - occupiedCount,
      }
    })

    return {
      totalProperties,
      occupied,
      vacant,
      occupancyRate,
      propertyBreakdown,
    }
  }

  /**
   * Get tenant payment performance
   */
  async getTenantPerformance(
    proprietaireId: string,
    startDate: Date,
    endDate: Date
  ): Promise<TenantPerformance[]> {
    const supabase = await createClient()

    // Get all tenants
    const { data: tenants, error: tenantError } = await supabase
      .from("locataires")
      .select("id, nom")
      .eq("proprietaire_id", proprietaireId)

    if (tenantError) throw tenantError

    const tenantIds = (tenants || []).map((t) => t.id)

    if (tenantIds.length === 0) return []

    // Get all contracts for these tenants in period
    const { data: contracts, error: contractError } = await supabase
      .from("contrats")
      .select("id, locataire_id, loyer_mensuel, date_debut, date_fin")
      .in("locataire_id", tenantIds)
      .gte("date_debut", startDate.toISOString())
      .lte("date_fin", endDate.toISOString())

    if (contractError) throw contractError

    // Get payments for these contracts in period
    const contractIds = (contracts || []).map((c) => c.id)
    const { data: payments, error: paymentError } = await supabase
      .from("paiements")
      .select("contrat_id, montant, date_paiement")
      .in("contrat_id", contractIds)
      .gte("date_paiement", startDate.toISOString())
      .lte("date_paiement", endDate.toISOString())

    if (paymentError) throw paymentError

    // Calculate per tenant
    return (tenants || []).map((tenant) => {
      const tenantContracts = (contracts || []).filter(
        (c) => c.locataire_id === tenant.id
      )
      const tenantPayments = (payments || []).filter((p) => {
        return tenantContracts.some((c) => c.id === p.contrat_id)
      })

      const totalDue = tenantContracts.reduce((sum, c) => {
        sum += Number(c.loyer_mensuel) || 0
        return sum
      }, 0)

      const totalPaid = tenantPayments.reduce((sum, p) => {
        sum += Number(p.montant) || 0
        return sum
      }, 0)

      const paymentRate =
        totalDue > 0 ? (totalPaid / totalDue) * 100 : 0

      const lastPayment = tenantPayments.sort((a, b) =>
        b.date_paiement.localeCompare(a.date_paiement)
      )[0]

      return {
        tenantId: tenant.id,
        tenantName: tenant.nom,
        totalPaid,
        totalDue,
        paymentRate,
        lastPaymentDate: lastPayment?.date_paiement,
      }
    })
  }

  /**
   * Get tax report for year
   */
  async getTaxReport(
    proprietaireId: string,
    year: number
  ): Promise<TaxReport> {
    const supabase = await createClient()

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    // Get payments for the year
    const { data: payments } = await supabase
      .from("paiements")
      .select("montant")
      .eq("proprietaire_id", proprietaireId)
      .gte("date_paiement", startDate.toISOString())
      .lte("date_paiement", endDate.toISOString())

    const grossRevenue = (payments || []).reduce(
      (sum, p) => sum + (Number(p.montant) || 0),
      0
    )

    // TODO: Get deductible expenses from expenses table
    const deductibleExpenses = 0

    const taxableIncome = grossRevenue - deductibleExpenses

    // Get guarantee info
    const { data: guarantees } = await supabase
      .from("garanties")
      .select("amount, status")
      .eq("proprietaire_id", proprietaireId)

    const guaranteeHeld = (guarantees || [])
      .filter((g) => g.status === "held")
      .reduce((sum, g) => sum + (Number(g.amount) || 0), 0)

    const guaranteeReturned = (guarantees || [])
      .filter((g) => g.status === "returned")
      .reduce((sum, g) => sum + (Number(g.amount) || 0), 0)

    return {
      year,
      grossRevenue,
      deductibleExpenses,
      taxableIncome,
      guaranteeHeld,
      guaranteeReturned,
    }
  }

  /**
   * Calculate monthly chart data
   */
  formatMonthlyChartData(
    monthlyData: MonthlyData[]
  ): Array<{ month: string; revenue: number; expenses: number }> {
    return monthlyData.map((data) => ({
      month: new Date(data.month).toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
      }),
      revenue: Math.round(data.revenue),
      expenses: Math.round(data.expenses),
    }))
  }

  /**
   * Calculate occupancy chart data
   */
  formatOccupancyChartData(report: OccupancyReport): Array<{
    name: string
    value: number
  }> {
    return [
      { name: "Occupées", value: report.occupied },
      { name: "Vacantes", value: report.vacant },
    ]
  }

  /**
   * Calculate payment methods chart data
   */
  formatPaymentMethodsData(
    methods: Record<string, number>
  ): Array<{ name: string; value: number }> {
    return Object.entries(methods).map(([method, count]) => ({
      name: method.replace("_", " ").toUpperCase(),
      value: count,
    }))
  }
}
