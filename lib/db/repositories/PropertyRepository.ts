/**
 * PropertyRepository
 * Data access layer for properties (immeubles & logements)
 */

import { createClient } from "@/lib/supabase/server"
import { DatabaseError } from "@/lib/errors/ApplicationError"

export interface Property {
  id: string
  proprietaire_id: string
  nom: string
  adresse?: string
  ville?: string
  type?: string
  created_at: string
}

export interface Unit {
  id: string
  immeuble_id: string
  nom: string
  type?: string
  loyer_mensuel: number
  statut: "occupe" | "vacant"
  created_at: string
}

export class PropertyRepository {
  // IMMEUBLES (Properties)

  async createProperty(
    data: Omit<Property, "id" | "proprietaire_id" | "created_at">,
    userId: string
  ): Promise<Property> {
    const supabase = await createClient()

    const { data: property, error } = await supabase
      .from("immeubles")
      .insert([{ ...data, proprietaire_id: userId }])
      .select()
      .single()

    if (error) throw new DatabaseError(error.message)
    return property as Property
  }

  async getPropertyById(id: string, userId: string): Promise<Property | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("immeubles")
      .select("*")
      .eq("id", id)
      .eq("proprietaire_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw new DatabaseError(error.message)
    }

    return (data as Property) || null
  }

  async getAllProperties(userId: string): Promise<Property[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("immeubles")
      .select("*")
      .eq("proprietaire_id", userId)
      .order("nom", { ascending: true })

    if (error) throw new DatabaseError(error.message)
    return (data as Property[]) || []
  }

  // LOGEMENTS (Units)

  async createUnit(
    data: Omit<Unit, "id" | "created_at">,
    userId: string
  ): Promise<Unit> {
    const supabase = await createClient()

    const { data: unit, error } = await supabase
      .from("logements")
      .insert([{ ...data, proprietaire_id: userId }])
      .select()
      .single()

    if (error) throw new DatabaseError(error.message)
    return unit as Unit
  }

  async getUnitById(id: string, userId: string): Promise<Unit | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("logements")
      .select("*")
      .eq("id", id)
      .eq("proprietaire_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      throw new DatabaseError(error.message)
    }

    return (data as Unit) || null
  }

  async getUnitsForProperty(propertyId: string): Promise<Unit[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("logements")
      .select("*")
      .eq("immeuble_id", propertyId)
      .order("nom", { ascending: true })

    if (error) throw new DatabaseError(error.message)
    return (data as Unit[]) || []
  }

  async getAllUnits(userId: string): Promise<Unit[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("logements")
      .select("*")
      .eq("proprietaire_id", userId)
      .order("nom", { ascending: true })

    if (error) throw new DatabaseError(error.message)
    return (data as Unit[]) || []
  }

  async updateUnitStatus(
    id: string,
    status: "occupe" | "vacant"
  ): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
      .from("logements")
      .update({ statut: status })
      .eq("id", id)

    if (error) throw new DatabaseError(error.message)
  }

  async getUnitsPaginated(
    userId: string,
    page: number,
    pageSize: number = 20
  ): Promise<{ data: Unit[]; total: number }> {
    const supabase = await createClient()
    const offset = (page - 1) * pageSize

    const { data, count, error } = await supabase
      .from("logements")
      .select("*", { count: "exact" })
      .eq("proprietaire_id", userId)
      .order("nom", { ascending: true })
      .range(offset, offset + pageSize - 1)

    if (error) throw new DatabaseError(error.message)

    return {
      data: (data as Unit[]) || [],
      total: count || 0,
    }
  }
}
