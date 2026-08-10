/**
 * lib/dashboard.ts
 * 
 * Logique de récupération des données du dashboard adapté par profil.
 * Détermine le type d'organisation et prépare les données correctes.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Type propriétaire géré (pour gestionnaire/agence)
 */
export interface DashboardProprietaireGere {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  nbBiens: number;
  nbLogements: number;
  revenuMensuel: number;
}

/**
 * Type de profil organisation
 */
export type OrganisationType = "proprietaire" | "gestionnaire" | "agence";

/**
 * Scope d'organisation - détermine quelles données l'utilisateur peut voir
 */
export interface OrganisationScope {
  organisationType: OrganisationType;
  organisationId: string | null;
  userId: string;
  proprietaireIds: string[]; // IDs des propriétaires dans le scope (user + gérés)
  roleInterne: string; // "proprietaire", "gestionnaire", "admin"
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
 * Récupère le scope d'organisation de l'utilisateur
 * Détermine : type d'org, org_id, quels propriétaires sont dans le scope
 */
export async function getOrganisationScope(
  supabase: SupabaseClient,
  userId: string
): Promise<OrganisationScope | null> {
  // 1. Récupérer le propriétaire pour avoir le type de profil
  const { data: proprietaire, error: proprietaireError } = await supabase
    .from("proprietaire")
    .select("id, profil_type, situation")
    .eq("id", userId)
    .maybeSingle();

  if (proprietaireError) {
    throw new Error(
      `Impossible de récupérer le propriétaire : ${proprietaireError.message}`
    );
  }

  if (!proprietaire) {
    console.warn("⚠️ Propriétaire non trouvé pour user:", userId);
    return null;
  }

  const organisationType: OrganisationType = (proprietaire.profil_type || "proprietaire") as OrganisationType;

  // 2. Récupérer l'organisation de l'utilisateur
  const { data: org, error: orgError } = await supabase
    .from("organisations")
    .select("id, type, owner_user_id")
    .eq("owner_user_id", userId)
    .maybeSingle();

  if (orgError) {
    throw new Error(
      `Impossible de récupérer l'organisation : ${orgError.message}`
    );
  }

  if (!org) {
    console.warn("⚠️ Organisation non trouvée pour user:", userId);
    // Fallback : organisation personnelle
    return {
      organisationType: "proprietaire",
      organisationId: null,
      userId,
      proprietaireIds: [userId],
      roleInterne: "proprietaire",
    };
  }

  // 3. Récupérer le rôle interne de l'utilisateur dans l'organisation
  const { data: memberRole, error: memberRoleError } = await supabase
    .from("membres_organisation")
    .select("role_interne")
    .eq("organisation_id", org.id)
    .eq("user_id", userId)
    .maybeSingle();

  if (memberRoleError) {
    throw new Error(
      `Impossible de récupérer le rôle du membre : ${memberRoleError.message}`
    );
  }

  const roleInterne = memberRole?.role_interne || "proprietaire";

  // 4. Déterminer le scope des propriétaires
  // Pour "proprietaire" : juste l'utilisateur
  // Pour "gestionnaire"/"agence" : l'utilisateur + les propriétaires gérés
  const proprietaireIds = [userId];

  if (organisationType === "gestionnaire" || organisationType === "agence") {
    // Récupérer les propriétaires gérés
    const { data: gerés, error: gerésError } = await supabase
      .from("proprietaires_geres")
      .select("proprietaire_user_id")
      .eq("organisation_id", org.id);

    if (gerésError) {
      throw new Error(
        `Impossible de récupérer les propriétaires gérés : ${gerésError.message}`
      );
    }

    if (gerés) {
      proprietaireIds.push(
        ...gerés
          .map((p: any) => p.proprietaire_user_id)
          .filter(Boolean)
      );
    }
  }

  return {
    organisationType,
    organisationId: org.id,
    userId,
    proprietaireIds,
    roleInterne,
  };
}

/**
 * Récupère les données complètes pour le dashboard
 * Auto-récupère l'utilisateur depuis le contexte (Server Component)
 */
export async function getDashboardData(): Promise<DashboardData | null> {
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
  const { data: proprietaire, error: proprietaireError } = await supabase
    .from("proprietaire")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (proprietaireError) {
    throw new Error(
      `Impossible de récupérer le propriétaire : ${proprietaireError.message}`
    );
  }

  if (!proprietaire) {
    console.warn("⚠️ Propriétaire non trouvé");
    return null;
  }

  // 2. Récupérer scope d'organisation
  const scope = await getOrganisationScope(supabase, user.id);
  if (!scope) {
    return null;
  }

  // 3. Récupérer immeubles filtrés par scope
  const { data: immeubles, error: immeublesError } = await supabase
    .from("immeubles")
    .select("id, nom, proprietaire_id")
    .in("proprietaire_id", scope.proprietaireIds);

  if (immeublesError) {
    throw new Error(
      `Impossible de récupérer les immeubles : ${immeublesError.message}`
    );
  }

  const immeubleIds = immeubles?.map((i) => i.id) || [];

  // 4. Récupérer logements + calculer stats
  const { data: logements, error: logementsError } = await supabase
    .from("logements")
    .select("id, immeuble_id, statut, loyer_mensuel")
    .in("immeuble_id", immeubleIds);

  if (logementsError) {
    throw new Error(
      `Impossible de récupérer les logements : ${logementsError.message}`
    );
  }

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

  // 5. Récupérer paiements récents
  const { data: recentPayments, error: recentPaymentsError } = await supabase
    .from("paiements")
    .select("id, montant, date_paiement, contrat_id")
    .in("proprietaire_id", scope.proprietaireIds)
    .order("date_paiement", { ascending: false })
    .limit(5);

  if (recentPaymentsError) {
    throw new Error(
      `Impossible de récupérer les paiements récents : ${recentPaymentsError.message}`
    );
  }

  // 6. Récupérer contrats expirant bientôt
  const { data: expiringContracts, error: expiringContractsError } = await supabase
    .from("contrats")
    .select("id, date_fin, locataire_id")
    .in("proprietaire_id", scope.proprietaireIds)
    .filter("date_fin", "gt", new Date().toISOString())
    .filter(
      "date_fin",
      "lt",
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    );

  if (expiringContractsError) {
    throw new Error(
      `Impossible de récupérer les contrats expirants : ${expiringContractsError.message}`
    );
  }

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
}

/**
 * Récupère juste le type de profil de l'utilisateur
 */
export async function getOrganisationType(
  supabase: SupabaseClient,
  userId: string
): Promise<OrganisationType> {
  const { data: proprietaire, error } = await supabase
    .from("proprietaire")
    .select("profil_type")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Impossible de récupérer le type de profil : ${error.message}`
    );
  }

  return (proprietaire?.profil_type || "proprietaire") as OrganisationType;
}
