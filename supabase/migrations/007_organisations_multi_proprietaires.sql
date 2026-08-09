-- Migration 007: Ajout des tables organisations et support multi-propriétaires
-- Statut: ✅ DÉJÀ APPLIQUÉE EN PRODUCTION (vérifié 08/08/2026)
-- Cette migration permet le support de gestionnaires et agences gérant plusieurs propriétaires

-- Table des organisations (toutes les entités de gestion)
CREATE TABLE IF NOT EXISTS organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('individuel', 'gestionnaire', 'agence')),
  ville TEXT,
  taille_portefeuille TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour rechercher l'organisation d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_organisations_owner ON organisations(owner_user_id);

-- Table des membres d'organisation (pour les agences avec plusieurs utilisateurs)
CREATE TABLE IF NOT EXISTS membres_organisation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_interne TEXT NOT NULL CHECK (role_interne IN ('admin', 'gestionnaire', 'mandataire')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, user_id)
);

-- Index pour rechercher les organisations d'un utilisateur
CREATE INDEX IF NOT EXISTS idx_membres_organisation_user ON membres_organisation(user_id);
CREATE INDEX IF NOT EXISTS idx_membres_organisation_org ON membres_organisation(organisation_id);

-- Table des propriétaires gérés (clients d'un gestionnaire ou d'une agence)
CREATE TABLE IF NOT EXISTS proprietaires_geres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nom TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour rechercher les propriétaires d'une organisation
CREATE INDEX IF NOT EXISTS idx_proprietaires_geres_org ON proprietaires_geres(organisation_id);
CREATE INDEX IF NOT EXISTS idx_proprietaires_geres_user ON proprietaires_geres(user_id);

-- Ajouter les colonnes organisation_id et proprietaire_gere_id aux immeubles
ALTER TABLE immeubles
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS proprietaire_gere_id UUID REFERENCES proprietaires_geres(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quartier TEXT,
  ADD COLUMN IF NOT EXISTS repere TEXT;

-- Index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_immeubles_organisation ON immeubles(organisation_id);
CREATE INDEX IF NOT EXISTS idx_immeubles_proprietaire_gere ON immeubles(proprietaire_gere_id);

-- Fonction utilitaire pour vérifier l'appartenance à une organisation
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si l'utilisateur est owner de l'organisation
  IF EXISTS (
    SELECT 1 FROM organisations
    WHERE id = org_id AND owner_user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  -- Vérifier si l'utilisateur est membre de l'organisation
  IF EXISTS (
    SELECT 1 FROM membres_organisation
    WHERE organisation_id = org_id AND user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Enable RLS sur les nouvelles tables
ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE membres_organisation ENABLE ROW LEVEL SECURITY;
ALTER TABLE proprietaires_geres ENABLE ROW LEVEL SECURITY;

-- Policies pour organisations
CREATE POLICY "organisations_select_owner"
  ON organisations FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "organisations_select_member"
  ON organisations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "organisations_insert_owner"
  ON organisations FOR INSERT
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "organisations_update_owner"
  ON organisations FOR UPDATE
  USING (owner_user_id = auth.uid());

-- Policies pour membres_organisation
CREATE POLICY "membres_select"
  ON membres_organisation FOR SELECT
  USING (is_org_member(organisation_id));

CREATE POLICY "membres_insert_admin"
  ON membres_organisation FOR INSERT
  WITH CHECK (is_org_member(organisation_id));

CREATE POLICY "membres_update_admin"
  ON membres_organisation FOR UPDATE
  USING (is_org_member(organisation_id));

CREATE POLICY "membres_delete_admin"
  ON membres_organisation FOR DELETE
  USING (is_org_member(organisation_id));

-- Policies pour proprietaires_geres
CREATE POLICY "proprietaires_geres_select"
  ON proprietaires_geres FOR SELECT
  USING (is_org_member(organisation_id));

CREATE POLICY "proprietaires_geres_insert"
  ON proprietaires_geres FOR INSERT
  WITH CHECK (is_org_member(organisation_id));

CREATE POLICY "proprietaires_geres_update"
  ON proprietaires_geres FOR UPDATE
  USING (is_org_member(organisation_id));

CREATE POLICY "proprietaires_geres_delete"
  ON proprietaires_geres FOR DELETE
  USING (is_org_member(organisation_id));
