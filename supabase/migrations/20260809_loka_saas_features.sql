-- =============================================================================
-- Migration SQL : Loka SaaS Features
-- Description : Ajout des champs de Branding (Logo, En-tête, Tampon),
--               des champs pour le Portail Locataire (Token activation)
--               et des champs de suivi des transactions GeniusPay.
-- =============================================================================

-- 1. Extension de la table organisations (Branding & Marque Blanche)
ALTER TABLE IF EXISTS public.organisations 
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS nom_commercial TEXT,
  ADD COLUMN IF NOT EXISTS adresse_officielle TEXT,
  ADD COLUMN IF NOT EXISTS telephone_service TEXT,
  ADD COLUMN IF NOT EXISTS ifu_rccm TEXT,
  ADD COLUMN IF NOT EXISTS tampon_signature_url TEXT;

-- 2. Extension de la table locataires (Portail Locataire & Brevo)
ALTER TABLE IF EXISTS public.locataires 
  ADD COLUMN IF NOT EXISTS portal_active BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS activation_token TEXT,
  ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. Extension de la table paiements (Transactions GeniusPay)
ALTER TABLE IF EXISTS public.paiements 
  ADD COLUMN IF NOT EXISTS transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- 4. RLS & Index de performance
CREATE INDEX IF NOT EXISTS idx_locataires_activation_token ON public.locataires(activation_token);
CREATE INDEX IF NOT EXISTS idx_paiements_transaction_id ON public.paiements(transaction_id);
