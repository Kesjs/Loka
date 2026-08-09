import { Role, Situation, isProprietaireDebutant } from "@/components/onboarding/types";

export interface AuthPanelCopy {
  leftTitle: string;
  leftSubtitle: string;
  leftFootnote?: string;
  progressLabel: string;
  rightHint?: string;
}

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
        description: "La solution de gestion locative conçue spécifiquement pour les propriétaires et agences au Bénin.",
        highlightLabel: "Temps de config",
        highlightValue: "< 3 minutes",
      };
    case 1:
      return {
        badge: "IDENTITÉ & MARQUE",
        title: "Profil & En-tête officiel",
        description: "Vos informations serviront à générer automatiquement vos quittances de loyer et avis d'échéance conformes.",
        highlightLabel: "Génération automatique",
        highlightValue: "Quittances E.164",
      };
    case 2:
      return {
        badge: "SUR-MESURE",
        title: "Interface adaptée à votre rôle",
        description: "Propriétaire indépendant, gestionnaire mandataire ou agence immobilière : Loka adapte ses tableaux de bord.",
        highlightLabel: "Profils gérés",
        highlightValue: "Bailleurs & Agences",
      };
    case 3:
      return {
        badge: "PARCOURS OPTIMISÉ",
        title: "Expérience personnalisée",
        description: "Nous ajustons le parcours selon la taille de votre parc pour vous éviter tout formulaire superflu.",
        highlightLabel: "Formulaires",
        highlightValue: "100% Pertinents",
      };
    case 4:
    case 5:
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
    case 6:
    case 7:
      return {
        badge: "STRUCTURE DES LOTS",
        title: "Découpage des logements",
        description: "Nomenclature automatique des appartements, boutiques et pièces avec loyer pré-rempli.",
        highlightLabel: "Numérotation",
        highlightValue: "Instantanée",
      };
    case 8:
      return {
        badge: "ÉTAT DES LIEUX",
        title: "Occupation & Locataires",
        description: "Distinguez en un clic les logements loués de ceux vacants pour un calcul exact de votre revenu potentiel.",
        highlightLabel: "Taux d'occupation",
        highlightValue: "Temps réel",
      };
    case 9:
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
        leftTitle: "Bienvenue chez Saint Pierre",
        leftSubtitle: "Quelques minutes pour configurer votre espace.",
        progressLabel: "Bienvenue",
      };
    case 1:
      return {
        leftTitle: "Qui êtes-vous ?",
        leftSubtitle: "Ces informations apparaîtront sur vos documents.",
        progressLabel: "Profil",
        rightHint: "Nom et téléphone requis pour continuer.",
      };
    case 2:
      return {
        leftTitle: "Votre profil",
        leftSubtitle: "Nous adaptons l'interface à votre activité.",
        progressLabel: "Rôle",
      };
    case 3:
      return {
        leftTitle: "Votre contexte",
        leftSubtitle: "Pour ne vous demander que l'essentiel.",
        progressLabel: "Contexte",
      };
    case 4:
      if (role === "agence") {
        return {
          leftTitle: "Votre agence",
          leftSubtitle: "Quelques détails pour personnaliser votre espace.",
          progressLabel: "Agence",
        };
      }
      if (role === "gestionnaire") {
        return {
          leftTitle: "Propriétaire géré",
          leftSubtitle: "Vous pourrez en ajouter d'autres plus tard.",
          progressLabel: "Propriétaire",
        };
      }
      return {
        leftTitle: "Vos biens",
        leftSubtitle: "Commencez par un immeuble, le reste viendra après.",
        progressLabel: "Bien",
      };
    case 5:
      if (role === "agence") {
        return {
          leftTitle: "Propriétaire géré",
          leftSubtitle: "Premier propriétaire de votre portefeuille.",
          progressLabel: "Propriétaire",
        };
      }
      return {
        leftTitle: "Vos biens",
        leftSubtitle: "Décrivez votre premier bien immobilier.",
        progressLabel: "Bien",
        rightHint: "Vous pourrez tout modifier plus tard.",
      };
    case 6:
      if (role === "agence") {
        return {
          leftTitle: "Vos biens",
          leftSubtitle: "Décrivez votre premier bien immobilier.",
          progressLabel: "Bien",
          rightHint: "Vous pourrez tout modifier plus tard.",
        };
      }
      return {
        leftTitle: "Vos logements",
        leftSubtitle: "Combien d'unités dans ce bien ?",
        progressLabel: "Logements",
        rightHint:
          "On les nomme automatiquement — vous pourrez modifier chaque nom et loyer à l'étape suivante.",
      };
    case 7:
      if (role === "agence") {
        return {
          leftTitle: "Vos logements",
          leftSubtitle: "Combien d'unités dans ce bien ?",
          progressLabel: "Logements",
          rightHint:
            "On les nomme automatiquement — vous pourrez modifier chaque nom et loyer à l'étape suivante.",
        };
      }
      if (!isProprietaireDebutant(role, situation)) {
        return {
          leftTitle: "État des lieux",
          leftSubtitle: "Occupé ou vacant — modifiable à tout moment.",
          progressLabel: "Occupation",
          rightHint: "Indiquez pour chaque logement s'il est vide ou déjà loué.",
        };
      }
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre tableau de bord vous attend.",
        progressLabel: "Terminé",
      };
    case 8:
      if (role === "agence" || role === "gestionnaire") {
        return {
          leftTitle: "État des lieux",
          leftSubtitle: "Occupé ou vacant — modifiable à tout moment.",
          progressLabel: "Occupation",
          rightHint: "Indiquez pour chaque logement s'il est vide ou déjà loué.",
        };
      }
      if (!isProprietaireDebutant(role, situation)) {
        return {
          leftTitle: "Encaissement",
          leftSubtitle: "Comment vos locataires vous paient-ils ?",
          progressLabel: "Paiement",
        };
      }
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre tableau de bord vous attend.",
        progressLabel: "Terminé",
      };
    case 9:
      if (role === "agence") {
        return {
          leftTitle: "Encaissement",
          leftSubtitle: "Comment vos locataires vous paient-ils ?",
          progressLabel: "Paiement",
        };
      }
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre tableau de bord vous attend.",
        progressLabel: "Terminé",
      };
    default:
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre tableau de bord vous attend.",
        progressLabel: "Terminé",
      };
  }
}

/** Étapes comptées dans la barre de progression (hors welcome et complete). */
export function getOnboardingProgressMeta(step: number, totalSteps: number) {
  const actionableTotal = Math.max(totalSteps - 2, 1);
  const showProgress = step > 0 && step < totalSteps - 1;
  const current = step;
  const percent = Math.round((current / actionableTotal) * 100);

  return { showProgress, current, total: actionableTotal, percent };
}
