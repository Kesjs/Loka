"use client"

/**
 * RenewContractForm
 * Form for renewing an existing contract
 * Allows updating rent, guarantee, and dates
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle } from "@phosphor-icons/react"
import { fetchJson } from "@/lib/api/fetchJson"

type FormData = {
  loyer_mensuel: number
  depot_garantie: number
  date_debut: string
  date_fin?: string
}

interface RenewContractFormProps {
  contractId: string
  currentTenant: { id: string; nom: string }
  currentProperty: { id: string; nom: string }
  currentRent: number
  currentGuarantee: number
  currentEndDate?: string
}

export function RenewContractForm({
  contractId,
  currentTenant,
  currentProperty,
  currentRent,
  currentGuarantee,
  currentEndDate,
}: RenewContractFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<FormData>({
    defaultValues: {
      loyer_mensuel: currentRent,
      depot_garantie: currentGuarantee,
      date_debut: new Date().toISOString().split("T")[0],
      date_fin: currentEndDate,
    },
    mode: "onChange",
  })

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    setError("")

    try {
      await fetchJson(`/api/contracts/${contractId}/renew`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        fallbackMessage: "Erreur lors du renouvellement du contrat",
      })

      router.push(`/contrats/${contractId}`)
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700"
        >
          {error}
        </motion.div>
      )}

      {/* Summary */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
        <p className="text-sm font-medium text-blue-900">
          Renouvellement de contrat pour:
        </p>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Locataire:</strong> {currentTenant.nom}
          </p>
          <p>
            <strong>Propriété:</strong> {currentProperty.nom}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Loyer Mensuel */}
        <Controller
          control={form.control}
          name="loyer_mensuel"
          render={({ field, fieldState: { error } }) => (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nouveau loyer mensuel (FCFA)
              </label>
              <input
                {...field}
                type="number"
                step="1000"
                className={`w-full rounded-lg border px-4 py-3 text-neutral-900 outline-none transition ${
                  error
                    ? "border-red-300 focus:ring-2 focus:ring-red-100"
                    : "border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1">{error.message}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                Actuellement: {currentRent.toLocaleString()} FCFA
              </p>
            </div>
          )}
        />

        {/* Dépôt de garantie */}
        <Controller
          control={form.control}
          name="depot_garantie"
          render={({ field, fieldState: { error } }) => (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Nouveau dépôt de garantie (FCFA)
              </label>
              <input
                {...field}
                type="number"
                step="1000"
                className={`w-full rounded-lg border px-4 py-3 text-neutral-900 outline-none transition ${
                  error
                    ? "border-red-300 focus:ring-2 focus:ring-red-100"
                    : "border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1">{error.message}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                Actuellement: {currentGuarantee.toLocaleString()} FCFA
              </p>
            </div>
          )}
        />

        {/* Date début */}
        <Controller
          control={form.control}
          name="date_debut"
          render={({ field, fieldState: { error } }) => (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Date de début du nouveau contrat
              </label>
              <input
                {...field}
                type="date"
                className={`w-full rounded-lg border px-4 py-3 text-neutral-900 outline-none transition ${
                  error
                    ? "border-red-300 focus:ring-2 focus:ring-red-100"
                    : "border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1">{error.message}</p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                Par défaut: aujourd'hui
              </p>
            </div>
          )}
        />

        {/* Date fin (optional) */}
        <Controller
          control={form.control}
          name="date_fin"
          render={({ field, fieldState: { error } }) => (
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Date de fin du nouveau contrat (optionnel)
              </label>
              <input
                {...field}
                type="date"
                className={`w-full rounded-lg border px-4 py-3 text-neutral-900 outline-none transition ${
                  error
                    ? "border-red-300 focus:ring-2 focus:ring-red-100"
                    : "border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {error && (
                <p className="text-xs text-red-600 mt-1">{error.message}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-neutral-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} weight="bold" />
          Retour
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Renouvellement..." : "Renouveler le contrat"}
          {!isSubmitting && <CheckCircle size={16} weight="fill" />}
        </button>
      </div>
    </form>
  )
}
