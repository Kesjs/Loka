"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowDownLeft } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TerminateContractForm } from "@/components/contracts/TerminateContractForm"
import { createClient } from "@/lib/supabase/client"

export default function TerminateContractPage() {
  const params = useParams()
  const contractId = params.id as string

  const [contract, setContract] = useState<any>(null)
  const [guarantee, setGuarantee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()

        // Get contract
        const { data: contractData, error: contractError } = await supabase
          .from("contrats")
          .select(
            `
            *,
            locataire:locataires(id, nom),
            logement:logements(id, nom)
          `
          )
          .eq("id", contractId)
          .single()

        if (contractError) throw contractError

        setContract(contractData)

        // Get guarantee
        const { data: guaranteeData } = await supabase
          .from("garanties")
          .select("*")
          .eq("contrat_id", contractId)
          .single()

        setGuarantee(guaranteeData)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement du contrat"
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [contractId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-neutral-200 animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="space-y-4">
        <Link
          href={`/contrats/${contractId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft size={16} weight="bold" />
          Retour au contrat
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error || "Contrat introuvable"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-red-600">Résiliation</p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Résilier le contrat
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Terminez la location et traitez la garantie
          </p>
        </div>
        <Link
          href={`/contrats/${contractId}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800"
        >
          <ArrowLeft size={16} weight="bold" />
          Annuler
        </Link>
      </div>

      {/* Card */}
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-50 p-2.5 text-red-600">
              <ArrowDownLeft size={20} weight="bold" />
            </div>
            <div>
              <CardTitle>Résiliation du contrat</CardTitle>
              <p className="text-sm text-neutral-500 mt-1">
                Gestion des déductions et retour de garantie
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {guarantee ? (
            <TerminateContractForm
              contractId={contractId}
              currentTenant={contract.locataire}
              currentProperty={contract.logement}
              guaranteeAmount={guarantee.amount}
            />
          ) : (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ Aucune garantie enregistrée pour ce contrat. Vous pouvez quand
                même résilier le contrat.
              </p>
              <TerminateContractForm
                contractId={contractId}
                currentTenant={contract.locataire}
                currentProperty={contract.logement}
                guaranteeAmount={0}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
