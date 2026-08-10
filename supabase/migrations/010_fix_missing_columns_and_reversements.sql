-- Migration 010: Corrections B.D. critiques pour Loka v10
-- Statut: À appliquer immédiatement (bloque plusieurs chantiers)
-- Appliquée: 2026-08-10

-- 1. Ajouter colonne commission_pct manquante sur proprietaires_geres
-- Critique : lib/organisation-scope.ts sélectionne commission_pct explicitement
ALTER TABLE proprietaires_geres
  ADD COLUMN IF NOT EXISTS commission_pct NUMERIC(5, 2) NOT NULL DEFAULT 10.00;

-- 2. Créer l'ENUM role_interne_type si besoin (peut déjà exister)
-- Note: Si cette commande échoue avec "type already exists", c'est normal
DO $$
BEGIN
  -- Tentative d'ajouter les valeurs manquantes à l'ENUM s'il existe
  BEGIN
    ALTER TYPE role_interne_type ADD VALUE IF NOT EXISTS 'consultant';
  EXCEPTION WHEN undefined_object THEN
    -- L'ENUM n'existe pas encore, on ne fait rien ici
    -- Il a peut-être été créé dans une autre migration
    NULL;
  END;
END $$;

-- 3. Vérifier que la table reversements existe bien (si migration 009 n'a pas été appliquée)
-- On la recrée de manière idempotent au cas où
CREATE TABLE IF NOT EXISTS reversements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  proprietaire_gere_id UUID NOT NULL REFERENCES proprietaires_geres(id) ON DELETE CASCADE,
  mois DATE NOT NULL,
  montant_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  montant_verse NUMERIC(12, 2) NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'non_verse' CHECK (statut IN ('non_verse', 'partiel', 'verse')),
  date_versement DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, proprietaire_gere_id, mois)
);

-- Index pour recherche sur reversements
CREATE INDEX IF NOT EXISTS idx_reversements_organisation ON reversements(organisation_id);
CREATE INDEX IF NOT EXISTS idx_reversements_proprietaire ON reversements(proprietaire_gere_id);
CREATE INDEX IF NOT EXISTS idx_reversements_mois ON reversements(mois);
CREATE INDEX IF NOT EXISTS idx_reversements_statut ON reversements(statut);

-- Activer RLS sur reversements
ALTER TABLE reversements ENABLE ROW LEVEL SECURITY;

-- Policies pour reversements (accessible par les membres de l'organisation)
CREATE POLICY IF NOT EXISTS "reversements_select"
  ON reversements FOR SELECT
  USING (is_org_member(organisation_id));

CREATE POLICY IF NOT EXISTS "reversements_insert"
  ON reversements FOR INSERT
  WITH CHECK (is_org_member(organisation_id));

CREATE POLICY IF NOT EXISTS "reversements_update"
  ON reversements FOR UPDATE
  USING (is_org_member(organisation_id));

CREATE POLICY IF NOT EXISTS "reversements_delete"
  ON reversements FOR DELETE
  USING (is_org_member(organisation_id));

-- 4. Ajouter champs manquants sur organisations (déjà vérifiés en A.3 mais confirmé ici)
-- Ces champs doivent exister pour la Phase 7 (section gestionnaire/agence dans paramètres)
ALTER TABLE organisations
  ADD COLUMN IF NOT EXISTS nom_commercial TEXT,
  ADD COLUMN IF NOT EXISTS adresse_officielle TEXT,
  ADD COLUMN IF NOT EXISTS telephone_service TEXT,
  ADD COLUMN IF NOT EXISTS ifu_rccm TEXT,
  ADD COLUMN IF NOT EXISTS tampon_signature_url TEXT;

-- 5. Ajouter champs profil/situation sur proprietaire (ne sont pas lus mais confirmer existence)
ALTER TABLE proprietaire
  ADD COLUMN IF NOT EXISTS profil_type TEXT,
  ADD COLUMN IF NOT EXISTS situation TEXT;
