"use client";

import { useState } from "react";
import {
  CurrencyCircleDollar,
  House,
  Buildings,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Sparkle,
  DeviceMobile,
  FileText,
} from "@phosphor-icons/react";

export default function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<"vue_ensemble" | "reglements">("vue_ensemble");

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-2xl md:p-6 text-slate-100">
      {/* Header bar du mockup */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Buildings size={20} weight="duotone" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Loka</span>
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Portefeuille Bénin 🇧🇯
              </span>
            </div>
            <p className="text-xs text-slate-400">Dashboard de gestion locative en temps réel</p>
          </div>
        </div>

        {/* Onglets interactifs */}
        <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab("vue_ensemble")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "vue_ensemble"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab("reglements")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === "reglements"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Règlements récents
          </button>
        </div>
      </div>

      {activeTab === "vue_ensemble" ? (
        <div className="space-y-6">
          {/* Cartes KPI */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Loyers collectés</span>
                <CurrencyCircleDollar size={18} className="text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white">3 850 000 FCFA</p>
              <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <ArrowUpRight size={14} />
                <span>+12% ce mois</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Taux d'occupation</span>
                <House size={18} className="text-amber-400" />
              </div>
              <p className="text-xl font-black text-white">96 %</p>
              <p className="mt-2 text-[11px] text-slate-400">24 / 25 logements loués</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Canal Mobile Money</span>
                <DeviceMobile size={18} className="text-blue-400" />
              </div>
              <p className="text-xl font-black text-white">78 %</p>
              <p className="mt-2 text-[11px] text-slate-400">MTN MoMo & Moov Money</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium">Quittances générées</span>
                <FileText size={18} className="text-emerald-400" />
              </div>
              <p className="text-xl font-black text-white">100 %</p>
              <p className="mt-2 text-[11px] text-emerald-400">Conformes & archivées</p>
            </div>
          </div>

          {/* Section d'activité récente */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Derniers encaissements synchronisés
              </h4>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <Sparkle size={12} weight="fill" />
                Mise à jour en direct
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 text-xs">
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 font-bold">
                    KM
                  </div>
                  <div>
                    <p className="font-semibold text-white">Koffi M. (Résidence Fidjrossè)</p>
                    <p className="text-[11px] text-slate-400">Appartement A2 · Juin 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">150 000 FCFA</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle size={12} weight="fill" /> MTN MoMo
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 font-bold">
                    DA
                  </div>
                  <div>
                    <p className="font-semibold text-white">Dossou A. (Immeuble Haie Vive)</p>
                    <p className="text-[11px] text-slate-400">Boutique B1 · Juin 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">200 000 FCFA</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                    <CheckCircle size={12} weight="fill" /> Moov Money
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold">
                    SG
                  </div>
                  <div>
                    <p className="font-semibold text-white">Sossou G. (Villa Calavi)</p>
                    <p className="text-[11px] text-slate-400">Logement principal · Juin 2026</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">350 000 FCFA</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-400">
                    <CheckCircle size={12} weight="fill" /> Virement Bancaire
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Historique des quittances prêtes à l'envoi
            </h4>
            <div className="space-y-3">
              {[
                { nom: "Marie Dossou", bien: "Appartement 302", date: "Aujourd'hui, 14:20", canal: "WhatsApp & Email", statut: "Délivrée" },
                { nom: "Constantin Agbossou", bien: "Boutique N°4", date: "Hier, 09:15", canal: "Portail Locataire", statut: "Téléchargée" },
                { nom: "Fabiola Mensah", bien: "Villa Les Palmiers", date: "07 Juin 2026", canal: "WhatsApp Direct", statut: "Délivrée" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/80 p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-emerald-400 shrink-0" />
                    <div>
                      <p className="font-bold text-white">{item.nom}</p>
                      <p className="text-slate-400 text-[11px]">{item.bien} · {item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-300 border border-slate-700">
                      {item.canal}
                    </span>
                    <span className="rounded bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      {item.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
