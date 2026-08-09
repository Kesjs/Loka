# 📋 SPEC : Connexion Onboarding + Dashboard Adaptatif par Profil

**Objectif :** Assurer que l'onboarding capture correctement le profil utilisateur et que le dashboard s'affiche avec le bon contenu selon le profil.

**Durée estimée :** 1-2 jours  
**Priorité :** 🔴 CRITIQUE (fondation pour multi-org)

---

## 1️⃣ Vue d'ensemble du flux

```
┌─────────────────────────────────────────────────────────────┐
│ UTILISATEUR SE CONNECTE                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  Middleware vérifie :
                  onboarding_complete ?
                    ├─ NO  → /onboarding
                    └─ YES → /home
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ ONBOARDING PAGE                                             │
├─────────────────────────────────────────────────────────────┤
│ Steps:                                                       │
│  0. Bienvenue                                               │
│  1. Profil (nom, telephone)                                 │
│  2. Rôle (proprietaire/gestionnaire/agence)                │
│  3. Situation (premier_bien/possede_deja/gere_deja)        │
│  4. Info Agence (si agence)  OU  Proprietaires Gérés (si)  │
│  5. Bien (nom, adresse, type)                               │
│  6. Logements (nombre, occupation)                          │
│  7. Paiement (devise, fréquence)                            │
│  8. Complétion                                              │
│                                                              │
│ Auto-save :                                                 │
│  - localStorage (instantané)                                │
│  - DB (30s débounce)                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    saveOnboarding()
                            ↓
    ┌───────────────────────┴────────────────────────┐
    ↓                                                 ↓
┌──────────────────────┐               ┌──────────────────────┐
│ Créer/Mettre à jour  │               │ Créer ORGANISATION   │
│ table proprietaire   │               │ table               │
│                      │               │                      │
│ - nom                │               │ - type (selon role)  │
│ - telephone          │               │ - owner_user_id      │
│ - role               │               │ - nom                │
│ - devise             │               │                      │
│ - garantie_defaut    │               │ Créer MEMBRES_ORG    │
│ - onboarding_complete│               │                      │
│ - onboarding_data    │               │ - user_id            │
│                      │               │ - org_id             │
│                      │               │ - role_interne       │
└──────────────────────┘               └──────────────────────┘
                            ↓
                     Créer IMMEUBLE
                    Créer LOGEMENTS
                   (si besoin)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ POST-ONBOARDING                                             │
│  router.push("/home") + router.refresh()                    │
│  deleteDraft() → nettoyage localStorage + DB                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ DASHBOARD PAGE (/home)                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. Récupérer USER + PROPRIETAIRE                            │
│ 2. Déterminer ORG_TYPE (du role capturé à l'onboarding)    │
│ 3. Construire ORG_SCOPE selon type :                        │
│    - Individuel : data_scope = [user.id]                   │
│    - Gestionnaire : data_scope = [user.id + gérés]        │
│    - Agence : data_scope = [org_id]                        │
│                                                              │
│ 4. Charger DASHBOARD ADAPTÉ :                               │
│    ├─ if Individuel → <DashboardIndividuel />             │
│    ├─ if Gestionnaire → <DashboardGestionnaire />         │
│    └─ if Agence → <DashboardAgence />                     │
│                                                              │
│ 5. Adapter SIDEBAR selon type :                             │
│    └─ nav-items + icons selon profile                      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ Fichiers à créer/modifier

### Créer

| Fichier | Responsabilité |
|---------|----------------|
| `lib/dashboard.ts` | Logique getDashboardData(), buildOrgScope() |
| `lib/hooks/useOrganisationType.ts` | Hook pour récupérer type org depuis DB |
| `lib/organisation-scope.ts` | Classe OrganisationScope pour scoping données |
| `components/dashboard/DashboardIndividuel.tsx` | Composant dashboard individuel |
| `components/dashboard/DashboardGestionnaire.tsx` | Composant dashboard gestionnaire |
| `components/dashboard/DashboardAgence.tsx` | Composant dashboard agence |
| `components/layout/nav-items.ts` | getNavItemsByProfile(profile) |
| `components/layout/Sidebar.tsx` | Adaptation sidebar selon profil |
| `app/(dashboard)/home/page.tsx` | Page d'accueil avec sélection dashboard |

### Modifier

| Fichier | Modification |
|---------|--------------|
| `lib/onboarding-save.ts` | Ajouter création organisation + membres |
| `components/onboarding/types.ts` | Vérifier que `role` et `profil` bien capturés |
| `middleware.ts` | Vérifier redirection logique |
| `app/(dashboard)/layout.tsx` | Vérifier onboarding_complete check |

---

## 3️⃣ Détail des tâches

### 🎯 Tâche 1 : Créer Organisation + Membres à la fin d'Onboarding

**Fichier :** `lib/onboarding-save.ts`

**Modification requise :**
Après avoir créé/mis à jour `proprietaire`, créer automatiquement :

```typescript
// 1. Créer organisation
const { data: org, error: orgError } = await supabase
  .from("organisations")
  .insert({
    type: data.role, // "proprietaire", "gestionnaire", "agence"
    nom: data.agenceInfo?.nom || data.profil.nom,
    owner_user_id: user.id,
  })
  .select()
  .single();

// 2. Créer organisation_members
await supabase.from("organisation_members").insert({
  organisation_id: org.id,
  user_id: user.id,
  role_interne: "proprietaire", // ou "gestionnaire" selon contexte
});

// 3. Si gestionnaire/agence : créer proprietaires_geres
if (data.role === "gestionnaire" && data.proprietaireGere) {
  await supabase.from("proprietaires_geres").insert({
    organisation_id: org.id,
    nom: data.proprietaireGere.nom,
    telephone: data.proprietaireGere.telephone,
    // ... autres champs
  });
}
```

**Validation :**
- [ ] Organisation créée dans la DB
- [ ] organisation_members liée correctement
- [ ] proprietaires_geres créés si applicables

---

### 🎯 Tâche 2 : Créer getDashboardData() et buildOrgScope()

**Fichier :** `lib/dashboard.ts`

**Responsabilités :**

```typescript
// Récupérer l'organisation de l'utilisateur
export async function getOrganisationScope(userId: string) {
  // 1. Chercher organisation où owner_user_id = userId
  // 2. Si pas trouvée, chercher organisation via organisation_members
  // 3. Retourner { orgId, orgType, role }
}

// Assembler les données du dashboard
export async function getDashboardData(userId: string) {
  // 1. Récupérer utilisateur + proprietaire
  // 2. Récupérer organisation scope
  // 3. Déterminer data_scope selon orgType :
  //    - "proprietaire" → own data
  //    - "gestionnaire" → own + managed proprietaires
  //    - "agence" → org data
  // 4. Récupérer immeubles, logements, contrats, paiements
  // 5. Calculer stats (revenu, occupation, etc.)
  // 6. Retourner { profile, stats, data_scope, ... }
}
```

**Validation :**
- [ ] Organisation récupérée correctement
- [ ] Data scope appliqué selon profil
- [ ] Stats calculées

---

### 🎯 Tâche 3 : Créer hook useOrganisationType()

**Fichier :** `lib/hooks/useOrganisationType.ts`

```typescript
export function useOrganisationType(): "individuel" | "gestionnaire" | "agence" | null {
  // 1. Récupérer user via useSession ou supabase.auth.getUser()
  // 2. Chercher propriétaire.role
  // 3. Retourner type d'organisation
}
```

**Validation :**
- [ ] Hook retourne le bon type selon l'utilisateur
- [ ] Fallback si pas trouvé

---

### 🎯 Tâche 4 : Créer 3 composants Dashboard

**Fichiers :**
- `components/dashboard/DashboardIndividuel.tsx`
- `components/dashboard/DashboardGestionnaire.tsx`
- `components/dashboard/DashboardAgence.tsx`

**Structure commune :**

```typescript
interface DashboardProps {
  stats: {
    revenuMensuel: number;
    tauxOccupation: number;
    nombreImmeubles: number;
    nombreLogements: number;
  };
  userName: string;
  onboarding_data: any;
}

export function DashboardIndividuel({ stats, userName, onboarding_data }: DashboardProps) {
  return (
    <DashboardLayout>
      <DashboardHeader greeting={`Bienvenue ${userName}`} />
      
      {/* Stats Cards */}
      <StatsGrid stats={stats} />
      
      {/* Paiements Récents */}
      <RecentPayments />
      
      {/* Contrats Expirants */}
      <ExpiringContracts />
      
      {/* Occupation par Immeuble */}
      <OccupancyChart />
    </DashboardLayout>
  );
}
```

**Différences par profil :**

| Individuel | Gestionnaire | Agence |
|-----------|-------------|--------|
| Stats perso | Stats + portefeuille gérés | Stats org |
| Mon patrimoine | Mes clients | Mes équipes |
| Mes logements | Portefeuille gérés | Répartition équipes |
| - | - | Gestion staff |

**Validation :**
- [ ] 3 composants créés
- [ ] Chacun reçoit les bonnes données
- [ ] Layout/design cohérent

---

### 🎯 Tâche 5 : Créer nav-items.ts et adapter Sidebar

**Fichier :** `components/layout/nav-items.ts`

```typescript
export function getNavItemsByProfile(profile: "individuel" | "gestionnaire" | "agence") {
  const baseItems = [
    { label: "Accueil", href: "/home", icon: "home" },
    { label: "Immeubles", href: "/immeubles", icon: "building" },
    { label: "Logements", href: "/logements", icon: "square" },
    { label: "Locataires", href: "/locataires", icon: "users" },
    { label: "Contrats", href: "/contrats", icon: "document" },
    { label: "Paiements", href: "/paiements", icon: "wallet" },
    { label: "Rapports", href: "/rapports", icon: "chart" },
    { label: "Paramètres", href: "/parametres", icon: "settings" },
  ];

  if (profile === "gestionnaire" || profile === "agence") {
    baseItems.push({ label: "Propriétaires", href: "/proprietaires", icon: "person" });
  }

  if (profile === "agence") {
    baseItems.push({ label: "Équipe", href: "/equipe", icon: "people" });
  }

  return baseItems;
}
```

**Modifications Sidebar :**
```typescript
// components/layout/Sidebar.tsx
const orgType = useOrganisationType();
const navItems = getNavItemsByProfile(orgType);
// Rendre navItems avec animations
```

**Validation :**
- [ ] Individuel : 8 items
- [ ] Gestionnaire : 9 items (+ Propriétaires)
- [ ] Agence : 10 items (+ Propriétaires + Équipe)

---

### 🎯 Tâche 6 : Intégrer dans app/(dashboard)/home/page.tsx

**Modification requise :**

```typescript
export default async function HomePage() {
  const user = await requireAuth();
  
  // 1. Récupérer données dashboard
  const dashboardData = await getDashboardData(user.id);
  
  // 2. Déterminer quel dashboard afficher
  const Dashboard = {
    "individuel": DashboardIndividuel,
    "gestionnaire": DashboardGestionnaire,
    "agence": DashboardAgence,
  }[dashboardData.profile];
  
  // 3. Rendre le bon dashboard
  return <Dashboard {...dashboardData} />;
}
```

**Validation :**
- [ ] Page charge correctement
- [ ] Bon dashboard affiché selon profil
- [ ] Données correctes

---

## 4️⃣ Architecture des données

### Flux de données Onboarding → DB

```
OnboardingData
├── profil { nom, telephone, email }
├── role ← KEY (détermine org_type)
├── situation
├── agenceInfo { nom, siège }
├── proprietaireGere { nom, telephone }
├── bien { nom, adresse, type }
├── logements { nombreImmeubles, occupation[] }
└── paiement { devise, fréquence }

    ↓ saveOnboarding()

Crée/Met à jour :
├── proprietaire (id, nom, telephone, devise, role, onboarding_data)
├── organisations (type=role, nom, owner_user_id)
├── organisation_members (user_id, org_id)
├── proprietaires_geres (si applicable)
├── immeubles (proprietaire_id, organisation_id, nom, adresse)
└── logements (immeuble_id, occupation)
```

### Flux DB → Dashboard

```
SELECT proprietaire, organisations, organisation_members
├── Déterminer orgType (individuel/gestionnaire/agence)
├── Déterminer data_scope
└── Récupérer data filtrée

    ↓ getDashboardData()

    ├─ Récupérer immeubles (filtrés)
    ├─ Récupérer logements + contrats + paiements (filtrés)
    ├─ Calculer stats
    └─ Retourner { profile, stats, data }

    ↓ app/(dashboard)/home/page.tsx

    ├─ Si individuel → <DashboardIndividuel />
    ├─ Si gestionnaire → <DashboardGestionnaire />
    └─ Si agence → <DashboardAgence />
```

---

## 5️⃣ Checklist de validation

### Phase 1 : Onboarding → Organisation
- [ ] `saveOnboarding()` crée organisation
- [ ] `organisation_members` liée correctement
- [ ] Type d'org = role sélectionné (proprietaire/gestionnaire/agence)
- [ ] proprietaires_geres créés si gestionnaire/agence

### Phase 2 : Organisation → Scope
- [ ] `getDashboardData()` récupère organisation
- [ ] Data scope déterminé correctement
- [ ] Data filtrée selon scope

### Phase 3 : Dashboard Rendu
- [ ] 3 composants dashboard créés
- [ ] Bon composant rendu selon profile
- [ ] Sidebar adapté selon profile
- [ ] Navigation items corrects

### Phase 4 : Intégration Complète
- [ ] Signup → Onboarding → Dashboard (profil correct)
- [ ] Rechargement page maintient profil
- [ ] Sidebar navigation fonctionne
- [ ] No console errors

---

## 6️⃣ Tests à faire

### Test 1 : Flux Individuel
```
1. Signup
2. Onboarding : Profil (Individuel)
3. Complète onboarding
4. Vérifie DB : organisation.type = "proprietaire"
5. Vérifie dashboard : DashboardIndividuel affiché
6. Vérifie sidebar : 8 items (pas "Propriétaires" ni "Équipe")
```

### Test 2 : Flux Gestionnaire
```
1. Signup
2. Onboarding : Profil (Gestionnaire) + proprietaires_geres
3. Complète onboarding
4. Vérifie DB : organisation.type = "gestionnaire"
5. Vérifie dashboard : DashboardGestionnaire affiché
6. Vérifie sidebar : 9 items (+ "Propriétaires")
```

### Test 3 : Flux Agence
```
1. Signup
2. Onboarding : Profil (Agence) + agenceInfo
3. Complète onboarding
4. Vérifie DB : organisation.type = "agence"
5. Vérifie dashboard : DashboardAgence affiché
6. Vérifie sidebar : 10 items (+ "Propriétaires" + "Équipe")
```

### Test 4 : Rechargement
```
1. Complète onboarding avec profil X
2. F5 reload
3. Vérifie que dashboard reste X (pas reset)
```

---

## 7️⃣ Ordre d'implémentation recommandé

1. **Tâche 1** : Modifier `lib/onboarding-save.ts` pour créer organisation
2. **Tâche 2** : Créer `lib/dashboard.ts` avec getDashboardData()
3. **Tâche 3** : Créer `lib/hooks/useOrganisationType.ts`
4. **Tâche 5** : Créer `nav-items.ts` + adapter Sidebar
5. **Tâche 4** : Créer 3 composants dashboard
6. **Tâche 6** : Intégrer dans `app/(dashboard)/home/page.tsx`

---

## 📝 Notes

- **Reuse existing code** : Les dashboards/sidebars existent possiblement déjà
- **Design cohérent** : Utiliser le design system existant (Phosphor icons, tailwind, etc.)
- **Performance** : Cacher les requêtes DB coûteuses (revalidatePath si besoin)
- **Testing** : Tester chaque flux (individuel/gestionnaire/agence) manuellement

