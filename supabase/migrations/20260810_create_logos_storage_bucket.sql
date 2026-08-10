-- Migration: Créer bucket Storage 'logos' pour les logos organisations
-- Date: 2026-08-10
-- Statut: À appliquer immédiatement (C.6 chantier logo)
-- Gère le stockage des logos propriétaires/gestionnaires/agences

-- 1. Créer le bucket 'logos' (s'il n'existe pas)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'logos',
  'logos',
  true, -- public: les logos doivent être accessibles publiquement
  true, -- avif autodetection
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS sur le bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Lecture publique (tout le monde peut voir les logos)
CREATE POLICY "logos_read_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'logos');

-- 4. Policy: Upload/Update par propriétaire du logo (authentifiés)
CREATE POLICY "logos_write_authenticated"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- 5. Policy: Update du propre logo
CREATE POLICY "logos_update_own"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- 6. Policy: Delete du propre logo
CREATE POLICY "logos_delete_own"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'logos' AND auth.role() = 'authenticated');

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id 
  ON storage.objects(bucket_id);
