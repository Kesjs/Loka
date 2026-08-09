# Migrations Supabase - Loka

## État de synchronisation

⚠️ **IMPORTANT**: Les migrations 007 et 008 ont été appliquées directement en production mais n'existaient pas dans le repo jusqu'à présent. Elles ont été reconstituées à partir du schéma réel de la base de production.

## Liste des migrations

### 000-006: Base existante
- `000_create_base_schema.sql` - Schéma initial (proprietaire, immeubles, logements, locataires, contrats, paiements)
- `001_normalize_ownership.sql` - Normalisation de la propriété
- `002_create_alerts_table.sql` - Table notifications
- `003_enhance_paiements_table.sql` - Amélioration paiements
- `004_create_garanties_table.sql` - Table garanties
- `005_extend_logements_with_photos_and_amenities.sql` - Photos et équipements
- `006_create_logement_storage_bucket.sql` - Bucket storage pour photos

### 007: Support multi-organisation ✅ EN PRODUCTION
- `007_organisations_multi_proprietaires.sql`
  - Crée table `organisations` (individuel/gestionnaire/agence)
  - Crée table `membres_organisation` (équipe d'une agence)
  - Crée table `proprietaires_geres` (clients d'un gestionnaire)
  - Ajoute `organisation_id` et `proprietaire_gere_id` sur `immeubles`
  - Ajoute colonnes `quartier` et `repere` sur `immeubles`
  - Crée fonction `is_org_member(org_id UUID)` pour RLS
  - Active RLS et policies sur les nouvelles tables

- `007b_fix_is_org_member_search_path.sql`
  - Corrige le `search_path` de la fonction `is_org_member()`
  - Nécessaire pour éviter les problèmes de sécurité RLS

### 008: Bascule RLS vers organisation ✅ EN PRODUCTION
- `008_bascule_rls_organisation.sql`
  - Ajoute `organisation_id` sur table `locataires`
  - Backfill automatique des `organisation_id` existants
  - Remplace policies `*_owner` par `*_org` sur 5 tables:
    - `immeubles`
    - `logements`
    - `locataires`
    - `contrats`
    - `paiements`
  - **Repli temporaire**: les policies gardent `OR proprietaire_id = auth.uid()` pendant la transition
  - Vérifié le 08/08/2026: 2/2 lignes locataires backfillées avec succès

## Migration 009 (À FAIRE - après validation en prod)

⚠️ **NE PAS APPLIQUER AVANT** que le code applicatif (section 6.4 du document de reconstruction) soit déployé en production et vérifié.

La migration 009 finalisera la transition:
1. Rendre `immeubles.organisation_id` et `immeubles.proprietaire_gere_id` `NOT NULL`
2. Retirer le repli `OR proprietaire_id = auth.uid()` des policies RLS
3. S'assurer que 100% des lignes ont un `organisation_id` non null

## Vérification de l'état actuel

Pour vérifier l'état des migrations en production:

```sql
-- Vérifier que les tables existent
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('organisations', 'membres_organisation', 'proprietaires_geres');

-- Vérifier que la fonction existe
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_org_member';

-- Vérifier les colonnes ajoutées
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'immeubles' 
AND column_name IN ('organisation_id', 'proprietaire_gere_id', 'quartier', 'repere');

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'locataires' 
AND column_name = 'organisation_id';

-- Vérifier les policies actuelles
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('immeubles', 'logements', 'locataires', 'contrats', 'paiements')
ORDER BY tablename, policyname;
```

## Application des migrations (pour référence)

⚠️ Les migrations 007 et 008 sont **déjà appliquées**. Ne pas les réappliquer.

Pour les nouvelles migrations futures:

```bash
# Via Supabase CLI
supabase db push

# Ou via l'interface Supabase
# SQL Editor > New query > Copier le contenu du fichier SQL > Run
```

## Rollback (urgence uniquement)

En cas de problème critique avec les migrations 007-008:

```sql
-- ATTENTION: Cela supprimera toutes les organisations
DROP TABLE IF EXISTS proprietaires_geres CASCADE;
DROP TABLE IF EXISTS membres_organisation CASCADE;
DROP TABLE IF EXISTS organisations CASCADE;
DROP FUNCTION IF EXISTS is_org_member(UUID);

ALTER TABLE immeubles DROP COLUMN IF EXISTS organisation_id;
ALTER TABLE immeubles DROP COLUMN IF EXISTS proprietaire_gere_id;
ALTER TABLE immeubles DROP COLUMN IF EXISTS quartier;
ALTER TABLE immeubles DROP COLUMN IF EXISTS repere;
ALTER TABLE locataires DROP COLUMN IF EXISTS organisation_id;

-- Recréer les anciennes policies (voir migrations 000-006)
```

**Ne faire ce rollback qu'en dernier recours et après sauvegarde complète de la base.**
