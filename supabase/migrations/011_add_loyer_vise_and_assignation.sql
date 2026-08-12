-- Migration 011: Loyer visé (calcul écart revenu réel/potentiel) + assignation logement/membre
-- Statut: À appliquer
-- Additive uniquement — aucune colonne existante modifiée ou supprimée.

-- 1. Loyer visé pour un logement vacant : sert à calculer l'écart entre revenu
--    réel (loyers encaissés) et revenu potentiel (si tout était loué).
--    Nullable : tant que non renseigné, on retombe sur loyer_mensuel comme estimation.
ALTER TABLE IF EXISTS public.logements
  ADD COLUMN IF NOT EXISTS loyer_vise DECIMAL(10, 2);

-- 2. Assignation d'un logement à un membre d'équipe (Agence) — pour l'aperçu
--    "qui gère quoi, combien de logements assignés par membre".
ALTER TABLE IF EXISTS public.logements
  ADD COLUMN IF NOT EXISTS assigne_a UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_logements_assigne_a ON public.logements(assigne_a);

-- 3. Signal "gestion à distance" (diaspora) — ajuste l'affichage (rapports mis
--    en avant, notifications prioritaires SMS/email), ce n'est pas un rôle.
ALTER TABLE IF EXISTS public.proprietaire
  ADD COLUMN IF NOT EXISTS est_a_distance BOOLEAN DEFAULT FALSE;
