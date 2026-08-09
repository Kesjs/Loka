"use client";

import { motion } from "framer-motion";
import { MoyenPaiement } from "./types";
import { Wallet, CheckCircle } from "@phosphor-icons/react";

interface StepPaiementProps {
  moyenPaiement: MoyenPaiement | null;
  garantie: boolean;
  montantGarantie: string;
  onChangeMoyen: (moyen: MoyenPaiement) => void;
  onChangeGarantie: (garantie: boolean) => void;
  onChangeMontant: (montant: string) => void;
  onNext: () => void;
}

const moyensPaiement = [
  { id: "especes" as const, label: "Espèces" },
  { id: "mobile_money" as const, label: "Mobile Money" },
  { id: "virement" as const, label: "Virement bancaire" },
  { id: "plusieurs" as const, label: "Plusieurs moyens" },
];

export default function StepPaiement({
  moyenPaiement,
  garantie,
  montantGarantie,
  onChangeMoyen,
  onChangeGarantie,
  onChangeMontant,
  onNext,
}: StepPaiementProps) {
  const isComplete = moyenPaiement && (!garantie || montantGarantie);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isComplete) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-neutral-900">Moyens de paiement</h2>
        <p className="text-sm text-neutral-500">
          Comment vos locataires vous paient-ils habituellement?
        </p>
      </div>

      {/* Moyens de Paiement */}
      <div className="space-y-2">
        {moyensPaiement.map((moyen) => (
          <motion.button
            key={moyen.id}
            onClick={() => onChangeMoyen(moyen.id)}
            onKeyDown={handleKeyDown}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-3 rounded-lg border-2 transition-all text-left flex items-center gap-3 ${
              moyenPaiement === moyen.id
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-200 bg-white hover:border-neutral-300"
            }`}
          >
            <Wallet
              size={20}
              weight={moyenPaiement === moyen.id ? "fill" : "regular"}
              className={moyenPaiement === moyen.id ? "text-primary-600" : "text-neutral-400"}
            />
            <p
              className={`text-sm font-medium ${
                moyenPaiement === moyen.id ? "text-primary-700" : "text-neutral-700"
              }`}
            >
              {moyen.label}
            </p>
          </motion.button>
        ))}
      </div>

      {/* Garantie Section */}
      {moyenPaiement && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 pt-4 border-t border-neutral-200"
        >
          <label className="text-sm font-medium text-neutral-700 block">
            Demandez-vous une garantie à l'entrée?
          </label>

          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => onChangeGarantie(false)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border-2 transition-all ${
                !garantie
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  !garantie ? "text-primary-700" : "text-neutral-700"
                }`}
              >
                Non
              </p>
            </motion.button>

            <motion.button
              onClick={() => onChangeGarantie(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-lg border-2 transition-all ${
                garantie
                  ? "border-primary-500 bg-primary-50"
                  : "border-neutral-200 bg-white"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  garantie ? "text-primary-700" : "text-neutral-700"
                }`}
              >
                Oui
              </p>
            </motion.button>
          </div>

          {/* Montant Garantie */}
          {garantie && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label className="text-sm font-medium text-neutral-700 block">
                Montant par défaut (FCFA)
              </label>
              <input
                type="number"
                min="0"
                value={montantGarantie}
                onChange={(e) => onChangeMontant(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full h-10 px-3 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ex : 500000"
              />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.button
        onClick={onNext}
        disabled={!isComplete}
        whileHover={isComplete ? { scale: 1.02 } : {}}
        whileTap={isComplete ? { scale: 0.98 } : {}}
        className="w-full h-10 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
      >
        Continuer
      </motion.button>
    </div>
  );
}
