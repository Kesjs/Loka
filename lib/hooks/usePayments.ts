/**
 * usePayments
 * React Query hook for payment data fetching
 */

import { useQuery } from "@tanstack/react-query"
import type { Payment } from "@/lib/db/repositories/PaymentRepository"

interface UsePaymentsOptions {
  page?: number
  pageSize?: number
}

export function usePayments({ page = 1, pageSize = 20 }: UsePaymentsOptions = {}) {
  return useQuery({
    queryKey: ["payments", page],
    queryFn: async () => {
      const res = await fetch(`/api/payments?page=${page}&pageSize=${pageSize}`)
      if (!res.ok) throw new Error("Failed to fetch payments")
      return res.json() as Promise<{ data: Payment[]; total: number; pages: number }>
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function usePaymentsByContract(contractId: string) {
  return useQuery({
    queryKey: ["payments", contractId],
    queryFn: async () => {
      const res = await fetch(`/api/contracts/${contractId}/payments`)
      if (!res.ok) throw new Error("Failed to fetch payments")
      return res.json() as Promise<Payment[]>
    },
    staleTime: 1000 * 60, // 1 minute
  })
}

export function useMissingPayments() {
  return useQuery({
    queryKey: ["missing-payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments/missing")
      if (!res.ok) throw new Error("Failed to fetch missing payments")
      return res.json()
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 30, // Refetch every 30 minutes
  })
}
