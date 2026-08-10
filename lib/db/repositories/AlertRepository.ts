/**
 * AlertRepository
 * Data access layer for alerts
 */

import { createClient } from "@/lib/supabase/server"
import { DatabaseError } from "@/lib/errors/ApplicationError"

export interface Alert {
  id: string
  proprietaire_id: string
  type: "missing_payment" | "expiring_contract" | "deposit_to_return"
  severity: "low" | "medium" | "high"
  message: string
  entity_type?: string
  entity_id?: string
  is_read: boolean
  read_at?: string
  action_url?: string
  created_at: string
  expires_at?: string
}

export class AlertRepository {
  async create(
    data: Omit<Alert, "id" | "proprietaire_id" | "is_read" | "read_at" | "created_at">,
    userId: string
  ): Promise<Alert> {
    const supabase = await createClient()

    const { data: alert, error } = await supabase
      .from("alerts")
      .insert([{ ...data, proprietaire_id: userId, is_read: false }])
      .select()
      .single()

    if (error) throw new DatabaseError(error.message)
    return alert as Alert
  }

  async getUnread(userId: string): Promise<Alert[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("proprietaire_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })

    if (error) throw new DatabaseError(error.message)
    return (data as Alert[]) || []
  }

  async getAll(userId: string, limit = 50): Promise<Alert[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("proprietaire_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw new DatabaseError(error.message)
    return (data as Alert[]) || []
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from("alerts")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("proprietaire_id", userId)

    if (error) throw new DatabaseError(error.message)
  }

  async markMultipleAsRead(ids: string[], userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from("alerts")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in("id", ids)
      .eq("proprietaire_id", userId)

    if (error) throw new DatabaseError(error.message)
  }

  async delete(id: string, userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", id)
      .eq("proprietaire_id", userId)

    if (error) throw new DatabaseError(error.message)
  }

  async deleteExpired(): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from("alerts")
      .delete()
      .lt("expires_at", new Date().toISOString())

    if (error) throw new DatabaseError(error.message)
  }

  async getCriticalCount(userId: string): Promise<number> {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("proprietaire_id", userId)
      .eq("is_read", false)
      .eq("severity", "high")

    if (error) throw new DatabaseError(error.message)
    return count || 0
  }
}
