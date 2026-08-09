/**
 * components/layout/nav-items.tsx
 * 
 * Items de navigation adaptés selon le profil de l'utilisateur
 */

import {
  House,
  Buildings,
  Door,
  Users,
  FileText,
  Wallet,
  ChartBar,
  Gear,
  Bell,
  Briefcase,
  UsersThree,
} from "@phosphor-icons/react";
import type { OrganisationType } from "@/lib/dashboard";
import type { ElementType } from "react";

export interface NavItem {
  label: string;
  href: string;
  icon: ElementType;
  group?: string;
  conditionalShow?: OrganisationType | "gestionnaire"; // "gestionnaire" means shown for both gestionnaire and agence
  divider?: boolean;
}

/**
 * Tous les items de navigation disponibles
 * Le composant filtre selon le profil
 */
export const flatNavItems: NavItem[] = [
  {
    label: "Accueil",
    href: "/home",
    icon: House,
  },
  {
    label: "Immeubles",
    href: "/immeubles",
    icon: Buildings,
    group: "Gestion",
  },
  {
    label: "Logements",
    href: "/logements",
    icon: Door,
    group: "Gestion",
  },
  {
    label: "Locataires",
    href: "/locataires",
    icon: Users,
    group: "Gestion",
  },
  {
    label: "Contrats",
    href: "/contrats",
    icon: FileText,
    group: "Gestion",
  },
  {
    label: "Propriétaires",
    href: "/proprietaires",
    icon: Briefcase,
    group: "Gestion",
    conditionalShow: "gestionnaire", // Shown for gestionnaire and agence
  },
  {
    label: "Paiements",
    href: "/paiements",
    icon: Wallet,
    group: "Finances",
  },
  {
    label: "Rapports",
    href: "/rapports",
    icon: ChartBar,
    group: "Analyse",
  },
  {
    label: "Équipe",
    href: "/equipe",
    icon: UsersThree,
    group: "Gestion",
    conditionalShow: "agence", // Shown only for agence
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    group: "Système",
  },
  {
    label: "Paramètres",
    href: "/parametres",
    icon: Gear,
    group: "Système",
  },
];

/**
 * Récupère les items de navigation selon le profil
 */
export function getNavItemsByProfile(profile: OrganisationType | null): NavItem[] {
  return flatNavItems.filter((item) => {
    if (!item.conditionalShow) return true;

    // Si l'item doit être visible pour gestionnaire, le montrer aussi pour agence
    if (item.conditionalShow === "gestionnaire") {
      return profile === "gestionnaire" || profile === "agence";
    }

    return item.conditionalShow === profile;
  });
}

/**
 * Retourne le nombre d'items attendu pour chaque profil
 */
export function getExpectedNavItemCount(profile: OrganisationType | null): number {
  if (profile === "agence") return 11; // tous les items
  if (profile === "gestionnaire") return 10; // sans "Équipe"
  return 9; // sans "Propriétaires" ni "Équipe"
}
