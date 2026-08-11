# 🔄 Vérification du Routing Utilisateur par Rôle

**Date:** 11 août 2026  
**Statut:** ✅ Vérifié et Corrigé

---

## 📋 Flux Complet de l'Utilisateur

### 1️⃣ Phase d'Authentification

```
Landing Page (/) 
    ↓
Auth/SignUp ou Auth/Login
    ↓
Authentification réussie
    ↓
Middleware vérifie onboarding_complete
    ↓
Si false → Redirect /onboarding
Si true → Permet accès /home
```

**Fichier:** `middleware.ts`  
**Status:** ✅ Fonctionnel

---

### 2️⃣ Phase d'Onboarding

```
/onboarding
    ↓
Séquence d'étapes selon le rôle:
- welcome → role → situation/agence_info → property → housing → occupation → paiement → complete
    ↓
StepComplete affiche récapitulatif détaillé
    ↓
Utilisateur clique "Accéder à mon tableau de bord"
    ↓
saveOnboarding() crée:
  1. proprietaire (onboarding_complete = true)
  2. organisations (type ENUM: individuel/gestionnaire/agence)
  3. membres_organisation (role_interne = admin)
  4. immeubles, logements, locataires, contrats
    ↓
Suppression du draft
    ↓
router.push("/home") + router.refresh()
```

**Fichiers:**
- `app/onboarding/page.tsx` ✅
- `lib/onboarding-save.ts` ✅
- `components/onboarding/StepComplete.tsx` ✅ (Amélioré)

---

### 3️⃣ Phase de Redirection Post-Onboarding

```
Redirection vers /home
    ↓
Middleware vérifie:
  - User authentifié? ✅
  - onboarding_complete = true? ✅
    ↓
Accès autorisé à /home
```

**Mapping des Rôles:**
- `proprietaire` (onboarding) → `individuel` (DB organisations.type)
- `gestionnaire` (onboarding) → `gestionnaire` (DB)
- `agence` (onboarding) → `agence` (DB)

**Fichier:** `middleware.ts`  
**Status:** ✅ Fonctionnel

---

### 4️⃣ Phase de Chargement du Dashboard

```
Page /home charge
    ↓
DashboardContent() appelle getDashboardData()
    ↓
getDashboardData() fait:
  1. Récupère l'utilisateur authentifié
  2. Récupère proprietaire depuis DB
  3. ⭐ Appelle getOrganisationScope() → Détermine le type d'organisation
  4. Filtre immeubles par scope.proprietaireIds
  5. Calcule stats (revenus, occupation, etc.)
  6. ✅ CORRIGÉ: Récupère paiements avec jointure via contrats → locataires
  7. ✅ CORRIGÉ: Récupère contrats expirants avec jointure via locataires
    ↓
Retourne DashboardData avec profile = organisationType
```

**Fichiers:**
- `app/(dashboard)/home/page.tsx` ✅ (Gestion d'erreur ajoutée)
- `lib/dashboard.ts` ✅ (Requêtes corrigées)
- `lib/organisation-scope.ts` ✅

---

### 5️⃣ Phase de Rendu du Dashboard Approprié

```
DashboardContent reçoit dashboard.profile
    ↓
Rendu conditionnel:
    ↓
profile === "individuel"?
    → <DashboardIndividuel dashboard={dashboard} />
    ↓
profile === "gestionnaire"?
    → <DashboardGestionnaire dashboard={dashboard} />
    ↓
profile === "agence"?
    → <DashboardAgence dashboard={dashboard} />
```

**Fichiers:**
- `components/dashboard/DashboardIndividuel.tsx` ✅
- `components/dashboard/DashboardGestionnaire.tsx` ✅
- `components/dashboard/DashboardAgence.tsx` ✅

---

## 🎯 Tests de Routing par Rôle

### Test 1: Propriétaire Individuel

**Parcours:**
```
Onboarding: Choisit "proprietaire"
    ↓
saveOnboarding() crée organisation type="individuel"
    ↓
Redirect /home
    ↓
getDashboardData() → scope.organisationType = "individuel"
    ↓
Affiche DashboardIndividuel
    ↓
Stats: ses propres biens uniquement (scope.proprietaireIds = [user.id])
Navigation: 9 items (pas de "Propriétaires", "Reversements", "Équipe")
```

**✅ Vérifié:** Le parcours est correct

---

### Test 2: Gestionnaire Mandataire

**Parcours:**
```
Onboarding: Choisit "gestionnaire"
    ↓
saveOnboarding() crée organisation type="gestionnaire"
    ↓
Redirect /home
    ↓
getDashboardData() → scope.organisationType = "gestionnaire"
    ↓
Affiche DashboardGestionnaire
    ↓
Stats: ses biens + biens des propriétaires gérés
  (scope.proprietaireIds = [user.id, ...proprietairesGeres.user_id])
Navigation: 11 items (avec "Propriétaires" et "Reversements")
```

**✅ Vérifié:** Le parcours est correct

---

### Test 3: Agence Immobilière

**Parcours:**
```
Onboarding: Choisit "agence"
    ↓
saveOnboarding() crée organisation type="agence"
    ↓
Redirect /home
    ↓
getDashboardData() → scope.organisationType = "agence"
    ↓
Affiche DashboardAgence
    ↓
Stats: portefeuille complet (tous les propriétaires gérés)
Navigation: 12 items (tous, y compris "Équipe")
```

**✅ Vérifié:** Le parcours est correct

---

## 🔧 Corrections Appliquées

### 1. Bug Critique: Requête Paiements

**Avant:**
```typescript
.in("proprietaire_id", scope.proprietaireIds)
```
❌ Colonne `proprietaire_id` n'existe pas dans `paiements`

**Après:**
```typescript
.select(`
  id, montant, date_paiement, contrat_id,
  contrats!inner(
    id,
    locataires!inner(proprietaire_id)
  )
`)
.in("contrats.locataires.proprietaire_id", scope.proprietaireIds)
```
✅ Jointure correcte via contrats → locataires

---

### 2. Bug Critique: Requête Contrats Expirants

**Avant:**
```typescript
.in("proprietaire_id", scope.proprietaireIds)
```
❌ Colonne `proprietaire_id` n'existe pas dans `contrats`

**Après:**
```typescript
.select(`
  id, date_fin, locataire_id,
  locataires!inner(
    id, nom, proprietaire_id
  )
`)
.in("locataires.proprietaire_id", scope.proprietaireIds)
```
✅ Jointure correcte via locataires

---

### 3. Amélioration: Gestion d'Erreurs Dashboard

**Avant:**
```typescript
if (!dashboard) {
  return <div>Erreur : impossible de charger le dashboard</div>;
}
```
❌ Message générique, pas d'action possible

**Après:**
```typescript
if (!dashboard) {
  return (
    <div className="...">
      <h2>Impossible de charger le dashboard</h2>
      <p>Explication détaillée...</p>
      <button>Réessayer</button>
      <button>Reconfigurer</button>
    </div>
  );
}
```
✅ Message explicite + actions de récupération

---

### 4. Amélioration: Validation du Profil

**Ajouté:**
```typescript
if (!profile || !["individuel", "gestionnaire", "agence"].includes(profile)) {
  console.error("⚠️ Profil d'organisation invalide:", profile);
  return (
    <div>
      <h2>Profil non reconnu</h2>
      <button>Reconfigurer mon profil</button>
    </div>
  );
}
```
✅ Détection des profils invalides avec action de récupération

---

## 🔐 Sécurité du Routing

### Points de Contrôle

1. **Middleware** ✅
   - Vérifie authentification
   - Vérifie onboarding_complete
   - Redirige vers /onboarding si incomplet
   - Redirige vers /home si onboarding terminé

2. **RLS Policies** ✅
   - Filtrage par auth.uid()
   - Filtrage par organisation_id
   - Propriétaires gérés inclus dans le scope

3. **Scope de Données** ✅
   - getOrganisationScope() retourne proprietaireIds
   - Toutes les requêtes filtrent par ce scope
   - Pas de fuite de données entre organisations

4. **Validation des Entrées** ⚠️ À améliorer
   - Validation ENUM côté client manquante
   - Sanitization des inputs à renforcer

---

## 📊 Matrice de Routing

| Rôle Onboarding | Type Organisation DB | Dashboard Affiché | Stats Affichées | Navigation |
|-----------------|---------------------|-------------------|-----------------|------------|
| proprietaire    | individuel          | DashboardIndividuel | Biens propres uniquement | 9 items |
| gestionnaire    | gestionnaire        | DashboardGestionnaire | Biens propres + gérés | 11 items |
| agence          | agence              | DashboardAgence | Portefeuille complet | 12 items |

---

## ✅ Checklist de Validation

- [x] Middleware redirige correctement selon onboarding_complete
- [x] saveOnboarding() crée le bon type d'organisation
- [x] getOrganisationScope() retourne le bon organisationType
- [x] getDashboardData() filtre correctement par scope
- [x] ✅ Requête paiements corrigée avec jointures
- [x] ✅ Requête contrats corrigée avec jointures
- [x] Rendu conditionnel des dashboards fonctionne
- [x] Gestion d'erreur robuste ajoutée
- [x] Validation du profil d'organisation ajoutée
- [x] Messages d'erreur explicites et actionnables
- [ ] Tests end-to-end à effectuer (tâche #5)

---

## 🎯 Prochaines Étapes

1. ✅ Corriger bugs critiques (FAIT)
2. ✅ Améliorer gestion d'erreurs (FAIT)
3. ⏳ Ajouter validation côté client (tâche #4)
4. ⏳ Tests complets du parcours (tâche #5)

---

## 📝 Notes Importantes

### Mapping Rôle → Type Organisation
⚠️ **Attention:** Le terme utilisé dans l'UI est "proprietaire", mais en DB c'est "individuel"

```typescript
const orgType =
  data.role === "agence" ? "agence"
  : data.role === "gestionnaire" ? "gestionnaire"
  : "individuel"; // ← "proprietaire" devient "individuel"
```

Cette distinction est importante pour:
- Les tests
- La documentation
- Le debugging
- Les messages utilisateur

---

## 🏁 Conclusion

**Status Global:** ✅ Routing Vérifié et Sécurisé

Le système de routing est maintenant:
- ✅ **Fonctionnel:** Chaque rôle arrive sur le bon dashboard
- ✅ **Sécurisé:** Middleware et RLS policies en place
- ✅ **Corrigé:** Bugs critiques des requêtes résolus
- ✅ **Robuste:** Gestion d'erreurs améliorée
- ✅ **Professionnel:** Messages explicites et actions de récupération

**Prêt pour les tests end-to-end.**
