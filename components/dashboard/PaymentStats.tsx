/**
 * Payment Statistics Dashboard
 * Display payment metrics and analytics
 */

"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  containerVariants,
  itemVariants,
  StatCardSkeleton,
} from "@/components/animations"
import { usePaiementsStats } from "@/lib/hooks/usePaiements"
import { formatMontant } from "@/lib/utils"

interface PaymentStatsProps {
  proprietaireId: string
}

export function PaymentStats({ proprietaireId }: PaymentStatsProps) {
  const { data: stats, isLoading } = usePaiementsStats(proprietaireId)

  if (isLoading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div key={i} variants={itemVariants}>
            <StatCardSkeleton />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      label: "Revenu réalisé",
      value: formatMontant(stats.totalPaid, stats.currency || "FCFA"),
      subtext: `${stats.paymentCount} paiements`,
      color: "bg-green-50 border-green-200",
      icon: "💰",
    },
    {
      label: "Revenu attendu",
      value: formatMontant(stats.expectedRevenue, stats.currency || "FCFA"),
      subtext: `${stats.activeContracts} contrats actifs`,
      color: "bg-blue-50 border-blue-200",
      icon: "📊",
    },
    {
      label: "Taux de recouvrement",
      value: `${stats.collectionRate}%`,
      subtext:
        stats.collectionRate >= 90
          ? "Excellent"
          : stats.collectionRate >= 70
            ? "Bon"
            : "À améliorer",
      color:
        stats.collectionRate >= 90
          ? "bg-green-50 border-green-200"
          : stats.collectionRate >= 70
            ? "bg-yellow-50 border-yellow-200"
            : "bg-red-50 border-red-200",
      icon: "📈",
    },
    {
      label: "Manquant",
      value: formatMontant(
        stats.expectedRevenue - stats.totalPaid,
        stats.currency || "FCFA"
      ),
      subtext:
        stats.expectedRevenue - stats.totalPaid > 0
          ? "À récupérer"
          : "À jour",
      color:
        stats.expectedRevenue - stats.totalPaid > 0
          ? "bg-orange-50 border-orange-200"
          : "bg-green-50 border-green-200",
      icon: "⚠️",
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {statCards.map((stat, index) => (
        <motion.div key={index} variants={itemVariants}>
          <Card className={`border ${stat.color}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">{stat.subtext}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * Payment Method Breakdown
 */
interface PaymentMethodBreakdownProps {
  proprietaireId: string
}

export function PaymentMethodBreakdown({
  proprietaireId,
}: PaymentMethodBreakdownProps) {
  const { data: stats, isLoading } = usePaiementsStats(proprietaireId)

  if (isLoading || !stats) return null

  const byMode = stats.byMode || {}
  const total = Object.values(byMode).reduce((sum: number, val: any) => sum + val, 0)

  const methods = [
    { key: "cash", label: "Espèces" },
    { key: "mobile_money", label: "Mobile Money" },
    { key: "virement", label: "Virement" },
    { key: "cheque", label: "Chèque" },
  ]

  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 lg:grid-cols-3 gap-4"
    >
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Répartition par mode de paiement</CardTitle>
          <CardDescription>
            Paiements reçus ce mois-ci par méthode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {methods.map((method) => {
              const amount = byMode[method.key] || 0
              const percentage = total > 0 ? (amount / total) * 100 : 0

              return (
                <motion.div key={method.key} variants={itemVariants}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">
                        {method.label}
                      </span>
                      <span className="text-sm text-slate-600">
                        {formatMontant(amount, "FCFA")}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        className="bg-primary-600 h-2 rounded-full"
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="text-xs text-slate-500">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résumé du mois</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <motion.div variants={itemVariants} className="space-y-1">
            <p className="text-xs text-slate-600">Paiements reçus</p>
            <p className="text-lg font-bold text-slate-900">
              {stats.paymentCount}
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-1">
            <p className="text-xs text-slate-600">Montant total</p>
            <p className="text-lg font-bold text-green-600">
              {formatMontant(stats.totalPaid, "FCFA")}
            </p>
          </motion.div>
          <motion.div variants={itemVariants} className="space-y-1">
            <p className="text-xs text-slate-600">Taux</p>
            <p
              className={`text-lg font-bold ${
                stats.collectionRate >= 90
                  ? "text-green-600"
                  : stats.collectionRate >= 70
                    ? "text-yellow-600"
                    : "text-red-600"
              }`}
            >
              {stats.collectionRate}%
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
