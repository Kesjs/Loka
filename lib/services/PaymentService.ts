/**
 * PaymentService
 * Business logic for payment operations
 * Encapsulates validation, duplicate detection, and orchestration
 */

import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
import {
  ValidationError,
  NotFoundError,
  DuplicatePaymentError,
} from "@/lib/errors/ApplicationError"
import { RecordPaymentDTO, PaymentSchema } from "@/lib/types/schema"
import type { Payment, MissingPayment } from "@/lib/db/repositories/PaymentRepository"

export class PaymentService {
  constructor(private paymentRepo: PaymentRepository) {}

  /**
   * Record a new payment with validation and duplicate detection
   */
  async recordPayment(
    dto: unknown,
    userId: string
  ): Promise<Payment> {
    // Validate input
    const validated = RecordPaymentDTO.parse(dto)

    // Check for duplicate payment
    const existing = await this.paymentRepo.findDuplicatePayment(
      validated.contrat_id,
      validated.periode_debut.toISOString()
    )

    if (existing) {
      throw new DuplicatePaymentError()
    }

    // Create payment
    const payment = await this.paymentRepo.create(validated, userId)

    // TODO: Generate receipt PDF
    // TODO: Send email notification to tenant

    return payment
  }

  /**
   * Get missing payments for current month
   */
  async getMissingPayments(userId: string): Promise<MissingPayment[]> {
    return this.paymentRepo.getMissingForMonth(userId)
  }

  /**
   * Get recent payments
   */
  async getRecentPayments(userId: string, limit = 5): Promise<Payment[]> {
    return this.paymentRepo.getRecent(userId, limit)
  }

  /**
   * Get paginated payments
   */
  async getPaymentsPaginated(
    userId: string,
    page: number,
    pageSize: number = 20
  ): Promise<{ data: Payment[]; total: number; pages: number }> {
    const result = await this.paymentRepo.getPaginated(userId, page, pageSize)
    return {
      ...result,
      pages: Math.ceil(result.total / pageSize),
    }
  }

  /**
   * Calculate total revenue for period
   */
  async getTotalRevenueForPeriod(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    // TODO: Implement
    return 0
  }
}
