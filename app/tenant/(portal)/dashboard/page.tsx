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
      "id, loyer_mensuel, date_debut, date_fin, statut, logement:logements(nom, type, immeuble:immeubles(nom, ville))"
    )
    .eq("locataire_id", locataire.id)
    .eq("statut", "actif")
    .maybeSingle();

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
      logement={contrat?.logement ?? null}
      paiements={paiements ?? []}
    />
  );
}
