import { Role, Situation, isProprietaireDebutant } from "@/components/onboarding/types";

export interface AuthPanelCopy {
  leftTitle: string;
  leftSubtitle: string;
  leftFootnote?: string;
  progressLabel: string;
  rightHint?: string;
  visualKey?: OnboardingVisualKey;
}

/**
 * Clé thématique de l'étape, utilisée pour choisir l'image du panneau
 * flottant à droite (voir ONBOARDING_VISUALS plus bas). Les fichiers
 * correspondants sont à déposer dans /public/onboarding/<clé>.jpg
 */
export type OnboardingVisualKey =
  | "profil"
  | "role"
  | "contexte"
  | "agence"
  | "proprietaire"
  | "bien"
  | "logements"
  | "occupation"
  | "paiement"
  | "termine";

/**
 * Mapping clé -> fichier image + texte alternatif.
 * Dépose tes propres visuels dans /public/onboarding/ avec ces noms de
 * fichiers exacts (jpg, ratio portrait recommandé ~4:5), numérotés dans
 * l'ordre du parcours :
 *  - img1.jpg   profil          Bienvenue / prise en main
 *  - img2.jpg   role            Choix du rôle (propriétaire / gestionnaire / agence)
 *  - img3.jpg   contexte        Contexte / documents de bail
 *  - img4.jpg   agence          Agence immobilière (devanture, équipe)
 *  - img5.jpg   proprietaire    Propriétaire géré (poignée de main, mandat)
 *  - img6.jpg   bien            Immeuble / villa
 *  - img7.jpg   logements       Unités / couloir de portes numérotées
 *  - img8.jpg   occupation      État des lieux / clé dans une serrure
 *  - img9.jpg   paiement        Encaissement / mobile money
 *  - img10.jpg  termine         Dashboard prêt / lancement
 */
export const ONBOARDING_VISUALS: Record<
  OnboardingVisualKey,
  { src: string; alt: string }
> = {
  profil: { src: "/onboarding/img1.jpg", alt: "Bienvenue chez Loka" },
  role: { src: "/onboarding/img2.jpg", alt: "Choix du rôle" },
  contexte: { src: "/onboarding/img3.jpg", alt: "Votre contexte" },
  agence: { src: "/onboarding/img4.jpg", alt: "Votre agence" },
  proprietaire: { src: "/onboarding/img5.jpg", alt: "Propriétaire géré" },
  bien: { src: "/onboarding/img6.jpg", alt: "Vos biens" },
  logements: { src: "/onboarding/img7.jpg", alt: "Vos logements" },
  occupation: { src: "/onboarding/img8.jpg", alt: "État des lieux" },
  paiement: { src: "/onboarding/img9.jpg", alt: "Encaissement" },
  termine: { src: "/onboarding/img10.jpg", alt: "C'est prêt" },
};

export interface StepContextCard {
  badge: string;
  title: string;
  description: string;
  highlightLabel?: string;
  highlightValue?: string;
}

export function getStepContextCard(
  step: number,
  role: Role | null,
  situation: Situation | null
): StepContextCard {
  switch (step) {
    case 0:
      return {
        badge: "DÉMARRAGE RAPIDE",
        title: "Bienvenue sur Loka",
        description: "Vos informations officielles serviront à générer automatiquement vos quittances de loyer conformes.",
        highlightLabel: "Génération automatique",
        highlightValue: "Quittances E.164",
      };
    case 1:
      return {
        badge: "SUR-MESURE",
        title: "Interface adaptée à votre rôle",
        description: "Propriétaire indépendant, gestionnaire mandataire ou agence immobilière : Loka adapte ses tableaux de bord.",
        highlightLabel: "Profils gérés",
        highlightValue: "Bailleurs & Agences",
      };
    case 2:
      return {
        badge: "PARCOURS OPTIMISÉ",
        title: "Expérience personnalisée",
        description: "Nous ajustons le parcours selon la taille de votre parc pour vous éviter tout formulaire superflu.",
        highlightLabel: "Formulaires",
        highlightValue: "100% Pertinents",
      };
    case 3:
    case 4:
      if (role === "agence" || role === "gestionnaire") {
        return {
          badge: "PORTEFEUILLE DE BIENS",
          title: "Propriétaires mandants",
          description: "Organisez le suivi de vos bailleurs et automatisez le calcul et la retenue des commissions de gestion.",
          highlightLabel: "Calcul commission",
          highlightValue: "Automatique",
        };
      }
      return {
        badge: "PATRIMOINE IMMOBILIER",
        title: "Immeubles & Bâtiments",
        description: "Enregistrez vos immeubles pour regrouper facilement vos logements par quartier ou adresse.",
        highlightLabel: "Suivi centralisé",
        highlightValue: "Multi-biens",
      };
    case 5:
    case 6:
      return {
        badge: "STRUCTURE DES LOTS",
        title: "Découpage des logements",
        description: "Nomenclature automatique des appartements, boutiques et pièces avec loyer pré-rempli.",
        highlightLabel: "Numérotation",
        highlightValue: "Instantanée",
      };
    case 7:
      return {
        badge: "ÉTAT DES LIEUX",
        title: "Occupation & Locataires",
        description: "Distinguez en un clic les logements loués de ceux vacants pour un calcul exact de votre revenu potentiel.",
        highlightLabel: "Taux d'occupation",
        highlightValue: "Temps réel",
      };
    case 8:
      return {
        badge: "TRÉSORERIE",
        title: "Encaissements & Relances",
        description: "Suivez les règlements Mobile Money (MTN MoMo, Moov) et virements avec génération de reçu en 1 clic.",
        highlightLabel: "Suivi impayés",
        highlightValue: "Automatisé",
      };
    default:
      return {
        badge: "ESPACE PRÊT",
        title: "Configuration terminée !",
        description: "Accédez dès maintenant à votre tableau de bord et commencez à piloter vos loyers en toute sérénité.",
        highlightLabel: "Statut",
        highlightValue: "Opérationnel ⚡",
      };
  }
}

export const LOGIN_COPY = {
  leftTitle: "Votre patrimoine locatif, sous contrôle.",
  leftSubtitle:
    "Loyers, quittances et suivi des biens — depuis un seul espace.",
  leftFootnote: "Solution de gestion locative pour le Bénin",
  rightTitle: "Connexion",
  rightSubtitle: "Accédez à votre espace",
} as const;

export function getOnboardingPanelCopy(
  step: number,
  role: Role | null,
  situation: Situation | null
): AuthPanelCopy {
  switch (step) {
    case 0:
      return {
        leftTitle: "Bienvenue chez Loka",
        leftSubtitle: "Ces informations apparaîtront sur vos documents officiels.",
        progressLabel: "Profil",
        rightHint: "Nom et téléphone requis pour continuer.",
        visualKey: "profil",
      };
    case 1:
      return {
        leftTitle: "Qui êtes-vous ?",
        leftSubtitle: "Nous adaptons l'interface à votre activité.",
        progressLabel: "Rôle",
        visualKey: "role",
      };
    case 2:
      return {
        leftTitle: "Votre contexte",
        leftSubtitle: "Pour ne vous demander que l'essentiel.",
        progressLabel: "Contexte",
        visualKey: "contexte",
      };
    case 3:
      if (role === "agence") {
        return {
          leftTitle: "Votre agence",
          leftSubtitle: "Quelques détails pour personnaliser votre espace.",
          progressLabel: "Agence",
          visualKey: "agence",
        };
      }
      if (role === "gestionnaire") {
        return {
          leftTitle: "Propriétaire géré",
          leftSubtitle: "Vous pourrez en ajouter d'autres plus tard.",
          progressLabel: "Propriétaire",
          visualKey: "proprietaire",
        };
      }
      return {
        leftTitle: "Vos biens",
        leftSubtitle: "Commencez par un immeuble, le reste viendra après.",
        progressLabel: "Bien",
        visualKey: "bien",
      };
    case 4:
      if (role === "agence") {
        return {
          leftTitle: "Propriétaire géré",
          leftSubtitle: "Premier propriétaire de votre portefeuille.",
          progressLabel: "Propriétaire",
          visualKey: "proprietaire",
        };
      }
      return {
        leftTitle: "Vos biens",
        leftSubtitle: "Décrivez votre premier bien immobilier.",
        progressLabel: "Bien",
        rightHint: "Vous pourrez tout modifier plus tard.",
        visualKey: "bien",
      };
    case 5:
      if (role === "agence") {
        return {
          leftTitle: "Vos biens",
          leftSubtitle: "Décrivez votre premier bien immobilier.",
          progressLabel: "Bien",
          rightHint: "Vous pourrez tout modifier plus tard.",
          visualKey: "bien",
        };
      }
      return {
        leftTitle: "Vos logements",
        leftSubtitle: "Combien d'unités dans ce bien ?",
        progressLabel: "Logements",
        rightHint:
          "On les nomme automatiquement — vous pourrez modifier chaque nom et loyer à l'étape suivante.",
        visualKey: "logements",
      };
    case 6:
      if (role === "agence") {
        return {
          leftTitle: "Vos logements",
          leftSubtitle: "Combien d'unités dans ce bien ?",
          progressLabel: "Logements",
          rightHint:
            "On les nomme automatiquement — vous pourrez modifier chaque nom et loyer à l'étape suivante.",
          visualKey: "logements",
        };
      }
      if (!isProprietaireDebutant(role, situation)) {
        return {
          leftTitle: "État des lieux",
          leftSubtitle: "Occupé ou vacant — modifiable à tout moment.",
          progressLabel: "Occupation",
          rightHint: "Indiquez pour chaque logement s'il est vide ou déjà loué.",
          visualKey: "occupation",
        };
      }
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre tableau de bord vous attend.",
        progressLabel: "Terminé",
        visualKey: "termine",
      };
    case 7:
      if (role === "agence" || role === "gestionnaire") {
        return {
          leftTitle: "État des lieux",
          leftSubtitle: "Occupé ou vacant — modifiable à tout moment.",
          progressLabel: "Occupation",
          rightHint: "Indiquez pour chaque logement s'il est vide ou déjà loué.",
          visualKey: "occupation",
        };
      }
      if (!isProprietaireDebutant(role, situation)) {
        return {
          leftTitle: "Encaissement",
          leftSubtitle: "Comment vos locataires vous paient-ils ?",
          progressLabel: "Paiement",
          visualKey: "paiement",
        };
      }
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre tableau de bord vous attend.",
        progressLabel: "Terminé",
        visualKey: "termine",
      };
    case 8:
      if (role === "agence") {
        return {
          leftTitle: "Encaissement",
          leftSubtitle: "Comment vos locataires vous paient-ils ?",
          progressLabel: "Paiement",
          visualKey: "paiement",
        };
      }
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre tableau de bord vous attend.",
        progressLabel: "Terminé",
        visualKey: "termine",
      };
    default:
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre tableau de bord vous attend.",
        progressLabel: "Terminé",
        visualKey: "termine",
      };
  }
}

/** Étapes comptées dans la barre de progression (hors welcome et complete). */
export function getOnboardingProgressMeta(step: number, totalSteps: number) {
  // On affiche la progression dès l'étape 0, sauf la dernière (StepComplete)
  const showProgress = step < totalSteps - 1;
  // Affichage 1-based (l'utilisateur voit "Étape 1 sur N" et non "Étape 0")
  const current = step + 1;
  // On exclut la dernière étape (Complete) du total visible
  const total = totalSteps - 1;
  const percent = Math.round((step / Math.max(total - 1, 1)) * 100);

  return { showProgress, current, total, percent };
}
