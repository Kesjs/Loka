import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, PencilSimple, DoorOpen, Bathtub, House, MapPin } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageGallery } from "@/components/logements/ImageGallery";
import { formatMontant, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LogementPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return notFound();

  const { data: logement } = await supabase
    .from("logements")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!logement || logement.proprietaire_id !== user.id) {
    return notFound();
  }

  // Get immeuble info
  const { data: immeuble } = await supabase
    .from("immeubles")
    .select("id, nom, adresse, ville")
    .eq("id", logement.immeuble_id)
    .maybeSingle();

  const { data: contrats } = await supabase
    .from("contrats")
    .select("*, locataire:locataires(nom, telephone, email)")
    .eq("logement_id", id)
    .eq("statut", "actif");

  const contrat = (contrats ?? [])[0] ?? null;

  const { data: paiements } = contrat
    ? await supabase
        .from("paiements")
        .select("id, montant, date_paiement, mode")
        .eq("contrat_id", contrat.id)
        .order("date_paiement", { ascending: false })
        .limit(10)
    : { data: [] };

  // Gather photos
  const allPhotos = [
    logement.photo_principale,
    ...(logement.photos_additionnelles || []),
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/logements"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-2"
          >
            <ArrowLeft size={14} /> Retour aux logements
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">
            {logement.nom ?? "Logement"}
          </h1>
          {immeuble && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
              <MapPin size={14} />
              {immeuble.nom} {immeuble.ville ? `- ${immeuble.ville}` : ''}
            </p>
          )}
        </div>
        <Button asChild size="sm">
          <Link href={`/logements/${id}/edit`}>
            <PencilSimple size={15} weight="bold" /> Éditer
          </Link>
        </Button>
      </div>

      {/* Photo Gallery */}
      {allPhotos.length > 0 && (
        <Card className="border-neutral-200 shadow-sm overflow-hidden">
          <ImageGallery
            images={allPhotos}
            title={logement.nom || "Logement"}
            height="lg"
            showThumbnails={allPhotos.length > 1}
            className="!rounded-none"
          />
        </Card>
      )}

      {/* Status & Type Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant={logement.statut === "occupe" ? "success" : "neutral"} className="text-xs px-3 py-1">
          {logement.statut === "occupe" ? "✓ Occupé" : "○ Vacant"}
        </Badge>
        {logement.type && (
          <Badge variant="neutral" className="text-xs px-3 py-1">
            {logement.type}
          </Badge>
        )}
      </div>

      {/* Key Characteristics */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Loyer */}
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="p-4 space-y-1">
            <p className="text-xs text-neutral-500 font-semibold uppercase">Loyer mensuel</p>
            <p className="text-2xl font-bold text-neutral-900">
              {formatMontant(Number(logement.loyer_mensuel) || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Chambres */}
        {logement.chambres && (
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-neutral-600">
                <DoorOpen size={16} />
                <p className="text-xs font-semibold uppercase">Chambres</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{logement.chambres}</p>
            </CardContent>
          </Card>
        )}

        {/* Salles de bain */}
        {logement.salles_bain && (
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-neutral-600">
                <Bathtub size={16} />
                <p className="text-xs font-semibold uppercase">SDB</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{logement.salles_bain}</p>
            </CardContent>
          </Card>
        )}

        {/* Surface */}
        {logement.surface_m2 && (
          <Card className="border-neutral-200 shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-neutral-600">
                <House size={16} />
                <p className="text-xs font-semibold uppercase">Surface</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{Math.round(logement.surface_m2)}m²</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Description */}
      {logement.description && (
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{logement.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Amenities */}
      {logement.amenities && logement.amenities.length > 0 && (
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Équipements</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {logement.amenities.map((amenity: string) => (
                <span
                  key={amenity}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium"
                >
                  {amenity.replace('_', ' ')}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Immeuble Info */}
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Immeuble</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          <p className="text-sm font-semibold text-neutral-900">{immeuble?.nom || "—"}</p>
          {immeuble?.adresse && (
            <p className="text-sm text-neutral-600">{immeuble.adresse}</p>
          )}
          {immeuble?.ville && (
            <p className="text-sm text-neutral-500">{immeuble.ville}</p>
          )}
        </CardContent>
      </Card>

      {/* Tenant Info */}
      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Locataire</CardTitle>
          {contrat && (
            <CardDescription>
              Contrat du {formatDate(contrat.date_debut)} 
              {contrat.date_fin ? ` au ${formatDate(contrat.date_fin)}` : ' - en cours'}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          {contrat ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Nom</p>
                <p className="text-sm font-medium text-neutral-900">{contrat.locataire?.nom}</p>
              </div>
              {contrat.locataire?.telephone && (
                <div>
                  <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Téléphone</p>
                  <p className="text-sm text-neutral-700">{contrat.locataire.telephone}</p>
                </div>
              )}
              {contrat.locataire?.email && (
                <div>
                  <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Email</p>
                  <p className="text-sm text-neutral-700">{contrat.locataire.email}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Loyer du contrat</p>
                <p className="text-sm font-semibold text-neutral-900">{formatMontant(Number(contrat.loyer_mensuel) || 0)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 font-semibold uppercase mb-1">Dépôt de garantie</p>
                <p className="text-sm font-semibold text-neutral-900">{formatMontant(Number(contrat.depot_garantie) || 0)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-neutral-500">Aucun locataire actuellement. Ce logement est vacant.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {contrat && (
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Derniers paiements</CardTitle>
            <CardDescription>Les 10 derniers paiements enregistrés</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {(paiements ?? []).length === 0 ? (
              <p className="text-sm text-neutral-500">Aucun paiement enregistré pour ce contrat.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(paiements ?? []).map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">{formatDate(p.date_paiement)}</TableCell>
                      <TableCell className="text-sm capitalize">{p.mode.replace("_", " ")}</TableCell>
                      <TableCell className="text-right font-medium text-sm">{formatMontant(Number(p.montant) || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="p-4">
          <p className="text-xs text-neutral-500">
            Créé le {formatDate(logement.created_at)} • Dernière mise à jour : {formatDate(logement.updated_at)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}