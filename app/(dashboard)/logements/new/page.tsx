"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, House, ArrowLeft } from "@phosphor-icons/react/dist/ssr";

const logementTypes = ["Studio", "Appartement", "Villa", "Bureau", "Autre"];
const statutOptions = ["vacant", "occupe"] as const;

type Statut = (typeof statutOptions)[number];

export default function NewLogementPage() {
  const router = useRouter();
  const supabase = createClient();

  const [immeubles, setImmeubles] = useState<any[]>([]);
  const [nom, setNom] = useState("");
  const [typeLogement, setTypeLogement] = useState(logementTypes[0]);
  const [loyer, setLoyer] = useState("");
  const [immeubleId, setImmeubleId] = useState("");
  const [statut, setStatut] = useState<Statut>("vacant");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadImmeubles() {
      const { data, error: fetchError } = await supabase
        .from("immeubles")
        .select("id, nom")
        .order("nom", { ascending: true });

      if (fetchError) {
        setError("Impossible de charger les immeubles. Réessayez plus tard.");
        return;
      }

      setImmeubles(data ?? []);
      if (data?.length) {
        setImmeubleId(data[0].id);
      }
    }

    loadImmeubles();
  }, [supabase]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!nom || !immeubleId || !loyer) {
      setError("Veuillez renseigner le nom du logement, l'immeuble et le loyer.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("logements").insert({
      nom,
      immeuble_id: immeubleId,
      type: typeLogement.toLowerCase(),
      loyer_mensuel: Number(loyer),
      statut,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/logements"), 500);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Ajout de logement</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Créer un nouveau logement</h1>
          <p className="mt-1 text-sm text-neutral-500">Associez un logement à un immeuble pour suivre l’occupation et les loyers.</p>
        </div>
        <Link href="/logements" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        {error && <div className="mb-5 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>}
        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-success-50 px-4 py-3 text-sm text-success-700">
            <CheckCircle size={18} />
            Logement enregistré avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <House size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Informations principales</p>
                <p className="text-sm text-neutral-500">Renseignez les éléments essentiels du logement.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-neutral-700">
              Nom du logement
              <input
                value={nom}
                onChange={(event) => setNom(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="Ex: T2 Rivière"
              />
            </label>

            <label className="space-y-2 text-sm text-neutral-700">
              Loyer mensuel
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">FCFA</span>
                <input
                  value={loyer}
                  onChange={(event) => setLoyer(event.target.value)}
                  type="number"
                  min="0"
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-12 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  placeholder="120000"
                />
              </div>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm text-neutral-700">
              Immeuble
              <select
                value={immeubleId}
                onChange={(event) => setImmeubleId(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value="" disabled>
                  Sélectionner un immeuble
                </option>
                {immeubles.map((immeuble) => (
                  <option key={immeuble.id} value={immeuble.id}>
                    {immeuble.nom}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-neutral-700">
              Type de logement
              <select
                value={typeLogement}
                onChange={(event) => setTypeLogement(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                {logementTypes.map((typeOption) => (
                  <option key={typeOption} value={typeOption}>
                    {typeOption}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-neutral-700">
              Statut
              <select
                value={statut}
                onChange={(event) => setStatut(event.target.value as Statut)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                <option value="vacant">Vacant</option>
                <option value="occupe">Occupé</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">Les informations seront visibles dans la liste et sur la fiche du logement.</p>
            <Button type="submit" className="min-w-[220px]" disabled={loading || !immeubles.length}>
              {loading ? "Enregistrement..." : "Enregistrer le logement"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
