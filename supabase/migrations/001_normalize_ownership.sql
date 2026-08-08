-- Migration 001: Normalize Ownership
-- Add proprietaire_id to logements and contrats tables for RLS enforcement

-- Add proprietaire_id to logements
ALTER TABLE logements 
ADD COLUMN proprietaire_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add proprietaire_id to contrats
ALTER TABLE contrats 
ADD COLUMN proprietaire_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Populate proprietaire_id for existing logements (from parent immeuble)
UPDATE logements 
SET proprietaire_id = (
  SELECT proprietaire_id FROM immeubles 
  WHERE immeubles.id = logements.immeuble_id
)
WHERE proprietaire_id IS NULL;

-- Populate proprietaire_id for existing contrats (from parent logement)
UPDATE contrats 
SET proprietaire_id = (
  SELECT proprietaire_id FROM logements 
  WHERE logements.id = contrats.logement_id
)
WHERE proprietaire_id IS NULL;

-- Create indexes for performance
CREATE INDEX idx_logements_proprietaire ON logements(proprietaire_id);
CREATE INDEX idx_logements_immeuble_statut ON logements(immeuble_id, statut);
CREATE INDEX idx_contrats_proprietaire ON contrats(proprietaire_id);
CREATE INDEX idx_contrats_locataire_statut ON contrats(locataire_id, statut);

-- Add NOT NULL constraint after data is populated
ALTER TABLE logements 
ALTER COLUMN proprietaire_id SET NOT NULL;

ALTER TABLE contrats 
ALTER COLUMN proprietaire_id SET NOT NULL;
