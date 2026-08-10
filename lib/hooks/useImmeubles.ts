/**
 * useImmeubles Hook
 * Fetch and manage buildings data
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys, queryConfig } from "@/lib/react-query"
import { assertOk } from "@/lib/api/fetchJson"

export interface ImmeubleData {
  id: string
  nom: string
  adresse: string
  ville: string
  code_postal: string
  nb_logements: number
  date_creation: string
}

export interface ImmeubleResponse {
  data: ImmeubleData[]
  total: number
  page: number
  pageSize: number
}

/**
 * Fetch paginated buildings
 */
export function useImmeubles(
  proprietaireId: string,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: queryKeys.immeublesList(proprietaireId, page),
    queryFn: async (): Promise<ImmeubleResponse> => {
      const response = await fetch(
        `/api/immeubles?proprietaire_id=${proprietaireId}&page=${page}&pageSize=${pageSize}`
      )
      await assertOk(response, "Failed to fetch immeubles")
      return response.json()
    },
    ...queryConfig.paginated,
  })
}

/**
 * Fetch single building
 */
export function useImmeuble(id: string) {
  return useQuery({
    queryKey: queryKeys.immeuble(id),
    queryFn: async (): Promise<ImmeubleData> => {
      const response = await fetch(`/api/immeubles/${id}`)
      await assertOk(response, "Failed to fetch immeuble")
      return response.json()
    },
    ...queryConfig.static,
    enabled: !!id,
  })
}

/**
 * Create building mutation
 */
export function useCreateImmeuble() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<ImmeubleData, "id" | "date_creation">) => {
      const response = await fetch("/api/immeubles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      await assertOk(response, "Failed to create immeuble")
      return response.json()
    },
    onSuccess: (newImmeuble) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.immeubles(),
      })
      queryClient.setQueryData(
        queryKeys.immeuble(newImmeuble.id),
        newImmeuble
      )
    },
  })
}

/**
 * Update building mutation
 */
export function useUpdateImmeuble(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<ImmeubleData>) => {
      const response = await fetch(`/api/immeubles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      await assertOk(response, "Failed to update immeuble")
      return response.json()
    },
    onSuccess: (updatedImmeuble) => {
      queryClient.setQueryData(
        queryKeys.immeuble(id),
        updatedImmeuble
      )
      queryClient.invalidateQueries({
        queryKey: queryKeys.immeubles(),
      })
    },
  })
}

/**
 * Delete building mutation
 */
export function useDeleteImmeuble() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/immeubles/${id}`, {
        method: "DELETE",
      })
      await assertOk(response, "Failed to delete immeuble")
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.immeuble(id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.immeubles(),
      })
    },
  })
}
