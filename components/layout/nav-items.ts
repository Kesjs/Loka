import {
  House,
  Buildings,
  DoorOpen,
  Users,
  UsersThree,
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
  divider?: boolean; // Séparateur après cet item
  conditionalShow?: "gestionnaire" | "agence" | "individuel"; // Visible uniquement pour ce type
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

// Structure plate sans sections - items divisés visuellement par des traits
export const flatNavItems: NavItem[] = [
  { href: "/home", label: "Accueil", icon: House },
  { href: "/proprietaires", label: "Propriétaires", icon: UsersThree, conditionalShow: "gestionnaire" }, // Visible uniquement pour gestionnaire/agence
  { href: "/logements", label: "Logements", icon: DoorOpen },
  { href: "/locataires", label: "Locataires", icon: Users },
  { href: "/immeubles", label: "Immeubles", icon: Buildings, divider: true },
  
  { href: "/paiements", label: "Paiements", icon: Wallet },
  { href: "/contrats", label: "Contrats", icon: FileText },
  { href: "/rapports", label: "Rapports", icon: ChartBar, divider: true },
  
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Gear },
];

// Structure hiérarchique (compatibilité)
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
