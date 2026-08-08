/**
 * ContractService
 * Business logic for contract operations
 */

import { ContractRepository } from "@/lib/db/repositories/ContractRepository"
import { PropertyRepository } from "@/lib/db/repositories/PropertyRepository"
import { AlertRepository } from "@/lib/db/repositories/AlertRepository"
import {
  ValidationError,
  OverlappingContractError,
} from "@/lib/errors/ApplicationError"
import { CreateContratSchema, RenewContratSchema, TerminateContratSchema } from "@/lib/types/schema"
import type { Contract } from "@/lib/db/repositories/ContractRepository"

export type ContractStatus = "actif" | "termine" | "resilie"

const CONTRACT_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  actif: ["termine", "resilie"],
  termine: ["actif"], // Can renew
  resilie: [], // Terminal
}

export class ContractService {
  constructor(
    private contractRepo: ContractRepository,
    private propertyRepo: PropertyRepository,
    private alertRepo: AlertRepository
  ) {}

  canTransition(from: ContractStatus, to: ContractStatus): boolean {
    return CONTRACT_TRANSITIONS[from]?.includes(to) ?? false
  }

  async createContract(
    dto: unknown,
    userId: string
  ): Promise<Contract> {
    // Validate
    const validated = CreateContratSchema.parse(dto)

    // Check for overlapping contracts
    const overlapping = await this.contractRepo.findOverlapping(
      validated.logement_id,
      validated.date_debut.toISOString(),
      validated.date_fin?.toISOString()
    )

    if (overlapping.length > 0) {
      throw new OverlappingContractError(
        validated.locataire_id,
        validated.logement_id
      )
    }

    // Create contract
    const contract = await this.contractRepo.create(
      {
        locataire_id: validated.locataire_id,
        logement_id: validated.logement_id,
        loyer_mensuel: validated.loyer_mensuel,
        depot_garantie: validated.depot_garantie,
        date_debut: validated.date_debut.toISOString(),
        date_fin: validated.date_fin?.toISOString(),
        statut: "actif",
      },
      userId
    )

    // Update logement status to occupied
    await this.propertyRepo.updateUnitStatus(validated.logement_id, "occupe")

    // TODO: Create guarantee record
    // TODO: Send email to tenant

    return contract
  }

  async renewContract(
    contractId: string,
    renewalData: unknown,
    userId: string
  ): Promise<Contract> {
    // Validate renewal data
    const validated = RenewContratSchema.parse(renewalData)

    // Get old contract
    const oldContract = await this.contractRepo.getById(contractId, userId)
    if (!oldContract) {
      throw new ValidationError("Contrat introuvable")
    }

    // Check if can transition to pending_renewal
    if (!this.canTransition(oldContract.statut as ContractStatus, "termine")) {
      throw new ValidationError("Contrat ne peut pas être renouvelé")
    }

    // Create new contract
    const newContract = await this.contractRepo.create(
      {
        locataire_id: oldContract.locataire_id,
        logement_id: oldContract.logement_id,
        loyer_mensuel: validated.loyer_mensuel,
        depot_garantie: validated.depot_garantie,
        date_debut: validated.date_debut.toISOString(),
        date_fin: validated.date_fin.toISOString(),
        statut: "actif",
      },
      userId
    )

    // Mark old contract as terminated
    await this.contractRepo.updateStatus(contractId, "termine")

    // TODO: Create guarantee for new contract
    // TODO: Send email to tenant

    return newContract
  }

  async terminateContract(
    contractId: string,
    terminationData: unknown,
    userId: string
  ): Promise<void> {
    // Validate
    const validated = TerminateContratSchema.parse(terminationData)

    // Get contract
    const contract = await this.contractRepo.getById(contractId, userId)
    if (!contract) {
      throw new ValidationError("Contrat introuvable")
    }

    // Mark as terminated
    await this.contractRepo.updateStatus(contractId, "termine")

    // Update logement to vacant
    await this.propertyRepo.updateUnitStatus(contract.logement_id, "vacant")

    // TODO: Handle guarantee return
    // TODO: Send email to tenant

    // Create alert for guarantee return
    if (contract.depot_garantie > 0) {
      await this.alertRepo.create(
        {
          type: "deposit_to_return",
          severity: "high",
          message: `Garantie à restituer: ${contract.depot_garantie}`,
          entity_type: "contract",
          entity_id: contractId,
        },
        userId
      )
    }
  }

  async getExpiringContracts(userId: string, days: number = 30): Promise<Contract[]> {
    return this.contractRepo.getExpiringWithin(userId, days)
  }

  async getActiveContracts(userId: string): Promise<Contract[]> {
    return this.contractRepo.getActive(userId)
  }
}
