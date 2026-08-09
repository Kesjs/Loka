import Link from "next/link";
import { ArrowLeft, Buildings, DoorOpen, Wallet, Phone, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatMontant } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: { id: string };
}

export default async function ProprietaireDetailPage({ params }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  // Récupérer le scope de l'organisation
  const orgScope = await getOrganisationScope(supabase);

  // Vérifier que le propriétaire appartient à l'organisation
  const { data: proprietaireGere } = await supabase
    .from("proprietaires_geres")
    .select("*")
    .eq("id", params.id)
    .eq("organisation_id", orgScope.organisationId)
    .maybeSingle();

  if (!proprietaireGere) {
    notFound();
  }

  // Récupérer les immeubles de ce propriétaire
  const { data: immeubles } = await supabase
    .from("immeubles")
    .select("id, nom, type, ville, quartier")
    .eq("proprietaire_gere_id", params.id)
    .order("nom", { ascending: true });

  const immeubleIds = (immeubles ?? []).map((i) => i.id);

  // Récupérer les logements de ces immeubles
  const { data: logements } = immeubleIds.length
    ? await supabase
        .from("logements")
        .select("id, nom, statut, loyer_mensuel, immeuble_id")
        .in("immeuble_id", immeubleIds)
    : { data: [] };

  const nbBiens = immeubles?.length ?? 0;
  const nbLogements = logements?.length ?? 0;
  const nbLogementsOccupes = (logements ?? []).filter((l) => l.statut === "occupe").length;
  const tauxOccupation = nbLogements > 0 ? Math.round((nbLogementsOccupes / nbLogements) * 100) : 0;

  const revenuMensuelPotentiel = (logements ?? []).reduce(
    (sum, l) => sum + (Number(l.loyer_mensuel) || 0),
    0
  );
  const revenuMensuelReel = (logements ?? [])
    .filter((l) => l.statut === "occupe")
    .reduce((sum, l) => sum + (Number(l.loyer_mensuel) || 0), 0);

  const typeLabels: Record<string, string> = {
    immeuble: "Immeuble",
    maison: "Maison",
    villa: "Villa",
    boutique: "Boutique",
    terrain: "Terrain",
  };

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-4">
        <Link
          href="/proprietaires"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{proprietaireGere.nom}</h1>
          <p className="mt-1 text-sm text-neutral-500">Détails du propriétaire</p>
        </div>
      </div>

      {/* Informations de contact */}
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Informations de contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-neutral-400" />
            <span className="text-sm text-neutral-900">{proprietaireGere.telephone || "—"}</span>
          </div>
          {proprietaireGere.email && (
            <div className="flex items-center gap-3">
              <EnvelopeSimple size={16} className="text-neutral-400" />
              <span className="text-sm text-neutral-900">{proprietaireGere.email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <Buildings size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Biens</p>
              <p className="text-lg font-semibold text-neutral-900">{nbBiens}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <DoorOpen size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Logements</p>
              <p className="text-lg font-semibold text-neutral-900">{nbLogements}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-success-50 p-2.5 text-success-600">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Taux d'occupation</p>
              <p className="text-lg font-semibold text-neutral-900">{tauxOccupation}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Revenu mensuel</p>
              <p className="text-lg font-semibold text-neutral-900">{formatMontant(revenuMensuelReel)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des biens */}
      {nbBiens === 0 ? (
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Aucun bien enregistré pour ce propriétaire.</p>
            <Link
              href="/immeubles/new"
              className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ajouter un bien →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Biens de ce propriétaire</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead className="text-right">Logements</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {immeubles?.map((immeuble) => {
                  const nbLogementsImmeuble = (logements ?? []).filter(
                    (l) => l.immeuble_id === immeuble.id
                  ).length;

                  return (
                    <TableRow key={immeuble.id} className="transition-colors duration-200 hover:bg-neutral-50">
                      <TableCell>
                        <Link
                          href={`/immeubles/${immeuble.id}`}
                          className="font-medium text-neutral-900 transition-colors hover:text-primary-600 hover:underline"
                        >
                          {immeuble.nom}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {immeuble.type ? (
                          <Badge variant="primary">{typeLabels[immeuble.type] ?? immeuble.type}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-neutral-600">
                        {immeuble.quartier && immeuble.ville
                          ? `${immeuble.quartier}, ${immeuble.ville}`
                          : immeuble.ville || "—"}
                      </TableCell>
                      <TableCell className="text-right">{nbLogementsImmeuble}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
