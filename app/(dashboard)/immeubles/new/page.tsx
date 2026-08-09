"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Buildings, CheckCircle, MapPin, Tag, Users } from "@phosphor-icons/react/dist/ssr";
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

interface ProprietaireGere {
  id: string;
  nom: string;
}

export default function NewImmeublePage() {
  const router = useRouter();
  const supabase = createClient();

  const [nom, setNom] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ville, setVille] = useState("");
  const [typeImmeuble, setTypeImmeuble] = useState("");
  const [proprietaireGereId, setProprietaireGereId] = useState("");
  const [proprietairesGeres, setProprietairesGeres] = useState<ProprietaireGere[]>([]);
  const [organisationType, setOrganisationType] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Charger les propriétaires gérés à l'initialisation
  useEffect(() => {
    async function loadProprietairesGeres() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Récupérer l'organisation
      const { data: org } = await supabase
        .from("organisations")
        .select("id, type")
        .eq("owner_user_id", user.id)
        .maybeSingle();

      if (org) {
        setOrganisationType(org.type);

        // Si gestionnaire/agence, charger les propriétaires gérés
        if (org.type !== "individuel") {
          const { data: pgs } = await supabase
            .from("proprietaires_geres")
            .select("id, nom")
            .eq("organisation_id", org.id)
            .order("nom", { ascending: true });

          setProprietairesGeres(pgs ?? []);
        }
      }
    }

    loadProprietairesGeres();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!nom.trim()) {
      setFieldErrors({ nom: "Le nom de l'immeuble est requis." });
      return;
    }
    setFieldErrors({});
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Session expirée, merci de vous reconnecter.");
      setLoading(false);
      return;
    }

    // Récupérer l'organisation_id si elle existe
    const { data: org } = await supabase
      .from("organisations")
      .select("id")
      .eq("owner_user_id", user.id)
      .maybeSingle();

    const { error: insertError } = await supabase.from("immeubles").insert({
      proprietaire_id: user.id,
      organisation_id: org?.id || null,
      proprietaire_gere_id: proprietaireGereId || null,
      nom: nom.trim(),
      adresse: adresse || null,
      ville: ville || null,
      type: typeImmeuble || null,
    });

    if (insertError) {
      setError(mapDbError(insertError));
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
          <p className="text-sm font-medium text-primary-600">Ajout d'immeuble</p>
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

          {/* Champ Propriétaire géré (visible seulement pour gestionnaire/agence) */}
          {organisationType && organisationType !== "individuel" && proprietairesGeres.length > 0 && (
            <FormField label="Propriétaire géré (optionnel)" icon={Users}>
              <Select
                value={proprietaireGereId}
                onChange={(value) => setProprietaireGereId(value as string)}
                options={[
                  { value: "", label: "Aucun (bien personnel)" },
                  ...proprietairesGeres.map((pg) => ({ value: pg.id, label: pg.nom })),
                ]}
              />
            </FormField>
          )}

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">Ces informations permettront un meilleur suivi de votre patrimoine.</p>
            <Button type="submit" className="min-w-[220px]" disabled={loading}>
              {loading ? "Sauvegarde..." : "Enregistrer l'immeuble"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
