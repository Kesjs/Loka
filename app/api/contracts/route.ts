/**
 * POST /api/contracts
 * Create a new contract
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContractService } from "@/lib/services/ContractService"
import { GuaranteeService } from "@/lib/services/GuaranteeService"
import { ContractRepository } from "@/lib/db/repositories/ContractRepository"
import { PropertyRepository } from "@/lib/db/repositories/PropertyRepository"
import { GuaranteeRepository } from "@/lib/db/repositories/GuaranteeRepository"
import { AlertRepository } from "@/lib/db/repositories/AlertRepository"
import { sendContractEmail } from "@/lib/services/EmailService"

export async function POST(request: NextRequest) {
  try {
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

    // Create contract
    const contract = await contractService.createContract(body, user.id)

    // Create guarantee if amount > 0
    if (body.depot_garantie && body.depot_garantie > 0) {
      await guaranteeService.createGuarantee(
        contract.id,
        body.depot_garantie,
        user.id
      )
    }

    // Send contract creation email
    try {
      const { data } = await supabase.auth.admin.getUserById(user.id)
      const userObj = data?.user
      const proprietaireName = userObj?.user_metadata?.nom || "Propriétaire"
      
      const { data: tenantData } = await supabase
        .from("locataires")
        .select("nom")
        .eq("id", body.locataire_id)
        .single()
      
      const { data: propertyData } = await supabase
        .from("logements")
        .select("nom")
        .eq("id", body.logement_id)
        .single()

      if (tenantData && propertyData) {
        await sendContractEmail({
          proprietaireName,
          proprietaireEmail: user.email || "",
          tenantName: tenantData.nom,
          propertyName: propertyData.nom,
          eventType: "created",
          contractDetails: {
            rentAmount: body.loyer_mensuel,
            guaranteeAmount: body.depot_garantie,
            startDate: body.date_debut,
            endDate: body.date_fin,
          },
        })
      }
    } catch (error) {
      console.error("Error sending contract email:", error)
    }

    // Send welcome email to tenant (future enhancement)
    // TODO: Get tenant email and send notification

    return NextResponse.json(
      {
        success: true,
        contract,
        message: "Contrat créé avec succès",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating contract:", error)
    const message =
      error instanceof Error ? error.message : "Erreur lors de la création du contrat"

    return NextResponse.json(
      { error: message },
      { status: 400 }
    )
  }
}
