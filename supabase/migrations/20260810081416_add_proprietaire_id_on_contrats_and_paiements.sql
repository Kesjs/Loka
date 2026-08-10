-- Migration: add_proprietaire_id_on_contrats_and_paiements
-- Appliquée en production le 2026-08-10 (manquait dans le repo local)
-- Ajoute proprietaire_id sur contrats et paiements (sync automatique via triggers)

ALTER TABLE contrats
  ADD COLUMN IF NOT EXISTS proprietaire_id UUID REFERENCES proprietaire(id) ON DELETE CASCADE;

ALTER TABLE paiements
  ADD COLUMN IF NOT EXISTS proprietaire_id UUID REFERENCES proprietaire(id) ON DELETE CASCADE;

-- Créer les triggers de synchronisation automatique
-- Le proprietaire_id est rempli automatiquement par des triggers BEFORE INSERT/UPDATE

-- Trigger pour contrats
CREATE OR REPLACE FUNCTION trg_sync_contrat_proprietaire_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Retrouver le proprietaire_id via immeuble -> logement
  SELECT i.proprietaire_id INTO NEW.proprietaire_id
  FROM logements l
  JOIN immeubles i ON l.immeuble_id = i.id
  WHERE l.id = NEW.logement_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_contrat_proprietaire_id ON contrats;
CREATE TRIGGER trg_sync_contrat_proprietaire_id
BEFORE INSERT OR UPDATE ON contrats
FOR EACH ROW
EXECUTE FUNCTION trg_sync_contrat_proprietaire_id();

-- Trigger pour paiements
CREATE OR REPLACE FUNCTION trg_sync_paiement_proprietaire_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Retrouver le proprietaire_id via immeuble -> logement
  SELECT i.proprietaire_id INTO NEW.proprietaire_id
  FROM logements l
  JOIN immeubles i ON l.immeuble_id = i.id
  WHERE l.id = NEW.logement_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_paiement_proprietaire_id ON paiements;
CREATE TRIGGER trg_sync_paiement_proprietaire_id
BEFORE INSERT OR UPDATE ON paiements
FOR EACH ROW
EXECUTE FUNCTION trg_sync_paiement_proprietaire_id();
