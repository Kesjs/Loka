/**
 * components/dashboard/DashboardAgence.tsx
 *
 * Dashboard pour une agence immobilière (profil: "agence")
 * Affiche : stats du portefeuille global, mini-tableau propriétaires agrégé,
 * aperçu équipe réel (qui gère quoi), alerte sur reversements en dépassement.
 */

"use client";

import { WarningCircle } from "@phosphor-icons/react";
import type { DashboardData } from "@/lib/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { StatsGrid } from "./StatsGrid";
import { RecentPayments } from "./RecentPayments";
import { ExpiringContracts } from "./ExpiringContracts";
import { OwnersMiniTable } from "./OwnersMiniTable";
import { TeamOverview } from "./TeamOverview";
import { RevenueBarChart } from "./RevenueBarChart";
import { OccupancyRingChart } from "./OccupancyRingChart";
import { CollectionGaugeChart } from "./CollectionGaugeChart";

export interface DashboardAgenceProps {
  dashboard: DashboardData;
}

export function DashboardAgence({ dashboard }: DashboardAgenceProps) {
  return (
    <div className="space-y-8">
      {/* Header avec greeting */}
      <DashboardHeader userName={dashboard.userName} greeting="Tableau de bord agence immobilière" />

      {/* Alerte reversements en dépassement du délai promis */}
      {dashboard.reversementsEnDepassement > 0 && (
        <div className="flex items-center gap-4 rounded-lg border border-danger-500/30 bg-danger-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-50">
            <WarningCircle size={20} weight="fill" className="text-danger-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger-600">
              {dashboard.reversementsEnDepassement} reversement{dashboard.reversementsEnDepassement > 1 ? "s" : ""} au-delà du délai promis
            </p>
            <p className="text-sm text-danger-700">Vos propriétaires attendent leur versement depuis plus de 30 jours.</p>
          </div>
          <a
            href="/reversements"
            className="shrink-0 rounded-lg bg-danger-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-danger-700"
          >
            Traiter
          </a>
        </div>
      )}

      {/* Statistiques globales de l'agence */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Vue d'ensemble de l'agence</h2>
        <StatsGrid stats={dashboard.stats} role="agence" />
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

      {/* Section Gestion - Propriétaires & Équipe, contenu réel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OwnersMiniTable proprietaires={dashboard.proprietairesGeres} title="Propriétaires du portefeuille" />
        <TeamOverview equipe={dashboard.equipe} />
      </div>

      {/* Section CTA */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="mb-4 text-neutral-600">
          Portefeuille agence : {dashboard.stats.nombreImmeubles} immeuble{dashboard.stats.nombreImmeubles > 1 ? "s" : ""} •{" "}
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
