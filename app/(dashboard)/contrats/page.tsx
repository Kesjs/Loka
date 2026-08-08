import Link from "next/link";
import { Handshake, CurrencyCircleDollar, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { formatMontant, formatDate } from "@/lib/utils";

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

  const { data: locataires } = await supabase
    .from("locataires")
    .select("id")
    .eq("proprietaire_id", user.id);

  const locataireIds = (locataires ?? []).map((item: any) => item.id);

  const { data: contrats } = locataireIds.length
    ? await supabase
        .from("contrats")
        .select("id, loyer_mensuel, depot_garantie, date_debut, date_fin, statut, locataire:locataires(nom), logement:logements(nom)")
        .in("locataire_id", locataireIds)
        .eq("statut", "actif")
        .order("date_debut", { ascending: false })
    : { data: [] as any };

  const loyerTotal = (contrats ?? []).reduce((sum: number, contrat: any) => sum + Number(contrat.loyer_mensuel || 0), 0);

  if (!contrats || contrats.length === 0) {
    return (
      <div className="space-y-5">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Handshake size={24} />
            </div>
            <p className="text-sm text-neutral-500">Aucun contrat actif pour le moment.</p>
            <Link href="/locataires" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
              Ajouter un locataire <ArrowRight size={14} />
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
          <p className="text-sm font-medium text-primary-600">Contrats actifs</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Vos locations en cours</h1>
          <p className="mt-1 text-sm text-neutral-500">{contrats.length} contrat{contrats.length > 1 ? "s" : ""} en cours</p>
        </div>
        <Link href="/contrats/new" className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700">
          Ajouter un contrat <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <Handshake size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Contrats actifs</p>
              <p className="text-lg font-semibold text-neutral-900">{contrats.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <CurrencyCircleDollar size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Loyer mensuel total</p>
              <p className="text-lg font-semibold text-neutral-900">{formatMontant(loyerTotal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-neutral-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Locataire</TableHead>
              <TableHead>Logement</TableHead>
              <TableHead>Date début</TableHead>
              <TableHead>Date fin</TableHead>
              <TableHead className="text-right">Loyer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contrats.map((contrat: any) => (
              <TableRow key={contrat.id} className="transition-colors duration-200 hover:bg-neutral-50">
                <TableCell>
                  <Link href={`/contrats/${contrat.id}`} className="font-medium text-neutral-900 transition-colors hover:text-primary-600 hover:underline">
                    {contrat.locataire?.nom ?? "—"}
                  </Link>
                </TableCell>
                <TableCell>{contrat.logement?.nom ?? "—"}</TableCell>
                <TableCell>{formatDate(contrat.date_debut)}</TableCell>
                <TableCell>{contrat.date_fin ? formatDate(contrat.date_fin) : "—"}</TableCell>
                <TableCell className="text-right">{formatMontant(Number(contrat.loyer_mensuel) || 0)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
