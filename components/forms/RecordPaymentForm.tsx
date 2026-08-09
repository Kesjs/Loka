/**
 * Record Payment Form
 * Form for recording new payments with validation
 */

"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { useRecordPaiement } from "@/lib/hooks/usePaiements"
import {
  SuccessState,
  ErrorState,
  containerVariants,
  itemVariants,
} from "@/components/animations"
import { Spinner } from "@/components/animations"
import { Select } from "@/components/ui/select"

interface RecordPaymentFormProps {
  proprietaireId: string
  onSuccess?: () => void
}

export function RecordPaymentForm({
  proprietaireId,
  onSuccess,
}: RecordPaymentFormProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    contrat_id: "",
    montant: "",
    date_paiement: "",
    periode_debut: "",
    periode_fin: "",
    mode: "cash",
    notes: "",
  })

  const mutation = useRecordPaiement(proprietaireId)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.contrat_id) newErrors.contrat_id = "ID contrat requis"
    if (!formData.montant || parseFloat(formData.montant) <= 0)
      newErrors.montant = "Montant doit être positif"
    if (!formData.date_paiement) newErrors.date_paiement = "Date requise"
    if (!formData.periode_debut) newErrors.periode_debut = "Date requise"
    if (!formData.periode_fin) newErrors.periode_fin = "Date requise"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await mutation.mutateAsync({
        contrat_id: formData.contrat_id,
        montant: parseFloat(formData.montant),
        date_paiement: formData.date_paiement as any,
        periode_debut: formData.periode_debut as any,
        periode_fin: formData.periode_fin as any,
        mode: formData.mode as any,
        notes: formData.notes || undefined,
      })

      setShowSuccess(true)
      setFormData({
        contrat_id: "",
        montant: "",
        date_paiement: "",
        periode_debut: "",
        periode_fin: "",
        mode: "cash",
        notes: "",
      })
      onSuccess?.()

      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Payment recording error:", error)
    }
  }

  if (showSuccess) {
    return (
      <SuccessState
        title="Paiement enregistré"
        description="Le paiement a été enregistré avec succès."
      />
    )
  }

  if (mutation.error) {
    return (
      <ErrorState
        title="Erreur d'enregistrement"
        description={
          mutation.error instanceof Error
            ? mutation.error.message
            : "Une erreur est survenue"
        }
        retry={() => mutation.reset()}
      />
    )
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6 bg-white p-6 rounded-lg border border-slate-200"
    >
      <motion.h2 variants={itemVariants} className="text-lg font-semibold">
        Enregistrer un paiement
      </motion.h2>

      {/* Contract ID */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label htmlFor="contrat_id" className="block text-sm font-medium">
          Contrat *
        </label>
        <input
          id="contrat_id"
          type="text"
          name="contrat_id"
          placeholder="UUID du contrat"
          value={formData.contrat_id}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.contrat_id && (
          <p className="text-sm text-red-600">{errors.contrat_id}</p>
        )}
      </motion.div>

      {/* Amount */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label htmlFor="montant" className="block text-sm font-medium">
          Montant (FCFA) *
        </label>
        <input
          id="montant"
          type="number"
          name="montant"
          placeholder="0.00"
          step="0.01"
          value={formData.montant}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.montant && (
          <p className="text-sm text-red-600">{errors.montant}</p>
        )}
      </motion.div>

      {/* Payment Date */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label htmlFor="date_paiement" className="block text-sm font-medium">
          Date du paiement *
        </label>
        <input
          id="date_paiement"
          type="date"
          name="date_paiement"
          value={formData.date_paiement}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.date_paiement && (
          <p className="text-sm text-red-600">{errors.date_paiement}</p>
        )}
      </motion.div>

      {/* Period Start */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label htmlFor="periode_debut" className="block text-sm font-medium">
          Période (début) *
        </label>
        <input
          id="periode_debut"
          type="date"
          name="periode_debut"
          value={formData.periode_debut}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.periode_debut && (
          <p className="text-sm text-red-600">{errors.periode_debut}</p>
        )}
      </motion.div>

      {/* Period End */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label htmlFor="periode_fin" className="block text-sm font-medium">
          Période (fin) *
        </label>
        <input
          id="periode_fin"
          type="date"
          name="periode_fin"
          value={formData.periode_fin}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {errors.periode_fin && (
          <p className="text-sm text-red-600">{errors.periode_fin}</p>
        )}
      </motion.div>

      {/* Payment Mode */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label className="block text-sm font-medium">
          Mode de paiement *
        </label>
        <Select
          value={formData.mode}
          onChange={(value) => {
            setFormData((prev) => ({ ...prev, mode: value as string }))
            if (errors.mode) {
              setErrors((prev) => ({ ...prev, mode: "" }))
            }
          }}
          options={[
            { value: "cash", label: "Espèces" },
            { value: "mobile_money", label: "Mobile Money" },
            { value: "virement", label: "Virement bancaire" },
            { value: "cheque", label: "Chèque" },
          ]}
        />
      </motion.div>

      {/* Notes */}
      <motion.div variants={itemVariants} className="space-y-2">
        <label htmlFor="notes" className="block text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Notes additionnelles (optionnel)"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={itemVariants} className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Spinner size="sm" />
              Enregistrement...
            </>
          ) : (
            "Enregistrer le paiement"
          )}
        </button>
      </motion.div>
    </motion.form>
  )
}
