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

export interface OrganisationInfo {
  organisationType: OrganisationType | null;
  organisationNom: string;
  logoUrl: string | null;
  isLoading: boolean;
}

export function useOrganisationInfo(): OrganisationInfo {
  const [info, setInfo] = useState<OrganisationInfo>({
    organisationType: null,
    organisationNom: "Lokka",
    logoUrl: null,
    isLoading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchInfo() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) setInfo((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const { data: proprietaire } = await supabase
          .from("proprietaire")
          .select("nom, profil_type")
          .eq("id", user.id)
          .maybeSingle();

        const { data: org } = await supabase
          .from("organisations")
          .select("nom, nom_commercial, logo_url")
          .eq("owner_user_id", user.id)
          .maybeSingle();

        if (mounted) {
          const orgType = (proprietaire?.profil_type || "proprietaire") as OrganisationType;
          const nom = org?.nom_commercial || org?.nom || proprietaire?.nom || "Lokka";
          const logo = org?.logo_url || null;

          setInfo({
            organisationType: orgType,
            organisationNom: nom,
            logoUrl: logo,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Erreur useOrganisationInfo:", error);
        if (mounted) setInfo((prev) => ({ ...prev, isLoading: false }));
      }
    }

    fetchInfo();

    return () => {
      mounted = false;
    };
  }, []);

  return info;
}
