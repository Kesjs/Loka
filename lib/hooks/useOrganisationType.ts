/**
 * lib/hooks/useOrganisationType.ts
 * 
 * Hook client pour récupérer le type d'organisation de l'utilisateur connecté
 */

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { OrganisationType } from "@/lib/dashboard";

export function useOrganisationType(): OrganisationType | null {
  const [organisationType, setOrganisationType] = useState<OrganisationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchOrganisationType() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) setOrganisationType(null);
          return;
        }

        // Récupérer le type de profil depuis la table proprietaire
        const { data: proprietaire } = await supabase
          .from("proprietaire")
          .select("profil_type")
          .eq("id", user.id)
          .maybeSingle();

        if (mounted) {
          setOrganisationType((proprietaire?.profil_type || "proprietaire") as OrganisationType);
        }
      } catch (error) {
        console.error("❌ Erreur useOrganisationType:", error);
        if (mounted) setOrganisationType(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetchOrganisationType();

    return () => {
      mounted = false;
    };
  }, []);

  return organisationType;
}

/**
 * Hook pour obtenir le type d'organisation + état de chargement
 */
export function useOrganisationTypeWithLoading() {
  const [organisationType, setOrganisationType] = useState<OrganisationType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetch() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) setOrganisationType(null);
          return;
        }

        const { data: proprietaire, error: err } = await supabase
          .from("proprietaire")
          .select("profil_type")
          .eq("id", user.id)
          .maybeSingle();

        if (err) throw err;

        if (mounted) {
          setOrganisationType((proprietaire?.profil_type || "proprietaire") as OrganisationType);
          setError(null);
        }
      } catch (err) {
        console.error("❌ Erreur:", err);
        if (mounted) {
          setOrganisationType(null);
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    fetch();

    return () => {
      mounted = false;
    };
  }, []);

  return { organisationType, isLoading, error };
}
