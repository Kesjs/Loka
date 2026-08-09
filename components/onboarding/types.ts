export type Role =
  | "proprietaire"
  | "gestionnaire"
  | "agence"
  | "autre";

export type RoleInterne =
  | "gestionnaire"
  | "administrateur"
  | "mandataire"
  | "autre";

export type Situation =
  | "possede_deja"
  | "premier_bien"
  | "commence_louer"
  | "gere_deja"
  | "famille"
  | "particuliers"
  | "plusieurs_proprietaires"
  | "demarre_agence"
  | "portefeuille_existant"
  | "migre_autre_outil";

export type TypeBien =
  | "immeuble"
  | "maison"
  | "villa"
  | "boutique"
  | "terrain"
  | "bureau_local_commercial"
  | "espace_fete";

export type TypeLocation = "longue_duree" | "courte_duree";

export type MoyenPaiement = "especes" | "mobile_money" | "virement" | "plusieurs";

export interface ProprietaireGere {
  nom: string;
  telephone: string;
  commissionPct?: number;
}

export interface AgenceInfo {
  nom: string;
  ville: string;
  taillePortefeuille: "1-10" | "10-50" | "50+";
}

export interface LogementOccupation {
  nom: string;
  occupe: boolean;
  locataireNom?: string;
  locataireTelephone?: string;
  loyer?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface OnboardingData {
  // Profil utilisateur
  profil: {
    nom: string;
    telephone: string;
    email: string;
  };

  // Organisation
  role: Role | null;
  situation: Situation | null;
  roleInterne?: RoleInterne; // si gestionnaire

  // Info agence (si agence)
  agenceInfo?: AgenceInfo;

  // Propriétaire géré (si gestionnaire/agence)
  proprietaireGere?: ProprietaireGere;

  // Bien principal
  bien: {
    nom: string;
    adresse: string;
    ville: string;
    quartier: string;
    repere: string;
    type: TypeBien | null;
    typeLocation: TypeLocation | null;
  };

  nombreLogements: number;
  logements: LogementOccupation[];

  // Paiements et préférences
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
    adresse: "",
    ville: "",
    quartier: "",
    repere: "",
    type: null,
    typeLocation: null,
  },
  nombreLogements: 1,
  logements: [],
  moyenPaiement: null,
  preferences: {
    garantie: false,
    montantGarantie: "",
    devise: "FCFA",
    notifEmail: true,
    widgetPriorite: null,
  },
};

/**
 * Calcule le nombre total d'étapes pour un parcours donné
 * 
 * Base: Welcome(0) + Profile(1) + Role(2) + Situation(3) = 4
 * 
 * Agence: +AgenceInfo +ProprietaireGere = 2
 * Gestionnaire: +ProprietaireGere = 1
 * Propriétaire: +0
 * 
 * All: +Property +HousingCount = 2
 * Propriétaire/Agence/Gestionnaire: +Occupation = 1
 * Propriétaire non-débutant: +Paiement = 1
 * All: +Complete = 1
 * 
 * TOTAL:
 * - Propriétaire débutant: 4 + 0 + 2 + 0 + 1 = 7
 * - Propriétaire confirmé: 4 + 0 + 2 + 1 + 1 + 1 = 9
 * - Gestionnaire: 4 + 1 + 2 + 1 + 1 = 9
 * - Agence: 4 + 2 + 2 + 1 + 1 + 1 = 11
 */
export function calculateTotalSteps(role: Role | null, situation: Situation | null): number {
  if (!role || !situation) return 3; // Welcome/Profil(0) + Role(1) + Situation(2)

  let count = 3; // Welcome/Profil(0) + Role(1) + Situation(2)

  // Optional steps based on role
  if (role === "agence") {
    count += 2; // AgenceInfo + ProprietaireGere
  } else if (role === "gestionnaire") {
    count += 1; // ProprietaireGere
  }
  // Propriétaire adds 0

  // Base steps for property & housing
  count += 2; // Property + HousingCount

  // Occupation step (all roles except débutant propriétaire)
  const isDebutant =
    role === "proprietaire" &&
    (situation === "premier_bien" || situation === "commence_louer");

  if (!isDebutant) {
    count += 1; // Occupation
  }

  // Paiement step (only non-débutant propriétaire and agence)
  if (role === "proprietaire" && !isDebutant) {
    count += 1; // Paiement
  } else if (role === "agence") {
    count += 1; // Paiement
  }

  count += 1; // Complete

  return count;
}

/**
 * Retourne vrai si propriétaire débutant (saute 3 étapes)
 */
export function isProprietaireDebutant(role: Role | null, situation: Situation | null): boolean {
  return (
    role === "proprietaire" &&
    (situation === "premier_bien" || situation === "commence_louer")
  );
}
