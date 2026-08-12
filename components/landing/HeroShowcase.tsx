"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import {
  Bell,
  Briefcase,
  Buildings,
  CheckCircle,
  ChartBar,
  CurrencyCircleDollar,
  Door,
  FileText,
  Gear,
  House,
  Percent,
  UsersThree,
  Wallet,
  ArrowsLeftRight,
  Users,
} from "@phosphor-icons/react";

// Type pour les items de navigation
interface NavItem {
  label: string;
  icon: React.ComponentType<any>;
  active?: boolean;
}

// Reproduction fidèle de flatNavItems (components/layout/nav-items.tsx)
// filtrée pour le profil "Agence" (le plus complet, 12 items) — cohérent avec
// getNavItemsByProfile("agence"). "Accueil" actif, pour matcher le contenu affiché à droite.
const navItems: NavItem[] = [
  { label: "Accueil", icon: House, active: true },
  { label: "Immeubles", icon: Buildings },
  { label: "Logements", icon: Door },
  { label: "Locataires", icon: Users },
  { label: "Contrats", icon: FileText },
  { label: "Propriétaires", icon: Briefcase },
  { label: "Paiements", icon: Wallet },
  { label: "Reversements", icon: ArrowsLeftRight },
  { label: "Rapports", icon: ChartBar },
  { label: "Équipe", icon: UsersThree },
  { label: "Notifications", icon: Bell },
  { label: "Paramètres", icon: Gear },
];

// Reproduction fidèle de StatsGrid.tsx (mêmes 4 stats, mêmes tokens de couleur
// corrigés : success/primary/accent/neutral) — pas de stats "aspirationnelles"
// non encore branchées (propriétaires gérés / reversements en attente, Phase 7).
const stats = [
  {
    label: "Revenu mensuel",
    value: "3 850 000 FCFA",
    icon: CurrencyCircleDollar,
    tone: "text-success-600",
  },
  {
    label: "Taux d'occupation",
    value: "96%",
    icon: Percent,
    tone: "text-primary-600",
    progress: 96,
  },
  {
    label: "Immeubles",
    value: "8",
    icon: Buildings,
    tone: "text-accent-600",
  },
  {
    label: "Logements",
    value: "25",
    icon: Door,
    tone: "text-neutral-600",
  },
] as const;

const payments = [
  {
    initials: "KM",
    name: "Koffi M.",
    property: "Résidence Fidjrossè · A2",
    amount: "150 000 FCFA",
    method: "MTN MoMo",
    avatar: "bg-primary-50 text-primary-800",
  },
  {
    initials: "DA",
    name: "Dossou A.",
    property: "Immeuble Haie Vive · B1",
    amount: "200 000 FCFA",
    method: "Moov Money",
    avatar: "bg-accent-50 text-accent-600",
  },
  {
    initials: "SG",
    name: "Sossou G.",
    property: "Villa Calavi",
    amount: "350 000 FCFA",
    method: "Virement bancaire",
    avatar: "bg-neutral-100 text-neutral-700",
  },
] as const;

export default function HeroShowcase() {
  const shouldReduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // Tilt 3D léger au mouvement de la souris — desktop uniquement, jamais
  // si l'utilisateur a demandé moins d'animation.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 220,
    damping: 22,
  });

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (shouldReduceMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      style={
        shouldReduceMotion
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1400,
            }
      }
      className="relative flex w-full overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_28px_80px_rgba(30,41,59,0.14)] [transform-style:preserve-3d] will-change-transform"
    >
      {/* Sidebar — reproduction fidèle de components/layout/Sidebar.tsx (fond ardoise, pas la palette claire de la landing) */}
      <aside className="hidden w-[210px] shrink-0 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 sm:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-slate-700 px-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-slate-700 bg-slate-800 text-primary-400">
            <Buildings size={16} weight="duotone" aria-hidden="true" />
          </span>
          <div className="min-w-0 leading-tight">
            <span className="block truncate text-xs font-bold text-primary-400">Agence Immo Cotonou</span>
            <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">Agence</span>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-hidden px-2.5 py-3">
          {navItems.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                active
                  ? "bg-gradient-to-r from-primary-500/20 to-primary-500/10 text-primary-400"
                  : "text-slate-300"
              }`}
            >
              <Icon size={14} weight={active ? "fill" : "regular"} aria-hidden="true" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Contenu principal — reproduction fidèle de app/(dashboard)/home + StatsGrid.tsx */}
      <div className="min-w-0 flex-1 bg-neutral-50 p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-neutral-900">Bienvenue, Fabrice</p>
            <p className="text-[11px] text-neutral-500">Tableau de bord de votre agence</p>
          </div>
          <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-[11px] font-bold text-primary-800 sm:flex">
            FA
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.06 }}
                className="rounded-xl border border-neutral-200 bg-white p-3 shadow-xs"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-medium leading-tight text-neutral-500">{stat.label}</span>
                  <Icon size={15} className={stat.tone} aria-hidden="true" />
                </div>
                <p className="text-sm font-bold tracking-[-0.02em] text-neutral-900 sm:text-base">{stat.value}</p>
                {"progress" in stat ? (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-neutral-200">
                    <div className="h-1.5 rounded-full bg-primary-600" style={{ width: `${stat.progress}%` }} />
                  </div>
                ) : null}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-neutral-500">
            Paiements récents
          </p>
          <div className="divide-y divide-neutral-100">
            {payments.map((payment) => (
              <div key={payment.name} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${payment.avatar}`}>
                    {payment.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-neutral-900">{payment.name}</p>
                    <p className="truncate text-[10px] text-neutral-500">{payment.property}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-extrabold text-neutral-900">{payment.amount}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-success-600">
                    <CheckCircle size={10} weight="fill" aria-hidden="true" />
                    {payment.method}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
