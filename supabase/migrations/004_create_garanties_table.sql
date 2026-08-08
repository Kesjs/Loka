-- Migration 004: Create Garanties (Guarantees) Table
-- Track tenant security deposits and refunds

CREATE TABLE garanties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrat_id UUID NOT NULL UNIQUE REFERENCES contrats(id) ON DELETE CASCADE,
  proprietaire_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'partial_return', 'returned')),
  held_at TIMESTAMP DEFAULT now(),
  return_initiated_at TIMESTAMP,
  returned_at TIMESTAMP,
  deductions JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  CONSTRAINT guarantee_dates CHECK (
    (return_initiated_at IS NULL OR return_initiated_at >= held_at) AND
    (returned_at IS NULL OR returned_at >= held_at)
  )
);

-- Create indexes for performance
CREATE INDEX idx_garanties_contrat ON garanties(contrat_id);
CREATE INDEX idx_garanties_proprietaire ON garanties(proprietaire_id);
CREATE INDEX idx_garanties_status ON garanties(status);
CREATE INDEX idx_garanties_created ON garanties(created_at DESC);

-- Create RLS policies
ALTER TABLE garanties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own guarantees"
  ON garanties FOR SELECT
  USING (proprietaire_id = auth.uid());

CREATE POLICY "Users can update their own guarantees"
  ON garanties FOR UPDATE
  USING (proprietaire_id = auth.uid());

CREATE POLICY "Users can insert guarantees"
  ON garanties FOR INSERT
  WITH CHECK (proprietaire_id = auth.uid());

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_garanties_updated_at BEFORE UPDATE ON garanties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
