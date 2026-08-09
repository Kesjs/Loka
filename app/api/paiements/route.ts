/**
 * Payments API Routes
 * GET: Fetch paginated payments
 * POST: Record new payment
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getOrganisationScope } from "@/lib/organisation-scope"
import { PaymentService } from "@/lib/services/PaymentService"
import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
import { RecordPaymentDTO } from "@/lib/types/schema"
import { ValidationError, DatabaseError } from "@/lib/errors/ApplicationError"

/**
 * GET /api/paiements?proprietaire_id=xxx&page=1&pageSize=20
 * Fetch paginated payments for a proprietor
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
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")

    // Récupérer le scope de l'organisation
    const orgScope = await getOrganisationScope(supabase);

    // Create repository and fetch (filtré par organisation)
    const paymentRepo = new PaymentRepository()
    
    // Adapter selon le type d'organisation
    let data, total;
    if (orgScope.organisationId) {
      // Utilisateur gestionnaire/agence
      ({ data, total } = await paymentRepo.getPaginatedByOrganisation(
        orgScope.organisationId,
        page,
        pageSize
      ));
    } else {
      // Utilisateur individuel — utiliser proprietaire_id
      ({ data, total } = await paymentRepo.getPaginated(
        orgScope.proprietaireIds[0],
        page,
        pageSize
      ));
    }

    return NextResponse.json(
      {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET /api/paiements error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/paiements
 * Record a new payment
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()

    // Validate with schema
    const validated = RecordPaymentDTO.parse(body)

    // Create service and record payment
    const paymentRepo = new PaymentRepository()
    const paymentService = new PaymentService(paymentRepo)

    const payment = await paymentService.recordPayment(validated, user.id)

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error("POST /api/paiements error:", error)

    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    )
  }
}
