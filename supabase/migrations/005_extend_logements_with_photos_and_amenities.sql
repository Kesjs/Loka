-- Migration 005: Extend Logements Table with Photos, Amenities, and Characteristics
-- Add: chambres, salles_bain, surface_m2, amenities, photo_principale, photos_additionnelles, description

-- Add new columns to logements table
ALTER TABLE logements
ADD COLUMN IF NOT EXISTS chambres INTEGER DEFAULT 1 CHECK (chambres > 0),
ADD COLUMN IF NOT EXISTS salles_bain INTEGER DEFAULT 1 CHECK (salles_bain > 0),
ADD COLUMN IF NOT EXISTS surface_m2 DECIMAL(8,2) CHECK (surface_m2 > 0),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS photo_principale TEXT,
ADD COLUMN IF NOT EXISTS photos_additionnelles TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for efficient filtering by amenities (using GIN index for JSONB)
CREATE INDEX IF NOT EXISTS idx_logements_amenities ON logements USING gin(amenities);

-- Create index for filtering by characteristics
CREATE INDEX IF NOT EXISTS idx_logements_chambres ON logements(chambres);
CREATE INDEX IF NOT EXISTS idx_logements_surface ON logements(surface_m2);

-- Create index for owner + surface (common query pattern)
CREATE INDEX IF NOT EXISTS idx_logements_proprietaire_surface ON logements(proprietaire_id, surface_m2);

-- Comment for documentation
COMMENT ON COLUMN logements.chambres IS 'Number of bedrooms in the unit';
COMMENT ON COLUMN logements.salles_bain IS 'Number of bathrooms in the unit';
COMMENT ON COLUMN logements.surface_m2 IS 'Total surface area in square meters';
COMMENT ON COLUMN logements.description IS 'Detailed description of the unit';
COMMENT ON COLUMN logements.amenities IS 'JSON array of amenities: parking, balcon, cuisine_equipee, clim, chauffage, jardin, etc.';
COMMENT ON COLUMN logements.photo_principale IS 'URL to primary/cover photo stored in Supabase Storage (logement-photos bucket)';
COMMENT ON COLUMN logements.photos_additionnelles IS 'Array of URLs to additional photos stored in Supabase Storage';

-- Trigger: Update updated_at when logements are modified
CREATE OR REPLACE FUNCTION update_logements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_logements_updated_at_trigger ON logements;
CREATE TRIGGER update_logements_updated_at_trigger BEFORE UPDATE ON logements
  FOR EACH ROW EXECUTE FUNCTION update_logements_updated_at();

-- Add RLS policy for photo/amenities updates (already has general RLS, but be explicit)
-- Ensure existing RLS policies still apply
ALTER TABLE logements ENABLE ROW LEVEL SECURITY;

-- Verify policies exist (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'logements' AND policyname = 'Users can view their own logements'
  ) THEN
    CREATE POLICY "Users can view their own logements"
      ON logements FOR SELECT
      USING (proprietaire_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'logements' AND policyname = 'Users can update their own logements'
  ) THEN
    CREATE POLICY "Users can update their own logements"
      ON logements FOR UPDATE
      USING (proprietaire_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'logements' AND policyname = 'Users can insert logements'
  ) THEN
    CREATE POLICY "Users can insert logements"
      ON logements FOR INSERT
      WITH CHECK (proprietaire_id = auth.uid());
  END IF;
END $$;
