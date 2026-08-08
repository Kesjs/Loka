export type Objectif =
  | "proprietaire"
  | "famille"
  | "agence"
  | "demarre";

export type TypeBien =
  | "immeuble"
  | "maison"
  | "villa"
  | "boutique"
  | "terrain";

export type FrequenceLoyer = "mensuel" | "trimestriel" | "annuel";

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
  objectif: Objectif | null;
  profil: {
    nom: string;
    telephone: string;
    email: string;
  };
  bien: {
    nom: string;
    adresse: string;
    type: TypeBien | null;
  };
  nombreLogements: number;
  logements: LogementOccupation[];
  preferences: {
    frequenceLoyer: FrequenceLoyer | null;
    jourEcheance: string;
    garantie: boolean;
    montantGarantie: string;
    chargesIncluses: boolean;
    charges: string[];
    devise: string;
    notifEmail: boolean;
    widgetPriorite: "revenus" | "paiements" | "occupation" | "contrats" | null;
    logoUrl: string;
  };
}

export const initialOnboardingData: OnboardingData = {
  objectif: null,
  profil: { nom: "", telephone: "", email: "" },
  bien: { nom: "", adresse: "", type: null },
  nombreLogements: 1,
  logements: [],
  preferences: {
    frequenceLoyer: null,
    jourEcheance: "",
    garantie: false,
    montantGarantie: "",
    chargesIncluses: false,
    charges: [],
    devise: "FCFA",
    notifEmail: true,
    widgetPriorite: null,
    logoUrl: "",
  },
};

export const TOTAL_STEPS = 10;
