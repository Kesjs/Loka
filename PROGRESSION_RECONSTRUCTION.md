# Progression Reconstruction Multi-Organisation Loka

**Date de début** : 08/08/2026  
**Statut** : 7/13 tâches complétées (54%)

## ✅ Tâches Complétées

### 1. Helper organisation-scope ✅
- **Fichier** : `lib/organisation-scope.ts`
- **Fonctions** : `getOrganisationScope()`, `isOrgMember()`
- **Support** : 3 types d'organisation (individuel/gestionnaire/agence)
- **Fallback** : Création auto d'organisation pour anciens comptes

### 2. Migrations DB 007-008 documentées ✅
- **Fichiers créés** :
  - `supabase/migrations/007_organisations_multi_proprietaires.sql`
  - `supabase/migrations/007b_fix_is_org_member_search_path.sql`
  - `supabase/migrations/008_bascule_rls_organisation.sql`
  - `supabase/migrations/README.md`
- **Statut** : Déjà appliquées en production, ne pas réappliquer
- **Tables** : organisations, membres_organisation, proprietaires_geres
- **Fonction RLS** : `is_org_member(org_id UUID)`

### 3. Scoping organisation corrigé sur 5 pages ✅
- **Pages modifiées** :
  - `app/(dashboard)/immeubles/page.tsx`
  - `app/(dashboard)/locataires/page.tsx`
  - `app/(dashboard)/contrats/page.tsx`
  - `app/api/logements/route.ts` (GET + POST)
  - `app/api/paiements/route.ts` (GET)
- **Repository** : `PaymentRepository.getPaginatedByOrganisation()` ajoutée
- **Changement** : Filtrage par `organisation_id` au lieu de `proprietaire_id = user.id`

### 4. lib/dashboard.ts adapté ✅
- **Interfaces ajoutées** :
  - `DashboardPortefeuille`
  - `DashboardProprietaireGere`
- **Champs ajoutés** : `organisation`, `portefeuille`
- **Logique** : Agrégation par organisation + stats par proprietaire_gere

### 5. Dashboard home adaptatif (non-régressif) ✅
- **Fichier** : `app/(dashboard)/home/page.tsx`
- **Type individuel** : Interface pixel-identique (non-régression)
- **Type gestionnaire/agence** :
  - Labels adaptés (Revenu géré, Biens gérés)
  - Bloc PortefeuilleSummary (5 premiers propriétaires)
  - État vide redirige vers `/proprietaires/new`

### 6. Routes /proprietaires créées ✅
- **Fichiers créés** :
  - `app/(dashboard)/proprietaires/page.tsx` (liste avec stats)
  - `app/(dashboard)/proprietaires/new/page.tsx` (formulaire création)
  - `app/(dashboard)/proprietaires/[id]/page.tsx` (détail + biens)
- **Validation** : Téléphone ARCEP Bénin (10 chiffres, préfixe 01)
- **Sécurité** : Redirection auto vers `/home` si type='individuel'

### 7. Sidebar conditionnelle ✅
- **Fichiers modifiés** :
  - `components/layout/nav-items.ts` (ajout item Propriétaires)
  - `components/layout/Sidebar.tsx` (filtrage par orgType)
  - `components/layout/NavigationDrawer.tsx` (filtrage mobile)
- **Hook créé** : `lib/hooks/useOrganisationType.ts`
- **Visibilité** : Item Propriétaires visible uniquement pour gestionnaire/agence

## 🔄 Tâches Restantes

### 8. Étendre onboarding (5 nouveaux steps) ⏳ NEXT
**Complexité** : Haute (branchement par rôle, logique conditionnelle)

**Steps à créer** :
- `StepRole` : Choix Propriétaire | Gestionnaire | Agence | Autre pro
- `StepSituation` : Options dépendantes du rôle (section 5.2 du doc)
- `StepAgenceInfo` : Nom agence, ville, taille portefeuille (agence uniquement)
- `StepProprietairesGeres` : Liste dynamique (gestionnaire multi/agence)
- `StepMoyenPaiement` : Mode de paiement habituel

**Logique** :
- Création de `organisations` + `membres_organisation` à l'étape 3 (Situation)
- `getTotalSteps(role, situation)` dynamique
- Sauvegarde localStorage étendue
- Écriture en base uniquement à `StepComplete`

**Fichiers à modifier** :
- `app/onboarding/page.tsx` (ajout des 5 steps)
- `components/onboarding/Step*.tsx` (nouveaux composants)
- `lib/onboarding-save.ts` (interface OnboardingDraft étendue)

### 9. Brancher ReceiptService.ts ⏳
**Problème identifié** : `ReceiptService.ts` existe mais n'est jamais appelé

**Actions** :
- Brancher `ReceiptService.ts` dans `PaymentService.create()`
- Créer `EmailService.sendPaymentConfirmationEmail()`
- Stocker URL dans `paiements.quittance_url`

**Fichiers** :
- `lib/services/PaymentService.ts`
- `lib/services/EmailService.ts`
- `lib/services/ReceiptService.ts` (déjà existant)

### 10. Remplacer 12 <select> natifs ⏳
**Localisation** : Section 9bis du document identifie 12 occurrences

**Composant cible** : `components/ui/select.tsx` (déjà existant, shadcn/ui)

**Fichiers à modifier** :
- `components/ui/Pagination.tsx` (1)
- `components/contracts/CreateContractForm.tsx` (2)
- `components/contracts/TerminateContractForm.tsx` (1)
- `components/forms/RecordPaymentForm.tsx` (1)
- `app/(dashboard)/locataires/new/page.tsx` (1)
- `app/(dashboard)/immeubles/new/page.tsx` (1)
- `app/(dashboard)/immeubles/[id]/edit/page.tsx` (1)
- `app/(dashboard)/logements/[id]/edit/page.tsx` (3)

### 11. Reconstruire /parametres ⏳
**Problème** : Page actuellement purement décorative (4 Card sans action)

**Sections à créer** :
1. **Compte** : nom, téléphone, email, logo (formulaire éditable)
2. **Notifications** : notif_email, widget_priorite (toggles)
3. **Paiements** : devise, fréquence_loyer, garantie_defaut, charges (comme onboarding)
4. **Sécurité** : changement mot de passe, sessions actives
5. **Organisation** (si type != individuel) : nom, ville, membres équipe

**Fichier** : `app/(dashboard)/parametres/page.tsx`

### 12. Corriger filtre immeuble sur /logements ⏳
**Problème** : Appelle `/api/immeubles?limit=100` qui n'existe pas

**Solution** : Passer en Server Component avec fetch direct Supabase

**Fichier** : `app/(dashboard)/logements/page.tsx`

### 13. Tests de recette complets ⏳
**Checklist 18 points** (document section 13) :

- [ ] Migration 008 testée sur 3 profils
- [ ] Section 6.4 déployée et vérifiée
- [ ] Onboarding testé (4 branches × situations)
- [ ] Dashboard : états vides pertinents
- [ ] Sidebar : item Propriétaires conditionnel
- [ ] Non-régression visuelle (individuel pixel-identique)
- [ ] Aucune route 404
- [ ] Formulaires gèrent états soumission/erreur
- [ ] Quittances testées (individuel + agence)
- [ ] Email paiement testé (sandbox Brevo)
- [ ] 12 select natifs remplacés
- [ ] `npm run build` passe en mode strict
- [ ] Emails Brevo testés
- [ ] /parametres fonctionnel (4-5 sections)
- [ ] Filtre immeuble /logements fonctionne
- [ ] Hooks morts (useLocataires etc.) : finis ou supprimés
- [ ] Convention nommage API unifiée (français)
- [ ] Validation téléphone ARCEP testée

## 📊 Statistiques

- **Fichiers modifiés** : 20
- **Fichiers créés** : 8
- **Migrations SQL** : 4 (007, 007b, 008, 009 à venir)
- **Composants créés** : 3 pages proprietaires + 1 hook
- **Routes API modifiées** : 2

## 🎯 Prochaines Actions Recommandées

### Priorité 1 (Bloquant pour migration 009)
1. Compléter tâche #8 (Onboarding) - permet création organisations
2. Tester section 6.4 (scoping) en conditions réelles
3. Appliquer migration 009 (NOT NULL) après validation

### Priorité 2 (Fonctionnalités critiques)
4. Tâche #9 (Quittances PDF) - fonctionnalité attendue
5. Tâche #11 (Paramètres) - UX basique
6. Tâche #12 (Filtre logements) - correction bug

### Priorité 3 (Polish)
7. Tâche #10 (Select shadcn/ui) - cohérence visuelle
8. Tâche #13 (Tests) - validation finale

## 🚀 Pour Continuer

**Option A : Automatique**
```bash
# L'IA continue l'implémentation automatiquement
# Tâches 8-12 dans l'ordre
```

**Option B : Manuelle**
```bash
# Tester ce qui existe déjà
npm run dev
# Vérifier :
# - Dashboard adaptatif (3 types d'organisation)
# - Routes /proprietaires
# - Sidebar conditionnelle
# - Scoping organisation sur toutes les pages
```

**Option C : Hybride**
```bash
# IA code les tâches simples (9, 10, 12)
# Développeur code l'onboarding (#8) et paramètres (#11)
# Tests conjoints (#13)
```

## 📝 Notes Importantes

- **Migration 009** : Ne pas appliquer avant déploiement section 6.4
- **Non-régression** : Comptes individuel doivent être pixel-identiques
- **Design system** : Préservé (Phosphor icons, @theme inline, shadcn/ui)
- **RLS policies** : Avec repli temporaire `OR proprietaire_id = auth.uid()`
- **Code mort** : À nettoyer (ReceiptService, hooks useLocataires/useImmeubles/etc.)

---
**Dernière mise à jour** : 08/08/2026 - Session active en cours
