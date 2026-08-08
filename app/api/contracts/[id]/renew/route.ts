/**
 * PUT /api/contracts/[id]/renew
 * Renew an existing contract
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContractService } from "@/lib/services/ContractService"
import { GuaranteeService } from "@/lib/services/GuaranteeService"
import { ContractRepository } from "@/lib/db/repositories/ContractRepository"
import { PropertyRepository } from "@/lib/db/repositories/PropertyRepository"
import { GuaranteeRepository } from "@/lib/db/repositories/GuaranteeRepository"
import { AlertRepository } from "@/lib/db/repositories/AlertRepository"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Initialize services
    const contractRepo = new ContractRepository()
    const propertyRepo = new PropertyRepository()
    const alertRepo = new AlertRepository()
    const guaranteeRepo = new GuaranteeRepository()

    const contractService = new ContractService(contractRepo, propertyRepo, alertRepo)
    const guaranteeService = new GuaranteeService(guaranteeRepo, contractRepo)

    // Renew contract
    const newContract = await contractService.renewContract(id, body, user.id)

    // Create guarantee for new contract if amount > 0
    if (body.depot_garantie && body.depot_garantie > 0) {
      await guaranteeService.createGuarantee(
        newContract.id,
        body.depot_garantie,
        user.id
      )
    }

    // TODO: Send renewal confirmation email to tenant

    return NextResponse.json(
      {
        success: true,
        contract: newContract,
        message: "Contrat renouvelé avec succès",
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error renewing contract:", error)
    const message =
      error instanceof Error ? error.message : "Erreur lors du renouvellement du contrat"

    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
