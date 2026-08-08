/**
 * ContractRepository
 * Data access layer for contracts
 */

import { createClient } from "@/lib/supabase/server"
import { DatabaseError } from "@/lib/errors/ApplicationError"

export interface Contract {
  id: string
  locataire_id: string
  logement_id: string
  loyer_mensuel: number
  depot_garantie: number
  date_debut: string
  date_fin?: string
  statut: "actif" | "termine" | "resilie"
  created_at: string
}

export class ContractRepository {
  async create(
    data: Omit<Contract, "id" | "created_at">,
    userId: string
  ): Promise<Contract> {
    const supabase = await createClient()

    const { data: contract, error } = await supabase
      .from("contrats")
      .insert([{ ...data, proprietaire_id: userId }])
      .select()
      .single()

    if (error) throw new DatabaseError(error.message)
    return contract as Contract
  }

  async getById(id: string, userId: string): Promise<Contract | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contrats")
      .select("*")
      .eq("id", id)
      .eq("proprietaire_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw new DatabaseError(error.message)
    }

    return (data as Contract) || null
  }

  async findOverlapping(
    logementId: string,
    dateDebut: string,
    dateFin?: string
  ): Promise<Contract[]> {
    const supabase = await createClient()

    let query = supabase
      .from("contrats")
      .select("*")
      .eq("logement_id", logementId)
      .eq("statut", "actif")
      .gt("date_fin", dateDebut)

    if (dateFin) {
      query = query.lt("date_debut", dateFin)
    }

    const { data, error } = await query

    if (error) throw new DatabaseError(error.message)
    return (data as Contract[]) || []
  }

  async updateStatus(
    id: string,
    status: "actif" | "termine" | "resilie"
  ): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from("contrats")
      .update({ statut: status })
      .eq("id", id)

    if (error) throw new DatabaseError(error.message)
  }

  async getActive(userId: string): Promise<Contract[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("contrats")
      .select("*")
      .eq("proprietaire_id", userId)
      .eq("statut", "actif")
      .order("date_debut", { ascending: false })

    if (error) throw new DatabaseError(error.message)
    return (data as Contract[]) || []
  }

  async getExpiringWithin(userId: string, days: number): Promise<Contract[]> {
    const supabase = await createClient()
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const { data, error } = await supabase
      .from("contrats")
      .select("*")
      .eq("proprietaire_id", userId)
      .eq("statut", "actif")
      .lte("date_fin", futureDate.toISOString())
      .gt("date_fin", new Date().toISOString())

    if (error) throw new DatabaseError(error.message)
    return (data as Contract[]) || []
  }
}
