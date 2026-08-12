import { 
  CheckCircle, 
  WarningCircle, 
  Buildings, 
  House, 
  UsersThree, 
  Briefcase,
  MapPin,
  CurrencyCircleDollar,
  Users,
  Key,
  ShieldCheck,
  ArrowRight,
  Info
} from "@phosphor-icons/react";
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

const roleGradient: Record<string, string> = {
  proprietaire: "from-primary-500 to-primary-600",
  gestionnaire: "from-amber-500 to-amber-600",
  agence: "from-blue-500 to-blue-600",
  autre: "from-neutral-500 to-neutral-600",
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
  const nbLogementsOccupes = data?.logements?.filter(l => l.occupe).length ?? 0;
  const nbLogementsVacants = nbLogements - nbLogementsOccupes;
  const nbLocataires = data?.logements?.filter(l => l.occupe && l.locataireNom).length ?? 0;
  const nbImmeubles = data?.bien?.nom ? 1 : 0;
  const nomBien = data?.bien?.nom;
  const typeBien = data?.bien?.type;
  const villeBien = data?.bien?.ville;
  const nom = data?.profil?.nom;
  const telephone = data?.profil?.telephone;
  const devise = data?.preferences?.devise || "FCFA";
  const garantie = data?.preferences?.garantie;
  const montantGarantie = data?.preferences?.montantGarantie;

  // Calculer le revenu mensuel potentiel
  const revenuMensuel = data?.logements?.reduce((sum, log) => {
    if (log.occupe && log.loyer) {
      const loyer = typeof log.loyer === 'string' 
        ? Number(log.loyer.replace(/[^\d]/g, '')) 
        : log.loyer;
      return sum + (loyer || 0);
    }
    return sum;
  }, 0) ?? 0;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header avec animation de succès */}
      <div className="relative">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${roleGradient[role]} rounded-2xl opacity-5`} />
        
        <div className="relative flex flex-col items-center gap-4 text-center px-6 py-8">
          {/* Icône succès avec animation */}
          <div className="relative">
            <div className="absolute inset-0 bg-success-200 rounded-full animate-ping opacity-20" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-success-400 to-success-600 shadow-lg">
              <CheckCircle size={48} weight="fill" className="text-white" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-neutral-900">
              {nom ? `🎉 Bravo, ${nom.split(" ")[0]} !` : "🎉 Configuration terminée !"}
            </h2>
            <p className="text-base text-neutral-600 max-w-md">
              Votre espace Lokka est configuré et prêt à vous accompagner dans la gestion de votre patrimoine immobilier.
            </p>
          </div>
        </div>
      </div>

      {/* Carte récapitulatif détaillé */}
      <div className="rounded-2xl border-2 border-neutral-200 bg-white shadow-sm overflow-hidden">
        {/* Header de la carte avec rôle */}
        <div className={`px-6 py-4 bg-gradient-to-r ${roleGradient[role]}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <RoleIcon size={20} weight="fill" className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">Profil configuré</p>
              <p className="text-base font-bold text-white">{roleLabel[role] ?? role}</p>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-3 divide-x divide-neutral-200 border-b border-neutral-200">
          <div className="px-4 py-4 text-center">
            <Buildings size={20} weight="duotone" className="text-primary-500 mx-auto mb-2" />
            <p className="text-3xl font-black text-neutral-900">{nbImmeubles}</p>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              {nbImmeubles > 1 ? "Biens" : "Bien"}
            </p>
          </div>
          <div className="px-4 py-4 text-center">
            <House size={20} weight="duotone" className="text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-black text-neutral-900">{nbLogements}</p>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              {nbLogements > 1 ? "Logements" : "Logement"}
            </p>
          </div>
          <div className="px-4 py-4 text-center">
            <Users size={20} weight="duotone" className="text-success-500 mx-auto mb-2" />
            <p className="text-3xl font-black text-neutral-900">{nbLocataires}</p>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              {nbLocataires > 1 ? "Locataires" : "Locataire"}
            </p>
          </div>
        </div>

        {/* Détails du bien */}
        {nomBien && (
          <div className="px-6 py-4 border-b border-neutral-200 bg-neutral-50">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              Premier bien enregistré
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Buildings size={18} weight="duotone" className="text-neutral-400 shrink-0" />
                <div>
                  <p className="font-semibold text-neutral-900">{nomBien}</p>
                  {typeBien && (
                    <p className="text-xs text-neutral-500 capitalize">{typeBien}</p>
                  )}
                </div>
              </div>
              {villeBien && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} weight="duotone" className="text-neutral-400 shrink-0" />
                  <p className="text-sm text-neutral-600">{villeBien}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Occupation et revenus */}
        {nbLogements > 0 && (
          <div className="px-6 py-4 border-b border-neutral-200">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
              État d'occupation
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key size={16} weight="duotone" className="text-success-500" />
                  <span className="text-sm text-neutral-600">Logements occupés</span>
                </div>
                <span className="font-bold text-success-600">{nbLogementsOccupes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <House size={16} weight="duotone" className="text-neutral-400" />
                  <span className="text-sm text-neutral-600">Logements vacants</span>
                </div>
                <span className="font-bold text-neutral-600">{nbLogementsVacants}</span>
              </div>
              {revenuMensuel > 0 && (
                <div className="mt-3 pt-3 border-t border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CurrencyCircleDollar size={16} weight="duotone" className="text-primary-500" />
                      <span className="text-sm font-medium text-neutral-700">Revenu mensuel</span>
                    </div>
                    <span className="text-lg font-black text-primary-600">
                      {revenuMensuel.toLocaleString()} {devise}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Préférences configurées */}
        <div className="px-6 py-4 bg-neutral-50">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">
            Paramètres configurés
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CurrencyCircleDollar size={16} className="text-neutral-400" />
              <span className="text-neutral-600">Devise :</span>
              <span className="font-semibold text-neutral-900">{devise}</span>
            </div>
            {garantie && montantGarantie && (
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck size={16} className="text-success-500" />
                <span className="text-neutral-600">Garantie par défaut :</span>
                <span className="font-semibold text-neutral-900">{montantGarantie}</span>
              </div>
            )}
            {telephone && (
              <div className="flex items-center gap-2 text-sm">
                <Info size={16} className="text-neutral-400" />
                <span className="text-neutral-600">Contact :</span>
                <span className="font-semibold text-neutral-900">{telephone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Message personnalisé selon le rôle */}
        <div className={`px-6 py-4 bg-gradient-to-br ${roleGradient[role]} bg-opacity-5`}>
          <div className="flex items-start gap-3">
            <RoleIcon size={20} weight="duotone" className={`text-${role === 'agence' ? 'blue' : role === 'gestionnaire' ? 'amber' : 'primary'}-600 shrink-0 mt-0.5`} />
            <p className="text-sm text-neutral-700 leading-relaxed">
              {role === "agence" && "Votre tableau de bord agence est prêt. Vous pouvez maintenant ajouter vos propriétaires mandants, gérer leur patrimoine et suivre vos commissions."}
              {role === "gestionnaire" && "Votre espace gestionnaire est opérationnel. Accédez à vos propriétaires gérés, suivez leurs loyers et gérez les paiements en toute simplicité."}
              {role === "proprietaire" && "Votre tableau de bord propriétaire est configuré. Suivez vos loyers, gérez vos locataires et consultez vos contrats en temps réel."}
            </p>
          </div>
        </div>
      </div>

      {/* Gestion d'erreur améliorée */}
      {error && (
        <div className="rounded-xl border-2 border-danger-200 bg-danger-50 overflow-hidden">
          <div className="px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger-100 shrink-0">
                <WarningCircle size={20} weight="fill" className="text-danger-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-danger-900 mb-1">
                  Une erreur s'est produite
                </p>
                <p className="text-sm text-danger-700 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          </div>
          <div className="px-6 py-3 bg-danger-100 border-t border-danger-200">
            <p className="text-xs text-danger-800">
              💡 <strong>Que faire ?</strong> Vérifiez votre connexion internet et réessayez. Si le problème persiste, contactez notre support.
            </p>
          </div>
        </div>
      )}

      {/* Bouton d'action avec état de chargement amélioré */}
      <div className="space-y-3">
        <Button 
          onClick={onFinish} 
          className={`w-full h-12 text-base font-bold bg-gradient-to-r ${roleGradient[role]} hover:opacity-90 transition-opacity shadow-lg`}
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Finalisation de votre configuration...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Accéder à mon tableau de bord</span>
              <ArrowRight size={20} weight="bold" />
            </div>
          )}
        </Button>
        
        {!error && (
          <p className="text-xs text-center text-neutral-500">
            🔒 Vos données sont sécurisées et chiffrées
          </p>
        )}
      </div>
    </div>
  );
}
