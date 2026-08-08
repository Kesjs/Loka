-- Migration 003: Enhance Paiements Table
-- Add tracking and reconciliation fields

-- Add new columns to paiements
ALTER TABLE paiements 
ADD COLUMN IF NOT EXISTS reconciliation_status TEXT DEFAULT 'pending' CHECK (reconciliation_status IN ('pending', 'reconciled', 'disputed')),
ADD COLUMN IF NOT EXISTS reconciled_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS reconciled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS proprietaire_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Populate proprietaire_id from contract
UPDATE paiements 
SET proprietaire_id = (
  SELECT proprietaire_id FROM contrats 
  WHERE contrats.id = paiements.contrat_id
)
WHERE proprietaire_id IS NULL;

-- Make proprietaire_id NOT NULL after population
ALTER TABLE paiements 
ALTER COLUMN proprietaire_id SET NOT NULL;

-- Add unique constraint to prevent duplicate payments for same contract/month
ALTER TABLE paiements 
ADD CONSTRAINT unique_payment_per_month 
UNIQUE (contrat_id, date_trunc('month', periode_debut));

-- Create indexes for performance
CREATE INDEX idx_paiements_proprietaire ON paiements(proprietaire_id);
CREATE INDEX idx_paiements_contrat_date ON paiements(contrat_id, date_paiement DESC);
CREATE INDEX idx_paiements_periode ON paiements(proprietaire_id, periode_debut, periode_fin);
CREATE INDEX idx_paiements_reconciliation ON paiements(reconciliation_status);

-- Create RLS policy if not exists
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own payments"
  ON paiements FOR SELECT
  USING (proprietaire_id = auth.uid());
