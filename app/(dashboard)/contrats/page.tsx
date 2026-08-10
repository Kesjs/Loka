import Link from "next/link";
import { Handshake, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { Card, CardContent } from "@/components/ui/card";
import { ContratsTabFilter } from "@/components/dashboard/ContratsTabFilter";

export default async function ContratsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Connectez-vous pour voir vos contrats.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Récupérer le scope de l'organisation
  const orgScope = await getOrganisationScope(supabase);

  // Filtrer par organisation_id via locataires
  const { data: locataires } = await supabase
    .from("locataires")
    .select("id")
    .eq("organisation_id", orgScope.organisationId);

  const locataireIds = (locataires ?? []).map((item: any) => item.id);

  // Récupérer TOUS les contrats (pas juste "actif") pour permettre le filtrage par onglet
  const { data: allContrats } = locataireIds.length
    ? await supabase
        .from("contrats")
        .select(
          "id, loyer_mensuel, depot_garantie, date_debut, date_fin, statut, locataire:locataires(nom), logement:logements(nom)"
        )
        .in("locataire_id", locataireIds)
        .order("date_debut", { ascending: false })
    : { data: [] as any };

  // Trier les contrats par statut (C.3 Phase 5)
  const contratsActifs = (allContrats ?? []).filter((c: any) => c.statut === "actif");
  const contratsExpires = (allContrats ?? []).filter((c: any) => c.statut === "expire");
  const contratsResilies = (allContrats ?? []).filter((c: any) => c.statut === "resilie");

  if (!allContrats || allContrats.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-600">Contrats</p>
            <h1 className="text-2xl font-semibold text-neutral-900">Vos locations</h1>
            <p className="mt-1 text-sm text-neutral-500">Aucun contrat enregistré</p>
          </div>
          <Link href="/contrats/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
            Ajouter un contrat <ArrowRight size={14} />
          </Link>
        </div>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Handshake size={24} />
            </div>
            <p className="text-sm text-neutral-500">Aucun contrat pour le moment.</p>
            <Link href="/locataires" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              Ajouter un locataire <ArrowRight size={14} />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Contrats</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Vos locations</h1>
          <p className="mt-1 text-sm text-neutral-500">{allContrats.length} contrat{allContrats.length > 1 ? "s" : ""} total</p>
        </div>
        <Link href="/contrats/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
          Ajouter un contrat <ArrowRight size={14} />
        </Link>
      </div>

      {/* Onglets de filtrage (C.3 Phase 5) */}
      <ContratsTabFilter
        contratsActifs={contratsActifs}
        contratsExpires={contratsExpires}
        contratsResilies={contratsResilies}
      />
    </div>
  );
}
