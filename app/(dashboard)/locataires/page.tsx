import Link from "next/link";
import { UsersThree, EnvelopeSimple, Phone, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function LocatairesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Connectez-vous pour voir vos locataires.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Récupérer le scope de l'organisation
  const orgScope = await getOrganisationScope(supabase);

  // Filtrer par organisation_id au lieu de proprietaire_id
  const { data: locataires } = await supabase
    .from("locataires")
    .select("id, nom, telephone, email, created_at, contrats(id, statut)")
    .eq("organisation_id", orgScope.organisationId)
    .order("nom", { ascending: true });

  const totalContratsActifs = (locataires ?? []).reduce((total, locataire: any) => {
    return total + (locataire.contrats?.filter((contrat: any) => contrat.statut === "actif").length ?? 0);
  }, 0);

  if (!locataires || locataires.length === 0) {
    return (
      <div className="space-y-5">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <UsersThree size={24} />
            </div>
            <p className="text-sm text-neutral-500">Aucun locataire enregistré pour le moment.</p>
            <Link href="/contrats" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              Créer votre premier contrat <ArrowRight size={14} />
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Gestion des locataires</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Vos occupants et leurs contrats</h1>
          <p className="mt-1 text-sm text-neutral-500">{locataires.length} locataire{locataires.length > 1 ? "s" : ""} • {totalContratsActifs} contrat{totalContratsActifs > 1 ? "s" : ""} actif{totalContratsActifs > 1 ? "s" : ""}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/locataires/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
            Ajouter un locataire <ArrowRight size={14} />
          </Link>
          <Link href="/contrats" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
            Gérer les contrats <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <UsersThree size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Locataires</p>
              <p className="text-lg font-semibold text-neutral-900">{locataires.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Contrats actifs</p>
              <p className="text-lg font-semibold text-neutral-900">{totalContratsActifs}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-neutral-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Date d’ajout</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locataires.map((locataire: any) => (
              <TableRow key={locataire.id} className="transition-colors duration-200 hover:bg-neutral-50">
                <TableCell>
                  <Link href={`/locataires/${locataire.id}`} className="font-medium text-neutral-900 transition-colors hover:text-primary-600 hover:underline">
                    {locataire.nom}
                  </Link>
                </TableCell>
                <TableCell className="text-neutral-600">{locataire.email ?? "—"}</TableCell>
                <TableCell className="text-neutral-600">{locataire.telephone ?? "—"}</TableCell>
                <TableCell>{formatDate(locataire.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
