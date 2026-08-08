import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMontant, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LogementPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: logement } = await supabase
    .from("logements")
    .select("*, immeuble:immeubles(id, nom, adresse, proprietaire_id)")
    .eq("id", id)
    .maybeSingle();

  if (!logement || logement.immeuble?.proprietaire_id !== user.id) {
    return notFound();
  }

  const { data: contrats } = await supabase
    .from("contrats")
    .select("*, locataire:locataires(nom, telephone, email)")
    .eq("logement_id", id)
    .eq("statut", "actif");

  const contrat = (contrats ?? [])[0] ?? null;

  const { data: paiements } = contrat
    ? await supabase
        .from("paiements")
        .select("id, montant, date_paiement, mode")
        .eq("contrat_id", contrat.id)
        .order("date_paiement", { ascending: false })
        .limit(10)
    : { data: [] };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/logements"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-1"
          >
            <ArrowLeft size={14} /> Retour aux logements
          </Link>
          <h1 className="text-lg font-bold text-neutral-900">
            {logement.nom ?? "Logement"}
          </h1>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/logements/${id}/edit`}>
            <PencilSimple size={15} /> Éditer
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Immeuble</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{logement.immeuble?.nom ?? "—"}</p>
              <p className="mt-1 text-sm text-neutral-500">{logement.immeuble?.adresse ?? "Adresse non renseignée"}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">Statut</p>
              <Badge variant={logement.statut === "occupe" ? "success" : "neutral"} className="mt-2">
                {logement.statut === "occupe" ? "Occupé" : "Vacant"}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs text-neutral-400">Type</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900 capitalize">{logement.type ?? "—"}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs text-neutral-400">Loyer mensuel</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{formatMontant(Number(logement.loyer_mensuel) || 0)}</p>
            </div>
            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-xs text-neutral-400">Dernière mise à jour</p>
              <p className="mt-2 text-sm font-semibold text-neutral-900">{formatDate(logement.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Locataire</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {contrat ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-800">
                {contrat.locataire?.nom}
              </p>
              {contrat.locataire?.telephone && (
                <p className="text-sm text-neutral-500 flex items-center gap-1.5">
                  <Phone size={13} /> {contrat.locataire.telephone}
                </p>
              )}
              <p className="text-sm text-neutral-500">
                Contrat : {formatDate(contrat.date_debut)} —{" "}
                {contrat.date_fin ? formatDate(contrat.date_fin) : "en cours"}
              </p>
              <p className="text-sm text-neutral-500">
                Dépôt de garantie : {formatMontant(Number(contrat.depot_garantie) || 0)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-neutral-400">
              Aucun locataire actuellement.
            </p>
          )}
        </CardContent>
      </Card>

      {contrat && (
        <Card>
          <CardHeader>
            <CardTitle>Derniers paiements</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {(paiements ?? []).length === 0 ? (
              <p className="text-sm text-neutral-400">
                Aucun paiement enregistré pour ce contrat.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(paiements ?? []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{formatDate(p.date_paiement)}</TableCell>
                      <TableCell className="capitalize">
                        {p.mode.replace("_", " ")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatMontant(Number(p.montant) || 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}