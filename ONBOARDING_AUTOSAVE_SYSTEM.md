# 🎯 Système d'Auto-Save d'Onboarding - Documentation Complète

## 📌 Vue d'ensemble

Le système d'auto-save d'onboarding gère la sauvegarde robuste des données d'onboarding avec une **sauvegarde hybride** :
- **Sauvegarde locale instantanée** (localStorage) → Réactivité UX
- **Sauvegarde DB débouclée** (Supabase, 30s) → Persistance durable

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  PAGE ONBOARDING (/onboarding)              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Au chargement :                                          │
│     ├─ loadOnboardingDraft()                                 │
│     │  ├─ Essayer charger depuis DB (priorité)              │
│     │  └─ Fallback : localStorage                           │
│     └─ createAutoSaveFunction() → initialiser                │
│                                                               │
│  2. À chaque changement (step/data) :                        │
│     ├─ saveDraftLocally() → localStorage (instantané)       │
│     └─ Auto-save debounce (30s) → DB                        │
│                                                               │
│  3. À la complétion :                                        │
│     ├─ saveOnboarding() → enregistrer profil/données        │
│     └─ deleteDraft() → nettoyer localStorage + DB           │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Fichiers Clés

### 1. `lib/onboarding-draft.ts`
**Fonctions principales :**

```typescript
// Charger le brouillon (DB → localStorage)
async function loadOnboardingDraft(supabase): Promise<Draft | null>

// Sauvegarder localement (instantané)
function saveDraftLocally(step, data): void

// Sauvegarder en DB (asynchrone)
async function saveDraftToDatabase(supabase, step, data): Promise<Result>

// Supprimer le brouillon
async function deleteDraft(supabase): Promise<void>

// Créer une fonction auto-save débouclée
function createAutoSaveFunction(supabase, debounceMs): Function
```

### 2. `app/onboarding/page.tsx`
**Logique de page :**
- Charge le brouillon au montage
- Initialise auto-save débouclée
- Rend les étapes d'onboarding
- Complète et nettoie après

### 3. `app/onboarding/layout.tsx`
**Protection :**
- Vérifie que l'utilisateur est connecté
- Redirige vers `/home` si onboarding déjà complété
- Redirige vers `/auth` si non connecté

### 4. `app/(dashboard)/layout.tsx`
**Protection du dashboard :**
- Vérifie `onboarding_complete` dans la DB
- Redirige vers `/onboarding` si incomplet

### 5. `migrations/add_onboarding_drafts_table.sql`
**Schéma DB :**
```sql
CREATE TABLE onboarding_drafts (
  user_id UUID PRIMARY KEY,
  step INTEGER,
  data JSONB,
  updated_at TIMESTAMP,
  created_at TIMESTAMP
);
```
Avec RLS policies pour l'isolation par utilisateur.

---

## 📊 Flux de Données

### Scénario 1️⃣ : Utilisateur remplit l'onboarding normalement

```
1. Utilisateur change step/data
   ↓
2. saveDraftLocally() → localStorage (instantané)
   ↓
3. Auto-save débounce commence (30s timer)
   ↓
4. Si encore des changements, timer réinitié
   ↓
5. Après 30s sans changements → saveDraftToDatabase()
   ↓
6. Utilisateur complète → saveOnboarding() + deleteDraft()
```

### Scénario 2️⃣ : Utilisateur recharge la page

```
1. Page recharge
   ↓
2. loadOnboardingDraft() appelée
   ↓
3. Essayer charger depuis DB
   ├─ Si présent → restaurer step/data
   └─ Si absent → essayer localStorage
   ↓
4. Page recharge avec les données restaurées
```

### Scénario 3️⃣ : Perte de connexion réseau

```
1. Utilisateur remplit le formulaire
   ↓
2. saveDraftLocally() fonctionne (toujours)
   ↓
3. Auto-save DB échoue (réseau down)
   ↓
4. Utilisateur recharge la page
   ↓
5. localStorage fallback → données restaurées
```

---

## ⏱️ Débounce (30 secondes)

**Pourquoi 30s ?**
- Plus court → trop d'appels DB (performance ❌)
- Plus long → perte de données en cas de fermeture (UX ❌)
- 30s → sweet spot entre performance et sécurité ✅

**Implémentation :**
```typescript
const createAutoSaveFunction = (supabase, debounceMs = 30000) => {
  let timeoutId: NodeJS.Timeout | null = null;

  return async (step, data) => {
    saveDraftLocally(step, data); // Instantané
    
    if (timeoutId) clearTimeout(timeoutId); // Reset timer
    
    timeoutId = setTimeout(() => {
      saveDraftToDatabase(supabase, step, data); // Après 30s
    }, debounceMs);
  };
};
```

---

## 🔒 Sécurité & RLS

### Row Level Security (RLS)

Chaque utilisateur ne peut **voir/modifier que ses propres brouillons** :

```sql
-- SELECT : voir son propre brouillon
CREATE POLICY "user_select" ON onboarding_drafts
  FOR SELECT USING (auth.uid() = user_id);

-- UPDATE : modifier son propre brouillon
CREATE POLICY "user_update" ON onboarding_drafts
  FOR UPDATE USING (auth.uid() = user_id);

-- INSERT : créer son brouillon
CREATE POLICY "user_insert" ON onboarding_drafts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DELETE : supprimer son brouillon
CREATE POLICY "user_delete" ON onboarding_drafts
  FOR DELETE USING (auth.uid() = user_id);
```

### Isolation des données
- ✅ User A ne voit pas le brouillon d'User B
- ✅ User A ne peut pas modifier le brouillon d'User B
- ✅ JSONB permet stockage flexible des données

---

## 🧪 Tests

### Tests unitaires
`__tests__/unit/OnboardingDraft.test.ts`
- Sauvegarde locale
- Débounce
- Appels Supabase

### Tests manuels
`TEST_CHECKLIST.md`
- Flux complet signup → dashboard
- Rechargement + récupération
- Perte de connexion
- Redirections protégées

---

## 🚀 Performance

### localStorage
- ⚡ Instantané (~1ms)
- 📦 Limité à ~5-10MB
- 🔄 Synchrone

### Supabase DB
- ⏱️ ~100-500ms (dépend du réseau)
- 📊 Scalable illimité
- 🔄 Asynchrone

### Optimisations
- Débounce 30s → réduit appels DB ✅
- localStorage fallback → pas de perte UX en cas de réseau ✅
- Index sur `user_id` et `updated_at` → requêtes rapides ✅

---

## 📝 Logs & Debugging

**Logs console :**
```javascript
// Au chargement
✅ Brouillon chargé depuis la DB
✅ Brouillon chargé depuis localStorage

// Sauvegarde
✅ Brouillon sauvegardé en DB
⚠️ Erreur lors du chargement de la DB: ...

// localStorage
⚠️ Erreur lors de la sauvegarde locale: ...
```

**Debugging dans DevTools :**
```javascript
// Voir le brouillon stocké
localStorage.getItem('loka_onboarding_draft')

// Voir le dernier sync
localStorage.getItem('loka_onboarding_last_sync')

// Vider le localStorage
localStorage.removeItem('loka_onboarding_draft')
```

---

## 🔄 Cycle de Vie Complet

```
1. SIGNUP
   └─ Redirection automatique vers /onboarding

2. ONBOARDING (AUTO-SAVE)
   ├─ localStorage : immédiat
   ├─ DB : 30s débounce
   └─ Si recharge : récupération DB → localStorage

3. COMPLÉTION
   ├─ saveOnboarding() : enregistrer données finales
   ├─ deleteDraft() : nettoyer
   └─ Redirection vers /home

4. PROTECTION DASHBOARD
   ├─ Si incomplet : redirection vers /onboarding
   └─ Si complet : accès dashboard normal

5. PROTECTION ONBOARDING
   ├─ Si complet : redirection vers /home
   └─ Si incomplet : affichage page onboarding
```

---

## 📊 État de la Base de Données

### Table onboarding_drafts

| user_id | step | data | updated_at | created_at |
|---------|------|------|------------|------------|
| uuid-1 | 3 | `{...}` | 2024-01-20 10:15:00 | 2024-01-20 10:00:00 |
| uuid-2 | 1 | `{...}` | 2024-01-20 10:12:30 | 2024-01-20 10:12:30 |

**Indexes :**
- `idx_onboarding_drafts_user_id` → Recherche rapide par utilisateur
- `idx_onboarding_drafts_updated_at` → Nettoyage des brouillons anciens

---

## ✅ Checklist de Déploiement

- [ ] Migration SQL exécutée dans Supabase
- [ ] `onboarding_drafts` table créée
- [ ] RLS policies en place
- [ ] `lib/onboarding-draft.ts` déployée
- [ ] `app/onboarding/page.tsx` mise à jour
- [ ] `app/onboarding/layout.tsx` créée
- [ ] `app/(dashboard)/layout.tsx` mise à jour
- [ ] Tests manuels validés
- [ ] Performance testée (F12 Network)
- [ ] Logs de débogage activés

---

## 🆘 Troubleshooting

### Problème : Les données ne se sauvegardent pas

**Vérifier :**
1. localStorage.getItem('loka_onboarding_draft') → doit être présent
2. Supabase table `onboarding_drafts` → vérifier les lignes
3. Console → chercher les erreurs

### Problème : Rechargement ne restaure pas les données

**Vérifier :**
1. loadOnboardingDraft() est appelée
2. localStorage/DB contiennent les données
3. RLS policies ne bloquent pas l'accès

### Problème : Redirection incorrecte vers /onboarding

**Vérifier :**
1. `proprietaire.onboarding_complete` = true en DB
2. `app/(dashboard)/layout.tsx` remet à jour
3. Pas de cache de route

### Problème : Performance lente

**Vérifier :**
1. Débounce 30s fonctionnant
2. Pas d'appels Supabase à chaque keystroke
3. Pas de boucles infinies en useEffect

