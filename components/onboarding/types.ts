import { ReactNode } from "react";

export type Role = "proprietaire" | "gestionnaire" | "agence" | "autre";

export type Situation =
  | "premier_bien"
  | "commence_louer"
  | "possede_deja"
  | "gere_deja"
  | "famille"
  | "particuliers"
  | "plusieurs_proprietaires"
  | "demarre_agence"
  | "portefeuille_existant"
  | "migre_autre_outil";

export type RoleInterne = "admin" | "gestionnaire" | "mandataire" | "consultant" | "administrateur" | "autre";

export type TypeBien =
  | "immeuble"
  | "maison"
  | "villa"
  | "boutique"
  | "terrain";

export type TypeLocation = "longue_duree" | "courte_duree";

export type MoyenPaiement = "especes" | "mobile_money" | "virement" | "plusieurs";

export interface LogementData {
  nom: string;
  loyer?: string;
  occupe: boolean;
  locataireNom?: string | null;
  locataireTelephone?: string | null;
  dateDebut?: string;
  dateFin?: string;
}

export type LogementOccupation = LogementData;

export interface AgenceInfo {
  nom: string;
  telephone?: string;
  email?: string;
  ville?: string | null;
  taillePortefeuille?: string;
  logoUrl?: string; // Logo de l'agence (C.6)
}

export interface ProprietaireGere {
  nom: string;
  telephone: string;
  commissionPct: number;
}

export interface OnboardingData {
  profil: {
    nom: string;
    telephone: string;
    email: string;
  };

  role: Role | null;
  situation: Situation | null;
  roleInterne?: RoleInterne;

  agenceInfo?: AgenceInfo;
  proprietaireGere?: ProprietaireGere;

  bien: {
    nom: string;
    adresse: string | null;
    ville: string | null;
    quartier: string | null;
    repere: string | null;
    type: TypeBien | null;
    typeLocation: TypeLocation | null;
  };

  nombreLogements: number;
  logements: LogementData[];

  moyenPaiement: MoyenPaiement | null;

  preferences: {
    garantie: boolean;
    montantGarantie: string;
    devise: string;
    notifEmail: boolean;
    widgetPriorite: "revenus" | "paiements" | "occupation" | "contrats" | null;
  };
}

export const initialOnboardingData: OnboardingData = {
  profil: { nom: "", telephone: "", email: "" },
  role: null,
  situation: null,
  bien: {
    nom: "",
    adresse: null,
    ville: null,
    quartier: null,
    repere: null,
    type: null,
    typeLocation: null,
  },
  nombreLogements: 1,
  logements: [],
  moyenPaiement: "especes",
  preferences: {
    garantie: false,
    montantGarantie: "",
    devise: "FCFA",
    notifEmail: true,
    widgetPriorite: null,
  },
};

export type StepType =
  | "welcome"
  | "role"
  | "situation"
  | "agence_info"
  | "proprietaire_gere"
  | "property"
  | "housing_count"
  | "occupation"
  | "paiement"
  | "complete";

/**
 * Retourne la séquence exacte d'étapes actives selon le rôle et le contexte
 */
export function getStepSequence(
  role: Role | null,
  situation: Situation | null
): StepType[] {
  const steps: StepType[] = ["role", "situation"];

  if (!role || !situation) return steps;

  if (role === "agence") {
    steps.push("agence_info", "proprietaire_gere");
  } else if (role === "gestionnaire") {
    steps.push("proprietaire_gere");
  }

  steps.push("property", "housing_count");

  const isDebutant =
    role === "proprietaire" &&
    (situation === "premier_bien" || situation === "commence_louer");

  if (!isDebutant) {
    steps.push("occupation");
  }

  if ((role === "proprietaire" && !isDebutant) || role === "agence") {
    steps.push("paiement");
  }

  steps.push("complete");

  return steps;
}

export function calculateTotalSteps(
  role: Role | null,
  situation: Situation | null
): number {
  return getStepSequence(role, situation).length;
}

export function isProprietaireDebutant(
  role: Role | null,
  situation: Situation | null
): boolean {
  return (
    role === "proprietaire" &&
    (situation === "premier_bien" || situation === "commence_louer")
  );
}
