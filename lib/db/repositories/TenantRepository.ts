/**
 * TenantRepository
 * Data access layer for tenants (locataires)
 */

import { createClient } from "@/lib/supabase/server"
import { DatabaseError } from "@/lib/errors/ApplicationError"

export interface Tenant {
  id: string
  proprietaire_id: string
  nom: string
  telephone?: string
  email?: string
  created_at: string
}

export class TenantRepository {
  async create(
    data: Omit<Tenant, "id" | "proprietaire_id" | "created_at">,
    userId: string
  ): Promise<Tenant> {
    const supabase = await createClient()

    const { data: tenant, error } = await supabase
      .from("locataires")
      .insert([{ ...data, proprietaire_id: userId }])
      .select()
      .single()

    if (error) throw new DatabaseError(error.message)
    return tenant as Tenant
  }

  async getById(id: string, userId: string): Promise<Tenant | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("locataires")
      .select("*")
      .eq("id", id)
      .eq("proprietaire_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw new DatabaseError(error.message)
    }

    return (data as Tenant) || null
  }

  async getAll(userId: string): Promise<Tenant[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("locataires")
      .select("*")
      .eq("proprietaire_id", userId)
      .order("nom", { ascending: true })

    if (error) throw new DatabaseError(error.message)
    return (data as Tenant[]) || []
  }

  async getPaginated(
    userId: string,
    page: number,
    pageSize: number = 20
  ): Promise<{ data: Tenant[]; total: number }> {
    const supabase = await createClient()
    const offset = (page - 1) * pageSize

    const { data, count, error } = await supabase
      .from("locataires")
      .select("*", { count: "exact" })
      .eq("proprietaire_id", userId)
      .order("nom", { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) throw new DatabaseError(error.message)

    return {
      data: (data as Tenant[]) || [],
      total: count || 0,
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from("locataires")
      .delete()
      .eq("id", id)
      .eq("proprietaire_id", userId)

    if (error) throw new DatabaseError(error.message)
  }
}
