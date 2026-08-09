import Link from "next/link";
import { UsersThree, Plus, Buildings, Wallet } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatMontant } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function ProprietairesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Connectez-vous pour voir vos propriétaires.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Récupérer le scope de l'organisation
  const orgScope = await getOrganisationScope(supabase);

  // Rediriger si compte individuel
  if (orgScope.organisationType === "individuel") {
    redirect("/home");
  }

  // Récupérer les propriétaires gérés
  const { data: proprietairesGeres } = await supabase
    .from("proprietaires_geres")
    .select("id, nom, telephone, email, created_at")
    .eq("organisation_id", orgScope.organisationId)
    .order("nom", { ascending: true });

  // Pour chaque propriétaire, compter ses biens et logements
  const proprietairesAvecStats = await Promise.all(
    (proprietairesGeres ?? []).map(async (pg) => {
      const { data: immeubles } = await supabase
        .from("immeubles")
        .select("id")
        .eq("proprietaire_gere_id", pg.id);

      const immeubleIds = (immeubles ?? []).map((i) => i.id);

      const { data: logements } = immeubleIds.length
        ? await supabase
            .from("logements")
            .select("statut, loyer_mensuel")
            .in("immeuble_id", immeubleIds)
        : { data: [] };

      const nbBiens = immeubles?.length ?? 0;
      const nbLogements = logements?.length ?? 0;
      const revenuMensuel = (logements ?? [])
        .filter((l) => l.statut === "occupe")
        .reduce((sum, l) => sum + (Number(l.loyer_mensuel) || 0), 0);

      return {
        ...pg,
        nbBiens,
        nbLogements,
        revenuMensuel,
      };
    })
  );

  const totalBiens = proprietairesAvecStats.reduce((sum, p) => sum + p.nbBiens, 0);
  const totalRevenu = proprietairesAvecStats.reduce((sum, p) => sum + p.revenuMensuel, 0);

  if (!proprietairesGeres || proprietairesGeres.length === 0) {
    return (
      <div className="space-y-5">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <UsersThree size={24} />
            </div>
            <p className="text-sm text-neutral-500">Aucun propriétaire géré pour le moment.</p>
            <Link
              href="/proprietaires/new"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ajouter un propriétaire
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
          <p className="text-sm font-medium text-primary-600">Portefeuille</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Propriétaires gérés</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {proprietairesGeres.length} propriétaire{proprietairesGeres.length > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild className="w-full lg:w-auto">
          <Link href="/proprietaires/new">
            <Plus size={16} weight="bold" />
            Ajouter un propriétaire
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <Buildings size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Biens gérés</p>
              <p className="text-lg font-semibold text-neutral-900">{totalBiens}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Revenu mensuel total</p>
              <p className="text-lg font-semibold text-neutral-900">{formatMontant(totalRevenu)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-neutral-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Biens</TableHead>
              <TableHead className="text-right">Logements</TableHead>
              <TableHead className="text-right">Revenu mensuel</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {proprietairesAvecStats.map((proprietaire) => (
              <TableRow key={proprietaire.id} className="transition-colors duration-200 hover:bg-neutral-50">
                <TableCell>
                  <Link
                    href={`/proprietaires/${proprietaire.id}`}
                    className="font-medium text-neutral-900 transition-colors hover:text-primary-600 hover:underline"
                  >
                    {proprietaire.nom}
                  </Link>
                </TableCell>
                <TableCell className="text-neutral-600">{proprietaire.telephone || "—"}</TableCell>
                <TableCell className="text-neutral-600">{proprietaire.email || "—"}</TableCell>
                <TableCell className="text-right">{proprietaire.nbBiens}</TableCell>
                <TableCell className="text-right">{proprietaire.nbLogements}</TableCell>
                <TableCell className="text-right font-medium">{formatMontant(proprietaire.revenuMensuel)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
