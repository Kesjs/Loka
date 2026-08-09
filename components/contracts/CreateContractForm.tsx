"use client"

/**
 * CreateContractForm
 * Multi-step form for creating contracts
 * Step 1: Select tenant
 * Step 2: Select property
 * Step 3: Enter contract details (rent, guarantee, dates)
 */

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, CheckCircle } from "@phosphor-icons/react"
import { Select } from "@/components/ui/select"

type FormData = {
  locataire_id: string
  logement_id: string
  loyer_mensuel: number
  depot_garantie: number
  date_debut: string
  date_fin?: string
}

interface CreateContractFormProps {
  tenants: Array<{ id: string; nom: string }>
  properties: Array<{ id: string; nom: string; immeuble_nom: string }>
}

export function CreateContractForm({
  tenants,
  properties,
}: CreateContractFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const form = useForm<FormData>({
    mode: "onChange",
  })

  const selectedTenantId = form.watch("locataire_id")
  const selectedPropertyId = form.watch("logement_id")

  async function onSubmit(data: FormData) {
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/contracts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || "Erreur lors de la création du contrat"
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

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
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

      {/* Progress Steps */}
      <div className="flex justify-between items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1 flex items-center gap-2">
            <motion.div
              animate={{
                backgroundColor:
                  step >= s ? "rgb(59, 130, 246)" : "rgb(229, 231, 235)",
              }}
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            >
              {step > s ? (
                <CheckCircle size={20} weight="fill" />
              ) : (
                s
              )}
            </motion.div>
            <span className="text-xs font-medium text-neutral-600 hidden sm:block">
              {s === 1 ? "Locataire" : s === 2 ? "Propriété" : "Détails"}
            </span>
            {s < 3 && (
              <div
                className={`flex-1 h-1 rounded-full ${
                  step > s ? "bg-blue-500" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Sélectionner un locataire
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Choisissez le locataire pour ce contrat
              </p>
            </div>

            <Controller
              control={form.control}
              name="locataire_id"
              render={({ field, fieldState: { error } }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "", label: "-- Sélectionner un locataire --" },
                    ...tenants.map((tenant) => ({
                      value: tenant.id,
                      label: tenant.nom,
                    })),
                  ]}
                />
              )}
            />

            <button
              type="button"
              onClick={() => {
                if (selectedTenantId) setStep(2)
              }}
              disabled={!selectedTenantId}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
            >
              Suivant
              <ArrowRight size={16} weight="bold" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Sélectionner une propriété
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Choisissez le logement pour ce contrat
              </p>
            </div>

            <Controller
              control={form.control}
              name="logement_id"
              render={({ field, fieldState: { error } }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { value: "", label: "-- Sélectionner une propriété --" },
                    ...properties.map((prop) => ({
                      value: prop.id,
                      label: `${prop.nom} (${prop.immeuble_nom})`,
                    })),
                  ]}
                />
              )}
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 border border-neutral-300 hover:bg-neutral-50 text-neutral-900 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} weight="bold" />
                Retour
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedPropertyId) setStep(3)
                }}
                disabled={!selectedPropertyId}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                Suivant
                <ArrowRight size={16} weight="bold" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                Détails du contrat
              </h3>
              <p className="text-sm text-neutral-500 mb-4">
                Remplissez les informations du contrat
              </p>
            </div>

            {/* Loyer Mensuel */}
            <Controller
              control={form.control}
              name="loyer_mensuel"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Loyer mensuel (FCFA)
                  </label>
                  <input
                    {...field}
                    type="number"
                    step="1000"
                    placeholder="0"
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

            {/* Dépôt de garantie */}
            <Controller
              control={form.control}
              name="depot_garantie"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Dépôt de garantie (FCFA)
                  </label>
                  <input
                    {...field}
                    type="number"
                    step="1000"
                    placeholder="0"
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

            {/* Date début */}
            <Controller
              control={form.control}
              name="date_debut"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Date de début
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

            {/* Date fin (optional) */}
            <Controller
              control={form.control}
              name="date_fin"
              render={({ field, fieldState: { error } }) => (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Date de fin (optionnel)
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(2)}
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
                {isSubmitting ? "Création..." : "Créer le contrat"}
                {!isSubmitting && <CheckCircle size={16} weight="fill" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
