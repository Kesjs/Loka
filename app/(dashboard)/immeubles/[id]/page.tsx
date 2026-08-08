import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Buildings, House, CalendarBlank } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ImmeublePage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: immeuble } = await supabase
    .from("immeubles")
    .select("*, logements(id, nom, statut)")
    .eq("id", id)
    .eq("proprietaire_id", user.id)
    .maybeSingle();

  if (!immeuble) return notFound();

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/immeubles" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
            <ArrowLeft size={14} /> Retour aux immeubles
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{immeuble.nom}</h1>
          <p className="mt-1 text-sm text-neutral-500">Vue détaillée de l’immeuble et de ses logements associés.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <Buildings size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Adresse</p>
              <p className="text-sm font-semibold text-neutral-900">{immeuble.adresse ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <House size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Ville</p>
              <p className="text-sm font-semibold text-neutral-900">{immeuble.ville ?? "—"}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-success-50 p-2.5 text-success-600">
              <CalendarBlank size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">Créé le</p>
              <p className="text-sm font-semibold text-neutral-900">{formatDate(immeuble.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Logements du bien</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {immeuble.logements?.length ? (
            <div className="space-y-3">
              {immeuble.logements.map((logement: any) => (
                <div key={logement.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="font-medium text-neutral-900">{logement.nom ?? "Logement"}</div>
                  <div className="mt-1 text-sm text-neutral-500">Statut: {logement.statut}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Aucun logement lié à cet immeuble.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
