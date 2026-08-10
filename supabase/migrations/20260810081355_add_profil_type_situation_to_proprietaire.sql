-- Migration: add_profil_type_situation_to_proprietaire
-- Appliquée en production le 2026-08-10 (manquait dans le repo local)
-- Ajoute les colonnes profil_type et situation à la table proprietaire

ALTER TABLE proprietaire
  ADD COLUMN IF NOT EXISTS profil_type TEXT,
  ADD COLUMN IF NOT EXISTS situation TEXT;

-- Note: Ces colonnes ne sont jamais écrites par le RPC complete_onboarding
-- Le vrai source de vérité pour le rôle est organisations.type (ENUM)
-- Ces colonnes restent orphelines mais doivent exister pour la compatibilité
