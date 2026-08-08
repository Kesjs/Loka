import {
  House,
  Buildings,
  DoorOpen,
  Users,
  FileText,
  Wallet,
  ChartBar,
  Bell,
  Gear,
  type Icon,
} from "@phosphor-icons/react";

export interface NavItem {
  href: string;
  label: string;
  icon: Icon;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

// Structure hiérarchique de la navigation
export const navigationStructure: NavSection[] = [
  {
    section: "Gestion",
    items: [
      { href: "/home", label: "Accueil", icon: House },
      { href: "/logements", label: "Logements", icon: DoorOpen },
      { href: "/locataires", label: "Locataires", icon: Users },
    ],
  },
  {
    section: "Finance",
    items: [
      { href: "/paiements", label: "Paiements", icon: Wallet },
    ],
  },
  {
    section: "Ressources",
    items: [
      { href: "/immeubles", label: "Immeubles", icon: Buildings },
      { href: "/contrats", label: "Contrats", icon: FileText },
      { href: "/rapports", label: "Rapports", icon: ChartBar },
    ],
  },
  {
    section: "Admin",
    items: [
      { href: "/notifications", label: "Notifications", icon: Bell },
      { href: "/parametres", label: "Paramètres", icon: Gear },
    ],
  },
];

// Flatmap pour accès simple (compatibilité)
export const allNavItems: NavItem[] = navigationStructure.flatMap(
  (section) => section.items
);

// Items prioritaires (affichés en haut sur mobile)
export const primaryNavItems: NavItem[] = navigationStructure
  .flatMap((section) => section.items)
  .slice(0, 4);

export const NAV_TITLES: Record<string, string> = Object.fromEntries(
  allNavItems.map((item) => [item.href, item.label])
);
