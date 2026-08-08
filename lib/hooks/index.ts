/**
 * Hooks Exports
 * Centralized access to all custom React hooks
 */

export { usePayments, usePaymentsByContract, useMissingPayments } from "./usePayments"
export { useAlerts, useUnreadAlerts, useCriticalAlertCount } from "./useAlerts"

// React Query hooks
export { useLogements, useLogement, useCreateLogement, useUpdateLogement, useDeleteLogement, useLogementsByImmeuble, useLogementStats } from "./useLogements"
export { useContrats, useContrat, useCreateContrat, useUpdateContrat, useTerminateContrat, useContratsActive, useContratsExpiring } from "./useContrats"
export { usePaiements, usePaiement, useRecordPaiement, useUpdatePaiement, useDeletePaiement, usePaiementsRecent, usePaiementsMissing, usePaiementsStats } from "./usePaiements"
export { useLocataires, useLocataire, useCreateLocataire, useUpdateLocataire, useDeleteLocataire } from "./useLocataires"
export { useImmeubles, useImmeuble, useCreateImmeuble, useUpdateImmeuble, useDeleteImmeuble } from "./useImmeubles"
export { useAlertes, useAlertesUnread, useAlertesCritical, useMarkAlertRead, useMarkAlertsRead, useDeleteAlerte } from "./useAlertes"

// Auth hook
export { useAuth } from "./useAuth"
