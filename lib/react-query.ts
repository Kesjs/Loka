/**
 * React Query Configuration
 * Setup for data fetching, caching, and synchronization
 */

import { QueryClient } from "@tanstack/react-query"

/**
 * Global QueryClient configuration
 * All instances share these defaults
 */
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache time before data is marked stale
        staleTime: 1000 * 60 * 5, // 5 minutes

        // Time before garbage collection removes cached data
        gcTime: 1000 * 60 * 10, // 10 minutes

        // Number of retries on error
        retry: 1,

        // Retry delay
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        // Abort queries on unmount
        refetchOnWindowFocus: false,

        // Don't refetch on mount if data is fresh
        refetchOnMount: false,

        // Don't refetch on reconnect if data is fresh
        refetchOnReconnect: false,
      },

      mutations: {
        // Retry mutations on failure
        retry: 1,

        // Retry delay
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  })
}

/**
 * Query keys factory for type-safe query keys
 * Prevents typos and makes refetching/invalidation easier
 */
export const queryKeys = {
  all: ["app"] as const,

  // Logements (properties/units)
  logements: () => [...queryKeys.all, "logements"] as const,
  logementsList: (proprietaireId: string, page: number = 1) =>
    [...queryKeys.logements(), "list", proprietaireId, page] as const,
  logementsByImmeuble: (immeubleId: string) =>
    [...queryKeys.logements(), "byImmeuble", immeubleId] as const,
  logement: (id: string) =>
    [...queryKeys.logements(), "detail", id] as const,
  logementStats: (proprietaireId: string) =>
    [...queryKeys.logements(), "stats", proprietaireId] as const,

  // Immeubles (properties/buildings)
  immeubles: () => [...queryKeys.all, "immeubles"] as const,
  immeublesList: (proprietaireId: string, page: number = 1) =>
    [...queryKeys.immeubles(), "list", proprietaireId, page] as const,
  immeuble: (id: string) =>
    [...queryKeys.immeubles(), "detail", id] as const,

  // Locataires (tenants)
  locataires: () => [...queryKeys.all, "locataires"] as const,
  locatairesList: (proprietaireId: string, page: number = 1) =>
    [...queryKeys.locataires(), "list", proprietaireId, page] as const,
  locataire: (id: string) =>
    [...queryKeys.locataires(), "detail", id] as const,

  // Contrats (contracts)
  contrats: () => [...queryKeys.all, "contrats"] as const,
  contratsList: (proprietaireId: string, page: number = 1) =>
    [...queryKeys.contrats(), "list", proprietaireId, page] as const,
  contrat: (id: string) =>
    [...queryKeys.contrats(), "detail", id] as const,
  contratsActive: (proprietaireId: string) =>
    [...queryKeys.contrats(), "active", proprietaireId] as const,
  contratsExpiring: (proprietaireId: string, days: number = 30) =>
    [...queryKeys.contrats(), "expiring", proprietaireId, days] as const,

  // Paiements (payments)
  paiements: () => [...queryKeys.all, "paiements"] as const,
  paiementsList: (proprietaireId: string, page: number = 1) =>
    [...queryKeys.paiements(), "list", proprietaireId, page] as const,
  paiement: (id: string) =>
    [...queryKeys.paiements(), "detail", id] as const,
  paiementsRecent: (proprietaireId: string, limit: number = 5) =>
    [...queryKeys.paiements(), "recent", proprietaireId, limit] as const,
  paiementsMissing: (proprietaireId: string) =>
    [...queryKeys.paiements(), "missing", proprietaireId] as const,
  paiementsStats: (proprietaireId: string) =>
    [...queryKeys.paiements(), "stats", proprietaireId] as const,

  // Alertes (alerts)
  alertes: () => [...queryKeys.all, "alertes"] as const,
  alertesList: (proprietaireId: string) =>
    [...queryKeys.alertes(), "list", proprietaireId] as const,
  alertesUnread: (proprietaireId: string) =>
    [...queryKeys.alertes(), "unread", proprietaireId] as const,
  alertesCritical: (proprietaireId: string) =>
    [...queryKeys.alertes(), "critical", proprietaireId] as const,

  // Rapports (reports)
  rapports: () => [...queryKeys.all, "rapports"] as const,
  rapportsMensuel: (proprietaireId: string, month: string) =>
    [...queryKeys.rapports(), "monthly", proprietaireId, month] as const,
  rapportsAnnuel: (proprietaireId: string, year: number) =>
    [...queryKeys.rapports(), "annual", proprietaireId, year] as const,

  // Garanties (guarantees)
  garanties: () => [...queryKeys.all, "garanties"] as const,
  garantiesByContract: (contratId: string) =>
    [...queryKeys.garanties(), "byContract", contratId] as const,

  // Dashboard
  dashboard: () => [...queryKeys.all, "dashboard"] as const,
  dashboardData: (proprietaireId: string) =>
    [...queryKeys.dashboard(), "data", proprietaireId] as const,
}

/**
 * Query configuration presets
 */
export const queryConfig = {
  // For relatively static data (refresh every 10 mins)
  static: {
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  },

  // For frequently changing data (refresh every 1 min)
  dynamic: {
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  },

  // For real-time data (refresh immediately)
  realTime: {
    staleTime: 0,
    gcTime: 1000 * 60 * 1,
  },

  // For pagination (moderate refresh)
  paginated: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  },
}
