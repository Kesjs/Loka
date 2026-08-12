/**
 * components/dashboard/DashboardGestionnaire.tsx
 *
 * Dashboard pour un gestionnaire (profil: "gestionnaire")
 * Affiche : stats de portefeuille, reversements en attente mis en évidence,
 * mini-tableau réel des propriétaires gérés (remplace l'ancien CTA vide).
 */

"use client";

import { ArrowsLeftRight } from "@phosphor-icons/react";
import type { DashboardData } from "@/lib/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { StatsGrid } from "./StatsGrid";
import { RecentPayments } from "./RecentPayments";
import { ExpiringContracts } from "./ExpiringContracts";
import { OwnersMiniTable } from "./OwnersMiniTable";
import { RevenueBarChart } from "./RevenueBarChart";
import { OccupancyRingChart } from "./OccupancyRingChart";
import { CollectionGaugeChart } from "./CollectionGaugeChart";

export interface DashboardGestionnaireProps {
  dashboard: DashboardData;
}

export function DashboardGestionnaire({ dashboard }: DashboardGestionnaireProps) {
  const enAttente = dashboard.proprietairesGeres.filter((p) => p.statut === "en_retard");
  const montantEnAttente = enAttente.reduce((sum, p) => sum + p.montantDu, 0);

  return (
    <div className="space-y-8">
      {/* Header avec greeting */}
      <DashboardHeader
        userName={dashboard.userName}
        greeting="Tableau de bord de gestion de portefeuille"
      />

      {/* Reversements en attente — mis en évidence, pas noyé dans une page à part */}
      {enAttente.length > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-accent-200 bg-accent-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-100">
            <ArrowsLeftRight size={20} weight="fill" className="text-accent-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-accent-900">
              {enAttente.length} reversement{enAttente.length > 1 ? "s" : ""} en attente
            </p>
            <p className="text-sm text-accent-700">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(montantEnAttente)}{" "}
              à reverser au total
            </p>
          </div>
          <a
            href="/reversements"
            className="shrink-0 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-700"
          >
            Traiter
          </a>
        </div>
      )}

      {/* Statistiques - portefeuille personnel + géré */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Vue d'ensemble du portefeuille</h2>
        <StatsGrid stats={dashboard.stats} role="gestionnaire" />
      </div>

      {/* Graphiques — revenus, occupation, recouvrement */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CollectionGaugeChart
          aJour={dashboard.stats.loyersAJour}
          enRetard={dashboard.stats.loyersEnRetard}
        />
        <RevenueBarChart data={dashboard.revenueHistory} />
        <OccupancyRingChart
          occupes={dashboard.stats.logementsOccupes}
          vacants={dashboard.stats.logementsVacants}
        />
      </div>

      {/* Section Finances */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentPayments payments={dashboard.recentPayments} />
        <ExpiringContracts contracts={dashboard.expiringContracts} />
      </div>

      {/* Mini-tableau réel des propriétaires gérés */}
      <OwnersMiniTable proprietaires={dashboard.proprietairesGeres} title="Propriétaires gérés" />

      {/* Section CTA */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="mb-4 text-neutral-600">
          Portefeuille : {dashboard.stats.nombreImmeubles} immeuble{dashboard.stats.nombreImmeubles > 1 ? "s" : ""} •{" "}
          {dashboard.stats.nombreLogements} logement{dashboard.stats.nombreLogements > 1 ? "s" : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="/immeubles/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-white transition hover:bg-primary-700"
          >
            Ajouter un bien
          </a>
          <a
            href="/proprietaires/new"
            className="rounded-lg bg-neutral-200 px-4 py-2 text-neutral-900 transition hover:bg-neutral-300"
          >
            Ajouter un propriétaire
          </a>
        </div>
      </div>
    </div>
  );
}
