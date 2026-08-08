"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RenewContractForm } from "@/components/contracts/RenewContractForm"
import { createClient } from "@/lib/supabase/client"

export default function RenewContractPage() {
  const params = useParams()
  const contractId = params.id as string

  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()

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
          <p className="text-sm font-medium text-primary-600">Renouvellement</p>
          <h1 className="text-2xl font-semibold text-neutral-900">
            Renouveler le contrat
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Créez un nouveau contrat pour continuer la location
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
            <div className="rounded-2xl bg-blue-50 p-2.5 text-blue-600">
              <ArrowUpRight size={20} weight="bold" />
            </div>
            <div>
              <CardTitle>Renouvellement de contrat</CardTitle>
              <p className="text-sm text-neutral-500 mt-1">
                Mise à jour du loyer, de la garantie et des dates
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <RenewContractForm
            contractId={contractId}
            currentTenant={contract.locataire}
            currentProperty={contract.logement}
            currentRent={contract.loyer_mensuel}
            currentGuarantee={contract.depot_garantie}
            currentEndDate={contract.date_fin}
          />
        </CardContent>
      </Card>
    </div>
  )
}
