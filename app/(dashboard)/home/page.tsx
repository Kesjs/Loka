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
import { OnboardingIncompleteAlert } from "@/components/dashboard/OnboardingIncompleteAlert";

async function DashboardContent() {
  const dashboard = await getDashboardData();
  
  // Gestion d'erreur avec message explicite
  if (!dashboard) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-100 mx-auto">
            <svg className="h-8 w-8 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Impossible de charger le dashboard
            </h2>
            <p className="text-sm text-neutral-600 mb-4">
              Une erreur s'est produite lors du chargement de vos données. Cela peut être dû à un problème de connexion ou de configuration.
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <a
              href="/home"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Réessayer
            </a>
            <a
              href="/onboarding"
              className="px-4 py-2 bg-neutral-200 text-neutral-900 rounded-lg hover:bg-neutral-300 transition"
            >
              Reconfigurer
            </a>
          </div>
        </div>
      </div>
    );
  }

  const profile = dashboard.profile;

  // Vérification de cohérence du profil
  if (!profile || !["individuel", "gestionnaire", "agence"].includes(profile)) {
    console.error("⚠️ Profil d'organisation invalide:", profile);
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-bold text-neutral-900">Profil non reconnu</h2>
          <p className="text-sm text-neutral-600">
            Votre profil d'organisation n'est pas configuré correctement. Veuillez refaire la configuration.
          </p>
          <a
            href="/onboarding"
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Reconfigurer mon profil
          </a>
        </div>
      </div>
    );
  }

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

      {/* Rappel non bloquant : logo manquant (Agence uniquement) */}
      {profile === "agence" && (
        <OnboardingIncompleteAlert
          show={!dashboard.organisationLogoUrl}
          profile={profile}
          variant="logo"
        />
      )}

      {/* Rendu conditionnel du dashboard approprié */}
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
