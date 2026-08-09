import { ReactNode } from "react";
import {
  WelcomeIllustration,
  ProfileIllustration,
  RoleIllustration,
  SituationIllustration,
  PropertyIllustration,
  HousingIllustration,
  CompleteIllustration,
} from "./illustrations";
import { Role, Situation, isProprietaireDebutant } from "./types";

export interface StepConfig {
  step: number;
  title?: string;
  subtitle?: string;
  icon?: "house" | "user" | "users" | "chart" | "buildings" | "door" | "check";
  illustration?: ReactNode;
}

/**
 * Séquence des étapes (après suppression du doublon StepProfile) :
 * 0  → Profil (nom, téléphone, email)
 * 1  → Rôle
 * 2  → Situation
 * 3  → AgenceInfo (agence) | ProprietaireGere (gestionnaire) | skippé (propriétaire)
 * 4  → ProprietaireGere (agence) | Property (gestionnaire/propriétaire)
 * 5  → Property (agence) | HousingCount (gestionnaire/propriétaire)
 * 6  → HousingCount (agence) | Occupation ou Complete (autres)
 * 7  → Occupation (agence/gestionnaire) | Paiement (propriétaire non-débutant)
 * 8  → Paiement (agence) | Complete
 * N  → Complete
 */
export function getStepConfig(
  step: number,
  role: Role | null,
  situation: Situation | null
): StepConfig {
  // Step 0: Profil (Welcome + saisie identité)
  if (step === 0) {
    return {
      step: 0,
      title: "Bienvenue",
      subtitle: "Quelques informations pour personnaliser votre espace",
      icon: "user",
      illustration: <WelcomeIllustration />,
    };
  }

  // Step 1: Rôle
  if (step === 1) {
    return {
      step: 1,
      title: "Quel est votre rôle ?",
      subtitle: "Cela nous aide à adapter votre expérience",
      icon: "users",
      illustration: <RoleIllustration />,
    };
  }

  // Step 2: Situation
  if (step === 2) {
    return {
      step: 2,
      title: "Votre contexte",
      subtitle: "Mieux comprendre votre situation",
      icon: "chart",
      illustration: <SituationIllustration />,
    };
  }

  // Step 3: Role-dependent
  if (step === 3) {
    if (role === "agence") {
      return {
        step: 3,
        title: "Informations agence",
        subtitle: "Détails de votre agence immobilière",
        icon: "buildings",
        illustration: <PropertyIllustration />,
      };
    }
    if (role === "gestionnaire") {
      return {
        step: 3,
        title: "Propriétaires gérés",
        subtitle: "Propriétaires dont vous gérez les biens",
        icon: "users",
        illustration: <RoleIllustration />,
      };
    }
    // Propriétaire: auto-skippé vers step 4
    return {
      step: 3,
      title: "Vos biens",
      subtitle: "Décrivez votre premier bien",
      icon: "buildings",
      illustration: <PropertyIllustration />,
    };
  }

  // Step 4: Role-dependent
  if (step === 4) {
    if (role === "agence") {
      return {
        step: 4,
        title: "Propriétaires gérés",
        subtitle: "Propriétaires dont vous gérez les biens",
        icon: "users",
        illustration: <RoleIllustration />,
      };
    }
    // Gestionnaire / Propriétaire : Property
    return {
      step: 4,
      title: "Vos biens",
      subtitle: "Décrivez votre premier bien",
      icon: "buildings",
      illustration: <PropertyIllustration />,
    };
  }

  // Step 5: Role-dependent
  if (step === 5) {
    if (role === "agence") {
      return {
        step: 5,
        title: "Vos biens",
        subtitle: "Décrivez votre premier bien",
        icon: "buildings",
        illustration: <PropertyIllustration />,
      };
    }
    // Gestionnaire / Propriétaire : HousingCount
    return {
      step: 5,
      title: "Logements",
      subtitle: "Combien de logements au total ?",
      icon: "door",
      illustration: <HousingIllustration />,
    };
  }

  // Step 6: Housing / Occupation
  if (step === 6) {
    if (role === "agence") {
      return {
        step: 6,
        title: "Logements",
        subtitle: "Combien de logements au total ?",
        icon: "door",
        illustration: <HousingIllustration />,
      };
    }
    // Propriétaire non-débutant → Occupation
    if (!isProprietaireDebutant(role, situation)) {
      return {
        step: 6,
        title: "Occupation",
        subtitle: "Statut d'occupation de chaque logement",
        icon: "door",
        illustration: <HousingIllustration />,
      };
    }
    // Débutant → Complete
    return {
      step: 6,
      title: "Succès !",
      subtitle: "Votre profil a été configuré",
      icon: "check",
      illustration: <CompleteIllustration />,
    };
  }

  // Step 7: Occupation (agence/gestionnaire) | Paiement (propriétaire non-débutant)
  if (step === 7) {
    if (role === "agence" || role === "gestionnaire") {
      return {
        step: 7,
        title: "Occupation",
        subtitle: "Statut d'occupation de chaque logement",
        icon: "door",
        illustration: <HousingIllustration />,
      };
    }
    if (!isProprietaireDebutant(role, situation)) {
      return {
        step: 7,
        title: "Moyens de paiement",
        subtitle: "Comment souhaitez-vous être payé ?",
        icon: "chart",
        illustration: <SituationIllustration />,
      };
    }
  }

  // Step 8: Paiement (agence)
  if (step === 8) {
    if (role === "agence") {
      return {
        step: 8,
        title: "Moyens de paiement",
        subtitle: "Comment souhaitez-vous être payé ?",
        icon: "chart",
        illustration: <SituationIllustration />,
      };
    }
  }

  // Complete: Dernière étape
  return {
    step: step,
    title: "Succès !",
    subtitle: "Votre profil a été configuré",
    icon: "check",
    illustration: <CompleteIllustration />,
  };
}
