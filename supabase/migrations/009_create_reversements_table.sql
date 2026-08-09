-- Migration 009: Création de la table reversements
-- Statut: À appliquer
-- Gère les commissions mensuelles versées aux propriétaires gérés

-- Table des reversements (commissions mensuelles)
CREATE TABLE IF NOT EXISTS reversements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES organisations(id) ON DELETE CASCADE,
  proprietaire_gere_id UUID NOT NULL REFERENCES proprietaires_geres(id) ON DELETE CASCADE,
  mois DATE NOT NULL, -- Premier jour du mois (ex: 2026-01-01)
  montant_commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  montant_verse NUMERIC(12, 2) NOT NULL DEFAULT 0,
  statut TEXT NOT NULL DEFAULT 'non_verse' CHECK (statut IN ('non_verse', 'partiel', 'verse')),
  date_versement DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, proprietaire_gere_id, mois)
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_reversements_organisation ON reversements(organisation_id);
CREATE INDEX IF NOT EXISTS idx_reversements_proprietaire ON reversements(proprietaire_gere_id);
CREATE INDEX IF NOT EXISTS idx_reversements_mois ON reversements(mois);
CREATE INDEX IF NOT EXISTS idx_reversements_statut ON reversements(statut);

-- Activer RLS
ALTER TABLE reversements ENABLE ROW LEVEL SECURITY;

-- Policies pour reversements (accessible par les membres de l'organisation)
CREATE POLICY "reversements_select"
  ON reversements FOR SELECT
  USING (is_org_member(organisation_id));

CREATE POLICY "reversements_insert"
  ON reversements FOR INSERT
  WITH CHECK (is_org_member(organisation_id));

CREATE POLICY "reversements_update"
  ON reversements FOR UPDATE
  USING (is_org_member(organisation_id));

CREATE POLICY "reversements_delete"
  ON reversements FOR DELETE
  USING (is_org_member(organisation_id));

-- Fonction pour calculer les reversements mensuels (appelée mensuellement)
-- Cette fonction calcule les commissions dues pour un propriétaire donné
CREATE OR REPLACE FUNCTION calculate_monthly_reversements(
  p_organisation_id UUID,
  p_propriettaire_gere_id UUID,
  p_mois DATE
)
RETURNS TABLE (
  montant_commission NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    SUM(
      ROUND(
        (SELECT COALESCE(SUM(l.loyer_mensuel), 0)
         FROM logements l
         JOIN immeubles i ON l.immeuble_id = i.id
         WHERE i.proprietaire_gere_id = p_proprietaire_gere_id
         AND l.statut = 'occupe')
        * (SELECT commission_pct FROM proprietaires_geres WHERE id = p_proprietaire_gere_id) / 100,
        2
      )
    )::NUMERIC
  FROM proprietaires_geres pg
  WHERE pg.id = p_propriettaire_gere_id
  AND pg.organisation_id = p_organisation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

