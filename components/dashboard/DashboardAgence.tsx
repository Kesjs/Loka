/**
 * components/dashboard/DashboardAgence.tsx
 * 
 * Dashboard pour une agence immobilière (profil: "agence")
 * Affiche : stats du portefeuille global, gestion équipe, clients, paiements
 */

"use client";

import type { DashboardData } from "@/lib/dashboard";
import { DashboardHeader } from "./DashboardHeader";
import { StatsGrid } from "./StatsGrid";
import { RecentPayments } from "./RecentPayments";
import { ExpiringContracts } from "./ExpiringContracts";

export interface DashboardAgenceProps {
  dashboard: DashboardData;
}

export function DashboardAgence({ dashboard }: DashboardAgenceProps) {
  return (
    <div className="space-y-8">
      {/* Header avec greeting */}
      <DashboardHeader
        userName={dashboard.userName}
        greeting="Tableau de bord agence immobilière"
      />

      {/* Statistiques globales de l'agence */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Vue d'ensemble de l'agence</h2>
        <StatsGrid stats={dashboard.stats} />
      </div>

      {/* Section Finances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Paiements récents */}
        <RecentPayments payments={dashboard.recentPayments} />

        {/* Contrats expirant */}
        <ExpiringContracts contracts={dashboard.expiringContracts} />
      </div>

      {/* Section Gestion - Clients & Équipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clients */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="font-semibold text-purple-900 mb-2">Clients</h3>
          <p className="text-purple-800 text-sm mb-4">
            Gérez vos clients propriétaires et leurs propriétés
          </p>
          <a
            href="/proprietaires"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Voir les clients
          </a>
        </div>

        {/* Équipe */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">Équipe</h3>
          <p className="text-green-800 text-sm mb-4">
            Gérez votre équipe interne et leurs permissions
          </p>
          <a
            href="/equipe"
            className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Voir l'équipe
          </a>
        </div>
      </div>

      {/* Section CTA */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 text-center">
        <p className="text-neutral-600 mb-4">
          Portefeuille agence : {dashboard.stats.nombreImmeubles} immeuble{dashboard.stats.nombreImmeubles > 1 ? "s" : ""} •{" "}
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
