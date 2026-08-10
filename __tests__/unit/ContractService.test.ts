import { ContractService } from "@/lib/services/ContractService"
import {
  OverlappingContractError,
  ValidationError,
} from "@/lib/errors/ApplicationError"

const UNIT_ID = "11111111-1111-4111-8111-111111111111"
const TENANT_ID = "22222222-2222-4222-8222-222222222222"
const USER_ID = "user-1"

const buildContractRepo = () => ({
  findOverlapping: jest.fn().mockResolvedValue([]),
  create: jest.fn().mockImplementation((data) => ({ id: "contract-1", ...data })),
  getById: jest.fn(),
  updateStatus: jest.fn().mockResolvedValue(undefined),
  getExpiringWithin: jest.fn().mockResolvedValue([]),
  getActive: jest.fn().mockResolvedValue([]),
})

const buildPropertyRepo = () => ({
  updateUnitStatus: jest.fn().mockResolvedValue(undefined),
})

const buildAlertRepo = () => ({
  create: jest.fn().mockResolvedValue(undefined),
})

const validCreateDto = {
  locataire_id: TENANT_ID,
  logement_id: UNIT_ID,
  loyer_mensuel: 150000,
  depot_garantie: 300000,
  date_debut: "2024-01-01",
  date_fin: "2024-12-31",
}

describe("ContractService", () => {
  let contractRepo: ReturnType<typeof buildContractRepo>
  let propertyRepo: ReturnType<typeof buildPropertyRepo>
  let alertRepo: ReturnType<typeof buildAlertRepo>
  let service: ContractService

  beforeEach(() => {
    contractRepo = buildContractRepo()
    propertyRepo = buildPropertyRepo()
    alertRepo = buildAlertRepo()
    service = new ContractService(
      contractRepo as any,
      propertyRepo as any,
      alertRepo as any
    )
  })

  describe("canTransition", () => {
    it.each([
      ["actif", "termine", true],
      ["actif", "resilie", true],
      ["termine", "actif", true],
      ["termine", "resilie", false],
      ["resilie", "actif", false],
      ["actif", "actif", false],
    ])("%s -> %s is %s", (from, to, expected) => {
      expect(service.canTransition(from as any, to as any)).toBe(expected)
    })

    it("returns false for an unknown status", () => {
      expect(service.canTransition("inconnu" as any, "actif")).toBe(false)
    })
  })

  describe("createContract", () => {
    it("creates the contract and marks the unit occupied", async () => {
      const contract = await service.createContract(validCreateDto, USER_ID)

      expect(contractRepo.findOverlapping).toHaveBeenCalledWith(
        UNIT_ID,
        new Date("2024-01-01").toISOString(),
        new Date("2024-12-31").toISOString()
      )
      expect(contractRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          locataire_id: TENANT_ID,
          logement_id: UNIT_ID,
          loyer_mensuel: 150000,
          statut: "actif",
        }),
        USER_ID
      )
      expect(propertyRepo.updateUnitStatus).toHaveBeenCalledWith(
        UNIT_ID,
        "occupe"
      )
      expect(contract).toMatchObject({ id: "contract-1", statut: "actif" })
    })

    it("supports an open-ended contract without end date", async () => {
      const { date_fin: _unused, ...dto } = validCreateDto

      await service.createContract(dto, USER_ID)

      expect(contractRepo.findOverlapping).toHaveBeenCalledWith(
        UNIT_ID,
        new Date("2024-01-01").toISOString(),
        undefined
      )
    })

    it("rejects an overlapping contract before writing anything", async () => {
      contractRepo.findOverlapping.mockResolvedValue([{ id: "existing" }])

      await expect(
        service.createContract(validCreateDto, USER_ID)
      ).rejects.toBeInstanceOf(OverlappingContractError)
      expect(contractRepo.create).not.toHaveBeenCalled()
      expect(propertyRepo.updateUnitStatus).not.toHaveBeenCalled()
    })

    it("rejects an invalid payload", async () => {
      await expect(
        service.createContract({ ...validCreateDto, loyer_mensuel: -1 }, USER_ID)
      ).rejects.toThrow()
      expect(contractRepo.findOverlapping).not.toHaveBeenCalled()
    })

    it("rejects an end date before the start date", async () => {
      await expect(
        service.createContract(
          { ...validCreateDto, date_fin: "2023-01-01" },
          USER_ID
        )
      ).rejects.toThrow()
    })
  })

  describe("renewContract", () => {
    const renewal = {
      loyer_mensuel: 160000,
      depot_garantie: 320000,
      date_debut: "2025-01-01",
      date_fin: "2025-12-31",
    }

    it("creates a new contract and terminates the old one", async () => {
      contractRepo.getById.mockResolvedValue({
        id: "contract-1",
        locataire_id: TENANT_ID,
        logement_id: UNIT_ID,
        statut: "actif",
        depot_garantie: 300000,
      })

      const renewed = await service.renewContract("contract-1", renewal, USER_ID)

      expect(contractRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          locataire_id: TENANT_ID,
          logement_id: UNIT_ID,
          loyer_mensuel: 160000,
          statut: "actif",
        }),
        USER_ID
      )
      expect(contractRepo.updateStatus).toHaveBeenCalledWith(
        "contract-1",
        "termine"
      )
      expect(renewed).toMatchObject({ loyer_mensuel: 160000 })
    })

    it("throws when the contract does not exist", async () => {
      contractRepo.getById.mockResolvedValue(null)

      await expect(
        service.renewContract("missing", renewal, USER_ID)
      ).rejects.toThrow(ValidationError)
      expect(contractRepo.create).not.toHaveBeenCalled()
    })

    it("refuses to renew a terminated (resilie) contract", async () => {
      contractRepo.getById.mockResolvedValue({
        id: "contract-1",
        locataire_id: TENANT_ID,
        logement_id: UNIT_ID,
        statut: "resilie",
      })

      await expect(
        service.renewContract("contract-1", renewal, USER_ID)
      ).rejects.toThrow("Contrat ne peut pas être renouvelé")
      expect(contractRepo.updateStatus).not.toHaveBeenCalled()
    })
  })

  describe("terminateContract", () => {
    const activeContract = {
      id: "contract-1",
      locataire_id: TENANT_ID,
      logement_id: UNIT_ID,
      statut: "actif",
      depot_garantie: 300000,
    }

    it("terminates, frees the unit and raises a deposit alert", async () => {
      contractRepo.getById.mockResolvedValue(activeContract)

      await service.terminateContract("contract-1", {}, USER_ID)

      expect(contractRepo.updateStatus).toHaveBeenCalledWith(
        "contract-1",
        "termine"
      )
      expect(propertyRepo.updateUnitStatus).toHaveBeenCalledWith(
        UNIT_ID,
        "vacant"
      )
      expect(alertRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "deposit_to_return",
          severity: "high",
          entity_type: "contract",
          entity_id: "contract-1",
        }),
        USER_ID
      )
    })

    it("does not raise an alert when there is no deposit", async () => {
      contractRepo.getById.mockResolvedValue({
        ...activeContract,
        depot_garantie: 0,
      })

      await service.terminateContract("contract-1", {}, USER_ID)

      expect(alertRepo.create).not.toHaveBeenCalled()
    })

    it("throws when the contract does not exist", async () => {
      contractRepo.getById.mockResolvedValue(null)

      await expect(
        service.terminateContract("missing", {}, USER_ID)
      ).rejects.toThrow(ValidationError)
      expect(contractRepo.updateStatus).not.toHaveBeenCalled()
    })

    it("rejects invalid termination data", async () => {
      await expect(
        service.terminateContract("contract-1", { deductions: -5 }, USER_ID)
      ).rejects.toThrow()
      expect(contractRepo.getById).not.toHaveBeenCalled()
    })
  })

  describe("queries", () => {
    it("getExpiringContracts defaults to 30 days", async () => {
      await service.getExpiringContracts(USER_ID)
      expect(contractRepo.getExpiringWithin).toHaveBeenCalledWith(USER_ID, 30)
    })

    it("getExpiringContracts forwards a custom window", async () => {
      await service.getExpiringContracts(USER_ID, 7)
      expect(contractRepo.getExpiringWithin).toHaveBeenCalledWith(USER_ID, 7)
    })

    it("getActiveContracts delegates to the repository", async () => {
      contractRepo.getActive.mockResolvedValue([{ id: "contract-1" }])
      await expect(service.getActiveContracts(USER_ID)).resolves.toEqual([
        { id: "contract-1" },
      ])
    })
  })
})
