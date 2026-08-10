/**
 * useLocataires Hook
 * Fetch and manage tenants data
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys, queryConfig } from "@/lib/react-query"
import { assertOk } from "@/lib/api/fetchJson"

export interface LocataireData {
  id: string
  nom: string
  email?: string
  telephone?: string
  adresse?: string
  date_creation: string
}

export interface LocatairesResponse {
  data: LocataireData[]
  total: number
  page: number
  pageSize: number
}

/**
 * Fetch paginated tenants
 */
export function useLocataires(
  proprietaireId: string,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: queryKeys.locatairesList(proprietaireId, page),
    queryFn: async (): Promise<LocatairesResponse> => {
      const response = await fetch(
        `/api/locataires?proprietaire_id=${proprietaireId}&page=${page}&pageSize=${pageSize}`
      )
      await assertOk(response, "Failed to fetch locataires")
      return response.json()
    },
    ...queryConfig.paginated,
  })
}

/**
 * Fetch single tenant
 */
export function useLocataire(id: string) {
  return useQuery({
    queryKey: queryKeys.locataire(id),
    queryFn: async (): Promise<LocataireData> => {
      const response = await fetch(`/api/locataires/${id}`)
      await assertOk(response, "Failed to fetch locataire")
      return response.json()
    },
    ...queryConfig.static,
    enabled: !!id,
  })
}

/**
 * Create tenant mutation
 */
export function useCreateLocataire() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<LocataireData, "id" | "date_creation">) => {
      const response = await fetch("/api/locataires", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      await assertOk(response, "Failed to create locataire")
      return response.json()
    },
    onSuccess: (newLocataire) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.locataires(),
      })
      queryClient.setQueryData(
        queryKeys.locataire(newLocataire.id),
        newLocataire
      )
    },
  })
}

/**
 * Update tenant mutation
 */
export function useUpdateLocataire(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<LocataireData>) => {
      const response = await fetch(`/api/locataires/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      await assertOk(response, "Failed to update locataire")
      return response.json()
    },
    onSuccess: (updatedLocataire) => {
      queryClient.setQueryData(
        queryKeys.locataire(id),
        updatedLocataire
      )
      queryClient.invalidateQueries({
        queryKey: queryKeys.locataires(),
      })
    },
  })
}

/**
 * Delete tenant mutation
 */
export function useDeleteLocataire() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/locataires/${id}`, {
        method: "DELETE",
      })
      await assertOk(response, "Failed to delete locataire")
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.locataire(id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.locataires(),
      })
    },
  })
}
