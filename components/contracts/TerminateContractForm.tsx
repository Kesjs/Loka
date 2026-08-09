"use client"

/**
 * TerminateContractForm
 * Form for terminating a contract and processing guarantee return
 * Handles deductions from guarantee amount
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Plus, Trash } from "@phosphor-icons/react"
import { Select } from "@/components/ui/select"

type FormData = {
  deductions: Array<{
    reason: string
    amount: number
    date: string
  }>
  notes?: string
}

interface TerminateContractFormProps {
  contractId: string
  currentTenant: { id: string; nom: string }
  currentProperty: { id: string; nom: string }
  guaranteeAmount: number
}

const deductionReasons = [
  { value: "cleaning", label: "Nettoyage" },
  { value: "damage", label: "Dommages" },
  { value: "unpaid_rent", label: "Loyer impayé" },
  { value: "other", label: "Autre" },
]

export function TerminateContractForm({
  contractId,
  currentTenant,
  currentProperty,
  guaranteeAmount,
}: TerminateContractFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [totalDeductions, setTotalDeductions] = useState(0)

  const form = useForm<FormData>({
    defaultValues: {
      deductions: [],
      notes: "",
    },
    mode: "onChange",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "deductions",
  })

  // Watch deductions to calculate total
  const deductionsValues = form.watch("deductions")
  const calculatedTotal = deductionsValues.reduce(
    (sum, d) => sum + (d.amount || 0),
    0
  )

  const returnAmount = guaranteeAmount - calculatedTotal

  async function onSubmit(data: FormData) {
    if (totalDeductions > guaranteeAmount) {
      setError(
        `Les déductions (${totalDeductions} FCFA) ne peuvent pas dépasser la garantie (${guaranteeAmount} FCFA)`
      )
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`/api/contracts/${contractId}/terminate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || "Erreur lors de la résiliation du contrat"
        )
      }

      router.push("/contrats")
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

      {/* Warning */}
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 space-y-2">
        <p className="text-sm font-medium text-yellow-900">
          ⚠️ Résiliation de contrat
        </p>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>
            <strong>Locataire:</strong> {currentTenant.nom}
          </p>
          <p>
            <strong>Propriété:</strong> {currentProperty.nom}
          </p>
          <p>
            <strong>Garantie détenue:</strong> {guaranteeAmount.toLocaleString()}{" "}
            FCFA
          </p>
        </div>
      </div>

      {/* Guarantee Summary */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-blue-900">Montant de la garantie</span>
            <span className="font-semibold text-blue-900">
              {guaranteeAmount.toLocaleString()} FCFA
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-900">Déductions</span>
            <span className="font-semibold text-orange-600">
              -{calculatedTotal.toLocaleString()} FCFA
            </span>
          </div>
          <div className="border-t border-blue-200 pt-2 flex justify-between">
            <span className="font-medium text-blue-900">À retourner</span>
            <span
              className={`font-bold text-lg ${
                returnAmount >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {returnAmount.toLocaleString()} FCFA
            </span>
          </div>
        </div>
      </div>

      {/* Deductions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-neutral-900">Déductions (optionnel)</h3>
          <button
            type="button"
            onClick={() =>
              append({
                reason: "other",
                amount: 0,
                date: new Date().toISOString().split("T")[0],
              })
            }
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            <Plus size={14} weight="bold" />
            Ajouter une déduction
          </button>
        </div>

        {fields.length > 0 && (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-lg border border-neutral-200 p-4 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Reason */}
                  <Controller
                    control={form.control}
                    name={`deductions.${index}.reason`}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        options={deductionReasons}
                      />
                    )}
                  />

                  {/* Amount */}
                  <Controller
                    control={form.control}
                    name={`deductions.${index}.amount`}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="number"
                        step="100"
                        placeholder="Montant"
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    )}
                  />

                  {/* Date */}
                  <Controller
                    control={form.control}
                    name={`deductions.${index}.date`}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    )}
                  />
                </div>

                {/* Remove button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="flex items-center gap-1 px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash size={14} weight="bold" />
                    Supprimer
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <Controller
        control={form.control}
        name="notes"
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              {...field}
              placeholder="Commentaires supplémentaires sur cette résiliation..."
              rows={3}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        )}
      />

      {/* Actions */}
      <div className="flex gap-2 border-t border-neutral-200 pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          <ArrowLeft size={16} weight="bold" />
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || returnAmount < 0}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Résiliation..." : "Résilier le contrat"}
          {!isSubmitting && <CheckCircle size={16} weight="fill" />}
        </button>
      </div>
    </form>
  )
}
