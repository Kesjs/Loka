# LOKA — Architecture des Dashboards par Profil

## Plan d'implémentation

### Phase 1 : Adapter la Sidebar

#### 1.1 Modifier `components/layout/nav-items.ts`

**Nouvelle structure :**

```typescript
// PROFIL INDIVIDUEL
export const navItemsIndividuel: NavItem[] = [
  { href: "/home", label: "Accueil", icon: House },
  
  // PATRIMOINE
  { href: "/immeubles", label: "Immeubles", icon: Buildings },
  { href: "/logements", label: "Logements", icon: DoorOpen },
  
  // GESTION LOCATIVE
  { href: "/locataires", label: "Locataires", icon: Users },
  { href: "/contrats", label: "Contrats", icon: FileText },
  { href: "/paiements", label: "Paiements", icon: Wallet, divider: true },
  
  // ANALYSE
  { href: "/rapports", label: "Rapports", icon: ChartBar, divider: true },
  
  // FOOTER
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Gear },
];

// PROFIL GESTIONNAIRE
export const navItemsGestionnaire: NavItem[] = [
  { href: "/home", label: "Accueil", icon: House },
  
  // PORTEFEUILLE
  { href: "/proprietaires", label: "Propriétaires", icon: UsersThree },
  { href: "/immeubles", label: "Immeubles", icon: Buildings },
  { href: "/logements", label: "Logements", icon: DoorOpen },
  
  // GESTION LOCATIVE
  { href: "/locataires", label: "Locataires", icon: Users },
  { href: "/contrats", label: "Contrats", icon: FileText },
  { href: "/paiements", label: "Paiements", icon: Wallet, divider: true },
  
  // ANALYSE
  { href: "/rapports", label: "Rapports", icon: ChartBar, divider: true },
  
  // FOOTER
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Gear },
];

// PROFIL AGENCE
export const navItemsAgence: NavItem[] = [
  { href: "/home", label: "Accueil", icon: House },
  
  // PORTEFEUILLE
  { href: "/proprietaires", label: "Propriétaires", icon: UsersThree },
  { href: "/immeubles", label: "Immeubles", icon: Buildings },
  { href: "/logements", label: "Logements", icon: DoorOpen },
  
  // GESTION LOCATIVE
  { href: "/locataires", label: "Locataires", icon: Users },
  { href: "/contrats", label: "Contrats", icon: FileText },
  { href: "/paiements", label: "Paiements", icon: Wallet, divider: true },
  
  // ANALYSE
  { href: "/rapports", label: "Rapports", icon: ChartBar, divider: true },
  
  // AGENCE
  { href: "/equipe", label: "Équipe", icon: UsersThree, divider: true },
  
  // FOOTER
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/parametres", label: "Paramètres", icon: Gear },
];

// Helper pour sélectionner les items selon le profil
export function getNavItemsByProfile(
  profile: "individuel" | "gestionnaire" | "agence"
): NavItem[] {
  switch (profile) {
    case "individuel":
      return navItemsIndividuel;
    case "gestionnaire":
      return navItemsGestionnaire;
    case "agence":
      return navItemsAgence;
    default:
      return navItemsIndividuel;
  }
}
```

#### 1.2 Modifier `components/layout/Sidebar.tsx`

**Changer :**
```typescript
// AVANT
const visibleNavItems = flatNavItems.filter((item) => {
  if (!item.conditionalShow) return true;
  if (item.conditionalShow === "gestionnaire") {
    return orgType === "gestionnaire" || orgType === "agence";
  }
  return item.conditionalShow === orgType;
});

// APRÈS
const visibleNavItems = getNavItemsByProfile(orgType || "individuel");
```

---

### Phase 2 : Adapter le Dashboard Home

#### 2.1 Enrichir `lib/dashboard.ts`

**Ajouter à `DashboardData` :**

```typescript
export interface DashboardData {
  // ... existant ...
  
  // Métadonnées du profil
  profileMetadata: {
    profile: "individuel" | "gestionnaire" | "agence";
    situation: Situation | null;
    niveauExperience: "debutant" | "confirme" | "expert" | null;
  };
  
  onboardingComplete: boolean;
  widgetPriorite: "revenus" | "paiements" | "occupation" | "contrats" | null;
  
  // Pour gestionnaire/agence uniquement
  proprietairesAttention?: Array<{
    id: string;
    nom: string;
    raison: string; // "loyers_impayés", "vacant", "contrats_renouveler"
    nombre: number;
  }>;
}
```

**Ajouter dans `getDashboardData()` :**

```typescript
// Récupérer le profil et les métadonnées d'onboarding
const { data: organisationData } = await supabase
  .from("organisations")
  .select("type")
  .eq("id", orgScope.organisationId)
  .maybeSingle();

const profile = organisationData?.type || "individuel";

// Récupérer les données d'onboarding du propriétaire
const onboardingData = proprietaire?.onboarding_data as any;
const widgetPriorite = proprietaire?.widget_priorite || null;
const onboardingComplete = proprietaire?.onboarding_complete || false;

return {
  // ... existant ...
  profileMetadata: {
    profile,
    situation: onboardingData?.situation || null,
    niveauExperience: calculateNiveauExperience(onboardingData?.situation),
  },
  onboardingComplete,
  widgetPriorite,
  proprietairesAttention: orgScope.organisationType !== "individuel" 
    ? await calculerProprietairesAttention(supabase, orgScope)
    : undefined,
};
```

#### 2.2 Modifier `app/(dashboard)/home/page.tsx`

**Nouveau composant DashboardContent :**

```typescript
async function DashboardContent() {
  const dashboard = await getDashboardData();
  const { profile } = dashboard.profileMetadata;

  return (
    <PageTransition className="space-y-6">
      {/* Header spécifique au profil */}
      <DashboardHeader profile={profile} dashboard={dashboard} />

      {/* Notification onboarding incomplet */}
      {!dashboard.onboardingComplete && (
        <OnboardingIncompleteAlert profile={profile} />
      )}

      {/* Contenu spécifique au profil */}
      {profile === "individuel" && (
        <DashboardIndividuel dashboard={dashboard} />
      )}
      {profile === "gestionnaire" && (
        <DashboardGestionnaire dashboard={dashboard} />
      )}
      {profile === "agence" && (
        <DashboardAgence dashboard={dashboard} />
      )}
    </PageTransition>
  );
}
```

**Créer 3 nouveaux composants :**

1. `components/dashboard/DashboardIndividuel.tsx`
   - Affiche : Patrimoine, Finances, Taux occupation, À surveiller, Activité récente
   
2. `components/dashboard/DashboardGestionnaire.tsx`
   - Affiche : Sélecteur portefeuille, Portefeuille, Finances, Taux occupation, Propriétaires nécessitant attention, À surveiller, Activité récente
   
3. `components/dashboard/DashboardAgence.tsx`
   - Affiche : Activité agence, Finances, Taux occupation, À traiter, Activité équipe, Propriétaires, Statistiques agence

#### 2.3 Créer composants réutilisables

**`components/dashboard/DashboardHeader.tsx`**
- Message d'accueil différent selon le profil
- Boutons d'actions contextuels

**`components/dashboard/OnboardingIncompleteAlert.tsx`**
- Bannière si onboarding incomplet
- Boutons "Continuer" / "Ignorer"

**`components/dashboard/PortfolioSelector.tsx`** (pour gestionnaire/agence)
- Dropdown pour filtrer par propriétaire
- Met à jour les stats en temps réel

**`components/dashboard/ProprietairesAttentionCard.tsx`** (pour gestionnaire/agence)
- Affiche propriétaires avec problèmes
- Hiérarchie visuelle selon la gravité

---

### Phase 3 : Structure des pages

**Fichiers à créer :**

- `app/(dashboard)/equipe/page.tsx` — Pour agence uniquement
- `components/dashboard/DashboardIndividuel.tsx`
- `components/dashboard/DashboardGestionnaire.tsx`
- `components/dashboard/DashboardAgence.tsx`
- `components/dashboard/DashboardHeader.tsx`
- `components/dashboard/OnboardingIncompleteAlert.tsx`
- `components/dashboard/PortfolioSelector.tsx`
- `components/dashboard/ProprietairesAttentionCard.tsx`

**Fichiers à modifier :**

- `components/layout/nav-items.ts` ← Ajouter les 3 profils
- `components/layout/Sidebar.tsx` ← Utiliser les profils
- `lib/dashboard.ts` ← Enrichir DashboardData
- `app/(dashboard)/home/page.tsx` ← Refactoriser avec profils

---

## Résumé des modifications

| Fichier | Action | Impact |
|---------|--------|--------|
| `nav-items.ts` | Créer 3 listes d'items | Sidebar s'adapte automatiquement |
| `Sidebar.tsx` | Utiliser `getNavItemsByProfile()` | Navigation par profil ✓ |
| `dashboard.ts` | Ajouter métadonnées profil | Données d'onboarding disponibles |
| `home/page.tsx` | Refactoriser avec 3 composants | Dashboard s'adapte au profil ✓ |
| `DashboardIndividuel.tsx` | Nouveau | Patrimoine, Finances, À surveiller |
| `DashboardGestionnaire.tsx` | Nouveau | Portefeuille, Sélecteur propriétaire |
| `DashboardAgence.tsx` | Nouveau | Agence, Équipe, Portefeuille global |
| `equipe/page.tsx` | Nouveau | Gestion équipe (agence uniquement) |

---

## Design à conserver

✓ Sidebar — animations, design gradient, collapse/expand  
✓ Animations de transition (PageTransition)  
✓ Sélecteurs — design et interactions  
✓ Cartes statistiques — layout, icônes, couleurs  
✓ Tableau des paiements — structure et styling  
✓ Design system complet (couleurs, typo, espacements)

---

## Prochaines étapes

1. Modifier `nav-items.ts` avec les 3 profils
2. Mettre à jour `Sidebar.tsx`
3. Enrichir `lib/dashboard.ts`
4. Créer les 3 composants de dashboard
5. Refactoriser `home/page.tsx`
6. Tester les 3 profils dans le navigateur
