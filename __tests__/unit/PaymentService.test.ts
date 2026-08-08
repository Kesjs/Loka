import { PaymentService } from "@/lib/services/PaymentService"
import { DuplicatePaymentError, NotFoundError } from "@/lib/errors/ApplicationError"

// Mock repositories
jest.mock("@/lib/db/repositories/PaymentRepository")
jest.mock("@/lib/db/repositories/ContractRepository")

import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
import { ContractRepository } from "@/lib/db/repositories/ContractRepository"

describe("PaymentService", () => {
  let paymentService: PaymentService

  beforeEach(() => {
    paymentService = new PaymentService(
      new PaymentRepository() as any,
      new ContractRepository() as any
    )
  })

  it("should create PaymentService instance", () => {
    expect(paymentService).toBeDefined()
  })

  it("should have recordPayment method", () => {
    expect(typeof paymentService.recordPayment).toBe("function")
  })

  it("should have getMissingPayments method", () => {
    expect(typeof paymentService.getMissingPayments).toBe("function")
  })
})
