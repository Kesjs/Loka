-- Migration 011: Création de la table demandes_contact
-- Statut: À appliquer immédiatement (C.4 formulaire contact)
-- Gère les demandes de contact du formulaire public

CREATE TABLE IF NOT EXISTS demandes_contact (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  profil TEXT CHECK (profil IN ('proprietaire', 'gestionnaire', 'agence', 'autre')),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  traite BOOLEAN DEFAULT false
);

-- Index pour recherche et tri
CREATE INDEX IF NOT EXISTS idx_demandes_contact_email ON demandes_contact(email);
CREATE INDEX IF NOT EXISTS idx_demandes_contact_created_at ON demandes_contact(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_demandes_contact_traite ON demandes_contact(traite);

-- Enable RLS
ALTER TABLE demandes_contact ENABLE ROW LEVEL SECURITY;

-- Policy: Autoriser tout le monde à insérer (formulaire public)
CREATE POLICY "demandes_contact_insert_public"
  ON demandes_contact FOR INSERT
  WITH CHECK (true);

-- Policy: Seul les admins peuvent lire (ci-dessous on la commente car pas d'auth_user pour les admins ici)
-- En production, il faudrait ajouter un système d'admin pour lire les demandes
-- Pour l'instant, les demandes sont lues via une query non authentifiée ou via un dashboard admin futur
