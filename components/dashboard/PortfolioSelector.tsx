"use client";

import { useState } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import type { DashboardProprietaireGere } from "@/lib/dashboard";

interface PortfolioSelectorProps {
  proprietaires: DashboardProprietaireGere[];
  onSelect: (proprietaireId: string | null) => void;
  selectedId: string | null;
}

export function PortfolioSelector({
  proprietaires,
  onSelect,
  selectedId,
}: PortfolioSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedProprietaire =
    selectedId && proprietaires.find((p) => p.id === selectedId);
  const displayLabel = selectedProprietaire
    ? selectedProprietaire.nom
    : "Tous les propriétaires";

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-700">
          {displayLabel}
        </span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <CaretDown size={16} className="text-neutral-400" />
        </motion.div>
      </motion.button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="max-h-72 overflow-y-auto">
            {/* Option: Tous les propriétaires */}
            <motion.button
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                selectedId === null
                  ? "bg-primary-50 text-primary-700 font-medium"
                  : "text-neutral-700 hover:bg-neutral-50"
              }`}
              whileHover={{ x: 4 }}
            >
              Tous les propriétaires
            </motion.button>

            {/* Divider */}
            <div className="h-px bg-neutral-100" />

            {/* Propriétaires */}
            {proprietaires.map((prop) => (
              <motion.button
                key={prop.id}
                onClick={() => {
                  onSelect(prop.id);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-l-2 ${
                  selectedId === prop.id
                    ? "bg-primary-50 text-primary-700 font-medium border-l-primary-500"
                    : "text-neutral-700 hover:bg-neutral-50 border-l-transparent"
                }`}
                whileHover={{ x: 4 }}
              >
                <div className="font-medium">{prop.nom}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {prop.nbBiens} bien{prop.nbBiens > 1 ? "s" : ""} •{" "}
                  {prop.nbLogements} logement{prop.nbLogements > 1 ? "s" : ""}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
