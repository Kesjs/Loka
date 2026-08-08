/**
 * PUT /api/contracts/[id]/terminate
 * Terminate a contract and process guarantee return
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
    const { deductions = [], notes = "" } = body

    // Initialize services
    const contractRepo = new ContractRepository()
    const propertyRepo = new PropertyRepository()
    const alertRepo = new AlertRepository()
    const guaranteeRepo = new GuaranteeRepository()

    const contractService = new ContractService(contractRepo, propertyRepo, alertRepo)
    const guaranteeService = new GuaranteeService(guaranteeRepo, contractRepo)

    // Terminate contract
    await contractService.terminateContract(id, body, user.id)

    // Process guarantee return
    let guaranteeResult = null
    try {
      guaranteeResult = await guaranteeService.processReturn(
        id,
        deductions,
        notes,
        user.id
      )
    } catch (error) {
      // Continue even if guarantee processing fails
      console.error("Error processing guarantee:", error)
    }

    // TODO: Send termination and guarantee return email to tenant

    return NextResponse.json(
      {
        success: true,
        message: "Contrat résilié avec succès",
        guarantee: guaranteeResult,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error terminating contract:", error)
    const message =
      error instanceof Error ? error.message : "Erreur lors de la résiliation du contrat"

    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
