/**
 * usePaiements Hook
 * Fetch and manage payments data
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys, queryConfig } from "@/lib/react-query"
import { assertOk } from "@/lib/api/fetchJson"

export interface PaiementData {
  id: string
  contrat_id: string
  montant: number
  date_paiement: string
  periode_debut: string
  periode_fin: string
  mode: "cash" | "mobile_money" | "virement" | "cheque"
  quittance_url?: string
  notes?: string
}

export interface PaiementsResponse {
  data: PaiementData[]
  total: number
  page: number
  pageSize: number
}

/**
 * Fetch paginated payments
 */
export function usePaiements(
  proprietaireId: string,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: queryKeys.paiementsList(proprietaireId, page),
    queryFn: async (): Promise<PaiementsResponse> => {
      const response = await fetch(
        `/api/paiements?proprietaire_id=${proprietaireId}&page=${page}&pageSize=${pageSize}`
      )
      await assertOk(response, "Failed to fetch paiements")
      return response.json()
    },
    ...queryConfig.paginated,
  })
}

/**
 * Fetch recent payments
 */
export function usePaiementsRecent(
  proprietaireId: string,
  limit: number = 5
) {
  return useQuery({
    queryKey: queryKeys.paiementsRecent(proprietaireId, limit),
    queryFn: async (): Promise<PaiementData[]> => {
      const response = await fetch(
        `/api/paiements/recent?proprietaire_id=${proprietaireId}&limit=${limit}`
      )
      await assertOk(response, "Failed to fetch recent paiements")
      return response.json()
    },
    ...queryConfig.dynamic,
  })
}

/**
 * Fetch missing payments
 */
export function usePaiementsMissing(proprietaireId: string) {
  return useQuery({
    queryKey: queryKeys.paiementsMissing(proprietaireId),
    queryFn: async (): Promise<any[]> => {
      const response = await fetch(
        `/api/paiements/missing?proprietaire_id=${proprietaireId}`
      )
      await assertOk(response, "Failed to fetch missing paiements")
      return response.json()
    },
    ...queryConfig.dynamic,
  })
}

/**
 * Fetch payments stats
 */
export function usePaiementsStats(proprietaireId: string) {
  return useQuery({
    queryKey: queryKeys.paiementsStats(proprietaireId),
    queryFn: async () => {
      const response = await fetch(
        `/api/paiements/stats?proprietaire_id=${proprietaireId}`
      )
      await assertOk(response, "Failed to fetch paiements stats")
      return response.json()
    },
    ...queryConfig.dynamic,
  })
}

/**
 * Fetch single payment
 */
export function usePaiement(id: string) {
  return useQuery({
    queryKey: queryKeys.paiement(id),
    queryFn: async (): Promise<PaiementData> => {
      const response = await fetch(`/api/paiements/${id}`)
      await assertOk(response, "Failed to fetch paiement")
      return response.json()
    },
    ...queryConfig.static,
    enabled: !!id,
  })
}

/**
 * Record payment mutation
 */
export function useRecordPaiement(proprietaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<PaiementData, "id">) => {
      const response = await fetch("/api/paiements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      await assertOk(response, "Failed to record paiement")
      return response.json()
    },
    onSuccess: (newPaiement) => {
      // Invalidate all paiements queries for this proprietaire
      queryClient.invalidateQueries({
        queryKey: queryKeys.paiementsList(proprietaireId),
      })
      queryClient.setQueryData(
        queryKeys.paiement(newPaiement.id),
        newPaiement
      )
    },
  })
}

/**
 * Update payment mutation
 */
export function useUpdatePaiement(id: string, proprietaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<PaiementData>) => {
      const response = await fetch(`/api/paiements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      await assertOk(response, "Failed to update paiement")
      return response.json()
    },
    onSuccess: (updatedPaiement) => {
      queryClient.setQueryData(
        queryKeys.paiement(id),
        updatedPaiement
      )
      queryClient.invalidateQueries({
        queryKey: queryKeys.paiementsList(proprietaireId),
      })
    },
  })
}

/**
 * Delete payment mutation
 */
export function useDeletePaiement(proprietaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/paiements/${id}`, {
        method: "DELETE",
      })
      await assertOk(response, "Failed to delete paiement")
    },
    onSuccess: (_, id) => {
      queryClient.removeQueries({
        queryKey: queryKeys.paiement(id),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.paiementsList(proprietaireId),
      })
    },
  })
}
