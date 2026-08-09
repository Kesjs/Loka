"use client";

import { motion } from "framer-motion";
import { CircleNotch, LockSimple } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TenantPortalCardProps {
  locataireName: string;
  logementName: string;
  isActive?: boolean;
}

export function TenantPortalCard({
  locataireName,
  logementName,
  isActive = false,
}: TenantPortalCardProps) {
  return (
    <Card className="border-neutral-200 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Espace Locataire</CardTitle>
          {!isActive && (
            <div className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1">
              <CircleNotch size={12} className="text-neutral-500" />
              <span className="text-xs font-medium text-neutral-600">Non activé</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tenant Info */}
        <div className="space-y-2 rounded-lg bg-neutral-50 p-3">
          <div className="text-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Locataire
            </p>
            <p className="font-semibold text-neutral-900">{locataireName}</p>
          </div>
          <div className="text-sm">
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Logement
            </p>
            <p className="font-semibold text-neutral-900">{logementName}</p>
          </div>
        </div>

        {/* Status Section */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
            Statut
          </p>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                isActive
                  ? "border-success-500 bg-success-50"
                  : "border-neutral-300 bg-white"
              }`}
            >
              {isActive ? (
                <div className="h-3 w-3 rounded-full bg-success-500" />
              ) : (
                <div className="h-3 w-3 rounded-full border-2 border-neutral-300" />
              )}
            </div>
            <div className="text-sm">
              {isActive ? (
                <div>
                  <p className="font-medium text-success-700">Activé</p>
                  <p className="text-xs text-success-600">
                    Le locataire a accès à son espace personnel
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-medium text-neutral-700">Non activé</p>
                  <p className="text-xs text-neutral-500">
                    Le locataire n'a pas encore accès à son espace personnel
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={!isActive ? { scale: 1.02 } : {}}
          whileTap={!isActive ? { scale: 0.98 } : {}}
          disabled={true}
          className={`w-full py-2.5 px-3 rounded-lg font-medium text-sm transition-all ${
            isActive
              ? "bg-success-100 text-success-700 cursor-default"
              : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          }`}
          title="Fonctionnalité à venir"
        >
          <div className="flex items-center justify-center gap-2">
            {!isActive && <LockSimple size={16} weight="fill" />}
            {isActive ? "✓ Espace activé" : "Activer l'espace locataire"}
          </div>
        </motion.button>

        {/* Help text */}
        <p className="text-xs text-neutral-500 text-center">
          ℹ️ Fonctionnalité disponible bientôt
        </p>
      </CardContent>
    </Card>
  );
}
