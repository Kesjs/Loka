"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type OrganisationType = "individuel" | "gestionnaire" | "agence";

export function useOrganisationType(): OrganisationType | null {
  const [orgType, setOrgType] = useState<OrganisationType | null>(null);

  useEffect(() => {
    const fetchOrgType = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setOrgType(null);
          return;
        }

        // Chercher l'organisation dont l'utilisateur est owner
        const { data: ownedOrg } = await supabase
          .from("organisations")
          .select("type")
          .eq("owner_user_id", user.id)
          .maybeSingle();

        if (ownedOrg) {
          setOrgType(ownedOrg.type as OrganisationType);
          return;
        }

        // Sinon, chercher si membre d'une organisation
        const { data: membership } = await supabase
          .from("membres_organisation")
          .select("organisation_id, organisations(type)")
          .eq("user_id", user.id)
          .maybeSingle();

        if (membership?.organisations) {
          const org = membership.organisations as any;
          setOrgType(org.type as OrganisationType);
          return;
        }

        // Par défaut, individuel
        setOrgType("individuel");
      } catch (error) {
        console.error("Erreur récupération type organisation:", error);
        setOrgType("individuel");
      }
    };

    fetchOrgType();
  }, []);

  return orgType;
}
