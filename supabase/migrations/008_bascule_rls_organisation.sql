-- Migration 008: Bascule RLS vers organisation_id
-- Statut: ✅ DÉJÀ APPLIQUÉE EN PRODUCTION (08/08/2026)
-- Cette migration remplace les policies basées sur proprietaire_id par organisation_id
-- avec repli explicite sur proprietaire_id pour la transition

-- 1. Ajouter organisation_id sur locataires + backfill
ALTER TABLE locataires
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE;

-- Backfill: associer chaque locataire à l'organisation de son propriétaire
UPDATE locataires
SET organisation_id = (
  SELECT org.id
  FROM organisations org
  WHERE org.owner_user_id = locataires.proprietaire_id
)
WHERE organisation_id IS NULL;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_locataires_organisation ON locataires(organisation_id);

-- 2. Remplacer les policies immeubles
DROP POLICY IF EXISTS "immeubles_owner" ON immeubles;

CREATE POLICY "immeubles_org_select"
  ON immeubles FOR SELECT
  USING (
    is_org_member(organisation_id)
    OR proprietaire_id = auth.uid()  -- Repli pour transition
  );

CREATE POLICY "immeubles_org_insert"
  ON immeubles FOR INSERT
  WITH CHECK (
    is_org_member(organisation_id)
    OR proprietaire_id = auth.uid()
  );

CREATE POLICY "immeubles_org_update"
  ON immeubles FOR UPDATE
  USING (
    is_org_member(organisation_id)
    OR proprietaire_id = auth.uid()
  );

CREATE POLICY "immeubles_org_delete"
  ON immeubles FOR DELETE
  USING (
    is_org_member(organisation_id)
    OR proprietaire_id = auth.uid()
  );

-- 3. Remplacer les policies logements
DROP POLICY IF EXISTS "logements_owner" ON logements;

CREATE POLICY "logements_org_select"
  ON logements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM immeubles
      WHERE immeubles.id = logements.immeuble_id
      AND (is_org_member(immeubles.organisation_id) OR immeubles.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "logements_org_insert"
  ON logements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM immeubles
      WHERE immeubles.id = logements.immeuble_id
      AND (is_org_member(immeubles.organisation_id) OR immeubles.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "logements_org_update"
  ON logements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM immeubles
      WHERE immeubles.id = logements.immeuble_id
      AND (is_org_member(immeubles.organisation_id) OR immeubles.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "logements_org_delete"
  ON logements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM immeubles
      WHERE immeubles.id = logements.immeuble_id
      AND (is_org_member(immeubles.organisation_id) OR immeubles.proprietaire_id = auth.uid())
    )
  );

-- 4. Remplacer les policies locataires
DROP POLICY IF EXISTS "locataires_owner" ON locataires;

CREATE POLICY "locataires_org_select"
  ON locataires FOR SELECT
  USING (
    is_org_member(organisation_id)
    OR proprietaire_id = auth.uid()
  );

CREATE POLICY "locataires_org_insert"
  ON locataires FOR INSERT
  WITH CHECK (
    is_org_member(organisation_id)
    OR proprietaire_id = auth.uid()
  );

CREATE POLICY "locataires_org_update"
  ON locataires FOR UPDATE
  USING (
    is_org_member(organisation_id)
    OR proprietaire_id = auth.uid()
  );

CREATE POLICY "locataires_org_delete"
  ON locataires FOR DELETE
  USING (
    is_org_member(organisation_id)
    OR proprietaire_id = auth.uid()
  );

-- 5. Remplacer les policies contrats
DROP POLICY IF EXISTS "contrats_owner" ON contrats;

CREATE POLICY "contrats_org_select"
  ON contrats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM locataires
      WHERE locataires.id = contrats.locataire_id
      AND (is_org_member(locataires.organisation_id) OR locataires.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "contrats_org_insert"
  ON contrats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM locataires
      WHERE locataires.id = contrats.locataire_id
      AND (is_org_member(locataires.organisation_id) OR locataires.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "contrats_org_update"
  ON contrats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM locataires
      WHERE locataires.id = contrats.locataire_id
      AND (is_org_member(locataires.organisation_id) OR locataires.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "contrats_org_delete"
  ON contrats FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM locataires
      WHERE locataires.id = contrats.locataire_id
      AND (is_org_member(locataires.organisation_id) OR locataires.proprietaire_id = auth.uid())
    )
  );

-- 6. Remplacer les policies paiements
DROP POLICY IF EXISTS "paiements_owner" ON paiements;

CREATE POLICY "paiements_org_select"
  ON paiements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contrats
      JOIN locataires ON locataires.id = contrats.locataire_id
      WHERE contrats.id = paiements.contrat_id
      AND (is_org_member(locataires.organisation_id) OR locataires.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "paiements_org_insert"
  ON paiements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contrats
      JOIN locataires ON locataires.id = contrats.locataire_id
      WHERE contrats.id = paiements.contrat_id
      AND (is_org_member(locataires.organisation_id) OR locataires.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "paiements_org_update"
  ON paiements FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM contrats
      JOIN locataires ON locataires.id = contrats.locataire_id
      WHERE contrats.id = paiements.contrat_id
      AND (is_org_member(locataires.organisation_id) OR locataires.proprietaire_id = auth.uid())
    )
  );

CREATE POLICY "paiements_org_delete"
  ON paiements FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM contrats
      JOIN locataires ON locataires.id = contrats.locataire_id
      WHERE contrats.id = paiements.contrat_id
      AND (is_org_member(locataires.organisation_id) OR locataires.proprietaire_id = auth.uid())
    )
  );

-- NOTE: Le repli "OR proprietaire_id = auth.uid()" sera retiré dans la migration 009
-- une fois que 100% des lignes ont un organisation_id non null et que le code applicatif
-- écrit systématiquement organisation_id sur toutes les nouvelles insertions.
