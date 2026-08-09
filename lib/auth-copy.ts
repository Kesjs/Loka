import { Role, Situation, isProprietaireDebutant } from "@/components/onboarding/types";

export interface AuthPanelCopy {
  leftTitle: string;
  leftSubtitle: string;
  leftFootnote?: string;
  progressLabel: string;
  rightHint?: string;
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
