-- Migration: Ajouter table onboarding_drafts pour sauvegarder les brouillons
-- Cette table stocke les brouillons en cours d'onboarding pour la récupération après rechargement

CREATE TABLE IF NOT EXISTS onboarding_drafts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  step INTEGER NOT NULL DEFAULT 0,
  data JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour récupération rapide
CREATE INDEX IF NOT EXISTS idx_onboarding_drafts_user_id ON onboarding_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_drafts_updated_at ON onboarding_drafts(updated_at);

-- RLS Policy: Chaque utilisateur ne peut voir/modifier que son propre brouillon
ALTER TABLE onboarding_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateurs ne voient que leurs propres brouillons"
  ON onboarding_drafts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs ne peuvent modifier que leurs propres brouillons"
  ON onboarding_drafts
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent insérer leurs propres brouillons"
  ON onboarding_drafts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateurs peuvent supprimer leurs propres brouillons"
  ON onboarding_drafts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optionnel : Nettoyer les brouillons après 7 jours
-- (À configurer avec une cron job Supabase ou similar)
