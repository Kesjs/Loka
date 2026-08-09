import Link from "next/link";
import { ArrowUp, Wallet, Calendar, CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMontant, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

interface Reversement {
  id: string;
  mois: string;
  montant_commission: number | string;
  montant_verse: number | string;
  statut: string;
  date_versement: string | null;
  notes: string | null;
  proprietaire_gere: any;
}

function getProprietaireName(proprietaire: any): string {
  if (Array.isArray(proprietaire) && proprietaire.length > 0) {
    return proprietaire[0]?.nom || "—";
  }
  return proprietaire?.nom || "—";
}

function getCommissionPct(proprietaire: any): number {
  if (Array.isArray(proprietaire) && proprietaire.length > 0) {
    return proprietaire[0]?.commission_pct || 0;
  }
  return proprietaire?.commission_pct || 0;
}

export default async function ReversementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="space-y-4">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Connectez-vous pour voir vos reversements.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Récupérer le scope de l'organisation
  const orgScope = await getOrganisationScope(supabase);

  // Rediriger si compte individuel (pas de reversements pour les individuels)
  if (orgScope.organisationType === "individuel") {
    redirect("/home");
  }

  if (!orgScope.organisationId) {
    redirect("/home");
  }

  // Récupérer les reversements
  const { data: reversementsRaw } = await supabase
    .from("reversements")
    .select(
      `id, mois, montant_commission, montant_verse, statut, date_versement, notes, 
       proprietaire_gere:proprietaires_geres(nom, commission_pct)`
    )
    .eq("organisation_id", orgScope.organisationId)
    .order("mois", { ascending: false });

  // Cast pour éviter les problèmes de type Supabase
  const reversements = reversementsRaw as Reversement[];

  // Calcul des totaux
  const totalDu = (reversements ?? []).reduce((sum, r) => sum + Number(r.montant_commission || 0), 0);
  const totalVerse = (reversements ?? []).reduce((sum, r) => sum + Number(r.montant_verse || 0), 0);
  const totalNonVerse = totalDu - totalVerse;

  // Grouper par statut
  const nonVerses = (reversements ?? []).filter((r) => r.statut === "non_verse");
  const partiels = (reversements ?? []).filter((r) => r.statut === "partiel");
  const verses = (reversements ?? []).filter((r) => r.statut === "verse");

  const estatusLabels = {
    non_verse: "Non versé",
    partiel: "Partiel",
    verse: "Versé",
  };

  const statutBadgeVariant: Record<string, "primary" | "neutral" | "warning" | "success" | "danger"> = {
    non_verse: "danger",
    partiel: "warning",
    verse: "success",
  };

  if (!reversements || reversements.length === 0) {
    return (
      <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
        <div>
          <p className="text-sm font-medium text-primary-600">Commissions</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Reversements</h1>
          <p className="mt-1 text-sm text-neutral-500">Suivi des commissions à verser aux propriétaires gérés.</p>
        </div>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Aucun reversement enregistré pour le moment.</p>
            <p className="mt-2 text-xs text-neutral-400">
              Les reversements sont calculés mensuellement basés sur les revenus locatifs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Commissions</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Reversements</h1>
          <p className="mt-1 text-sm text-neutral-500">Suivi des commissions versées aux propriétaires gérés.</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Montant total dû</p>
              <p className="text-lg font-semibold text-neutral-900">{formatMontant(totalDu)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-success-50 p-2.5 text-success-600">
              <CheckCircle size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Total versé</p>
              <p className="text-lg font-semibold text-neutral-900">{formatMontant(totalVerse)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-danger-50 p-2.5 text-danger-600">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">En attente</p>
              <p className="text-lg font-semibold text-neutral-900">{formatMontant(totalNonVerse)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des reversements */}
      <Card className="overflow-hidden border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Historique des reversements</CardTitle>
          <CardDescription>Tous les reversements mensuels et leur statut</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propriétaire</TableHead>
                <TableHead>Mois</TableHead>
                <TableHead>Commission %</TableHead>
                <TableHead className="text-right">Montant dû</TableHead>
                <TableHead className="text-right">Montant versé</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reversements.map((r) => {
                const proprietaireNom = getProprietaireName(r.proprietaire_gere);
                const commissionPct = getCommissionPct(r.proprietaire_gere);

                return (
                  <TableRow key={r.id} className="transition-colors duration-200 hover:bg-neutral-50">
                    <TableCell className="font-medium">{proprietaireNom}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-neutral-400" />
                        {formatDate(r.mois)}
                      </div>
                    </TableCell>
                    <TableCell>{commissionPct}%</TableCell>
                    <TableCell className="text-right font-medium">{formatMontant(Number(r.montant_commission) || 0)}</TableCell>
                    <TableCell className="text-right font-medium">{formatMontant(Number(r.montant_verse) || 0)}</TableCell>
                    <TableCell>
                      <Badge variant={statutBadgeVariant[r.statut] || "neutral"}>
                        {estatusLabels[r.statut as keyof typeof estatusLabels] || r.statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Résumé par statut */}
      <div className="grid gap-4 md:grid-cols-3">
        {nonVerses.length > 0 && (
          <Card className="border-danger-200 bg-danger-50/40">
            <CardHeader>
              <CardTitle className="text-sm">À reverser ({nonVerses.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nonVerses.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{getProprietaireName(r.proprietaire_gere)}</span>
                  <span className="font-medium text-danger-600">{formatMontant(Number(r.montant_commission) || 0)}</span>
                </div>
              ))}
              {nonVerses.length > 3 && (
                <p className="text-xs text-neutral-500 pt-2">+{nonVerses.length - 3} autres</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Partiels */}
        {partiels.length > 0 && (
          <Card className="border-accent-200 bg-accent-50/40">
            <CardHeader>
              <CardTitle className="text-sm">Partiels ({partiels.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {partiels.slice(0, 3).map((r) => {
                const restant = (Number(r.montant_commission) || 0) - (Number(r.montant_verse) || 0);
                return (
                  <div key={r.id} className="flex items-center justify-between text-sm">
                    <span className="text-neutral-700">{getProprietaireName(r.proprietaire_gere)}</span>
                    <span className="font-medium text-accent-600">{formatMontant(restant)}</span>
                  </div>
                );
              })}
              {partiels.length > 3 && <p className="text-xs text-neutral-500 pt-2">+{partiels.length - 3} autres</p>}
            </CardContent>
          </Card>
        )}

        {/* Versés */}
        {verses.length > 0 && (
          <Card className="border-success-200 bg-success-50/40">
            <CardHeader>
              <CardTitle className="text-sm">Versés ({verses.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {verses.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{getProprietaireName(r.proprietaire_gere)}</span>
                  <span className="font-medium text-success-600">{formatMontant(Number(r.montant_verse) || 0)}</span>
                </div>
              ))}
              {verses.length > 3 && <p className="text-xs text-neutral-500 pt-2">+{verses.length - 3} autres</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
