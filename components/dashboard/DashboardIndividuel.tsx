/**
 * components/dashboard/DashboardIndividuel.tsx
 *
 * Dashboard pour un propriétaire individuel (profil: "proprietaire")
 * Affiche : stats personnelles (dont loyers en retard, écart revenu),
 * paiements récents, contrats expirants.
 */

"use client";

import type { DashboardData } from "@/lib/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { StatsGrid } from "./StatsGrid";
import { RecentPayments } from "./RecentPayments";
import { ExpiringContracts } from "./ExpiringContracts";
import { RevenueBarChart } from "./RevenueBarChart";
import { OccupancyRingChart } from "./OccupancyRingChart";
import { CollectionGaugeChart } from "./CollectionGaugeChart";

export interface DashboardIndividuelProps {
  dashboard: DashboardData;
}

export function DashboardIndividuel({ dashboard }: DashboardIndividuelProps) {
  return (
    <div className="space-y-8">
      {/* Header avec greeting */}
      <DashboardHeader
        userName={dashboard.userName}
        greeting="Bienvenue dans votre espace de gestion immobilière"
      />

      {/* Statistiques principales, adaptées au rôle Propriétaire */}
      <StatsGrid stats={dashboard.stats} role="individuel" />

      {/* Graphiques — revenus, occupation, recouvrement (3 cartes égales, comme le modèle) */}
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
        {/* Paiements récents */}
        <RecentPayments payments={dashboard.recentPayments} />

        {/* Contrats expirant */}
        <ExpiringContracts contracts={dashboard.expiringContracts} />
      </div>

      {/* Section CTA */}
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 text-center">
        <p className="mb-4 text-neutral-600">
          Vous gérez {dashboard.stats.nombreImmeubles} immeuble{dashboard.stats.nombreImmeubles > 1 ? "s" : ""} avec{" "}
          {dashboard.stats.nombreLogements} logement{dashboard.stats.nombreLogements > 1 ? "s" : ""}
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="/immeubles/new"
            className="rounded-lg bg-primary-600 px-4 py-2 text-white transition hover:bg-primary-700"
          >
            Ajouter un immeuble
          </a>
          <a
            href="/logements/new"
            className="rounded-lg bg-neutral-200 px-4 py-2 text-neutral-900 transition hover:bg-neutral-300"
          >
            Ajouter un logement
          </a>
        </div>
      </div>
    </div>
  );
}
