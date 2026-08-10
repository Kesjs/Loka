import {
  PageTransition,
  HeaderSkeleton,
  StatCardsSkeleton,
  TableSkeleton,
} from "@/components/animations";
import { getDashboardData } from "@/lib/dashboard";
import { Suspense } from "react";
import { DashboardIndividuel } from "@/components/dashboard/DashboardIndividuel";
import { DashboardGestionnaire } from "@/components/dashboard/DashboardGestionnaire";
import { DashboardAgence } from "@/components/dashboard/DashboardAgence";

async function DashboardContent() {
  const dashboard = await getDashboardData();
  
  if (!dashboard) {
    return <div>Erreur : impossible de charger le dashboard</div>;
  }

  const profile = dashboard.profile;

  return (
    <PageTransition className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-900">
          Bienvenue, {dashboard.userName}
        </h1>
        <p className="text-neutral-600">
          {profile === "individuel" && "Gérez votre portefeuille immobilier"}
          {profile === "gestionnaire" && "Gérez votre portefeuille de clients"}
          {profile === "agence" && "Tableau de bord de votre agence"}
        </p>
      </div>

      {profile === "individuel" && (
        <DashboardIndividuel dashboard={dashboard} />
      )}
      {profile === "gestionnaire" && (
        <DashboardGestionnaire dashboard={dashboard} />
      )}
      {profile === "agence" && <DashboardAgence dashboard={dashboard} />}
    </PageTransition>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <HeaderSkeleton />
          <StatCardsSkeleton count={4} />
          <TableSkeleton count={5} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
