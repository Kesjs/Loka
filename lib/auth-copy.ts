import { Role, StepType } from "@/components/onboarding/types";

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
export type OnboardingVisualKey = "role" | "bien" | "logements" | "termine";

/**
 * Mapping clé -> fichier image + texte alternatif.
 * Dépose tes propres visuels dans /public/onboarding/ avec ces noms de
 * fichiers exacts (jpg, ratio portrait recommandé ~4:5).
 */
export const ONBOARDING_VISUALS: Record<
  OnboardingVisualKey,
  { src: string; alt: string }
> = {
  role: { src: "/onboarding/img2.jpg", alt: "Choix du rôle" },
  bien: { src: "/onboarding/img6.jpg", alt: "Vos biens" },
  logements: { src: "/onboarding/img7.jpg", alt: "Vos logements" },
  termine: { src: "/onboarding/img10.jpg", alt: "C'est prêt" },
};

export const LOGIN_COPY = {
  leftTitle: "Votre patrimoine locatif, sous contrôle.",
  leftSubtitle:
    "Loyers, quittances et suivi des biens — depuis un seul espace.",
  leftFootnote: "Solution de gestion locative pour le Bénin",
  rightTitle: "Connexion",
  rightSubtitle: "Accédez à votre espace",
} as const;

/**
 * Copy du panneau gauche de l'onboarding, indexée par StepType (jamais par
 * numéro d'étape brut) — la séquence est désormais fixe pour tous les rôles
 * (role → property → housing_count → complete), donc cette fonction ne peut
 * plus se désynchroniser d'un branchement qui allongerait ou raccourcirait
 * le parcours selon le profil.
 */
export function getStepCopy(stepType: StepType, role: Role | null): AuthPanelCopy {
  switch (stepType) {
    case "role":
      return {
        leftTitle: "Comment gérez-vous vos biens ?",
        leftSubtitle: "Cela nous permet d'adapter votre espace à votre façon de travailler.",
        progressLabel: "Rôle",
        visualKey: "role",
      };
    case "property":
      return {
        leftTitle: "Votre premier bien",
        leftSubtitle:
          role === "agence"
            ? "Les détails essentiels, ainsi que votre premier propriétaire géré."
            : "Les détails essentiels, le reste peut attendre.",
        progressLabel: "Bien",
        rightHint: "Vous pourrez tout modifier plus tard.",
        visualKey: "bien",
      };
    case "housing_count":
      return {
        leftTitle: "Combien de logements ?",
        leftSubtitle: "On génère automatiquement vos fiches, vous les compléterez au fil de l'eau.",
        progressLabel: "Logements",
        rightHint: "Vous pourrez modifier chaque nom et loyer à l'étape suivante.",
        visualKey: "logements",
      };
    case "complete":
    default:
      return {
        leftTitle: "C'est prêt",
        leftSubtitle: "Votre espace est configuré, direction le tableau de bord.",
        progressLabel: "Terminé",
        visualKey: "termine",
      };
  }
}

/** Métadonnées de la barre de progression (exclut l'étape "complete" du total visible). */
export function getOnboardingProgressMeta(step: number, totalSteps: number) {
  const showProgress = step < totalSteps - 1;
  const current = step + 1;
  const total = totalSteps - 1;
  const percent = Math.round((step / Math.max(total - 1, 1)) * 100);

  return { showProgress, current, total, percent };
}
