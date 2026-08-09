"use client";

import { motion } from "framer-motion";
import {
  CheckCircle,
  CircleNotch,
  LockSimple,
  Calendar,
  Wallet,
} from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatMontant } from "@/lib/utils";

interface ContratDetailCardProps {
  logementName: string;
  statut: "actif" | "termine" | "suspendu" | string;
  dateDebut: string;
  dateFin?: string | null;
  loyerMensuel?: number;
  devise?: string;
  locataireName: string;
}

export function ContratDetailCard({
  logementName,
  statut,
  dateDebut,
  dateFin,
  loyerMensuel,
  devise = "FCFA",
  locataireName,
}: ContratDetailCardProps) {
  const isActive = statut === "actif";
  
  const statutBg = isActive ? "bg-success-50" : "bg-neutral-50";
  const statutBorder = isActive ? "border-success-200" : "border-neutral-200";
  const statutText = isActive ? "text-success-700" : "text-neutral-600";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border ${statutBorder} ${statutBg} shadow-sm`}>
        <CardContent className="p-4 space-y-4">
          {/* Header avec statut */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-neutral-900">
                {logementName}
              </h3>
              <p className="text-xs text-neutral-500 mt-1">{locataireName}</p>
            </div>
            <div
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-success-100 text-success-700"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {isActive ? (
                <>
                  <CheckCircle size={12} weight="fill" />
                  Actif
                </>
              ) : (
                <>
                  <CircleNotch size={12} />
                  {statut}
                </>
              )}
            </div>
          </div>

          {/* Détails du contrat */}
          <div className="grid grid-cols-2 gap-3">
            {/* Date début */}
            <div className="flex items-start gap-2">
              <Calendar size={14} className="text-neutral-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="text-neutral-500 font-medium">Début</p>
                <p className="text-neutral-900 font-semibold">
                  {formatDate(dateDebut)}
                </p>
              </div>
            </div>

            {/* Date fin */}
            <div className="flex items-start gap-2">
              <Calendar size={14} className="text-neutral-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="text-neutral-500 font-medium">Fin</p>
                <p className="text-neutral-900 font-semibold">
                  {dateFin ? formatDate(dateFin) : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Loyer si disponible */}
          {loyerMensuel !== undefined && (
            <div className="flex items-center gap-2 rounded-md bg-white/50 px-3 py-2">
              <Wallet size={14} className="text-primary-500" />
              <div className="text-sm flex-1">
                <p className="text-neutral-500 text-xs">Loyer</p>
                <p className="font-semibold text-neutral-900">
                  {formatMontant(loyerMensuel, devise)}
                </p>
              </div>
            </div>
          )}

          {/* Espace locataire action */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={true}
            className="w-full py-2 px-3 rounded-lg font-medium text-xs transition-all bg-neutral-100 text-neutral-400 cursor-not-allowed flex items-center justify-center gap-2"
            title="Fonctionnalité à venir"
          >
            <LockSimple size={14} weight="fill" />
            Activer l'espace locataire
          </motion.button>

          <p className="text-xs text-neutral-400 text-center">
            ℹ️ Disponible bientôt
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
