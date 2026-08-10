"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
  ArrowUpRight,
  Buildings,
  CheckCircle,
  CurrencyCircleDollar,
  DeviceMobile,
  FileText,
  House,
  Sparkle,
} from "@phosphor-icons/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DashboardTab = "vue_ensemble" | "reglements";

const metrics = [
  {
    label: "Loyers collectés",
    value: "3 850 000 FCFA",
    helper: "+12% ce mois",
    icon: CurrencyCircleDollar,
    tone: "text-primary-800",
    surface: "bg-primary-50",
  },
  {
    label: "Taux d'occupation",
    value: "96 %",
    helper: "24 / 25 logements loués",
    icon: House,
    tone: "text-neutral-900",
    surface: "bg-neutral-50",
  },
  {
    label: "Canal Mobile Money",
    value: "78 %",
    helper: "MTN MoMo & Moov Money",
    icon: DeviceMobile,
    tone: "text-primary-800",
    surface: "bg-primary-50/70",
  },
  {
    label: "Quittances générées",
    value: "100 %",
    helper: "Conformes & archivées",
    icon: FileText,
    tone: "text-success-600",
    surface: "bg-success-50",
  },
] as const;

const payments = [
  {
    initials: "KM",
    name: "Koffi M. · Résidence Fidjrossè",
    property: "Appartement A2 · Juin 2026",
    amount: "150 000 FCFA",
    method: "MTN MoMo",
    avatar: "bg-primary-50 text-primary-800",
  },
  {
    initials: "DA",
    name: "Dossou A. · Immeuble Haie Vive",
    property: "Boutique B1 · Juin 2026",
    amount: "200 000 FCFA",
    method: "Moov Money",
    avatar: "bg-accent-50 text-accent-600",
  },
  {
    initials: "SG",
    name: "Sossou G. · Villa Calavi",
    property: "Logement principal · Juin 2026",
    amount: "350 000 FCFA",
    method: "Virement bancaire",
    avatar: "bg-neutral-100 text-neutral-700",
  },
] as const;

const receipts = [
  {
    name: "Marie Dossou",
    property: "Appartement 302",
    date: "Aujourd'hui, 14:20",
    channel: "WhatsApp & Email",
    status: "Délivrée",
  },
  {
    name: "Constantin Agbossou",
    property: "Boutique N°4",
    date: "Hier, 09:15",
    channel: "Portail locataire",
    status: "Téléchargée",
  },
  {
    name: "Fabiola Mensah",
    property: "Villa Les Palmiers",
    date: "07 Juin 2026",
    channel: "WhatsApp direct",
    status: "Délivrée",
  },
] as const;

export default function HeroShowcase() {
  const [activeTab, setActiveTab] = useState<DashboardTab>("vue_ensemble");
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className="relative w-full overflow-hidden rounded-[28px] border border-neutral-200 bg-white p-4 shadow-[0_28px_80px_rgba(30,41,59,0.12)] sm:p-6 lg:p-7"
    >
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary-50" aria-hidden="true" />
      <div className="relative">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-800">
              <Buildings size={20} weight="duotone" aria-hidden="true" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold text-neutral-900">Vue d'ensemble</span>
                <span className="rounded-full bg-primary-50 px-2.5 py-1 text-[10px] font-extrabold text-primary-800">
                  Portefeuille Bénin 🇧🇯
                </span>
              </div>
              <p className="text-xs text-neutral-500">Votre activité locative, en un seul endroit.</p>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
            onValueChange={(value) => setActiveTab(value as DashboardTab)}
            className="max-w-full"
          >
            <TabsList className="h-11 max-w-full overflow-x-auto rounded-full border border-neutral-200 bg-neutral-50 p-1">
              <TabsTrigger
                value="vue_ensemble"
                className="min-h-9 rounded-full px-3 text-[11px] font-bold text-neutral-500 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm sm:px-4"
              >
                Vue d'ensemble
              </TabsTrigger>
              <TabsTrigger
                value="reglements"
                className="min-h-9 rounded-full px-3 text-[11px] font-bold text-neutral-500 data-[state=active]:bg-white data-[state=active]:text-neutral-900 data-[state=active]:shadow-sm sm:px-4"
              >
                Règlements récents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vue_ensemble" className="mt-0 focus-visible:outline-none">
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.06 }}
                    className={`rounded-2xl border border-neutral-100 p-4 ${metric.surface}`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-2 text-neutral-500">
                      <span className="text-[11px] font-semibold leading-tight">{metric.label}</span>
                      <Icon size={18} className={metric.tone} aria-hidden="true" />
                    </div>
                    <p className="text-lg font-bold tracking-[-0.04em] text-neutral-900 sm:text-xl">{metric.value}</p>
                    <p className={`mt-2 text-[10px] font-semibold ${metric.tone}`}>{metric.helper}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-neutral-500">
                  Derniers encaissements synchronisés
                </p>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-success-600">
                  <span className="h-2 w-2 rounded-full bg-success-500" aria-hidden="true" />
                  En direct · 🇧🇯 Bénin
                </span>
              </div>
              <div className="divide-y divide-neutral-100">
                {payments.map((payment) => (
                  <div key={payment.name} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${payment.avatar}`}>
                        {payment.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-neutral-900">{payment.name}</p>
                        <p className="truncate text-[11px] text-neutral-500">{payment.property}</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-extrabold text-neutral-900">{payment.amount}</p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success-600">
                        <CheckCircle size={12} weight="fill" aria-hidden="true" />
                        {payment.method}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reglements" className="mt-0 focus-visible:outline-none">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-neutral-500">
                  Historique des quittances prêtes à l'envoi
                </p>
                <p className="mt-1 text-xs text-neutral-500">Chaque paiement laisse une trace claire.</p>
              </div>
              <FileText size={22} className="text-primary-800" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div key={receipt.name} className="flex flex-col gap-3 rounded-xl border border-neutral-100 bg-neutral-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary-800 shadow-xs">
                      <FileText size={18} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-neutral-900">{receipt.name}</p>
                      <p className="text-[11px] text-neutral-500">{receipt.property} · {receipt.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pl-12 sm:pl-0">
                    <span className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-neutral-600">
                      {receipt.channel}
                    </span>
                    <span className="rounded-full bg-success-50 px-2.5 py-1 text-[10px] font-extrabold text-success-600">
                      {receipt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
          </Tabs>
        </div>

      <div className="relative mt-5 flex items-center justify-between gap-3 border-t border-neutral-100 pt-4 text-[11px] text-neutral-500">
        <span className="inline-flex items-center gap-2">
          <Sparkle size={14} className="text-accent-500" aria-hidden="true" />
          Une vue pensée pour décider plus vite.
        </span>
        <span className="hidden items-center gap-1 font-semibold text-primary-800 sm:inline-flex">
          Explorer le tableau de bord
          <ArrowUpRight size={14} aria-hidden="true" />
        </span>
      </div>
    </motion.div>
  );
}
