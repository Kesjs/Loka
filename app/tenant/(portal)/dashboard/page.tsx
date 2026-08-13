import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TenantDashboardClient from "@/components/tenant/TenantDashboardClient";

export default async function TenantDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filet de sécurité : le layout parent redirige déjà si non connecté,
  // mais on ne suppose jamais `user` non-null sans le vérifier ici aussi.
  if (!user) {
    redirect("/tenant/login");
  }

  const { data: locataire } = await supabase
    .from("locataires")
    .select("id, nom, email")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!locataire) {
    redirect("/tenant/login");
  }

  const { data: contrat } = await supabase
    .from("contrats")
    .select(
      "id, loyer_mensuel, date_debut, date_fin, statut, logement:logements!inner(nom, type, immeuble:immeubles(nom, ville))"
    )
    .eq("locataire_id", locataire.id)
    .eq("statut", "actif")
    .maybeSingle();

  // Transformer le tableau logement en objet unique (Supabase retourne toujours un tableau pour les relations)
  const logementData = contrat?.logement && Array.isArray(contrat.logement) && contrat.logement.length > 0
    ? {
        nom: contrat.logement[0].nom,
        type: contrat.logement[0].type,
        immeuble: contrat.logement[0].immeuble && Array.isArray(contrat.logement[0].immeuble) && contrat.logement[0].immeuble.length > 0
          ? contrat.logement[0].immeuble[0]
          : null
      }
    : null;

  const { data: paiements } = contrat
    ? await supabase
        .from("paiements")
        .select("id, montant, date_paiement, mode, periode_debut, periode_fin, quittance_url")
        .eq("contrat_id", contrat.id)
        .order("date_paiement", { ascending: false })
        .limit(12)
    : { data: [] };

  return (
    <TenantDashboardClient
      locataireNom={locataire.nom}
      contratId={contrat?.id ?? null}
      loyerMensuel={contrat?.loyer_mensuel ?? null}
      logement={logementData}
      paiements={paiements ?? []}
    />
  );
}
