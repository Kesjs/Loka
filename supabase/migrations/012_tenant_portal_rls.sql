-- =============================================================================
-- Migration : Accès locataire au Portail (lecture + paiement scoping)
-- Description : Policies RLS permettant à un locataire connecté (identifié
--               via locataires.auth_user_id = auth.uid()) de lire uniquement
--               sa propre fiche, son contrat, son logement/immeuble et ses
--               paiements — et d'enregistrer lui-même un paiement pour son
--               propre contrat.
--
--               Ces policies s'AJOUTENT aux policies existantes (propriétaire
--               / organisation) sans les modifier ni les remplacer : Postgres
--               combine les policies permissives d'une même commande avec un
--               OR, donc l'accès propriétaire actuel n'est en rien réduit.
-- =============================================================================

-- Locataires : un locataire ne voit que sa propre fiche
CREATE POLICY "locataires_tenant_self_select"
  ON locataires FOR SELECT
  USING (auth_user_id = auth.uid());

-- Contrats : un locataire ne voit que son propre contrat
CREATE POLICY "contrats_tenant_self_select"
  ON contrats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM locataires
      WHERE locataires.id = contrats.locataire_id
        AND locataires.auth_user_id = auth.uid()
    )
  );

-- Logements : un locataire ne voit que le logement lié à son contrat
CREATE POLICY "logements_tenant_self_select"
  ON logements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contrats
      JOIN locataires ON locataires.id = contrats.locataire_id
      WHERE contrats.logement_id = logements.id
        AND locataires.auth_user_id = auth.uid()
    )
  );

-- Immeubles : un locataire ne voit que l'immeuble de son logement
CREATE POLICY "immeubles_tenant_self_select"
  ON immeubles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM logements
      JOIN contrats ON contrats.logement_id = logements.id
      JOIN locataires ON locataires.id = contrats.locataire_id
      WHERE logements.immeuble_id = immeubles.id
        AND locataires.auth_user_id = auth.uid()
    )
  );

-- Paiements : un locataire ne voit que les paiements de son propre contrat
CREATE POLICY "paiements_tenant_self_select"
  ON paiements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM contrats
      JOIN locataires ON locataires.id = contrats.locataire_id
      WHERE contrats.id = paiements.contrat_id
        AND locataires.auth_user_id = auth.uid()
    )
  );

-- Paiements : un locataire peut enregistrer un règlement pour son propre
-- contrat uniquement (ex. paiement Mobile Money initié depuis son portail)
CREATE POLICY "paiements_tenant_self_insert"
  ON paiements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM contrats
      JOIN locataires ON locataires.id = contrats.locataire_id
      WHERE contrats.id = paiements.contrat_id
        AND locataires.auth_user_id = auth.uid()
    )
  );
