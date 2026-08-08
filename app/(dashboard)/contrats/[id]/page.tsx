"use client"

/**
 * Contract Detail Page
 * Shows contract information with action buttons for renewal/termination
 */

import { useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Calendar,
  CurrencyCircleDollar,
  ShieldCheck,
  WarningCircle,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMontant, formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contractId = params.id as string

  const [contract, setContract] = useState<any>(null)
  const [guarantee, setGuarantee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()

        // Get contract details
        const { data: contractData, error: contractError } = await supabase
          .from("contrats")
          .select(
            `
            *,
            locataire:locataires(id, nom, email, telephone),
            logement:logements(id, nom, type),
            immeuble:immeubles(id, nom)
          `
          )
          .eq("id", contractId)
          .single()

        if (contractError) throw contractError

        setContract(contractData)

        // Get guarantee info
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-neutral-200 animate-pulse rounded-lg" />
          <div className="h-40 bg-neutral-200 animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error || !contract) {
    return (
      <div className="space-y-4">
        <Link
          href="/contrats"
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft size={16} weight="bold" />
          Retour aux contrats
        </Link>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error || "Contrat introuvable"}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusColors = {
    actif: "bg-green-100 text-green-800 border-green-300",
    termine: "bg-gray-100 text-gray-800 border-gray-300",
    resilie: "bg-red-100 text-red-800 border-red-300",
  }

  const statusLabels = {
    actif: "Actif",
    termine: "Terminé",
    resilie: "Résilié",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/contrats"
            className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 mb-3"
          >
            <ArrowLeft size={16} weight="bold" />
            Retour
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">
            {contract.locataire?.nom}
          </h1>
          <p className="text-neutral-600 mt-1">
            {contract.logement?.nom} • {contract.immeuble?.nom}
          </p>
        </div>
        <div
          className={`px-4 py-2 rounded-full border font-medium text-sm ${
            statusColors[contract.statut as keyof typeof statusColors]
          }`}
        >
          {statusLabels[contract.statut as keyof typeof statusLabels]}
        </div>
      </div>

      {/* Contract Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Loyer */}
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="rounded-lg bg-primary-100 p-2">
              <CurrencyCircleDollar size={20} className="text-primary-600" />
            </div>
            <CardTitle className="text-sm">Loyer mensuel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-neutral-900">
              {formatMontant(contract.loyer_mensuel)}
            </p>
          </CardContent>
        </Card>

        {/* Guarantee */}
        {guarantee && (
          <Card className="border-neutral-200">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <ShieldCheck size={20} className="text-blue-600" />
              </div>
              <CardTitle className="text-sm">Dépôt de garantie</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-neutral-900">
                {formatMontant(guarantee.amount)}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Status: <span className="font-medium">{guarantee.status}</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dates */}
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <Calendar size={20} className="text-orange-600" />
            </div>
            <CardTitle className="text-sm">Période</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-xs text-neutral-600">Début</p>
              <p className="font-semibold text-neutral-900">
                {formatDate(contract.date_debut)}
              </p>
            </div>
            {contract.date_fin && (
              <div>
                <p className="text-xs text-neutral-600">Fin</p>
                <p className="font-semibold text-neutral-900">
                  {formatDate(contract.date_fin)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Info */}
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <FileText size={20} className="text-purple-600" />
            </div>
            <CardTitle className="text-sm">Informations locataire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contract.locataire?.email && (
              <div>
                <p className="text-xs text-neutral-600">Email</p>
                <p className="text-sm text-neutral-900">
                  {contract.locataire.email}
                </p>
              </div>
            )}
            {contract.locataire?.telephone && (
              <div>
                <p className="text-xs text-neutral-600">Téléphone</p>
                <p className="text-sm text-neutral-900">
                  {contract.locataire.telephone}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {contract.statut === "actif" && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              Actions disponibles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link
                href={`/contrats/${contractId}/renew`}
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                <ArrowUpRight size={16} weight="bold" />
                Renouveler le contrat
              </Link>
              <Link
                href={`/contrats/${contractId}/terminate`}
                className="inline-flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                <ArrowDownLeft size={16} weight="bold" />
                Résilier le contrat
              </Link>
            </div>

            {guarantee && guarantee.status === "held" && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <p className="text-sm text-yellow-900">
                  ℹ️ Garantie détenue: {formatMontant(guarantee.amount)}. Elle
                  sera traitée lors de la résiliation du contrat.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guarantee Return Info (if terminated) */}
      {guarantee && guarantee.status !== "held" && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              Garantie traitée
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-green-700 font-medium">Montant initial</p>
                <p className="text-lg font-bold text-green-900">
                  {formatMontant(guarantee.amount)}
                </p>
              </div>
              {guarantee.deductions && guarantee.deductions.length > 0 && (
                <div>
                  <p className="text-orange-700 font-medium">Déductions</p>
                  <p className="text-lg font-bold text-orange-900">
                    -
                    {formatMontant(
                      guarantee.deductions.reduce(
                        (sum: number, d: any) => sum + d.amount,
                        0
                      )
                    )}
                  </p>
                </div>
              )}
              <div>
                <p className="text-green-700 font-medium">À retourner</p>
                <p className="text-lg font-bold text-green-900">
                  {formatMontant(
                    guarantee.amount -
                      (guarantee.deductions?.reduce(
                        (sum: number, d: any) => sum + d.amount,
                        0
                      ) || 0)
                  )}
                </p>
              </div>
            </div>

            {guarantee.deductions && guarantee.deductions.length > 0 && (
              <div className="rounded-lg bg-white border border-green-200 p-3">
                <p className="text-sm font-medium text-green-900 mb-2">
                  Déductions appliquées:
                </p>
                <ul className="space-y-1 text-sm text-green-800">
                  {guarantee.deductions.map((d: any, i: number) => (
                    <li key={i}>
                      • {d.reason}: {formatMontant(d.amount)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {guarantee.notes && (
              <div className="rounded-lg bg-white border border-green-200 p-3">
                <p className="text-sm font-medium text-green-900 mb-1">Notes:</p>
                <p className="text-sm text-green-800">{guarantee.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
