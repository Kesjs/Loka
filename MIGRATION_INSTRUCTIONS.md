# 📋 Instructions d'exécution de la migration

## Étape 1 : Accéder à Supabase Studio

1. Va sur [Supabase Dashboard](https://app.supabase.com)
2. Connecte-toi avec tes credentials
3. Sélectionne le projet **nmzpskxclwcqnkmkpqkh**

## Étape 2 : Exécuter la migration

### Option A : Via Supabase Studio (Recommandé)

1. Ouvre l'onglet **SQL Editor**
2. Crée une **Nouvelle Query**
3. Copie le contenu du fichier `migrations/add_onboarding_drafts_table.sql`
4. Clique sur **▶ Run** (ou Cmd+Enter)
5. Vérifie que la table a été créée dans **Table Editor** → **onboarding_drafts**

### Option B : Via pgAdmin (si disponible)

1. Ouvre l'onglet **Database** dans Supabase
2. Cherche l'option **pgAdmin** ou **Query Editor**
3. Copie-colle la migration SQL
4. Exécute

### Option C : Via Node.js (Avancé)

```bash
# D'abord, ajoute SUPABASE_SERVICE_ROLE_KEY à .env.local
# Récupère-la depuis Supabase Dashboard → Settings → API

npm run migrate
```

## Étape 3 : Vérifier la migration

1. Dans Supabase Studio, va à **Table Editor**
2. Cherche la table **onboarding_drafts**
3. Vérifie les colonnes :
   - `user_id` (UUID, PRIMARY KEY)
   - `step` (INTEGER)
   - `data` (JSONB)
   - `updated_at` (TIMESTAMP)
   - `created_at` (TIMESTAMP)
4. Vérifie les RLS policies (Row Level Security)

## ✅ C'est prêt !

Une fois la migration exécutée, le système d'auto-save d'onboarding fonctionnera comme suit :

1. **Sauvegarde locale instantanée** → localStorage
2. **Sauvegarde DB débouclée** (30s) → table `onboarding_drafts`
3. **Récupération après rechargement** → priorité DB, fallback localStorage
4. **Suppression après complétion** → nettoyage propre

