import Link from "next/link";
import { Buildings, House, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

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
    .select("id, nom, adresse, ville, created_at")
    .eq("proprietaire_id", user.id)
    .order("nom", { ascending: true });

  if (!immeubles || immeubles.length === 0) {
    return (
      <div className="space-y-5">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Buildings size={24} />
            </div>
            <p className="text-sm text-neutral-500">Aucun immeuble pour l’instant.</p>
            <Link href="/logements" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              Ajouter un logement <ArrowRight size={14} />
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
        <Link href="/immeubles/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
          Ajouter un immeuble <ArrowRight size={14} />
        </Link>
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
              <p className="text-lg font-semibold text-neutral-900">À suivre</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-neutral-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {immeubles.map((immeuble: any) => (
              <TableRow key={immeuble.id} className="transition-colors duration-200 hover:bg-neutral-50">
                <TableCell>
                  <Link href={`/immeubles/${immeuble.id}`} className="font-medium text-neutral-900 transition-colors hover:text-primary-600 hover:underline">
                    {immeuble.nom}
                  </Link>
                </TableCell>
                <TableCell>{immeuble.adresse ?? "—"}</TableCell>
                <TableCell>{immeuble.ville ?? "—"}</TableCell>
                <TableCell>{formatDate(immeuble.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
