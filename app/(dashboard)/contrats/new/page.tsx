"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Handshake } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateContractForm } from "@/components/contracts/CreateContractForm"
import { createClient } from "@/lib/supabase/client"

export default function NewContractPage() {
  const supabase = createClient()
  const [tenants, setTenants] = useState<Array<{ id: string; nom: string }>>([])
  const [properties, setProperties] = useState<
    Array<{ id: string; nom: string; immeuble_nom: string }>
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadData() {
      try {
        // Get all tenants
        const { data: tenantsData, error: tenantsError } = await supabase
          .from("locataires")
          .select("id, nom")
          .order("nom", { ascending: true })

        if (tenantsError) throw tenantsError

        // Get all properties with building names
        const { data: propertiesData, error: propertiesError } = await supabase
          .from("logements")
          .select(
            `
            id,
            nom,
            immeuble:immeubles(nom)
          `
          )
          .order("nom", { ascending: true })

        if (propertiesError) throw propertiesError

        setTenants(tenantsData || [])
        setProperties(
          (propertiesData || []).map((p: any) => ({
            id: p.id,
            nom: p.nom,
            immeuble_nom: p.immeuble?.nom || "Unknown",
          }))
        )
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des données"
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  const noResources = !tenants.length || !properties.length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Nouveau contrat</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Créer un bail</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Associez un locataire à un logement et formalisez la location.
          </p>
        </div>
        <Link
          href="/contrats"
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
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <Handshake size={20} weight="bold" />
            </div>
            <div>
              <CardTitle>Informations du contrat</CardTitle>
              <p className="text-sm text-neutral-500 mt-1">
                Remplissez les détails étape par étape
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin">⟳</div>
              <p className="text-neutral-600 mt-2">Chargement...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
              {error}
            </div>
          ) : noResources ? (
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-6 text-sm text-neutral-600">
              <p className="mb-4">
                Vous devez d'abord ajouter des locataires et des logements.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/locataires/new"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Ajouter un locataire →
                </Link>
                <Link
                  href="/logements/new"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700"
                >
                  Ajouter un logement →
                </Link>
              </div>
            </div>
          ) : (
            <CreateContractForm tenants={tenants} properties={properties} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
