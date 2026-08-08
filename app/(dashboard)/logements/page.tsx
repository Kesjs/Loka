import Link from "next/link";
import { Plus, Buildings, House, TrendUp, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { formatMontant } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface LogementsPageProps {
  searchParams: Promise<{ immeuble?: string; statut?: string }>;
}

export default async function LogementsPage({ searchParams }: LogementsPageProps) {
  const { immeuble: filtreImmeuble, statut: filtreStatut } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Connectez-vous pour voir vos logements.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: immeubles } = await supabase
    .from("immeubles")
    .select("id, nom")
    .eq("proprietaire_id", user.id)
    .order("nom", { ascending: true });

  const immeubleIds = (immeubles ?? []).map((i) => i.id);

  let query = immeubleIds.length
    ? supabase
        .from("logements")
        .select("id, nom, type, loyer_mensuel, statut, immeuble_id")
        .in("immeuble_id", immeubleIds)
        .order("nom", { ascending: true })
    : null;

  if (query && filtreImmeuble) {
    query = query.eq("immeuble_id", filtreImmeuble);
  }
  if (query && filtreStatut) {
    query = query.eq("statut", filtreStatut);
  }

  const { data: logementsRaw } = query ? await query : { data: [] };

  const logements = (logementsRaw ?? []).map((l) => ({
    id: l.id,
    nom: l.nom,
    type: l.type,
    loyer: Number(l.loyer_mensuel) || 0,
    statut: l.statut as "occupe" | "vacant",
    immeuble_id: l.immeuble_id,
    immeuble_nom: (immeubles ?? []).find((i) => i.id === l.immeuble_id)?.nom ?? "",
  }));

  const nbOccupes = logements.filter((item) => item.statut === "occupe").length;
  const loyerTotal = logements.reduce((sum, item) => sum + item.loyer, 0);

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Gestion des logements</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Votre portefeuille immobilier</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {logements.length} logement{logements.length > 1 ? "s" : ""} • {nbOccupes} occupé{nbOccupes > 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild className="w-full lg:w-auto">
          <Link href="/logements/new">
            <Plus size={16} weight="bold" />
            Ajouter un logement
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <House size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total logements</p>
              <p className="text-lg font-semibold text-neutral-900">{logements.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <UsersThree size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Occupés</p>
              <p className="text-lg font-semibold text-neutral-900">{nbOccupes}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-success-50 p-2.5 text-success-600">
              <TrendUp size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Loyer potentiel</p>
              <p className="text-lg font-semibold text-neutral-900">{formatMontant(loyerTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {immeubles && immeubles.length > 0 && (
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
            <form className="flex flex-1 flex-wrap gap-2">
              <select
                name="immeuble"
                defaultValue={filtreImmeuble ?? ""}
                className="h-10 flex-1 rounded-2xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Tous les immeubles</option>
                {immeubles.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nom}
                  </option>
                ))}
              </select>
              <select
                name="statut"
                defaultValue={filtreStatut ?? ""}
                className="h-10 flex-1 rounded-2xl border border-neutral-300 bg-white px-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value="">Tous les statuts</option>
                <option value="occupe">Occupé</option>
                <option value="vacant">Vacant</option>
              </select>
              <Button type="submit" variant="outline" size="sm" className="h-10">
                Filtrer
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {logements.length === 0 ? (
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Buildings size={24} />
            </div>
            <p className="text-sm text-neutral-500">
              {filtreImmeuble || filtreStatut
                ? "Aucun logement ne correspond à ce filtre."
                : "Aucun logement enregistré pour le moment."}
            </p>
            {!filtreImmeuble && !filtreStatut && (
              <Link href="/immeubles" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                Ajouter un immeuble →
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-neutral-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Immeuble</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Loyer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logements.map((l) => (
                <TableRow key={l.id} className="transition-colors duration-200 hover:bg-neutral-50">
                  <TableCell>
                    <Link href={`/logements/${l.id}`} className="font-medium text-neutral-900 transition-colors hover:text-primary-600 hover:underline">
                      {l.nom ?? "—"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-neutral-600">{l.immeuble_nom}</TableCell>
                  <TableCell className="text-neutral-500 capitalize">{l.type ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={l.statut === "occupe" ? "success" : "neutral"}>
                      {l.statut === "occupe" ? "Occupé" : "Vacant"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatMontant(l.loyer)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
