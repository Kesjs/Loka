/**
 * AlertService
 * Business logic for alert management
 */

import { AlertRepository } from "@/lib/db/repositories/AlertRepository"
import { ContractRepository } from "@/lib/db/repositories/ContractRepository"
import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
import { sendAlertEmail, AlertEmailData } from "@/lib/services/EmailService"
import { createClient } from "@/lib/supabase/server"

export class AlertService {
  constructor(
    private alertRepo: AlertRepository,
    private contractRepo: ContractRepository,
    private paymentRepo: PaymentRepository
  ) {}

  /**
   * Generate daily alerts for a proprietor
   */
  async generateDailyAlerts(proprietaireId: string): Promise<void> {
    const supabase = await createClient()

    // Get proprietor info for emails
    const { data } = await supabase.auth.admin.getUserById(proprietaireId)
    const user = data?.user
    const proprietaireEmail = user?.email
    const proprietaireName = user?.user_metadata?.nom || "Propriétaire"

    // 1. Detect missing payments
    const missingPayments = await this.paymentRepo.getMissingForMonth(
      proprietaireId
    )

    for (const missing of missingPayments) {
      const severity = missing.jours_retard > 5 ? "high" : "medium"

      const alert = await this.alertRepo.create(
        {
          type: "missing_payment",
          severity,
          message: `Paiement manquant: ${missing.locataire_nom} - ${missing.loyer_attendu}`,
          entity_type: "contract",
          entity_id: missing.contrat_id,
        },
        proprietaireId
      )

      // Send email for critical alerts
      if (severity === "high" && proprietaireEmail) {
        try {
          await sendAlertEmail({
            proprietaireName,
            proprietaireEmail,
            alertType: "missing_payment",
            severity,
            message: `Paiement manquant de ${missing.locataire_nom}`,
            details: {
              tenantName: missing.locataire_nom,
              amount: missing.loyer_attendu,
              daysOverdue: missing.jours_retard,
            },
          })
        } catch (error) {
          console.error("Failed to send alert email:", error)
        }
      }
    }

    // 2. Detect expiring contracts (within 30 days)
    const expiringContracts = await this.contractRepo.getExpiringWithin(
      proprietaireId,
      30
    )

    for (const contract of expiringContracts) {
      const daysUntilExpiry = Math.ceil(
        (new Date(contract.date_fin!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )

      const severity = daysUntilExpiry <= 7 ? "high" : "medium"

      const alert = await this.alertRepo.create(
        {
          type: "expiring_contract",
          severity,
          message: `Contrat expire dans ${daysUntilExpiry} jours`,
          entity_type: "contract",
          entity_id: contract.id,
        },
        proprietaireId
      )

      // Send email for critical alerts
      if (severity === "high" && proprietaireEmail) {
        try {
          await sendAlertEmail({
            proprietaireName,
            proprietaireEmail,
            alertType: "expiring_contract",
            severity,
            message: `Votre contrat expire dans ${daysUntilExpiry} jours`,
            details: {
              daysUntilExpiry,
            },
          })
        } catch (error) {
          console.error("Failed to send alert email:", error)
        }
      }
    }

    // TODO: 3. Detect deposits to return
    // This would require checking terminated contracts and guarantee status
  }

  /**
   * Get unread alerts for dashboard
   */
  async getUnreadAlerts(proprietaireId: string) {
    return this.alertRepo.getUnread(proprietaireId)
  }

  /**
   * Get critical alert count
   */
  async getCriticalCount(proprietaireId: string): Promise<number> {
    return this.alertRepo.getCriticalCount(proprietaireId)
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId: string, proprietaireId: string): Promise<void> {
    await this.alertRepo.markAsRead(alertId, proprietaireId)
  }

  /**
   * Get all alerts
   */
  async getAllAlerts(proprietaireId: string) {
    return this.alertRepo.getAll(proprietaireId)
  }

  /**
   * Clean up expired alerts
   */
  async cleanupExpired(): Promise<void> {
    await this.alertRepo.deleteExpired()
  }
}
