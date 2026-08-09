# 🧪 Guide de Test : Connexion Onboarding → Dashboard par Profil

**Objectif :** Valider que l'onboarding capture le profil et que le dashboard s'affiche correctement selon le profil choisi.

**Durée estimée :** 15-20 minutes  
**Préalables :**
- Application en mode dev (`npm run dev`)
- DevTools prêts (F12)
- Comptes de test disponibles

---

## ✅ Test 1 : Flux Individuel (Propriétaire)

**Scénario :** Signup → Onboarding avec profil "Propriétaire" → Dashboard Individuel

### Étapes :

1. **Accès page auth**
   - Va sur `http://localhost:3000/auth`
   - Sélectionne l'onglet **Sign Up**

2. **Remplir le formulaire**
   - Email : `test-individuel-${Date.now()}@example.com`
   - Password : `TestPass123!`
   - Clique **Créer un compte**

3. **Onboarding**
   - Step 0 (Bienvenue) : Clique **Commencer**
   - Step 1 (Profil) : Remplis nom + téléphone → **Suivant**
   - Step 2 (Rôle) : Sélectionne **"Propriétaire"** → **Suivant**
   - Step 3 (Situation) : Sélectionne **"Propriétaire"** → **Suivant**
   - Steps 4-7 : Remplis les infos (bien, logements, etc.)
   - Step 8 (Complétion) : Clique **Terminer**

4. **Vérifications Dashboard**
   - ✅ Redirigé vers `/home`
   - ✅ Header affiche : "Bienvenue, {nom}"
   - ✅ Sous-titre : "Gérez votre portefeuille immobilier"
   - ✅ Stats affichées : Revenu, Taux occupation, Immeubles, Logements
   - ✅ Sections : Paiements récents, Contrats expirant

5. **Vérifications Sidebar**
   - Ouvre DevTools → Console → `useOrganisationType` devrait être "proprietaire"
   - Sidebar affiche 9 items :
     - [ ] Accueil
     - [ ] Immeubles
     - [ ] Logements
     - [ ] Locataires
     - [ ] Contrats
     - [ ] Propriétaires **(ABSENT)**
     - [ ] Paiements
     - [ ] Rapports
     - [ ] Équipe **(ABSENT)**
     - [ ] Notifications
     - [ ] Paramètres

6. **Vérifications DB**
   - Va à Supabase → SQL Editor
   - Exécute :
     ```sql
     SELECT profil_type, situation FROM proprietaire 
     WHERE id = 'ton-user-id' LIMIT 1;
     ```
   - ✅ `profil_type` = "proprietaire"
   - ✅ `situation` = "proprietaire"
   - Vérifie organisation créée :
     ```sql
     SELECT type FROM organisations 
     WHERE owner_user_id = 'ton-user-id' LIMIT 1;
     ```
   - ✅ `type` = "proprietaire"

**Résultat :** ☐ SUCCÈS ☐ ÉCHOUÉ  
**Notes :** _______________________

---

## ✅ Test 2 : Flux Gestionnaire

**Scénario :** Signup → Onboarding avec profil "Gestionnaire" → Dashboard Gestionnaire

### Étapes :

1. **Signup + Onboarding**
   - Repeat Test 1, mais à Step 2 : sélectionne **"Gestionnaire"**
   - À Step 3 : sélectionne **"Gère des biens"** ou situation appropriée
   - À Step 4 : Remplis les propriétaires gérés

2. **Vérifications Dashboard**
   - ✅ Redirigé vers `/home`
   - ✅ Header affiche : "Bienvenue, {nom}"
   - ✅ Sous-titre : "Tableau de bord de gestion de portefeuille"
   - ✅ Section "Clients" visible (lien vers `/proprietaires`)
   - ✅ Stats : incluent portefeuille gérés

3. **Vérifications Sidebar**
   - Sidebar affiche 10 items (9 de base + **Propriétaires**) :
     - [ ] Accueil
     - [ ] Immeubles
     - [ ] Logements
     - [ ] Locataires
     - [ ] Contrats
     - [ ] **Propriétaires** ✅
     - [ ] Paiements
     - [ ] Rapports
     - [ ] Équipe **(ABSENT)**
     - [ ] Notifications
     - [ ] Paramètres

4. **Vérifications DB**
   - Propriétaire :
     ```sql
     SELECT profil_type FROM proprietaire 
     WHERE id = 'ton-user-id';
     ```
   - ✅ `profil_type` = "gestionnaire"
   - Organisation :
     ```sql
     SELECT type FROM organisations 
     WHERE owner_user_id = 'ton-user-id';
     ```
   - ✅ `type` = "gestionnaire"

**Résultat :** ☐ SUCCÈS ☐ ÉCHOUÉ  
**Notes :** _______________________

---

## ✅ Test 3 : Flux Agence

**Scénario :** Signup → Onboarding avec profil "Agence" → Dashboard Agence

### Étapes :

1. **Signup + Onboarding**
   - Repeat Test 1, mais à Step 2 : sélectionne **"Agence"**
   - À Step 3 : sélectionne situation appropriée (Agence immobilière)
   - À Step 4 : Remplis infos agence (nom, siège)
   - À Step 5+ : Remplis portefeuille

2. **Vérifications Dashboard**
   - ✅ Redirigé vers `/home`
   - ✅ Header affiche : "Bienvenue, {nom agence}"
   - ✅ Sous-titre : "Tableau de bord agence immobilière"
   - ✅ Sections : "Clients" ET "Équipe" visibles
   - ✅ Stats : portefeuille global agence

3. **Vérifications Sidebar**
   - Sidebar affiche 11 items (9 base + Propriétaires + Équipe) :
     - [ ] Accueil
     - [ ] Immeubles
     - [ ] Logements
     - [ ] Locataires
     - [ ] Contrats
     - [ ] **Propriétaires** ✅
     - [ ] Paiements
     - [ ] Rapports
     - [ ] **Équipe** ✅
     - [ ] Notifications
     - [ ] Paramètres

4. **Vérifications DB**
   - Propriétaire :
     ```sql
     SELECT profil_type FROM proprietaire 
     WHERE id = 'ton-user-id';
     ```
   - ✅ `profil_type` = "agence"
   - Organisation :
     ```sql
     SELECT type FROM organisations 
     WHERE owner_user_id = 'ton-user-id';
     ```
   - ✅ `type` = "agence"

**Résultat :** ☐ SUCCÈS ☐ ÉCHOUÉ  
**Notes :** _______________________

---

## ✅ Test 4 : Rechargement Page (F5)

**Scénario :** Dashboard reste correct après rechargement

### Étapes :

1. **Préparer**
   - Complète un onboarding (n'importe quel profil)
   - Note le profil choisi (ex: "Gestionnaire")

2. **Recharger**
   - Appuie **F5** ou Cmd+R
   - Attends le chargement complet

3. **Vérifications**
   - ✅ Dashboard reste le même (pas reset)
   - ✅ Sidebar items corrects (même nombre et ordre)
   - ✅ Header greeting présent
   - ✅ Stats affichées
   - ✅ Pas d'erreurs console (F12 → Console)

4. **Vérifications avancées**
   - Rechargement multiple :
     - F5 → Attendre chargement → F5 → Attendre
   - ✅ État persiste à chaque rechargement

**Résultat :** ☐ SUCCÈS ☐ ÉCHOUÉ  
**Notes :** _______________________

---

## 🎯 Résumé des Validations

| Test | Profil | Dashboard | Sidebar Items | DB Type | Statut |
|------|--------|-----------|---------------|---------|--------|
| #1 | Propriétaire | Individuel | 9 | proprietaire | ☐ |
| #2 | Gestionnaire | Gestionnaire | 10 | gestionnaire | ☐ |
| #3 | Agence | Agence | 11 | agence | ☐ |
| #4 | Tous | Persiste | Correct | Correct | ☐ |

---

## 🐛 Troubleshooting

### Dashboard ne s'affiche pas
- Vérifier que getDashboardData() retourne des données
- Vérifier console pour erreurs Supabase
- Vérifier que proprietaire.profil_type existe en DB

### Sidebar items incorrects
- Vérifier que useOrganisationType() retourne le bon type
- Vérifier que flatNavItems a la bonne structure
- Vérifier que conditionalShow fonctionne

### Après rechargement, profil change
- Vérifier que proprietaire.profil_type persiste en DB
- Vérifier que organisation.type persiste
- Vérifier que getOrganisationScope() utilise les bonnes données

### Erreurs console
- Copier le message exact
- Vérifier les logs Supabase
- Vérifier que les tables existent

---

## 📝 Notes

- Tous les tests doivent passer pour valider la feature
- Garder des screenshots de chaque profil
- Documenter tout comportement inattendu
- Retester après chaque modification

