"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  Buildings,
  CaretDown,
  CaretUp,
  CheckCircle,
  DeviceMobile,
  FileText,
  House,
  List,
  MapPin,
  Sparkle,
  UserCheck,
  UsersThree,
  X,
  XCircle,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import HeroShowcase from "@/components/landing/HeroShowcase";

type RevealDirection = "up" | "left" | "right";
type StoryArtifact = "payment" | "receipt" | "agency" | "tenant";

type FeatureStory = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta?: string;
  href?: string;
  artifact: StoryArtifact;
  reverse?: boolean;
};

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

type PricingPlan = {
  id: "starter" | "pro" | "agency";
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  unit?: string;
  description: string;
  features: readonly string[];
  cta: string;
  href: string;
  highlighted?: boolean;
};

type BillingPeriod = "monthly" | "annual";

const proofStats = [
  { id: "occupied", value: "24/25", label: "logements occupés" },
  { id: "mobile-money", value: "78 %", label: "via Mobile Money" },
  { id: "receipt", value: "1 clic", label: "pour la quittance" },
  { id: "benin", value: "🇧🇯", label: "pensé pour le Bénin" },
] as const;

const timelineSteps = [
  {
    id: "before",
    eyebrow: "Avant · Cahier & Excel",
    title: "Chercher le bon chiffre",
    description: "Les règlements sont dispersés, les dates se recoupent, les quittances s'improvisent au moment où le locataire les demande.",
    tone: "before",
  },
  {
    id: "with-loka",
    eyebrow: "Avec Loka · Une source",
    title: "Voir ce qui est payé, maintenant",
    description: "Chaque paiement MTN MoMo, Moov Money ou carte rejoint votre portefeuille et alimente la quittance correspondante.",
    tone: "withLoka",
  },
  {
    id: "result",
    eyebrow: "Résultat · Une routine claire",
    title: "Décider avant de relancer",
    description: "Vous savez qui doit quoi, ce qui a été envoyé et ce qui mérite votre attention — sans refaire les comptes.",
    tone: "result",
  },
] as const;

const featureStories: FeatureStory[] = [
  {
    id: "payment",
    eyebrow: "Le parcours locataire",
    title: "Le locataire paie où qu'il soit.",
    body: "Depuis son portail, il choisit MTN MoMo, Moov Money ou la carte bancaire. Vous recevez la confirmation sans appeler, vérifier ou recopier.",
    cta: "Voir le parcours",
    href: "#portail-locataire",
    artifact: "payment",
  },
  {
    id: "receipt",
    eyebrow: "Un document qui reste",
    title: "Vos documents restent accessibles, même après le paiement.",
    body: "La quittance est disponible dans le portail, sous votre identité, avec le montant, la date et l'historique utiles au locataire.",
    cta: "Tester le portail",
    href: "#portail-locataire",
    artifact: "receipt",
    reverse: true,
  },
  {
    id: "agency",
    eyebrow: "Gérer à plusieurs",
    title: "Les agences gardent le fil.",
    body: "Logements, commissions, reversements : une même source de vérité pour vos équipes et les propriétaires que vous accompagnez.",
    artifact: "agency",
  },
  {
    id: "tenant",
    eyebrow: "Rassurer au quotidien",
    title: "Un espace qui répond avant de relancer.",
    body: "Quittance, historique des paiements et demandes : le portail locataire rend chaque étape visible, même quand votre journée est pleine.",
    cta: "Découvrir le portail",
    href: "#portail-locataire",
    artifact: "tenant",
    reverse: true,
  },
];

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: "Gratuit",
    priceAnnual: "Gratuit",
    description: "Pour débuter avec 1 à 3 logements.",
    features: ["Suivi des règlements", "Quittances PDF standard", "Historique locataire"],
    cta: "Commencer gratuitement",
    href: "/auth?tab=signup",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: "9.900",
    priceAnnual: "79.200",
    unit: "FCFA",
    description: "Pour les propriétaires indépendants.",
    features: ["Jusqu'à 20 logements", "Logo & en-tête personnalisés", "Relances SMS & WhatsApp", "Portail locataire actif"],
    cta: "Essai gratuit 14 jours",
    href: "/auth?tab=signup",
    highlighted: true,
  },
  {
    id: "agency",
    name: "Agence",
    priceMonthly: "29.900",
    priceAnnual: "239.200",
    unit: "FCFA",
    description: "Pour les gestionnaires et agences.",
    features: ["Logements illimités", "Marque blanche complète", "Calcul des commissions", "Accès multi-utilisateurs"],
    cta: "Parler à Loka",
    href: "/contact",
  },
] as const;

const faqItems: FaqItem[] = [
  {
    id: "payment",
    question: "Comment le locataire règle-t-il son loyer ?",
    answer: "Il reçoit une invitation sécurisée vers son portail, puis règle par MTN Mobile Money, Moov Money ou carte. Une fois le paiement validé, la quittance est générée.",
  },
  {
    id: "receipts",
    question: "Les quittances sont-elles personnalisables ?",
    answer: "Oui. Votre nom, votre logo, votre en-tête et vos coordonnées apparaissent sur les documents envoyés à vos locataires.",
  },
  {
    id: "agencies",
    question: "Loka convient-il aux agences ?",
    answer: "Oui. Le plan Agence ajoute les logements illimités, le calcul des commissions et les accès multi-utilisateurs pour votre équipe.",
  },
  {
    id: "branding",
    question: "Puis-je utiliser mon propre logo ?",
    answer: "Oui. Loka est une plateforme neutre : vous pouvez afficher votre marque sur vos quittances, vos documents et votre espace de gestion.",
  },
];

const footerGroups = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#fonctionnalites" },
      { label: "Tarifs", href: "#tarifs" },
      { label: "Portail locataire", href: "#portail-locataire" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Contact & support", href: "/contact" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Blog", href: "/blog" },
      { label: "Carrières", href: "/careers" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "CGU & mentions légales", href: "/cgu" },
      { label: "Confidentialité", href: "/confidentialite" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "support@loka.com", href: "mailto:support@loka.com" },
      { label: "+229 46279139", href: "tel:+22946279139" },
    ],
  },
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
}) {
  const shouldReduceMotion = useReducedMotion();
  const hidden = shouldReduceMotion
    ? { opacity: 0 }
    : {
        opacity: 0,
        y: direction === "up" ? 28 : 0,
        x: direction === "left" ? 28 : direction === "right" ? -28 : 0,
      };

  return (
    <motion.div
      initial={hidden}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.65, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ArrowIcon({ direction = "right" }: { direction?: "right" | "up-right" }) {
  return direction === "up-right" ? (
    <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
  ) : (
    <ArrowRight size={17} weight="bold" aria-hidden="true" />
  );
}

function StoryArtifact({ type }: { type: StoryArtifact }) {
  if (type === "payment") {
    return (
      <Card className="overflow-hidden rounded-[28px] border-primary-100 bg-primary-50/70 p-5 shadow-[0_22px_60px_rgba(55,48,163,0.12)] sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-primary-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-800 shadow-xs">
              <DeviceMobile size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-extrabold text-neutral-900">Paiement reçu</p>
              <p className="text-[11px] text-neutral-500">Portail locataire · 🇧🇯 Bénin</p>
            </div>
          </div>
          <CheckCircle size={22} weight="fill" className="text-success-600" aria-label="Paiement confirmé" />
        </div>
        <div className="mt-7 rounded-2xl bg-white p-5 shadow-xs">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-neutral-500">Dernier règlement</p>
          <p className="mt-2 text-3xl font-black tracking-[-0.06em] text-neutral-900">150 000 FCFA</p>
          <div className="mt-5 flex items-center justify-between border-t border-neutral-100 pt-4 text-xs font-bold text-neutral-600">
            <span>MTN Mobile Money</span>
            <span className="text-success-600">Confirmé</span>
          </div>
        </div>
      </Card>
    );
  }

  if (type === "receipt") {
    return (
      <Card className="rounded-[28px] border-accent-100 bg-accent-50/40 p-5 shadow-[0_22px_60px_rgba(55,48,163,0.1)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-accent-600">Quittance de loyer</p>
            <p className="mt-3 text-2xl font-black tracking-[-0.05em] text-primary-900">Loka</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-800 shadow-xs">
            <FileText size={20} aria-hidden="true" />
          </span>
        </div>
        <div className="mt-6 space-y-4 border-t border-accent-100 pt-5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-neutral-500">Locataire</span>
            <span className="font-bold text-neutral-900">Marie Dossou</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-neutral-500">Bien</span>
            <span className="font-bold text-neutral-900">Appartement 302</span>
          </div>
          <div className="flex items-end justify-between gap-4 border-t border-accent-100 pt-5">
            <span className="text-xs font-semibold text-success-600">Document conforme</span>
            <span className="text-2xl font-black tracking-[-0.05em] text-primary-900">150 000 FCFA</span>
          </div>
        </div>
      </Card>
    );
  }

  if (type === "agency") {
    return (
      <Card className="rounded-[28px] border-primary-100 bg-primary-50/70 p-5 shadow-[0_22px_60px_rgba(55,48,163,0.12)] sm:p-7">
        <div className="flex items-center justify-between gap-3 border-b border-primary-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-800 shadow-xs">
              <UsersThree size={20} aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-extrabold text-neutral-900">Portefeuille agence</p>
              <p className="text-[11px] text-neutral-500">🇧🇯 Bénin · Juin 2026</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-primary-800">À jour</span>
        </div>
        <div className="mt-5 space-y-2">
          {[
            ["Afi E. · 8 logements", "640 000"],
            ["Jean B. · 4 logements", "320 000"],
          ].map(([name, amount]) => (
            <div key={name} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-xs shadow-xs">
              <span className="font-bold text-neutral-800">{name}</span>
              <span className="font-black text-primary-900">{amount}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-primary-100 bg-white/70 px-4 py-3 text-xs">
          <span className="text-neutral-500">Commissions du mois</span>
          <span className="font-extrabold text-primary-800">8–10 % suivis</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-[28px] border-primary-100 bg-primary-50/60 p-5 shadow-[0_22px_60px_rgba(55,48,163,0.1)] sm:p-7">
      <div className="flex items-center justify-between gap-3 border-b border-primary-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-800 shadow-xs">
            <UserCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-extrabold text-neutral-900">Mon espace locataire</p>
            <p className="text-[11px] text-neutral-500">Appartement A2 · Fidjrossè</p>
          </div>
        </div>
        <span className="rounded-full bg-success-50 px-2.5 py-1 text-[10px] font-extrabold text-success-600">À jour</span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-xs">
          <FileText size={19} className="text-primary-800" aria-hidden="true" />
          <p className="mt-6 text-xs font-extrabold text-neutral-900">Mes quittances</p>
          <p className="mt-1 text-[11px] text-neutral-500">3 documents disponibles</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-xs">
          <UsersThree size={19} className="text-accent-500" aria-hidden="true" />
          <p className="mt-6 text-xs font-extrabold text-neutral-900">Mes demandes</p>
          <p className="mt-1 text-[11px] text-neutral-500">Aucune en attente</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-success-50 px-4 py-3 text-[11px] font-bold text-success-600">
        <CheckCircle size={16} weight="fill" aria-hidden="true" />
        Votre dernier paiement est confirmé
      </div>
    </Card>
  );
}

function StoryRow({ story }: { story: FeatureStory }) {
  const shouldReduceMotion = useReducedMotion();
  const isReverse = story.reverse;

  return (
    <motion.article
      id={story.id === "payment" ? "portail-locataire" : undefined}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.65, ease: "easeOut" }}
      className={`grid items-center gap-10 border-b border-neutral-200 py-16 last:border-b-0 lg:grid-cols-2 lg:gap-20 lg:py-24 ${isReverse ? "lg:[&>*:first-child]:order-2" : ""}`}
    >
      <div className="max-w-xl">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-800">{story.eyebrow}</p>
        <h3 className="mt-4 max-w-xl text-3xl font-bold leading-[1.04] tracking-[-0.055em] text-neutral-900 sm:text-4xl">{story.title}</h3>
        <p className="mt-6 max-w-lg text-base leading-7 text-neutral-600 sm:text-lg">{story.body}</p>
        {story.cta && story.href ? (
          <Link
            href={story.href}
            className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary-200 px-4 py-2.5 text-sm font-bold text-primary-800 transition-colors hover:border-primary-300 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-800"
          >
            {story.cta}
            <ArrowUpRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
      <motion.div
        whileHover={shouldReduceMotion ? undefined : { y: -5 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="min-w-0"
      >
        <StoryArtifact type={story.artifact} />
      </motion.div>
    </motion.article>
  );
}

function FaqItemRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  const shouldReduceMotion = useReducedMotion();
  const answerId = `faq-answer-${item.id}`;

  return (
    <div className="border-b border-neutral-200 last:border-b-0 px-5 py-4 sm:px-6 sm:py-5">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        className="flex w-full items-center justify-between gap-4 text-left text-base font-extrabold tracking-[-0.03em] text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-800 sm:text-lg"
      >
        <span>{item.question}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-primary-800" aria-hidden="true">
          {isOpen ? <CaretUp size={16} /> : <CaretDown size={16} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            id={answerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-1 pt-3 text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">{item.answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  const [logementsCount, setLogementsCount] = useState(15);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPlanComparison, setSelectedPlanComparison] = useState<string | null>(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const heroParallax = useTransform(scrollY, [0, 900], [0, shouldReduceMotion ? 0 : -18]);
  const hoursSaved = Math.round(logementsCount * 0.8);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setNavScrolled(latest > 12);
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-neutral-900 selection:bg-primary-100 selection:text-primary-900">
      <motion.div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-primary-800"
        style={{ scaleX: scrollYProgress }}
      />

      <header
        className={`fixed inset-x-0 top-0 z-60 border-b bg-white/95 backdrop-blur-md transition-shadow ${
          navScrolled ? "border-neutral-200 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.7)]" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex min-h-[76px] max-w-[1240px] items-center justify-between gap-6 px-5 sm:px-6 lg:px-10">
          <Link href="#accueil" onClick={closeMobileMenu} className="flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-800">
            <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <Image src="/logo.jpg" alt="Logo Loka" width={44} height={44} className="h-full w-full object-contain" priority />
            </span>
            <span className="hidden leading-tight sm:block">
              <strong className="block text-[17px] font-extrabold tracking-[-0.04em] text-neutral-950">Loka</strong>
            </span>
            <span className="sm:hidden leading-tight">
              <strong className="block text-[17px] font-extrabold tracking-[-0.04em] text-neutral-950">Loka</strong>
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-[13px] font-semibold text-neutral-600 lg:flex">
            {[
              ["Fonctionnalités", "#fonctionnalites"],
              ["Tarifs", "#tarifs"],
              ["À propos", "/a-propos"],
              ["Contact", "/contact"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="min-h-11 rounded-lg px-2 py-3 transition-colors hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-800">
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="ghost" size="sm" className="hidden min-h-11 rounded-lg px-3 py-3 text-[13px] font-semibold text-neutral-600 transition-colors hover:text-primary-800 hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-800 sm:inline-flex">
              <Link href="/auth">
                Connexion
              </Link>
            </Button>
            <Button asChild size="default" className="hidden min-h-11 rounded-lg bg-primary-800 px-5 text-[13px] font-bold text-white shadow-sm shadow-primary-800/20 hover:bg-primary-900 sm:inline-flex">
              <Link href="/auth?tab=signup">
                Commencer gratuitement
                <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
              </Link>
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((value) => !value)}
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition-all hover:border-primary-200 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-800 lg:hidden"
            >
              <motion.div
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <List size={20} aria-hidden="true" />}
              </motion.div>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {mobileMenuOpen ? (
            <motion.nav
              id="mobile-navigation"
              aria-label="Navigation mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: "easeInOut" }}
              className="overflow-hidden border-t border-neutral-200 bg-white lg:hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                className="mx-auto flex max-w-[1240px] flex-col gap-1 px-5 py-4 sm:px-6"
              >
                {[
                  ["Fonctionnalités", "#fonctionnalites"],
                  ["Tarifs", "#tarifs"],
                  ["À propos", "/a-propos"],
                  ["Contact", "/contact"],
                ].map(([label, href]) => (
                  <motion.div
                    key={href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={href} onClick={closeMobileMenu} className="flex min-h-11 items-center rounded-xl px-3 py-3 text-sm font-bold text-neutral-700 hover:bg-primary-50 hover:text-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-800">
                      {label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                  className="mt-2 flex flex-col gap-2 border-t border-neutral-100 pt-3 sm:flex-row"
                >
                  <Button asChild variant="outline" size="lg" className="rounded-lg border-neutral-300 text-neutral-800 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800">
                    <Link href="/auth" onClick={closeMobileMenu}>Connexion</Link>
                  </Button>
                  <Button asChild size="lg" className="rounded-lg bg-primary-800 text-sm font-bold hover:bg-primary-900">
                    <Link href="/auth?tab=signup" onClick={closeMobileMenu}>Commencer gratuitement <ArrowUpRight size={16} weight="bold" aria-hidden="true" /></Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      <main id="accueil" className="pt-[76px]">
        <section aria-labelledby="hero-title" className="relative mx-auto max-w-[1240px] scroll-mt-24 px-5 pb-20 pt-20 sm:px-6 lg:px-10 lg:pb-28 lg:pt-28">
          <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[min(100%,980px)] -translate-x-1/2 rounded-full bg-primary-50/60 blur-3xl" aria-hidden="true" />
          <div className="grid items-center gap-14 lg:grid-cols-[5fr_7fr] lg:gap-10">
            <Reveal className="max-w-[560px]">
              <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent-200 bg-accent-50 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-accent-600">
                <span className="h-2 w-2 rounded-full bg-accent-500" aria-hidden="true" />
                Pour propriétaires & agences au Bénin 🇧🇯
              </p>
              <h1 id="hero-title" className="max-w-[590px] text-[clamp(2.5rem,5vw,4rem)] font-bold leading-[1.02] tracking-[-0.06em] text-neutral-950">
                Une gestion locative qui laisse <span className="text-primary-800">respirer</span> votre activité.
              </h1>
              <p className="mt-8 max-w-[520px] text-lg leading-8 text-neutral-600">
                Encaissez par MTN MoMo, Moov Money ou carte, puis envoyez des quittances conformes et personnalisées — à Cotonou, Calavi comme à Porto-Novo.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="min-h-12 rounded-lg bg-primary-800 px-6 text-sm font-bold shadow-lg shadow-primary-800/20 hover:bg-primary-900">
                  <Link href="/auth?tab=signup">
                    Créer mon compte
                    <ArrowRight size={17} weight="bold" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-h-12 rounded-lg border-neutral-300 bg-white px-6 text-sm font-bold text-neutral-800 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-800">
                  <a href="#portail-locataire">
                    Voir le portail locataire
                    <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                  </a>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs font-semibold text-neutral-500">
                <span className="inline-flex items-center gap-2"><CheckCircle size={17} className="text-primary-800" aria-hidden="true" />3 minutes pour démarrer</span>
                <span className="inline-flex items-center gap-2"><MapPin size={17} className="text-primary-800" aria-hidden="true" />🇧🇯 Bénin · Cotonou · Calavi · Porto-Novo</span>
              </div>
            </Reveal>

            <motion.div style={{ y: heroParallax }} className="min-w-0 lg:pt-3">
              <HeroShowcase />
            </motion.div>
          </div>
        </section>

        <section id="preuve" aria-labelledby="proof-title" className="scroll-mt-24 border-y border-primary-100 bg-neutral-50">
          <div className="mx-auto grid max-w-[1240px] items-center gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[1.3fr_2fr] lg:px-10">
            <Reveal>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-800">Une preuve, pas une promesse</p>
              <h2 id="proof-title" className="mt-2 max-w-xl text-2xl font-bold leading-tight tracking-[-0.045em] text-neutral-950">Vos chiffres restent visibles, vos décisions deviennent simples.</h2>
            </Reveal>
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {proofStats.map((stat, index) => (
                <Reveal key={stat.id} delay={index * 0.05} className="border-l border-neutral-200 pl-4 first:border-l-0 first:pl-0 sm:first:border-l sm:first:pl-4">
                  <p className="text-2xl font-bold tracking-[-0.05em] text-neutral-950">{stat.value}</p>
                  <p className="mt-1 text-[11px] font-semibold leading-5 text-neutral-500">{stat.label}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1240px] gap-12 scroll-mt-24 px-5 py-24 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-10 lg:py-36">
          <Reveal>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-800">Le changement, étape par étape</p>
            <h2 className="mt-5 max-w-xl text-4xl font-bold leading-[1.02] tracking-[-0.06em] text-neutral-950 sm:text-5xl">Moins de relances. Plus de visibilité.</h2>
            <p className="mt-7 max-w-md text-base leading-7 text-neutral-600">Loka ne vous demande pas de changer votre métier. L'outil enlève simplement les détours qui vous prennent du temps.</p>
          </Reveal>
          <div className="relative border-l border-neutral-200 pl-7 sm:pl-10">
            {timelineSteps.map((step, index) => (
              <Reveal key={step.id} delay={index * 0.08} className="relative pb-12 last:pb-0">
                <span className={`absolute -left-[35px] top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white ${step.tone === "before" ? "bg-neutral-300" : step.tone === "withLoka" ? "bg-primary-800" : "bg-primary-100 text-primary-800"}`}>
                  {step.tone === "withLoka" ? <CheckCircle size={12} weight="fill" className="text-white" aria-hidden="true" /> : null}
                </span>
                <p className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${step.tone === "before" ? "text-neutral-400" : "text-primary-800"}`}>{step.eyebrow}</p>
                <h3 className={`mt-3 text-2xl font-bold tracking-[-0.045em] ${step.tone === "withLoka" ? "text-primary-900" : "text-neutral-900"}`}>{step.title}</h3>
                <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600">{step.description}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="fonctionnalites" aria-labelledby="features-title" className="scroll-mt-24 bg-neutral-50">
          <div className="mx-auto max-w-[1240px] px-5 sm:px-6 lg:px-10">
            <Reveal className="grid gap-5 py-24 lg:grid-cols-[1.4fr_0.6fr] lg:items-end lg:py-32">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-800">Les outils qui comptent</p>
                <h2 id="features-title" className="mt-5 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.06em] text-neutral-950 sm:text-5xl">Une ligne claire entre le paiement et la confiance.</h2>
              </div>
              <p className="max-w-sm text-base leading-7 text-neutral-600 lg:justify-self-end">Des actions courtes, des documents propres, un espace que vos locataires comprennent.</p>
            </Reveal>
            <div>
              {featureStories.map((story) => <StoryRow key={story.id} story={story} />)}
            </div>
          </div>
        </section>

        <section aria-labelledby="simulator-title" className="mx-auto max-w-[1240px] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
          <Reveal>
            <div className="overflow-hidden rounded-[28px] bg-primary-800 text-white shadow-[0_28px_80px_rgba(55,48,163,0.18)]">
              <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-100">Le temps qui revient</p>
                  <h2 id="simulator-title" className="mt-5 max-w-md text-3xl font-bold leading-[1.02] tracking-[-0.06em] sm:text-4xl">Combien d'heures pourriez-vous récupérer ?</h2>
                  <p className="mt-6 max-w-md text-base leading-7 text-primary-100">Pour {logementsCount} logements, Loka peut vous faire gagner environ {hoursSaved} heures par mois sur les suivis et les quittances.</p>
                  <Button asChild variant="outline" size="lg" className="mt-8 min-h-12 rounded-lg border-white/30 bg-white px-5 text-sm font-bold text-primary-900 hover:bg-primary-50">
                    <Link href="/auth?tab=signup">Tester avec mon portefeuille <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link>
                  </Button>
                </div>
                <div className="flex flex-col justify-center rounded-3xl bg-primary-900/35 p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4 text-sm font-bold">
                    <label htmlFor="portfolio-size">Nombre de logements gérés</label>
                    <output htmlFor="portfolio-size" aria-live="polite" className="rounded-full bg-white/10 px-3 py-1 text-primary-50">{logementsCount}</output>
                  </div>
                  <input
                    id="portfolio-size"
                    type="range"
                    min="1"
                    max="50"
                    value={logementsCount}
                    onChange={(event) => setLogementsCount(Number(event.target.value))}
                    aria-label="Nombre de logements gérés"
                    className="mt-7 h-2 w-full cursor-pointer accent-white"
                  />
                  <div className="mt-7 grid grid-cols-2 gap-6 border-t border-white/20 pt-7">
                    <div><p className="text-4xl font-black tracking-[-0.06em]">{hoursSaved} h</p><p className="mt-1 text-xs text-primary-100">économisées / mois</p></div>
                    <div><p className="text-4xl font-black tracking-[-0.06em]">1 clic</p><p className="mt-1 text-xs text-primary-100">pour une quittance prête</p></div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section id="tarifs" aria-labelledby="pricing-title" className="scroll-mt-24 bg-neutral-50">
          <div className="mx-auto max-w-[1240px] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-800">Tarification transparente</p>
              <h2 id="pricing-title" className="mt-5 text-4xl font-bold leading-[1.02] tracking-[-0.06em] text-neutral-950 sm:text-5xl">Commencez petit. Grandissez sereinement.</h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-neutral-600">Des plans simples à comprendre pour suivre vos loyers aujourd'hui et évoluer quand votre portefeuille grandit.</p>
            </Reveal>

            {/* Toggle Annuel/Mensuel */}
            <Reveal className="mx-auto mt-10 flex justify-center">
              <div className="inline-flex items-center gap-4 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setBillingPeriod("monthly")}
                  className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-primary-800 text-white shadow-md"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingPeriod("annual")}
                  className={`relative rounded-full px-6 py-2.5 text-sm font-bold transition-all ${
                    billingPeriod === "annual"
                      ? "bg-primary-800 text-white shadow-md"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  Annuel
                  {billingPeriod === "annual" && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-full bg-success-600 px-2 py-0.5 text-[10px] font-black text-white">
                      <CheckCircle size={12} weight="fill" aria-hidden="true" />
                      -20%
                    </span>
                  )}
                </button>
              </div>
            </Reveal>

            {/* Pricing Cards */}
            <div className="mt-14 grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
              {pricingPlans.map((plan, index) => {
                const price = billingPeriod === "monthly" ? plan.priceMonthly : plan.priceAnnual;
                const period = billingPeriod === "monthly" ? "/ mois" : "/ année";
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : index * 0.07, ease: "easeOut" }}
                    whileHover={shouldReduceMotion ? undefined : { y: -5 }}
                    onClick={() => setSelectedPlanComparison(selectedPlanComparison === plan.id ? null : plan.id)}
                    className={`relative flex cursor-pointer flex-col rounded-[24px] border bg-white p-6 shadow-[0_18px_50px_rgba(30,41,59,0.08)] transition-all sm:p-7 ${plan.highlighted ? "border-2 border-primary-600 shadow-[0_24px_60px_rgba(79,70,229,0.16)] lg:-mt-4 lg:mb-4" : "border-neutral-200"} ${selectedPlanComparison === plan.id ? "ring-2 ring-primary-600" : ""}`}
                  >
                    {plan.highlighted ? <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-600 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white">Le plus choisi</span> : null}
                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-extrabold ${plan.highlighted ? "bg-primary-50 text-primary-800" : "bg-neutral-100 text-neutral-600"}`}>{plan.name}</span>
                    <div className="mt-6">
                      <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold tracking-[-0.05em] text-neutral-950 sm:text-4xl">{price}</p>
                        {price !== "Gratuit" && <span className="text-xs font-semibold text-neutral-500">{plan.unit}</span>}
                      </div>
                      {price !== "Gratuit" && <p className="text-xs text-neutral-500">{period}</p>}
                      <p className="mt-2 text-sm leading-6 text-neutral-500">{plan.description}</p>
                    </div>
                    <ul className="mt-6 flex-1 space-y-3 border-t border-neutral-200 pt-6 text-sm text-neutral-700">
                      {plan.features.map((feature) => <li key={feature} className="flex items-start gap-2.5"><CheckCircle size={17} className="mt-0.5 shrink-0 text-primary-700" aria-hidden="true" />{feature}</li>)}
                    </ul>
                    <Button asChild size="lg" className={`mt-8 min-h-12 w-full rounded-lg text-sm font-bold ${plan.highlighted ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-neutral-100 text-neutral-800 hover:bg-neutral-200"}`}>
                      <Link href={plan.href}>{plan.cta}{plan.highlighted ? <ArrowRight size={17} weight="bold" aria-hidden="true" /> : null}</Link>
                    </Button>
                  </motion.div>
                );
              })}
            </div>

            {/* Comparatif Table */}
            {selectedPlanComparison && (
              <Reveal className="mt-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="overflow-x-auto rounded-[24px] border border-neutral-200 bg-white shadow-lg"
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="px-6 py-4 text-left font-bold text-neutral-900">Fonctionnalité</th>
                        {pricingPlans.map((plan) => (
                          <th
                            key={plan.id}
                            className={`px-6 py-4 text-center font-bold ${selectedPlanComparison === plan.id ? "bg-primary-50 text-primary-800" : "text-neutral-600"}`}
                          >
                            {plan.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Extraction unique features */}
                      {Array.from(new Set(pricingPlans.flatMap((p) => p.features))).map((feature) => (
                        <tr key={feature} className="border-b border-neutral-100 hover:bg-neutral-50">
                          <td className="px-6 py-4 font-medium text-neutral-700">{feature}</td>
                          {pricingPlans.map((plan) => (
                            <td
                              key={plan.id}
                              className={`px-6 py-4 text-center ${selectedPlanComparison === plan.id ? "bg-primary-50" : ""}`}
                            >
                              {plan.features.includes(feature) ? (
                                <CheckCircle size={20} className="mx-auto text-success-600" weight="fill" aria-label="Inclus" />
                              ) : (
                                <XCircle size={20} className="mx-auto text-neutral-300" weight="fill" aria-label="Non inclus" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              </Reveal>
            )}
          </div>
        </section>

        <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 bg-white">
          <div className="mx-auto max-w-[900px] px-5 py-24 sm:px-6 lg:px-10 lg:py-32">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-800">Questions fréquentes</p>
              <h2 id="faq-title" className="mt-5 text-4xl font-bold leading-[1.04] tracking-[-0.06em] text-neutral-950 sm:text-5xl">Tout ce qu'il faut savoir avant de commencer.</h2>
              <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-neutral-600">Une réponse courte. Et si votre cas est particulier, notre équipe est à portée de message.</p>
            </Reveal>
            <Reveal className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-[22px] border border-neutral-200 bg-white shadow-[0_18px_50px_rgba(30,41,59,0.06)]">
              <div className="divide-y divide-neutral-200">
                {faqItems.map((item) => <FaqItemRow key={item.id} item={item} isOpen={openFaq === item.id} onToggle={() => setOpenFaq(openFaq === item.id ? null : item.id)} />)}
              </div>
            </Reveal>
            <Reveal className="mt-8 text-center">
              <Link href="/contact" className="group inline-flex min-h-11 items-center gap-2 text-sm font-extrabold text-primary-800 underline decoration-primary-200 decoration-2 underline-offset-4 hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-800">Contacter l'équipe <ArrowUpRight size={16} weight="bold" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></Link>
            </Reveal>
          </div>
        </section>

        <section className="bg-primary-50 px-5 py-12 sm:px-6 lg:px-10">
          <Reveal className="mx-auto flex max-w-[1120px] flex-col justify-between gap-6 rounded-[28px] bg-white p-7 shadow-sm sm:p-10 lg:flex-row lg:items-center">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-primary-800">Prêt à simplifier votre gestion ?</p>
              <h2 className="mt-3 text-2xl font-bold tracking-[-0.045em] text-neutral-950 sm:text-3xl">Votre prochain encaissement peut déjà être plus simple.</h2>
              <p className="mt-3 text-base text-neutral-600">Créez votre espace Loka et testez le parcours pendant 14 jours, sans engagement.</p>
            </div>
            <Button asChild size="lg" className="shrink-0 rounded-lg bg-primary-800 px-6 text-sm font-bold hover:bg-primary-900"><Link href="/auth?tab=signup">Commencer maintenant <ArrowRight size={17} weight="bold" aria-hidden="true" /></Link></Button>
          </Reveal>
        </section>
      </main>

      <footer className="bg-neutral-950 text-white">
        <div className="mx-auto max-w-[1240px] px-5 py-16 sm:px-6 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr]">
            <Reveal>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-white"><Image src="/logo.jpg" alt="Logo Loka" width={44} height={44} className="h-full w-full object-contain" /></span>
                <span className="text-[21px] font-black tracking-[-0.05em]">Loka</span>
              </div>
              <p className="mt-6 max-w-sm text-base leading-7 text-neutral-400">La gestion locative qui laisse plus de place à vos biens, vos locataires et vos décisions.</p>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">🇧🇯 Cotonou · Calavi · Porto-Novo</p>
            </Reveal>
            {footerGroups.map((group) => (
              <div key={group.title}>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">{group.title}</p>
                <ul className="mt-5 space-y-3 text-sm text-neutral-300">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href} 
                        className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-16 flex flex-col justify-between gap-4 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row">
            <p>© 2026 Loka Technologies. La gestion locative au Bénin 🇧🇯.</p>
            <p>Simple à utiliser. Sérieux à gérer.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
