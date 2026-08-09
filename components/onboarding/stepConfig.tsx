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

// Map step number to configuration (including role/situation context)
export function getStepConfig(
  step: number,
  role: Role | null,
  situation: Situation | null
): StepConfig {
  // Step 0: Welcome
  if (step === 0) {
    return {
      step: 0,
      title: "Bienvenue",
      subtitle: "Configurons votre espace ensemble",
      icon: "house",
      illustration: <WelcomeIllustration />,
    };
  }

  // Step 1: Profile
  if (step === 1) {
    return {
      step: 1,
      title: "Racontons-nous",
      subtitle: "Quelques informations pour bien vous connaître",
      icon: "user",
      illustration: <ProfileIllustration />,
    };
  }

  // Step 2: Role
  if (step === 2) {
    return {
      step: 2,
      title: "Quel est votre rôle?",
      subtitle: "Cela nous aide à adapter votre expérience",
      icon: "users",
      illustration: <RoleIllustration />,
    };
  }

  // Step 3: Situation
  if (step === 3) {
    return {
      step: 3,
      title: "Votre contexte",
      subtitle: "Mieux comprendre votre situation",
      icon: "chart",
      illustration: <SituationIllustration />,
    };
  }

  // Step 4: Role-dependent
  if (step === 4) {
    if (role === "agence") {
      return {
        step: 4,
        title: "Informations agence",
        subtitle: "Détails de votre agence immobilière",
        icon: "buildings",
        illustration: <PropertyIllustration />,
      };
    }
    if (role === "gestionnaire") {
      return {
        step: 4,
        title: "Propriétaires gérés",
        subtitle: "Propriétaires dont vous gérez les biens",
        icon: "users",
        illustration: <RoleIllustration />,
      };
    }
    // Propriétaire: auto-skip, but return property config as fallback
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
        title: "Propriétaires gérés",
        subtitle: "Propriétaires dont vous gérez les biens",
        icon: "users",
        illustration: <RoleIllustration />,
      };
    }
    if (role === "gestionnaire" || role === "proprietaire") {
      return {
        step: 5,
        title: "Vos biens",
        subtitle: "Décrivez votre premier bien",
        icon: "buildings",
        illustration: <PropertyIllustration />,
      };
    }
  }

  // Step 6: Housing
  if (step === 6) {
    if (role === "agence") {
      return {
        step: 6,
        title: "Vos biens",
        subtitle: "Décrivez votre premier bien",
        icon: "buildings",
        illustration: <PropertyIllustration />,
      };
    }
    if (role === "gestionnaire" || role === "proprietaire") {
      return {
        step: 6,
        title: "Logements",
        subtitle: "Combien de logements en total?",
        icon: "door",
        illustration: <HousingIllustration />,
      };
    }
  }

  // Step 7: Housing
  if (step === 7) {
    if (role === "agence") {
      return {
        step: 7,
        title: "Logements",
        subtitle: "Combien de logements en total?",
        icon: "door",
        illustration: <HousingIllustration />,
      };
    }
    // Gestionnaire/Propriétaire: Occupation
    if (!isProprietaireDebutant(role, situation)) {
      return {
        step: 7,
        title: "Occupation",
        subtitle: "Statut d'occupation de chaque logement",
        icon: "door",
        illustration: <HousingIllustration />,
      };
    }
  }

  // Step 8: Occupation or Paiement
  if (step === 8) {
    if (role === "agence" || role === "gestionnaire") {
      return {
        step: 8,
        title: "Occupation",
        subtitle: "Statut d'occupation de chaque logement",
        icon: "door",
        illustration: <HousingIllustration />,
      };
    }
    if (!isProprietaireDebutant(role, situation)) {
      return {
        step: 8,
        title: "Moyens de paiement",
        subtitle: "Comment souhaitez-vous être payé?",
        icon: "chart",
        illustration: <SituationIllustration />,
      };
    }
  }

  // Step 9: Paiement (Agence only)
  if (step === 9) {
    if (role === "agence") {
      return {
        step: 9,
        title: "Moyens de paiement",
        subtitle: "Comment souhaitez-vous être payé?",
        icon: "chart",
        illustration: <SituationIllustration />,
      };
    }
  }

  // Complete: Last step
  return {
    step: step,
    title: "Succès!",
    subtitle: "Votre profil a été configuré",
    icon: "check",
    illustration: <CompleteIllustration />,
  };
}
