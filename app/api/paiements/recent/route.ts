/**
 * Recent Payments Route
 * GET: Fetch recent payments for dashboard
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * GET /api/paiements/recent?proprietaire_id=xxx&limit=5
 * Fetch recent payments for dashboard
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
    const limit = parseInt(searchParams.get("limit") || "5")

    // Verify ownership
    if (proprietaireId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Invalid proprietaire_id" },
        { status: 403 }
      )
    }

    // Get recent payments
    const { data, error } = await supabase
      .from("paiements")
      .select(
        `
        id,
        montant,
        date_paiement,
        mode,
        contrat:contrat_id(
          locataire_id,
          logement_id,
          locataires(nom),
          logements(nom)
        )
      `
      )
      .eq("proprietaire_id", proprietaireId)
      .order("date_paiement", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Format response
    const formatted = data.map((p: any) => ({
      id: p.id,
      montant: p.montant,
      date_paiement: p.date_paiement,
      mode: p.mode,
      locataire_nom: p.contrat?.locataires?.[0]?.nom || "Unknown",
      logement_nom: p.contrat?.logements?.[0]?.nom || null,
    }))

    return NextResponse.json(formatted, { status: 200 })
  } catch (error) {
    console.error("GET /api/paiements/recent error:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent payments" },
      { status: 500 }
    )
  }
}
