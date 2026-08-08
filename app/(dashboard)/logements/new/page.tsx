"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, House, ArrowLeft, Tag, Buildings, CurrencyCircleDollar, ToggleLeft, TextAa, Ruler } from "@phosphor-icons/react/dist/ssr";
import { FormField, fieldInputClass, fieldInputErrorClass } from "@/components/ui/form-field";
import { CurrencyInput } from "@/components/ui/currency-input";
import { PhotoUploadZone } from "@/components/logements/PhotoUploadZone";
import { AmenitiesSelect } from "@/components/logements/AmenitiesSelect";
import { mapDbError } from "@/lib/db-errors";
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

function NewLogementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
      const preselected = searchParams.get("immeuble");
      if (preselected && data?.some((i) => i.id === preselected)) {
        setImmeubleId(preselected);
      } else if (data?.length) {
        setImmeubleId(data[0].id);
      }
    }

    loadImmeubles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

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
      // 1. Upload photos if selected
      let photoPrincipale = null;
      let photosAdditionnelles: string[] = [];

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });
        // Set first file as primary if no explicit primary selected
        formData.append("setAsPrimary", primaryPhotoIndex >= 0 ? "false" : "true");

        // First create logement, then upload photos
        // For now, we'll create logement first and get its ID
      }

      // 2. Create logement
      const { data: logement, error: insertError } = await supabase
        .from("logements")
        .insert({
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
          photo_principale: photoPrincipale,
          photos_additionnelles: photosAdditionnelles,
        })
        .select()
        .single();

      if (insertError) {
        setError(mapDbError(insertError));
        setLoading(false);
        return;
      }

      // 3. Upload photos after logement is created
      if (selectedFiles.length > 0 && logement) {
        try {
          const uploadFormData = new FormData();
          selectedFiles.forEach((file) => {
            uploadFormData.append("files", file);
          });
          // Set primary if explicitly selected
          uploadFormData.append("setAsPrimary", primaryPhotoIndex === 0 ? "true" : "false");

          const uploadResponse = await fetch(`/api/logements/${logement.id}/upload-photo`, {
            method: "POST",
            body: uploadFormData,
          });

          if (!uploadResponse.ok) {
            console.error("Photo upload failed, but logement created successfully");
          }
        } catch (photoError) {
          console.error("Photo upload error:", photoError);
          // Don't fail the entire form if photos fail
        }
      }

      setSaved(true);
      setLoading(false);
      setTimeout(() => router.push("/logements"), 500);
    } catch (err) {
      setError("Une erreur est survenue lors de la création du logement.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full space-y-5 animate-[fadeIn_0.3s_ease-out] lg:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary-600">Ajout de logement</p>
          <h1 className="text-2xl font-semibold text-neutral-900">Créer un nouveau logement</h1>
          <p className="mt-1 text-sm text-neutral-500">Associez un logement à un immeuble pour suivre l'occupation et les loyers.</p>
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

        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Section 1: Basic Info */}
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
              <select
                value={immeubleId}
                onChange={(event) => setImmeubleId(event.target.value)}
                className={fieldErrors.immeubleId ? fieldInputErrorClass : fieldInputClass}
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
            </FormField>

            <FormField label="Type de logement" icon={Tag}>
              <select
                value={typeLogement}
                onChange={(event) => setTypeLogement(event.target.value)}
                className={fieldInputClass}
              >
                {logementTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Statut" icon={ToggleLeft}>
              <select
                value={statut}
                onChange={(event) => setStatut(event.target.value as Statut)}
                className={fieldInputClass}
              >
                <option value="vacant">Vacant</option>
                <option value="occupe">Occupé</option>
              </select>
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
                <p className="text-sm text-neutral-500">Décrivez les détails physiques du logement.</p>
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

            <FormField label="Type de bien" icon={Tag}>
              <select
                value={typeLogement}
                onChange={(event) => setTypeLogement(event.target.value)}
                className={fieldInputClass}
              >
                {logementTypes.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                <p className="text-sm text-neutral-500">Sélectionnez les équipements disponibles.</p>
              </div>
            </div>
          </div>

          <FormField label="Équipements">
            <AmenitiesSelect
              selected={amenities}
              onChange={setAmenities}
              placeholder="Cliquez pour sélectionner les équipements..."
            />
          </FormField>

          {/* Section 4: Photos */}
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
                <House size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">Photos du logement</p>
                <p className="text-sm text-neutral-500">Ajoutez des photos pour améliorer l'attrait du logement.</p>
              </div>
            </div>
          </div>

          <PhotoUploadZone
            onFilesSelected={setSelectedFiles}
            onSetAsPrimary={setPrimaryPhotoIndex}
            primaryIndex={primaryPhotoIndex}
            maxFiles={10}
            className="mt-4"
          />

          {!immeubles.length && (
            <p className="text-sm text-warning-600">
              Vous devez d'abord{" "}
              <Link href="/immeubles/new" className="font-medium underline">
                créer un immeuble
              </Link>{" "}
              avant de pouvoir ajouter un logement.
            </p>
          )}

          <div className="flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
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

export default function NewLogementPage() {
  return (
    <Suspense fallback={null}>
      <NewLogementForm />
    </Suspense>
  );
}
