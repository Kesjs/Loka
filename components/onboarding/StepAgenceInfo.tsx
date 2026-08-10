"use client";

import { AgenceInfo } from "./types";
import { Button } from "@/components/ui/button";
import { LogoUploader } from "@/components/logos/LogoUploader";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface StepAgenceInfoProps {
  value: AgenceInfo | undefined;
  onChange: (info: AgenceInfo) => void;
  onNext: () => void;
}

export default function StepAgenceInfo({ value, onChange, onNext }: StepAgenceInfoProps) {
  const info = value || { nom: "", ville: "", taillePortefeuille: "1-10" };
  const isComplete = info.nom && info.ville;
  const [organisationId, setOrganisationId] = useState<string | null>(null);

  // Récupérer l'organisation ID pour l'upload logo
  useEffect(() => {
    const fetchOrgId = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Récupérer l'organisation associée à l'utilisateur
          const { data: orgs } = await supabase
            .from("organisations")
            .select("id")
            .eq("created_by", user.id)
            .limit(1);
          
          if (orgs?.[0]) {
            setOrganisationId(orgs[0].id);
          } else {
            // Sinon, utiliser l'user ID comme fallback (sera créé durant le save)
            setOrganisationId(user.id);
          }
        }
      } catch (error) {
        console.error("Erreur récupération org ID:", error);
      }
    };
    
    fetchOrgId();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-4 text-left">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Nom de l&apos;agence <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={info.nom}
            onChange={(e) => onChange({ ...info, nom: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex : Mon Agence SARL"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Ville principale <span className="text-danger-500">*</span>
          </label>
          <input
            type="text"
            value={info.ville}
            onChange={(e) => onChange({ ...info, ville: e.target.value })}
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ex : Cotonou"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">
            Taille du portefeuille (environ)
          </label>
          <select
            value={info.taillePortefeuille}
            onChange={(e) =>
              onChange({
                ...info,
                taillePortefeuille: e.target.value as "1-10" | "10-50" | "50+",
              })
            }
            className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="1-10">1 à 10 biens</option>
            <option value="10-50">10 à 50 biens</option>
            <option value="50+">50+ biens</option>
          </select>
        </div>

        {/* Logo upload — C.6 */}
        {organisationId && (
          <div className="border-t border-neutral-200 pt-4">
            <LogoUploader
              organisationId={organisationId}
              currentLogoUrl={info.logoUrl}
              onUploadSuccess={(url) => {
                onChange({ ...info, logoUrl: url });
              }}
              size="md"
              label="Logo de votre agence (optionnel)"
            />
          </div>
        )}

        <p className="border-t border-neutral-200 pt-3 text-xs text-neutral-500">
          <span className="text-danger-500">*</span> Champs obligatoires
        </p>
      </div>

      <Button onClick={onNext} disabled={!isComplete} className="w-full">
        Continuer
      </Button>
    </div>
  );
}
