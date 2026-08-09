"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Buildings, CheckCircle, MapPin, Tag } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { FormField, fieldInputClass, fieldInputErrorClass } from "@/components/ui/form-field";
import { Select } from "@/components/ui/select";
import { mapDbError } from "@/lib/db-errors";

const immeubleTypes = [
  { value: "immeuble", label: "Immeuble" },
  { value: "maison", label: "Maison" },
  { value: "villa", label: "Villa" },
  { value: "boutique", label: "Boutique" },
  { value: "terrain", label: "Terrain" },
];

interface FieldErrors {
  nom?: string;
}

export default function EditImmeublePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [typeImmeuble, setTypeImmeuble] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadImmeuble() {
      const { data, error: fetchError } = await supabase
        .from("immeubles")
        .select("nom, adresse, ville, type")
        .eq("id", params.id)
        .maybeSingle();

      if (fetchError || !data) {
        setError("Immeuble introuvable.");
        setInitialLoading(false);
        return;
      }

      setNom(data.nom ?? "");
      setAdresse(data.adresse ?? "");
      setVille(data.ville ?? "");
      setTypeImmeuble(data.type ?? "");
      setInitialLoading(false);
    }

    loadImmeuble();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!nom.trim()) {
      setFieldErrors({ nom: "Le nom de l'immeuble est requis." });
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const { error: updateError } = await supabase
      .from("immeubles")
      .update({
        nom: nom.trim(),
        adresse: adresse || null,
        ville: ville || null,
        type: typeImmeuble || null,
      })
      .eq("id", params.id);

    if (updateError) {
      setError(mapDbError(updateError));
      setLoading(false);
      return;
    }

    setSaved(true);
    setLoading(false);
    setTimeout(() => router.push(`/immeubles/${params.id}`), 500);
  }

  if (initialLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm animate-pulse">
          <div className="h-6 w-1/3 rounded bg-neutral-100" />
          <div className="mt-6 space-y-4">
            <div className="h-12 rounded-2xl bg-neutral-100" />
            <div className="h-12 rounded-2xl bg-neutral-100" />
            <div className="h-12 rounded-2xl bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Modification</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Modifier l'immeuble</h1>
          <p className="mt-1 text-sm text-neutral-500">Mettez à jour les informations de ce bien.</p>
        </div>
        <Link href={`/immeubles/${params.id}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
          <ArrowLeft size={15} /> Annuler
        </Link>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        {error && <div className="mb-5 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>}
        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-success-50 px-4 py-3 text-sm text-success-700">
            <CheckCircle size={18} /> Immeuble mis à jour avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <Buildings size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Informations du bien</p>
                <p className="text-sm text-neutral-500">Détaillez l'adresse et le type de votre immeuble.</p>
              </div>
            </div>
          </div>

          <FormField label="Nom" icon={Buildings} required error={fieldErrors.nom}>
            <input
              value={nom}
              onChange={(event) => setNom(event.target.value)}
              className={fieldErrors.nom ? fieldInputErrorClass : fieldInputClass}
              placeholder="Ex: Résidence des Fleurs"
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Adresse" icon={MapPin}>
              <input
                value={adresse}
                onChange={(event) => setAdresse(event.target.value)}
                className={fieldInputClass}
                placeholder="123 rue du Port"
              />
            </FormField>
            <FormField label="Ville" icon={MapPin}>
              <input
                value={ville}
                onChange={(event) => setVille(event.target.value)}
                className={fieldInputClass}
                placeholder="Cotonou"
              />
            </FormField>
          </div>

          <FormField label="Type d'immeuble" icon={Tag}>
            <Select
              value={typeImmeuble}
              onChange={(value) => setTypeImmeuble(value as string)}
              options={[
                { value: "", label: "Sélectionner un type" },
                ...immeubleTypes,
              ]}
            />
          </FormField>

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">Les modifications sont visibles immédiatement.</p>
            <Button type="submit" className="min-w-[220px]" disabled={loading}>
              {loading ? "Sauvegarde..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
