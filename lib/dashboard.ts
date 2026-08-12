/**
 * lib/dashboard.ts
 *
 * Logique de récupération des données du dashboard adapté par profil.
 * MIGRATION C.3: Ce fichier fait maintenant appel à lib/organisation-scope.ts
 * qui est la source unique de vérité (organisations.type ENUM).
 *
 * NOTE: Les anciennes fonctions getOrganisationScope & getOrganisationType sont
 * dépréciées. Utiliser lib/organisation-scope.ts à la place.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getOrganisationScope as getOrgScopeFromOrgScope } from "@/lib/organisation-scope";

/**
 * Type de profil organisation (adapté pour compatibilité)
 * DEPRECATED: Utiliser "individuel" au lieu de "proprietaire"
 */
export type OrganisationType = "individuel" | "gestionnaire" | "agence";

export type StatutReversement = "a_jour" | "en_retard";

/**
 * Propriétaire géré (pour le mini-tableau Gestionnaire/Agence)
 */
export interface DashboardProprietaireGere {
  id: string;
  nom: string;
  nbBiens: number;
  nbLogements: number;
  montantDu: number;
  dateDernierReversement: string | null;
  statut: StatutReversement;
}

/**
 * Membre d'équipe (pour l'aperçu Agence)
 */
export interface DashboardEquipeMembre {
  id: string;
  nom: string;
  roleInterne: string;
  nbLogementsAssignes: number;
}

/**
 * Données du dashboard
 */
export interface DashboardData {
  profile: OrganisationType;
  userName: string;
  organisationType: OrganisationType;
  stats: {
    revenuMensuel: number;
    tauxOccupation: number;
    nombreImmeubles: number;
    nombreLogements: number;
    /** Propriétaire : nb de locataires dont le loyer n'a pas été réglé ce mois-ci. */
    loyersEnRetard: number;
    /** Propriétaire : écart entre revenu réel encaissé et revenu potentiel si tout était loué. */
    revenuPotentiel: number;
    logementsOccupes: number;
    logementsVacants: number;
    loyersAJour: number;
  };
  situation?: string;
  recentPayments: any[];
  expiringContracts: any[];
  /** Gestionnaire / Agence : mini-tableau des propriétaires gérés et de leurs reversements. */
  proprietairesGeres: DashboardProprietaireGere[];
  /** Agence uniquement : aperçu de l'équipe et des logements assignés. */
  equipe: DashboardEquipeMembre[];
  /** Agence uniquement : reversements dont le délai promis (30 jours) est dépassé. */
  reversementsEnDepassement: number;
  /** URL du logo de l'organisation, si déjà uploadé (null sinon — sert au rappel Agence). */
  organisationLogoUrl: string | null;
  /** Revenu encaissé sur les 6 derniers mois (pour le graphique en barres). */
  revenueHistory: { mois: string; total: number }[];
}

const DELAI_REVERSEMENT_JOURS = 30;

/**
 * Récupère les données complètes pour le dashboard
 * Auto-récupère l'utilisateur depuis le contexte (Server Component)
 *
 * MIGRATION C.3: Utilise maintenant getOrganisationScope de lib/organisation-scope.ts
 */
export async function getDashboardData(): Promise<DashboardData | null> {
  try {
    // Récupérer l'utilisateur connecté
    const { getSession } = await import("@/lib/auth");
    const user = await getSession();

    if (!user) {
      console.warn("⚠️ Utilisateur non authentifié");
      return null;
    }

    // Récupérer le Supabase client serveur
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    // 1. Récupérer propriétaire + info de base
    const { data: proprietaire } = await supabase
      .from("proprietaire")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (!proprietaire) {
      console.warn("⚠️ Propriétaire non trouvé");
      return null;
    }

    // 2. Récupérer scope d'organisation depuis la source unique de vérité
    const scope = await getOrgScopeFromOrgScope(supabase);
    if (!scope) {
      console.error("❌ Impossible de récupérer le scope d'organisation");
      return null;
    }

    if (!scope.organisationId) {
      console.warn("⚠️ Aucune organisation trouvée pour cet utilisateur après onboarding");
    }

    // 3. Récupérer immeubles filtrés par scope
    const { data: immeubles } = await supabase
      .from("immeubles")
      .select("id, nom, proprietaire_id")
      .in("proprietaire_id", scope.proprietaireIds);

    const immeubleIds = immeubles?.map((i) => i.id) || [];

    // 4. Récupérer logements + calculer stats (revenu réel, occupation, revenu potentiel)
    const { data: logements } = await supabase
      .from("logements")
      .select("id, immeuble_id, statut, loyer_mensuel, loyer_vise")
      .in("immeuble_id", immeubleIds);

    let revenuMensuel = 0;
    let revenuPotentiel = 0;
    let logementOccupes = 0;
    const totalLogements = logements?.length || 0;

    logements?.forEach((log) => {
      const estimationLoyer = log.loyer_vise || log.loyer_mensuel || 0;
      if (log.statut === "occupe") {
        logementOccupes++;
        revenuMensuel += log.loyer_mensuel || 0;
        revenuPotentiel += log.loyer_mensuel || 0;
      } else {
        // Logement vacant : contribue seulement au potentiel, pas au réel.
        revenuPotentiel += estimationLoyer;
      }
    });

    const tauxOccupation = totalLogements > 0
      ? Math.round((logementOccupes / totalLogements) * 100)
      : 0;

    // 5. Récupérer paiements récents (avec jointure via contrats → locataires)
    const { data: recentPayments } = await supabase
      .from("paiements")
      .select(`
        id, 
        montant, 
        date_paiement, 
        contrat_id,
        contrats!inner(
          id,
          locataires!inner(
            proprietaire_id
          )
        )
      `)
      .in("contrats.locataires.proprietaire_id", scope.proprietaireIds)
      .order("date_paiement", { ascending: false })
      .limit(5);

    // 6. Récupérer contrats expirant bientôt (avec jointure via locataires)
    const dateNow = new Date().toISOString().split("T")[0];
    const date30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const { data: expiringContracts } = await supabase
      .from("contrats")
      .select(`
        id, 
        date_fin, 
        locataire_id,
        locataires!inner(
          id,
          nom,
          proprietaire_id
        )
      `)
      .in("locataires.proprietaire_id", scope.proprietaireIds)
      .not("date_fin", "is", null)
      .gte("date_fin", dateNow)
      .lte("date_fin", date30Days)
      .eq("statut", "actif")
      .order("date_fin", { ascending: true });

    // 7. Loyers en retard (Propriétaire) : contrats actifs sans paiement enregistré
    //    sur le mois en cours.
    const debutMois = new Date();
    debutMois.setDate(1);
    const debutMoisStr = debutMois.toISOString().split("T")[0];

    const { data: contratsActifs } = await supabase
      .from("contrats")
      .select(`
        id,
        locataires!inner(proprietaire_id)
      `)
      .in("locataires.proprietaire_id", scope.proprietaireIds)
      .eq("statut", "actif");

    let loyersEnRetard = 0;
    let loyersAJour = 0;
    if (contratsActifs && contratsActifs.length > 0) {
      const contratIds = contratsActifs.map((c) => c.id);
      const { data: paiementsMois } = await supabase
        .from("paiements")
        .select("contrat_id")
        .in("contrat_id", contratIds)
        .gte("date_paiement", debutMoisStr);

      const contratsAvecPaiement = new Set((paiementsMois || []).map((p) => p.contrat_id));
      loyersEnRetard = contratIds.filter((id) => !contratsAvecPaiement.has(id)).length;
      loyersAJour = contratIds.length - loyersEnRetard;
    }

    // 8. Propriétaires gérés + reversements (Gestionnaire / Agence)
    let proprietairesGeres: DashboardProprietaireGere[] = [];
    let reversementsEnDepassement = 0;

    if (scope.organisationType !== "individuel" && scope.proprietairesGeres.length > 0 && scope.organisationId) {
      const proprietaireGereIds = scope.proprietairesGeres.map((pg) => pg.id);

      // Biens & logements par propriétaire géré
      const { data: immeublesGeres } = await supabase
        .from("immeubles")
        .select("id, proprietaire_gere_id")
        .in("proprietaire_gere_id", proprietaireGereIds);

      const immeubleGereIds = (immeublesGeres || []).map((i) => i.id);
      const { data: logementsGeres } = await supabase
        .from("logements")
        .select("id, immeuble_id")
        .in("immeuble_id", immeubleGereIds.length > 0 ? immeubleGereIds : ["00000000-0000-0000-0000-000000000000"]);

      // Dernier reversement par propriétaire géré
      const { data: reversements } = await supabase
        .from("reversements")
        .select("proprietaire_gere_id, montant_commission, montant_verse, statut, date_versement, mois")
        .eq("organisation_id", scope.organisationId)
        .in("proprietaire_gere_id", proprietaireGereIds)
        .order("mois", { ascending: false });

      type Reversement = {
        proprietaire_gere_id: string;
        montant_commission: number | null;
        montant_verse: number | null;
        statut: string | null;
        date_versement: string | null;
        mois: string | null;
      };
      const dernierParProprietaire = new Map<string, Reversement>();
      (reversements || []).forEach((r: Reversement) => {
        if (!dernierParProprietaire.has(r.proprietaire_gere_id)) {
          dernierParProprietaire.set(r.proprietaire_gere_id, r);
        }
      });

      const now = Date.now();
      proprietairesGeres = scope.proprietairesGeres.map((pg) => {
        const nbBiens = (immeublesGeres || []).filter((i) => i.proprietaire_gere_id === pg.id).length;
        const immeubleIdsDuProprietaire = (immeublesGeres || [])
          .filter((i) => i.proprietaire_gere_id === pg.id)
          .map((i) => i.id);
        const nbLogements = (logementsGeres || []).filter((l) =>
          immeubleIdsDuProprietaire.includes(l.immeuble_id)
        ).length;

        const dernier = dernierParProprietaire.get(pg.id);
        const montantDu = dernier ? Math.max(0, (dernier.montant_commission || 0) - (dernier.montant_verse || 0)) : 0;
        const enRetard =
          dernier?.statut !== "verse" &&
          dernier?.date_versement == null &&
          dernier?.mois &&
          now - new Date(dernier.mois).getTime() > DELAI_REVERSEMENT_JOURS * 24 * 60 * 60 * 1000;

        if (enRetard) reversementsEnDepassement++;

        return {
          id: pg.id,
          nom: pg.nom,
          nbBiens,
          nbLogements,
          montantDu,
          dateDernierReversement: dernier?.date_versement || null,
          statut: (enRetard ? "en_retard" : "a_jour") as StatutReversement,
        };
      });
    }

    // 9. Équipe (Agence uniquement) : membres + logements assignés
    let equipe: DashboardEquipeMembre[] = [];
    let organisationLogoUrl: string | null = null;
    if (scope.organisationType === "agence" && scope.organisationId) {
      const { data: orgRow } = await supabase
        .from("organisations")
        .select("logo_url")
        .eq("id", scope.organisationId)
        .maybeSingle();
      organisationLogoUrl = orgRow?.logo_url || null;

      const { data: membres } = await supabase
        .from("membres_organisation")
        .select("id, user_id, role_interne")
        .eq("organisation_id", scope.organisationId);

      if (membres && membres.length > 0) {
        const userIds = membres.map((m) => m.user_id);
        const { data: profils } = await supabase
          .from("proprietaire")
          .select("id, nom")
          .in("id", userIds);

        const { data: logementsAssignes } = await supabase
          .from("logements")
          .select("id, assigne_a")
          .in("assigne_a", userIds);

        equipe = membres.map((m) => {
          const profil = (profils || []).find((p) => p.id === m.user_id);
          const nbAssignes = (logementsAssignes || []).filter((l) => l.assigne_a === m.user_id).length;
          return {
            id: m.id,
            nom: profil?.nom || "Membre",
            roleInterne: m.role_interne,
            nbLogementsAssignes: nbAssignes,
          };
        });
      }
    }

    // 10. Historique des revenus sur 6 mois (pour le graphique en barres)
    const sixMoisAgo = new Date();
    sixMoisAgo.setMonth(sixMoisAgo.getMonth() - 5);
    sixMoisAgo.setDate(1);
    const sixMoisAgoStr = sixMoisAgo.toISOString().split("T")[0];

    const { data: paiementsHistorique } = await supabase
      .from("paiements")
      .select(`
        montant,
        date_paiement,
        contrats!inner(
          locataires!inner(proprietaire_id)
        )
      `)
      .in("contrats.locataires.proprietaire_id", scope.proprietaireIds)
      .gte("date_paiement", sixMoisAgoStr);

    const moisLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const revenueByMonth = new Map<string, number>();
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMoisAgo);
      d.setMonth(d.getMonth() + i);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      revenueByMonth.set(key, 0);
    }
    (paiementsHistorique || []).forEach((p: any) => {
      const d = new Date(p.date_paiement);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (revenueByMonth.has(key)) {
        revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + (p.montant || 0));
      }
    });
    const revenueHistory = Array.from(revenueByMonth.entries()).map(([key, total]) => {
      const monthIndex = Number(key.split("-")[1]);
      return { mois: moisLabels[monthIndex], total };
    });

    return {
      profile: scope.organisationType,
      userName: proprietaire.nom || "Utilisateur",
      organisationType: scope.organisationType,
      stats: {
        revenuMensuel,
        tauxOccupation,
        nombreImmeubles: immeubles?.length || 0,
        nombreLogements: totalLogements,
        loyersEnRetard,
        revenuPotentiel,
        logementsOccupes: logementOccupes,
        logementsVacants: totalLogements - logementOccupes,
        loyersAJour,
      },
      situation: proprietaire.situation,
      recentPayments: recentPayments || [],
      expiringContracts: expiringContracts || [],
      proprietairesGeres,
      equipe,
      reversementsEnDepassement,
      organisationLogoUrl,
      revenueHistory,
    };
  } catch (error) {
    console.error("❌ Erreur getDashboardData:", error);
    return null;
  }
}

/**
 * DEPRECATED: Cette fonction n'est plus utilisée.
 * Utiliser getOrganisationScope de lib/organisation-scope.ts à la place.
 */
export async function getOrganisationType(
  supabase: SupabaseClient,
  userId: string
): Promise<OrganisationType | null> {
  try {
    const scope = await getOrgScopeFromOrgScope(supabase);
    return scope.organisationType;
  } catch (error) {
    console.error("❌ Erreur getOrganisationType:", error);
    return null;
  }
}
