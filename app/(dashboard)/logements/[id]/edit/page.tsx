"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, House, ArrowLeft, Tag, Buildings, CurrencyCircleDollar, ToggleLeft, Ruler, TextAa } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { FormField, fieldInputClass, fieldInputErrorClass } from "@/components/ui/form-field";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select } from "@/components/ui/select";
import { PhotoManager } from "@/components/logements/PhotoManager";
import { AmenitiesSelect } from "@/components/logements/AmenitiesSelect";
import { PhotoUploadZone } from "@/components/logements/PhotoUploadZone";
import { mapDbError } from "@/lib/db-errors";
import { fetchJson } from "@/lib/api/fetchJson";
import { cn } from "@/lib/utils";

const logementTypes = [
  { value: "studio", label: "Studio" },
  { value: "appartement", label: "Appartement" },
  { value: "villa", label: "Villa" },
  { value: "bureau", label: "Bureau" },
  { value: "autre", label: "Autre" },
];
const statutOptions = ["vacant", "occupe"] as const;
type Statut = (typeof statutOptions)[number];

interface FieldErrors {
  nom?: string;
  immeubleId?: string;
  loyer?: string;
  surface?: string;
  chambres?: string;
  sallesBain?: string;
}

export default function EditLogementPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [immeubles, setImmeubles] = useState<any[]>([]);
  const [nom, setNom] = useState("");
  const [typeLogement, setTypeLogement] = useState(logementTypes[0].value);
  const [description, setDescription] = useState("");
  const [loyer, setLoyer] = useState("");
  const [immeubleId, setImmeubleId] = useState("");
  const [statut, setStatut] = useState<Statut>("vacant");
  const [chambres, setChambres] = useState("1");
  const [sallesBain, setSallesBain] = useState("1");
  const [surface, setSurface] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [primaryPhotoUrl, setPrimaryPhotoUrl] = useState<string>();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [{ data: immeublesData }, { data: logement, error: fetchError }] = await Promise.all([
        supabase.from("immeubles").select("id, nom").order("nom", { ascending: true }),
        supabase
          .from("logements")
          .select("*")
          .eq("id", params.id)
          .maybeSingle(),
      ]);

      setImmeubles(immeublesData ?? []);

      if (fetchError || !logement) {
        if (fetchError) {
          console.error("Erreur de chargement du logement:", fetchError);
        }
        setError("Logement introuvable.");
        setInitialLoading(false);
        return;
      }

      setNom(logement.nom ?? "");
      setTypeLogement(logement.type ?? logementTypes[0].value);
      setDescription(logement.description ?? "");
      setLoyer(String(logement.loyer_mensuel ?? ""));
      setImmeubleId(logement.immeuble_id ?? "");
      setStatut((logement.statut as Statut) ?? "vacant");
      setChambres(String(logement.chambres ?? 1));
      setSallesBain(String(logement.salles_bain ?? 1));
      setSurface(String(logement.surface_m2 ?? ""));
      setAmenities(logement.amenities ?? []);
      const allPhotos = [
        logement.photo_principale,
        ...(logement.photos_additionnelles || []),
      ].filter(Boolean);
      setPhotos(allPhotos);
      setPrimaryPhotoUrl(logement.photo_principale);
      setInitialLoading(false);
    }

    loadData().catch((err) => {
      console.error("Erreur de chargement du logement:", err);
      setError("Erreur lors du chargement du logement.");
      setInitialLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setWarning("");

    const nextFieldErrors: FieldErrors = {};
    if (!nom.trim()) nextFieldErrors.nom = "Le nom du logement est requis.";
    if (!immeubleId) nextFieldErrors.immeubleId = "Sélectionnez un immeuble.";
    if (!loyer || Number(loyer) <= 0) nextFieldErrors.loyer = "Indiquez un loyer valide.";
    if (surface && Number(surface) <= 0) nextFieldErrors.surface = "La surface doit être positive.";
    if (Number(chambres) <= 0) nextFieldErrors.chambres = "Nombre de chambres invalide.";
    if (Number(sallesBain) <= 0) nextFieldErrors.sallesBain = "Nombre de salles de bain invalide.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      // 1. Upload new photos if any
      let photoWarning = "";
      if (selectedFiles.length > 0) {
        try {
          const uploadFormData = new FormData();
          selectedFiles.forEach((file) => {
            uploadFormData.append("files", file);
          });
          uploadFormData.append("setAsPrimary", "false");

          await fetchJson(`/api/logements/${params.id}/upload-photo`, {
            method: "POST",
            body: uploadFormData,
            fallbackMessage: "L'envoi des photos a échoué.",
          });
        } catch (photoError) {
          // Les métadonnées sont mises à jour même si les photos échouent.
          console.error("Photo upload error:", photoError);
          photoWarning =
            photoError instanceof Error
              ? `Les photos n'ont pas pu être envoyées : ${photoError.message}`
              : "Les photos n'ont pas pu être envoyées.";
          setWarning(photoWarning);
        }
      }

      // 2. Update logement metadata
      const { error: updateError } = await supabase
        .from("logements")
        .update({
          nom: nom.trim(),
          immeuble_id: immeubleId,
          type: typeLogement || null,
          description: description || null,
          loyer_mensuel: Number(loyer),
          statut,
          chambres: Number(chambres),
          salles_bain: Number(sallesBain),
          surface_m2: surface ? Number(surface) : null,
          amenities: amenities,
          photo_principale: primaryPhotoUrl || null,
          photos_additionnelles: photos.filter((p) => p !== primaryPhotoUrl),
        })
        .eq("id", params.id);

      if (updateError) {
        console.error("Erreur de mise à jour du logement:", updateError);
        setError(mapDbError(updateError));
        setLoading(false);
        return;
      }

      setSaved(true);
      setLoading(false);
      // Laisser le temps de lire l'avertissement avant de quitter la page.
      setTimeout(() => router.push(`/logements/${params.id}`), photoWarning ? 4000 : 500);
    } catch (err) {
      console.error("Erreur de mise à jour du logement:", err);
      setError("Une erreur est survenue lors de la mise à jour du logement.");
      setLoading(false);
    }
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
          <h1 className="text-2xl font-semibold text-neutral-900">Modifier le logement</h1>
          <p className="mt-1 text-sm text-neutral-500">Mettez à jour les informations de ce logement.</p>
        </div>
        <Link href={`/logements/${params.id}`} className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-800">
          <ArrowLeft size={15} /> Annuler
        </Link>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        {error && <div className="mb-5 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">{error}</div>}
        {warning && <div className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">{warning}</div>}
        {saved && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-success-50 px-4 py-3 text-sm text-success-700">
            <CheckCircle size={18} />
            Logement mis à jour avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Section 1: Basic Info */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <House size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Informations principales</p>
                <p className="text-sm text-neutral-500">Modifiez les éléments essentiels du logement.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nom du logement" icon={House} required error={fieldErrors.nom}>
              <input
                value={nom}
                onChange={(event) => setNom(event.target.value)}
                className={fieldErrors.nom ? fieldInputErrorClass : fieldInputClass}
                placeholder="Ex: T2 Rivière"
              />
            </FormField>

            <FormField label="Loyer mensuel" icon={CurrencyCircleDollar} required error={fieldErrors.loyer}>
              <CurrencyInput
                value={loyer}
                onChange={setLoyer}
                className={fieldErrors.loyer ? fieldInputErrorClass : fieldInputClass}
                placeholder="120 000"
              />
            </FormField>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Immeuble" icon={Buildings} required error={fieldErrors.immeubleId}>
              <Select
                value={immeubleId}
                onChange={(value) => setImmeubleId(value as string)}
                options={[
                  { value: "", label: "Sélectionner un immeuble" },
                  ...immeubles.map((immeuble) => ({
                    value: immeuble.id,
                    label: immeuble.nom,
                  })),
                ]}
              />
            </FormField>

            <FormField label="Type de logement" icon={Tag}>
              <Select
                value={typeLogement}
                onChange={(value) => setTypeLogement(value as string)}
                options={logementTypes}
              />
            </FormField>

            <FormField label="Statut" icon={ToggleLeft}>
              <Select
                value={statut}
                onChange={(value) => setStatut(value as Statut)}
                options={[
                  { value: "vacant", label: "Vacant" },
                  { value: "occupe", label: "Occupé" },
                ]}
              />
            </FormField>
          </div>

          {/* Section 2: Characteristics */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
                <Ruler size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Caractéristiques</p>
                <p className="text-sm text-neutral-500">Modifiez les détails physiques du logement.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <FormField label="Chambres" error={fieldErrors.chambres}>
              <input
                type="number"
                min="0"
                value={chambres}
                onChange={(e) => setChambres(e.target.value)}
                className={fieldErrors.chambres ? fieldInputErrorClass : fieldInputClass}
                placeholder="1"
              />
            </FormField>

            <FormField label="Salles de bain" error={fieldErrors.sallesBain}>
              <input
                type="number"
                min="0"
                value={sallesBain}
                onChange={(e) => setSallesBain(e.target.value)}
                className={fieldErrors.sallesBain ? fieldInputErrorClass : fieldInputClass}
                placeholder="1"
              />
            </FormField>

            <FormField label="Surface (m²)" error={fieldErrors.surface}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className={fieldErrors.surface ? fieldInputErrorClass : fieldInputClass}
                placeholder="0"
              />
            </FormField>
          </div>

          {/* Description */}
          <div>
            <FormField label="Description" icon={TextAa}>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={cn(fieldInputClass, "min-h-24 resize-none")}
                placeholder="Décrivez le logement : caractéristiques spéciales, ambiance, localisation, etc."
              />
            </FormField>
          </div>

          {/* Section 3: Amenities */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-success-50 p-2.5 text-success-600">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Équipements</p>
                <p className="text-sm text-neutral-500">Modifiez les équipements disponibles.</p>
              </div>
            </div>
          </div>

          <FormField label="Équipements">
            <AmenitiesSelect
              selected={amenities}
              onChange={setAmenities}
            />
          </FormField>

          {/* Section 4: Photos */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <House size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Gestion des photos</p>
                <p className="text-sm text-neutral-500">Réorganisez, supprimez ou ajoutez des photos.</p>
              </div>
            </div>
          </div>

          {/* Existing Photos */}
          {photos.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-neutral-900">Photos actuelles</p>
              <PhotoManager
                photos={photos}
                primaryPhotoUrl={primaryPhotoUrl}
                onPhotoDelete={(url) => {
                  setPhotos((prev) => prev.filter((p) => p !== url));
                  if (primaryPhotoUrl === url) {
                    const remaining = photos.filter((p) => p !== url);
                    setPrimaryPhotoUrl(remaining[0]);
                  }
                }}
                onPhotoOrderChange={setPhotos}
                onSetPrimary={setPrimaryPhotoUrl}
              />
            </div>
          )}

          {/* Upload New Photos */}
          {photos.length < 10 && (
            <div className="space-y-4">
              <p className="text-sm font-medium text-neutral-900">Ajouter des photos</p>
              <PhotoUploadZone
                onFilesSelected={setSelectedFiles}
                maxFiles={10 - photos.length}
                className="mt-4"
              />
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-500">Les modifications sont visibles immédiatement.</p>
            <Button type="submit" className="min-w-[220px]" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
