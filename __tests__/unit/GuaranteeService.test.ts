import { GuaranteeService } from "@/lib/services/GuaranteeService"
import { ValidationError } from "@/lib/errors/ApplicationError"

const createClientMock = jest.fn()
jest.mock("@/lib/supabase/server", () => ({
  createClient: (...args: unknown[]) => createClientMock(...args),
}))

const OWNER_ID = "owner-1"
const CONTRACT_ID = "contract-1"

const buildGuaranteeRepo = () => ({
  create: jest.fn().mockImplementation((data) => ({ id: "g-1", ...data })),
  getByContractId: jest.fn(),
  update: jest.fn().mockImplementation((_c, _p, patch) => ({ id: "g-1", ...patch })),
  getHeldGuarantees: jest.fn().mockResolvedValue([]),
  getPendingReturns: jest.fn().mockResolvedValue([]),
})

const heldGuarantee = {
  id: "g-1",
  contrat_id: CONTRACT_ID,
  amount: 300000,
  status: "held" as const,
}

describe("GuaranteeService", () => {
  let guaranteeRepo: ReturnType<typeof buildGuaranteeRepo>
  let service: GuaranteeService

  beforeEach(() => {
    jest.clearAllMocks()
    guaranteeRepo = buildGuaranteeRepo()
    service = new GuaranteeService(guaranteeRepo as any, {} as any)
  })

  describe("createGuarantee", () => {
    it("creates a held guarantee", async () => {
      const guarantee = await service.createGuarantee(
        CONTRACT_ID,
        300000,
        OWNER_ID
      )

      expect(guaranteeRepo.create).toHaveBeenCalledWith(
        { contrat_id: CONTRACT_ID, amount: 300000, status: "held" },
        OWNER_ID
      )
      expect(guarantee).toMatchObject({ status: "held" })
    })

    it.each([0, -1])("rejects a non-positive amount (%s)", async (amount) => {
      await expect(
        service.createGuarantee(CONTRACT_ID, amount, OWNER_ID)
      ).rejects.toThrow(ValidationError)
      expect(guaranteeRepo.create).not.toHaveBeenCalled()
    })
  })

  describe("initiateReturn", () => {
    it("stamps return_initiated_at", async () => {
      guaranteeRepo.getByContractId.mockResolvedValue(heldGuarantee)

      const result = await service.initiateReturn(CONTRACT_ID, OWNER_ID)

      expect(guaranteeRepo.update).toHaveBeenCalledWith(
        CONTRACT_ID,
        OWNER_ID,
        expect.objectContaining({
          return_initiated_at: expect.any(String),
        })
      )
      expect(result.return_initiated_at).toBeDefined()
    })

    it("throws when the guarantee is missing", async () => {
      guaranteeRepo.getByContractId.mockResolvedValue(null)

      await expect(
        service.initiateReturn(CONTRACT_ID, OWNER_ID)
      ).rejects.toThrow("Garantie introuvable")
    })

    it("throws when the guarantee is already processed", async () => {
      guaranteeRepo.getByContractId.mockResolvedValue({
        ...heldGuarantee,
        status: "returned",
      })

      await expect(
        service.initiateReturn(CONTRACT_ID, OWNER_ID)
      ).rejects.toThrow("Cette garantie a déjà été traitée ou retournée")
      expect(guaranteeRepo.update).not.toHaveBeenCalled()
    })
  })

  describe("processReturn", () => {
    beforeEach(() => {
      guaranteeRepo.getByContractId.mockResolvedValue(heldGuarantee)
    })

    it("returns the full amount when there is no deduction", async () => {
      const result = await service.processReturn(
        CONTRACT_ID,
        [],
        undefined,
        OWNER_ID
      )

      expect(result).toMatchObject({
        originalAmount: 300000,
        totalDeductions: 0,
        returnAmount: 300000,
      })
      expect(guaranteeRepo.update).toHaveBeenCalledWith(
        CONTRACT_ID,
        OWNER_ID,
        expect.objectContaining({ status: "returned" })
      )
    })

    it("marks a partial return when deductions are below the amount", async () => {
      const result = await service.processReturn(
        CONTRACT_ID,
        [
          { reason: "cleaning", amount: 50000, date: "2024-05-01" },
          { reason: "damage", amount: 25000, date: "2024-05-02" },
        ],
        "État des lieux",
        OWNER_ID
      )

      expect(result).toMatchObject({
        totalDeductions: 75000,
        returnAmount: 225000,
      })
      expect(guaranteeRepo.update).toHaveBeenCalledWith(
        CONTRACT_ID,
        OWNER_ID,
        expect.objectContaining({
          status: "partial_return",
          notes: "État des lieux",
        })
      )
    })

    it("marks a full deduction as returned with a zero balance", async () => {
      const result = await service.processReturn(
        CONTRACT_ID,
        [{ reason: "unpaid_rent", amount: 300000, date: "2024-05-01" }],
        undefined,
        OWNER_ID
      )

      expect(result.returnAmount).toBe(0)
      expect(guaranteeRepo.update).toHaveBeenCalledWith(
        CONTRACT_ID,
        OWNER_ID,
        expect.objectContaining({ status: "returned" })
      )
    })

    it("defaults a missing deduction date to now", async () => {
      await service.processReturn(
        CONTRACT_ID,
        [{ reason: "other", amount: 1000, date: "" }],
        undefined,
        OWNER_ID
      )

      const patch = guaranteeRepo.update.mock.calls[0][2]
      expect(patch.deductions[0].date).toEqual(expect.any(String))
      expect(patch.deductions[0].date).not.toBe("")
    })

    it("rejects deductions above the guarantee amount", async () => {
      await expect(
        service.processReturn(
          CONTRACT_ID,
          [{ reason: "damage", amount: 300001, date: "2024-05-01" }],
          undefined,
          OWNER_ID
        )
      ).rejects.toThrow(
        "Les déductions ne peuvent pas dépasser le montant de la garantie"
      )
      expect(guaranteeRepo.update).not.toHaveBeenCalled()
    })

    it("throws when the guarantee is missing", async () => {
      guaranteeRepo.getByContractId.mockResolvedValue(null)

      await expect(
        service.processReturn(CONTRACT_ID, [], undefined, OWNER_ID)
      ).rejects.toThrow("Garantie introuvable")
    })
  })

  describe("aggregations", () => {
    it("calculateTotalHeld sums held guarantees", async () => {
      guaranteeRepo.getHeldGuarantees.mockResolvedValue([
        { amount: 100000 },
        { amount: 250000 },
      ])

      await expect(service.calculateTotalHeld(OWNER_ID)).resolves.toBe(350000)
    })

    it("calculateTotalHeld returns 0 without guarantees", async () => {
      await expect(service.calculateTotalHeld(OWNER_ID)).resolves.toBe(0)
    })

    it("delegates simple lookups to the repository", async () => {
      guaranteeRepo.getByContractId.mockResolvedValue(heldGuarantee)
      guaranteeRepo.getPendingReturns.mockResolvedValue([heldGuarantee])

      await expect(
        service.getGuaranteeForContract(CONTRACT_ID, OWNER_ID)
      ).resolves.toBe(heldGuarantee)
      await expect(service.getPendingReturns(OWNER_ID)).resolves.toEqual([
        heldGuarantee,
      ])
    })
  })

  describe("getGuaranteeSummary", () => {
    const mockQuery = (result: { data?: unknown; error?: unknown }) => {
      const eq = jest.fn().mockResolvedValue(result)
      const select = jest.fn(() => ({ eq }))
      const from = jest.fn(() => ({ select }))
      createClientMock.mockResolvedValue({ from })
      return { from, select, eq }
    }

    it("aggregates held, returned, deductions and average", async () => {
      const { from, eq } = mockQuery({
        data: [
          { status: "held", amount: 100000, deductions: null },
          { status: "held", amount: 200000, deductions: [] },
          {
            status: "returned",
            amount: 300000,
            deductions: [{ amount: 50000 }, { amount: 25000 }],
          },
          { status: "partial_return", amount: 150000, deductions: [{}] },
        ],
        error: null,
      })

      const summary = await service.getGuaranteeSummary(OWNER_ID)

      expect(from).toHaveBeenCalledWith("garanties")
      expect(eq).toHaveBeenCalledWith("proprietaire_id", OWNER_ID)
      expect(summary).toEqual({
        totalHeld: 300000,
        totalReturned: 300000,
        totalDeductions: 75000,
        pendingReturns: 3,
        averageAmount: 187500,
      })
    })

    it("returns zeros when there is no guarantee", async () => {
      mockQuery({ data: [], error: null })

      await expect(service.getGuaranteeSummary(OWNER_ID)).resolves.toEqual({
        totalHeld: 0,
        totalReturned: 0,
        totalDeductions: 0,
        pendingReturns: 0,
        averageAmount: 0,
      })
    })

    it("throws when the query fails", async () => {
      mockQuery({ data: null, error: { message: "connection lost" } })

      await expect(service.getGuaranteeSummary(OWNER_ID)).rejects.toThrow(
        "Failed to fetch guarantees: connection lost"
      )
    })
  })
})
