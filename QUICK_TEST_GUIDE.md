# ⚡ Guide de Test Rapide (5-10 minutes)

## 🚀 Lancer l'application

```bash
cd /path/to/Loka-main
npm run dev
```

Attends que tu voies : `✓ Ready in Xms`

---

## 📝 Test 1 : Signup & Onboarding (2 min)

1. Va sur `http://localhost:3000/auth`
2. Clique sur **Sign Up**
3. Remplis avec :
   - Email : `test-user-$(date +%s)@example.com`
   - Password : `TestPass123!`
   - Confirm : `TestPass123!`
4. Clique **Créer un compte**
5. **✅ Vérif** : Redirigé vers `/onboarding`

---

## 💾 Test 2 : Auto-Save Local (1 min)

1. Sur la page onboarding, sélectionne un profil
2. Ouvre DevTools : **F12** → **Application** → **Local Storage**
3. Cherche `loka_onboarding_draft`
4. **✅ Vérif** : Clé présente avec tes données

---

## 🔄 Test 3 : Rechargement & Recovery (1 min)

1. Appuie **F5** pour recharger
2. **✅ Vérif** : Onboarding recharge avec le même profil

---

## 📊 Test 4 : Sauvegarde DB (1-2 min)

1. Avance à l'étape 2-3
2. **Attends 35 secondes** (débounce 30s + buffer)
3. Va à Supabase Dashboard :
   - https://app.supabase.com/projects
   - Sélectionne ton projet
   - **SQL Editor** → **New Query**
   ```sql
   SELECT * FROM onboarding_drafts ORDER BY updated_at DESC LIMIT 1;
   ```
4. **✅ Vérif** : Ligne créée avec tes données

---

## 🏁 Test 5 : Complétion (1 min)

1. Complète rapidement toutes les étapes
2. Clique **Terminer**
3. **✅ Vérif** : Redirection vers `/home`
4. Vérifie la DB (requête de Test 4) :
   - **✅ Vérif** : Ligne supprimée OU `data` vide

---

## 🛡️ Test 6 : Protection (1 min)

1. Étant connecté au dashboard, tape `/onboarding` dans la barre
2. **✅ Vérif** : Redirection vers `/home` (déjà complété)

---

## ✅ Résultat

Si tous les tests passent ✅, le système fonctionne ! 🎉

---

## 🐛 Debugging rapide

**Voir les logs :**
```javascript
// DevTools → Console
localStorage.getItem('loka_onboarding_draft')
```

**Réinitialiser :**
```javascript
localStorage.removeItem('loka_onboarding_draft')
```

