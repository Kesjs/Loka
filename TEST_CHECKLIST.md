# ✅ Checklist de Test du Flux Onboarding Complet

**Date de test :** _______________  
**Testeur :** _______________

---

## 📋 Pré-requis

- [ ] Application lancée en dev (`npm run dev`)
- [ ] Supabase studio accessible
- [ ] DevTools prêts (F12)
- [ ] Compte de test disponible

---

## 🧪 Test Principal : Flux Complet Signup → Dashboard

### Étape 1 : Signup
- [ ] Accède à `/auth`
- [ ] Sélectionne l'onglet **Sign Up**
- [ ] Remplis le formulaire avec :
  - Email : `test-onboarding-[timestamp]@example.com`
  - Mot de passe : `SecurePass123!`
  - Confirmez le mot de passe
- [ ] Clique sur **Créer un compte**
- [ ] **✅ Attendu :** Redirection automatique vers `/onboarding`

**Résultat :** ☐ Succès ☐ Échoué  
**Notes :** _______________________

---

### Étape 2 : Onboarding - Step 0 (Bienvenue)
- [ ] Page de bienvenue affichée
- [ ] Clique sur **Commencer**
- [ ] **✅ Attendu :** Transition vers Step 1

**Résultat :** ☐ Succès ☐ Échoué  
**Notes :** _______________________

---

### Étape 3 : Onboarding - Step 1 (Profil)
- [ ] Sélectionne un profil (ex: "Individuel")
- [ ] Ouvre **DevTools (F12)** → **Application** → **Local Storage**
- [ ] Cherche la clé `loka_onboarding_draft`
- [ ] **✅ Attendu :** Clé présente avec `step: 1` et données sauvegardées

**Résultat :** ☐ Succès ☐ Échoué  
**LocalStorage check :** ☐ Présent ☐ Absent  
**Notes :** _______________________

---

### Étape 4 : Test de Rechargement (Recovery)
- [ ] Appuie sur **F5** pour recharger la page
- [ ] **✅ Attendu :** Onboarding recharge à Step 1 avec le profil toujours sélectionné
- [ ] Clique **Suivant** pour aller à Step 2

**Résultat :** ☐ Succès ☐ Échoué  
**Notes :** _______________________

---

### Étape 5 : Onboarding - Step 2 (Rôle)
- [ ] Sélectionne un rôle (ex: "Propriétaire")
- [ ] **✅ Attendu :** Transition vers Step 3

**Résultat :** ☐ Succès ☐ Échoué  
**Notes :** _______________________

---

### Étape 6 : Onboarding - Step 3 (Situation)
- [ ] Sélectionne la situation (ex: "Propriétaire")
- [ ] **Attends 30 secondes** (débounce pour sauvegarde DB)
- [ ] Va à **Supabase Studio** → **Table Editor** → `onboarding_drafts`
- [ ] Cherche la ligne avec ton user_id
- [ ] **✅ Attendu :** Ligne créée/mise à jour avec `step: 3` et données JSON

**Résultat :** ☐ Succès ☐ Échoué  
**DB check :** ☐ Présent ☐ Absent  
**Notes :** _______________________

---

### Étape 7 : Test de Perte de Connexion
- [ ] Ouvre **DevTools** → **Network**
- [ ] Clique sur le dropdown (throttling) → sélectionne **Offline**
- [ ] Essaie de naviguer vers l'étape suivante (les boutons peuvent être grisés)
- [ ] Recharge la page (F5)
- [ ] **✅ Attendu :** Onboarding recharge avec les données du localStorage
- [ ] Réactive la connexion réseau

**Résultat :** ☐ Succès ☐ Échoué  
**Notes :** _______________________

---

### Étape 8 : Complétion de l'Onboarding
- [ ] Continue les étapes jusqu'à la dernière (Step Complet)
- [ ] Clique sur **Terminer l'onboarding** / **Commencer**
- [ ] **✅ Attendu :** Redirection vers `/home`
- [ ] Va à Supabase → `onboarding_drafts` et cherche ta ligne
- [ ] **✅ Attendu :** Ligne supprimée OU `data` vide

**Résultat :** ☐ Succès ☐ Échoué  
**Redirection :** ☐ Vers /home ☐ Autre  
**DB cleanup :** ☐ Supprimé ☐ Présent  
**Notes :** _______________________

---

### Étape 9 : Test de Protection - Accès Direct à /onboarding
- [ ] Étant connecté au dashboard, accède à `/onboarding` (barre d'adresse)
- [ ] **✅ Attendu :** Redirection automatique vers `/home` (onboarding déjà complété)

**Résultat :** ☐ Succès ☐ Échoué  
**Notes :** _______________________

---

### Étape 10 : Test de Protection - Dashboard sans Onboarding
**(Ce test nécessite de manipuler la DB)**

- [ ] En base de données, mets `onboarding_complete = false` pour ton utilisateur
- [ ] Recharge le dashboard
- [ ] **✅ Attendu :** Redirection vers `/onboarding`

**Résultat :** ☐ Succès ☐ Échoué  
**Notes :** _______________________

---

## 🎯 Résumé

**Nombre de tests réussis :** _____ / 10  
**Tests échoués :**
- ___________________________
- ___________________________
- ___________________________

---

## 🐛 Issues Trouvées

| Issue | Sévérité | Statut |
|-------|----------|--------|
| | ☐ Critique ☐ Majeur ☐ Mineur | ☐ À corriger ☐ Accepté |
| | ☐ Critique ☐ Majeur ☐ Mineur | ☐ À corriger ☐ Accepté |
| | ☐ Critique ☐ Majeur ☐ Mineur | ☐ À corriger ☐ Accepté |

---

## ✅ Validation Finale

- [ ] Tous les tests réussis
- [ ] Aucune erreur console (F12 → Console)
- [ ] Auto-save fonctionne (localStorage + DB)
- [ ] Redirections protégées fonctionnent
- [ ] Flux utilisateur fluide et intuitif

**Date d'approbation :** _______________  
**Signé par :** _______________

