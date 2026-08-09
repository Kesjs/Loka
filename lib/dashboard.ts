import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import type { Proprietaire } from "@/lib/types";

export interface DashboardLogementRow {
  id: string;
  nom: string | null;
  statut: "occupe" | "vacant";
  loyer_mensuel: number;
  immeuble_nom: string;
}

export interface DashboardPaiementRow {
  id: string;
  montant: number;
  date_paiement: string;
  mode: string;
  locataire_nom: string;
  logement_nom: string | null;
}

export interface DashboardContratExpirant {
  id: string;
  date_fin: string;
  locataire_nom: string;
  logement_nom: string | null;
  jours_restants: number;
}

export interface DashboardProprietaireGere {
  id: string;
  nom: string;
  nbBiens: number;
  nbLogements: number;
  revenuMensuel: number;
}

export interface DashboardPortefeuille {
  nbProprietaires: number;
  parProprietaire: DashboardProprietaireGere[];
}

export interface DashboardData {
  proprietaire: Proprietaire | null;
  organisation: {
    id: string;
    nom: string;
    type: "individuel" | "gestionnaire" | "agence";
  };
  nbImmeubles: number;
  nbLogements: number;
  nbLogementsOccupes: number;
  tauxOccupation: number;
  revenuMensuelPotentiel: number;
  revenuMensuelReel: number;
  logements: DashboardLogementRow[];
  paiementsRecents: DashboardPaiementRow[];
  contratsExpirants: DashboardContratExpirant[];
  portefeuille?: DashboardPortefeuille;
}

const EMPTY_DASHBOARD: DashboardData = {
  proprietaire: null,
  organisation: {
    id: "",
    nom: "",
    type: "individuel",
  },
  nbImmeubles: 0,
  nbLogements: 0,
  nbLogementsOccupes: 0,
  tauxOccupation: 0,
  revenuMensuelPotentiel: 0,
  revenuMensuelReel: 0,
  logements: [],
  paiementsRecents: [],
  contratsExpirants: [],
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_DASHBOARD;

  // Récupérer le scope de l'organisation
  const orgScope = await getOrganisationScope(supabase);

  const { data: proprietaire } = await supabase
    .from("proprietaire")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // Récupérer les immeubles de l'organisation
  let immeublesQuery = supabase
    .from("immeubles")
    .select("id, nom, proprietaire_gere_id");

  // Filtrer par organisation_id si dispo, sinon par proprietaire_id
  if (orgScope.organisationId) {
    immeublesQuery = immeublesQuery.eq("organisation_id", orgScope.organisationId);
  } else {
    immeublesQuery = immeublesQuery.in("proprietaire_id", orgScope.proprietaireIds);
  }

  const { data: immeubles } = await immeublesQuery;

  const immeubleIds = (immeubles ?? []).map((i) => i.id);

  const { data: logementsRaw } = immeubleIds.length
    ? await supabase
        .from("logements")
        .select("id, nom, statut, loyer_mensuel, immeuble_id")
        .in("immeuble_id", immeubleIds)
    : { data: [] as never[] };

  const logements: DashboardLogementRow[] = (logementsRaw ?? []).map((l) => ({
    id: l.id,
    nom: l.nom,
    statut: l.statut,
    loyer_mensuel: Number(l.loyer_mensuel) || 0,
    immeuble_nom:
      (immeubles ?? []).find((i) => i.id === l.immeuble_id)?.nom ?? "",
  }));

  const nbLogements = logements.length;
  const logementsOccupes = logements.filter((l) => l.statut === "occupe");
  const nbLogementsOccupes = logementsOccupes.length;
  const tauxOccupation = nbLogements > 0 ? Math.round((nbLogementsOccupes / nbLogements) * 100) : 0;
  const revenuMensuelPotentiel = logements.reduce((sum, l) => sum + l.loyer_mensuel, 0);
  const revenuMensuelReel = logementsOccupes.reduce((sum, l) => sum + l.loyer_mensuel, 0);

  // Paiements récents (via contrats -> locataires, filtrés par organisation)
  let locatairesQuery = supabase
    .from("locataires")
    .select("id, nom");

  if (orgScope.organisationId) {
    locatairesQuery = locatairesQuery.eq("organisation_id", orgScope.organisationId);
  } else {
    locatairesQuery = locatairesQuery.in("proprietaire_id", orgScope.proprietaireIds);
  }

  const { data: locataires } = await locatairesQuery;

  const locataireIds = (locataires ?? []).map((l) => l.id);

  const { data: contrats } = locataireIds.length
    ? await supabase
        .from("contrats")
        .select("id, locataire_id, logement_id, date_fin, statut")
        .in("locataire_id", locataireIds)
    : { data: [] as never[] };

  const contratIds = (contrats ?? []).map((c) => c.id);

  const { data: paiementsRaw } = contratIds.length
    ? await supabase
        .from("paiements")
        .select("id, montant, date_paiement, mode, contrat_id")
        .in("contrat_id", contratIds)
        .order("date_paiement", { ascending: false })
        .limit(5)
    : { data: [] as never[] };

  const paiementsRecents: DashboardPaiementRow[] = (paiementsRaw ?? []).map((p) => {
    const contrat = (contrats ?? []).find((c) => c.id === p.contrat_id);
    const locataire = (locataires ?? []).find((l) => l.id === contrat?.locataire_id);
    const logement = logements.find((l) => l.id === contrat?.logement_id);
    return {
      id: p.id,
      montant: Number(p.montant) || 0,
      date_paiement: p.date_paiement,
      mode: p.mode,
      locataire_nom: locataire?.nom ?? "—",
      logement_nom: logement?.nom ?? null,
    };
  });

  // Contrats actifs qui expirent dans les 30 prochains jours
  const now = new Date();
  const dans30jours = new Date(now);
  dans30jours.setDate(now.getDate() + 30);

  const contratsExpirants: DashboardContratExpirant[] = (contrats ?? [])
    .filter((c) => c.statut === "actif" && c.date_fin)
    .filter((c) => {
      const fin = new Date(c.date_fin as string);
      return fin >= now && fin <= dans30jours;
    })
    .map((c) => {
      const locataire = (locataires ?? []).find((l) => l.id === c.locataire_id);
      const logement = logements.find((l) => l.id === c.logement_id);
      const fin = new Date(c.date_fin as string);
      const joursRestants = Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        id: c.id,
        date_fin: c.date_fin as string,
        locataire_nom: locataire?.nom ?? "—",
        logement_nom: logement?.nom ?? null,
        jours_restants: joursRestants,
      };
    })
    .sort((a, b) => a.jours_restants - b.jours_restants);

  // Construire les données de portefeuille pour gestionnaire/agence
  let portefeuille: DashboardPortefeuille | undefined;

  if (orgScope.organisationType !== "individuel" && orgScope.proprietairesGeres.length > 0) {
    const parProprietaire: DashboardProprietaireGere[] = orgScope.proprietairesGeres.map((pg) => {
      // Compter les biens de ce propriétaire
      const biensProprietaire = (immeubles ?? []).filter(
        (imm) => imm.proprietaire_gere_id === pg.id
      );
      const nbBiens = biensProprietaire.length;
      const biensIds = biensProprietaire.map((b) => b.id);

      // Compter les logements de ces biens
      const logementsProprietaire = (logementsRaw ?? []).filter((log) =>
        biensIds.includes(log.immeuble_id)
      );

      // Calculer le revenu mensuel (logements occupés uniquement)
      const revenuMensuel = logementsProprietaire
        .filter((l) => l.statut === "occupe")
        .reduce((sum, l) => sum + (Number(l.loyer_mensuel) || 0), 0);

      return {
        id: pg.id,
        nom: pg.nom,
        nbBiens,
        nbLogements: logementsProprietaire.length,
        revenuMensuel,
      };
    });

    portefeuille = {
      nbProprietaires: orgScope.proprietairesGeres.length,
      parProprietaire,
    };
  }

  // Récupérer le nom de l'organisation
  let organisationNom = proprietaire?.nom || "Mon Organisation";
  if (orgScope.organisationId) {
    const { data: org } = await supabase
      .from("organisations")
      .select("nom")
      .eq("id", orgScope.organisationId)
      .maybeSingle();
    if (org?.nom) organisationNom = org.nom;
  }

  return {
    proprietaire: (proprietaire as Proprietaire) ?? null,
    organisation: {
      id: orgScope.organisationId || "",
      nom: organisationNom,
      type: orgScope.organisationType,
    },
    nbImmeubles: immeubles?.length ?? 0,
    nbLogements,
    nbLogementsOccupes,
    tauxOccupation,
    revenuMensuelPotentiel,
    revenuMensuelReel,
    logements,
    paiementsRecents,
    contratsExpirants,
    portefeuille,
  };
}
