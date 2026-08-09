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
import { generateReceipt, generateReceiptBlob, ReceiptData } from "./ReceiptService"
import { createClient } from "@/lib/supabase/server"

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

    // Generate receipt PDF and store URL
    try {
      const supabase = await createClient()
      
      // Récupérer les données nécessaires pour la quittance
      const { data: contrat } = await supabase
        .from("contrats")
        .select("locataire_id, logement_id")
        .eq("id", validated.contrat_id)
        .maybeSingle()

      if (contrat) {
        const { data: locataire } = await supabase
          .from("locataires")
          .select("nom")
          .eq("id", contrat.locataire_id)
          .maybeSingle()

        const { data: logement } = await supabase
          .from("logements")
          .select("nom")
          .eq("id", contrat.logement_id)
          .maybeSingle()

        const { data: proprietaire } = await supabase
          .from("proprietaire")
          .select("nom, devise")
          .eq("id", userId)
          .maybeSingle()

        if (proprietaire && locataire && logement) {
          // Générer la quittance
          const receiptData: ReceiptData = {
            paiementId: payment.id,
            proprietaireName: proprietaire.nom,
            locataireName: locataire.nom,
            logementName: logement.nom,
            montant: Number(payment.montant),
            devise: proprietaire.devise || "FCFA",
            datePaiement: payment.date_paiement,
            periodeDebut: payment.periode_debut,
            periodeFin: payment.periode_fin,
            mode: payment.mode,
            reference: `QUI-${payment.id.substring(0, 8).toUpperCase()}`,
          }

          // Générer le Blob PDF
          const receiptBlob = generateReceiptBlob(receiptData)
          
          // Uploader vers Supabase Storage
          const fileName = `quittances/${payment.id}.pdf`
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from("paiements")
            .upload(fileName, receiptBlob, {
              contentType: "application/pdf",
              upsert: false,
            })

          if (!uploadError && uploadData) {
            // Récupérer l'URL publique
            const { data: { publicUrl } } = supabase.storage
              .from("paiements")
              .getPublicUrl(fileName)

            // Mettre à jour le paiement avec l'URL
            await this.paymentRepo.updateReceipt(payment.id, publicUrl)

            // TODO: Envoyer email de confirmation au locataire
            // await sendPaymentConfirmationEmail(...)
          }
        }
      }
    } catch (error) {
      console.error("Erreur génération/stockage quittance:", error)
      // Ne pas bloquer le paiement si la génération échoue
    }

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
