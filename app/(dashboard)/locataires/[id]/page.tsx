import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, EnvelopeSimple, Phone, UsersThree, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LocatairePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: locataire } = await supabase
    .from("locataires")
    .select("*, contrats(id, statut, date_debut, date_fin, logement:logements(nom))")
    .eq("id", id)
    .eq("proprietaire_id", user.id)
    .maybeSingle();

  if (!locataire) return notFound();

  const contratsActifs = (locataire.contrats ?? []).filter((contrat: any) => contrat.statut === "actif").length;

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/locataires" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
            <ArrowLeft size={14} /> Retour aux locataires
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{locataire.nom}</h1>
          <p className="mt-1 text-sm text-neutral-500">Profil du locataire, contrats et historique de résidence.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <EnvelopeSimple size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Email</p>
              <p className="text-sm font-semibold text-neutral-900">{locataire.email ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <Phone size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Téléphone</p>
              <p className="text-sm font-semibold text-neutral-900">{locataire.telephone ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-success-50 p-2.5 text-success-600">
              <CalendarBlank size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Ajouté le</p>
              <p className="text-sm font-semibold text-neutral-900">{formatDate(locataire.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersThree size={18} /> Contrats associés
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {locataire.contrats?.length ? (
            <div className="space-y-3">
              <p className="text-sm text-neutral-500">{contratsActifs} contrat{contratsActifs > 1 ? "s" : ""} actif{contratsActifs > 1 ? "s" : ""}</p>
              {locataire.contrats.map((contrat: any) => (
                <div key={contrat.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="text-sm font-semibold text-neutral-900">{contrat.logement?.nom ?? "Logement"}</div>
                  <div className="mt-1 text-sm text-neutral-500">Statut: {contrat.statut}</div>
                  <div className="text-sm text-neutral-500">{formatDate(contrat.date_debut)} — {contrat.date_fin ? formatDate(contrat.date_fin) : "—"}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Aucun contrat trouvé pour ce locataire.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
