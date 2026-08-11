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

/**
 * Propriétaire géré (pour portefeuille multi-propriétaire)
 */
export interface DashboardProprietaireGere {
  id: string;
  nom: string;
  nbBiens: number;
  nbLogements: number;
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
  };
  situation?: string;
  recentPayments: any[];
  expiringContracts: any[];
}

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

    // Vérification: L'utilisateur doit avoir une organisation après l'onboarding
    if (!scope.organisationId) {
      console.warn("⚠️ Aucune organisation trouvée pour cet utilisateur après onboarding");
      // Fallback: créer un scope individuel par défaut
      // Cela ne devrait jamais arriver si l'onboarding est correctement complété
    }

    // 3. Récupérer immeubles filtrés par scope
    const { data: immeubles } = await supabase
      .from("immeubles")
      .select("id, nom, proprietaire_id")
      .in("proprietaire_id", scope.proprietaireIds);

    const immeubleIds = immeubles?.map((i) => i.id) || [];

    // 4. Récupérer logements + calculer stats
    const { data: logements } = await supabase
      .from("logements")
      .select("id, immeuble_id, statut, loyer_mensuel")
      .in("immeuble_id", immeubleIds);

    let revenuMensuel = 0;
    let logementOccupes = 0;
    let totalLogements = logements?.length || 0;

    logements?.forEach((log) => {
      if (log.statut === "occupe") {
        logementOccupes++;
        revenuMensuel += log.loyer_mensuel || 0;
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
    const dateNow = new Date().toISOString().split('T')[0];
    const date30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
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

    return {
      profile: scope.organisationType,
      userName: proprietaire.nom || "Utilisateur",
      organisationType: scope.organisationType,
      stats: {
        revenuMensuel,
        tauxOccupation,
        nombreImmeubles: immeubles?.length || 0,
        nombreLogements: totalLogements,
      },
      situation: proprietaire.situation,
      recentPayments: recentPayments || [],
      expiringContracts: expiringContracts || [],
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
