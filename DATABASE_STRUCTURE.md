# 🗄️ Structure complète de la base Loka Supabase

## 📋 Vue d'ensemble

Loka utilise une base PostgreSQL hébergée sur **Supabase Cloud** avec :
- **20 tables** incluant authentification, gestion d'immeubles, contrats, paiements
- **Row Level Security (RLS)** pour isoler les données par propriétaire/organisation
- **Enum types** pour les statuts et types d'entités
- **Indexes** pour les performances critiques

---

## 📊 Tables complètes

### 1️⃣ **AUTHENTIFICATION & UTILISATEURS**

#### `auth.users` (Table Supabase Auth)
- Gérée entièrement par Supabase Auth
- Contient les utilisateurs enregistrés

---

### 2️⃣ **ORGANISATIONS & GESTIONNAIRES** (Multi-tenant SaaS)

#### `organisations`
Regroupe les propriétaires individuels, gestionnaires et agences.

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | Identifiant unique |
| `owner_user_id` | UUID FK | Propriétaire de l'organisation (auth.users) |
| `nom` | TEXT | Nom de l'organisation |
| `type` | ENUM | 'individuel', 'gestionnaire', 'agence' |
| `ville` | TEXT | Ville d'implantation |
| `taille_portefeuille` | TEXT | '1-5', '5-20', '20+' |
| `logo_url` | TEXT | URL du logo (stockage Supabase) |
| `nom_commercial` | TEXT | Nom commercial/marque blanche |
| `adresse_officielle` | TEXT | Adresse complète |
| `telephone_service` | TEXT | N° de téléphone |
| `ifu_rccm` | TEXT | Numéro d'identification fiscal |
| `tampon_signature_url` | TEXT | URL du tampon/signature |
| `created_at` | TIMESTAMPTZ | Création |
| `updated_at` | TIMESTAMPTZ | Dernière modification |

**Indexes** : `idx_organisations_owner`

**RLS** : 
- SELECT si owner ou membre
- INSERT/UPDATE si owner

---

#### `membres_organisation`
Gère les utilisateurs d'une organisation (agences avec équipe).

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `organisation_id` | UUID FK | (organisations) |
| `user_id` | UUID FK | (auth.users) |
| `role_interne` | ENUM | 'admin', 'gestionnaire', 'mandataire' |
| `joined_at` | TIMESTAMPTZ | Date d'adhésion |

**Unique** : (organisation_id, user_id)

**Indexes** : `idx_membres_organisation_user`, `idx_membres_organisation_org`

---

#### `proprietaires_geres`
Propriétaires gérés par une organisation (clients d'une agence).

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `organisation_id` | UUID FK | (organisations) |
| `user_id` | UUID FK | (auth.users) - optionnel |
| `nom` | TEXT | Nom du propriétaire |
| `telephone` | TEXT | N° de téléphone |
| `email` | TEXT | Email |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes** : `idx_proprietaires_geres_org`, `idx_proprietaires_geres_user`

---

### 3️⃣ **IMMEUBLES & LOGEMENTS**

#### `immeubles`
Immeubles/bâtiments possédés ou gérés.

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `proprietaire_id` | UUID FK | Propriétaire direct (auth.users) |
| `organisation_id` | UUID FK | Organisation gestionnaire |
| `proprietaire_gere_id` | UUID FK | Propriétaire géré via agence |
| `nom` | TEXT | Nom de l'immeuble |
| `adresse` | TEXT | Adresse |
| `ville` | TEXT | Ville |
| `type` | ENUM | 'apartment_block', 'house', 'mixed_use', 'other' |
| `quartier` | TEXT | Quartier/zone |
| `repere` | TEXT | Point de repère |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes** : `idx_immeubles_proprietaire`, `idx_immeubles_organisation`, `idx_immeubles_proprietaire_gere`

---

#### `logements`
Unités d'habitation (appartements, maisons).

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `immeuble_id` | UUID FK | (immeubles) |
| `proprietaire_id` | UUID FK | Propriétaire (pour RLS) |
| `nom` | TEXT | Numéro/nom de l'unité (ex: "Apt 101") |
| `type` | TEXT | Type d'unité |
| `description` | TEXT | Description |
| `loyer_mensuel` | DECIMAL(10,2) | Loyer de base |
| `statut` | ENUM | 'occupe', 'vacant' |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes** : `idx_logements_immeuble`, `idx_logements_proprietaire`, `idx_logements_immeuble_statut`, `idx_logements_statut`

---

### 4️⃣ **LOCATAIRES**

#### `locataires`
Tenants/locataires.

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `proprietaire_id` | UUID FK | Propriétaire/gestionnaire |
| `nom` | TEXT | Nom du locataire |
| `telephone` | TEXT | Téléphone |
| `email` | TEXT | Email |
| `portal_active` | BOOLEAN | Accès au portail locataire activé |
| `activation_token` | TEXT | Token pour activation |
| `auth_user_id` | UUID FK | Compte Supabase Auth du locataire |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes** : `idx_locataires_proprietaire`, `idx_locataires_activation_token`

---

### 5️⃣ **CONTRATS & PAIEMENTS**

#### `contrats`
Contrats de location entre propriétaire et locataire.

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `locataire_id` | UUID FK | (locataires) |
| `logement_id` | UUID FK | (logements) |
| `proprietaire_id` | UUID FK | Propriétaire (pour RLS) |
| `loyer_mensuel` | DECIMAL(10,2) | Montant du loyer |
| `depot_garantie` | DECIMAL(10,2) | Dépôt de garantie |
| `date_debut` | DATE | Début du contrat |
| `date_fin` | DATE | Fin du contrat |
| `statut` | ENUM | 'actif', 'termine', 'resilie' |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes** : `idx_contrats_locataire`, `idx_contrats_logement`, `idx_contrats_proprietaire`, `idx_contrats_statut`, `idx_contrats_locataire_statut`

---

#### `paiements`
Historique des paiements de loyers.

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `contrat_id` | UUID FK | (contrats) |
| `proprietaire_id` | UUID FK | Propriétaire (pour RLS) |
| `montant` | DECIMAL(10,2) | Montant payé |
| `date_paiement` | DATE | Date du paiement |
| `periode_debut` | DATE | Début de la période couverte |
| `periode_fin` | DATE | Fin de la période couverte |
| `mode` | ENUM | 'cash', 'mobile_money', 'virement', 'cheque' |
| `quittance_url` | TEXT | URL de la quittance |
| `notes` | TEXT | Notes additionnelles |
| `reconciliation_status` | TEXT | 'pending', 'reconciled', 'disputed' |
| `reconciled_by` | UUID FK | Utilisateur qui a reconcilié |
| `reconciled_at` | TIMESTAMPTZ | Date de réconciliation |
| `transaction_id` | TEXT | ID transaction GeniusPay |
| `payment_method` | TEXT | Méthode de paiement |
| `status` | TEXT | 'completed', 'pending', 'failed' |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes** : `idx_paiements_contrat`, `idx_paiements_date`, `idx_paiements_periode`, `idx_paiements_reconciliation`, `idx_paiements_proprietaire`, `idx_paiements_transaction_id`

**Index Unique** : `idx_unique_payment_per_month` (contrat_id, mois de periode_debut)

---

### 6️⃣ **ALERTES & NOTIFICATIONS**

#### `alerts`
Système d'alertes centralisé.

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `proprietaire_id` | UUID FK | (auth.users) |
| `type` | TEXT | 'missing_payment', 'expiring_contract', 'deposit_to_return' |
| `severity` | TEXT | 'low', 'medium', 'high' |
| `entity_type` | TEXT | Type d'entité (contrat, paiement, etc.) |
| `entity_id` | UUID | ID de l'entité |
| `message` | TEXT | Message d'alerte |
| `is_read` | BOOLEAN | Lue ou non |
| `read_at` | TIMESTAMPTZ | Quand lue |
| `action_url` | TEXT | URL pour action |
| `created_at` | TIMESTAMPTZ | |
| `expires_at` | TIMESTAMPTZ | Expiration de l'alerte |

**Indexes** : `idx_alerts_proprietaire_read`, `idx_alerts_proprietaire_created`, `idx_alerts_type`, `idx_alerts_severity`

---

### 7️⃣ **GARANTIES**

#### `garanties`
Suivi des dépôts de garantie et remboursements.

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `contrat_id` | UUID FK UNIQUE | (contrats) |
| `proprietaire_id` | UUID FK | (auth.users) |
| `amount` | DECIMAL(10,2) | Montant du dépôt |
| `status` | TEXT | 'held', 'partial_return', 'returned' |
| `held_at` | TIMESTAMPTZ | Date de dépôt |
| `return_initiated_at` | TIMESTAMPTZ | Date de demande retour |
| `returned_at` | TIMESTAMPTZ | Date de remboursement |
| `deductions` | JSONB | Déductions appliquées |
| `notes` | TEXT | Notes |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | |

**Indexes** : `idx_garanties_contrat`, `idx_garanties_proprietaire`, `idx_garanties_status`, `idx_garanties_created`

---

### 8️⃣ **AUTRES TABLES**

#### `demandes_contact`
Formulaire de contact public.

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | UUID PK | |
| `nom` | TEXT | Nom du demandeur |
| `email` | TEXT | Email |
| `telephone` | TEXT | Téléphone |
| `profil` | ENUM | 'proprietaire', 'gestionnaire', 'agence', 'autre' |
| `message` | TEXT | Message |
| `created_at` | TIMESTAMPTZ | |
| `traite` | BOOLEAN | Marqué comme traité |

**Indexes** : `idx_demandes_contact_email`, `idx_demandes_contact_created_at`, `idx_demandes_contact_traite`

---

## 🔐 Row Level Security (RLS)

Toutes les tables sensibles ont RLS activé :

| Table | Policy |
|-------|--------|
| `immeubles` | Voir/modifier ses propres immeubles |
| `logements` | Voir/modifier les logements de ses immeubles |
| `locataires` | Voir/modifier ses propres locataires |
| `contrats` | Voir/modifier les contrats de ses logements |
| `paiements` | Voir/modifier les paiements de ses contrats |
| `alerts` | Voir/modifier ses propres alertes |
| `garanties` | Voir/modifier ses propres garanties |
| `organisations` | Voir/modifier ses organisations + membres |
| `proprietaires_geres` | Voir/modifier les propriétaires de son organisation |

---

## 📦 Stockage (Storage Buckets)

#### `logements_photos`
Photos des logements.

#### `logos`
Logos des organisations (branding).

---

## 🔗 Relations principales

```
auth.users
├── organisations (owner_user_id)
│   ├── membres_organisation (user_id)
│   ├── proprietaires_geres
│   └── immeubles (organisation_id)
└── immeubles (proprietaire_id)
    └── logements
        ├── contrats
        │   ├── paiements
        │   └── garanties
        └── locataires
```

---

## 🚀 Requêtes PostgREST courants

### 1. Lister tous les immeubles d'un propriétaire
```bash
curl "https://nmzpskxclwcqnkmkpqkh.supabase.co/rest/v1/immeubles?select=*" \
  -H "apikey: YOUR_ANON_KEY"
```

### 2. Lister les contrats actifs
```bash
curl "https://nmzpskxclwcqnkmkpqkh.supabase.co/rest/v1/contrats?statut=eq.actif" \
  -H "apikey: YOUR_ANON_KEY"
```

### 3. Insérer un nouvel immeuble
```bash
curl -X POST "https://nmzpskxclwcqnkmkpqkh.supabase.co/rest/v1/immeubles" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Immeuble Centre",
    "adresse": "123 Rue de Paris",
    "ville": "Abomey-Calavi",
    "type": "apartment_block"
  }'
```

### 4. Mettre à jour un logement
```bash
curl -X PATCH "https://nmzpskxclwcqnkmkpqkh.supabase.co/rest/v1/logements?id=eq.UUID" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"statut": "occupe"}'
```

---

## 📝 Notes importantes

1. **RLS activé** : Seules les données de l'utilisateur connecté sont accessibles
2. **Timestamps** : Toutes les dates utilisent UTC (TIMESTAMPTZ)
3. **UUIDs** : Tous les IDs primaires sont des UUIDs
4. **Indexes** : Performance optimisée pour filtres courants
5. **Multi-tenant** : Support complet des organisations et gestionnaires

