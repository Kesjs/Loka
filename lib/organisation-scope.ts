import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Détermine le scope complet (organisation + propriétaires associés) pour l'utilisateur courant.
 * 
 * Retourne:
 * - Pour un 'individuel': { organisationId, role, proprietaireIds: [user.id] }
 * - Pour un 'gestionnaire'/'agence': { organisationId, role, proprietaireIds: [...gérés], proprietairesGeres: [...] }
 * 
 * Utilisé par:
 * - lib/dashboard.ts (calcul des stats)
 * - app/(dashboard)/* pages (filtrage des données)
 * - app/api/* routes (scoping des requêtes)
 */

export interface OrganisationScope {
  organisationId: string | null;
  organisationType: "individuel" | "gestionnaire" | "agence";
  proprietaireIds: string[]; // IDs pour les filtres RLS
  proprietairesGeres: Array<{
    id: string;
    nom: string;
    userId: string | null;
    commissionPct: number;
  }>;
}

export async function getOrganisationScope(
  supabase: SupabaseClient
): Promise<OrganisationScope> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }

  // 1. Récupérer l'organisation de l'utilisateur (user est owner)
  const { data: orgData, error: orgError } = await supabase
    .from("organisations")
    .select("id, type")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  if (orgError) {
    throw new Error(`Failed to fetch organisation: ${orgError.message}`);
  }

  // Pas d'organisation trouvée = utilisateur 'individuel' (aucune org)
  if (!orgData) {
    return {
      organisationId: null,
      organisationType: "individuel",
      proprietaireIds: [user.id],
      proprietairesGeres: [],
    };
  }

  const organisationId = orgData.id;
  const organisationType = (orgData.type as "individuel" | "gestionnaire" | "agence") || "individuel";

  // 2. Si individuel: pas de propriétaires gérés
  if (organisationType === "individuel") {
    return {
      organisationId,
      organisationType,
      proprietaireIds: [user.id],
      proprietairesGeres: [],
    };
  }

  // 3. Si gestionnaire/agence: récupérer les propriétaires gérés
  const { data: proprietairesGeres, error: pgerError } = await supabase
    .from("proprietaires_geres")
    .select("id, nom, user_id, commission_pct")
    .eq("organisation_id", organisationId);

  if (pgerError) {
    throw new Error(`Failed to fetch managed owners: ${pgerError.message}`);
  }

  // Collecter les IDs pour le filtre RLS
  // - user.id pour le créateur de l'org (owner)
  // - user_id de chaque proprietaire_gere (s'il a un compte Loka)
  const proprietaireIds = [user.id];
  const proprietairesGeresFormatted = (proprietairesGeres || []).map((pg) => ({
    id: pg.id,
    nom: pg.nom,
    userId: pg.user_id,
    commissionPct: pg.commission_pct || 10,
  }));

  // Ajouter les user_id des propriétaires gérés au filtre (s'ils existent)
  proprietairesGeresFormatted.forEach((pg) => {
    if (pg.userId && !proprietaireIds.includes(pg.userId)) {
      proprietaireIds.push(pg.userId);
    }
  });

  return {
    organisationId,
    organisationType,
    proprietaireIds,
    proprietairesGeres: proprietairesGeresFormatted,
  };
}

/**
 * Helper: Construit un filtre Supabase pour une table avec colonne `organisation_id`.
 * 
 * Usage: const query = supabase.from("logements")
 *          .select("*")
 *          .in("organisation_id", organisationIds)
 * 
 * OU pour les tables sans organisation_id mais avec proprietaire_id:
 *   .in("proprietaire_id", scope.proprietaireIds)
 */
export function buildOrganisationFilter(scope: OrganisationScope) {
  return {
    organisationId: scope.organisationId,
    proprietaireIds: scope.proprietaireIds,
  };
}

/**
 * Helper: Filtre complet pour une requête Supabase sur immeubles/logements/etc.
 * 
 * Les tables avec organisation_id (après migration 008):
 * - immeubles (organisation_id, proprietaire_id)
 * - logements (via immeuble)
 * - locataires (organisation_id, proprietaire_id)
 * - contrats (via logement/locataire)
 * - paiements (via contrat)
 * 
 * Stratégie de filtre:
 * 1. Préférer organisation_id si la colonne existe
 * 2. Fallback à proprietaire_id IN (scope.proprietaireIds) si organisation_id manque
 * 3. Jointure si la colonne est sur une table parent
 */
export async function applyOrganisationFilter(
  supabase: SupabaseClient,
  query: any,
  tableName: string
) {
  const scope = await getOrganisationScope(supabase);

  // Table-specific filtering logic
  switch (tableName) {
    case "immeubles":
      // immeubles a organisation_id depuis migration 007
      return scope.organisationId
        ? query.eq("organisation_id", scope.organisationId)
        : query.in("proprietaire_id", scope.proprietaireIds);

    case "logements":
      // logements n'a pas organisation_id, jointure via immeubles
      // Approche: laisser le caller faire la jointure et passer organisation_id
      return query;

    case "locataires":
      // locataires a organisation_id depuis migration 008
      return scope.organisationId
        ? query.eq("organisation_id", scope.organisationId)
        : query.in("proprietaire_id", scope.proprietaireIds);

    case "contrats":
      // contrats n'a pas organisation_id, jointure via locataire/logement
      // Approche: laisser le caller faire la jointure
      return query;

    case "paiements":
      // paiements n'a pas organisation_id, jointure via contrat/locataire
      return query;

    default:
      return query;
  }
}
