/**
 * React Query Provider
 * Wraps app with QueryClientProvider and DevTools
 */

"use client"

import React, { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { createQueryClient } from "@/lib/react-query"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient once on mount (not on every render)
  const [queryClient] = useState(() => createQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {/* React Query DevTools - only in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
