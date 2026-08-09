# 🧪 Test du flux d'Onboarding avec Auto-Save

## Objectif
Vérifier que le système d'auto-save fonctionne correctement avec sauvegarde locale + DB.

## Prérequis
- Application en mode dev (`npm run dev`)
- Compte test ou nouveau compte pour signup
- Outils de développement (DevTools F12)

---

## Test 1️⃣ : Sauvegarde locale (localStorage)

### Étapes :
1. Signup → accès à `/onboarding`
2. Remplis la **Step 1 (Profil)** — sélectionne un profil
3. Ouvre **DevTools (F12)** → **Application** → **Local Storage** → `loka_onboarding_draft`
4. Vérifie que la clé contient :
   ```json
   {
     "step": 1,
     "data": { "profil": "...", ... }
   }
   ```

**Résultat attendu :** ✅ localStorage mis à jour instantanément après chaque changement

---

## Test 2️⃣ : Récupération après rechargement (localStorage fallback)

### Étapes :
1. Remplis **Step 2 (Rôle)**
2. Recharge la page (F5)
3. Vérifie que l'onboarding recharge à **Step 2** avec les données sauvegardées

**Résultat attendu :** ✅ Données restaurées depuis localStorage

---

## Test 3️⃣ : Sauvegarde en DB (débounce 30s)

### Étapes :
1. Remplis **Step 3 (Situation)**
2. Va à Supabase Studio → **Table Editor** → `onboarding_drafts`
3. Cherche la ligne avec ton `user_id`
4. **Attends 30 secondes**
5. Recharge la table (refresh F5)
6. Vérifie que `step` et `data` sont à jour

**Résultat attendu :** ✅ DB mise à jour après 30s de débounce

---

## Test 4️⃣ : Perte de connexion + récupération

### Étapes :
1. Remplis **Step 4**
2. Ouvre DevTools → **Network** → **Offline**
3. Continue à remplir le formulaire (pas de sauvegarde DB possible)
4. Recharge la page
5. Récupère la connexion réseau
6. Recharge à nouveau

**Résultat attendu :** ✅ Données restaurées depuis localStorage

---

## Test 5️⃣ : Redirection protégée (Dashboard → Onboarding)

### Étapes :
1. Crée un nouveau compte
2. Complète l'onboarding
3. Va manuellement sur `/onboarding` (barre d'adresse)
4. Clique sur un lien du dashboard qui redirige vers `/onboarding`

**Résultat attendu :** ✅ Redirigé vers `/home` (onboarding déjà complété)

---

## Test 6️⃣ : Redirection dashboard → onboarding (obligatoire)

### Étapes :
1. Crée un compte test
2. Manipule la DB pour mettre `onboarding_complete = false`
3. Essaie d'accéder directement à `/home` ou `/contrats`

**Résultat attendu :** ✅ Redirigé vers `/onboarding`

---

## Test 7️⃣ : Nettoyage après complétion

### Étapes :
1. Complète entièrement l'onboarding
2. Clique sur **Terminer**
3. Redirigé vers `/home`
4. Va à Supabase → `onboarding_drafts`
5. Cherche ta ligne

**Résultat attendu :** ✅ Ligne supprimée ou `data` vidée

---

## ✅ Checklist de validation

- [ ] localStorage sauvegardé instantanément
- [ ] Récupération après rechargement (localStorage)
- [ ] DB mise à jour après 30s
- [ ] Récupération après perte de connexion
- [ ] Onboarding → Dashboard (redirection bloquée)
- [ ] Dashboard → Onboarding (redirection forcée si incomplet)
- [ ] Nettoyage après complétion

---

## 🐛 Debugging

Si ça ne marche pas :

1. **Vérifier les logs** :
   ```javascript
   // Dans DevTools Console
   localStorage.getItem('loka_onboarding_draft')
   ```

2. **Vérifier la DB** :
   - Supabase → SQL Editor
   - Exécute : `SELECT * FROM onboarding_drafts WHERE user_id = 'ton-user-id';`

3. **Vérifier les erreurs réseau** :
   - DevTools → Network → filtre `onboarding`

4. **Réinitialiser localStorage** :
   ```javascript
   localStorage.removeItem('loka_onboarding_draft')
   ```

