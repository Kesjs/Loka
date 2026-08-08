/**
 * useContrats Hook
 * Fetch and manage contracts data
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys, queryConfig } from "@/lib/react-query"

export interface ContratData {
  id: string
  locataire_id: string
  locataire_nom: string
  logement_id: string
  logement_nom: string
  loyer_mensuel: number
  depot_garantie: number
  date_debut: string
  date_fin: string | null
  statut: "actif" | "termine" | "resilie"
}

export interface ContratsResponse {
  data: ContratData[]
  total: number
  page: number
  pageSize: number
}

/**
 * Fetch paginated contracts
 */
export function useContrats(
  proprietaireId: string,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: queryKeys.contratsList(proprietaireId, page),
    queryFn: async (): Promise<ContratsResponse> => {
      const response = await fetch(
        `/api/contrats?proprietaire_id=${proprietaireId}&page=${page}&pageSize=${pageSize}`
      )
      if (!response.ok) throw new Error("Failed to fetch contrats")
      return response.json()
    },
    ...queryConfig.paginated,
  })
}

/**
 * Fetch active contracts
 */
export function useContratsActive(proprietaireId: string) {
  return useQuery({
    queryKey: queryKeys.contratsActive(proprietaireId),
    queryFn: async (): Promise<ContratData[]> => {
      const response = await fetch(
        `/api/contrats?proprietaire_id=${proprietaireId}&statut=actif`
      )
      if (!response.ok) throw new Error("Failed to fetch active contrats")
      return response.json()
    },
    ...queryConfig.dynamic,
  })
}

/**
 * Fetch expiring contracts
 */
export function useContratsExpiring(
  proprietaireId: string,
  days: number = 30
) {
  return useQuery({
    queryKey: queryKeys.contratsExpiring(proprietaireId, days),
    queryFn: async (): Promise<ContratData[]> => {
      const response = await fetch(
        `/api/contrats/expiring?proprietaire_id=${proprietaireId}&days=${days}`
      )
      if (!response.ok) throw new Error("Failed to fetch expiring contrats")
      return response.json()
    },
    ...queryConfig.dynamic,
  })
}

/**
 * Fetch single contract
 */
export function useContrat(id: string) {
  return useQuery({
    queryKey: queryKeys.contrat(id),
    queryFn: async (): Promise<ContratData> => {
      const response = await fetch(`/api/contrats/${id}`)
      if (!response.ok) throw new Error("Failed to fetch contrat")
      return response.json()
    },
    ...queryConfig.static,
    enabled: !!id,
  })
}

/**
 * Create contract mutation
 */
export function useCreateContrat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<ContratData, "id">) => {
      const response = await fetch("/api/contrats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create contrat")
      return response.json()
    },
    onSuccess: (newContrat) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contrats(),
      })
      queryClient.setQueryData(
        queryKeys.contrat(newContrat.id),
        newContrat
      )
    },
  })
}

/**
 * Update contract mutation
 */
export function useUpdateContrat(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<ContratData>) => {
      const response = await fetch(`/api/contrats/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update contrat")
      return response.json()
    },
    onSuccess: (updatedContrat) => {
      queryClient.setQueryData(
        queryKeys.contrat(id),
        updatedContrat
      )
      queryClient.invalidateQueries({
        queryKey: queryKeys.contrats(),
      })
    },
  })
}

/**
 * Terminate contract mutation
 */
export function useTerminateContrat(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { deductions?: number }) => {
      const response = await fetch(`/api/contrats/${id}/terminate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to terminate contrat")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.contrats(),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.contrat(id),
      })
    },
  })
}
