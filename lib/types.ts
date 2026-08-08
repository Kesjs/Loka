export type StatutLogement = "occupe" | "vacant";
export type StatutContrat = "actif" | "termine" | "resilie";
export type ModePaiement = "cash" | "mobile_money" | "virement";

export interface Proprietaire {
  id: string;
  nom: string;
  telephone: string | null;
  structure: string | null;
  logo_url: string | null;
  objectif: string | null;
  devise: string;
  frequence_loyer: string | null;
  jour_echeance: string | null;
  garantie_defaut: boolean;
  montant_garantie_defaut: number | null;
  charges_incluses_defaut: boolean;
  charges_defaut: string[];
  notif_email: boolean;
  widget_priorite: string | null;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Immeuble {
  id: string;
  proprietaire_id: string;
  nom: string;
  adresse: string | null;
  ville: string | null;
  type: string | null;
  created_at: string;
  updated_at: string;
}

export interface Logement {
  id: string;
  immeuble_id: string;
  nom: string | null;
  type: string | null;
  loyer_mensuel: number;
  statut: StatutLogement;
  created_at: string;
  updated_at: string;
}

export interface Locataire {
  id: string;
  proprietaire_id: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contrat {
  id: string;
  locataire_id: string;
  logement_id: string;
  loyer_mensuel: number;
  depot_garantie: number;
  date_debut: string;
  date_fin: string | null;
  statut: StatutContrat;
  created_at: string;
  updated_at: string;
}

export interface Paiement {
  id: string;
  contrat_id: string;
  montant: number;
  date_paiement: string;
  periode_debut: string | null;
  periode_fin: string | null;
  mode: ModePaiement;
  quittance_url: string | null;
  created_at: string;
}
