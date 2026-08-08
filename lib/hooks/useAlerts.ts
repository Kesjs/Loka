/**
 * useAlerts
 * React Query hook for alert data fetching
 */

import { useQuery } from "@tanstack/react-query"
import type { Alert } from "@/lib/db/repositories/AlertRepository"

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts")
      if (!res.ok) throw new Error("Failed to fetch alerts")
      return res.json() as Promise<Alert[]>
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

export function useUnreadAlerts() {
  return useQuery({
    queryKey: ["alerts", "unread"],
    queryFn: async () => {
      const res = await fetch("/api/alerts?unread=true")
      if (!res.ok) throw new Error("Failed to fetch alerts")
      return res.json() as Promise<Alert[]>
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}

export function useCriticalAlertCount() {
  return useQuery({
    queryKey: ["alerts", "critical-count"],
    queryFn: async () => {
      const res = await fetch("/api/alerts/critical-count")
      if (!res.ok) throw new Error("Failed to fetch alert count")
      return res.json() as Promise<{ count: number }>
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  })
}
