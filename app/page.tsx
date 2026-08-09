"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  House,
  Buildings,
  DeviceMobile,
  FileText,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Lightning,
  Sparkle,
  UserCheck,
  UsersThree,
  ArrowRight,
  CaretDown,
  CaretUp,
  Briefcase,
  Sliders,
} from "@phosphor-icons/react";
import HeroShowcase from "@/components/landing/HeroShowcase";

export default function LandingPage() {
  const [logementsCount, setLogementsCount] = useState(15);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const hoursSaved = Math.round(logementsCount * 0.8);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Motif Grille Subtile */}
      <div
        className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
        aria-hidden
      />

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <Buildings size={22} weight="duotone" />
            </div>
            <div className="leading-tight">
              <span className="block text-lg font-black tracking-tight text-white">Loka</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Gestion Locative · Bénin
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-slate-300">
            <a href="#fonctionnalites" className="hover:text-white transition-colors">
              Fonctionnalités
            </a>
            <a href="#portail-locataire" className="hover:text-white transition-colors">
              Portail Locataire
            </a>
            <a href="#tarifs" className="hover:text-white transition-colors">
              Tarifs
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-xs font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Connexion
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
            >
              Essai gratuit
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            {/* Kicker Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 backdrop-blur-sm">
              <Sparkle size={14} weight="fill" className="text-amber-400" />
              <span>La référence locative au Bénin (Cotonou, Calavi, Porto-Novo)</span>
            </div>

            {/* Titre Principal H1 */}
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.15]">
              Vos loyers encaissés par{" "}
              <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                Mobile Money
              </span>
              . Vos quittances en 1 clic.
            </h1>

            {/* Sous-titre */}
            <p className="text-base text-slate-300 sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Rejoignez les propriétaires et agences qui automatisent leur gestion locative avec Loka.
              Fini les cahiers perdus, les relances gênantes et les impayés sans fin.
            </p>

            {/* Boutons CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/onboarding"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-600/25 hover:bg-emerald-500 transition-all"
              >
                <span>Créer mon compte gratuit (3 min)</span>
                <ArrowRight size={16} weight="bold" />
              </Link>
              <a
                href="#portail-locataire"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all"
              >
                <DeviceMobile size={18} className="text-emerald-400" />
                <span>Découvrir le Portail Locataire</span>
              </a>
            </div>

            {/* Preuve sociale Avatars */}
            <div className="pt-6 flex items-center justify-center gap-3">
              <div className="flex -space-x-2">
                <Image
                  src="/auth/avatar-1.png"
                  alt="Bailleur Loka"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-950"
                />
                <Image
                  src="/auth/avatar-2.png"
                  alt="Bailleur Loka"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-950"
                />
                <Image
                  src="/auth/avatar-3.png"
                  alt="Bailleur Loka"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-950"
                />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                <strong className="text-white font-bold">+500 bailleurs & agences</strong> nous font confiance au Bénin
              </p>
            </div>
          </div>

          {/* HERO SHOWCASE (OPTION A — DÉMO EN DIRECT REACT) */}
          <div className="mt-12 md:mt-16">
            <HeroShowcase />
          </div>
        </div>
      </section>

      {/* SECTION PROBLÈME VS SOLUTION */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Modernisation de la Gestion Locative
            </p>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Pourquoi remplacer votre cahier par Loka ?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Colonne Méthode Classique */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <XCircle size={20} weight="fill" />
                <span>La méthode traditionnelle (Cahier & Excel)</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">·</span>
                  <span>Relances téléphoniques gênantes et litiges sur les dates de paiement.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">·</span>
                  <span>Quittances papier égarées, raturées ou détériorées.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">·</span>
                  <span>Erreurs de calcul lors du décompte des commissions pour les propriétaires gérés.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">·</span>
                  <span>Aucun suivi précis des vacances locatives et des pertes de loyer.</span>
                </li>
              </ul>
            </div>

            {/* Colonne Méthode Loka */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle size={20} weight="fill" />
                <span>La méthode moderne avec Loka</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Règlements automatiques par MTN MoMo & Moov Money sans déplacement.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Quittances PDF certifiées générées instantanément sous votre propre nom ou logo.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Calcul et retenue automatique des commissions (8-10%) avec relevés de gérance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span>Portail locataire dédié pour télécharger les quittances et recevoir les alertes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION LES 4 PILIERS */}
      <section id="fonctionnalites" className="py-16 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Fonctionnalités Essentielles
            </p>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Tout ce dont vous avez besoin pour piloter votre patrimoine
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <DeviceMobile size={22} weight="duotone" />
              </div>
              <h3 className="text-base font-bold text-white">Encaissement GeniusPay</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Les locataires paient directement par MTN MoMo, Moov Money ou Carte. La quittance est délivrée instantanément.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileText size={22} weight="duotone" />
              </div>
              <h3 className="text-base font-bold text-white">Quittances & Baux Conformes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Génération automatique de quittances et modèles de baux conformes au Code Foncier béninois.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Briefcase size={22} weight="duotone" />
              </div>
              <h3 className="text-base font-bold text-white">Espace Multi-Propriétaires</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pour agences et gestionnaires : déduction automatique des commissions et bilans de reversement clairs.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <UserCheck size={22} weight="duotone" />
              </div>
              <h3 className="text-base font-bold text-white">Portail Locataire Dédié</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Un espace dédié pour vos locataires : consultation des quittances, historique des paiements et requêtes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIMULATEUR DE GAIN */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-semibold text-amber-300">
            <Sliders size={14} />
            <span>Simulateur d'efficacité</span>
          </div>

          <h2 className="text-2xl font-black text-white sm:text-3xl">
            Combien de temps perdez-vous chaque mois ?
          </h2>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Nombre de logements gérés :</span>
                <span className="text-emerald-400 text-sm font-black">{logementsCount} logements</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={logementsCount}
                onChange={(e) => setLogementsCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div>
                <p className="text-3xl font-black text-emerald-400">{hoursSaved}h</p>
                <p className="text-xs text-slate-400 mt-1">Économisées par mois</p>
              </div>
              <div>
                <p className="text-3xl font-black text-amber-400">100%</p>
                <p className="text-xs text-slate-400 mt-1">Des erreurs de calcul éliminées</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION PRICING */}
      <section id="tarifs" className="py-16 border-t border-slate-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              Tarification Transparente
            </p>
            <h2 className="text-2xl font-black text-white sm:text-3xl">
              Choisissez le plan adapté à votre activité
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300">
                  Starter
                </span>
                <div>
                  <p className="text-3xl font-black text-white">Gratuit</p>
                  <p className="text-xs text-slate-400 mt-1">Pour débuter la gestion</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    1 à 3 logements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Quittances PDF standard
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Suivi des règlements
                  </li>
                </ul>
              </div>
              <Link
                href="/onboarding"
                className="mt-6 w-full py-2.5 text-center text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Créer un compte free
              </Link>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-emerald-500 bg-slate-900 p-6 flex flex-col justify-between relative shadow-xl shadow-emerald-500/10">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-black uppercase text-white tracking-wider">
                Recommandé
              </span>
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                  Pro
                </span>
                <div>
                  <p className="text-3xl font-black text-white">9.900 FCFA <span className="text-xs text-slate-400 font-normal">/mois</span></p>
                  <p className="text-xs text-slate-400 mt-1">Propriétaires indépendants</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Jusqu'à 20 logements
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Logo & En-tête personnalisés
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Relances SMS & WhatsApp
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Portail locataire actif
                  </li>
                </ul>
              </div>
              <Link
                href="/onboarding"
                className="mt-6 w-full py-2.5 text-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
              >
                Essai gratuit 14 jours
              </Link>
            </div>

            {/* Agence */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <span className="inline-flex rounded-full bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400 border border-purple-500/20">
                  Agence
                </span>
                <div>
                  <p className="text-3xl font-black text-white">29.900 FCFA <span className="text-xs text-slate-400 font-normal">/mois</span></p>
                  <p className="text-xs text-slate-400 mt-1">Gestionnaires & Agences</p>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Logements ILLIMITÉS
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Marque Blanche complète
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Calcul des commissions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                    Accès multi-utilisateurs
                  </li>
                </ul>
              </div>
              <Link
                href="/onboarding"
                className="mt-6 w-full py-2.5 text-center text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Essai gratuit 14 jours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-16 border-t border-slate-800/80 bg-slate-900/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black text-white sm:text-3xl">Foire aux questions</h2>
            <p className="text-xs text-slate-400">Tout ce que vous devez savoir sur Loka</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Comment le locataire règle-t-il son loyer sur Loka ?",
                r: "Le locataire reçoit une invitation sécurisée et accède à son Portail Locataire. Il peut régler par MTN Mobile Money, Moov Money ou carte bancaire. La quittance est générée immédiatement après validation.",
              },
              {
                q: "Les quittances générées sont-elles conformes à la réglementation du Bénin ?",
                r: "Absolument. Les quittances et modèles de baux respectent les exigences légales du Code Foncier et Domanial béninois.",
              },
              {
                q: "Puis-je afficher mon propre logo et le nom de mon agence ?",
                r: "Oui. Loka est une plateforme neutre. Dans vos paramètres, vous chargez votre logo, votre en-tête et vos coordonnées pour personnaliser vos quittances et votre espace.",
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4 transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between text-left text-sm font-bold text-white"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <CaretUp size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <CaretDown size={16} className="text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="mt-3 text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                    {faq.r}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-12 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3 col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <Buildings size={20} className="text-emerald-400" />
                <span className="font-bold text-white text-base">Loka</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                La plateforme SaaS de gestion locative et d'encaissement Mobile Money au Bénin.
              </p>
              <p className="text-xs text-slate-500">Cotonou, Bénin</p>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-white uppercase text-[11px] tracking-wider">Produit</p>
              <ul className="space-y-1.5 text-slate-400">
                <li><a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a></li>
                <li><a href="#portail-locataire" className="hover:text-white transition-colors">Portail Locataire</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-white uppercase text-[11px] tracking-wider">Institutionnel</p>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/a-propos" className="hover:text-white transition-colors">À Propos</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact & Support</Link></li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-bold text-white uppercase text-[11px] tracking-wider">Légal</p>
              <ul className="space-y-1.5 text-slate-400">
                <li><Link href="/cgu" className="hover:text-white transition-colors">CGU & Mentions Légales</Link></li>
                <li><Link href="/confidentialite" className="hover:text-white transition-colors">Politique de Confidentialité</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-6 text-center text-slate-500 text-[11px]">
            <p>© 2026 Loka Technologies. La référence de la gestion locative & de l'encaissement Mobile Money au Bénin 🇧🇯. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
