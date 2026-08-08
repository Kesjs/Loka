"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Download, Eye } from "@phosphor-icons/react/dist/ssr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PageTransition,
  containerVariants,
  itemVariants,
  TableSkeleton,
  NoPaymentsEmpty,
} from "@/components/animations"
import { Pagination } from "@/components/ui/Pagination"
import { usePaiements } from "@/lib/hooks/usePaiements"
import { formatMontant, formatDate } from "@/lib/utils"
import { useAuth } from "@/lib/hooks/useAuth"
import Link from "next/link"

interface PaiementWithRelations {
  id: string
  contrat_id: string
  montant: number
  date_paiement: string
  periode_debut: string
  periode_fin: string
  mode: "cash" | "mobile_money" | "virement" | "cheque"
  quittance_url?: string
  notes?: string
  locataire_nom?: string
  logement_nom?: string | null
}

export default function PaiementsPage() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const { user } = useAuth()

  const { data, isLoading, error } = usePaiements(
    user?.id || "",
    page,
    pageSize
  )

  if (!user?.id) {
    return <div>Loading...</div>
  }

  if (error) {
    return (
      <PageTransition>
        <motion.div variants={itemVariants} className="text-center py-12">
          <p className="text-red-600">Erreur lors du chargement des paiements</p>
        </motion.div>
      </PageTransition>
    )
  }

  if (isLoading) {
    return <TableSkeleton count={pageSize} />
  }

  if (!data || data.data.length === 0) {
    return <NoPaymentsEmpty />
  }

  const totalPages = Math.ceil(data.total / pageSize)

  return (
    <PageTransition className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-neutral-900">Paiements</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Gérez et consultez tous les paiements enregistrés
        </p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link
          href="/paiements/new"
          className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Nouveau paiement
        </Link>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements</CardTitle>
            <CardDescription>
              {data.total} paiement(s) au total
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className="overflow-x-auto"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Locataire</TableHead>
                    <TableHead>Logement</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                >
                  {data.data.map((paiement: any) => (
                    <motion.tr
                      key={paiement.id}
                      variants={itemVariants}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {paiement.locataire_nom || "—"}
                      </TableCell>
                      <TableCell>{paiement.logement_nom || "—"}</TableCell>
                      <TableCell className="font-semibold text-neutral-900">
                        {formatMontant(paiement.montant, "FCFA")}
                      </TableCell>
                      <TableCell>{formatDate(paiement.date_paiement)}</TableCell>
                      <TableCell className="text-sm text-neutral-500">
                        {formatDate(paiement.periode_debut)} →{" "}
                        {formatDate(paiement.periode_fin)}
                      </TableCell>
                      <TableCell className="capitalize">
                        <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                          {paiement.mode.replace("_", " ")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <button
                            className="p-2 hover:bg-slate-100 rounded transition-colors"
                            title="Voir le détail"
                          >
                            <Eye size={16} className="text-slate-600" />
                          </button>
                          <button
                            className="p-2 hover:bg-slate-100 rounded transition-colors"
                            title="Télécharger la quittance"
                          >
                            <Download size={16} className="text-slate-600" />
                          </button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </Table>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 pt-6 border-t">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </PageTransition>
  )
}
