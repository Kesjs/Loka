-- Migration: add_proprietaire_user_id_alias_on_proprietaires_geres
-- Appliquée en production le 2026-08-10 (manquait dans le repo local)
-- Ajoute une colonne proprietaire_user_id en parallèle de user_id sur proprietaires_geres

ALTER TABLE proprietaires_geres
  ADD COLUMN IF NOT EXISTS proprietaire_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Note: Les deux colonnes user_id et proprietaire_user_id existent en parallèle
-- mais aucune n'est écrite par le RPC — les deux restent NULL après onboarding
-- Convention à trancher: garder user_id (colonne utilisée par organisation-scope.ts)
