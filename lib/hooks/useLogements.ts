/**
 * useLogements Hook
 * Fetch and manage logements (properties/units) data
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys, queryConfig } from "@/lib/react-query"
import { assertOk } from "@/lib/api/fetchJson"

export interface LogementData {
  id: string
  nom: string
  statut: "occupe" | "vacant"
  loyer_mensuel: number
  immeuble_id: string
  immeuble_nom: string
}

export interface LogementsResponse {
  data: LogementData[]
  total: number
  page: number
  pageSize: number
}

/**
 * Fetch paginated logements
 */
export function useLogements(
  proprietaireId: string,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: queryKeys.logementsList(proprietaireId, page),
    queryFn: async (): Promise<LogementsResponse> => {
      const response = await fetch(
        `/api/logements?proprietaire_id=${proprietaireId}&page=${page}&pageSize=${pageSize}`
      )
      await assertOk(response, "Failed to fetch logements")
      return response.json()
    },
    ...queryConfig.paginated,
  })
}

/**
 * Fetch logements stats
 */
export function useLogementStats(proprietaireId: string) {
  return useQuery({
    queryKey: queryKeys.logementStats(proprietaireId),
    queryFn: async () => {
      const response = await fetch(
        `/api/logements/stats?proprietaire_id=${proprietaireId}`
      )
      await assertOk(response, "Failed to fetch logement stats")
      return response.json()
    },
    ...queryConfig.dynamic,
  })
}

/**
 * Fetch logements by immeuble
 */
export function useLogementsByImmeuble(immeubleId: string) {
  return useQuery({
    queryKey: queryKeys.logementsByImmeuble(immeubleId),
    queryFn: async (): Promise<LogementData[]> => {
      const response = await fetch(
        `/api/logements?immeuble_id=${immeubleId}`
      )
      await assertOk(response, "Failed to fetch logements")
      return response.json()
    },
    ...queryConfig.static,
  })
}

/**
 * Fetch single logement
 */
export function useLogement(id: string) {
  return useQuery({
    queryKey: queryKeys.logement(id),
    queryFn: async (): Promise<LogementData> => {
      const response = await fetch(`/api/logements/${id}`)
      await assertOk(response, "Failed to fetch logement")
      return response.json()
    },
    ...queryConfig.static,
    enabled: !!id,
  })
}

/**
 * Create logement mutation
 */
export function useCreateLogement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<LogementData, "id">) => {
      const response = await fetch("/api/logements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      await assertOk(response, "Failed to create logement")
      return response.json()
    },
    onSuccess: (newLogement) => {
      // Invalidate all logements queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.logements(),
      })

      // Add to cache
      queryClient.setQueryData(
        queryKeys.logement(newLogement.id),
        newLogement
      )
    },
  })
}

/**
 * Update logement mutation
 */
export function useUpdateLogement(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<LogementData>) => {
      const response = await fetch(`/api/logements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      await assertOk(response, "Failed to update logement")
      return response.json()
    },
    onSuccess: (updatedLogement) => {
      // Update cache
      queryClient.setQueryData(
        queryKeys.logement(id),
        updatedLogement
      )

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.logements(),
      })
    },
  })
}

/**
 * Delete logement mutation
 */
export function useDeleteLogement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/logements/${id}`, {
        method: "DELETE",
      })
      await assertOk(response, "Failed to delete logement")
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.logement(id),
      })

      // Invalidate list queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.logements(),
      })
    },
  })
}
