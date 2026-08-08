-- Migration 006: Create Logement Photos Storage Bucket
-- Setup Supabase Storage bucket for property photos with RLS policies

-- Note: Storage bucket creation via SQL requires admin context
-- This migration documents the bucket setup but storage bucket creation 
-- should be done via Supabase dashboard or supabase CLI: 
-- `supabase storage create-bucket logement-photos --public false`
--
-- Alternative: Use the Supabase client library in a setup script
-- However, we document the policies here for RLS enforcement

-- RLS Policy 1: Enable authenticated users to upload photos to their own logements
-- Path: proprietaire_id/logement_id/filename
-- Only the owner can upload to their path

-- RLS Policy 2: Enable authenticated users to view their own photos

-- RLS Policy 3: Prevent users from accessing other users' photos

-- Storage bucket metadata:
-- Bucket name: logement-photos
-- Public: false (private, RLS enforced)
-- File size limit: 10MB per file
-- Allowed types: image/jpeg, image/png, image/webp
-- Path structure: /proprietaire_id/logement_id/filename.ext

-- To apply these policies, run via Supabase Studio or CLI:
-- psql -U postgres -d postgres -c "SELECT storage.create_bucket('logement-photos', false);"
-- 
-- Then apply the RLS policies below via Supabase dashboard or custom RLS setup

-- Example setup in TypeScript (for reference - to be run separately):
/*
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Create bucket if not exists
await supabase.storage.createBucket('logement-photos', {
  public: false,
});

// Set bucket policies (via Supabase Studio UI):
// SELECT: allow if auth.uid()::text is in the path
// INSERT: allow if auth.uid()::text is in the path and file size < 10MB
// UPDATE: allow if auth.uid()::text is in the path
// DELETE: allow if auth.uid()::text is in the path
*/

-- Document for manual setup in Supabase Studio:
-- 
-- 1. Go to Supabase Dashboard → Storage
-- 2. Create new bucket: "logement-photos"
-- 3. Make bucket PRIVATE (not public)
-- 4. Add RLS policies:
--
-- Policy: "Users can upload photos to their own properties"
-- Type: INSERT
-- Target roles: authenticated
-- Custom expression: 
--   ((storage.foldername(name))[1])::uuid = auth.uid()
--
-- Policy: "Users can view their own property photos"
-- Type: SELECT  
-- Target roles: authenticated
-- Custom expression:
--   ((storage.foldername(name))[1])::uuid = auth.uid()
--
-- Policy: "Users can update/delete their own property photos"
-- Type: UPDATE, DELETE
-- Target roles: authenticated
-- Custom expression:
--   ((storage.foldername(name))[1])::uuid = auth.uid()

-- Bucket constraints (set in Supabase dashboard Storage settings):
-- Max file size: 10485760 bytes (10MB)
-- Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Naming convention for photos:
-- Path: proprietaire_id/logement_id/photo_uuid_timestamp.ext
-- Example: 550e8400-e29b-41d4-a716-446655440000/123e4567-e89b-12d3-a456-426614174000/photo_2024-08-08_1234567890.jpg
