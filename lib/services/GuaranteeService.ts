/**
 * GuaranteeService
 * Business logic for guarantee (dépôt de garantie) management
 */

import { GuaranteeRepository } from "@/lib/db/repositories/GuaranteeRepository"
import { ContractRepository } from "@/lib/db/repositories/ContractRepository"
import { ValidationError } from "@/lib/errors/ApplicationError"
import type { Guarantee } from "@/lib/db/repositories/GuaranteeRepository"

export interface GuaranteeDeduction {
  reason: string // "cleaning", "damage", "unpaid_rent", "other"
  amount: number
  date: string
}

export class GuaranteeService {
  constructor(
    private guaranteeRepo: GuaranteeRepository,
    private contractRepo: ContractRepository
  ) {}

  /**
   * Create guarantee when contract is created
   */
  async createGuarantee(
    contractId: string,
    amount: number,
    proprietaireId: string
  ): Promise<Guarantee> {
    if (amount <= 0) {
      throw new ValidationError("Le montant de la garantie doit être positif")
    }

    return this.guaranteeRepo.create(
      {
        contrat_id: contractId,
        amount,
        status: "held",
      },
      proprietaireId
    )
  }

  /**
   * Initialize guarantee return process
   */
  async initiateReturn(
    contractId: string,
    proprietaireId: string
  ): Promise<Guarantee> {
    const guarantee = await this.guaranteeRepo.getByContractId(
      contractId,
      proprietaireId
    )

    if (!guarantee) {
      throw new ValidationError("Garantie introuvable")
    }

    if (guarantee.status !== "held") {
      throw new ValidationError(
        "Cette garantie a déjà été traitée ou retournée"
      )
    }

    return this.guaranteeRepo.update(contractId, proprietaireId, {
      return_initiated_at: new Date().toISOString(),
    })
  }

  /**
   * Process guarantee return with deductions
   */
  async processReturn(
    contractId: string,
    deductions: GuaranteeDeduction[],
    notes: string | undefined,
    proprietaireId: string
  ): Promise<{
    guarantee: Guarantee
    originalAmount: number
    totalDeductions: number
    returnAmount: number
  }> {
    const guarantee = await this.guaranteeRepo.getByContractId(
      contractId,
      proprietaireId
    )

    if (!guarantee) {
      throw new ValidationError("Garantie introuvable")
    }

    // Validate deductions don't exceed amount
    const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
    if (totalDeductions > guarantee.amount) {
      throw new ValidationError(
        "Les déductions ne peuvent pas dépasser le montant de la garantie"
      )
    }

    // Update guarantee with deductions
    const status =
      totalDeductions > 0 && totalDeductions < guarantee.amount
        ? "partial_return"
        : "returned"

    const updated = await this.guaranteeRepo.update(
      contractId,
      proprietaireId,
      {
        status,
        return_initiated_at: new Date().toISOString(),
        returned_at: new Date().toISOString(),
        deductions: deductions.map((d) => ({
          ...d,
          date: d.date || new Date().toISOString(),
        })),
        notes,
      }
    )

    return {
      guarantee: updated,
      originalAmount: guarantee.amount,
      totalDeductions,
      returnAmount: guarantee.amount - totalDeductions,
    }
  }

  /**
   * Get guarantee details for a contract
   */
  async getGuaranteeForContract(
    contractId: string,
    proprietaireId: string
  ): Promise<Guarantee | null> {
    return this.guaranteeRepo.getByContractId(contractId, proprietaireId)
  }

  /**
   * Get all held guarantees
   */
  async getHeldGuarantees(proprietaireId: string): Promise<Guarantee[]> {
    return this.guaranteeRepo.getHeldGuarantees(proprietaireId)
  }

  /**
   * Get guarantees pending return
   */
  async getPendingReturns(proprietaireId: string): Promise<Guarantee[]> {
    return this.guaranteeRepo.getPendingReturns(proprietaireId)
  }

  /**
   * Calculate total held guarantees (cash at risk)
   */
  async calculateTotalHeld(proprietaireId: string): Promise<number> {
    const guarantees = await this.getHeldGuarantees(proprietaireId)
    return guarantees.reduce((sum, g) => sum + g.amount, 0)
  }

  /**
   * Get summary of guarantee status
   */
  async getGuaranteeSummary(proprietaireId: string): Promise<{
    totalHeld: number
    totalReturned: number
    totalDeductions: number
    pendingReturns: number
    averageAmount: number
  }> {
    const supabase = await import("@/lib/supabase/server").then(
      (m) => m.createClient
    )
    const client = await supabase()

    const { data: guarantees, error } = await client
      .from("garanties")
      .select("*")
      .eq("proprietaire_id", proprietaireId)

    if (error) {
      throw new Error(`Failed to fetch guarantees: ${error.message}`)
    }

    const held = guarantees
      .filter((g) => g.status === "held")
      .reduce((sum, g) => sum + g.amount, 0)

    const returned = guarantees
      .filter((g) => g.status === "returned")
      .reduce((sum, g) => sum + g.amount, 0)

    const pending = guarantees.filter((g) => g.status !== "returned").length

    const deductions = guarantees.reduce((sum: number, g) => {
      if (g.deductions && Array.isArray(g.deductions)) {
        return sum + g.deductions.reduce((dSum: number, d: any) => dSum + (d.amount || 0), 0)
      }
      return sum
    }, 0)

    const avg = guarantees.length > 0
      ? guarantees.reduce((sum, g) => sum + g.amount, 0) / guarantees.length
      : 0

    return {
      totalHeld: held,
      totalReturned: returned,
      totalDeductions: deductions,
      pendingReturns: pending,
      averageAmount: Math.round(avg),
    }
  }
}
