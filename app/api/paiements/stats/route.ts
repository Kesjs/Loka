/**
 * Payment Statistics Route
 * GET: Fetch payment stats and analytics
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/paiements/stats?proprietaire_id=xxx
 * Fetch payment statistics
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

    // Verify ownership
    if (proprietaireId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Invalid proprietaire_id" },
        { status: 403 }
      )
    }

    // Get current month
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get all payments for this month
    const { data: payments } = await supabase
      .from("paiements")
      .select("montant, mode")
      .eq("proprietaire_id", proprietaireId)
      .gte("date_paiement", monthStart.toISOString())
      .lte("date_paiement", monthEnd.toISOString())

    // Get all contracts to calculate expected revenue
    const { data: contracts } = await supabase
      .from("contrats")
      .select("loyer_mensuel, statut")
      .eq("proprietaire_id", proprietaireId)
      .eq("statut", "actif")

    // Calculate stats
    const totalPaid = payments?.reduce((sum, p) => sum + (p.montant || 0), 0) || 0
    const expectedRevenue = contracts?.reduce((sum, c) => sum + (c.loyer_mensuel || 0), 0) || 0
    const collectionRate = expectedRevenue > 0 ? Math.round((totalPaid / expectedRevenue) * 100) : 0

    // Group by payment mode
    const byMode = payments?.reduce(
      (acc, p) => {
        acc[p.mode] = (acc[p.mode] || 0) + (p.montant || 0)
        return acc
      },
      {} as Record<string, number>
    ) || {}

    return NextResponse.json(
      {
        month: monthStart.toISOString().split("T")[0],
        totalPaid,
        expectedRevenue,
        collectionRate,
        paymentCount: payments?.length || 0,
        activeContracts: contracts?.length || 0,
        byMode,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET /api/paiements/stats error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment statistics" },
      { status: 500 }
    )
  }
}
