import Link from "next/link";
import { Buildings, House, ArrowRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { ImmeubleCard } from "@/components/immeubles/ImmeubleCard";

const typeLabels: Record<string, string> = {
  immeuble: "Immeuble",
  maison: "Maison",
  villa: "Villa",
  boutique: "Boutique",
  terrain: "Terrain",
};

export default async function ImmeublesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Connectez-vous pour voir vos immeubles.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: immeubles } = await supabase
    .from("immeubles")
    .select("id, nom, adresse, ville, type, created_at")
    .eq("proprietaire_id", user.id)
    .order("nom", { ascending: true });

  const immeubleIds = (immeubles ?? []).map((i) => i.id);

  // Vrai count des logements par immeuble (remplace l'ancien placeholder statique)
  const { data: logementsCount } = immeubleIds.length
    ? await supabase.from("logements").select("id, immeuble_id").in("immeuble_id", immeubleIds)
    : { data: [] };

  const nbLogementsParImmeuble = new Map<string, number>();
  (logementsCount ?? []).forEach((l) => {
    nbLogementsParImmeuble.set(l.immeuble_id, (nbLogementsParImmeuble.get(l.immeuble_id) ?? 0) + 1);
  });
  const totalLogements = logementsCount?.length ?? 0;

  if (!immeubles || immeubles.length === 0) {
    return (
      <div className="space-y-5">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Buildings size={24} />
            </div>
            <p className="text-sm text-neutral-500">Aucun immeuble pour l'instant.</p>
            <Link href="/immeubles/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              Ajouter un immeuble <ArrowRight size={14} />
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
          <p className="text-sm font-medium text-primary-600">Immobilier</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Vos immeubles et actifs</h1>
          <p className="mt-1 text-sm text-neutral-500">{immeubles.length} bien{immeubles.length > 1 ? "s" : ""} enregistré{immeubles.length > 1 ? "s" : ""}</p>
        </div>
        <Button asChild className="w-full lg:w-auto">
          <Link href="/immeubles/new">
            <Plus size={16} weight="bold" />
            Ajouter un immeuble
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
              <p className="text-sm text-neutral-500">Immeubles</p>
              <p className="text-lg font-semibold text-neutral-900">{immeubles.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <House size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Logements liés</p>
              <p className="text-lg font-semibold text-neutral-900">{totalLogements}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile : cards empilées */}
      <div className="space-y-3 lg:hidden">
        {immeubles.map((immeuble) => (
          <ImmeubleCard
            key={immeuble.id}
            id={immeuble.id}
            nom={immeuble.nom}
            adresse={immeuble.adresse}
            ville={immeuble.ville}
            type={immeuble.type}
            createdAt={immeuble.created_at}
            nbLogements={nbLogementsParImmeuble.get(immeuble.id) ?? 0}
          />
        ))}
      </div>

      {/* Desktop : table */}
      <Card className="hidden overflow-hidden border-neutral-200 shadow-sm lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Logements</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {immeubles.map((immeuble) => (
              <TableRow key={immeuble.id} className="transition-colors duration-200 hover:bg-neutral-50">
                <TableCell>
                  <Link href={`/immeubles/${immeuble.id}`} className="font-medium text-neutral-900 transition-colors hover:text-primary-600 hover:underline">
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
                <TableCell>{immeuble.adresse ?? "—"}</TableCell>
                <TableCell>{immeuble.ville ?? "—"}</TableCell>
                <TableCell>{nbLogementsParImmeuble.get(immeuble.id) ?? 0}</TableCell>
                <TableCell>{formatDate(immeuble.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
