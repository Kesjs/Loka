/**
 * PaymentRepository
 * Data access layer for payment operations
 */

import { createClient } from "@/lib/supabase/server"
import { DatabaseError } from "@/lib/errors/ApplicationError"
import type { RecordPaymentDTO } from "@/lib/types/schema"

export interface Payment {
  id: string
  contrat_id: string
  montant: number
  date_paiement: string
  periode_debut: string
  periode_fin: string
  mode: "cash" | "mobile_money" | "virement" | "cheque"
  quittance_url?: string
  notes?: string
  created_at: string
}

export interface MissingPayment {
  contrat_id: string
  locataire_nom: string
  loyer_attendu: number
  jours_retard: number
}

export class PaymentRepository {
  async create(data: RecordPaymentDTO, userId: string): Promise<Payment> {
    const supabase = await createClient()

    const { data: payment, error } = await supabase
      .from("paiements")
      .insert([
        {
          ...data,
          proprietaire_id: userId,
        },
      ])
      .select()
      .single()

    if (error) throw new DatabaseError(error.message)
    return payment as Payment
  }

  async findDuplicatePayment(
    contratId: string,
    periodeDebut: string
  ): Promise<Payment | null> {
    const supabase = await createClient()

    // Extract month from period_debut
    const month = new Date(periodeDebut)
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)

    const { data, error } = await supabase
      .from("paiements")
      .select("*")
      .eq("contrat_id", contratId)
      .gte("periode_debut", monthStart.toISOString())
      .lte("periode_fin", monthEnd.toISOString())
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found (expected)
      throw new DatabaseError(error.message)
    }

    return (data as Payment) || null
  }

  async getByContractId(
    contratId: string,
    limit = 10
  ): Promise<Payment[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("paiements")
      .select("*")
      .eq("contrat_id", contratId)
      .order("date_paiement", { ascending: false })
      .limit(limit)

    if (error) throw new DatabaseError(error.message)
    return (data as Payment[]) || []
  }

  async getRecent(userId: string, limit = 5): Promise<Payment[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("paiements")
      .select(`
        *,
        contrat:contrats(
          locataire_id,
          logement_id
        ),
        locataire:contrats!inner(
          locataires(nom)
        ),
        logement:contrats!inner(
          logements(nom)
        )
      `)
      .eq("proprietaire_id", userId)
      .order("date_paiement", { ascending: false })
      .limit(limit)

    if (error) throw new DatabaseError(error.message)
    return (data as any[]) || []
  }

  async getMissingForMonth(userId: string, month?: Date): Promise<MissingPayment[]> {
    const supabase = await createClient()
    const now = month || new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get all active contracts
    const { data: contracts, error: contractError } = await supabase
      .from("contrats")
      .select(`
        id,
        loyer_mensuel,
        locataires(nom),
        statut
      `)
      .eq("proprietaire_id", userId)
      .eq("statut", "actif")

    if (contractError) throw new DatabaseError(contractError.message)

    const missing: MissingPayment[] = []

    // Check each contract for payment
    for (const contract of contracts || []) {
      const { data: payment } = await supabase
        .from("paiements")
        .select("id")
        .eq("contrat_id", contract.id)
        .gte("periode_debut", monthStart.toISOString())
        .lte("periode_fin", monthEnd.toISOString())
        .single()

      if (!payment) {
        const locataireList = contract.locataires as any[]
        const locataireName = Array.isArray(locataireList)
          ? locataireList[0]?.nom || "Unknown"
          : "Unknown"

        missing.push({
          contrat_id: contract.id,
          locataire_nom: locataireName,
          loyer_attendu: contract.loyer_mensuel,
          jours_retard: Math.floor(
            (Date.now() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
          ),
        })
      }
    }

    return missing
  }

  async updateReceipt(paymentId: string, receiptUrl: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from("paiements")
      .update({ quittance_url: receiptUrl })
      .eq("id", paymentId)

    if (error) throw new DatabaseError(error.message)
  }

  async getPaginated(
    userId: string,
    page: number,
    pageSize: number = 20
  ): Promise<{ data: Payment[]; total: number }> {
    const supabase = await createClient()
    const offset = (page - 1) * pageSize

    const { data, count, error } = await supabase
      .from("paiements")
      .select("*", { count: "exact" })
      .eq("proprietaire_id", userId)
      .order("date_paiement", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) throw new DatabaseError(error.message)

    return {
      data: (data as Payment[]) || [],
      total: count || 0,
    }
  }

  async getPaginatedByOrganisation(
    organisationId: string,
    page: number,
    pageSize: number = 20
  ): Promise<{ data: any[]; total: number }> {
    const supabase = await createClient()
    const offset = (page - 1) * pageSize

    // Récupérer les locataires de l'organisation
    const { data: locataires } = await supabase
      .from("locataires")
      .select("id")
      .eq("organisation_id", organisationId)

    const locataireIds = (locataires ?? []).map((l) => l.id)

    if (locataireIds.length === 0) {
      return { data: [], total: 0 }
    }

    // Récupérer les contrats de ces locataires
    const { data: contrats } = await supabase
      .from("contrats")
      .select("id")
      .in("locataire_id", locataireIds)

    const contratIds = (contrats ?? []).map((c) => c.id)

    if (contratIds.length === 0) {
      return { data: [], total: 0 }
    }

    // Récupérer les paiements avec relations
    const { data, count, error } = await supabase
      .from("paiements")
      .select(`
        *,
        contrat:contrats(
          locataire_id,
          logement_id,
          locataire:locataires(nom),
          logement:logements(nom)
        )
      `, { count: "exact" })
      .in("contrat_id", contratIds)
      .order("date_paiement", { ascending: false })
      .range(offset, offset + pageSize - 1)

    if (error) throw new DatabaseError(error.message)

    // Formater les données pour l'UI
    const formattedData = (data || []).map((p: any) => ({
      ...p,
      locataire_nom: p.contrat?.locataire?.nom ?? "—",
      logement_nom: p.contrat?.logement?.nom ?? null,
    }))

    return {
      data: formattedData,
      total: count || 0,
    }
  }
}
