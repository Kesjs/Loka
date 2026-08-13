export type Role = "proprietaire" | "gestionnaire" | "agence";

export type RoleInterne = "admin" | "gestionnaire" | "mandataire" | "consultant" | "administrateur";

export type TypeBien =
  | "immeuble"
  | "maison"
  | "villa"
  | "boutique"
  | "terrain";

export type TypeLocation = "longue_duree" | "courte_duree";

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

export interface ProprietaireGere {
  nom: string;
  telephone: string;
}

export interface OnboardingData {
  profil: {
    nom: string;
    telephone: string;
    email: string;
  };

  role: Role | null;
  roleInterne?: RoleInterne;
  /** Signal "gestion à distance" (diaspora) — ajuste l'affichage, ce n'est pas un rôle. */
  estADistance?: boolean;

  /** Premier propriétaire géré — utilisé uniquement en mode Agence. */
  proprietaireGere: ProprietaireGere;

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
  estADistance: false,
  proprietaireGere: { nom: "", telephone: "" },
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
  preferences: {
    garantie: false,
    montantGarantie: "",
    devise: "FCFA",
    notifEmail: true,
    widgetPriorite: null,
  },
};

/**
 * Séquence fixe, retenue par le récap final : 3 écrans + transition, quel
 * que soit le rôle. Le formulaire "property" varie légèrement en contenu
 * (bloc propriétaire géré pour Agence) mais reste une seule et même étape —
 * plus de branchement par situation/rôle qui allongeait ou raccourcissait
 * la séquence (source du bug de saut d'étape).
 */
export type StepType = "role" | "property" | "housing_count" | "complete";

const FIXED_SEQUENCE: StepType[] = ["role", "property", "housing_count", "complete"];

export function getStepSequence(_role?: Role | null): StepType[] {
  return FIXED_SEQUENCE;
}

export function calculateTotalSteps(): number {
  return FIXED_SEQUENCE.length;
}
