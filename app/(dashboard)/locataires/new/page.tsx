"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, User } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/select";

export default function NewLocatairePage() {
  const router = useRouter();
  const supabase = createClient();

  const [immeubles, setImmeubles] = useState<any[]>([]);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [immeubleId, setImmeubleId] = useState("");
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

    if (!nom) {
      setError("Veuillez renseigner le nom du locataire.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("locataires").insert({
      nom,
      email: email || null,
      telephone: telephone || null,
      immeuble_id: immeubleId || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/locataires"), 500);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Ajout de locataire</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Créer un nouveau profil</h1>
          <p className="mt-1 text-sm text-neutral-500">Enregistrez un locataire et liez-le à un immeuble si besoin.</p>
        </div>
        <Link href="/locataires" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        {error && <div className="mb-5 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>}
        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-success-50 px-4 py-3 text-sm text-success-700">
            <CheckCircle size={18} /> Locataire enregistré avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <User size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Informations du locataire</p>
                <p className="text-sm text-neutral-500">Renseignez les coordonnées et l’immeuble associé.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-neutral-700">
              Nom du locataire
              <input
                value={nom}
                onChange={(event) => setNom(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="Ex: Esther Dossou"
              />
            </label>

            <label className="space-y-2 text-sm text-neutral-700">
              Téléphone
              <input
                value={telephone}
                onChange={(event) => setTelephone(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="+229 97 00 00 00"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-neutral-700">
              Adresse email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="locataire@email.com"
              />
            </label>

            <label className="space-y-2 text-sm text-neutral-700">
              Immeuble associé
              <Select
                value={immeubleId}
                onChange={(value) => setImmeubleId(value as string)}
                options={[
                  { value: "", label: "Aucun immeuble" },
                  ...immeubles.map((immeuble) => ({
                    value: immeuble.id,
                    label: immeuble.nom,
                  })),
                ]}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">Le locataire sera visible dans la liste et accessible depuis la fiche détaillée.</p>
            <Button type="submit" className="min-w-[220px]" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer le locataire"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
