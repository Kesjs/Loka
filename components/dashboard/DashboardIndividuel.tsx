/**
 * components/dashboard/DashboardIndividuel.tsx
 * 
 * Dashboard pour un propriétaire individuel (profil: "proprietaire")
 * Affiche : stats personnelles, paiements récents, contrats expirants
 */

"use client";

import type { DashboardData } from "@/lib/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { StatsGrid } from "./StatsGrid";
import { RecentPayments } from "./RecentPayments";
import { ExpiringContracts } from "./ExpiringContracts";

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

      {/* Statistiques principales */}
      <StatsGrid stats={dashboard.stats} />

      {/* Section Finances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements récents */}
        <RecentPayments payments={dashboard.recentPayments} />

        {/* Contrats expirant */}
        <ExpiringContracts contracts={dashboard.expiringContracts} />
      </div>

      {/* Section CTA */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
        <p className="text-neutral-600 mb-4">
          Vous gérez {dashboard.stats.nombreImmeubles} immeuble{dashboard.stats.nombreImmeubles > 1 ? "s" : ""} avec{" "}
          {dashboard.stats.nombreLogements} logement{dashboard.stats.nombreLogements > 1 ? "s" : ""}
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/immeubles/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Ajouter un immeuble
          </a>
          <a
            href="/logements/new"
            className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition"
          >
            Ajouter un logement
          </a>
        </div>
      </div>
    </div>
  );
}
