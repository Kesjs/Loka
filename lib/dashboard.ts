import { createClient } from "@/lib/supabase/server";
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

export interface DashboardData {
  proprietaire: Proprietaire | null;
  nbImmeubles: number;
  nbLogements: number;
  nbLogementsOccupes: number;
  tauxOccupation: number;
  revenuMensuelPotentiel: number;
  revenuMensuelReel: number;
  logements: DashboardLogementRow[];
  paiementsRecents: DashboardPaiementRow[];
  contratsExpirants: DashboardContratExpirant[];
}

const EMPTY_DASHBOARD: DashboardData = {
  proprietaire: null,
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

  const { data: proprietaire } = await supabase
    .from("proprietaire")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const { data: immeubles } = await supabase
    .from("immeubles")
    .select("id, nom")
    .eq("proprietaire_id", user.id);

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

  // Paiements récents (via contrats -> locataires, filtrés par propriétaire)
  const { data: locataires } = await supabase
    .from("locataires")
    .select("id, nom")
    .eq("proprietaire_id", user.id);

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

  return {
    proprietaire: (proprietaire as Proprietaire) ?? null,
    nbImmeubles: immeubles?.length ?? 0,
    nbLogements,
    nbLogementsOccupes,
    tauxOccupation,
    revenuMensuelPotentiel,
    revenuMensuelReel,
    logements,
    paiementsRecents,
    contratsExpirants,
  };
}
