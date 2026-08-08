/**
 * GuaranteeRepository
 * Data access for guarantee (dépôt de garantie) records
 */

import { createClient } from "@/lib/supabase/server"

export interface Guarantee {
  id: string
  contrat_id: string
  proprietaire_id: string
  amount: number
  status: "held" | "partial_return" | "returned"
  held_at: string
  return_initiated_at?: string | null
  returned_at?: string | null
  deductions: Array<{ reason: string; amount: number; date: string }> | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface CreateGuaranteeDTO {
  contrat_id: string
  amount: number
  status?: "held"
}

export interface UpdateGuaranteeDTO {
  status?: "held" | "partial_return" | "returned"
  return_initiated_at?: string
  returned_at?: string
  deductions?: Array<{ reason: string; amount: number; date: string }>
  notes?: string
}

export class GuaranteeRepository {
  async create(
    data: CreateGuaranteeDTO,
    proprietaireId: string
  ): Promise<Guarantee> {
    const supabase = await createClient()

    const { data: guarantee, error } = await supabase
      .from("garanties")
      .insert([
        {
          contrat_id: data.contrat_id,
          proprietaire_id: proprietaireId,
          amount: data.amount,
          status: data.status || "held",
          held_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Failed to create guarantee: ${error.message}`)
    return guarantee
  }

  async getByContractId(
    contractId: string,
    proprietaireId: string
  ): Promise<Guarantee | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("garanties")
      .select("*")
      .eq("contrat_id", contractId)
      .eq("proprietaire_id", proprietaireId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw new Error(`Failed to fetch guarantee: ${error.message}`)
    }

    return data || null
  }

  async update(
    contractId: string,
    proprietaireId: string,
    data: UpdateGuaranteeDTO
  ): Promise<Guarantee> {
    const supabase = await createClient()

    const { data: updated, error } = await supabase
      .from("garanties")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("contrat_id", contractId)
      .eq("proprietaire_id", proprietaireId)
      .select()
      .single()

    if (error) throw new Error(`Failed to update guarantee: ${error.message}`)
    return updated
  }

  async getHeldGuarantees(proprietaireId: string): Promise<Guarantee[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("garanties")
      .select("*")
      .eq("proprietaire_id", proprietaireId)
      .eq("status", "held")
      .order("held_at", { ascending: false })

    if (error) throw new Error(`Failed to fetch guarantees: ${error.message}`)
    return data || []
  }

  async getPendingReturns(proprietaireId: string): Promise<Guarantee[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("garanties")
      .select("*")
      .eq("proprietaire_id", proprietaireId)
      .neq("status", "returned")
      .order("return_initiated_at", { ascending: true, nullsFirst: false })

    if (error) throw new Error(`Failed to fetch pending returns: ${error.message}`)
    return data || []
  }
}
