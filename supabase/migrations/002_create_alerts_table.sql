-- Migration 002: Create Alerts Table
-- Centralized alert system for notifications

CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proprietaire_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('missing_payment', 'expiring_contract', 'deposit_to_return')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  entity_type TEXT,
  entity_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP,
  CONSTRAINT alert_content_check CHECK (message ~ '^\S')
);

-- Create indexes for performance
CREATE INDEX idx_alerts_proprietaire_read ON alerts(proprietaire_id, is_read);
CREATE INDEX idx_alerts_proprietaire_created ON alerts(proprietaire_id, created_at DESC);
CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);

-- Create RLS policies
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alerts"
  ON alerts FOR SELECT
  USING (proprietaire_id = auth.uid());

CREATE POLICY "Users can update their own alerts"
  ON alerts FOR UPDATE
  USING (proprietaire_id = auth.uid());

CREATE POLICY "System can insert alerts"
  ON alerts FOR INSERT
  WITH CHECK (proprietaire_id = auth.uid());
