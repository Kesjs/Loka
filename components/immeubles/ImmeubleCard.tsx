import Link from "next/link";
import { MapPin, House, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  immeuble: "Immeuble",
  maison: "Maison",
  villa: "Villa",
  boutique: "Boutique",
  terrain: "Terrain",
};

interface ImmeubleCardProps {
  id: string;
  nom: string;
  adresse: string | null;
  ville: string | null;
  type: string | null;
  createdAt: string;
  nbLogements: number;
}

export function ImmeubleCard({ id, nom, adresse, ville, type, createdAt, nbLogements }: ImmeubleCardProps) {
  return (
    <Link href={`/immeubles/${id}`}>
      <Card className="border-neutral-200 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99] transition-transform">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <p className="font-medium text-neutral-900 truncate">{nom}</p>
              {type && (
                <Badge variant="primary" className="shrink-0">
                  {typeLabels[type] ?? type}
                </Badge>
              )}
            </div>
            {(adresse || ville) && (
              <p className="flex items-center gap-1 text-xs text-neutral-500 truncate">
                <MapPin size={12} className="shrink-0" />
                {[adresse, ville].filter(Boolean).join(", ")}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <House size={12} />
                {nbLogements} logement{nbLogements > 1 ? "s" : ""}
              </span>
              <span>Ajouté le {formatDate(createdAt)}</span>
            </div>
          </div>
          <CaretRight size={16} className="shrink-0 text-neutral-300" />
        </CardContent>
      </Card>
    </Link>
  );
}
