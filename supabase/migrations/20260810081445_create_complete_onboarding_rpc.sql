-- Migration: create_complete_onboarding_rpc
-- Appliquée en production le 2026-08-10 (manquait dans le repo local)
-- Crée ou met à jour le RPC complete_onboarding qui orchestr l'onboarding

-- Le RPC complete_onboarding est la fonction qui crée toute la structure initiale
-- Voir lib/onboarding pour les paramètres d'appel détaillés
-- Cette migration suppose que le RPC a déjà été créé ailleurs
-- (probablement dans une migration antérieure numérotée autrement)
-- Cette entrée dans l'historique de migrations est ici pour synchronisation documentaire

-- Note: Le RPC réel ne doit pas être recréé entièrement à chaque fois
-- car il contient une logique complexe. Si tu dois le modifier, le faire via
-- une autre migration dédiée avec la fonction complète.

-- Pour vérifier la définition actuelle du RPC en base:
-- SELECT pg_get_functiondef(to_regprocedure('complete_onboarding'));
