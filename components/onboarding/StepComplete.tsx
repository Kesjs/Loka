import { CheckCircle, WarningCircle, Buildings, House, UsersThree, Briefcase } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import type { OnboardingData } from "./types";

interface StepCompleteProps {
  onFinish: () => void;
  loading?: boolean;
  error?: string;
  data?: OnboardingData;
}

const roleLabel: Record<string, string> = {
  proprietaire: "Propriétaire individuel",
  gestionnaire: "Gestionnaire mandataire",
  agence: "Agence immobilière",
  autre: "Utilisateur",
};

const roleColor: Record<string, string> = {
  proprietaire: "bg-primary-50 text-primary-700 border-primary-200",
  gestionnaire: "bg-amber-50 text-amber-700 border-amber-200",
  agence: "bg-blue-50 text-blue-700 border-blue-200",
  autre: "bg-neutral-50 text-neutral-600 border-neutral-200",
};

const roleIcon: Record<string, typeof House> = {
  proprietaire: House,
  gestionnaire: Briefcase,
  agence: Buildings,
  autre: UsersThree,
};

export default function StepComplete({ onFinish, loading, error, data }: StepCompleteProps) {
  const role = data?.role || "proprietaire";
  const RoleIcon = roleIcon[role] ?? House;
  const nbLogements = data?.logements?.length ?? data?.nombreLogements ?? 0;
  const nbImmeubles = data?.bien?.nom ? 1 : 0;
  const nomBien = data?.bien?.nom;
  const nom = data?.profil?.nom;

  return (
    <div className="space-y-6">
      {/* Icône succès */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-100">
            <CheckCircle size={40} weight="fill" className="text-success-600" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            {nom ? `Bravo, ${nom.split(" ")[0]} !` : "Configuration terminée !"}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Votre espace est prêt à être utilisé.
          </p>
        </div>
      </div>

      {/* Résumé personnalisé */}
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 divide-y divide-neutral-200">
        {/* Badge rôle */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${roleColor[role]}`}>
            <RoleIcon size={14} weight="fill" />
            {roleLabel[role] ?? role}
          </div>
        </div>

        {/* Stats configurées */}
        <div className="grid grid-cols-2 divide-x divide-neutral-200">
          <div className="px-4 py-3 text-center">
            <p className="text-2xl font-black text-neutral-900">{nbImmeubles}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {nbImmeubles > 1 ? "Biens" : "Bien"} enregistré{nbImmeubles > 1 ? "s" : ""}
            </p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-2xl font-black text-neutral-900">{nbLogements}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {nbLogements > 1 ? "Logements" : "Logement"} configuré{nbLogements > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Nom du bien */}
        {nomBien && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-600">
            <Buildings size={15} className="text-neutral-400 shrink-0" />
            <span className="font-medium">{nomBien}</span>
            {data?.bien?.ville && (
              <span className="text-neutral-400">· {data.bien.ville}</span>
            )}
          </div>
        )}

        {/* Message selon le rôle */}
        <div className="px-4 py-3 text-xs text-neutral-500 leading-relaxed">
          {role === "agence" && "Votre tableau de bord agence est prêt. Ajoutez vos propriétaires mandants et commencez à gérer leur patrimoine."}
          {role === "gestionnaire" && "Votre espace gestionnaire est configuré. Accédez à vos propriétaires et à leur suivi de loyers."}
          {role === "proprietaire" && "Votre tableau de bord propriétaire est prêt. Suivez vos loyers, locataires et contrats en un coup d'œil."}
          {role === "autre" && "Votre espace est configuré et prêt à l'emploi."}
          {/* Note: Le rôle "proprietaire" lors de l'onboarding est mappé à "individuel" dans organisations.type en base */}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-600">
          <WarningCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Button onClick={onFinish} className="w-full" disabled={loading}>
        {loading ? "Préparation en cours..." : "Accéder à mon tableau de bord →"}
      </Button>
    </div>
  );
}
