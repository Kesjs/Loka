-- Migration 007b: Correction de la fonction is_org_member (search_path)
-- Statut: ✅ DÉJÀ APPLIQUÉE EN PRODUCTION (vérifié 08/08/2026)
-- Cette migration corrige un problème de search_path dans la fonction is_org_member

-- Recréer la fonction avec un search_path explicite
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si l'utilisateur est owner de l'organisation
  IF EXISTS (
    SELECT 1 FROM public.organisations
    WHERE id = org_id AND owner_user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  -- Vérifier si l'utilisateur est membre de l'organisation
  IF EXISTS (
    SELECT 1 FROM public.membres_organisation
    WHERE organisation_id = org_id AND user_id = auth.uid()
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;
