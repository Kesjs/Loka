"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Buildings, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export default function NewImmeublePage() {
  const router = useRouter();
  const supabase = createClient();

  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [typeImmeuble, setTypeImmeuble] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    if (!nom) {
      setError("Veuillez renseigner le nom de l'immeuble.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("immeubles").insert({
      nom,
      adresse: adresse || null,
      ville: ville || null,
      type: typeImmeuble || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push("/immeubles"), 500);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Ajout d’immeuble</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Créer un nouveau bien</h1>
          <p className="mt-1 text-sm text-neutral-500">Enregistrez un nouveau bien immobilier et préparez son suivi.</p>
        </div>
        <Link href="/immeubles" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
          <ArrowLeft size={15} /> Annuler
        </Link>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        {error && <div className="mb-5 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>}
        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-success-50 px-4 py-3 text-sm text-success-700">
            <CheckCircle size={18} /> Immeuble enregistré avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <Buildings size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Informations du bien</p>
                <p className="text-sm text-neutral-500">Détaillez l’adresse et le type de votre immeuble.</p>
              </div>
            </div>
          </div>

          <label className="space-y-2 text-sm text-neutral-700">
            Nom
            <input
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Ex: Résidence des Fleurs"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-neutral-700">
              Adresse
              <input
                value={adresse}
                onChange={(event) => setAdresse(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="123 rue du Port"
              />
            </label>
            <label className="space-y-2 text-sm text-neutral-700">
              Ville
              <input
                value={ville}
                onChange={(event) => setVille(event.target.value)}
                className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                placeholder="Cotonou"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-neutral-700">
            Type d'immeuble
            <input
              value={typeImmeuble}
              onChange={(event) => setTypeImmeuble(event.target.value)}
              className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              placeholder="Résidentiel, mixte..."
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">Ces informations permettront un meilleur suivi de votre patrimoine.</p>
            <Button type="submit" className="min-w-[220px]" disabled={loading}>
              {loading ? "Sauvegarde..." : "Enregistrer l’immeuble"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
