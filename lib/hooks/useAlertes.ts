/**
 * useAlertes Hook
 * Fetch and manage alerts data
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys, queryConfig } from "@/lib/react-query"

export interface AlerteData {
  id: string
  type: "missing_payment" | "expiring_contract" | "deposit_to_return"
  severity: "low" | "medium" | "high"
  message: string
  entity_type?: string
  entity_id?: string
  is_read: boolean
  read_at?: string
  created_at: string
  action_url?: string
}

export interface AlertesResponse {
  data: AlerteData[]
  total: number
}

/**
 * Fetch all alerts
 */
export function useAlertes(proprietaireId: string) {
  return useQuery({
    queryKey: queryKeys.alertesList(proprietaireId),
    queryFn: async (): Promise<AlertesResponse> => {
      const response = await fetch(
        `/api/alertes?proprietaire_id=${proprietaireId}`
      )
      if (!response.ok) throw new Error("Failed to fetch alertes")
      return response.json()
    },
    ...queryConfig.realTime,
  })
}

/**
 * Fetch unread alerts
 */
export function useAlertesUnread(proprietaireId: string) {
  return useQuery({
    queryKey: queryKeys.alertesUnread(proprietaireId),
    queryFn: async (): Promise<AlerteData[]> => {
      const response = await fetch(
        `/api/alertes/unread?proprietaire_id=${proprietaireId}`
      )
      if (!response.ok) throw new Error("Failed to fetch unread alertes")
      return response.json()
    },
    ...queryConfig.realTime,
  })
}

/**
 * Fetch critical alerts count
 */
export function useAlertesCritical(proprietaireId: string) {
  return useQuery({
    queryKey: queryKeys.alertesCritical(proprietaireId),
    queryFn: async (): Promise<number> => {
      const response = await fetch(
        `/api/alertes/critical-count?proprietaire_id=${proprietaireId}`
      )
      if (!response.ok) throw new Error("Failed to fetch critical alerts count")
      const data = await response.json()
      return data.count || 0
    },
    ...queryConfig.realTime,
  })
}

/**
 * Mark alert as read mutation
 */
export function useMarkAlertRead(id: string, proprietaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/alertes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      })
      if (!response.ok) throw new Error("Failed to mark alert as read")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.alertesList(proprietaireId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.alertesUnread(proprietaireId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.alertesCritical(proprietaireId),
      })
    },
  })
}

/**
 * Mark multiple alerts as read mutation
 */
export function useMarkAlertsRead(proprietaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch("/api/alertes/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, is_read: true }),
      })
      if (!response.ok) throw new Error("Failed to mark alerts as read")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.alertesList(proprietaireId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.alertesUnread(proprietaireId),
      })
      queryClient.invalidateQueries({
        queryKey: queryKeys.alertesCritical(proprietaireId),
      })
    },
  })
}

/**
 * Delete alert mutation
 */
export function useDeleteAlerte(id: string, proprietaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/alertes/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete alerte")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.alertesList(proprietaireId),
      })
    },
  })
}
