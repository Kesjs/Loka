/**
 * components/dashboard/DashboardGestionnaire.tsx
 * 
 * Dashboard pour un gestionnaire (profil: "gestionnaire")
 * Affiche : stats personnelles + portefeuille gérés, clients, paiements
 */

"use client";

import type { DashboardData } from "@/lib/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { StatsGrid } from "./StatsGrid";
import { RecentPayments } from "./RecentPayments";
import { ExpiringContracts } from "./ExpiringContracts";

export interface DashboardGestionnaireProps {
  dashboard: DashboardData;
}

export function DashboardGestionnaire({ dashboard }: DashboardGestionnaireProps) {
  return (
    <div className="space-y-8">
      {/* Header avec greeting */}
      <DashboardHeader
        userName={dashboard.userName}
        greeting="Tableau de bord de gestion de portefeuille"
      />

      {/* Statistiques - portefeuille personnel + gérés */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Vue d'ensemble du portefeuille</h2>
        <StatsGrid stats={dashboard.stats} />
      </div>

      {/* Section Finances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements récents */}
        <RecentPayments payments={dashboard.recentPayments} />

        {/* Contrats expirant */}
        <ExpiringContracts contracts={dashboard.expiringContracts} />
      </div>

      {/* Section Clients Gérés - Placeholder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Clients Gérés</h3>
        <p className="text-blue-800 text-sm mb-4">
          Consulter la liste détaillée de vos clients et de leurs propriétés
        </p>
        <a
          href="/proprietaires"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Voir les clients
        </a>
      </div>

      {/* Section CTA */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
        <p className="text-neutral-600 mb-4">
          Portefeuille : {dashboard.stats.nombreImmeubles} immeuble{dashboard.stats.nombreImmeubles > 1 ? "s" : ""} •{" "}
          {dashboard.stats.nombreLogements} logement{dashboard.stats.nombreLogements > 1 ? "s" : ""}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="/immeubles/new"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Ajouter un bien
          </a>
          <a
            href="/proprietaires/new"
            className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition"
          >
            Ajouter un client
          </a>
        </div>
      </div>
    </div>
  );
}
