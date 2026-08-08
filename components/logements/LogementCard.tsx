import Link from "next/link";
import { Buildings, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMontant } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  studio: "Studio",
  appartement: "Appartement",
  villa: "Villa",
  bureau: "Bureau",
  autre: "Autre",
};

interface LogementCardProps {
  id: string;
  nom: string;
  immeubleNom: string;
  type: string | null;
  statut: "occupe" | "vacant";
  loyer: number;
}

export function LogementCard({ id, nom, immeubleNom, type, statut, loyer }: LogementCardProps) {
  return (
    <Link href={`/logements/${id}`}>
      <Card className="border-neutral-200 shadow-sm transition-shadow hover:shadow-md active:scale-[0.99] transition-transform">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium text-neutral-900 truncate">{nom || "—"}</p>
              <Badge variant={statut === "occupe" ? "success" : "neutral"}>
                {statut === "occupe" ? "Occupé" : "Vacant"}
              </Badge>
            </div>
            <p className="flex items-center gap-1 text-xs text-neutral-500 truncate">
              <Buildings size={12} className="shrink-0" />
              {immeubleNom}
              {type && <span className="capitalize">· {typeLabels[type] ?? type}</span>}
            </p>
            <p className="text-sm font-semibold text-neutral-900">{formatMontant(loyer)}</p>
          </div>
          <CaretRight size={16} className="shrink-0 text-neutral-300" />
        </CardContent>
      </Card>
    </Link>
  );
}
